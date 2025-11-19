import { useCallback, useState } from "react";
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  acceptedTypes: string[];
  maxSizeMB?: number;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  uploadProgress?: number;
  isUploading?: boolean;
}

export default function FileUpload({
  acceptedTypes,
  maxSizeMB = 20,
  maxFiles = 10,
  onFilesSelected,
  uploadProgress = 0,
  isUploading = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds ${maxSizeMB}MB limit`,
        variant: "destructive",
      });
      return false;
    }

    // Check file type
    const fileType = file.type;
    const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    
    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileExtension === type;
      }
      if (type.endsWith("/*")) {
        const baseType = type.split("/")[0];
        return fileType.startsWith(baseType);
      }
      return fileType === type;
    });

    if (!isAccepted) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not an accepted file type`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      
      // Check max files limit
      if (selectedFiles.length + fileArray.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive",
        });
        return;
      }

      // Validate all files
      const validFiles = fileArray.filter(validateFile);
      
      if (validFiles.length > 0) {
        const newFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
      }
    },
    [selectedFiles, maxFiles, acceptedTypes, onFilesSelected, toast]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [selectedFiles, onFilesSelected]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative rounded-xl p-8 text-center cursor-pointer transition-all
          border-2 border-dashed
          ${dragActive 
            ? "border-orange-500 bg-orange-500/10" 
            : "border-muted-foreground/30 hover:border-orange-500/50 hover:bg-muted/50"
          }
          ${isUploading ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes.join(",")}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium">
              {isUploading ? "Uploading..." : "Drag & drop your files here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">or</p>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="futuristic-btn"
            disabled={isUploading}
          >
            Browse Files
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Max {maxFiles} file{maxFiles > 1 ? "s" : ""} • {maxSizeMB}MB each
          </p>
        </div>
      </div>

      {isUploading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {selectedFiles.length > 0 && !isUploading && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Selected Files ({selectedFiles.length})
          </p>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="glass-effect rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <FileIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="flex-shrink-0 hover:bg-destructive/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
