import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a18548294e374563a072f8a6711a1baf',
  appName: 'orange-pdf-forge',
  webDir: 'dist',
  server: {
    url: 'https://a1854829-4e37-4563-a072-f8a6711a1baf.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    AdMob: {
      // Test IDs will be replaced with real IDs from secrets
      appIdAndroid: 'ca-app-pub-3940256099942544~3347511713',
      appIdIos: 'ca-app-pub-3940256099942544~1458002511',
    },
  },
};

export default config;
