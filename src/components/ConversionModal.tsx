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
  cost: number;
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
  cost,
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
  const { uploadFiles, uploading, progress } = useFileUpload();
  const { toast } = useToast();

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
      // Upload files first
      const folderName = title.toLowerCase().replace(/\s+/g, "-");
      const uploadedPaths = await uploadFiles(selectedFiles, {
        folder: folderName,
      });

      console.log("Files uploaded:", uploadedPaths);

      // Start conversion for each file
      const conversionType = getConversionType(title);
      
      for (const filePath of uploadedPaths) {
        const { data, error } = await supabase.functions.invoke("convert-file", {
          body: {
            conversionType,
            inputFilePath: filePath,
            cost,
            options: {
              compressionLevel,
              splitOption,
            },
          },
        });

        if (error) {
          console.error("Conversion error:", error);
          toast({
            title: "Conversion failed",
            description: error.message || "Failed to start conversion",
            variant: "destructive",
          });
        } else {
          console.log("Conversion started:", data);
        }
      }

      toast({
        title: "Conversion started",
        description: `Processing ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}. Check History for results.`,
      });

      // Reset and close
      setSelectedFiles([]);
      setCompressionLevel(2);
      setSplitOption(null);
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error("Conversion error:", error);
    }
  };

  const getConversionType = (title: string): string => {
    const typeMap: Record<string, string> = {
      "PDF to Word": "pdf_to_word",
      "PDF to Excel": "pdf_to_excel",
      "Word to PDF": "word_to_pdf",
      "Excel to PDF": "excel_to_pdf",
      "Compress PDF": "compress_pdf",
      "Merge PDFs": "merge_pdf",
      "Split PDF": "split_pdf",
      "PDF to JPG": "pdf_to_jpg",
      "JPG to PDF": "jpg_to_pdf",
    };
    return typeMap[title] || "pdf_to_word";
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
              <p className="text-xs text-muted-foreground">Cost: {cost} coins</p>
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
            isUploading={uploading}
          />
        </div>

        {showSplitOptions && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Split Options</label>
            <div className="grid grid-cols-3 gap-2">
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
          disabled={uploading || selectedFiles.length === 0}
          className="w-full gradient-orange py-6 text-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {uploading
            ? `Uploading... ${progress}%`
            : `${title.split(" ").slice(0, 2).join(" ")} (${cost} coins)`}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
