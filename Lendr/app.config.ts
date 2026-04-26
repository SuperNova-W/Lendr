import type { ExpoConfig } from "expo/config";

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const config: ExpoConfig = {
  name: "Lend",
  slug: "lend",
  scheme: "lend",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  backgroundColor: "#F0FAFA",
  ios: {
    bundleIdentifier: "com.lend.app",
    supportsTablet: false
  },
  android: {
    package: "com.lend.app"
  },
  plugins: [
    "expo-router",
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Lend uses your location to show borrowable items near your neighborhood."
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "Lend needs photo access so you can list items with pictures.",
        cameraPermission: "Lend needs camera access so you can photograph items.",
        microphonePermission: false
      }
    ],
    "expo-notifications",
    [
      "react-native-maps",
      {
        androidGoogleMapsApiKey: googleMapsApiKey,
        iosGoogleMapsApiKey: googleMapsApiKey
      }
    ]
  ],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID
    }
  }
};

export default config;
