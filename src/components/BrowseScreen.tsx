import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useStreamingServices } from "@/api/queries";
import type { MediaType } from "@/api/types";
import { useGutter } from "@/hooks/useGutter";
import { colors, spacing } from "@/theme";
import { Hero } from "./Hero";
import { MediaGrid } from "./MediaGrid";
import { MediaRow } from "./MediaRow";
import { Screen } from "./Screen";
import { ServicePicker } from "./ServicePicker";

const LABELS: Record<MediaType, { plural: string; hero: string }> = {
  movie: { plural: "Movies", hero: "Popular movie" },
  tv: { plural: "TV Shows", hero: "Trending show" },
};

/**
 * The Movies and TV Shows pages: a hero and rows, plus a streaming service filter.
 * Picking a service replaces the rows with a grid of what's included on it in Sweden.
 * The choice is kept in the URL (?service=8), so it survives a reload and can be shared.
 */
export function BrowseScreen({ type }: { type: MediaType }) {
  const router = useRouter();
  const gutter = useGutter();
  const { service } = useLocalSearchParams<{ service?: string }>();
  const selected = service && /^\d+$/.test(service) ? Number(service) : null;

  const { data: services } = useStreamingServices(type);
  const serviceName = services?.find((s) => s.id === selected)?.name;
  const labels = LABELS[type];

  const select = (id: number | null) => router.setParams({ service: id === null ? undefined : String(id) });

  return (
    <Screen
      hero={
        selected === null ? (
          <Hero kind={type === "movie" ? "popular" : "trending"} type={type} label={labels.hero} />
        ) : undefined
      }
    >
      <View style={styles.filter}>
        <Text style={[styles.filterLabel, { paddingHorizontal: gutter }]}>Streaming in Sweden</Text>
        <ServicePicker type={type} selected={selected} onSelect={select} />
      </View>

      {selected === null ? (
        <>
          <MediaRow title="Trending now" kind="trending" type={type} />
          <MediaRow title="Popular" kind="popular" type={type} />
          <MediaRow title="Top rated" kind="topRated" type={type} />
        </>
      ) : (
        <View style={styles.results}>
          <Text style={[styles.heading, { paddingHorizontal: gutter }]}>
            {labels.plural} on {serviceName ?? "this service"}
          </Text>
          <MediaGrid
            key={selected}
            kind="service"
            type={type}
            id={selected}
            emptyText={`No ${labels.plural.toLowerCase()} found on this service right now.`}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filter: {
    gap: spacing.sm,
  },
  filterLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  results: {
    gap: spacing.md,
  },
  heading: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
});
