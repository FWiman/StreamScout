import { Platform, type TextStyle } from "react-native";

export const colors = {
  // "Velvet Lens": red-velvet cinema darks and a warm ember coral.
  background: "#140e10",
  surface: "#21171a",
  surfaceRaised: "#2b1f23",
  border: "#3b2a2f",
  text: "#f7ece8",
  textMuted: "#b59e9f",
  /** Brand color: buttons, active tabs, focus rings, avatar. */
  accent: "#e3784e",
  accentSoft: "rgba(227, 120, 78, 0.14)",
  /** Lighter brand color for text on dark backgrounds. */
  accentText: "#ec8c66",
  /** Text and icons on top of `accent`. */
  onAccent: "#220c04",
  /** Errors and warnings – kept red so they don't look like brand elements. */
  danger: "#e5484d",
  dangerSoft: "rgba(229, 72, 77, 0.12)",
  success: "#3dd68c",
  successSoft: "rgba(61, 214, 140, 0.12)",
  rating: "#f5c451",
  overlay: "rgba(20, 14, 16, 0.85)",
  /** The background color, fully transparent – for gradients that fade into the background. */
  backgroundClear: "rgba(20, 14, 16, 0)",
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
