import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { authErrorMessage, useAuth } from "@/auth/AuthProvider";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useGutter } from "@/hooks/useGutter";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors, spacing } from "@/theme";

/**
 * Account: signed out you see the sign-in form, signed in your profile.
 * When you sign in after coming here from somewhere else (e.g. "My List" on a title),
 * we go back there.
 */
export default function AccountScreen() {
  const gutter = useGutter();
  const router = useRouter();
  const { user, loading } = useAuth();

  const wasSignedIn = useRef<boolean | null>(null);
  useEffect(() => {
    if (loading) return;
    const signedIn = !!user;
    if (wasSignedIn.current === false && signedIn && router.canGoBack()) router.back();
    wasSignedIn.current = signedIn;
  }, [user, loading, router]);

  return (
    <Screen>
      <View style={[styles.page, { paddingHorizontal: gutter }]}>
        {!isSupabaseConfigured ? (
          <NotConfigured />
        ) : loading ? (
          <ActivityIndicator color={colors.textMuted} style={styles.loading} />
        ) : user ? (
          <Profile email={user.email ?? ""} createdAt={user.created_at} provider={user.app_metadata.provider} />
        ) : (
          <AuthForm />
        )}
      </View>
    </Screen>
  );
}

function Profile({ email, createdAt, provider }: { email: string; createdAt: string; provider?: string }) {
  const { signOut, deleteAccount } = useAuth();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const since = new Date(createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" });
  const initial = email.charAt(0).toUpperCase() || "?";

  const onSignOut = async () => {
    setBusy(true);
    setError(null);
    try {
      await signOut();
    } catch (e) {
      setError(authErrorMessage(e));
      setBusy(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
    } catch (e) {
      setError(authErrorMessage(e));
      setDeleting(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
          <Text style={styles.muted}>
            Member since {since}
            {provider === "google" ? " · signed in with Google" : provider === "apple" ? " · signed in with Apple" : ""}
          </Text>
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Sign out" icon="log-out-outline" variant="outline" block loading={busy} onPress={onSignOut} />

      <View style={styles.dangerZone}>
        {confirmDelete ? (
          <>
            <Text style={styles.dangerTitle}>Delete your account?</Text>
            <Text style={styles.muted}>
              Your account and everything in My List are deleted permanently. This can't be undone.
            </Text>
            <View style={styles.dangerButtons}>
              <Button label="Cancel" variant="outline" disabled={deleting} onPress={() => setConfirmDelete(false)} />
              <Button label="Delete permanently" variant="danger" loading={deleting} onPress={onDelete} />
            </View>
          </>
        ) : (
          <Pressable onPress={() => setConfirmDelete(true)} accessibilityRole="button" hitSlop={6}>
            <Text style={styles.dangerLink}>Delete account</Text>
          </Pressable>
        )}
        <Link href="/privacy" style={styles.privacyLink}>
          Privacy policy
        </Link>
      </View>
    </View>
  );
}

function NotConfigured() {
  return (
    <View style={styles.card}>
      <Ionicons name="construct-outline" size={28} color={colors.textMuted} />
      <Text style={styles.title}>Accounts aren't set up yet</Text>
      <Text style={styles.muted}>
        Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env and restart the
        dev server. See the README for step-by-step instructions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: spacing.lg,
    alignItems: "center",
  },
  loading: {
    marginTop: spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.onAccent,
    fontSize: 24,
    fontWeight: "800",
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  email: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  dangerZone: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dangerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  dangerButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  dangerLink: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  privacyLink: {
    color: colors.textMuted,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
});
