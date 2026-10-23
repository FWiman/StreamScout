import { Image } from "expo-image";
import { Platform, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

const lens = require("../../assets/logo-mark.png");

/** Fraunces Bold, loaded in app/_layout.tsx; a system serif shows until it's ready. */
const WORDMARK_FONT = Platform.select({
  web: "Fraunces_700Bold, Georgia, 'Times New Roman', serif",
  default: "Fraunces_700Bold",
});

/**
 * The StreamScout wordmark: "Stream" in cream, "Scout" in coral, with the lens
 * (a magnifying glass with a sparkle) standing in for the "o".
 * `size` is the font size; the lens scales with it.
 */
export function Logo({ size = 22 }: { size?: number }) {
  const lensSize = size * 0.8;
  const text = { fontSize: size, lineHeight: size * 1.2 };
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel="StreamScout">
      <Text style={[styles.word, text]}>
        Stream<Text style={styles.accent}>Sc</Text>
      </Text>
      <Image
        source={lens}
        style={{
          width: lensSize,
          height: lensSize,
          // Sit the lens ring on the text's baseline, with the handle dipping just below it.
          marginBottom: size * 0.04,
          marginHorizontal: size * 0.01,
        }}
        contentFit="contain"
      />
      <Text style={[styles.word, styles.accent, text]}>ut</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  word: {
    color: colors.text,
    fontFamily: WORDMARK_FONT,
    fontWeight: Platform.OS === "web" ? "700" : undefined,
    letterSpacing: -0.4,
  },
  accent: {
    color: colors.accentText,
  },
});
