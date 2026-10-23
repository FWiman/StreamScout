import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useDiscover } from "@/api/queries";
import { useWithoutHidden } from "@/api/userTitles";
import type { DiscoverFilters } from "@/api/tmdb";
import type { MediaType } from "@/api/types";
import { useGridLayout } from "@/hooks/useGridLayout";
import { colors, spacing } from "@/theme";
import { Button } from "./Button";
import { MediaCard } from "./MediaCard";

interface Props {
  type: MediaType;
  filters: DiscoverFilters;
  /** Shown when the list has no titles. */
  emptyText?: string;
}

/** A paginated poster grid of filtered titles, with a "Show more" button at the bottom. */
export function MediaGrid({ type, filters, emptyText = "No titles found." }: Props) {
  const { gutter, cardWidth } = useGridLayout();
  const { items: allItems, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useDiscover(type, filters);
  const items = useWithoutHidden(allItems);

  if (isPending) return <ActivityIndicator color={colors.textMuted} style={styles.status} />;

  if (isError) {
    return (
      <View style={[styles.message, { paddingHorizontal: gutter }]}>
        <Text style={styles.messageText}>Couldn't load the titles.</Text>
        <Button label="Try again" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.message, { paddingHorizontal: gutter }]}>
        <Text style={styles.messageText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.grid, { paddingHorizontal: gutter }]}>
        {items.map((item) => (
          <MediaCard key={`${item.type}-${item.id}`} item={item} width={cardWidth} />
        ))}
      </View>
      {hasNextPage && (
        <View style={[styles.more, { paddingHorizontal: gutter }]}>
          <Button
            label="Show more"
            icon="chevron-down"
            variant="outline"
            loading={isFetchingNextPage}
            onPress={() => fetchNextPage()}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    marginTop: spacing.xl,
  },
  wrap: {
    gap: spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    rowGap: spacing.lg,
  },
  more: {
    alignItems: "flex-start",
  },
  message: {
    gap: spacing.md,
    alignItems: "flex-start",
  },
  messageText: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
