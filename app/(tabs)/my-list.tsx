import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useWatchlist } from "@/api/watchlist";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { WatchlistGrid } from "@/components/WatchlistGrid";
import { useGutter } from "@/hooks/useGutter";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors, spacing } from "@/theme";

/** My List: the user's saved titles. Signed out it explains the list and links to sign in. */
export default function MyListScreen() {
  const gutter = useGutter();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { data } = useWatchlist();

  return (
    <Screen>
      <View style={styles.page}>
        <View style={[styles.header, { paddingHorizontal: gutter }]}>
          <Text style={styles.heading}>My List</Text>
          {user && data && data.length > 0 && (
            <Text style={styles.count}>
              {data.length} {data.length === 1 ? "title" : "titles"}
            </Text>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.textMuted} style={styles.loading} />
        ) : user ? (
          <WatchlistGrid />
        ) : (
          <View style={[styles.empty, { marginHorizontal: gutter }]}>
            <Ionicons name="bookmark-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Save movies and shows for later</Text>
            <Text style={styles.emptyText}>
              Sign in to build your list and see it on all your devices.
            </Text>
            {isSupabaseConfigured && (
              <Button label="Sign in" icon="person-circle-outline" onPress={() => router.push("/account")} />
            )}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  heading: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  count: {
    color: colors.textMuted,
    fontSize: 15,
  },
  loading: {
    marginTop: spacing.xl,
  },
  empty: {
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.lg,
    maxWidth: 520,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
