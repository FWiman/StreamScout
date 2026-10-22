import type { Provider, Session, User } from "@supabase/supabase-js";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

// Closes the sign-in popup correctly when Google sends the user back (web).
WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True while a saved session is being restored at startup. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Returns true if the user must confirm their email before signing in. */
  signUp: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  /** iPhone: Apple's native sign-in (Face ID). Web/Android: Apple's sign-in page. */
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Sends an email with a link to choose a new password. */
  resetPassword: (email: string) => Promise<void>;
  /** Changes the signed-in user's password (e.g. after the reset link). */
  updatePassword: (password: string) => Promise<void>;
}

/** Google sign-in is shown once it's set up in Supabase (EXPO_PUBLIC_AUTH_GOOGLE=true in .env). */
export const GOOGLE_ENABLED = process.env.EXPO_PUBLIC_AUTH_GOOGLE === "true";

/**
 * Sign in with Apple:
 * - iPhone (EXPO_PUBLIC_AUTH_APPLE=true): Apple's built-in sign-in. Free, works in Expo Go.
 * - Web/Android (EXPO_PUBLIC_AUTH_APPLE_WEB=true): needs a Services ID + key from a paid Apple Developer account.
 */
export const APPLE_ENABLED =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_AUTH_APPLE === "true"
    : process.env.EXPO_PUBLIC_AUTH_APPLE_WEB === "true";

/** Thrown when the user cancels a sign-in themselves – nothing to show. */
export class SignInCancelled extends Error {
  constructor() {
    super("cancelled");
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Where Supabase sends the user back after Google, email confirmation or password reset. */
function redirectUrl(path = "/account") {
  // Web: http://localhost:8081/account  ·  Expo Go: exp://…/--/account  ·  App: streamwatch://account
  return Linking.createURL(path);
}

/**
 * Redirect URL for OAuth (Google, Apple on web/Android).
 *
 * Supabase rejects redirect URLs whose host is an IP address – even when they match the
 * allow list – and falls back to the Site URL (http://localhost:8081), which a phone can't
 * open. Expo Go's URLs use the computer's LAN IP (exp://192.168.x.x:8081/--/account).
 *
 * On iOS the auth session catches the redirect by its scheme ("exp") before loading it, so
 * the host doesn't matter: swap the IP for "localhost", which Supabase accepts. Expo Go then
 * never opens that URL – we read the code from it and exchange it for a session.
 * (Real app builds use streamwatch://… and are unaffected.)
 */
function oauthRedirectUrl() {
  const url = redirectUrl();
  if (Platform.OS === "ios") return url.replace(/^exp:\/\/[^/:]+/, "exp://localhost");
  return url;
}

/** Supabase error messages in plain, friendly English. */
export function authErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "Wrong email or password.";
  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider"))
    return "This sign-in method isn't enabled in Supabase yet.";
  if (lower.includes("email not confirmed")) return "Please confirm your email first – check your inbox.";
  if (lower.includes("already registered") || lower.includes("already been registered"))
    return "An account with that email already exists.";
  if (lower.includes("password should be at least")) return "The password must be at least 6 characters.";
  if (lower.includes("unable to validate email") || lower.includes("invalid email"))
    return "That doesn't look like a valid email address.";
  if (lower.includes("rate limit") || lower.includes("too many"))
    return "Too many attempts. Wait a moment and try again.";
  if (lower.includes("network") || lower.includes("fetch")) return "Can't reach the server. Check your connection.";
  if (lower.includes("code verifier") || lower.includes("auth session missing") || lower.includes("expired"))
    return "The link has expired or was opened on another device. Request a new one and open it in the same browser/app.";
  if (lower.includes("should be different")) return "The new password must be different from the old one.";
  return `Something went wrong: ${message}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setLoading(false));

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => data.subscription.unsubscribe();
  }, []);

  // Mobile: links from emails (confirmation, reset) open the app with ?code=… in the URL.
  // The web handles this automatically (detectSessionInUrl in supabase.ts).
  const handledCodes = useRef(new Set<string>());
  useEffect(() => {
    if (!isSupabaseConfigured || Platform.OS === "web") return;

    const handleUrl = async (url: string | null) => {
      if (!url) return;
      const code = Linking.parse(url).queryParams?.code;
      if (typeof code !== "string" || handledCodes.current.has(code)) return;
      handledCodes.current.add(code);
      await supabase.auth.exchangeCodeForSession(code).catch(() => {
        // Invalid or old link – the account page just shows the sign-in form as usual.
      });
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  /**
   * Sign-in via an external page (Google, Apple on web/Android).
   * Web: the whole page redirects there and back. Mobile: we open the page in an
   * auth session window and exchange the code we get back for a session.
   */
  const signInWithOAuthProvider = async (provider: Provider) => {
    const redirectTo = oauthRedirectUrl();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: Platform.OS !== "web" },
    });
    if (error) throw error;
    if (Platform.OS === "web" || !data.url) return;

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success") throw new SignInCancelled();

    const { queryParams } = Linking.parse(result.url);
    if (typeof queryParams?.error_description === "string") throw new Error(queryParams.error_description);
    const code = queryParams?.code;
    if (typeof code === "string" && !handledCodes.current.has(code)) {
      handledCodes.current.add(code);
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,

      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      },

      async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: redirectUrl() },
        });
        if (error) throw error;
        // No session = Supabase is waiting for the email to be confirmed.
        return !data.session;
      },

      async signInWithGoogle() {
        await signInWithOAuthProvider("google");
      },

      async signInWithApple() {
        if (Platform.OS !== "ios") {
          await signInWithOAuthProvider("apple");
          return;
        }

        // iPhone: Apple's native sign-in sheet. We get an ID token that Supabase verifies.
        let credential: AppleAuthentication.AppleAuthenticationCredential;
        try {
          credential = await AppleAuthentication.signInAsync({
            requestedScopes: [
              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
              AppleAuthentication.AppleAuthenticationScope.EMAIL,
            ],
          });
        } catch (e) {
          if ((e as { code?: string }).code === "ERR_REQUEST_CANCELED") throw new SignInCancelled();
          throw e;
        }
        if (!credential.identityToken) throw new Error("Apple did not return a sign-in token.");

        const { error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });
        if (error) throw error;

        // Apple only sends the name the first time – save it on the account.
        const name = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(" ");
        if (name) {
          await supabase.auth.updateUser({
            data: {
              full_name: name,
              given_name: credential.fullName?.givenName,
              family_name: credential.fullName?.familyName,
            },
          });
        }
      },

      async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },

      async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectUrl("/reset-password"),
        });
        if (error) throw error;
      },

      async updatePassword(password) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
