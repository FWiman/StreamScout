import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useMyServices } from "@/api/myServices";
import { useAvailability } from "@/api/queries";
import { imageUrl } from "@/api/tmdb";
import { useToggleWatchlist, useWatchlist } from "@/api/watchlist";
import { useGridLayout } from "@/hooks/useGridLayout";
import { colors, spacing } from "@/theme";
import { Button } from "./Button";
import { MediaCard } from "./MediaCard";

/**
 * Grid of the user's saved titles. The × in the corner removes a title. Under each card,
 * the logos of the user's own services that include it; `onlyAvailable` shows just those titles.
 */
export function WatchlistGrid({ onlyAvailable = false }: { onlyAvailable?: boolean }) {
  const { data, isPending, isError, refetch } = useWatchlist();
  const toggle = useToggleWatchlist();
  const { gutter, cardWidth } = useGridLayout();
  const { ids: myServices } = useMyServices();
  const { byTitle, checking } = useAvailability(data ?? [], myServices);
  const shown = onlyAvailable
    ? (data ?? []).filter((item) => (byTitle[`${item.type}-${item.id}`] ?? []).length > 0)
    : data ?? [];

  if (isPending) return <ActivityIndicator color={colors.textMuted} style={styles.status} />;

  if (isError) {
    return (
      <View style={[styles.empty, { marginHorizontal: gutter }]}>
        <Text style={styles.emptyText}>Couldn't load your list.</Text>
        <Button label="Try again" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { marginHorizontal: gutter }]}>
        <Ionicons name="bookmark-outline" size={32} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Your list is empty</Text>
        <Text style={styles.emptyText}>
          Tap "My List" on a movie or TV show to save it here. Your list is then available on all your devices.
        </Text>
        <Button label="Find something to watch" icon="compass-outline" onPress={() => router.push("/")} />
      </View>
    );
  }

  if (onlyAvailable && shown.length === 0) {
    return checking ? (
      <ActivityIndicator color={colors.textMuted} style={styles.status} />
    ) : (
      <View style={[styles.empty, { marginHorizontal: gutter }]}>
        <Ionicons name="tv-outline" size={32} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Nothing on your services right now</Text>
        <Text style={styles.emptyText}>
          None of the titles in your list are included in your services. Catalogs change often – check back later.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.grid, { paddingHorizontal: gutter }]}>
      {shown.map((item) => (
        <View key={`${item.type}-${item.id}`} style={{ width: cardWidth }}>
          <MediaCard item={item} width={cardWidth} showType />
          {(byTitle[`${item.type}-${item.id}`] ?? []).length > 0 && (
            <View style={styles.services} accessibilityLabel="On your services">
              {byTitle[`${item.type}-${item.id}`].map((service) => (
                <Image
                  key={service.id}
                  source={imageUrl(service.logoPath, "w92")}
                  style={styles.serviceLogo}
                  accessibilityLabel={service.name}
                />
              ))}
            </View>
          )}
          <Pressable
            onPress={() => toggle.mutate({ item, add: false })}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.title} from your list`}
            hitSlop={6}
            style={({ pressed }) => [styles.remove, pressed && styles.removePressed]}
          >
            <Ionicons name="close" size={16} color={colors.text} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  status: {
    marginTop: spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    rowGap: spacing.lg,
  },
  services: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: spacing.xs,
  },
  serviceLogo: {
    width: 22,
    height: 22,
    borderRadius: 5,
  },
  remove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removePressed: {
    opacity: 0.7,
  },
  empty: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 420,
  },
});
