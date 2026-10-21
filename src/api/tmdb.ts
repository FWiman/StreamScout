import type {
  MediaDetails,
  MediaItem,
  MediaPage,
  MediaType,
  TmdbDetailsResult,
  TmdbMediaResult,
  TmdbPage,
  TmdbProvider,
  TmdbProvidersResult,
  TmdbVideo,
  WatchProvider,
  WatchProviders,
} from "./types";

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p";

/** Språk för titlar och beskrivningar. TMDB faller tillbaka på originalet om svensk text saknas. */
const LANGUAGE = "sv-SE";
/** Land för streamingtjänster. */
const REGION = "SE";

const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

type Params = Record<string, string | number | undefined>;

async function tmdbFetch<T>(path: string, params: Params = {}): Promise<T> {
  if (!API_KEY) {
    throw new Error(
      "TMDB-nyckel saknas. Kopiera .env.example till .env och fyll i EXPO_PUBLIC_TMDB_API_KEY."
    );
  }

  const url = new URL(BASE_URL + path);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", LANGUAGE);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`TMDB svarade ${response.status} för ${path}`);
  }
  return (await response.json()) as T;
}

// ---- Hjälpfunktioner ----

export type ImageSize = "w92" | "w185" | "w342" | "w500" | "w780" | "w1280" | "original";

export function imageUrl(path: string | null | undefined, size: ImageSize = "w342") {
  return path ? `${IMAGE_URL}/${size}${path}` : null;
}

function toMediaItem(raw: TmdbMediaResult, fallbackType?: MediaType): MediaItem | null {
  const type = raw.media_type === "movie" || raw.media_type === "tv" ? raw.media_type : fallbackType;
  if (!type) return null; // t.ex. personer i sökresultat

  const date = type === "movie" ? raw.release_date : raw.first_air_date;
  return {
    id: raw.id,
    type,
    title: raw.title ?? raw.name ?? "Okänd titel",
    overview: raw.overview ?? "",
    posterPath: raw.poster_path ?? null,
    backdropPath: raw.backdrop_path ?? null,
    voteAverage: raw.vote_average ?? 0,
    year: date ? date.slice(0, 4) : null,
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

// ---- Listor (sidindelade, 20 titlar per sida) ----

/** TMDB ger aldrig ut fler än 500 sidor. */
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

export async function searchMedia(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  return toMediaList(
    await tmdbFetch<TmdbPage<TmdbMediaResult>>("/search/multi", {
      query: trimmed,
      include_adult: "false",
    })
  );
}

// ---- Detaljer ----

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

/** Returnerar en YouTube-länk till bästa trailern, eller null. Föredrar svenska, sedan engelska. */
export async function getTrailerUrl(type: MediaType, id: number): Promise<string | null> {
  const { results } = await tmdbFetch<{ results: TmdbVideo[] }>(`/${type}/${id}/videos`, {
    include_video_language: "sv,en,null",
  });

  const youtube = results.filter((v) => v.site === "YouTube");
  const trailer =
    youtube.find((v) => v.type === "Trailer" && v.official) ??
    youtube.find((v) => v.type === "Trailer") ??
    youtube.find((v) => v.type === "Teaser");

  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}

/** Var titeln går att se i Sverige. */
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
