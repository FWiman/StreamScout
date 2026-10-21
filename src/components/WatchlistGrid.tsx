import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useToggleWatchlist, useWatchlist } from "@/api/watchlist";
import { useGutter } from "@/hooks/useGutter";
import { useIsWide } from "@/hooks/useIsWide";
import { colors, spacing } from "@/theme";
import { Button } from "./Button";
import { MediaCard } from "./MediaCard";

/** Rutnät med användarens sparade titlar. Krysset i hörnet tar bort en titel. */
export function WatchlistGrid() {
  const { data, isPending, isError, refetch } = useWatchlist();
  const toggle = useToggleWatchlist();
  const isWide = useIsWide();
  const gutter = useGutter();
  const { width } = useWindowDimensions();

  const contentWidth = width - gutter * 2;
  const minCard = isWide ? 160 : 100;
  const columns = Math.max(3, Math.floor((contentWidth + spacing.md) / (minCard + spacing.md)));
  const cardWidth = Math.floor((contentWidth - spacing.md * (columns - 1)) / columns);

  if (isPending) return <ActivityIndicator color={colors.textMuted} style={styles.status} />;

  if (isError) {
    return (
      <View style={[styles.empty, { marginHorizontal: gutter }]}>
        <Text style={styles.emptyText}>Kunde inte hämta din lista.</Text>
        <Button label="Försök igen" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={[styles.empty, { marginHorizontal: gutter }]}>
        <Ionicons name="bookmark-outline" size={32} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>Din lista är tom</Text>
        <Text style={styles.emptyText}>
          Tryck på "Min lista" på en film eller serie för att spara den här. Listan finns sedan på alla dina enheter.
        </Text>
        <Button label="Hitta något att se" icon="compass-outline" onPress={() => router.push("/")} />
      </View>
    );
  }

  return (
    <View style={[styles.grid, { paddingHorizontal: gutter }]}>
      {data.map((item) => (
        <View key={`${item.type}-${item.id}`} style={{ width: cardWidth }}>
          <MediaCard item={item} width={cardWidth} showType />
          <Pressable
            onPress={() => toggle.mutate({ item, add: false })}
            accessibilityRole="button"
            accessibilityLabel={`Ta bort ${item.title} från listan`}
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
