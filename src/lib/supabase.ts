import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import { authStorage } from "./sessionStorage";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** False until the Supabase keys are in .env – the account page then shows an explanation instead. */
export const isSupabaseConfigured = Boolean(url && key);

/**
 * The Supabase client for sign-in and the watchlist.
 * The publishable key may ship in the app – what users can read and write is controlled
 * by the database's security rules (Row Level Security), not by keeping the key secret.
 */
export const supabase = createClient(url ?? "https://not-configured.supabase.co", key ?? "not-configured", {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Web: pick up the session from the URL after Google or email confirmation.
    detectSessionInUrl: Platform.OS === "web",
    flowType: "pkce",
  },
});

// Mobile: only refresh the session while the app is in the foreground (Expo's recommendation).
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
