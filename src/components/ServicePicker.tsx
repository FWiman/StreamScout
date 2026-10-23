import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMyServices } from "@/api/myServices";
import { useStreamingServices } from "@/api/queries";
import { imageUrl } from "@/api/tmdb";
import type { MediaType } from "@/api/types";
import { useGutter } from "@/hooks/useGutter";
import { colors, spacing } from "@/theme";

/** A single service's provider id, "mine" for all of the user's services, or null for everything. */
export type ServiceSelection = number | "mine" | null;

interface Props {
  type: MediaType;
  selected: ServiceSelection;
  onSelect: (selection: ServiceSelection) => void;
}

/**
 * A row of streaming service logos for filtering: "what's on Netflix?". Scrolls sideways.
 * "My services" filters by all the services the user has; without any picked yet it links to choosing them.
 */
export function ServicePicker({ type, selected, onSelect }: Props) {
  const gutter = useGutter();
  const router = useRouter();
  const { data: services } = useStreamingServices(type);
  const { ids: myServices } = useMyServices();
  if (!services || services.length === 0) return null;
  const hasMine = myServices.length > 0;

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

      <Pressable
        onPress={() => (hasMine ? onSelect(selected === "mine" ? null : "mine") : router.push("/my-services"))}
        accessibilityRole="button"
        accessibilityLabel={hasMine ? "My services" : "Choose my services"}
        accessibilityState={{ selected: selected === "mine" }}
        style={({ pressed }) => [styles.all, selected === "mine" && styles.selected, pressed && styles.pressed]}
      >
        <View style={styles.mineRow}>
          <Ionicons
            name={hasMine ? "checkmark-circle" : "add-circle-outline"}
            size={16}
            color={selected === "mine" ? colors.accentText : colors.textMuted}
          />
          <Text style={[styles.allText, selected === "mine" && styles.allTextSelected]}>My services</Text>
        </View>
      </Pressable>

      {services.map((service) => {
        // With "My services" selected, the user's own services light up too.
        const active = service.id === selected || (selected === "mine" && myServices.includes(service.id));
        return (
          <Pressable
            key={service.id}
            onPress={() => onSelect(service.id === selected ? null : service.id)}
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
  mineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
