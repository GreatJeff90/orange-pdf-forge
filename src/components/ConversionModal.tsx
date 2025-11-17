import { X, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
}: ConversionModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <div className="border-2 border-dashed border-orange/50 rounded-xl p-6 text-center cursor-pointer hover:border-orange hover:bg-orange/5 transition-all">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag & drop your {multipleFiles ? "files" : "file"} here
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">or</p>
            <Button className="gradient-orange mt-2 text-sm px-4 py-2 hover:opacity-90 transition-opacity">
              Browse Files
            </Button>
          </div>
          {multipleFiles && (
            <p className="text-xs text-muted-foreground mt-2">
              {title.includes("Image") ? "Supports JPG, PNG, GIF (max 10 files)" : "Select multiple PDF files"}
            </p>
          )}
        </div>

        {showSplitOptions && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Split Options</label>
            <div className="grid grid-cols-3 gap-2">
              <button className="glass-effect py-2 rounded-lg text-xs hover:bg-secondary/50 transition-colors">
                By Page Range
              </button>
              <button className="glass-effect py-2 rounded-lg text-xs hover:bg-secondary/50 transition-colors">
                Every N Pages
              </button>
              <button className="glass-effect py-2 rounded-lg text-xs hover:bg-secondary/50 transition-colors">
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
              defaultValue="2"
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-orange"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        )}

        <Button className="w-full gradient-orange py-6 text-lg font-medium hover:opacity-90 transition-opacity">
          {title.split(" ").slice(0, 2).join(" ")} ({cost} coins)
        </Button>
      </DialogContent>
    </Dialog>
  );
};
