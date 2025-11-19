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
  TrendingUp
} from "lucide-react";
import { useState } from "react";

type ConversionType = "pdf-to-word" | "pdf-to-image" | "image-to-pdf" | "pdf-merge" | "pdf-split" | "pdf-compress" | null;

const Index = () => {
  const [activeModal, setActiveModal] = useState<ConversionType>(null);

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

  const recentConversions = [
    {
      title: "Document.pdf → Word",
      size: "2.3 MB",
      status: "Done",
      statusColor: "text-green-500",
      time: "Today",
      icon: <FileText className="w-5 h-5 text-white" />,
      bgGradient: "bg-gradient-to-br from-blue-500 to-blue-700",
    },
    {
      title: "Images → Album.pdf",
      size: "5.1 MB",
      status: "Done",
      statusColor: "text-green-500",
      time: "Yesterday",
      icon: <FilePlus className="w-5 h-5 text-white" />,
      bgGradient: "bg-gradient-to-br from-purple-500 to-purple-700",
    },
    {
      title: "Merge 3 PDF files",
      size: "7.8 MB",
      status: "In Progress",
      statusColor: "text-orange",
      time: "Just now",
      icon: <Merge className="w-5 h-5 text-white" />,
      bgGradient: "bg-gradient-to-br from-red-500 to-red-700",
      pulse: true,
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
            <a href="#" className="text-orange text-sm hover:underline">
              See All
            </a>
          </div>
          <div className="space-y-4">
            {recentConversions.map((conversion, index) => (
              <div key={index} className="flex items-center">
                <div className={`${conversion.bgGradient} w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${conversion.pulse ? 'animate-pulse' : ''}`}>
                  {conversion.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{conversion.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {conversion.status === "Done" ? "Completed" : "Processing"} • {conversion.size}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-sm ${conversion.statusColor}`}>{conversion.status}</p>
                  <p className="text-xs text-muted-foreground">{conversion.time}</p>
                </div>
              </div>
            ))}
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
