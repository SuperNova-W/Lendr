import type { Category } from "../types";

export const colors = {
  background: "#F0FAFA",
  surface: "#FFFFFF",
  surfaceRaised: "#E4F5F5",
  surfaceSoft: "#D4EEEE",
  text: "#0D2626",
  textMuted: "#32908F",
  textDim: "#6AACAC",
  border: "#B8DEDE",
  accent: "#32908F",
  accentSoft: "#D4EEEE",
  blue: "#A3E7FC",
  green: "#26C485",
  greyDot: "#8ABDBD",
  danger: "#C44870",
  warning: "#D4813A"
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 44
};

export const radii = {
  sm: 6,
  md: 8,
  lg: 14,
  pill: 999
};

export const font = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold"
};

export const categoryColors: Record<Category, string> = {
  Tools: "#32908F",
  Kitchen: "#A3E7FC",
  Outdoor: "#26C485",
  Misc: "#A37080"
};
