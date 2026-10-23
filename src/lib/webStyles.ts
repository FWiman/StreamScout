import { colors } from "@/theme";

/**
 * Global CSS rules for the web – things React Native styles can't reach.
 * Imported from the root layout. Does nothing on iOS/Android (see webStyles.native.ts).
 */
const css = `
  /* The page is dark: the browser's own controls (autofill menu, scrollbars etc.) become dark too. */
  :root { color-scheme: dark; }

  /* Chrome/Safari paint autofilled fields light. Keep our dark background and light text. */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px ${colors.background} inset !important;
    box-shadow: 0 0 0 1000px ${colors.background} inset !important;
    -webkit-text-fill-color: ${colors.text} !important;
    caret-color: ${colors.text};
    transition: background-color 99999s ease-out 0s;
  }

  /* Selected text in the app's colors. */
  ::selection { background: ${colors.accent}; color: ${colors.onAccent}; }
`;

if (typeof document !== "undefined" && !document.getElementById("streamscout-global-css")) {
  const style = document.createElement("style");
  style.id = "streamscout-global-css";
  style.textContent = css;
  document.head.appendChild(style);
}
