import { Image } from "expo-image";
import { Link } from "expo-router";
import { useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { imageUrl } from "@/api/tmdb";
import type { MediaItem } from "@/api/types";
import { colors, spacing } from "@/theme";

interface Props {
  item: MediaItem;
  width?: number;
  /** Visa "Film"/"Serie" under titeln – användbart när listan blandar båda. */
  showType?: boolean;
}

/** Affisch med titel och betyg. Trycker man öppnas detaljsidan. */
export function MediaCard({ item, width = 130, showType = false }: Props) {
  const poster = imageUrl(item.posterPath, width > 160 ? "w500" : "w342");
  const subtitle = [item.year, showType ? (item.type === "movie" ? "Film" : "Serie") : null]
    .filter(Boolean)
    .join(" · ");

  // Zoomar affischen lite när muspekaren är över kortet (bara på dator).
  const scale = useRef(new Animated.Value(1)).current;
  const zoom = (to: number) =>
    Animated.timing(scale, {
      toValue: to,
      duration: 180,
      useNativeDriver: Platform.OS !== "web",
    }).start();

  // Bredden sätts på en yttre View: på webben följer inte en style-funktion med
  // genom <Link asChild>, och då blir korten olika breda.
  return (
    <View style={{ width }}>
      <Link href={`/title/${item.type}/${item.id}`} asChild>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={item.title}
          onHoverIn={() => zoom(1.05)}
          onHoverOut={() => zoom(1)}
        >
          {({ pressed }) => (
            <View style={[styles.card, pressed && styles.pressed]}>
              <Animated.View
                style={[styles.posterFrame, { width, height: width * 1.5, transform: [{ scale }] }]}
              >
                {poster ? (
                  <Image source={poster} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
                ) : (
                  <Text style={styles.placeholder} numberOfLines={3}>
                    {item.title}
                  </Text>
                )}
                {item.voteAverage > 0 && (
                  <View style={styles.rating}>
                    <Text style={styles.ratingText}>★ {item.voteAverage.toFixed(1)}</Text>
                  </View>
                )}
              </Animated.View>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              {subtitle.length > 0 && <Text style={styles.year}>{subtitle}</Text>}
            </View>
          )}
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  posterFrame: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    color: colors.textMuted,
    textAlign: "center",
    padding: spacing.sm,
  },
  rating: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    color: colors.rating,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  year: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
