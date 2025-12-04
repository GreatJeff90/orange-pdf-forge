import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FileUpload from "./FileUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  showSplitOptions?: boolean;
  showCompressionSlider?: boolean;
  multipleFiles?: boolean;
  acceptedTypes: string[];
}

// Custom error class for better error tracking
class ConversionError extends Error {
  constructor(
    message: string,
    public stage: 'auth' | 'upload' | 'database' | 'backend' | 'storage' | 'unknown',
    public originalError?: any
  ) {
    super(message);
    this.name = 'ConversionError';
  }
}

export const ConversionModal = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconBg,
  showSplitOptions = false,
  showCompressionSlider = false,
  multipleFiles = false,
  acceptedTypes,
}: ConversionModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressionLevel, setCompressionLevel] = useState(2);
  const [splitOption, setSplitOption] = useState<string | null>(null);
  const [splitValue, setSplitValue] = useState<string>("1");
  const [isProcessing, setIsProcessing] = useState(false);
  const { uploadFiles, uploading: fileUploading, progress } = useFileUpload();
  const { toast } = useToast();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "/api";

  const getConversionType = (title: string): string => {
    const typeMap: Record<string, string> = {
      "PDF to Word": "pdf_to_word",
      "PDF to Excel": "pdf_to_excel",
      "Word to PDF": "word_to_pdf",
      "Excel to PDF": "excel_to_pdf",
      "Compress PDF": "compress_pdf",
      "Merge PDFs": "merge_pdf",
      "Split PDF": "split_pdf",
      "PDF to Images": "pdf_to_jpg",
      "Images to PDF": "jpg_to_pdf",
    };
    return typeMap[title] || "pdf_to_word";
  };

  const getBackendEndpoint = (conversionType: string): string | null => {
    const endpointMap: Record<string, string> = {
      "pdf_to_word": "/convert/to-word",
      "pdf_to_jpg": "/convert/to-images",
      "jpg_to_pdf": "/convert/images-to-pdf",
      "merge_pdf": "/convert/merge",
      "split_pdf": "/convert/split",
      "compress_pdf": "/convert/compress",
    };
    return endpointMap[conversionType] || null;
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to convert",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Step 1: Verify authentication
      console.log("[Conversion] Step 1: Checking authentication...");
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        throw new ConversionError(
          `Authentication check failed: ${authError.message}`,
          'auth',
          authError
        );
      }
      
      if (!session) {
        throw new ConversionError(
          "You must be logged in to convert files. Please sign in and try again.",
          'auth'
        );
      }
      console.log("[Conversion] Authentication verified for user:", session.user.id);

      // Step 2: Validate conversion type
      const conversionType = getConversionType(title);
      const endpoint = getBackendEndpoint(conversionType);
      console.log("[Conversion] Step 2: Conversion type:", conversionType, "Endpoint:", endpoint);

      if (!endpoint) {
        throw new ConversionError(
          `The conversion type "${title}" is not yet supported. Available types: PDF to Word, Compress PDF, Merge PDFs, Split PDF, PDF to Images, Images to PDF.`,
          'unknown'
        );
      }

      // Step 3: Upload input files to Supabase Storage
      console.log("[Conversion] Step 3: Uploading input files to storage...");
      const folderName = title.toLowerCase().replace(/\s+/g, "-");
      
      let uploadedPaths: string[];
      try {
        uploadedPaths = await uploadFiles(selectedFiles, { folder: folderName });
        
        if (!uploadedPaths || uploadedPaths.length === 0) {
          throw new Error("No file paths returned from upload");
        }
        
        if (uploadedPaths.length !== selectedFiles.length) {
          throw new Error(`Expected ${selectedFiles.length} uploads but got ${uploadedPaths.length}`);
        }
        
        console.log("[Conversion] Files uploaded successfully:", uploadedPaths);
      } catch (uploadError: any) {
        throw new ConversionError(
          `Failed to upload files to storage: ${uploadError.message || 'Unknown upload error'}`,
          'upload',
          uploadError
        );
      }

      // Step 4: Process conversion
      const isBatchOperation = conversionType === "merge_pdf" || conversionType === "jpg_to_pdf";
      console.log("[Conversion] Step 4: Processing conversion. Batch operation:", isBatchOperation);

      if (isBatchOperation) {
        await processBatchConversion(session.user.id, conversionType, endpoint, selectedFiles, uploadedPaths);
      } else {
        await processSingleFileConversions(session.user.id, conversionType, endpoint, selectedFiles, uploadedPaths);
      }

      toast({
        title: "Conversion Completed",
        description: "Check your history to download the files.",
      });

      // Reset and close
      setSelectedFiles([]);
      setCompressionLevel(2);
      setSplitOption(null);
      setTimeout(() => onClose(), 1500);

    } catch (error: any) {
      console.error("[Conversion] Error:", error);
      
      let errorTitle = "Conversion Failed";
      let errorDescription = "An unexpected error occurred. Please try again.";
      
      if (error instanceof ConversionError) {
        switch (error.stage) {
          case 'auth':
            errorTitle = "Authentication Error";
            break;
          case 'upload':
            errorTitle = "Upload Error";
            break;
          case 'database':
            errorTitle = "Database Error";
            break;
          case 'backend':
            errorTitle = "Conversion Service Error";
            break;
          case 'storage':
            errorTitle = "Storage Error";
            break;
        }
        errorDescription = error.message;
        
        if (error.originalError) {
          console.error("[Conversion] Original error:", error.originalError);
        }
      } else {
        errorDescription = error.message || errorDescription;
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processBatchConversion = async (
    userId: string, 
    conversionType: string, 
    endpoint: string, 
    files: File[], 
    uploadedPaths: string[]
  ) => {
    // Step 4a: Create database record
    console.log("[Batch Conversion] Creating database record...");
    const inputPathStr = uploadedPaths.join(",");
    
    const { data: record, error: insertError } = await supabase
      .from("conversions")
      .insert({
        user_id: userId,
        conversion_type: conversionType as any,
        input_file_path: inputPathStr,
        cost: 0,
        status: "processing" as const,
      })
      .select()
      .single();

    if (insertError) {
      throw new ConversionError(
        `Failed to create conversion record: ${insertError.message}`,
        'database',
        insertError
      );
    }
    
    if (!record) {
      throw new ConversionError(
        "Failed to create conversion record: No record returned",
        'database'
      );
    }
    
    console.log("[Batch Conversion] Database record created:", record.id);

    try {
      // Step 4b: Call backend conversion service
      console.log("[Batch Conversion] Calling backend service:", `${BACKEND_URL}${endpoint}`);
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append("files", file);
        console.log(`[Batch Conversion] Added file ${index + 1}: ${file.name} (${file.size} bytes)`);
      });

      let response: Response;
      try {
        response = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: "POST",
          body: formData,
        });
      } catch (fetchError: any) {
        throw new ConversionError(
          `Failed to connect to conversion service: ${fetchError.message}. Please check if the backend server is running.`,
          'backend',
          fetchError
        );
      }

      console.log("[Batch Conversion] Backend response status:", response.status);

      if (!response.ok) {
        let errorMessage = `Backend returned status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // Response might not be JSON
          try {
            const textError = await response.text();
            if (textError) errorMessage = textError;
          } catch {
            // Ignore text parsing error
          }
        }
        throw new ConversionError(
          `Conversion failed: ${errorMessage}`,
          'backend'
        );
      }

      // Step 4c: Get converted file
      const blob = await response.blob();
      console.log("[Batch Conversion] Received converted file:", blob.size, "bytes, type:", blob.type);
      
      if (blob.size === 0) {
        throw new ConversionError(
          "Conversion service returned an empty file",
          'backend'
        );
      }

      // Step 4d: Upload converted file to storage
      const outputFilename = `${Date.now()}_converted.pdf`;
      const uploadPath = `${userId}/converted/${outputFilename}`;
      console.log("[Batch Conversion] Uploading converted file to:", uploadPath);

      const { error: uploadError } = await supabase.storage
        .from("conversions")
        .upload(uploadPath, blob, {
          contentType: blob.type || "application/pdf",
          upsert: false
        });

      if (uploadError) {
        throw new ConversionError(
          `Failed to save converted file: ${uploadError.message}`,
          'storage',
          uploadError
        );
      }
      
      console.log("[Batch Conversion] Converted file saved successfully");

      // Step 4e: Update database record
      const { error: updateError } = await supabase
        .from("conversions")
        .update({
          status: "completed",
          output_file_path: uploadPath,
          completed_at: new Date().toISOString(),
        })
        .eq("id", record.id);

      if (updateError) {
        console.error("[Batch Conversion] Warning: Failed to update record status:", updateError);
        // Don't throw here - conversion succeeded, just record update failed
      }
      
      console.log("[Batch Conversion] Conversion completed successfully");

    } catch (err: any) {
      // Update record to failed status
      console.error("[Batch Conversion] Conversion failed, updating record:", err.message);
      await supabase
        .from("conversions")
        .update({ 
          status: "failed", 
          error_message: err.message || "Unknown error" 
        })
        .eq("id", record.id);
      
      throw err;
    }
  };

  const processSingleFileConversions = async (
    userId: string, 
    conversionType: string, 
    endpoint: string, 
    files: File[], 
    uploadedPaths: string[]
  ) => {
    const errors: string[] = [];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const uploadedPath = uploadedPaths[i];
      
      console.log(`[Single Conversion] Processing file ${i + 1}/${files.length}: ${file.name}`);

      // Create database record
      const { data: record, error: insertError } = await supabase
        .from("conversions")
        .insert({
          user_id: userId,
          conversion_type: conversionType as any,
          input_file_path: uploadedPath,
          cost: 0,
          status: "processing" as const,
        })
        .select()
        .single();

      if (insertError) {
        console.error(`[Single Conversion] Failed to create record for ${file.name}:`, insertError);
        errors.push(`${file.name}: Failed to create database record`);
        continue;
      }

      try {
        // Build form data
        const formData = new FormData();
        formData.append("file", file);

        // Add options based on conversion type
        if (conversionType === "split_pdf") {
          const mode = splitOption || "pages";
          formData.append("split_mode", mode);
          formData.append("split_value", splitValue);
          console.log(`[Single Conversion] Split options - mode: ${mode}, value: ${splitValue}`);
        }
        if (conversionType === "compress_pdf") {
          formData.append("level", compressionLevel.toString());
          console.log(`[Single Conversion] Compression level: ${compressionLevel}`);
        }

        // Call backend
        let response: Response;
        try {
          response = await fetch(`${BACKEND_URL}${endpoint}`, {
            method: "POST",
            body: formData,
          });
        } catch (fetchError: any) {
          throw new ConversionError(
            `Network error: ${fetchError.message}`,
            'backend',
            fetchError
          );
        }

        console.log(`[Single Conversion] Backend response for ${file.name}:`, response.status);

        if (!response.ok) {
          let errorMessage = `Status ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch {
            try {
              const textError = await response.text();
              if (textError) errorMessage = textError;
            } catch {}
          }
          throw new ConversionError(errorMessage, 'backend');
        }

        // Get converted file
        const blob = await response.blob();
        
        if (blob.size === 0) {
          throw new ConversionError("Received empty file from conversion service", 'backend');
        }

        // Determine filename
        const contentDisp = response.headers.get("Content-Disposition");
        let filename = file.name.replace(/\.[^/.]+$/, "") + "_converted";
        
        if (contentDisp && contentDisp.includes("filename=")) {
          const match = contentDisp.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (match && match[1]) {
            filename = match[1].replace(/['"]/g, "");
          }
        } else {
          // Add appropriate extension
          if (blob.type === "application/pdf") filename += ".pdf";
          else if (blob.type === "application/zip") filename += ".zip";
          else if (blob.type.includes("word") || blob.type.includes("officedocument")) filename += ".docx";
          else filename += ".pdf";
        }

        const uploadPath = `${userId}/converted/${Date.now()}_${filename}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("conversions")
          .upload(uploadPath, blob, {
            contentType: blob.type || "application/octet-stream",
            upsert: false
          });

        if (uploadError) {
          throw new ConversionError(
            `Failed to save: ${uploadError.message}`,
            'storage',
            uploadError
          );
        }

        // Update record
        await supabase
          .from("conversions")
          .update({
            status: "completed",
            output_file_path: uploadPath,
            completed_at: new Date().toISOString(),
          })
          .eq("id", record.id);

        successCount++;
        console.log(`[Single Conversion] Successfully converted ${file.name}`);

      } catch (err: any) {
        console.error(`[Single Conversion] Failed to convert ${file.name}:`, err);
        
        // Update record with failure
        await supabase
          .from("conversions")
          .update({ 
            status: "failed", 
            error_message: err.message || "Unknown error" 
          })
          .eq("id", record.id);

        errors.push(`${file.name}: ${err.message}`);
      }
    }

    // Report results
    if (errors.length > 0 && successCount === 0) {
      throw new ConversionError(
        `All conversions failed:\n${errors.join('\n')}`,
        'backend'
      );
    } else if (errors.length > 0) {
      // Partial success - show warning but don't throw
      toast({
        title: "Partial Success",
        description: `${successCount} file(s) converted. ${errors.length} failed: ${errors[0]}`,
        variant: "destructive",
      });
    }
    
    console.log(`[Single Conversion] Completed: ${successCount} success, ${errors.length} failed`);
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setCompressionLevel(2);
    setSplitOption(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-effect border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
        </DialogHeader>

        <div className="glass-effect rounded-xl p-4 mb-4">
          <div className="flex items-center mb-2">
            <div className={`${iconBg} w-12 h-12 rounded-xl flex items-center justify-center mr-3`}>
              {icon}
            </div>
            <div>
              <p className="font-medium">{description}</p>
              <p className="text-xs text-green-500 font-semibold">100% FREE - Local Processing</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Upload {multipleFiles ? "Files" : "File"}
          </label>
          <FileUpload
            acceptedTypes={acceptedTypes}
            maxFiles={multipleFiles ? 10 : 1}
            onFilesSelected={setSelectedFiles}
            uploadProgress={progress}
            isUploading={fileUploading}
          />
        </div>

        {showSplitOptions && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Split Options</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                onClick={() => setSplitOption("range")}
                className={`glass-effect py-2 rounded-lg text-xs transition-colors ${
                  splitOption === "range" ? "bg-orange-500/20 border-2 border-orange-500" : "hover:bg-secondary/50"
                }`}
              >
                By Page Range
              </button>
              <button
                onClick={() => setSplitOption("pages")}
                className={`glass-effect py-2 rounded-lg text-xs transition-colors ${
                  splitOption === "pages" ? "bg-orange-500/20 border-2 border-orange-500" : "hover:bg-secondary/50"
                }`}
              >
                Every N Pages
              </button>
              <button
                onClick={() => setSplitOption("bookmarks")}
                className={`glass-effect py-2 rounded-lg text-xs transition-colors ${
                  splitOption === "bookmarks" ? "bg-orange-500/20 border-2 border-orange-500" : "hover:bg-secondary/50"
                }`}
              >
                By Bookmarks
              </button>
            </div>
            {splitOption === "range" && (
              <input
                type="text"
                placeholder="e.g. 1-3,5"
                className="w-full p-2 rounded bg-secondary text-sm"
                value={splitValue}
                onChange={(e) => setSplitValue(e.target.value)}
              />
            )}
            {splitOption === "pages" && (
              <input
                type="number"
                placeholder="e.g. 1"
                className="w-full p-2 rounded bg-secondary text-sm"
                value={splitValue}
                onChange={(e) => setSplitValue(e.target.value)}
              />
            )}
          </div>
        )}

        {showCompressionSlider && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Compression Level</label>
            <div className="flex justify-between mb-2 text-xs text-muted-foreground">
              <span>Low (Larger file)</span>
              <span>High (Smaller file)</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              value={compressionLevel}
              onChange={(e) => setCompressionLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-orange"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleConvert}
          disabled={fileUploading || selectedFiles.length === 0 || isProcessing}
          className="w-full gradient-orange py-6 text-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {fileUploading
            ? `Uploading... ${progress}%`
            : isProcessing
              ? "Converting..."
              : `${title.split(" ").slice(0, 2).join(" ")} - FREE`}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
