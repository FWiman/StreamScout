import type { Provider, Session, User } from "@supabase/supabase-js";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

// Stänger inloggningsfönstret korrekt när Google skickar tillbaka användaren (webb).
WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True medan sparad inloggning läses in vid start. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Returnerar true om användaren måste bekräfta sin e-post innan inloggning. */
  signUp: (email: string, password: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  /** iPhone: Apples egen inloggning (Face ID). Webb/Android: Apples inloggningssida. */
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Skickar ett mejl med en länk för att välja nytt lösenord. */
  resetPassword: (email: string) => Promise<void>;
  /** Byter lösenord för den inloggade användaren (t.ex. efter återställningslänken). */
  updatePassword: (password: string) => Promise<void>;
}

/** Google-inloggning visas först när den är uppsatt i Supabase (EXPO_PUBLIC_AUTH_GOOGLE=true i .env). */
export const GOOGLE_ENABLED = process.env.EXPO_PUBLIC_AUTH_GOOGLE === "true";

/**
 * Apple-inloggning:
 * - iPhone (EXPO_PUBLIC_AUTH_APPLE=true): Apples inbyggda inloggning. Gratis, fungerar i Expo Go.
 * - Webb/Android (EXPO_PUBLIC_AUTH_APPLE_WEB=true): kräver Services ID + nyckel från ett betalt Apple Developer-konto.
 */
export const APPLE_ENABLED =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_AUTH_APPLE === "true"
    : process.env.EXPO_PUBLIC_AUTH_APPLE_WEB === "true";

/** Felet som betyder att användaren själv avbröt Apple-inloggningen – inget att visa. */
export class SignInCancelled extends Error {
  constructor() {
    super("cancelled");
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Dit Supabase skickar tillbaka användaren efter Google, e-postbekräftelse eller lösenordsåterställning. */
function redirectUrl(path = "/account") {
  // Webb: http://localhost:8081/account  ·  Expo Go: exp://…/--/account  ·  App: streamwatch://account
  return Linking.createURL(path);
}

/** Supabases felmeddelanden på svenska. */
export function authErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "Fel e-post eller lösenord.";
  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider"))
    return "Den här inloggningen är inte påslagen i Supabase än.";
  if (lower.includes("email not confirmed")) return "Bekräfta din e-post först – kolla inkorgen.";
  if (lower.includes("already registered") || lower.includes("already been registered"))
    return "Det finns redan ett konto med den e-postadressen.";
  if (lower.includes("password should be at least")) return "Lösenordet måste vara minst 6 tecken.";
  if (lower.includes("unable to validate email") || lower.includes("invalid email"))
    return "Det ser inte ut som en giltig e-postadress.";
  if (lower.includes("rate limit") || lower.includes("too many"))
    return "För många försök. Vänta en stund och försök igen.";
  if (lower.includes("network") || lower.includes("fetch")) return "Ingen kontakt med servern. Kontrollera nätet.";
  if (lower.includes("code verifier") || lower.includes("auth session missing") || lower.includes("expired"))
    return "Länken har gått ut eller öppnades på en annan enhet. Begär en ny och öppna den i samma webbläsare/app.";
  if (lower.includes("should be different")) return "Det nya lösenordet måste skilja sig från det gamla.";
  return `Något gick fel: ${message}`;
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

  // Mobil: länkar från mejl (bekräftelse, återställning) öppnar appen med ?code=… i adressen.
  // Webben sköter detta automatiskt (detectSessionInUrl i supabase.ts).
  const handledCodes = useRef(new Set<string>());
  useEffect(() => {
    if (!isSupabaseConfigured || Platform.OS === "web") return;

    const handleUrl = async (url: string | null) => {
      if (!url) return;
      const code = Linking.parse(url).queryParams?.code;
      if (typeof code !== "string" || handledCodes.current.has(code)) return;
      handledCodes.current.add(code);
      await supabase.auth.exchangeCodeForSession(code).catch(() => {
        // Ogiltig eller gammal länk – kontosidan visar inloggningsformuläret som vanligt.
      });
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  /**
   * Inloggning via en extern sida (Google, Apple på webb/Android).
   * Webb: hela sidan skickas dit och tillbaka. Mobil: vi öppnar sidan i ett
   * inloggningsfönster och växlar koden vi får tillbaka mot en session.
   */
  const signInWithOAuthProvider = async (provider: Provider) => {
    const redirectTo = redirectUrl();
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
        // Ingen session = Supabase väntar på att e-posten bekräftas.
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

        // iPhone: Apples egen inloggningsruta. Vi får en ID-token som Supabase verifierar.
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
        if (!credential.identityToken) throw new Error("Apple skickade ingen inloggningstoken.");

        const { error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });
        if (error) throw error;

        // Apple skickar namnet bara första gången – spara det på kontot.
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
  if (!context) throw new Error("useAuth måste användas inuti <AuthProvider>");
  return context;
}
