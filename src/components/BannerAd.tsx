import { useEffect } from 'react';
import { useAdMob } from '@/hooks/useAdMob';
import { useUserCoins } from '@/hooks/useCoins';

interface BannerAdProps {
  className?: string;
}

export const BannerAd = ({ className = '' }: BannerAdProps) => {
  const { showBannerAd, hideBannerAd, removeBannerAd, isNative } = useAdMob();
  const { data: coins } = useUserCoins();

  useEffect(() => {
    // Only show ads if user has less than 1000 coins (not ad-free)
    const shouldShowAd = coins !== undefined && coins < 1000;

    if (shouldShowAd && isNative) {
      showBannerAd();
    }

    return () => {
      if (isNative) {
        removeBannerAd();
      }
    };
  }, [coins, isNative, showBannerAd, removeBannerAd]);

  // For web preview, show a placeholder
  if (!isNative && coins !== undefined && coins < 1000) {
    return (
      <div className={`bg-muted border border-border rounded-lg p-4 text-center ${className}`}>
        <p className="text-xs text-muted-foreground">
          📱 Banner Ad (Visible in native app)
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Purchase coins to remove ads
        </p>
      </div>
    );
  }

  // Native app handles banner positioning automatically
  return null;
};
