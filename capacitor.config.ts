export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime: boolean;
  server?: {
    androidScheme?: string;
    iosScheme?: string;
  };
  plugins?: {
    SplashScreen?: {
      launchShowDuration?: number;
      backgroundColor?: string;
    };
  };
}

const config: CapacitorConfig = {
  appId: 'com.apexmira.ivoyager',
  appName: 'iVoyager',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'ionic'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0F172A'
    }
  }
};

export default config;
