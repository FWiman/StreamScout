import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useWatchlist } from "@/api/watchlist";
import { useAuth } from "@/auth/AuthProvider";
import { Screen } from "@/components/Screen";
import { SignInPrompt } from "@/components/SignInPrompt";
import { WatchlistGrid } from "@/components/WatchlistGrid";
import { useGutter } from "@/hooks/useGutter";
import { colors, spacing } from "@/theme";

/** My List: the user's saved titles. Signed out it shows a centered sign-in card. */
export default function MyListScreen() {
  const gutter = useGutter();
  const { user, loading } = useAuth();
  const { data } = useWatchlist();

  return (
    <Screen>
      <View style={styles.page}>
        {/* Signed out, the centered sign-in card stands on its own, like the account page. */}
        {(loading || user) && (
          <View style={[styles.header, { paddingHorizontal: gutter }]}>
            <Text style={styles.heading}>My List</Text>
            {user && data && data.length > 0 && (
              <Text style={styles.count}>
                {data.length} {data.length === 1 ? "title" : "titles"}
              </Text>
            )}
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={colors.textMuted} style={styles.loading} />
        ) : user ? (
          <WatchlistGrid />
        ) : (
          <View style={{ paddingHorizontal: gutter }}>
            <SignInPrompt
              icon="bookmark-outline"
              title="Save movies and shows for later"
              text="Sign in to build your list and see it on all your devices."
            />
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
});
