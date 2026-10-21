import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { colors, MAX_CONTENT_WIDTH, spacing } from "@/theme";

/** Gemensam scrollbar sidbakgrund som centrerar innehållet på breda skärmar. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  inner: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    gap: spacing.xl,
  },
});
