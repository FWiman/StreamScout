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
  /** Titeln som tjänstens sökning fylls i med. */
  title: string;
  /** TMDB:s sida med alla tjänster – används för tjänster vi inte har en sök-URL för. */
  fallbackUrl: string | null;
}

/**
 * Logotyper för streamingtjänster, t.ex. "Streama" eller "Hyr".
 * Trycker man på en logga öppnas tjänsten (appen på telefonen om den finns) med titeln sökt.
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
      // Linking (inte en inbyggd webbläsare) så att tjänstens egen app kan ta över länken.
      onPress={() => Linking.openURL(url)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
      accessibilityLabel={`Öppna ${provider.name}`}
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
