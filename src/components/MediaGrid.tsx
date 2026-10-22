import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useMediaList, type ListKind } from "@/api/queries";
import type { MediaType } from "@/api/types";
import { useGridLayout } from "@/hooks/useGridLayout";
import { colors, spacing } from "@/theme";
import { Button } from "./Button";
import { MediaCard } from "./MediaCard";

interface Props {
  kind: ListKind;
  type: MediaType;
  id?: number;
  /** Shown when the list has no titles. */
  emptyText?: string;
}

/** A paginated poster grid with a "Show more" button at the bottom. */
export function MediaGrid({ kind, type, id, emptyText = "No titles found." }: Props) {
  const { gutter, cardWidth } = useGridLayout();
  const { items, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useMediaList(
    kind,
    type,
    id
  );

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
