import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { imageUrl } from "@/api/tmdb";
import type { MediaItem } from "@/api/types";
import { colors, spacing } from "@/theme";
import { MetaLine } from "./MetaLine";

interface Props {
  item: MediaItem;
  onPress: () => void;
  /** Highlighted with the arrow keys. */
  active?: boolean;
  /** Smaller variant for the dropdown in the top nav. */
  compact?: boolean;
}

/** Facts shown under the title in search results (MetaLine adds the rating). */
export function mediaParts(item: MediaItem) {
  return [item.type === "movie" ? "Movie" : "TV Show", item.year];
}

/** A search hit as a row: small poster, title and facts. */
export function SearchResultRow({ item, onPress, active = false, compact = false }: Props) {
  const [hovered, setHovered] = useState(false);
  const poster = imageUrl(item.posterPath, "w185");
  const posterWidth = compact ? 40 : 56;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
      accessibilityLabel={item.title}
      style={({ pressed }) => [
        styles.row,
        compact && styles.rowCompact,
        (active || hovered) && styles.rowActive,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={[styles.poster, { width: posterWidth, height: posterWidth * 1.5 }]}>
        {poster && <Image source={poster} style={StyleSheet.absoluteFill} contentFit="cover" />}
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={1}>
          {item.title}
        </Text>
        <MetaLine parts={mediaParts(item)} rating={item.voteAverage} size={13} />
        {!compact && item.overview.length > 0 && (
          <Text style={styles.overview} numberOfLines={2}>
            {item.overview}
          </Text>
        )}
      </View>
      {!compact && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
  },
  rowCompact: {
    gap: 12,
    paddingVertical: 6,
  },
  rowActive: {
    backgroundColor: colors.highlight,
  },
  rowPressed: {
    opacity: 0.7,
  },
  poster: {
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.surfaceRaised,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  titleCompact: {
    fontSize: 15,
  },
  overview: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});
