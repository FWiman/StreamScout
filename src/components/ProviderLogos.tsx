import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { imageUrl } from "@/api/tmdb";
import type { WatchProvider } from "@/api/types";
import { colors, spacing } from "@/theme";

interface Props {
  label: string;
  providers: WatchProvider[];
}

/** Logotyper för streamingtjänster, t.ex. "Streama" eller "Hyr". */
export function ProviderLogos({ label, providers }: Props) {
  if (providers.length === 0) return null;

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.logos}>
        {providers.map((p) => (
          <Image
            key={p.id}
            source={imageUrl(p.logoPath, "w92")}
            style={styles.logo}
            accessibilityLabel={p.name}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  logos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
});
