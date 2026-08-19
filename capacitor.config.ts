import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.msmud.game',
  appName: '我是帮帮帮传说',
  webDir: 'www',
  server: {
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;
