import { StyleSheet, View } from "react-native";

import { colors } from "../constants/theme";

type AvailabilityDotProps = {
  available: boolean;
};

export function AvailabilityDot({ available }: AvailabilityDotProps) {
  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor: available ? colors.green : colors.greyDot
        }
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5
  }
});
