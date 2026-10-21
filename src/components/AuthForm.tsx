import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, type ComponentProps } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { APPLE_ENABLED, authErrorMessage, GOOGLE_ENABLED, SignInCancelled, useAuth } from "@/auth/AuthProvider";
import { colors, noFocusOutline, spacing } from "@/theme";
import { Button } from "./Button";

type Mode = "signIn" | "signUp" | "reset";

const TITLES: Record<Mode, string> = {
  signIn: "Logga in",
  signUp: "Skapa konto",
  reset: "Glömt lösenordet?",
};

const SUBTITLES: Record<Mode, string> = {
  signIn: "Välkommen tillbaka! Logga in för att se din lista.",
  signUp: "Med ett konto kan du spara filmer och serier i din lista och se den på alla dina enheter.",
  reset: "Skriv in din e-postadress så skickar vi en länk där du kan välja ett nytt lösenord.",
};

/** Inloggning, registrering och "glömt lösenord". */
export function AuthForm() {
  const { signIn, signUp, signInWithGoogle, signInWithApple, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignUp = mode === "signUp";
  const isReset = mode === "reset";
  const validEmail = email.trim().length > 3 && email.includes("@");
  const canSubmit = isReset ? validEmail : validEmail && password.length >= 6;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
    setPassword("");
  };

  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy("email");
    setError(null);
    setNotice(null);
    try {
      if (isReset) {
        await resetPassword(email);
        setNotice(
          `Om det finns ett konto för ${email.trim()} har vi skickat en länk dit. Öppna den på den här enheten för att välja ett nytt lösenord.`
        );
      } else if (isSignUp) {
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

  const social = async (provider: "google" | "apple") => {
    setBusy(provider);
    setError(null);
    try {
      await (provider === "google" ? signInWithGoogle() : signInWithApple());
    } catch (e) {
      // Avbröt man själv visas inget fel.
      if (!(e instanceof SignInCancelled)) setError(authErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const showSocial = (GOOGLE_ENABLED || APPLE_ENABLED) && !isReset;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{TITLES[mode]}</Text>
      <Text style={styles.subtitle}>{SUBTITLES[mode]}</Text>

      {showSocial && (
        <>
          {APPLE_ENABLED &&
            (Platform.OS === "ios" ? (
              // Apple kräver sin egen knapp i iOS-appar.
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  isSignUp
                    ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                    : AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
                }
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                cornerRadius={8}
                style={styles.appleButton}
                onPress={() => social("apple")}
              />
            ) : (
              <Button
                label="Fortsätt med Apple"
                icon="logo-apple"
                variant="outline"
                block
                loading={busy === "apple"}
                disabled={busy !== null}
                onPress={() => social("apple")}
              />
            ))}
          {GOOGLE_ENABLED && (
            <Button
              label="Fortsätt med Google"
              icon="logo-google"
              variant="outline"
              block
              loading={busy === "google"}
              disabled={busy !== null}
              onPress={() => social("google")}
            />
          )}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>eller med e-post</Text>
            <View style={styles.line} />
          </View>
        </>
      )}

      <Field
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="E-postadress"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        onSubmitEditing={isReset ? submit : undefined}
      />
      {!isReset && (
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
      )}

      {mode === "signIn" && (
        <Pressable onPress={() => switchMode("reset")} accessibilityRole="button" hitSlop={8} style={styles.forgot}>
          <Text style={styles.forgotText}>Glömt lösenordet?</Text>
        </Pressable>
      )}

      {error && <FormMessage kind="error" text={error} />}
      {notice && <FormMessage kind="notice" text={notice} />}

      <Button
        label={isReset ? "Skicka länk" : TITLES[mode]}
        block
        loading={busy === "email"}
        disabled={!canSubmit || busy !== null}
        onPress={submit}
      />

      {isReset ? (
        <Pressable onPress={() => switchMode("signIn")} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.switch}>
            <Text style={styles.switchLink}>← Tillbaka till inloggningen</Text>
          </Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => switchMode(isSignUp ? "signIn" : "signUp")} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.switch}>
            {isSignUp ? "Har du redan ett konto? " : "Inget konto? "}
            <Text style={styles.switchLink}>{isSignUp ? "Logga in" : "Skapa ett gratis"}</Text>
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/** Fel- eller bekräftelseruta i formulär. */
export function FormMessage({ kind, text }: { kind: "error" | "notice"; text: string }) {
  const isError = kind === "error";
  return (
    <View style={[styles.message, isError ? styles.errorBox : styles.noticeBox]}>
      <Ionicons
        name={isError ? "alert-circle" : "checkmark-circle"}
        size={18}
        color={isError ? colors.accent : colors.success}
      />
      <Text style={styles.messageText}>{text}</Text>
    </View>
  );
}

type FieldProps = ComponentProps<typeof TextInput> & {
  icon: ComponentProps<typeof Ionicons>["name"];
};

/** Textfält med ikon och fokusram – används i alla kontoformulär. */
export function Field({ icon, style, ...props }: FieldProps) {
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
  appleButton: {
    width: "100%",
    height: 48,
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
  forgot: {
    alignSelf: "flex-end",
    marginTop: -spacing.xs,
  },
  forgotText: {
    color: colors.textMuted,
    fontSize: 14,
    textDecorationLine: "underline",
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
