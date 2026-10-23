import type {
  MediaDetails,
  MediaItem,
  MediaPage,
  MediaType,
  TmdbDetailsResult,
  TmdbMediaResult,
  TmdbPage,
  TmdbProvider,
  TmdbProviderListResult,
  TmdbProvidersResult,
  TmdbVideo,
  WatchProvider,
  WatchProviders,
} from "./types";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p";

/** Language for titles and overviews. */
const LANGUAGE = "en-US";
/** Country for streaming services – the app shows what's available in Sweden. */
const REGION = "SE";

/**
 * Requests go through our Supabase Edge Function (supabase/functions/tmdb), which adds the
 * TMDB key on the server – so the key isn't in the app. EXPO_PUBLIC_TMDB_API_KEY is only a
 * fallback for local development without Supabase; leave it empty otherwise.
 */
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const PROXY_URL = SUPABASE_URL ? `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/tmdb` : null;
const DIRECT_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

type Params = Record<string, string | number | undefined>;

function buildUrl(path: string, params: Params) {
  let url: URL;
  if (PROXY_URL) {
    url = new URL(PROXY_URL);
    url.searchParams.set("path", path);
  } else if (DIRECT_API_KEY) {
    url = new URL(BASE_URL + path);
    url.searchParams.set("api_key", DIRECT_API_KEY);
  } else {
    throw new Error(
      "No way to reach TMDB. Add EXPO_PUBLIC_SUPABASE_URL to .env (or EXPO_PUBLIC_TMDB_API_KEY for local development)."
    );
  }
  url.searchParams.set("language", LANGUAGE);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function tmdbFetch<T>(path: string, params: Params = {}): Promise<T> {
  const response = await fetch(buildUrl(path, params));
  if (!response.ok) {
    throw new Error(`TMDB responded ${response.status} for ${path}`);
  }
  return (await response.json()) as T;
}

// ---- Helpers ----

export type ImageSize = "w92" | "w185" | "w300" | "w342" | "w500" | "w780" | "w1280" | "original";

export function imageUrl(path: string | null | undefined, size: ImageSize = "w342") {
  return path ? `${IMAGE_URL}/${size}${path}` : null;
}

function toMediaItem(raw: TmdbMediaResult, fallbackType?: MediaType): MediaItem | null {
  const type = raw.media_type === "movie" || raw.media_type === "tv" ? raw.media_type : fallbackType;
  if (!type) return null; // e.g. people in search results

  const date = type === "movie" ? raw.release_date : raw.first_air_date;
  return {
    id: raw.id,
    type,
    title: raw.title ?? raw.name ?? "Unknown title",
    overview: raw.overview ?? "",
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    voteAverage: raw.vote_average ?? 0,
    year: date ? date.slice(0, 4) : null,
    genreIds: raw.genre_ids,
  };
}

function toMediaList(page: TmdbPage<TmdbMediaResult>, type?: MediaType): MediaItem[] {
  return page.results
    .map((raw) => toMediaItem(raw, type))
    .filter((item): item is MediaItem => item !== null);
}

function toProviders(list: TmdbProvider[] | undefined): WatchProvider[] {
  return (list ?? []).map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path }));
}

// ---- Lists (paginated, 20 titles per page) ----

/** TMDB never returns more than 500 pages. */
const MAX_PAGES = 500;

async function getListPage(path: string, type: MediaType, page: number, params: Params = {}) {
  const raw = await tmdbFetch<TmdbPage<TmdbMediaResult>>(path, { ...params, page });
  return {
    items: toMediaList(raw, type),
    page: raw.page,
    totalPages: Math.min(raw.total_pages, MAX_PAGES),
  } satisfies MediaPage;
}

export function getTrending(type: MediaType, page = 1) {
  return getListPage(`/trending/${type}/week`, type, page);
}

export function getTopRated(type: MediaType, page = 1) {
  return getListPage(`/${type}/top_rated`, type, page, { region: REGION });
}

export function getPopular(type: MediaType, page = 1) {
  return getListPage(`/${type}/popular`, type, page, { region: REGION });
}

export interface DiscoverFilters {
  /** Streaming service (TMDB provider id): only titles included in its subscription in Sweden. */
  service?: number | null;
  /** Genre ids – any of them matches (see genres.ts). */
  genreIds?: number[] | null;
}

/** Movies or TV shows matching a service and/or genre, most popular first. */
export function getDiscover(type: MediaType, filters: DiscoverFilters, page = 1) {
  const params: Params = { sort_by: "popularity.desc" };
  if (filters.service) {
    params.watch_region = REGION;
    params.with_watch_providers = filters.service;
    params.with_watch_monetization_types = "flatrate"; // not rent/buy
  }
  if (filters.genreIds?.length) params.with_genres = filters.genreIds.join("|");
  // Without a service, popularity alone lets in many obscure titles – require some votes.
  if (!filters.service) params["vote_count.gte"] = 50;
  return getListPage(`/discover/${type}`, type, page, params);
}

