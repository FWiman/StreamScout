import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { findGenre } from "@/api/genres";
import { useStreamingServices } from "@/api/queries";
import type { MediaType } from "@/api/types";
import { useGutter } from "@/hooks/useGutter";
import { colors, spacing } from "@/theme";
import { GenrePicker } from "./GenrePicker";
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
 * The Movies and TV Shows pages: a hero and rows, plus filters for streaming service and genre.
 * With a filter set, the rows are replaced by a grid of matching titles ("comedies on Netflix").
 * Filters live in the URL (?service=8&genre=comedy), so they survive a reload and can be shared.
 */
export function BrowseScreen({ type }: { type: MediaType }) {
  const router = useRouter();
  const gutter = useGutter();
  const params = useLocalSearchParams<{ service?: string; genre?: string }>();
  const service = params.service && /^\d+$/.test(params.service) ? Number(params.service) : null;
  const genre = findGenre(params.genre);
  const filtered = service !== null || genre !== null;

  const { data: services } = useStreamingServices(type);
  const serviceName = services?.find((s) => s.id === service)?.name;
  const labels = LABELS[type];

  const title = [
    genre ? `${genre.name} ${labels.plural.toLowerCase()}` : labels.plural,
    service !== null ? `on ${serviceName ?? "this service"}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Screen
      hero={
        filtered ? undefined : (
          <Hero kind={type === "movie" ? "popular" : "trending"} type={type} label={labels.hero} />
        )
      }
    >
      <View style={styles.filters}>
        <Text style={[styles.filterLabel, { paddingHorizontal: gutter }]}>Streaming in Sweden</Text>
        <ServicePicker
          type={type}
          selected={service}
          onSelect={(id) => router.setParams({ service: id === null ? undefined : String(id) })}
        />
        <GenrePicker
          type={type}
          selected={genre?.key ?? null}
          onSelect={(key) => router.setParams({ genre: key ?? undefined })}
        />
      </View>

      {filtered ? (
        <View style={styles.results}>
          <Text style={[styles.heading, { paddingHorizontal: gutter }]}>{title}</Text>
          <MediaGrid
            key={`${service}-${genre?.key}`}
            type={type}
            filters={{ service, genreIds: genre ? genre[type] : null }}
            emptyText={`No ${labels.plural.toLowerCase()} match these filters right now.`}
          />
        </View>
      ) : (
        <>
          <MediaRow title="Trending now" kind="trending" type={type} />
          <MediaRow title="Popular" kind="popular" type={type} />
          <MediaRow title="Top rated" kind="topRated" type={type} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
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
