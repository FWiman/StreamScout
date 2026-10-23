import { Image } from "expo-image";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { providerUrl } from "@/api/providerLinks";
import { imageUrl } from "@/api/tmdb";
import type { WatchProvider } from "@/api/types";
import { colors, spacing } from "@/theme";

interface Props {
  label: string;
  providers: WatchProvider[];
  /** The title the service's search is filled in with. */
  title: string;
  /** TMDB's page with all services – used for services we have no search URL for. */
  fallbackUrl: string | null;
  /** The user's own services: shown first and marked. */
  highlight?: number[];
}

/**
 * Streaming service logos, e.g. under "Stream" or "Rent".
 * Tapping a logo opens the service (its app on phones, if installed) searching for the title.
 */
export function ProviderLogos({ label, providers, title, fallbackUrl, highlight = [] }: Props) {
  if (providers.length === 0) return null;
  const sorted = [...providers].sort((a, b) => Number(highlight.includes(b.id)) - Number(highlight.includes(a.id)));

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.logos}>
        {sorted.map((p) => (
          <ProviderLogo
            key={p.id}
            provider={p}
            url={providerUrl(p.name, title, fallbackUrl)}
            mine={highlight.includes(p.id)}
          />
        ))}
      </View>
    </View>
  );
}

function ProviderLogo({ provider, url, mine }: { provider: WatchProvider; url: string | null; mine: boolean }) {
  const [hovered, setHovered] = useState(false);

  const logo = (
    <View style={[styles.logoWrap, mine && styles.logoMine]}>
      <Image source={imageUrl(provider.logoPath, "w92")} style={styles.logo} accessibilityIgnoresInvertColors />
    </View>
  );
  if (!url) return <View accessibilityLabel={provider.name}>{logo}</View>;

  return (
    <Pressable
      // Linking (not an in-app browser) so the service's own app can take over the link.
      onPress={() => Linking.openURL(url)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
      accessibilityLabel={`Open ${provider.name}${mine ? " (one of your services)" : ""}`}
      style={({ pressed }) => [styles.pressable, hovered && styles.hovered, pressed && styles.pressed]}
    >
      {logo}
    </Pressable>
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
  pressable: {
    borderRadius: 10,
  },
  hovered: {
    transform: [{ scale: 1.08 }],
  },
  pressed: {
    opacity: 0.7,
  },
  logoWrap: {
    padding: 2,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  logoMine: {
    borderColor: colors.accent,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
});
