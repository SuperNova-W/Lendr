import { StyleSheet, Text, View } from "react-native";

import { colors, font, radii } from "../constants/theme";
import type { Coordinates, LendItem } from "../types";

type Props = {
  location: Coordinates;
  radiusMiles: number;
  items: LendItem[];
  onItemPress: (item: LendItem) => void;
};

export function NearbyMap(_props: Props) {
  return (
    <View style={styles.fallback}>
      <Text style={styles.text}>Map view runs on iOS and Android.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    minHeight: 420,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    color: colors.textMuted,
    fontFamily: font.semibold,
    fontSize: 15
  }
});
