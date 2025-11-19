import { useEffect } from 'react';
import { useAdMob } from '@/hooks/useAdMob';
import { useUserCoins } from '@/hooks/useCoins';

interface BannerAdProps {
  className?: string;
}

export const BannerAd = ({ className = '' }: BannerAdProps) => {
  const { showBannerAd, hideBannerAd, removeBannerAd, isNative } = useAdMob();
  const { data: userCoins } = useUserCoins();

  useEffect(() => {
    // Only show ads if user is not ad-free (based on ad_free_until timestamp)
    const shouldShowAd = userCoins !== undefined && !userCoins.isAdFree;

    if (shouldShowAd && isNative) {
      showBannerAd();
    }

    return () => {
      if (isNative) {
        removeBannerAd();
      }
    };
  }, [userCoins, isNative, showBannerAd, removeBannerAd]);

  // For web preview, show a placeholder
  if (!isNative && userCoins !== undefined && !userCoins.isAdFree) {
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
