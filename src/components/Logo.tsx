import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

/** StreamWatch-loggan: röd ikon med play-symbol och namnet. */
export function Logo({ size = 22 }: { size?: number }) {
  const badge = size * 1.35;
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="StreamWatch">
      <View style={[styles.badge, { width: badge, height: badge, borderRadius: badge * 0.28 }]}>
        <Ionicons name="play" size={size * 0.75} color={colors.text} style={{ marginLeft: size * 0.08 }} />
      </View>
      <Text style={[styles.text, { fontSize: size }]}>
        Stream<Text style={styles.accent}>Watch</Text>
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
    color: colors.accent,
  },
});
