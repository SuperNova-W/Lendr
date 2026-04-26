import { Tabs } from "expo-router";
import { Bell, Home, Package } from "lucide-react-native";

import { colors, font } from "../../constants/theme";

export default function TabLayout() {
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
          title: "My Stuff",
          tabBarIcon: ({ color }) => <Package color={color} width={22} height={22} />
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
