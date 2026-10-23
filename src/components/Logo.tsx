import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

/** The StreamScout logo: green badge with a play symbol, plus the name. */
export function Logo({ size = 22 }: { size?: number }) {
  const badge = size * 1.35;
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="StreamScout">
      <View style={[styles.badge, { width: badge, height: badge, borderRadius: badge * 0.28 }]}>
        <Ionicons name="play" size={size * 0.75} color={colors.onAccent} style={{ marginLeft: size * 0.08 }} />
      </View>
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
    gap: 8,
  },
  badge: {
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.text,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  accent: {
    color: colors.accentText,
  },
});
