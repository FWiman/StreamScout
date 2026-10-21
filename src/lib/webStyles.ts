import { colors } from "@/theme";

/**
 * Globala CSS-regler för webben – saker som React Natives stilar inte når.
 * Importeras från rotlayouten. Gör ingenting på iOS/Android (se webStyles.native.ts).
 */
const css = `
  /* Sidan är mörk: webbläsarens egna kontroller (autofyll-menyn, rullningslister m.m.) blir mörka. */
  :root { color-scheme: dark; }

  /* Chrome/Safari målar autofyllda fält ljusa. Behåll vår mörka bakgrund och ljusa text. */
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

  /* Markerad text i appens färger. */
  ::selection { background: ${colors.accent}; color: ${colors.text}; }
`;

if (typeof document !== "undefined" && !document.getElementById("streamwatch-global-css")) {
  const style = document.createElement("style");
  style.id = "streamwatch-global-css";
  style.textContent = css;
  document.head.appendChild(style);
}
