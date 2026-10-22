import { Fragment } from "react";
import { StyleSheet, Text } from "react-native";
import { colors } from "@/theme";

interface Props {
  /** Facts in order, e.g. ["Movie", "2024", "2 h 46 min"]. Empty values are skipped. */
  parts: (string | null | undefined | false)[];
  /** Rating 0–10. Shown in yellow, like on the cards. 0 means no rating. */
  rating?: number;
  size?: number;
}

/** A line of facts separated by dots, with the rating in the same yellow as on the cards. */
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
