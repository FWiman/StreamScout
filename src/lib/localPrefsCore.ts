/**
 * Small preferences saved on this device (web: the browser's localStorage, phones:
 * expo-sqlite's localStorage). Storage can be missing or blocked (private mode),
 * so every call is wrapped and failures just mean "nothing saved".
 */
export function readPref(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writePref(key: string, value: string | null) {
  try {
    if (value === null) globalThis.localStorage?.removeItem(key);
    else globalThis.localStorage?.setItem(key, value);
  } catch {
    // Not saved – the app still works for this session.
  }
}
