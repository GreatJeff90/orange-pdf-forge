import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { BannerAd } from "@/components/BannerAd";
import { Button } from "@/components/ui/button";
import { Gift, Users, Calendar, Coins, Play } from "lucide-react";
import { useAdMob } from "@/hooks/useAdMob";
import { useAddCoins } from "@/hooks/useCoins";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";

const Earn = () => {
  const { showRewardedAd, isNative } = useAdMob();
  const { addCoins } = useAddCoins();
  const { toast } = useToast();
  const [isWatching, setIsWatching] = useState(false);

  const handleWatchAd = async () => {
    setIsWatching(true);
    try {
      await showRewardedAd(async (reward) => {
        // Add 1 coin for watching the ad
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.rpc("add_coins", {
            p_user_id: user.id,
            p_amount: 1,
            p_description: "Watched rewarded video ad",
          });

          if (!error) {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#ff6b00', '#ffa500'],
            });

            toast({
              title: "Coin earned! 🎉",
              description: "You earned 1 coin for watching the ad!",
            });
          }
        }
      });
    } catch (error) {
      console.error('Error watching ad:', error);
    } finally {
      setIsWatching(false);
    }
  };

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

        {/* Watch Ad for Coins - Featured */}
        <div className="glass-effect rounded-2xl p-6 border-2 border-orange-500 shadow-lg shadow-orange/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center">
                <Play className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg">Watch Video Ad</p>
                <p className="text-sm text-orange font-semibold">+1 coin per ad</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Watch a short video to earn 1 coin instantly. Watch 1000 ads = 1 month ad-free!
          </p>
          <Button
            onClick={handleWatchAd}
            disabled={isWatching}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-base font-medium"
          >
            {isWatching ? (
              <>Loading Ad...</>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Watch Ad & Earn
              </>
            )}
          </Button>
          {!isNative && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              📱 Rewarded ads available in mobile app
            </p>
          )}
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

        <BannerAd className="mt-6" />
      </main>
      <BottomNav />
    </div>
  );
};

export default Earn;
