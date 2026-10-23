import { ScrollView, StyleSheet } from "react-native";
import { genresFor } from "@/api/genres";
import type { MediaType } from "@/api/types";
import { useGutter } from "@/hooks/useGutter";
import { spacing } from "@/theme";
import { Chip } from "./Chip";

interface Props {
  type: MediaType | "all";
  /** The selected genre's key, or null for "All genres". */
  selected: string | null;
  onSelect: (key: string | null) => void;
}

/** A sideways-scrolling row of genre chips. */
export function GenrePicker({ type, selected, onSelect }: Props) {
  const gutter = useGutter();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { paddingHorizontal: gutter }]}
    >
      <Chip label="All genres" selected={selected === null} onPress={() => onSelect(null)} />
      {genresFor(type).map((genre) => (
        <Chip
          key={genre.key}
          label={genre.name}
          selected={genre.key === selected}
          onPress={() => onSelect(genre.key === selected ? null : genre.key)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    alignItems: "center",
  },
});
