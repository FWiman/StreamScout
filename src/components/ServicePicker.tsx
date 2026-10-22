import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useStreamingServices } from "@/api/queries";
import { imageUrl } from "@/api/tmdb";
import type { MediaType } from "@/api/types";
import { useGutter } from "@/hooks/useGutter";
import { colors, spacing } from "@/theme";

interface Props {
  type: MediaType;
  /** The selected service's provider id, or null for "All". */
  selected: number | null;
  onSelect: (providerId: number | null) => void;
}

/** A row of streaming service logos for filtering: "what's on Netflix?". Scrolls sideways. */
export function ServicePicker({ type, selected, onSelect }: Props) {
  const gutter = useGutter();
  const { data: services } = useStreamingServices(type);
  if (!services || services.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { paddingHorizontal: gutter }]}
    >
      <Pressable
        onPress={() => onSelect(null)}
        accessibilityRole="button"
        accessibilityState={{ selected: selected === null }}
        style={({ pressed }) => [styles.all, selected === null && styles.selected, pressed && styles.pressed]}
      >
        <Text style={[styles.allText, selected === null && styles.allTextSelected]}>All</Text>
      </Pressable>

      {services.map((service) => {
        const active = service.id === selected;
        return (
          <Pressable
            key={service.id}
            onPress={() => onSelect(active ? null : service.id)}
            accessibilityRole="button"
            accessibilityLabel={service.name}
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.logoWrap,
              active && styles.selected,
              selected !== null && !active && styles.dimmed,
              pressed && styles.pressed,
            ]}
          >
            <Image
              source={imageUrl(service.logoPath, "w92")}
              style={styles.logo}
              accessibilityIgnoresInvertColors
            />
          </Pressable>
        );
      })}
      <View style={styles.end} />
    </ScrollView>
  );
}

const SIZE = 48;

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  all: {
    height: SIZE + 4,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  allText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "700",
  },
  allTextSelected: {
    color: colors.text,
  },
  logoWrap: {
    padding: 2,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selected: {
    borderColor: colors.accent,
  },
  dimmed: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.7,
  },
  logo: {
    width: SIZE - 4,
    height: SIZE - 4,
    borderRadius: 10,
  },
  end: {
    width: 1,
  },
});
