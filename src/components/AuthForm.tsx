import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { authErrorMessage, useAuth } from "@/auth/AuthProvider";
import { colors, noFocusOutline, spacing } from "@/theme";
import { Button } from "./Button";

type Mode = "signIn" | "signUp";

/** Inloggning och registrering: Google eller e-post + lösenord. */
export function AuthForm() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignUp = mode === "signUp";
  const canSubmit = email.trim().length > 3 && password.length >= 6;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy("email");
    setError(null);
    setNotice(null);
    try {
      if (isSignUp) {
        const needsConfirmation = await signUp(email, password);
        if (needsConfirmation) {
          setNotice(`Nästan klart! Vi har skickat en bekräftelselänk till ${email.trim()}. Öppna den för att aktivera kontot.`);
          setPassword("");
        }
      } else {
        await signIn(email, password);
      }
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const google = async () => {
    setBusy("google");
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{isSignUp ? "Skapa konto" : "Logga in"}</Text>
      <Text style={styles.subtitle}>
        {isSignUp
          ? "Med ett konto kan du spara filmer och serier i din lista och se den på alla dina enheter."
          : "Välkommen tillbaka! Logga in för att se din lista."}
      </Text>

      <Button
        label="Fortsätt med Google"
        icon="logo-google"
        variant="outline"
        block
        loading={busy === "google"}
        disabled={busy !== null}
        onPress={google}
      />

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>eller med e-post</Text>
        <View style={styles.line} />
      </View>

      <Field
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="E-postadress"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <Field
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder={isSignUp ? "Lösenord (minst 6 tecken)" : "Lösenord"}
        secureTextEntry
        autoComplete={isSignUp ? "new-password" : "current-password"}
        textContentType={isSignUp ? "newPassword" : "password"}
        onSubmitEditing={submit}
      />

      {error && (
        <View style={[styles.message, styles.errorBox]}>
          <Ionicons name="alert-circle" size={18} color={colors.accent} />
          <Text style={styles.messageText}>{error}</Text>
        </View>
      )}
      {notice && (
        <View style={[styles.message, styles.noticeBox]}>
          <Ionicons name="mail-unread-outline" size={18} color={colors.success} />
          <Text style={styles.messageText}>{notice}</Text>
        </View>
      )}

      <Button
        label={isSignUp ? "Skapa konto" : "Logga in"}
        block
        loading={busy === "email"}
        disabled={!canSubmit || busy !== null}
        onPress={submit}
      />

      <Pressable onPress={() => switchMode(isSignUp ? "signIn" : "signUp")} accessibilityRole="button" hitSlop={8}>
        <Text style={styles.switch}>
          {isSignUp ? "Har du redan ett konto? " : "Inget konto? "}
          <Text style={styles.switchLink}>{isSignUp ? "Logga in" : "Skapa ett gratis"}</Text>
        </Text>
      </Pressable>
    </View>
  );
}

type FieldProps = ComponentProps<typeof TextInput> & {
  icon: ComponentProps<typeof Ionicons>["name"];
};

function Field({ icon, style, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      <Ionicons name={icon} size={18} color={focused ? colors.text : colors.textMuted} />
      <TextInput
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, noFocusOutline, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldFocused: {
    borderColor: colors.accent,
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.text,
    fontSize: 16,
  },
  message: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorBox: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  noticeBox: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  messageText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  switch: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
  },
  switchLink: {
    color: colors.text,
    fontWeight: "700",
  },
});
