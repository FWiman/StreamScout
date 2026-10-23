import { Image } from "expo-image";
import { Platform, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

const mark = require("../../assets/logo-mark.png");

/** Serif wordmark. A bundled display font (e.g. Fraunces) can replace this later. */
const WORDMARK_FONT = Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, 'Times New Roman', serif" });

/** The StreamScout logo: a coral lens with a sparkle inside (you found your next favorite), plus the name. */
export function Logo({ size = 22 }: { size?: number }) {
  const markSize = size * 1.45;
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="StreamScout">
      <Image source={mark} style={{ width: markSize, height: markSize }} contentFit="contain" />
      <Text style={[styles.text, { fontSize: size }]}>
        Stream<Text style={styles.accent}>Scout</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    color: colors.text,
    fontFamily: WORDMARK_FONT,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  accent: {
    color: colors.accentText,
  },
});
