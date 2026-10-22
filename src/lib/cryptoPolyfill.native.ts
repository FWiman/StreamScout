// iOS and Android have no WebCrypto. supabase-js then falls back to the weaker "plain"
// PKCE code challenge (and logs a warning). Provide the two functions it needs –
// crypto.getRandomValues and crypto.subtle.digest – from expo-crypto, so mobile uses
// SHA-256 just like the web. Must be imported before the Supabase client is created.
import * as ExpoCrypto from "expo-crypto";

type MutableCrypto = { getRandomValues?: unknown; subtle?: { digest?: unknown } };
const g = globalThis as unknown as { crypto?: MutableCrypto };
g.crypto ??= {};

if (typeof g.crypto.getRandomValues !== "function") {
  g.crypto.getRandomValues = ExpoCrypto.getRandomValues;
}

if (typeof g.crypto.subtle?.digest !== "function") {
  g.crypto.subtle = {
    ...g.crypto.subtle,
    digest: (algorithm: string | { name: string }, data: BufferSource) => {
      const name = typeof algorithm === "string" ? algorithm : algorithm.name;
      return ExpoCrypto.digest(name as ExpoCrypto.CryptoDigestAlgorithm, data);
    },
  };
}
