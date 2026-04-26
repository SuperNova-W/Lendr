import { Image, StyleSheet, Text, View } from "react-native";
import { Check, X } from "lucide-react-native";

import { colors, font, radii } from "../constants/theme";
import type { BorrowRequest } from "../types";
import { AppButton } from "./AppButton";

type RequestCardProps = {
  request: BorrowRequest;
  ownerMode?: boolean;
  onApprove?: () => void;
  onDecline?: () => void;
  onReturn?: () => void;
};

export function RequestCard({
  request,
  ownerMode,
  onApprove,
  onDecline,
  onReturn
}: RequestCardProps) {
  const statusColor =
    request.status === "approved"
      ? colors.green
      : request.status === "declined"
        ? colors.danger
        : request.status === "returned"
          ? colors.blue
          : colors.warning;

  return (
    <View style={styles.card}>
      <Image source={{ uri: request.itemPhotoUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {request.itemName}
          </Text>
          <View style={[styles.badge, { borderColor: statusColor }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{request.status}</Text>
          </View>
        </View>
        <Text style={styles.meta} numberOfLines={2}>
          {ownerMode
            ? `${request.borrowerName} wants to borrow it`
            : `${request.ownerName ?? "Owner"} is lending this to you`}
        </Text>
        {ownerMode && request.status === "pending" ? (
          <View style={styles.actions}>
            <AppButton variant="secondary" icon={X} onPress={onDecline}>
              Decline
            </AppButton>
            <AppButton icon={Check} onPress={onApprove}>
              Approve
            </AppButton>
          </View>
        ) : null}
        {!ownerMode && request.status === "approved" ? (
          <AppButton variant="secondary" onPress={onReturn}>
            Mark as Returned
          </AppButton>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 16
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: colors.surfaceSoft
  },
  content: {
    padding: 14,
    gap: 12
  },
  titleRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  title: {
    flex: 1,
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 17
  },
  badge: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    height: 28,
    justifyContent: "center"
  },
  badgeText: {
    fontFamily: font.bold,
    fontSize: 12,
    textTransform: "capitalize"
  },
  meta: {
    color: colors.textMuted,
    fontFamily: font.regular,
    fontSize: 14
  },
  actions: {
    flexDirection: "row",
    gap: 10
  }
});
