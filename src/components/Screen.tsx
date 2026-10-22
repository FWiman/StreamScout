import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";
import { Footer } from "./Footer";

interface Props {
  children: ReactNode;
  /** Shown full width at the top, above the page content. */
  hero?: ReactNode;
}

/** Shared scrollable page background with the footer at the bottom. */
export function Screen({ children, hero }: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, !hero && styles.padTop]}
      showsVerticalScrollIndicator={false}
    >
      {hero}
      <View style={styles.inner}>{children}</View>
      <Footer />
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
  },
  padTop: {
    paddingTop: spacing.md,
  },
  // Full width: rows run edge to edge and align themselves with useGutter().
  inner: {
    width: "100%",
    gap: spacing.xl,
  },
});
