import { useWindowDimensions } from "react-native";
import { spacing } from "@/theme";

/** Largest side margin, on really wide screens. */
const MAX_GUTTER = 64;

/**
 * The side margin for the whole app. Everything – top nav, hero, rows and footer –
 * starts at the same left margin, which grows a little with the screen (4% of the width),
 * like on Netflix. Poster rows then run edge to edge to the right.
 */
export function useGutter() {
  const { width } = useWindowDimensions();
  return Math.round(Math.min(MAX_GUTTER, Math.max(spacing.md, width * 0.04)));
}
