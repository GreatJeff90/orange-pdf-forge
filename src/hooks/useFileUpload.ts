import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

interface UploadOptions {
  bucket?: string;
  folder?: string;
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFiles = async (
    files: File[],
    options: UploadOptions = {}
  ): Promise<string[]> => {
    const { bucket = "conversions", folder = "" } = options;
    
    setUploading(true);
    setProgress(0);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const uploadedPaths: string[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileExt = file.name.split(".").pop();
        const fileName = `${timestamp}-${randomStr}.${fileExt}`;
        const filePath = folder 
          ? `${user.id}/${folder}/${fileName}`
          : `${user.id}/${fileName}`;

        console.log(`Uploading file ${i + 1}/${totalFiles}:`, filePath);

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error);
          throw error;
        }

        uploadedPaths.push(data.path);
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      toast({
        title: "Upload successful",
        description: `${files.length} file${files.length > 1 ? "s" : ""} uploaded successfully`,
      });

      return uploadedPaths;
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (
    filePath: string,
    bucket: string = "conversions"
  ): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "File deleted",
        description: "File deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getPublicUrl = (
    filePath: string,
    bucket: string = "conversions"
  ): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  return {
    uploadFiles,
    deleteFile,
    getPublicUrl,
    uploading,
    progress,
  };
}
