import type { Session, User } from "@supabase/supabase-js";
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
  signOut: () => Promise<void>;
  /** Skickar ett mejl med en länk för att välja nytt lösenord. */
  resetPassword: (email: string) => Promise<void>;
  /** Byter lösenord för den inloggade användaren (t.ex. efter återställningslänken). */
  updatePassword: (password: string) => Promise<void>;
}

/** Google-inloggning visas först när den är uppsatt i Supabase (EXPO_PUBLIC_AUTH_GOOGLE=true i .env). */
export const GOOGLE_ENABLED = process.env.EXPO_PUBLIC_AUTH_GOOGLE === "true";

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
        const redirectTo = redirectUrl();
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          // Webb: hela sidan skickas till Google och tillbaka.
          // Mobil: vi öppnar Google själva i ett inloggningsfönster och tar emot svaret nedan.
          options: { redirectTo, skipBrowserRedirect: Platform.OS !== "web" },
        });
        if (error) throw error;
        if (Platform.OS === "web" || !data.url) return;

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type !== "success") return; // användaren avbröt

        const { queryParams } = Linking.parse(result.url);
        if (typeof queryParams?.error_description === "string") throw new Error(queryParams.error_description);
        const code = queryParams?.code;
        if (typeof code === "string" && !handledCodes.current.has(code)) {
          handledCodes.current.add(code);
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
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
