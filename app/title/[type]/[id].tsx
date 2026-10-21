import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ActivityIndicator, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useDetails, useTrailer, useWatchProviders } from "@/api/queries";
import { imageUrl } from "@/api/tmdb";
import type { MediaType } from "@/api/types";
import { Button } from "@/components/Button";
import { MediaRow } from "@/components/MediaRow";
import { ProviderLogos } from "@/components/ProviderLogos";
import { useIsWide } from "@/hooks/useIsWide";
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
  // `key` gör att sidan börjar om från toppen när man går vidare till en rekommendation.
  return <TitleDetails key={`${params.type}-${id}`} type={params.type} id={id} />;
}

function formatRuntime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function TitleDetails({ type, id }: { type: MediaType; id: number }) {
  const details = useDetails(type, id);
  const trailer = useTrailer(type, id);
  const providers = useWatchProviders(type, id);
  const isWide = useIsWide();
  const { width } = useWindowDimensions();

  if (details.isPending) return <Message loading />;
  if (details.isError) return <Message text="Kunde inte hämta titeln." />;

  const item = details.data;
  const backdrop = imageUrl(item.backdropPath, "w1280");
  const poster = imageUrl(item.posterPath, "w500");
  const backdropHeight = isWide ? Math.min(Math.max(width * 0.4, 360), 540) : width * 0.62;

  const meta = [
    item.year,
    item.runtime ? formatRuntime(item.runtime) : null,
    item.voteAverage > 0 ? `★ ${item.voteAverage.toFixed(1)}` : null,
  ].filter(Boolean);

  const p = providers.data;
  const hasProviders = p && (p.stream.length > 0 || p.rent.length > 0 || p.buy.length > 0);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <Stack.Screen options={{ title: item.title }} />

      {/* Bakgrundsbild i full bredd som tonar ut mot sidan */}
      <View style={[styles.backdrop, { height: backdropHeight }]}>
        {backdrop && (
          <Image source={backdrop} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
        )}
        <LinearGradient
          colors={[colors.backgroundClear, colors.background]}
          locations={[0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={[styles.body, isWide && styles.bodyWide, { marginTop: isWide ? -160 : -60 }]}>
        {poster && (
          <Image
            source={poster}
            style={isWide ? styles.posterWide : styles.poster}
            contentFit="cover"
            transition={200}
          />
        )}

        <View style={styles.info}>
          <Text style={[styles.title, isWide && styles.titleWide]}>{item.title}</Text>
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
            <View style={styles.buttons}>
              <Button
                label="Se trailer"
                icon="play"
                size={isWide ? "lg" : "md"}
                onPress={() => WebBrowser.openBrowserAsync(trailer.data!)}
              />
            </View>
          )}

          {item.overview ? (
            <Text style={[styles.overview, isWide && styles.overviewWide]}>{item.overview}</Text>
          ) : (
            <Text style={styles.muted}>Ingen beskrivning finns.</Text>
          )}

          <View style={styles.providers}>
            <Text style={styles.sectionTitle}>Var kan jag se den?</Text>
            {providers.isPending ? (
              <ActivityIndicator color={colors.textMuted} style={styles.alignStart} />
            ) : p && hasProviders ? (
              <>
                <View style={styles.providerGroups}>
                  <ProviderLogos label="Streama" providers={p.stream} />
                  <ProviderLogos label="Hyr" providers={p.rent} />
                  <ProviderLogos label="Köp" providers={p.buy} />
                </View>
                <Text style={styles.attribution}>Tjänsteinformation från JustWatch via TMDB.</Text>
              </>
            ) : (
              <Text style={styles.muted}>Finns inte på någon svensk tjänst just nu.</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.more}>
        <MediaRow title="Mer som detta" kind="recommendations" type={type} id={id} />
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
  backdrop: {
    width: "100%",
    backgroundColor: colors.surface,
  },
  body: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    padding: spacing.md,
    gap: spacing.lg,
  },
  bodyWide: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xl,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  posterWide: {
    width: 260,
    height: 390,
    borderRadius: 12,
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
    letterSpacing: -0.5,
  },
  titleWide: {
    fontSize: 44,
    lineHeight: 50,
    marginTop: 110,
  },
  tagline: {
    color: colors.textMuted,
    fontStyle: "italic",
    fontSize: 16,
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
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  overview: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  overviewWide: {
    fontSize: 17,
    lineHeight: 27,
    maxWidth: 760,
  },
  providers: {
    gap: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "stretch",
    maxWidth: 760,
  },
  providerGroups: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xl,
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
  alignStart: {
    alignSelf: "flex-start",
  },
  more: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    marginTop: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
});
