import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

const History = () => {
  return (
    <div className="max-w-md mx-auto min-h-screen pb-24">
      <Header />
      <main className="p-4">
        <div className="glass-effect rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Conversion History</h2>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default History;
