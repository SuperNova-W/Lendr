import type { Category } from "../types";

export const colors = {
  background: "#F9F1EE",
  surface: "#FFFFFF",
  surfaceRaised: "#F4E3E1",
  surfaceSoft: "#FBE8E6",
  text: "#111111",
  textMuted: "#5F4A44",
  textDim: "#9F7D75",
  border: "#DDC2BF",
  accent: "#B31B1B",
  accentSoft: "#F6D3D2",
  blue: "#4A4A4A",
  green: "#FFC72C",
  greyDot: "#A18F8C",
  danger: "#8B1B1B",
  warning: "#D79C2F"
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
  Tools: "#B31B1B",
  Kitchen: "#FFC72C",
  Outdoor: "#4A4A4A",
  Misc: "#7D675F"
};
