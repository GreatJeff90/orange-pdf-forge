import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { BannerAd } from "@/components/BannerAd";
import { FileText, FilePlus, Merge, Download, Clock, Loader2 } from "lucide-react";
import { useConversions, useConversionDownload } from "@/hooks/useConversions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const History = () => {
  const { data: conversions, isLoading } = useConversions();
  const { downloadFile } = useConversionDownload();
  const { toast } = useToast();

  const getIconAndGradient = (conversionType: string) => {
    const config: Record<string, { icon: JSX.Element; gradient: string }> = {
      pdf_to_word: { icon: <FileText className="w-5 h-5 text-white" />, gradient: "bg-gradient-to-br from-blue-500 to-blue-700" },
      pdf_to_excel: { icon: <FileText className="w-5 h-5 text-white" />, gradient: "bg-gradient-to-br from-green-500 to-green-700" },
      word_to_pdf: { icon: <FileText className="w-5 h-5 text-white" />, gradient: "bg-gradient-to-br from-purple-500 to-purple-700" },
      excel_to_pdf: { icon: <FileText className="w-5 h-5 text-white" />, gradient: "bg-gradient-to-br from-teal-500 to-teal-700" },
      compress_pdf: { icon: <FileText className="w-5 h-5 text-white" />, gradient: "bg-gradient-to-br from-orange-500 to-orange-700" },
      merge_pdf: { icon: <Merge className="w-5 h-5 text-white" />, gradient: "bg-gradient-to-br from-red-500 to-red-700" },
      split_pdf: { icon: <FilePlus className="w-5 h-5 text-white" />, gradient: "bg-gradient-to-br from-pink-500 to-pink-700" },
      pdf_to_jpg: { icon: <FileText className="w-5 h-5 text-white" />, gradient: "bg-gradient-to-br from-indigo-500 to-indigo-700" },
      jpg_to_pdf: { icon: <FilePlus className="w-5 h-5 text-white" />, gradient: "bg-gradient-to-br from-cyan-500 to-cyan-700" },
    };
    return config[conversionType] || { icon: <FileText className="w-5 h-5 text-white" />, gradient: "bg-gradient-to-br from-gray-500 to-gray-700" };
  };

  const getDisplayTitle = (conversionType: string) => {
    const titles: Record<string, string> = {
      pdf_to_word: "PDF → Word",
      pdf_to_excel: "PDF → Excel",
      word_to_pdf: "Word → PDF",
      excel_to_pdf: "Excel → PDF",
      compress_pdf: "Compress PDF",
      merge_pdf: "Merge PDFs",
      split_pdf: "Split PDF",
      pdf_to_jpg: "PDF → JPG",
      jpg_to_pdf: "JPG → PDF",
    };
    return titles[conversionType] || conversionType;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return `Today at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    } else if (diffHours < 48) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  };

  const handleDownload = async (conversion: any) => {
    if (!conversion.output_file_path) {
      toast({
        title: "File not available",
        description: "The converted file is not ready yet",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileName = conversion.output_file_path.split("/").pop() || "converted-file";
      await downloadFile(conversion.output_file_path, fileName);
      toast({
        title: "Download started",
        description: "Your file is downloading",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24">
      <Header />
      <main className="p-4 space-y-6">
        <div className="glass-effect rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 gradient-orange rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Conversion History</h2>
              <p className="text-sm text-muted-foreground">All your completed conversions</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange" />
          </div>
        ) : !conversions || conversions.length === 0 ? (
          <div className="glass-effect rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">No conversions yet</p>
            <p className="text-sm text-muted-foreground mt-2">Start converting files to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversions.map((conversion) => {
              const { icon, gradient } = getIconAndGradient(conversion.conversion_type);
              return (
                <div key={conversion.id} className="glass-effect rounded-2xl p-4">
                  <div className="flex items-center mb-3">
                    <div className={`${gradient} w-10 h-10 rounded-xl flex items-center justify-center mr-3`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{getDisplayTitle(conversion.conversion_type)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(conversion.created_at)}</p>
                    </div>
                    {conversion.status === "completed" && conversion.output_file_path && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(conversion)}
                        className="w-8 h-8 glass-effect rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${
                      conversion.status === "completed" ? "text-green-500" : 
                      conversion.status === "failed" ? "text-red-500" : 
                      "text-yellow-500"
                    }`}>
                      {conversion.status.charAt(0).toUpperCase() + conversion.status.slice(1)}
                      {conversion.status === "processing" && <Loader2 className="w-3 h-3 inline ml-1 animate-spin" />}
                    </span>
                    <span className="text-muted-foreground">-{conversion.cost} coins</span>
                  </div>
                  {conversion.error_message && (
                    <p className="text-xs text-red-500 mt-2">{conversion.error_message}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BannerAd className="mx-4 mb-4" />
      <BottomNav />
    </div>
  );
};

export default History;
