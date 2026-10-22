import { useWindowDimensions } from "react-native";
import { spacing } from "@/theme";
import { useGutter } from "./useGutter";
import { useIsWide } from "./useIsWide";

/** Columns and card width for poster grids that fill the width between the gutters. */
export function useGridLayout() {
  const isWide = useIsWide();
  const gutter = useGutter();
  const { width } = useWindowDimensions();

  const contentWidth = width - gutter * 2;
  const minCard = isWide ? 160 : 100;
  const columns = Math.max(3, Math.floor((contentWidth + spacing.md) / (minCard + spacing.md)));
  const cardWidth = Math.floor((contentWidth - spacing.md * (columns - 1)) / columns);
  return { gutter, columns, cardWidth };
}
