import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useMediaList, useTrailer, type ListKind } from "@/api/queries";
import { imageUrl } from "@/api/tmdb";
import type { MediaType } from "@/api/types";
import { useGutter } from "@/hooks/useGutter";
import { useIsWide } from "@/hooks/useIsWide";
import { colors, spacing } from "@/theme";
import { Button } from "./Button";
import { MetaLine } from "./MetaLine";
import { WatchlistButton } from "./WatchlistButton";

interface Props {
  kind: ListKind;
  type: MediaType;
  /** Liten etikett ovanför titeln, t.ex. "Trendar just nu". */
  label: string;
}

/**
 * Stor toppsektion med bakgrundsbild från första titeln i listan.
 * Delar cache med raden för samma lista, så den kostar inget extra anrop.
 */
export function Hero({ kind, type, label }: Props) {
  const { items } = useMediaList(kind, type);
  const item = items.find((i) => i.backdropPath);
  const trailer = useTrailer(type, item?.id);

  const isWide = useIsWide();
  const gutter = useGutter();
  const { width } = useWindowDimensions();
  const height = isWide
    ? Math.min(Math.max(width * 0.42, 380), 600)
    : Math.max(width * 1.2, 400);

  if (!item) return <View style={{ height }} />;

  // Dator: liggande bakgrundsbild. Telefon: stående affisch, som fyller skärmen bättre.
  const backdrop = isWide
    ? imageUrl(item.backdropPath, "w1280")
    : imageUrl(item.posterPath ?? item.backdropPath, "w780");

  return (
    <View style={[styles.hero, { height }]}>
      {/* Förankra i överkant: ansikten och titlar sitter oftast högt upp i bilden */}
      <Image
        source={backdrop}
        // En liten version laddar direkt och byts mot den skarpa när den är klar.
        placeholder={isWide ? imageUrl(item.backdropPath, "w300") : imageUrl(item.posterPath, "w92")}
        placeholderContentFit="cover"
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="top"
        transition={300}
      />

      {/* Tonar ut bilden mot bakgrunden så texten går att läsa */}
      <LinearGradient
        colors={[colors.backgroundClear, colors.background]}
        locations={[isWide ? 0.55 : 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      {isWide && (
        <LinearGradient
          colors={[colors.overlay, colors.backgroundClear]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.7, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={styles.contentWrap}>
        <View style={[styles.content, isWide && styles.contentWide, { paddingHorizontal: gutter }]}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.title, isWide && styles.titleWide]} numberOfLines={2}>
            {item.title}
          </Text>
          <MetaLine parts={[item.type === "movie" ? "Film" : "Serie", item.year]} rating={item.voteAverage} />
          {isWide && item.overview.length > 0 && (
            <Text style={styles.overview} numberOfLines={3}>
              {item.overview}
            </Text>
          )}
          <View style={styles.buttons}>
            {trailer.data && (
              <Button
                label="Se trailer"
                icon="play"
                size={isWide ? "lg" : "md"}
                onPress={() => WebBrowser.openBrowserAsync(trailer.data!)}
              />
            )}
            <Button
              label="Mer info"
              icon="information-circle-outline"
              variant="secondary"
              size={isWide ? "lg" : "md"}
              onPress={() => router.push(`/title/${item.type}/${item.id}`)}
            />
            <WatchlistButton item={item} size={isWide ? "lg" : "md"} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    backgroundColor: colors.surface,
    justifyContent: "flex-end",
  },
  contentWrap: {
    width: "100%",
  },
  content: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  contentWide: {
    // Textens bredd plus marginalen till vänster.
    maxWidth: 600 + 64,
    paddingBottom: spacing.xl,
  },
  label: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  titleWide: {
    fontSize: 48,
    lineHeight: 54,
  },
  overview: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
