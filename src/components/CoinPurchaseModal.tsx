import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCoinPackages, useAddCoins } from "@/hooks/useCoins";
import { useToast } from "@/hooks/use-toast";
import { Coins, Check, Loader2 } from "lucide-react";
import { useState } from "react";

interface CoinPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoinPurchaseModal = ({ isOpen, onClose }: CoinPurchaseModalProps) => {
  const { data: packages, isLoading } = useCoinPackages();
  const { addCoins } = useAddCoins();
  const { toast } = useToast();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (packageId: string, packageName: string) => {
    setPurchasing(true);
    try {
      await addCoins(packageId);
      toast({
        title: "Coins added!",
        description: `Successfully purchased ${packageName} package`,
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
      <DialogContent className="glass-effect border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Coins className="w-5 h-5 text-orange" />
            Purchase Coins
          </DialogTitle>
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
                  pkg.popular ? "border-orange-500" : "border-transparent"
                }`}
              >
                {pkg.popular && (
                  <div className="flex justify-center mb-2">
                    <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{pkg.name}</h3>
                    <p className="text-2xl font-bold text-orange">
                      {pkg.coins.toLocaleString()}
                      <span className="text-sm text-muted-foreground ml-1">coins</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${pkg.price}</p>
                    <p className="text-xs text-muted-foreground">
                      ${(pkg.price / pkg.coins * 100).toFixed(2)}/100 coins
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handlePurchase(pkg.id, pkg.name)}
                  disabled={purchasing}
                  className={`w-full ${
                    pkg.popular
                      ? "gradient-orange"
                      : "bg-secondary hover:bg-secondary/80"
                  } py-6 text-base font-medium`}
                >
                  {purchasing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Purchase {pkg.name}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center mt-4">
          This is a demo purchase. In production, this would integrate with a payment processor.
        </div>
      </DialogContent>
    </Dialog>
  );
};