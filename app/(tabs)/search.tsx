import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSearch } from "@/api/queries";
import { MediaCard } from "@/components/MediaCard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { colors, MAX_CONTENT_WIDTH, spacing } from "@/theme";

const CARD_MIN_WIDTH = 120;

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const { data, isFetching, isError } = useSearch(debouncedQuery);

  // Räkna ut hur många kolumner som får plats, så rutnätet fungerar både på mobil och webb.
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - spacing.md * 2;
  const columns = Math.max(2, Math.floor((contentWidth + spacing.md) / (CARD_MIN_WIDTH + spacing.md)));
  const cardWidth = (contentWidth - spacing.md * (columns - 1)) / columns;

  const hasQuery = debouncedQuery.trim().length > 1;

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Sök filmer och serier…"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      {isFetching && <ActivityIndicator color={colors.textMuted} style={styles.message} />}
      {isError && <Text style={styles.message}>Något gick fel. Försök igen.</Text>}
      {hasQuery && !isFetching && data?.length === 0 && (
        <Text style={styles.message}>Inga träffar för "{debouncedQuery.trim()}".</Text>
      )}

      <FlatList
        key={columns} // FlatList kräver ny nyckel när antalet kolumner ändras
        data={hasQuery ? data : []}
        numColumns={columns}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={({ item }) => <MediaCard item={item} width={cardWidth} />}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.grid}
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: "center",
    backgroundColor: colors.background,
  },
  input: {
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
  },
  message: {
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  row: {
    gap: spacing.md,
  },
});
