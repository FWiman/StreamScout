import { Platform, useWindowDimensions } from "react-native";

/** From this width the desktop layout is shown (top nav instead of tabs). */
export const WIDE_BREAKPOINT = 900;

/** True on the web when the window is wide enough for the desktop layout. */
export function useIsWide() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= WIDE_BREAKPOINT;
}
