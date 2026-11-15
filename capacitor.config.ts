import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.helioboost.g99',
  appName: 'HelioBoost G99',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#090A0D',
    allowMixedContent: true,
  },
};

export default config;
