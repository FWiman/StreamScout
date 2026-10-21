import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { colors, MAX_CONTENT_WIDTH, spacing } from "@/theme";

interface Props {
  children: ReactNode;
  /** Visas i full bredd överst, ovanför det centrerade innehållet. */
  hero?: ReactNode;
}

/** Gemensam scrollbar sidbakgrund som centrerar innehållet på breda skärmar. */
export function Screen({ children, hero }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, !hero && styles.padTop]}>
      {hero}
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
    paddingBottom: spacing.xl,
  },
  padTop: {
    paddingTop: spacing.md,
  },
  inner: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    gap: spacing.xl,
  },
});
