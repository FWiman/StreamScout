import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useDetails, useTrailer, useWatchProviders } from "@/api/queries";
import { providerUrl } from "@/api/providerLinks";
import { imageUrl } from "@/api/tmdb";
import type { MediaType } from "@/api/types";
import { Button } from "@/components/Button";
import { Footer } from "@/components/Footer";
import { MediaRow } from "@/components/MediaRow";
import { MetaLine } from "@/components/MetaLine";
import { ProviderLogos } from "@/components/ProviderLogos";
import { WatchlistButton } from "@/components/WatchlistButton";
import { useGutter } from "@/hooks/useGutter";
import { useIsWide } from "@/hooks/useIsWide";
import { colors, spacing } from "@/theme";

function isMediaType(value: unknown): value is MediaType {
  return value === "movie" || value === "tv";
}

export default function TitleScreen() {
  const params = useLocalSearchParams<{ type: string; id: string }>();
  const id = Number(params.id);

  if (!isMediaType(params.type) || !Number.isFinite(id)) {
    return <Message text="Invalid link." />;
  }
  // `key` makes the page start over from the top when you move on to a recommendation.
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
  const gutter = useGutter();

  if (details.isPending) return <Message loading />;
  if (details.isError) return <Message text="Couldn't load this title." />;

  const item = details.data;
  const backdrop = imageUrl(item.backdropPath, "w1280");
  const poster = imageUrl(item.posterPath, "w500");
  const backdropHeight = isWide ? Math.min(Math.max(width * 0.4, 360), 540) : width * 0.62;
  const p = providers.data;
  const hasProviders = p && (p.stream.length > 0 || p.rent.length > 0 || p.buy.length > 0);
  const firstStream = p?.stream[0];
  const streamUrl = firstStream ? providerUrl(firstStream.name, item.title, p?.link ?? null) : null;
  // Third column only when there's room for poster, text and panel side by side.
  const showAside = isWide && width >= 1200;

  const providersCard = (
    <View style={[styles.providers, showAside && styles.providersAside]}>
      <Text style={styles.sectionTitle}>Where to watch</Text>
      {providers.isPending ? (
        <ActivityIndicator color={colors.textMuted} style={styles.alignStart} />
      ) : p && hasProviders ? (
        <>
          <Text style={styles.hint}>Tap a service to open it.</Text>
          <View style={[styles.providerGroups, showAside && styles.providerGroupsAside]}>
            <ProviderLogos label="Stream" providers={p.stream} title={item.title} fallbackUrl={p.link} />
            <ProviderLogos label="Rent" providers={p.rent} title={item.title} fallbackUrl={p.link} />
            <ProviderLogos label="Buy" providers={p.buy} title={item.title} fallbackUrl={p.link} />
          </View>
          {p.link && (
            <Text style={styles.allOffers} onPress={() => Linking.openURL(p.link!)} accessibilityRole="link">
              See all offers and prices →
            </Text>
          )}
          <Text style={styles.attribution}>Streaming availability by JustWatch via TMDB.</Text>
        </>
      ) : (
        <Text style={styles.muted}>Not available on any Swedish service right now.</Text>
      )}
    </View>
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ title: item.title }} />

      {/* Full-width backdrop that fades into the page */}
      <View style={[styles.backdrop, { height: backdropHeight }]}>
        {backdrop && (
          <Image
            source={backdrop}
            // A small version loads instantly and is swapped for the sharp one when ready.
            placeholder={imageUrl(item.backdropPath, "w300")}
            placeholderContentFit="cover"
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="top"
            transition={300}
          />
        )}
        <LinearGradient
          colors={[colors.backgroundClear, colors.background]}
          locations={[0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View
        style={[styles.body, isWide && styles.bodyWide, { marginTop: isWide ? -160 : -60, paddingHorizontal: gutter }]}
      >
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
          <MetaLine
            parts={[item.type === "movie" ? "Movie" : "TV Show", item.year, item.runtime ? formatRuntime(item.runtime) : null]}
            rating={item.voteAverage}
            size={isWide ? 16 : 15}
          />

          {item.genres.length > 0 && (
            <View style={styles.genres}>
              {item.genres.map((g) => (
                <Text key={g} style={styles.genre}>
                  {g}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.buttons}>
            {/* Primary button: watch directly on the first service that includes the title */}
            {firstStream && streamUrl && (
              <Button
                label={`Watch on ${firstStream.name}`}
                icon="play"
                size={isWide ? "lg" : "md"}
                onPress={() => Linking.openURL(streamUrl)}
              />
            )}
            {trailer.data && (
              <Button
                label="Trailer"
                icon={firstStream ? "film-outline" : "play"}
                variant={firstStream ? "secondary" : "primary"}
                size={isWide ? "lg" : "md"}
                onPress={() => WebBrowser.openBrowserAsync(trailer.data!)}
              />
            )}
            <WatchlistButton item={item} size={isWide ? "lg" : "md"} />
          </View>

          {/* Phones and medium screens: services before the overview, since that's what matters most */}
          {!showAside && providersCard}

          {item.overview ? (
            <Text style={[styles.overview, isWide && styles.overviewWide]}>{item.overview}</Text>
          ) : (
            <Text style={styles.muted}>No description available.</Text>
          )}
        </View>

        {/* Large screens: services in their own column on the right, visible without scrolling */}
        {showAside && <View style={styles.aside}>{providersCard}</View>}
      </View>

      <View style={styles.more}>
        <MediaRow title="More like this" kind="recommendations" type={type} id={id} />
      </View>
      <Footer />
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
  },
  backdrop: {
    width: "100%",
    backgroundColor: colors.surface,
  },
  body: {
    width: "100%",
    paddingVertical: spacing.md,
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
    flexWrap: "wrap",
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
  aside: {
    width: 340,
    marginTop: 110,
  },
  providersAside: {
    maxWidth: undefined,
    marginTop: 0,
  },
  providerGroupsAside: {
    flexDirection: "column",
    gap: spacing.md,
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
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: -spacing.sm,
  },
  allOffers: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
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
