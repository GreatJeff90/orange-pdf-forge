import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema for conversion requests
const ConversionRequestSchema = z.object({
  conversionType: z.enum([
    'pdf_to_word',
    'pdf_to_excel', 
    'word_to_pdf',
    'excel_to_pdf',
    'compress_pdf',
    'merge_pdf',
    'split_pdf',
    'pdf_to_jpg',
    'jpg_to_pdf'
  ]),
  inputFilePath: z.string()
    .min(1, "File path cannot be empty")
    .max(500, "File path too long")
    .regex(/^[a-zA-Z0-9/_.-]+$/, "Invalid characters in file path"),
  cost: z.number()
    .int("Cost must be an integer")
    .min(0, "Cost cannot be negative")
    .max(1000, "Cost exceeds maximum allowed"),
  options: z.object({
    compressionLevel: z.number()
      .int()
      .min(1)
      .max(5)
      .optional(),
    splitOption: z.string()
      .max(50, "Split option too long")
      .optional(),
    pageRange: z.string()
      .max(50, "Page range too long")
      .regex(/^[\d,\s-]*$/, "Invalid page range format")
      .optional(),
  }).optional()
});

interface ConversionRequest {
  conversionType: string;
  inputFilePath: string;
  cost: number;
  options?: {
    compressionLevel?: number;
    splitOption?: string;
    pageRange?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    console.log("Authorization header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: userError.message }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (!user) {
      console.error("No user found in session");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No user found" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("User authenticated:", user.id);

    // Parse and validate input
    const rawInput = await req.json();
    const validationResult = ConversionRequestSchema.safeParse(rawInput);
    
    if (!validationResult.success) {
      console.error("Input validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input parameters",
          details: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { conversionType, inputFilePath, cost, options }: ConversionRequest = validationResult.data;
    
    // Additional security: Verify the file path belongs to the user's directory
    if (!inputFilePath.startsWith(`${user.id}/`)) {
      console.error("User attempting to access unauthorized file:", { user: user.id, path: inputFilePath });
      return new Response(
        JSON.stringify({ error: "Access denied: Invalid file path" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("Starting conversion:", { conversionType, inputFilePath, user: user.id });

    // Conversions are FREE - just verify user profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw new Error("Failed to fetch user profile");
    }
    
    console.log("Conversion is free - no coin check needed");

    // Create conversion record
    const { data: conversion, error: insertError } = await supabase
      .from("conversions")
      .insert({
        user_id: user.id,
        conversion_type: conversionType,
        input_file_path: inputFilePath,
        cost: cost,
        status: "processing",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating conversion record:", insertError);
      throw insertError;
    }

    console.log("Conversion record created:", conversion.id);
    
    // Conversions are FREE - no coin deduction needed
    console.log("Starting free conversion for user:", user.id);

    // Get the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("conversions")
      .download(inputFilePath);

    if (downloadError) {
      console.error("Error downloading file:", downloadError);
      await supabase
        .from("conversions")
        .update({ status: "failed", error_message: "Failed to download input file" })
        .eq("id", conversion.id);
      throw downloadError;
    }

    // Convert file to base64 for CloudConvert API
    const arrayBuffer = await fileData.arrayBuffer();
    const base64File = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Prepare CloudConvert job based on conversion type
    const cloudConvertApiKey = Deno.env.get("CLOUDCONVERT_API_KEY");
    if (!cloudConvertApiKey) {
      throw new Error("CloudConvert API key not configured");
    }

    // Create CloudConvert job
    const jobConfig = getJobConfig(conversionType, inputFilePath, options);
    
    const createJobResponse = await fetch("https://api.cloudconvert.com/v2/jobs", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cloudConvertApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobConfig),
    });

    if (!createJobResponse.ok) {
      const errorText = await createJobResponse.text();
      console.error("CloudConvert job creation failed:", errorText);
      throw new Error(`CloudConvert API error: ${errorText}`);
    }

    const jobData = await createJobResponse.json();
    console.log("CloudConvert job created:", jobData.data.id);

    // Upload file to CloudConvert
    const uploadTask = jobData.data.tasks.find((t: any) => t.operation === "import/base64");
    if (uploadTask) {
      const uploadResponse = await fetch(`https://api.cloudconvert.com/v2/tasks/${uploadTask.id}/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cloudConvertApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file: base64File }),
      });

      if (!uploadResponse.ok) {
        console.error("File upload failed:", await uploadResponse.text());
        throw new Error("Failed to upload file to CloudConvert");
      }
    }

    // Wait for job completion (with timeout)
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes maximum
    let jobStatus = jobData.data;

    while (attempts < maxAttempts && jobStatus.status !== "finished" && jobStatus.status !== "error") {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobData.data.id}`, {
        headers: { "Authorization": `Bearer ${cloudConvertApiKey}` },
      });
      
      const statusData = await statusResponse.json();
      jobStatus = statusData.data;
      attempts++;
      
      console.log(`Job status check ${attempts}:`, jobStatus.status);
    }

    if (jobStatus.status === "error") {
      const errorMsg = jobStatus.tasks?.find((t: any) => t.status === "error")?.message || "Conversion failed";
      await supabase
        .from("conversions")
        .update({ status: "failed", error_message: errorMsg })
        .eq("id", conversion.id);
      throw new Error(errorMsg);
    }

    if (jobStatus.status !== "finished") {
      await supabase
        .from("conversions")
        .update({ status: "failed", error_message: "Conversion timeout" })
        .eq("id", conversion.id);
      throw new Error("Conversion timeout");
    }

    // Download the converted file
    const exportTask = jobStatus.tasks.find((t: any) => t.operation === "export/url");
    if (!exportTask || !exportTask.result?.files?.[0]?.url) {
      throw new Error("No output file found");
    }

    const convertedFileUrl = exportTask.result.files[0].url;
    const convertedFileResponse = await fetch(convertedFileUrl);
    const convertedFileBlob = await convertedFileResponse.blob();

    // Upload to Supabase Storage
    const outputFileName = `${user.id}/converted/${Date.now()}-${exportTask.result.files[0].filename}`;
    const { error: uploadError } = await supabase.storage
      .from("conversions")
      .upload(outputFileName, convertedFileBlob, {
        contentType: convertedFileBlob.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading converted file:", uploadError);
      throw uploadError;
    }

    // Update conversion record
    await supabase
      .from("conversions")
      .update({
        status: "completed",
        output_file_path: outputFileName,
        completed_at: new Date().toISOString(),
      })
      .eq("id", conversion.id);

    console.log("Conversion completed successfully:", conversion.id);

    return new Response(
      JSON.stringify({
        success: true,
        conversionId: conversion.id,
        outputFilePath: outputFileName,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in convert-file function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

function getJobConfig(conversionType: string, inputFilePath: string, options?: any) {
  const fileName = inputFilePath.split("/").pop() || "file";
  const inputFormat = fileName.split(".").pop()?.toLowerCase() || "pdf";
  
  const tasks: any = {
    "import-file": {
      operation: "import/base64",
      filename: fileName,
    },
  };

  switch (conversionType) {
    case "pdf_to_word":
      tasks["convert"] = {
        operation: "convert",
        input: "import-file",
        output_format: "docx",
      };
      break;
    case "pdf_to_excel":
      tasks["convert"] = {
        operation: "convert",
        input: "import-file",
        output_format: "xlsx",
      };
      break;
    case "word_to_pdf":
      tasks["convert"] = {
        operation: "convert",
        input: "import-file",
        output_format: "pdf",
      };
      break;
    case "excel_to_pdf":
      tasks["convert"] = {
        operation: "convert",
        input: "import-file",
        output_format: "pdf",
      };
      break;
    case "compress_pdf":
      tasks["optimize"] = {
        operation: "optimize",
        input: "import-file",
        profile: options?.compressionLevel === 3 ? "extreme" : options?.compressionLevel === 2 ? "medium" : "low",
      };
      break;
    case "merge_pdf":
      tasks["merge"] = {
        operation: "merge",
        input: ["import-file"],
        output_format: "pdf",
      };
      break;
    case "split_pdf":
      tasks["convert"] = {
        operation: "convert",
        input: "import-file",
        output_format: "pdf",
        page_range: options?.pageRange || "1-1",
      };
      break;
    case "pdf_to_jpg":
      tasks["convert"] = {
        operation: "convert",
        input: "import-file",
        output_format: "jpg",
      };
      break;
    case "jpg_to_pdf":
      tasks["convert"] = {
        operation: "convert",
        input: "import-file",
        output_format: "pdf",
      };
      break;
  }

  tasks["export"] = {
    operation: "export/url",
    input: Object.keys(tasks).filter(k => k !== "import-file" && k !== "export")[0],
  };

  return { tasks };
}

serve(handler);