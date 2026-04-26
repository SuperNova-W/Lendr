import type { ComponentType, ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";

import { colors, font, radii } from "../constants/theme";

type AppButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: ComponentType<SvgProps>;
};

export function AppButton({
  children,
  onPress,
  variant = "primary",
  disabled,
  loading,
  icon: Icon
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.background : colors.text} />
      ) : (
        <View style={styles.content}>
          {Icon ? (
            <Icon
              width={18}
              height={18}
              color={variant === "primary" ? colors.background : colors.text}
              strokeWidth={2.4}
            />
          ) : null}
          <Text style={[styles.label, variant === "primary" && styles.primaryLabel]}>
            {children}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  label: {
    color: colors.text,
    fontFamily: font.semibold,
    fontSize: 15
  },
  primaryLabel: {
    color: colors.background
  },
  primary: {
    backgroundColor: colors.accent
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border
  },
  ghost: {
    backgroundColor: "transparent"
  },
  danger: {
    backgroundColor: colors.danger
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }]
  },
  disabled: {
    opacity: 0.5
  }
});
