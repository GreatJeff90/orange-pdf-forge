import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { BannerAd } from "@/components/BannerAd";
import { ConversionModal } from "@/components/ConversionModal";
import { 
  FileText, 
  Image, 
  FilePlus, 
  Merge, 
  ScissorsLineDashed, 
  FileArchive,
  Coins,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { useConversions } from "@/hooks/useConversions";
import { formatDistanceToNow } from "date-fns";

type ConversionType = "pdf-to-word" | "pdf-to-image" | "image-to-pdf" | "pdf-merge" | "pdf-split" | "pdf-compress" | null;

const Index = () => {
  const [activeModal, setActiveModal] = useState<ConversionType>(null);
  const { data: conversions, isLoading: conversionsLoading } = useConversions();

  // Get latest 5 conversions
  const recentConversions = conversions?.slice(0, 5) || [];

  const getConversionIcon = (type: string) => {
    const typeMap: Record<string, { icon: JSX.Element; gradient: string }> = {
      'pdf_to_word': { 
        icon: <FileText className="w-5 h-5 text-white" />,
        gradient: "bg-gradient-to-br from-blue-500 to-blue-700"
      },
      'pdf_to_jpg': { 
        icon: <Image className="w-5 h-5 text-white" />,
        gradient: "bg-gradient-to-br from-green-500 to-green-700"
      },
      'jpg_to_pdf': { 
        icon: <FilePlus className="w-5 h-5 text-white" />,
        gradient: "bg-gradient-to-br from-purple-500 to-purple-700"
      },
      'merge_pdf': { 
        icon: <Merge className="w-5 h-5 text-white" />,
        gradient: "bg-gradient-to-br from-red-500 to-red-700"
      },
      'split_pdf': { 
        icon: <ScissorsLineDashed className="w-5 h-5 text-white" />,
        gradient: "bg-gradient-to-br from-yellow-500 to-yellow-700"
      },
      'compress_pdf': { 
        icon: <FileArchive className="w-5 h-5 text-white" />,
        gradient: "bg-gradient-to-br from-indigo-500 to-indigo-700"
      },
    };
    return typeMap[type] || typeMap['pdf_to_word'];
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: JSX.Element }> = {
      'completed': { 
        label: 'Done', 
        color: 'text-green-500',
        icon: <CheckCircle2 className="w-4 h-4" />
      },
      'processing': { 
        label: 'Processing', 
        color: 'text-orange',
        icon: <Clock className="w-4 h-4 animate-spin" />
      },
      'pending': { 
        label: 'Pending', 
        color: 'text-yellow-500',
        icon: <Clock className="w-4 h-4" />
      },
      'failed': { 
        label: 'Failed', 
        color: 'text-red-500',
        icon: <XCircle className="w-4 h-4" />
      },
    };
    return statusMap[status] || statusMap['pending'];
  };

  const formatConversionTitle = (type: string) => {
    const titleMap: Record<string, string> = {
      'pdf_to_word': 'PDF to Word',
      'pdf_to_excel': 'PDF to Excel',
      'word_to_pdf': 'Word to PDF',
      'excel_to_pdf': 'Excel to PDF',
      'compress_pdf': 'Compress PDF',
      'merge_pdf': 'Merge PDFs',
      'split_pdf': 'Split PDF',
      'pdf_to_jpg': 'PDF to Images',
      'jpg_to_pdf': 'Images to PDF',
    };
    return titleMap[type] || 'Conversion';
  };

  const conversionOptions = [
    {
      id: "pdf-to-word" as ConversionType,
      title: "PDF to Word",
      description: "Convert to editable DOCX",
      icon: <FileText className="w-7 h-7 text-white" />,
      bgGradient: "bg-gradient-to-br from-blue-500 to-blue-700",
      modalTitle: "PDF to Word Conversion",
      modalDescription: "Convert PDF to editable Word document",
      acceptedTypes: ["application/pdf"],
    },
    {
      id: "pdf-to-image" as ConversionType,
      title: "PDF to Images",
      description: "Extract images from PDF",
      icon: <Image className="w-7 h-7 text-white" />,
      bgGradient: "bg-gradient-to-br from-green-500 to-green-700",
      modalTitle: "PDF to Images",
      modalDescription: "Extract images from PDF document",
      acceptedTypes: ["application/pdf"],
    },
    {
      id: "image-to-pdf" as ConversionType,
      title: "Images to PDF",
      description: "Convert images to PDF",
      icon: <FilePlus className="w-7 h-7 text-white" />,
      bgGradient: "bg-gradient-to-br from-purple-500 to-purple-700",
      modalTitle: "Images to PDF",
      modalDescription: "Convert images to PDF document",
      multipleFiles: true,
      acceptedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    },
    {
      id: "pdf-merge" as ConversionType,
      title: "Merge PDFs",
      description: "Combine multiple PDFs",
      icon: <Merge className="w-7 h-7 text-white" />,
      bgGradient: "bg-gradient-to-br from-red-500 to-red-700",
      modalTitle: "Merge PDF Files",
      modalDescription: "Combine multiple PDFs into one",
      multipleFiles: true,
      acceptedTypes: ["application/pdf"],
    },
    {
      id: "pdf-split" as ConversionType,
      title: "Split PDF",
      description: "Split PDF into files",
      icon: <ScissorsLineDashed className="w-7 h-7 text-white" />,
      bgGradient: "bg-gradient-to-br from-yellow-500 to-yellow-700",
      modalTitle: "Split PDF",
      modalDescription: "Split PDF into multiple files",
      showSplitOptions: true,
      acceptedTypes: ["application/pdf"],
    },
    {
      id: "pdf-compress" as ConversionType,
      title: "Compress PDF",
      description: "Reduce PDF file size",
      icon: <FileArchive className="w-7 h-7 text-white" />,
      bgGradient: "bg-gradient-to-br from-indigo-500 to-indigo-700",
      modalTitle: "Compress PDF",
      modalDescription: "Reduce PDF file size",
      showCompressionSlider: true,
      acceptedTypes: ["application/pdf"],
    },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24">
      <Header showUserInfo />

      <main className="p-4">
        {/* Balance Card */}
        <div className="glass-effect rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-20" style={{ background: "hsl(var(--orange))" }} />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-10" style={{ background: "hsl(var(--orange))" }} />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-muted-foreground text-sm">Available Coins</p>
              <h2 className="text-3xl font-bold">
                5,240 <span className="text-lg text-orange">coins</span>
              </h2>
            </div>
            <div className="gradient-orange p-2 rounded-full">
              <Coins className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex justify-between text-sm relative z-10">
            <div>
              <p className="text-muted-foreground">Conversions Today</p>
              <p className="font-medium">3 files</p>
            </div>
            <div>
              <p className="text-muted-foreground">Conversion Rate</p>
              <p className="font-medium">50 coins/file</p>
            </div>
          </div>
        </div>

        {/* PDF Conversion Options */}
        <div className="glass-effect rounded-2xl p-4 mb-6">
          <h3 className="font-semibold mb-2 text-lg">PDF Conversions</h3>
          <p className="text-muted-foreground text-sm mb-4">Convert your files with our futuristic tools</p>
          
          <div className="grid grid-cols-2 gap-4">
            {conversionOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setActiveModal(option.id)}
                className="glass-effect p-4 text-center rounded-2xl cursor-pointer hover:-translate-y-1 transition-transform duration-300"
              >
                <div className={`${option.bgGradient} w-[70px] h-[70px] rounded-[18px] flex items-center justify-center mx-auto mb-3`}>
                  {option.icon}
                </div>
                <h4 className="font-medium text-sm">{option.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                <div className="mt-3 text-xs text-green-500 font-semibold">
                  100% FREE
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversions */}
        <div className="glass-effect rounded-2xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Recent Conversions</h3>
            <a href="/history" className="text-orange text-sm hover:underline">
              See All
            </a>
          </div>
          <div className="space-y-4">
            {conversionsLoading ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Loading conversions...</p>
              </div>
            ) : recentConversions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No conversions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start converting your files above!</p>
              </div>
            ) : (
              recentConversions.map((conversion) => {
                const conversionInfo = getConversionIcon(conversion.conversion_type);
                const statusInfo = getStatusInfo(conversion.status);
                
                return (
                  <div key={conversion.id} className="flex items-center">
                    <div className={`${conversionInfo.gradient} w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${conversion.status === 'processing' ? 'animate-pulse' : ''}`}>
                      {conversionInfo.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{formatConversionTitle(conversion.conversion_type)}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {statusInfo.icon}
                        <span>{statusInfo.label}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-sm ${statusInfo.color}`}>{statusInfo.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conversion.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <BottomNav />

      {/* Conversion Modals */}
      {conversionOptions.map((option) => (
        <ConversionModal
          key={option.id}
          isOpen={activeModal === option.id}
          onClose={() => setActiveModal(null)}
          title={option.modalTitle}
          description={option.modalDescription}
          icon={option.icon}
          iconBg={option.bgGradient}
          showSplitOptions={option.showSplitOptions}
          showCompressionSlider={option.showCompressionSlider}
          multipleFiles={option.multipleFiles}
          acceptedTypes={option.acceptedTypes}
        />
      ))}

      <BannerAd className="mt-6" />
    </div>
  );
};

export default Index;
