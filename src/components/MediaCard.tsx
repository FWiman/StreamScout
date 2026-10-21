import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { imageUrl } from "@/api/tmdb";
import type { MediaItem } from "@/api/types";
import { colors, spacing } from "@/theme";

interface Props {
  item: MediaItem;
  width?: number;
}

/** Affisch med titel och betyg. Trycker man öppnas detaljsidan. */
export function MediaCard({ item, width = 130 }: Props) {
  const poster = imageUrl(item.posterPath, "w342");

  // Bredden sätts på en yttre View: på webben följer inte en style-funktion med
  // genom <Link asChild>, och då blir korten olika breda.
  return (
    <View style={{ width }}>
      <Link href={`/title/${item.type}/${item.id}`} asChild>
        <Pressable accessibilityRole="link" accessibilityLabel={item.title}>
          {({ pressed }) => (
            <View style={[styles.card, pressed && styles.pressed]}>
              <View style={[styles.posterFrame, { width, height: width * 1.5 }]}>
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
              </View>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              {item.year && <Text style={styles.year}>{item.year}</Text>}
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
