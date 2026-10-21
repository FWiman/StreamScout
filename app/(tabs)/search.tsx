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
import { useLocalSearchParams } from "expo-router";
import { useSearch } from "@/api/queries";
import { MediaCard } from "@/components/MediaCard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useIsWide } from "@/hooks/useIsWide";
import { colors, MAX_CONTENT_WIDTH, spacing } from "@/theme";

export default function SearchScreen() {
  const isWide = useIsWide();
  // På datorn skrivs sökningen i toppmenyn och kommer hit som ?q=…
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [localQuery, setLocalQuery] = useState(q ?? "");
  const query = isWide ? q ?? "" : localQuery;

  const debouncedQuery = useDebouncedValue(query);
  const { data, isFetching, isError } = useSearch(debouncedQuery);

  // Räkna ut hur många kolumner som får plats, så rutnätet fungerar både på mobil och webb.
  const { width } = useWindowDimensions();
  const cardMinWidth = isWide ? 160 : 120;
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH) - spacing.md * 2;
  const columns = Math.max(2, Math.floor((contentWidth + spacing.md) / (cardMinWidth + spacing.md)));
  const cardWidth = (contentWidth - spacing.md * (columns - 1)) / columns;

  const hasQuery = debouncedQuery.trim().length > 1;

  return (
    <View style={styles.container}>
      {isWide ? (
        <Text style={styles.heading}>
          {hasQuery ? `Sökresultat för "${debouncedQuery.trim()}"` : "Sök med fältet högst upp"}
        </Text>
      ) : (
        <TextInput
          value={localQuery}
          onChangeText={setLocalQuery}
          placeholder="Sök filmer och serier…"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      )}

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
  heading: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    margin: spacing.md,
    marginTop: spacing.lg,
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
