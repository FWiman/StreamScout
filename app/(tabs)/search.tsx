import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { genresFor } from "@/api/genres";
import { useMyServices } from "@/api/myServices";
import { useFilteredResults, useSearch, useStreamingServices } from "@/api/queries";
import type { SearchFilter } from "@/api/tmdb";
import type { MediaItem } from "@/api/types";
import { Chip } from "@/components/Chip";
import { MediaCard } from "@/components/MediaCard";
import { Footer } from "@/components/Footer";
import { GenrePicker } from "@/components/GenrePicker";
import { MediaRow } from "@/components/MediaRow";
import { SearchResultRow } from "@/components/SearchResultRow";
import { ServicePicker, type ServiceSelection } from "@/components/ServicePicker";
import { TopResult } from "@/components/TopResult";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useGutter } from "@/hooks/useGutter";
import { useIsWide } from "@/hooks/useIsWide";
import { colors, noFocusOutline, spacing } from "@/theme";

const FILTERS: { value: SearchFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
];

export default function SearchScreen() {
  const isWide = useIsWide();
  // On desktop the query is typed in the top nav and arrives here as ?q=…
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [localQuery, setLocalQuery] = useState(q ?? "");
  const [focused, setFocused] = useState(false);
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [service, setService] = useState<ServiceSelection>(null);
  const { ids: myServices } = useMyServices();
  const serviceIds = service === "mine" ? myServices : service !== null ? [service] : null;
  const [genreKey, setGenreKey] = useState<string | null>(null);
  // A genre may not exist for the chosen type (e.g. Reality for movies) – then it's ignored.
  const genre = genresFor(filter).find((g) => g.key === genreKey) ?? null;
  const serviceType = filter === "tv" ? "tv" : "movie";
  const { data: services } = useStreamingServices(serviceType);
  const serviceName = service === "mine" ? "your services" : services?.find((s) => s.id === service)?.name;
  const query = isWide ? q ?? "" : localQuery;

  const debouncedQuery = useDebouncedValue(query, 300).trim();
  const hasQuery = debouncedQuery.length > 1;
  const { items: allItems, data, isPending, isFetching, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSearch(debouncedQuery, filter);
  const { items, checking } = useFilteredResults(allItems, serviceIds, genre);
  const isFiltered = service !== null || genre !== null;

  // Filters can leave few hits per page – fetch a few more pages automatically so the list isn't empty.
  const loadedPages = data?.pages.length ?? 0;
  const canAutoLoad = isFiltered && hasQuery && hasNextPage && loadedPages < 5;
  useEffect(() => {
    if (canAutoLoad && !checking && !isFetchingNextPage && items.length < 12) fetchNextPage();
  }, [canAutoLoad, checking, isFetchingNextPage, items.length, fetchNextPage]);
  const searchingFilters = isFiltered && (checking || (canAutoLoad && items.length < 12));

  // Desktop: poster grid. Phone: list of rows (easier to skim with a thumb).
  const { width } = useWindowDimensions();
  const gutter = useGutter();
  const contentWidth = width - gutter * 2;
  const columns = isWide ? Math.max(3, Math.floor((contentWidth + spacing.md) / (160 + spacing.md))) : 1;
  const cardWidth = (contentWidth - spacing.md * (columns - 1)) / columns;

  // The first hit is shown large at the top, the rest below.
  const [topResult, ...rest] = hasQuery ? items : [];
  const openTitle = (item: MediaItem) => router.push(`/title/${item.type}/${item.id}`);

  const header = (
    <View style={[styles.header, { paddingHorizontal: gutter }]}>
      {isWide ? (
        <Text style={styles.heading}>
          {hasQuery ? `Results for "${debouncedQuery}"` : "Search"}
        </Text>
      ) : (
        <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={localQuery}
            onChangeText={setLocalQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search movies and TV shows"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, noFocusOutline]}
            autoCorrect={false}
            returnKeyType="search"
          />
          {localQuery.length > 0 && (
            <Pressable onPress={() => setLocalQuery("")} accessibilityLabel="Clear search" hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      )}

      {hasQuery && (
        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Chip key={f.value} label={f.label} selected={f.value === filter} onPress={() => setFilter(f.value)} />
          ))}
        </View>
      )}
      {hasQuery && (
        // The pickers pad themselves with the gutter, so they can scroll to the screen edge.
        <View style={[styles.pickers, { marginHorizontal: -gutter }]}>
          <ServicePicker type={serviceType} selected={service} onSelect={setService} />
          <GenrePicker type={filter} selected={genre?.key ?? null} onSelect={setGenreKey} />
        </View>
      )}
      {hasQuery && isFiltered && (
        <Text style={styles.message}>
          {[genre?.name, serviceName && `on ${serviceName}`].filter(Boolean).join(" ")}
          {searchingFilters ? " – checking more titles…" : ""}
        </Text>
      )}

      {hasQuery && isPending && <ActivityIndicator color={colors.textMuted} style={styles.alignStart} />}
      {isError && <Text style={styles.message}>Something went wrong. Please try again.</Text>}
      {hasQuery && !isFetching && !isError && !searchingFilters && items.length === 0 && (
        <Text style={styles.message}>
          {isFiltered
            ? `No results for "${debouncedQuery}" with these filters.`
            : `No results for "${debouncedQuery}". Try a different spelling.`}
        </Text>
      )}

      {topResult && <TopResult item={topResult} wide={isWide} />}
      {rest.length > 0 && <Text style={styles.subheading}>More results</Text>}
    </View>
  );

  // Before searching: show something to browse instead of an empty page.
  // Everything lives in the same FlatList, so the search field isn't replaced (and doesn't lose focus) when results appear.
  const footer = !hasQuery ? (
    <View style={styles.browse}>
      <Text style={[styles.message, { paddingHorizontal: gutter }]}>
        {isWide ? "Start typing in the search field at the top." : "Type at least two letters to search."}
      </Text>
      <MediaRow title="Trending movies" kind="trending" type="movie" />
      <MediaRow title="Trending TV shows" kind="trending" type="tv" />
      <Footer />
    </View>
  ) : isFetchingNextPage ? (
    <ActivityIndicator color={colors.textMuted} style={styles.footer} />
  ) : !hasNextPage && items.length > 0 ? (
    <Footer />
  ) : undefined;

  return (
    <View style={styles.page}>
      <FlatList
        key={columns} // FlatList needs a new key when the number of columns changes
        style={styles.list}
        showsVerticalScrollIndicator={false}
        data={rest}
        numColumns={columns}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) =>
          isWide ? (
            <MediaCard item={item} width={cardWidth} showType={filter === "all"} />
          ) : (
            <SearchResultRow item={item} onPress={() => openTitle(item)} />
          )
        }
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        columnWrapperStyle={columns > 1 ? [styles.row, { paddingHorizontal: gutter }] : undefined}
        contentContainerStyle={[styles.grid, !isWide && styles.listMobile]}
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
  },
  browse: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  subheading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  listMobile: {
    gap: 0,
    paddingHorizontal: spacing.sm,
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
  },
  filters: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  pickers: {
    gap: spacing.sm,
  },
  message: {
    color: colors.textMuted,
    fontSize: 15,
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
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