/**
 * The main streaming services in Sweden, in the order we show them. TMDB's own ranking
 * puts e.g. HBO Max far down (41st), and mixes in rent/buy stores, kids profiles and
 * "Amazon Channel" add-ons – so we pick the services ourselves and take names and logos from TMDB.
 */
const SWEDISH_SERVICES = [
  8, // Netflix
  1899, // HBO Max
  337, // Disney Plus
  76, // Viaplay
  119, // Amazon Prime Video
  350, // Apple TV
  1773, // SkyShowtime
  1944, // TV4 Play
  493, // SVT Play
  497, // Tele2 Play
  283, // Crunchyroll
];

/** The streaming services you can filter by (those in SWEDISH_SERVICES that TMDB lists). */
export async function getStreamingServices(type: MediaType): Promise<WatchProvider[]> {
  const { results } = await tmdbFetch<TmdbProviderListResult>(`/watch/providers/${type}`, {
    watch_region: REGION,
  });
  const byId = new Map(results.map((p) => [p.provider_id, p]));
  const picked = SWEDISH_SERVICES.map((id) => byId.get(id)).filter((p): p is TmdbProvider => p !== undefined);
  return toProviders(picked);
}

/** Titles similar to a given movie or TV show. */
export function getRecommendations(type: MediaType, id: number, page = 1) {
  return getListPage(`/${type}/${id}/recommendations`, type, page);
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents: "amélie" → "amelie"
    .trim();
}

/**
 * TMDB orders search hits by how exactly the text matches, not by popularity,
 * so an obscure movie called exactly "Inter" ranks above Interstellar. We re-rank
 * each page: how well the title matches + how well known it is (popularity and vote count).
 */
function rankSearchResults(results: TmdbMediaResult[], query: string) {
  const q = normalize(query);

  const matchScore = (raw: TmdbMediaResult) => {
    const titles = [raw.title, raw.name, raw.original_title, raw.original_name]
      .filter((t): t is string => Boolean(t))
      .map(normalize);
    let best = 0;
    for (const t of titles) {
      if (t === q) best = Math.max(best, 3);
      else if (t.startsWith(q)) best = Math.max(best, 2);
      else if (t.split(/[\s:\-]+/).some((word) => word.startsWith(q))) best = Math.max(best, 1.5);
      else if (t.includes(q)) best = Math.max(best, 0.5);
    }
    return best;
  };

  const fameScore = (raw: TmdbMediaResult) =>
    Math.log10(1 + (raw.popularity ?? 0)) + 0.75 * Math.log10(1 + (raw.vote_count ?? 0));

  return results
    .map((raw, index) => ({ raw, score: matchScore(raw) + fameScore(raw) - index * 0.01 }))
    .sort((a, b) => b.score - a.score)
    .map(({ raw }) => raw);
}

export type SearchFilter = "all" | MediaType;

/**
 * Searches movies and/or TV shows. With a filter we use TMDB's dedicated movie-only
 * or TV-only search, which gives more accurate results than the multi search.
 */
export async function searchMedia(query: string, filter: SearchFilter = "all", page = 1): Promise<MediaPage> {
  const path = filter === "all" ? "/search/multi" : `/search/${filter}`;
  const raw = await tmdbFetch<TmdbPage<TmdbMediaResult>>(path, {
    query: query.trim(),
    include_adult: "false",
    page,
  });
  const ranked = { ...raw, results: rankSearchResults(raw.results, query) };
  return {
    // Titles without a poster are almost always obscure or broken entries – skip them.
    items: toMediaList(ranked, filter === "all" ? undefined : filter).filter((i) => i.posterPath),
    page: raw.page,
    totalPages: Math.min(raw.total_pages, MAX_PAGES),
  };
}

// ---- Details ----

export async function getDetails(type: MediaType, id: number): Promise<MediaDetails> {
  const raw = await tmdbFetch<TmdbDetailsResult>(`/${type}/${id}`);
  const base = toMediaItem(raw, type)!;
  const runtime = type === "movie" ? raw.runtime ?? null : raw.episode_run_time?.[0] ?? null;
  return {
    ...base,
    genres: (raw.genres ?? []).map((g) => g.name),
    runtime,
    tagline: raw.tagline || null,
  };
}

/** Returns a YouTube link to the best trailer, or null. Prefers official English trailers. */
export async function getTrailerUrl(type: MediaType, id: number): Promise<string | null> {
  const { results } = await tmdbFetch<{ results: TmdbVideo[] }>(`/${type}/${id}/videos`, {
    include_video_language: "en,null",
  });

  const youtube = results.filter((v) => v.site === "YouTube");
  const trailer =
    youtube.find((v) => v.type === "Trailer" && v.official) ??
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser");

  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}

/** Where the title can be watched in Sweden. */
export async function getWatchProviders(type: MediaType, id: number): Promise<WatchProviders> {
  const data = await tmdbFetch<TmdbProvidersResult>(`/${type}/${id}/watch/providers`);
  const se = data.results[REGION];
  return {
    link: se?.link ?? null,
    stream: toProviders(se?.flatrate),
    rent: toProviders(se?.rent),
    buy: toProviders(se?.buy),
  };
}
