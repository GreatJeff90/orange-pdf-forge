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
  const [splitValue, setSplitValue] = useState<string>("1"); // Default for "Every N Pages"
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

  const getBackendEndpoint = (conversionType: string): string => {
    const endpointMap: Record<string, string> = {
      "pdf_to_word": "/convert/to-word",
      "pdf_to_jpg": "/convert/to-images",
      "jpg_to_pdf": "/convert/images-to-pdf",
      "merge_pdf": "/convert/merge",
      "split_pdf": "/convert/split",
      "compress_pdf": "/convert/compress",
    };
    return endpointMap[conversionType];
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

    try {
      setIsProcessing(true);
      // Verify user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to convert files",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const conversionType = getConversionType(title);
      const endpoint = getBackendEndpoint(conversionType);

      if (!endpoint) {
        toast({
          title: "Not Implemented",
          description: "This conversion type is not yet supported by the local backend.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // 1. Upload input files to Supabase Storage (for history/backup)
      // Note: We could skip this and only upload the result, but having input is good for history.
      const folderName = title.toLowerCase().replace(/\s+/g, "-");
      const uploadedPaths = await uploadFiles(selectedFiles, {
        folder: folderName,
      });

      // 2. Create "Processing" record in Supabase
      // We'll just create one record for the batch if it's a merge/image-to-pdf,
      // or one per file for others.
      // For simplicity, let's assume one main record or handle per file if not merging.
      
      const isBatchOperation = conversionType === "merge_pdf" || conversionType === "jpg_to_pdf";

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
      console.error("Conversion error:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processBatchConversion = async (userId: string, conversionType: string, endpoint: string, files: File[], uploadedPaths: string[]) => {
    // Create record
    const inputPathStr = uploadedPaths.join(",");
    const { data: record, error: insertError } = await supabase
        .from("conversions")
        .insert({
          user_id: userId,
          conversion_type: conversionType,
          input_file_path: inputPathStr, // Store all paths? or just first?
          cost: 0,
          status: "processing",
        })
        .select()
        .single();

    if (insertError) throw insertError;

    try {
      // Call Backend
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Backend conversion failed");
      }

      const blob = await response.blob();
      const outputFilename = `${Date.now()}_converted.pdf`; // Default name
      const uploadPath = `${userId}/converted/${outputFilename}`;

      // Upload Output to Supabase
      const { error: uploadError } = await supabase.storage
        .from("conversions")
        .upload(uploadPath, blob, {
          contentType: blob.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Update Record
      await supabase
        .from("conversions")
        .update({
          status: "completed",
          output_file_path: uploadPath,
          completed_at: new Date().toISOString(),
        })
        .eq("id", record.id);

    } catch (err: any) {
        await supabase
        .from("conversions")
        .update({ status: "failed", error_message: err.message })
        .eq("id", record.id);
        throw err;
    }
  };

  const processSingleFileConversions = async (userId: string, conversionType: string, endpoint: string, files: File[], uploadedPaths: string[]) => {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedPath = uploadedPaths[i];

        const { data: record, error: insertError } = await supabase
        .from("conversions")
        .insert({
          user_id: userId,
          conversion_type: conversionType,
          input_file_path: uploadedPath,
          cost: 0,
          status: "processing",
        })
        .select()
        .single();

        if (insertError) {
            console.error("Failed to create record", insertError);
            continue;
        }

        try {
            const formData = new FormData();
            formData.append("file", file);

            // Add options
            if (conversionType === "split_pdf") {
                formData.append("split_mode", splitOption || "pages");
                formData.append("split_value", splitValue); // Use state
            }
            if (conversionType === "compress_pdf") {
                formData.append("level", compressionLevel.toString());
            }

            const response = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || "Backend conversion failed");
            }

            const blob = await response.blob();
            // Get filename from header or guess
            const contentDisp = response.headers.get("Content-Disposition");
            let filename = "converted_file";
            if (contentDisp && contentDisp.includes("filename=")) {
                filename = contentDisp.split("filename=")[1].replace(/"/g, "");
            } else {
                 // Fallback extension
                 if (blob.type === "application/pdf") filename += ".pdf";
                 else if (blob.type === "application/zip") filename += ".zip";
                 else if (blob.type.includes("word")) filename += ".docx";
            }

            const uploadPath = `${userId}/converted/${Date.now()}_${filename}`;

            const { error: uploadError } = await supabase.storage
                .from("conversions")
                .upload(uploadPath, blob, {
                contentType: blob.type,
                upsert: false
                });

            if (uploadError) throw uploadError;

            await supabase
                .from("conversions")
                .update({
                status: "completed",
                output_file_path: uploadPath,
                completed_at: new Date().toISOString(),
                })
                .eq("id", record.id);

        } catch (err: any) {
            await supabase
            .from("conversions")
            .update({ status: "failed", error_message: err.message })
            .eq("id", record.id);
            throw err;
        }
    }
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
