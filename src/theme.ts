import { Platform, type TextStyle } from "react-native";

export const colors = {
  // Palette inspired by the Matrix poster: green-tinted blacks and a muted phosphor green.
  background: "#090d0b",
  surface: "#121915",
  surfaceRaised: "#1a231e",
  border: "#26332b",
  text: "#eef4f0",
  textMuted: "#93a39a",
  /** Brand color: buttons, active tabs, focus rings, avatar. */
  accent: "#5cb879",
  accentSoft: "rgba(92, 184, 121, 0.14)",
  /** Lighter brand color for text on dark backgrounds. */
  accentText: "#8fd6a3",
  /** Text and icons on top of `accent`. */
  onAccent: "#06150c",
  /** Errors and warnings – kept red so they don't look like brand elements. */
  danger: "#e5484d",
  dangerSoft: "rgba(229, 72, 77, 0.12)",
  success: "#3dd68c",
  successSoft: "rgba(61, 214, 140, 0.12)",
  rating: "#f5c451",
  overlay: "rgba(9, 13, 11, 0.85)",
  /** The background color, fully transparent – for gradients that fade into the background. */
  backgroundClear: "rgba(9, 13, 11, 0)",
  glass: "rgba(255, 255, 255, 0.16)",
  shadow: "#000000",
  /** Light button background (e.g. "Continue with Apple", per Apple's guidelines). */
  light: "#ffffff",
  /** Text/icon color on the light background. */
  onLight: "#000000",
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
