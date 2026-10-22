// iOS and Android: store the session in expo-sqlite's localStorage so users stay
// signed in between app launches. (Expo's recommended storage for Supabase.)
import "expo-sqlite/localStorage/install";

export const authStorage = globalThis.localStorage;
