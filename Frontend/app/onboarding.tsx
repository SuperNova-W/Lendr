import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { LogIn, MapPin } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, ImageBackground, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { colors, font, radii } from "../constants/theme";
import { apiBaseUrl, googleSignIn, updateUserLocation } from "../lib/api";
import { defaultLocation, requestCurrentLocation } from "../lib/location";
import { registerForPushNotifications } from "../lib/notifications";
import { saveSession } from "../lib/session";
import type { RadiusMiles } from "../types";

WebBrowser.maybeCompleteAuthSession();

const radiusOptions: RadiusMiles[] = [0.5, 1, 2];
const extra = Constants.expoConfig?.extra ?? {};
const legacyGoogleClientId = extra.googleClientId as string | undefined;
const googleWebClientId = (extra.googleWebClientId as string | undefined) ?? legacyGoogleClientId;
const googleIosClientId = extra.googleIosClientId as string | undefined;
const googleAndroidClientId = extra.googleAndroidClientId as string | undefined;
const platformGoogleClientId =
  Platform.select({
    ios: googleIosClientId,
    android: googleAndroidClientId,
    default: googleWebClientId
  }) ?? undefined;
const googleClientIds = {
  clientId: platformGoogleClientId ?? "",
  webClientId: googleWebClientId,
  iosClientId: googleIosClientId,
  androidClientId: googleAndroidClientId
};

export default function OnboardingScreen() {
  const [radius, setRadius] = useState<RadiusMiles>(1);
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    ...googleClientIds,
    selectAccount: true
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === "success") {
      const idToken = response.params.id_token ?? response.authentication?.idToken;
      if (idToken) {
        completeGoogleSignIn(idToken);
      } else {
        Alert.alert("Sign-in error", "Google did not return an ID token.");
        setLoading(false);
      }
    } else if (response.type === "error") {
      Alert.alert("Sign-in error", response.error?.message ?? "Google sign-in failed.");
      setLoading(false);
    } else if (response.type === "dismiss") {
      setLoading(false);
    }
  }, [response]);

  async function completeGoogleSignIn(idToken: string) {
    try {
      let location = null;

      // Skip location request on web platform
      if (Platform.OS !== "web") {
        location = await requestCurrentLocation();
      }

      const session = await googleSignIn(idToken);

      await saveSession({
        ...session,
        radiusMiles: radius,
        location: location ?? defaultLocation,
      });

      if (location) {
        await updateUserLocation({
          lat: location.latitude,
          lng: location.longitude,
          radius_miles: radius,
        });
      }

      await registerForPushNotifications();
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Sign-in failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    setLoading(true);

    if (!apiBaseUrl || !platformGoogleClientId) {
      const clientIdLabel = Platform.select({
        ios: "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
        android: "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID",
        default: "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"
      });
      Alert.alert(
        "Google sign-in is not configured",
        `Set EXPO_PUBLIC_API_BASE_URL and ${clientIdLabel} before signing in.`
      );
      setLoading(false);
      return;
    }

    await promptAsync();
    // loading cleared in useEffect response handler
  }

  return (
    <View style={styles.screen}>
      <ImageBackground
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={require("../assets/mckeldin.avif")}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>L</Text>
          </View>
          <Text style={styles.title}>Lendr</Text>
          <Text style={styles.subtitle}>Borrow from fellow Terps in your neighborhood.</Text>
        </View>
      </ImageBackground>

      <View style={styles.panel}>
        <View style={styles.rowHeader}>
          <MapPin color={colors.accent} width={21} height={21} strokeWidth={2.4} />
          <Text style={styles.sectionTitle}>Neighborhood Radius</Text>
        </View>
        <View style={styles.radiusRow}>
          {radiusOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => setRadius(option)}
              style={[styles.radiusPill, radius === option && styles.radiusPillSelected]}
            >
              <Text style={[styles.radiusText, radius === option && styles.radiusTextSelected]}>
                {option} mi
              </Text>
            </Pressable>
          ))}
        </View>
        <AppButton icon={LogIn} loading={loading} disabled={!request} onPress={handleContinue}>
          Continue with Google
        </AppButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  hero: {
    flex: 1,
    minHeight: 460,
    justifyContent: "flex-end"
  },
  heroImage: {
    opacity: 0.72
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 46,
    backgroundColor: "rgba(8,10,13,0.38)"
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18
  },
  logoText: {
    color: colors.surface,
    fontFamily: font.extraBold,
    fontSize: 26
  },
  title: {
    color: "#FFFFFF",
    fontFamily: font.extraBold,
    fontSize: 48
  },
  subtitle: {
    color: "#FFFFFF",
    fontFamily: font.medium,
    fontSize: 18,
    marginTop: 8,
    lineHeight: 26,
    maxWidth: 310
  },
  panel: {
    padding: 20,
    paddingBottom: 30,
    gap: 18,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 16
  },
  radiusRow: {
    flexDirection: "row",
    gap: 10
  },
  radiusPill: {
    flex: 1,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  radiusPillSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  radiusText: {
    color: colors.textMuted,
    fontFamily: font.bold,
    fontSize: 15
  },
  radiusTextSelected: {
    color: colors.background
  }
});
