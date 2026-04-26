import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "../../components/AppButton";
import { Screen } from "../../components/Screen";
import { colors, font, radii } from "../../constants/theme";
import { apiBaseUrl, updateBorrowRequestStatus } from "../../lib/api";

export default function ReturnScreen() {
  const params = useLocalSearchParams<{ id: string; itemName?: string }>();
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function markReturned(nextRating: "up" | "down") {
    setRating(nextRating);
    setSubmitting(true);

    try {
      if (apiBaseUrl) {
        await updateBorrowRequestStatus(params.id, "returned");
      }
    } catch {
      Alert.alert("Return not saved", "The backend did not confirm the returned status.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.icon}>
          <CheckCircle2 color={colors.background} width={34} height={34} />
        </View>
        <Text style={styles.title}>Mark as Returned</Text>
        <Text style={styles.copy}>
          Finish the loop for {params.itemName ?? "this item"} and leave a quick rating.
        </Text>

        <View style={styles.ratingRow}>
          <Pressable
            onPress={() => markReturned("up")}
            style={[styles.ratingButton, rating === "up" && styles.ratingSelected]}
          >
            <Text style={styles.ratingText}>👍</Text>
          </Pressable>
          <Pressable
            onPress={() => markReturned("down")}
            style={[styles.ratingButton, rating === "down" && styles.ratingSelected]}
          >
            <Text style={styles.ratingText}>👎</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.actions}>
        <AppButton loading={submitting} disabled={!rating} onPress={() => router.replace("/(tabs)/requests")}>
          Done
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
  icon: {
    width: 74,
    height: 74,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.green
  },
  title: {
    color: colors.text,
    fontFamily: font.extraBold,
    fontSize: 30,
    textAlign: "center"
  },
  copy: {
    color: colors.textMuted,
    fontFamily: font.medium,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 320
  },
  ratingRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10
  },
  ratingButton: {
    width: 104,
    height: 88,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  ratingSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft
  },
  ratingText: {
    fontSize: 36
  },
  actions: {
    paddingBottom: 22
  }
});
