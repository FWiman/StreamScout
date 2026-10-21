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
 * Hit leder länken i mejlet "återställ lösenord". Länken loggar in användaren
 * tillfälligt (webben: automatiskt via adressen, mobil: i AuthProvider), och här
 * väljer man ett nytt lösenord.
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
      <Stack.Screen options={{ title: "Nytt lösenord" }} />
      <View style={[styles.page, { paddingHorizontal: gutter }]}>
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator color={colors.textMuted} />
          ) : done ? (
            <>
              <Text style={styles.title}>Lösenordet är bytt</Text>
              <FormMessage kind="notice" text="Klart! Du är inloggad med ditt nya lösenord." />
              <Button label="Till Min lista" icon="bookmark" block onPress={() => router.replace("/account")} />
            </>
          ) : !user ? (
            <>
              <Text style={styles.title}>Länken fungerar inte</Text>
              <Text style={styles.subtitle}>
                Länken har gått ut, har redan använts eller öppnades på en annan enhet än den där du begärde den.
                Begär en ny under "Glömt lösenordet?" och öppna den i samma webbläsare eller app.
              </Text>
              <Button label="Till inloggningen" block onPress={() => router.replace("/account")} />
            </>
          ) : (
            <>
              <Text style={styles.title}>Välj nytt lösenord</Text>
              <Text style={styles.subtitle}>För kontot {user.email}</Text>
              <Field
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="Nytt lösenord (minst 6 tecken)"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
              />
              <Field
                icon="lock-closed-outline"
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Upprepa lösenordet"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                onSubmitEditing={submit}
              />
              {mismatch && <Text style={styles.hint}>Lösenorden matchar inte.</Text>}
              {error && <FormMessage kind="error" text={error} />}
              <Button label="Spara nytt lösenord" block loading={busy} disabled={!canSubmit} onPress={submit} />
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
    color: colors.accent,
    fontSize: 13,
    marginTop: -spacing.sm,
  },
});
