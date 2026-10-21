import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { authErrorMessage, useAuth } from "@/auth/AuthProvider";
import { AuthForm } from "@/components/AuthForm";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useGutter } from "@/hooks/useGutter";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors, spacing } from "@/theme";

/** Kontosidan: inloggningsformulär för utloggade, profil för inloggade. */
export default function AccountScreen() {
  const gutter = useGutter();
  const { user, loading } = useAuth();

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
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const since = new Date(createdAt).toLocaleDateString("sv-SE", { year: "numeric", month: "long" });
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
            Medlem sedan {since}
            {provider === "google" ? " · inloggad med Google" : ""}
          </Text>
        </View>
      </View>

      <View style={styles.placeholder}>
        <Ionicons name="bookmark-outline" size={22} color={colors.textMuted} />
        <Text style={styles.placeholderText}>
          Snart kan du spara filmer och serier i din egen lista här – och se den på alla dina enheter.
        </Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Logga ut" icon="log-out-outline" variant="outline" block loading={busy} onPress={onSignOut} />
    </View>
  );
}

function NotConfigured() {
  return (
    <View style={styles.card}>
      <Ionicons name="construct-outline" size={28} color={colors.textMuted} />
      <Text style={styles.title}>Konton är inte uppsatta än</Text>
      <Text style={styles.muted}>
        Lägg in EXPO_PUBLIC_SUPABASE_URL och EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY i .env och starta om
        utvecklingsservern. Se README för steg-för-steg.
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
    color: colors.text,
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
  placeholder: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  placeholderText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: colors.accent,
    fontSize: 14,
  },
});
