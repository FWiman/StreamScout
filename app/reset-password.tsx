import { router, Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { authErrorMessage, useAuth } from "@/auth/AuthProvider";
import { Field, FormMessage } from "@/components/AuthForm";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { useGutter } from "@/hooks/useGutter";
import { colors, spacing } from "@/theme";

/**
 * The link in the "reset password" email leads here. The link signs the user in
 * temporarily (web: automatically via the URL, mobile: in AuthProvider), and here
 * they choose a new password.
 */
export default function ResetPasswordScreen() {
  const gutter = useGutter();
  const { user, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = password.length >= 6 && password === confirm && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: "New password" }} />
      <View style={[styles.page, { paddingHorizontal: gutter }]}>
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator color={colors.textMuted} />
          ) : done ? (
            <>
              <Text style={styles.title}>Password changed</Text>
              <FormMessage kind="notice" text="Done! You're signed in with your new password." />
              <Button label="Go to My List" icon="bookmark" block onPress={() => router.replace("/my-list")} />
            </>
          ) : !user ? (
            <>
              <Text style={styles.title}>This link doesn't work</Text>
              <Text style={styles.subtitle}>
                The link has expired, has already been used, or was opened on a different device than the one you
                requested it on. Request a new one under "Forgot password?" and open it in the same browser or app.
              </Text>
              <Button label="Back to sign in" block onPress={() => router.replace("/my-list")} />
            </>
          ) : (
            <>
              <Text style={styles.title}>Choose a new password</Text>
              <Text style={styles.subtitle}>For the account {user.email}</Text>
              <Field
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="New password (at least 6 characters)"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
              />
              <Field
                icon="lock-closed-outline"
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Repeat the password"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                onSubmitEditing={submit}
              />
              {mismatch && <Text style={styles.hint}>The passwords don't match.</Text>}
              {error && <FormMessage kind="error" text={error} />}
              <Button label="Save new password" block loading={busy} disabled={!canSubmit} onPress={submit} />
            </>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: spacing.lg,
    alignItems: "center",
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
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  hint: {
    color: colors.danger,
    fontSize: 13,
    marginTop: -spacing.sm,
  },
});
