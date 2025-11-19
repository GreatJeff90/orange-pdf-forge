import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCoinPackages, useAddCoins, useUserCoins } from "@/hooks/useCoins";
import { useToast } from "@/hooks/use-toast";
import { Coins, Check, Loader2, Sparkles, Shield, Calendar } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";
import { getAdFreeStatus } from "@/lib/adFreeUtils";

interface CoinPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoinPurchaseModal = ({ isOpen, onClose }: CoinPurchaseModalProps) => {
  const { data: packages, isLoading } = useCoinPackages();
  const { data: userCoins } = useUserCoins();
  const { addCoins } = useAddCoins();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState(false);

  const adFreeStatus = getAdFreeStatus(userCoins?.adFreeUntil || null);

  const getAdFreeDuration = (coins: number): string => {
    const months = Math.floor(coins / 1000);
    return months === 1 ? "1 month" : `${months} months`;
  };

  const getPackageSubtitle = (name: string): string => {
    const subtitles: Record<string, string> = {
      'Starter': 'Great for trying ad-free',
      'Popular': '★ Most Popular ★ Save 17%',
      'Pro': 'Extended ad-free experience',
      'Pro+': 'Best annual deal',
      'Ultimate': 'One payment. Ad-free for 2.5 years + Founder badge',
    };
    return subtitles[name] || '';
  };

  const handlePurchase = async (packageId: string, packageName: string, coins: number) => {
    setPurchasing(true);
    try {
      await addCoins(packageId);
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b00', '#ffa500', '#ffb347'],
      });
      
      const duration = getAdFreeDuration(coins);
      toast({
        title: "🎉 Success!",
        description: `You just unlocked ${duration} ad-free!`,
      });
      onClose();
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase failed",
        description: error.message || "Failed to add coins",
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Coins className="w-5 h-5 text-orange" />
            Purchase Coins
          </DialogTitle>
          <div className="bg-orange/10 border border-orange/20 rounded-lg p-3 mt-3 text-center">
            <p className="text-sm font-medium">
              All conversions are <span className="text-orange font-bold">100% FREE</span> forever!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You're only removing ads.
            </p>
          </div>

          {/* Current Ad-Free Status */}
          {adFreeStatus.isAdFree ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-3">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-500 mb-1">
                    🎉 You're Ad-Free!
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Expires {adFreeStatus.timeRemaining}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {adFreeStatus.formattedDate}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 border border-border rounded-lg p-3 mt-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    No active ad-free time
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Purchase coins below to enjoy an ad-free experience
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange" />
          </div>
        ) : (
          <div className="space-y-3">
            {packages?.map((pkg) => (
              <div
                key={pkg.id}
                className={`glass-effect rounded-xl p-4 border-2 transition-all ${
                  pkg.popular ? "border-orange-500 shadow-lg shadow-orange/20" : "border-border"
                }`}
              >
                {pkg.popular && (
                  <div className="flex justify-center mb-2">
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                      🔥 MOST POPULAR
                    </span>
                  </div>
                )}
                <div className="mb-3">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="font-bold text-xl">{pkg.name}</h3>
                    {pkg.name === 'Pro+' && (
                      <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-medium">
                        Best Value
                      </span>
                    )}
                    {pkg.name === 'Ultimate' && (
                      <span className="text-xs bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shadow-lg shadow-amber-500/50">
                        <Sparkles className="w-3 h-3" /> Founder Badge
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {getPackageSubtitle(pkg.name)}
                  </p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-3xl font-bold">₦{pkg.price.toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-orange font-semibold">
                    {pkg.coins.toLocaleString()} coins = {getAdFreeDuration(pkg.coins)} ad-free
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ₦{Math.round((pkg.price / (pkg.coins / 1000)))}/month
                  </p>
                </div>
                <Button
                  onClick={() => handlePurchase(pkg.id, pkg.name, pkg.coins)}
                  disabled={purchasing}
                  className={`w-full ${
                    pkg.popular
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  } ${
                    pkg.name === 'Ultimate'
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg shadow-amber-500/30"
                      : ""
                  } py-6 text-base font-medium`}
                >
                  {purchasing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Get {pkg.name}
                    </>
                  )}
                </Button>
                
                {pkg.name === 'Ultimate' && (
                  <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-500 mb-1">
                          Exclusive Founder Badge
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Get a special Founder badge displayed on your profile to show you're an early supporter of PDF-Orange!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-muted/50 border border-border rounded-lg p-3 mt-4 text-center">
          <p className="text-sm font-medium mb-1">
            You can always earn coins for <span className="text-orange font-bold">FREE</span> by watching ads.
          </p>
          <p className="text-xs text-muted-foreground">
            Buying just speeds it up!
          </p>
        </div>
        
        <div className="text-xs text-muted-foreground text-center mt-2">
          This is a demo purchase. In production, this would integrate with a payment processor.
        </div>
      </DialogContent>
    </Dialog>
  );
};