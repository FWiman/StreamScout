import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";
import { Footer } from "./Footer";

interface Props {
  children: ReactNode;
  /** Visas i full bredd överst, ovanför det centrerade innehållet. */
  hero?: ReactNode;
}

/** Gemensam scrollbar sidbakgrund som centrerar innehållet på breda skärmar, med sidfot. */
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
  // Full bredd: rader går kant i kant och linjerar själva med useGutter().
  inner: {
    width: "100%",
    gap: spacing.xl,
  },
});
