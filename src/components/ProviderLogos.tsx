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
}

/**
 * Streaming service logos, e.g. under "Stream" or "Rent".
 * Tapping a logo opens the service (its app on phones, if installed) searching for the title.
 */
export function ProviderLogos({ label, providers, title, fallbackUrl }: Props) {
  if (providers.length === 0) return null;

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.logos}>
        {providers.map((p) => (
          <ProviderLogo key={p.id} provider={p} url={providerUrl(p.name, title, fallbackUrl)} />
        ))}
      </View>
    </View>
  );
}

function ProviderLogo({ provider, url }: { provider: WatchProvider; url: string | null }) {
  const [hovered, setHovered] = useState(false);

  const logo = (
    <Image source={imageUrl(provider.logoPath, "w92")} style={styles.logo} accessibilityIgnoresInvertColors />
  );
  if (!url) return <View accessibilityLabel={provider.name}>{logo}</View>;

  return (
    <Pressable
      // Linking (not an in-app browser) so the service's own app can take over the link.
      onPress={() => Linking.openURL(url)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
      accessibilityLabel={`Open ${provider.name}`}
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
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
});
