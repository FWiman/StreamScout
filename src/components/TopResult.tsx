import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { imageUrl } from "@/api/tmdb";
import type { MediaItem } from "@/api/types";
import { colors, spacing } from "@/theme";
import { Button } from "./Button";
import { MetaLine } from "./MetaLine";
import { mediaParts } from "./SearchResultRow";

/** Large card for the best search match. */
export function TopResult({ item, wide }: { item: MediaItem; wide: boolean }) {
  const backdrop = imageUrl(item.backdropPath ?? item.posterPath, "w780");
  const poster = imageUrl(item.posterPath, "w342");
  const open = () => router.push(`/title/${item.type}/${item.id}`);

  return (
    <Pressable
      onPress={open}
      accessibilityRole="link"
      accessibilityLabel={item.title}
      style={[styles.card, { height: wide ? 280 : 220 }]}
    >
      {backdrop && (
        <Image
          source={backdrop}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="top"
          transition={200}
        />
      )}
      <LinearGradient
        colors={[colors.overlay, colors.backgroundClear]}
        start={{ x: 0, y: 0 }}
        end={{ x: wide ? 0.75 : 1.1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {poster && wide && <Image source={poster} style={styles.poster} contentFit="cover" />}
        <View style={styles.text}>
          <Text style={styles.label}>Top result</Text>
          <Text style={[styles.title, wide && styles.titleWide]} numberOfLines={2}>
            {item.title}
          </Text>
          <MetaLine parts={mediaParts(item)} rating={item.voteAverage} size={14} />
          {item.overview.length > 0 && (
            <Text style={styles.overview} numberOfLines={wide ? 3 : 2}>
              {item.overview}
            </Text>
          )}
          <View style={styles.buttons}>
            <Button label="More info" icon="information-circle-outline" onPress={open} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.lg,
  },
  poster: {
    width: 150,
    height: 225,
    borderRadius: 10,
  },
  text: {
    flex: 1,
    maxWidth: 520,
    gap: spacing.sm,
  },
  label: {
    color: colors.accentText,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  titleWide: {
    fontSize: 32,
  },
  overview: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  buttons: {
    flexDirection: "row",
    marginTop: spacing.xs,
  },
});
