import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Gift, Users, Calendar, Coins } from "lucide-react";

const Earn = () => {
  return (
    <div className="max-w-md mx-auto min-h-screen pb-24">
      <Header />
      <main className="p-4 space-y-6">
        <div className="glass-effect rounded-2xl p-6 text-center">
          <div className="w-20 h-20 gradient-orange rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Earn Free Coins</h2>
          <p className="text-muted-foreground">Complete tasks to earn more coins</p>
        </div>

        <div className="space-y-4">
          <div className="glass-effect rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium">Daily Login</p>
                <p className="text-xs text-muted-foreground">+10 coins per day</p>
              </div>
            </div>
            <span className="text-orange font-bold">+10</span>
          </div>

          <div className="glass-effect rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium">Refer a Friend</p>
                <p className="text-xs text-muted-foreground">+50 coins per referral</p>
              </div>
            </div>
            <span className="text-orange font-bold">+50</span>
          </div>

          <div className="glass-effect rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium">Special Bonus</p>
                <p className="text-xs text-muted-foreground">Complete 10 conversions</p>
              </div>
            </div>
            <span className="text-orange font-bold">+100</span>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Earn;
