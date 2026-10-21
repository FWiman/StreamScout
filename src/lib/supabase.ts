import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import { authStorage } from "./sessionStorage";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** False tills Supabase-nycklarna finns i .env – då visar kontosidan en förklaring i stället. */
export const isSupabaseConfigured = Boolean(url && key);

/**
 * Supabase-klienten för inloggning och (snart) watchlist.
 * Den publika nyckeln får finnas i appen – vad användare får läsa och skriva styrs av
 * databasens säkerhetsregler (Row Level Security), inte av att nyckeln är hemlig.
 */
export const supabase = createClient(url ?? "https://not-configured.supabase.co", key ?? "not-configured", {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Webben: plocka upp inloggningen från adressen efter Google eller e-postbekräftelse.
    detectSessionInUrl: Platform.OS === "web",
    flowType: "pkce",
  },
});

// Mobil: förnya inloggningen bara när appen är öppen (Expos rekommendation).
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
