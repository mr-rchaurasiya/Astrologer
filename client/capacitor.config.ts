export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  server?: {
    androidScheme?: string;
    iosScheme?: string;
    cleartext?: boolean;
  };
  plugins?: {
    PushNotifications?: {
      presentationOptions: string[];
    };
    SplashScreen?: {
      launchShowDuration: number;
      backgroundColor: string;
    };
  };
}

const config: CapacitorConfig = {
  appId: 'com.astrologer.app',
  appName: 'Astrologer',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#07090E',
    },
  },
};

export default config;
