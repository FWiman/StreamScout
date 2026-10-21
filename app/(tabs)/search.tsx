import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSearch } from "@/api/queries";
import type { SearchFilter } from "@/api/tmdb";
import { MediaCard } from "@/components/MediaCard";
import { MediaRow } from "@/components/MediaRow";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useIsWide } from "@/hooks/useIsWide";
import { colors, MAX_CONTENT_WIDTH, spacing } from "@/theme";

const FILTERS: { value: SearchFilter; label: string }[] = [
  { value: "all", label: "Alla" },
  { value: "movie", label: "Filmer" },
  { value: "tv", label: "Serier" },
];

export default function SearchScreen() {
  const isWide = useIsWide();
  // På datorn skrivs sökningen i toppmenyn och kommer hit som ?q=…
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [localQuery, setLocalQuery] = useState(q ?? "");
  const [focused, setFocused] = useState(false);
  const [filter, setFilter] = useState<SearchFilter>("all");
  const query = isWide ? q ?? "" : localQuery;

  const debouncedQuery = useDebouncedValue(query, 300).trim();
  const hasQuery = debouncedQuery.length > 1;
  const { items, isPending, isFetching, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSearch(debouncedQuery, filter);

  // Räkna ut hur många kolumner som får plats, så rutnätet fungerar både på mobil och webb.
  const { width } = useWindowDimensions();
  const cardMinWidth = isWide ? 160 : 105;
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - spacing.md * 2;
  const columns = Math.max(3, Math.floor((contentWidth + spacing.md) / (cardMinWidth + spacing.md)));
  const cardWidth = (contentWidth - spacing.md * (columns - 1)) / columns;

  const header = (
    <View style={styles.header}>
      {isWide ? (
        <Text style={styles.heading}>
          {hasQuery ? `Sökresultat för "${debouncedQuery}"` : "Sök"}
        </Text>
      ) : (
        <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={localQuery}
            onChangeText={setLocalQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Sök filmer och serier"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCorrect={false}
            returnKeyType="search"
          />
          {localQuery.length > 0 && (
            <Pressable onPress={() => setLocalQuery("")} accessibilityLabel="Rensa sökningen" hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      )}

      {hasQuery && (
        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = f.value === filter;
            return (
              <Pressable
                key={f.value}
                onPress={() => setFilter(f.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {hasQuery && isPending && <ActivityIndicator color={colors.textMuted} style={styles.alignStart} />}
      {isError && <Text style={styles.message}>Något gick fel. Försök igen.</Text>}
      {hasQuery && !isFetching && !isError && items.length === 0 && (
        <Text style={styles.message}>Inga träffar för "{debouncedQuery}". Prova ett annat stavsätt.</Text>
      )}
    </View>
  );

  // Innan man har sökt: visa något att bläddra i i stället för en tom sida.
  // Allt ligger i samma FlatList, så sökfältet inte byts ut (och tappar fokus) när resultaten dyker upp.
  const footer = !hasQuery ? (
    <View style={styles.browse}>
      <Text style={styles.message}>
        {isWide ? "Börja skriva i sökfältet högst upp." : "Skriv minst två bokstäver för att söka."}
      </Text>
      <MediaRow title="Trendande filmer" kind="trending" type="movie" />
      <MediaRow title="Trendande serier" kind="trending" type="tv" />
    </View>
  ) : isFetchingNextPage ? (
    <ActivityIndicator color={colors.textMuted} style={styles.footer} />
  ) : undefined;

  return (
    <View style={styles.page}>
      <FlatList
        key={columns} // FlatList kräver ny nyckel när antalet kolumner ändras
        style={styles.list}
        data={hasQuery ? items : []}
        numColumns={columns}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => <MediaCard item={item} width={cardWidth} showType={filter === "all"} />}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        onEndReached={() => {
          if (hasQuery && hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={1}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
  },
  browse: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  heading: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputWrapFocused: {
    borderColor: colors.accent,
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.text,
    fontSize: 16,
    ...Platform.select({ web: { outlineWidth: 0 }, default: {} }),
  },
  filters: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.background,
  },
  message: {
    color: colors.textMuted,
    fontSize: 15,
    paddingHorizontal: spacing.md,
  },
  alignStart: {
    alignSelf: "flex-start",
  },
  grid: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  row: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
