// TMDB proxy: the app calls this function instead of TMDB directly, so the TMDB key
// stays on the server (Supabase secret TMDB_API_KEY) and never ships in the app.
//
// Request:  GET /functions/v1/tmdb?path=/trending/movie/week&page=1&language=en-US
// Response: TMDB's JSON, unchanged.
//
// Deployed with verify_jwt = false: signed-out users must be able to browse, and the
// publishable key isn't a JWT. Instead the function only allows read-only GET requests
// to the TMDB endpoints the app uses (ALLOWED_PATHS).

const TMDB_KEY = Deno.env.get("TMDB_API_KEY") ?? "";
const BASE_URL = "https://api.themoviedb.org/3";

const ALLOWED_PATHS = [
  /^\/trending\/(all|movie|tv)\/(day|week)$/,
  /^\/(movie|tv)\/(popular|top_rated|now_playing|upcoming|on_the_air|airing_today)$/,
  /^\/(movie|tv)\/\d+$/,
  /^\/(movie|tv)\/\d+\/(videos|watch\/providers|recommendations|similar|credits)$/,
  /^\/search\/(multi|movie|tv)$/,
  /^\/discover\/(movie|tv)$/,
  /^\/watch\/providers\/(movie|tv)$/,
  /^\/genre\/(movie|tv)\/list$/,
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: unknown, status: number, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", ...extra },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  if (!TMDB_KEY) return json({ error: "The TMDB_API_KEY secret isn't set on the server." }, 500);

  const incoming = new URL(req.url);
  const path = incoming.searchParams.get("path") ?? "";
  if (!ALLOWED_PATHS.some((pattern) => pattern.test(path))) {
    return json({ error: `Path not allowed: ${path}` }, 400);
  }

  const target = new URL(BASE_URL + path);
  for (const [key, value] of incoming.searchParams) {
    if (key === "path" || key === "api_key" || value.length > 200) continue;
    target.searchParams.set(key, value);
  }

  // Works with both TMDB key types: the long "API Read Access Token" (a JWT) or the v3 API key.
  const headers: Record<string, string> = { Accept: "application/json" };
  if (TMDB_KEY.startsWith("eyJ")) headers.Authorization = `Bearer ${TMDB_KEY}`;
  else target.searchParams.set("api_key", TMDB_KEY);

  try {
    const response = await fetch(target, { headers });
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        ...CORS,
        "Content-Type": "application/json",
        // Lists and details change rarely; let browsers and CDNs cache them for a while.
        "Cache-Control": response.ok ? "public, max-age=600" : "no-store",
      },
    });
  } catch {
    return json({ error: "Couldn't reach TMDB." }, 502);
  }
});
