import { Pressable, StyleSheet, Text } from "react-native";

import { categoryColors, colors, font, radii } from "../constants/theme";
import type { CategoryFilter } from "../types";

type CategoryPillProps = {
  label: CategoryFilter;
  selected: boolean;
  onPress: () => void;
};

export function CategoryPill({ label, selected, onPress }: CategoryPillProps) {
  const accent = label === "All" ? colors.accent : categoryColors[label];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        selected && {
          backgroundColor: accent,
          borderColor: accent
        }
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 38,
    paddingHorizontal: 15,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center"
  },
  label: {
    color: colors.textMuted,
    fontFamily: font.semibold,
    fontSize: 13
  },
  selectedLabel: {
    color: colors.background
  }
});
