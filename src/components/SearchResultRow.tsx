import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { imageUrl } from "@/api/tmdb";
import type { MediaItem } from "@/api/types";
import { colors, spacing } from "@/theme";

interface Props {
  item: MediaItem;
  onPress: () => void;
  /** Markerad med piltangenterna. */
  active?: boolean;
  /** Mindre variant för rullgardinen i toppmenyn. */
  compact?: boolean;
}

export function mediaMeta(item: MediaItem) {
  return [
    item.type === "movie" ? "Film" : "Serie",
    item.year,
    item.voteAverage > 0 ? `★ ${item.voteAverage.toFixed(1)}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");
}

/** En sökträff som rad: liten affisch, titel och fakta. */
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
        <Text style={styles.meta} numberOfLines={1}>
          {mediaMeta(item)}
        </Text>
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
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  overview: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
});
