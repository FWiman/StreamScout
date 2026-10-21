import { Platform, type TextStyle } from "react-native";

export const colors = {
  background: "#0b0d12",
  surface: "#161a22",
  surfaceRaised: "#1f2430",
  border: "#2a3040",
  text: "#f2f4f8",
  textMuted: "#9aa3b5",
  accent: "#e5484d",
  rating: "#f5c451",
  overlay: "rgba(11, 13, 18, 0.85)",
  /** Bakgrundsfärgen helt genomskinlig – för gradienter som tonar ut mot bakgrunden. */
  backgroundClear: "rgba(11, 13, 18, 0)",
  glass: "rgba(255, 255, 255, 0.16)",
  shadow: "#000000",
  /** Bakgrund för markerad/hovrad rad. */
  highlight: "rgba(255, 255, 255, 0.09)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Maxbredd för innehåll på stora skärmar (webben). */
export const MAX_CONTENT_WIDTH = 1200;

/**
 * Tar bort webbläsarens fokusram på textfält (den ritas som en kantig rektangel
 * även när fältet har rundade hörn). Fältets egen kant visar fokus i stället.
 * `outlineStyle: "none"` finns inte i React Natives typer men stöds på webben.
 */
export const noFocusOutline = (Platform.OS === "web" ? { outlineStyle: "none" } : {}) as unknown as TextStyle;
