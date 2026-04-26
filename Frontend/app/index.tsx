import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "../constants/theme";
import { apiBaseUrl, getCurrentUser } from "../lib/api";
import { clearSession, getSession, hasGoogleAuth, saveSession } from "../lib/session";

export default function IndexRoute() {
  const [target, setTarget] = useState<"/(tabs)" | "/onboarding" | null>(null);

  useEffect(() => {
    async function resolveTarget() {
      try {
        const session = await getSession();

        if (!apiBaseUrl) {
          setTarget(session ? "/(tabs)" : "/onboarding");
          return;
        }

        if (!session || !hasGoogleAuth(session)) {
          setTarget("/onboarding");
          return;
        }

        const currentUser = await getCurrentUser();
        await saveSession({
          ...session,
          ...currentUser,
          location: session?.location,
          expoPushToken: session?.expoPushToken
        });
        setTarget("/(tabs)");
      } catch {
        await clearSession();
        setTarget("/onboarding");
      }
    }

    resolveTarget();
  }, []);

  if (!target) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return <Redirect href={target} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  }
});
