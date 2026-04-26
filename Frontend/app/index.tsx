import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors } from "../constants/theme";
import { getSession } from "../lib/session";

export default function IndexRoute() {
  const [target, setTarget] = useState<"/(tabs)" | "/onboarding" | null>(null);

  useEffect(() => {
    getSession()
      .then((session) => setTarget(session ? "/(tabs)" : "/onboarding"))
      .catch(() => setTarget("/onboarding"));
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
