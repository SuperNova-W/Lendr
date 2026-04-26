import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { CalendarDays, Send } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { AppButton } from "../../components/AppButton";
import { AvailabilityDot } from "../../components/AvailabilityDot";
import { Screen } from "../../components/Screen";
import { colors, font, radii } from "../../constants/theme";
import { demoItems } from "../../data/demo";
import { apiBaseUrl, createBorrowRequest } from "../../lib/api";
import type { LendItem } from "../../types";

function parseItem(raw: unknown, id: string): LendItem | undefined {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as LendItem;
    } catch {
      return undefined;
    }
  }

  return demoItems.find((item) => item.id === id);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(date);
}

export default function ItemDetailScreen() {
  const params = useLocalSearchParams<{ id: string; item?: string }>();
  const item = useMemo(() => parseItem(params.item, params.id), [params.id, params.item]);
  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [picker, setPicker] = useState<"start" | "end" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.title}>Item not found</Text>
        </View>
      </Screen>
    );
  }

  const durationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)));
  const totalCost = durationDays * (item.pricePerDay || 0);

  async function requestBorrow() {
    if (!item) {
      return;
    }

    if (durationDays < 1) {
      setError("Choose an end date after the start date.");
      return;
    }

    if (durationDays > item.maxBorrowDays) {
      setError(`This item can be borrowed for ${item.maxBorrowDays} days max.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const request = apiBaseUrl
        ? await createBorrowRequest({
            itemId: item.id,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          })
        : {
            id: `demo-${item.id}`,
            itemId: item.id,
            itemName: item.name,
            itemPhotoUrl: item.photoUrl,
            borrowerName: "You",
            ownerName: item.owner.firstName,
            status: "pending" as const,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            createdAt: new Date().toISOString()
          };

      router.replace({
        pathname: "/request/[id]",
        params: {
          id: request.id,
          itemName: request.itemName,
          itemPhotoUrl: request.itemPhotoUrl,
          status: request.status
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: item.photoUrl }} style={styles.hero} />
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.title}>{item.name}</Text>
            </View>
            <AvailabilityDot available={item.available} />
          </View>

          <Text style={styles.meta}>
            {item.distanceMiles.toFixed(1)} mi away · Owned by {item.owner.firstName}
          </Text>

          <View style={styles.infoPanel}>
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.infoLabel}>Borrow window</Text>
                <Text style={styles.infoValue}>{item.lendWindowLabel ?? `${item.maxBorrowDays} days max`}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.infoLabel}>Price</Text>
                <Text style={styles.infoValue}>{item.pricePerDay > 0 ? `$${item.pricePerDay}/day` : "Free"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Pressable onPress={() => setPicker("start")} style={styles.dateButton}>
              <CalendarDays color={colors.accent} width={19} height={19} />
              <View>
                <Text style={styles.dateLabel}>Start</Text>
                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => setPicker("end")} style={styles.dateButton}>
              <CalendarDays color={colors.accent} width={19} height={19} />
              <View>
                <Text style={styles.dateLabel}>Return</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
              </View>
            </Pressable>
          </View>

          {picker ? (
            <DateTimePicker
              value={picker === "start" ? startDate : endDate}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              minimumDate={new Date()}
              onChange={(_, selectedDate) => {
                if (Platform.OS !== "ios") {
                  setPicker(null);
                }

                if (!selectedDate) {
                  return;
                }

                if (picker === "start") {
                  setStartDate(selectedDate);

                  if (selectedDate >= endDate) {
                    setEndDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
                  }
                } else {
                  setEndDate(selectedDate);
                }
              }}
            />
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Cost</Text>
            <Text style={styles.totalValue}>{item.pricePerDay > 0 ? `$${totalCost}` : "Free"}</Text>
          </View>

          <AppButton icon={Send} loading={submitting} disabled={!item.available} onPress={requestBorrow}>
            Request to Borrow
          </AppButton>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    height: 380,
    backgroundColor: colors.surfaceSoft
  },
  content: {
    padding: 20,
    gap: 18
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14
  },
  titleCopy: {
    flex: 1
  },
  category: {
    color: colors.accent,
    fontFamily: font.bold,
    fontSize: 13,
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontFamily: font.extraBold,
    fontSize: 30,
    marginTop: 4
  },
  meta: {
    color: colors.textMuted,
    fontFamily: font.medium,
    fontSize: 15
  },
  infoPanel: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 4
  },
  infoLabel: {
    color: colors.textMuted,
    fontFamily: font.medium,
    fontSize: 13
  },
  infoValue: {
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 17
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  priceContainer: {
    alignItems: "flex-end"
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.border
  },
  totalLabel: {
    color: colors.text,
    fontFamily: font.semibold,
    fontSize: 18
  },
  totalValue: {
    color: colors.text,
    fontFamily: font.extraBold,
    fontSize: 22
  },
  dateRow: {
    flexDirection: "row",
    gap: 12
  },
  dateButton: {
    flex: 1,
    minHeight: 72,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  dateLabel: {
    color: colors.textMuted,
    fontFamily: font.medium,
    fontSize: 12
  },
  dateValue: {
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 16
  },
  error: {
    color: colors.danger,
    fontFamily: font.semibold,
    fontSize: 13
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
