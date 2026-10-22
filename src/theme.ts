import { Platform, type TextStyle } from "react-native";

export const colors = {
  background: "#0b0d12",
  surface: "#161a22",
  surfaceRaised: "#1f2430",
  border: "#2a3040",
  text: "#f2f4f8",
  textMuted: "#9aa3b5",
  accent: "#e5484d",
  accentSoft: "rgba(229, 72, 77, 0.12)",
  success: "#3dd68c",
  successSoft: "rgba(61, 214, 140, 0.12)",
  rating: "#f5c451",
  overlay: "rgba(11, 13, 18, 0.85)",
  /** The background color, fully transparent – for gradients that fade into the background. */
  backgroundClear: "rgba(11, 13, 18, 0)",
  glass: "rgba(255, 255, 255, 0.16)",
  shadow: "#000000",
  /** Background for a highlighted/hovered row. */
  highlight: "rgba(255, 255, 255, 0.09)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/**
 * Removes the browser's focus outline on text fields (it is drawn as a square
 * rectangle even when the field has rounded corners). The field's own border shows focus instead.
 * `outlineStyle: "none"` is missing from React Native's types but works on the web.
 */
export const noFocusOutline = (Platform.OS === "web" ? { outlineStyle: "none" } : {}) as unknown as TextStyle;
