// iOS och Android: spara inloggningen med expo-sqlite:s localStorage, så man förblir
// inloggad mellan appstarter. (Expos rekommenderade lagring för Supabase.)
import "expo-sqlite/localStorage/install";

export const authStorage = globalThis.localStorage;
