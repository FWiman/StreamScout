import { Platform, useWindowDimensions } from "react-native";

/** Från den här bredden visas datorlayouten (toppmeny i stället för flikar). */
export const WIDE_BREAKPOINT = 900;

/** True på webben när fönstret är brett nog för datorlayouten. */
export function useIsWide() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= WIDE_BREAKPOINT;
}
