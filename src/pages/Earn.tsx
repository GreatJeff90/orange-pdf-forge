import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Play, Download, Star, HelpCircle } from "lucide-react";
import { useAdMob } from "@/hooks/useAdMob";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";

const DAILY_AD_LIMIT = 10;

const Earn = () => {
  const { showRewardedAd, isNative } = useAdMob();
  const { toast } = useToast();
  const [isWatching, setIsWatching] = useState(false);
  const [adWatchCount, setAdWatchCount] = useState(0);

  useEffect(() => {
    const fetchAdWatchCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.rpc('get_daily_ad_watch_count', {
          p_user_id: user.id,
        });
        if (!error) {
          setAdWatchCount(data);
        }
      }
    };

    fetchAdWatchCount();
  }, []);

  const handleWatchAd = async () => {
    if (adWatchCount >= DAILY_AD_LIMIT) {
      toast({
        title: "Daily limit reached",
        description: `You can watch a maximum of ${DAILY_AD_LIMIT} ads per day.`,
      });
      return;
    }

    setIsWatching(true);
    try {
      await showRewardedAd(async (reward) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase.rpc("add_coins", {
            p_user_id: user.id,
            p_amount: 1,
            p_description: "Watched rewarded video ad",
          });

          if (!error) {
            setAdWatchCount(adWatchCount + 1);
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
      toast({
        title: "Error",
        description: "Could not show ad. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsWatching(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24">
      <Header />
      <main className="p-4 space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold">Get More Coins</h2>
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-muted-foreground">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                  <DialogTitle>Why coins?</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Coins let us keep basic conversions free while covering server costs.
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm text-muted-foreground" style={{ color: '#AAAAAA' }}>
            Keep using the app for free by completing quick offers
          </p>
        </div>

        {/* Watch Video */}
        <div className="bg-muted-gray rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Play className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="font-semibold">Watch a short video</p>
              <p className="text-xs text-muted-foreground">
                +1 coin per video (max {DAILY_AD_LIMIT}/day) - Watched: {adWatchCount}/{DAILY_AD_LIMIT}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWatchAd}
            disabled={isWatching || adWatchCount >= DAILY_AD_LIMIT}
          >
            {isWatching ? "Loading..." : "Watch"}
          </Button>
        </div>

        {/* Install Sponsored App */}
        <div className="bg-muted-gray rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Download className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="font-semibold">Install & Open Sponsored App</p>
                <p className="text-xs text-muted-foreground">+25-50 coins</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 pl-10">
            Sponsored – you’ll be taken to the App Store
          </p>
        </div>

        {/* Upgrade to PRO */}
        <div className="bg-muted-gray rounded-2xl p-4 border border-orange-500/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Star className="w-6 h-6 text-orange-500" />
              <div>
                <p className="font-semibold text-orange-500">Upgrade to PRO – Best Value</p>
                <p className="text-xs text-muted-foreground">Remove ads forever + unlimited conversions</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-orange-500">
              See Plans
            </Button>
          </div>
        </div>


        {!isNative && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            📱 Rewarded ads available in mobile app
          </p>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Earn;
