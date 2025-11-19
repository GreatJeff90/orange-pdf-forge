import { useState, useEffect } from 'react';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

// Test ad unit IDs for development
const TEST_IDS = {
  rewarded: {
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
  },
  banner: {
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
  },
};

export function useAdMob() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAdMob = async () => {
      if (!Capacitor.isNativePlatform()) {
        setIsNative(false);
        setIsInitialized(true);
        return;
      }

      try {
        setIsNative(true);
        await AdMob.initialize({
          testingDevices: ['YOUR_DEVICE_ID'], // Replace with actual test device IDs
          initializeForTesting: true, // Set to false in production
        });
        setIsInitialized(true);
        console.log('AdMob initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AdMob:', error);
        setIsInitialized(false);
      }
    };

    initializeAdMob();
  }, []);

  const showRewardedAd = async (onRewarded: (reward: AdMobRewardItem) => void) => {
    if (!isNative) {
      // For web preview, simulate ad reward
      toast({
        title: 'Demo Mode',
        description: 'In the native app, you would watch a video ad here. Simulating reward...',
      });
      setTimeout(() => {
        onRewarded({ type: 'coin', amount: 1 });
      }, 2000);
      return;
    }

    try {
      const platform = Capacitor.getPlatform();
      const adUnitId = platform === 'android' 
        ? TEST_IDS.rewarded.android 
        : TEST_IDS.rewarded.ios;

      await AdMob.prepareRewardVideoAd({
        adId: adUnitId,
      });

      const result = await AdMob.showRewardVideoAd();
      
      if (result && result.type && result.amount) {
        onRewarded(result as AdMobRewardItem);
      }
    } catch (error: any) {
      console.error('Failed to show rewarded ad:', error);
      toast({
        title: 'Ad unavailable',
        description: 'Unable to load ad at this time. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const showBannerAd = async () => {
    if (!isNative) {
      console.log('Banner ads only available in native app');
      return;
    }

    try {
      const platform = Capacitor.getPlatform();
      const adUnitId = platform === 'android' 
        ? TEST_IDS.banner.android 
        : TEST_IDS.banner.ios;

      const options: BannerAdOptions = {
        adId: adUnitId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      };

      await AdMob.showBanner(options);
    } catch (error) {
      console.error('Failed to show banner ad:', error);
    }
  };

  const hideBannerAd = async () => {
    if (!isNative) return;

    try {
      await AdMob.hideBanner();
    } catch (error) {
      console.error('Failed to hide banner ad:', error);
    }
  };

  const removeBannerAd = async () => {
    if (!isNative) return;

    try {
      await AdMob.removeBanner();
    } catch (error) {
      console.error('Failed to remove banner ad:', error);
    }
  };

  return {
    isInitialized,
    isNative,
    showRewardedAd,
    showBannerAd,
    hideBannerAd,
    removeBannerAd,
  };
}
