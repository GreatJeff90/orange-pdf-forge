import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { FileText, FilePlus, Merge, Download, Clock } from "lucide-react";

const History = () => {
  const history = [
    {
      title: "Document.pdf → Word",
      size: "2.3 MB",
      status: "Completed",
      date: "Today at 2:30 PM",
      icon: <FileText className="w-5 h-5 text-white" />,
      bgGradient: "bg-gradient-to-br from-blue-500 to-blue-700",
    },
    {
      title: "Images → Album.pdf",
      size: "5.1 MB",
      status: "Completed",
      date: "Yesterday at 4:15 PM",
      icon: <FilePlus className="w-5 h-5 text-white" />,
      bgGradient: "bg-gradient-to-br from-purple-500 to-purple-700",
    },
    {
      title: "Merge 3 PDF files",
      size: "7.8 MB",
      status: "Completed",
      date: "Dec 15, 2024",
      icon: <Merge className="w-5 h-5 text-white" />,
      bgGradient: "bg-gradient-to-br from-red-500 to-red-700",
    },
    {
      title: "Report.pdf → Images",
      size: "3.2 MB",
      status: "Completed",
      date: "Dec 14, 2024",
      icon: <FileText className="w-5 h-5 text-white" />,
      bgGradient: "bg-gradient-to-br from-green-500 to-green-700",
    },
  ];

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

        <div className="space-y-4">
          {history.map((item, index) => (
            <div key={index} className="glass-effect rounded-2xl p-4">
              <div className="flex items-center mb-3">
                <div className={`${item.bgGradient} w-10 h-10 rounded-xl flex items-center justify-center mr-3`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.size} • {item.date}</p>
                </div>
                <div className="w-8 h-8 glass-effect rounded-lg flex items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors">
                  <Download className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-500 font-medium">{item.status}</span>
                <span className="text-muted-foreground">-50 coins</span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default History;
