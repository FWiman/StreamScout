import { useWindowDimensions } from "react-native";
import { spacing } from "@/theme";

/** Största sidomarginal på riktigt breda skärmar. */
const MAX_GUTTER = 64;

/**
 * Sidomarginalen för hela appen. Allt – toppmeny, toppsektion, rader och sidfot –
 * börjar vid samma vänstermarginal, som växer lite med skärmen (4 % av bredden),
 * som hos Netflix. Rader med affischer går sedan kant i kant åt höger.
 */
export function useGutter() {
  const { width } = useWindowDimensions();
  return Math.round(Math.min(MAX_GUTTER, Math.max(spacing.md, width * 0.04)));
}
