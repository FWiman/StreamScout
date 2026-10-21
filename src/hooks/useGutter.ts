import { useWindowDimensions } from "react-native";
import { MAX_CONTENT_WIDTH, spacing } from "@/theme";

/**
 * Sidomarginal som linjerar innehåll med den centrerade spalten (MAX_CONTENT_WIDTH).
 * Används av element som går kant i kant – t.ex. rader med affischer – så att rubriken
 * och första kortet hamnar i linje med resten av sidan medan raden fortsätter ut till kanten.
 */
export function useGutter() {
  const { width } = useWindowDimensions();
  return Math.max(spacing.md, (width - MAX_CONTENT_WIDTH) / 2 + spacing.md);
}
