import { router, useLocalSearchParams } from "expo-router";
import { Clock3 } from "lucide-react-native";
import { Image, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../../components/AppButton";
import { Screen } from "../../components/Screen";
import { colors, font, radii } from "../../constants/theme";

export default function PendingRequestScreen() {
  const params = useLocalSearchParams<{
    id: string;
    itemName?: string;
    itemPhotoUrl?: string;
    status?: string;
  }>();

  return (
    <Screen>
      <View style={styles.container}>
        {params.itemPhotoUrl ? <Image source={{ uri: params.itemPhotoUrl }} style={styles.image} /> : null}
        <View style={styles.statusIcon}>
          <Clock3 color={colors.background} width={30} height={30} strokeWidth={2.5} />
        </View>
        <Text style={styles.title}>{params.status ?? "Pending"}</Text>
        <Text style={styles.copy}>
          Your request for {params.itemName ?? "this item"} is waiting for the owner to respond.
        </Text>
      </View>
      <View style={styles.actions}>
        <AppButton onPress={() => router.replace("/(tabs)")}>Back to Nearby</AppButton>
        <AppButton variant="secondary" onPress={() => router.replace("/(tabs)/requests")}>
          View Requests
        </AppButton>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16
  },
  image: {
    width: "100%",
    height: 230,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSoft,
    marginBottom: 8
  },
  statusIcon: {
    width: 70,
    height: 70,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent
  },
  title: {
    color: colors.text,
    fontFamily: font.extraBold,
    fontSize: 32,
    textTransform: "capitalize"
  },
  copy: {
    color: colors.textMuted,
    fontFamily: font.medium,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 330
  },
  actions: {
    paddingBottom: 22,
    gap: 12
  }
});
