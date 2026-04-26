import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { colors, font, radii } from "../constants/theme";
import { requestCurrentLocation } from "../lib/location";
import { registerForPushNotifications } from "../lib/notifications";
import { createDemoSession } from "../lib/session";
import type { RadiusMiles } from "../types";

const radiusOptions: RadiusMiles[] = [0.5, 1, 2];

export default function OnboardingScreen() {
  const [radius, setRadius] = useState<RadiusMiles>(1);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    setLoading(true);

    try {
      const location = await requestCurrentLocation();
      await createDemoSession(radius, location ?? undefined);
      await registerForPushNotifications();
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
        }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>L</Text>
          </View>
          <Text style={styles.title}>Lend</Text>
          <Text style={styles.subtitle}>Borrow useful things from neighbors nearby.</Text>
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
        <AppButton loading={loading} onPress={handleContinue}>
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
    width: 54,
    height: 54,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18
  },
  logoText: {
    color: colors.background,
    fontFamily: font.extraBold,
    fontSize: 28
  },
  title: {
    color: colors.text,
    fontFamily: font.extraBold,
    fontSize: 48
  },
  subtitle: {
    color: colors.textMuted,
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
