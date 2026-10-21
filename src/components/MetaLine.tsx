import { Fragment } from "react";
import { StyleSheet, Text } from "react-native";
import { colors } from "@/theme";

interface Props {
  /** Fakta i ordning, t.ex. ["Film", "2024", "2 h 46 min"]. Tomma värden hoppas över. */
  parts: (string | null | undefined | false)[];
  /** Betyg 0–10. Visas gult, som på korten. 0 betyder inget betyg. */
  rating?: number;
  size?: number;
}

/** En rad med fakta åtskilda av punkter, med betyget i samma gula färg som på korten. */
export function MetaLine({ parts, rating = 0, size = 15 }: Props) {
  const items = parts.filter((p): p is string => Boolean(p));
  const hasRating = rating > 0;

  return (
    <Text style={[styles.meta, { fontSize: size }]} numberOfLines={1}>
      {items.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <Text style={styles.dot}>{"  ·  "}</Text>}
          {part}
        </Fragment>
      ))}
      {hasRating && (
        <>
          {items.length > 0 && <Text style={styles.dot}>{"  ·  "}</Text>}
          <Text style={styles.rating}>★ {rating.toFixed(1)}</Text>
        </>
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  meta: {
    color: colors.textMuted,
  },
  dot: {
    color: colors.textMuted,
  },
  rating: {
    color: colors.rating,
    fontWeight: "700",
  },
});
