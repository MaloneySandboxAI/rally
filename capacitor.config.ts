/// <reference types="@capacitor/cli" />

/**
 * Capacitor configuration for Rally iOS app
 *
 * Setup steps:
 * 1. npm install @capacitor/core @capacitor/cli @capacitor/ios
 * 2. npm install @capacitor/haptics @capacitor/status-bar @capacitor/splash-screen
 * 3. npx cap add ios
 * 4. npx cap sync
 * 5. npx cap open ios (opens Xcode)
 *
 * For development, the `server.url` points to the live site.
 * For production builds, remove `server.url` and use `webDir: "out"`
 * with `next export` to bundle the app locally.
 */

const config = {
  appId: "com.rallyplaylive.app",
  appName: "Rally",
  webDir: "out",
  server: {
    url: "https://www.rallyplaylive.com",
    cleartext: false,
  },
  ios: {
    scheme: "Rally",
    contentInset: "automatic",
    backgroundColor: "#021f3d",
    preferredContentMode: "mobile" as const,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#021f3d",
      showSpinner: false,
    },
    StatusBar: {
      style: "LIGHT" as const,
      backgroundColor: "#021f3d",
    },
  },
}

export default config
