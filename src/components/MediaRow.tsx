import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useMediaList, type ListKind } from "@/api/queries";
import type { MediaType } from "@/api/types";
import { colors, spacing } from "@/theme";
import { MediaCard } from "./MediaCard";

interface Props {
  title: string;
  kind: ListKind;
  type: MediaType;
}

/**
 * En horisontell rad med affischer. Ersätter de fyra karusellbiblioteken
 * i det gamla projektet – FlatList fungerar likadant på webb, iOS och Android.
 */
export function MediaRow({ title, kind, type }: Props) {
  const { data, isPending, isError } = useMediaList(kind, type);

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      {isPending ? (
        <ActivityIndicator color={colors.textMuted} style={styles.status} />
      ) : isError ? (
        <Text style={[styles.status, styles.error]}>Kunde inte hämta listan.</Text>
      ) : (
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) => <MediaCard item={item} />}
          contentContainerStyle={styles.list}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  heading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: spacing.md,
  },
  list: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  status: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignSelf: "flex-start",
  },
  error: {
    color: colors.textMuted,
  },
});
