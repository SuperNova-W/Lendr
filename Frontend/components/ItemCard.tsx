import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

import { categoryColors, colors, font, radii } from "../constants/theme";
import type { LendItem } from "../types";
import { AvailabilityDot } from "./AvailabilityDot";

type ItemCardProps = {
  item: LendItem;
  onPress: () => void;
};

export function ItemCard({ item, onPress }: ItemCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <ImageBackground source={{ uri: item.photoUrl }} style={styles.photo} imageStyle={styles.image}>
        <View style={styles.categoryBadge}>
          <Text style={[styles.category, { color: categoryColors[item.category] }]}>
            {item.category}
          </Text>
        </View>
      </ImageBackground>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {item.pricePerDay > 0 ? `$${item.pricePerDay}/day` : "Free"}
            </Text>
            <AvailabilityDot available={item.available} />
          </View>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {item.distanceMiles.toFixed(1)} mi away · {item.owner.firstName} ·{" "}
          {item.available ? "Available" : "Unavailable"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  pressed: {
    opacity: 0.85
  },
  photo: {
    height: 220,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: colors.surfaceSoft
  },
  image: {
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md
  },
  categoryBadge: {
    margin: 12,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: "rgba(8,10,13,0.78)",
    justifyContent: "center"
  },
  category: {
    fontFamily: font.bold,
    fontSize: 12
  },
  body: {
    padding: 14,
    gap: 6
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  name: {
    flex: 1,
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 18
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  price: {
    color: colors.accent,
    fontFamily: font.bold,
    fontSize: 16
  },
  meta: {
    color: colors.textMuted,
    fontFamily: font.regular,
    fontSize: 13
  }
});
