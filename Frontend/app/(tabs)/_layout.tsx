import { Tabs, router } from "expo-router";
import { Bell, Home, UserRound } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors, font } from "../../constants/theme";
import { apiBaseUrl } from "../../lib/api";
import { getSession, hasGoogleAuth } from "../../lib/session";

export default function TabLayout() {
  const [authorized, setAuthorized] = useState<boolean | null>(apiBaseUrl ? null : true);

  useEffect(() => {
    if (!apiBaseUrl) {
      return;
    }

    let mounted = true;
    getSession()
      .then((session) => {
        if (mounted) {
          setAuthorized(hasGoogleAuth(session));
        }
      })
      .catch(() => {
        if (mounted) {
          setAuthorized(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (authorized === false) {
      router.replace("/onboarding");
    }
  }, [authorized]);

  if (authorized === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!authorized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 78,
          paddingBottom: 16,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontFamily: font.semibold,
          fontSize: 12
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Nearby",
          tabBarIcon: ({ color }) => <Home color={color} width={22} height={22} />
        }}
      />
      <Tabs.Screen
        name="my-stuff"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <UserRound color={color} width={22} height={22} />
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color }) => <Bell color={color} width={22} height={22} />
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  }
});
