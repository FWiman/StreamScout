import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useDetails, useTrailer, useWatchProviders } from "@/api/queries";
import { imageUrl } from "@/api/tmdb";
import type { MediaType } from "@/api/types";
import { ProviderLogos } from "@/components/ProviderLogos";
import { colors, MAX_CONTENT_WIDTH, spacing } from "@/theme";

function isMediaType(value: unknown): value is MediaType {
  return value === "movie" || value === "tv";
}

export default function TitleScreen() {
  const params = useLocalSearchParams<{ type: string; id: string }>();
  const id = Number(params.id);

  if (!isMediaType(params.type) || !Number.isFinite(id)) {
    return <Message text="Ogiltig länk." />;
  }
  return <TitleDetails type={params.type} id={id} />;
}

function TitleDetails({ type, id }: { type: MediaType; id: number }) {
  const details = useDetails(type, id);
  const trailer = useTrailer(type, id);
  const providers = useWatchProviders(type, id);
  const { width } = useWindowDimensions();

  if (details.isPending) return <Message loading />;
  if (details.isError) return <Message text="Kunde inte hämta titeln." />;

  const item = details.data;
  const backdrop = imageUrl(item.backdropPath, "w1280");
  const poster = imageUrl(item.posterPath, "w500");
  const wide = width >= 700;
  const backdropHeight = Math.min(width, MAX_CONTENT_WIDTH) * (wide ? 0.4 : 0.56);

  const meta = [
    item.year,
    item.runtime ? `${item.runtime} min` : null,
    item.voteAverage > 0 ? `★ ${item.voteAverage.toFixed(1)}` : null,
  ].filter(Boolean);

  const p = providers.data;
  const hasProviders = p && (p.stream.length > 0 || p.rent.length > 0 || p.buy.length > 0);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Stack.Screen options={{ title: item.title }} />
      <View style={styles.inner}>
        {backdrop && (
          <Image source={backdrop} style={{ width: "100%", height: backdropHeight }} contentFit="cover" />
        )}

        <View style={[styles.body, wide && styles.bodyWide]}>
          {poster && wide && <Image source={poster} style={styles.poster} contentFit="cover" />}

          <View style={styles.info}>
            <Text style={styles.title}>{item.title}</Text>
            {item.tagline && <Text style={styles.tagline}>{item.tagline}</Text>}
            {meta.length > 0 && <Text style={styles.meta}>{meta.join("  ·  ")}</Text>}

            {item.genres.length > 0 && (
              <View style={styles.genres}>
                {item.genres.map((g) => (
                  <Text key={g} style={styles.genre}>
                    {g}
                  </Text>
                ))}
              </View>
            )}

            {trailer.data && (
              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                onPress={() => WebBrowser.openBrowserAsync(trailer.data!)}
                accessibilityRole="button"
              >
                <Ionicons name="play" size={18} color="#fff" />
                <Text style={styles.buttonText}>Se trailer</Text>
              </Pressable>
            )}

            {item.overview ? (
              <Text style={styles.overview}>{item.overview}</Text>
            ) : (
              <Text style={styles.muted}>Ingen beskrivning finns.</Text>
            )}

            <View style={styles.providers}>
              <Text style={styles.sectionTitle}>Var kan jag se den?</Text>
              {providers.isPending ? (
                <ActivityIndicator color={colors.textMuted} style={{ alignSelf: "flex-start" }} />
              ) : p && hasProviders ? (
                <>
                  <ProviderLogos label="Streama" providers={p.stream} />
                  <ProviderLogos label="Hyr" providers={p.rent} />
                  <ProviderLogos label="Köp" providers={p.buy} />
                  <Text style={styles.attribution}>Tjänsteinformation från JustWatch via TMDB.</Text>
                </>
              ) : (
                <Text style={styles.muted}>Finns inte på någon svensk tjänst just nu.</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function Message({ text, loading }: { text?: string; loading?: boolean }) {
  return (
    <View style={styles.center}>
      {loading ? <ActivityIndicator color={colors.textMuted} /> : <Text style={styles.muted}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: spacing.xl,
  },
  inner: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
  },
  body: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  bodyWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  poster: {
    width: 220,
    height: 330,
    borderRadius: 10,
    marginTop: -120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    flex: 1,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  tagline: {
    color: colors.textMuted,
    fontStyle: "italic",
    marginTop: -spacing.sm,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 15,
  },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  genre: {
    color: colors.text,
    fontSize: 13,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  overview: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  providers: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  attribution: {
    color: colors.textMuted,
    fontSize: 12,
  },
  muted: {
    color: colors.textMuted,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
});
