export type MediaType = "movie" | "tv";

/** Ett normaliserat objekt som appen använder för både filmer och serier. */
export interface MediaItem {
  id: number;
  type: MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  year: string | null;
}

export interface MediaDetails extends MediaItem {
  genres: string[];
  /** Speltid i minuter (filmer) eller avsnittslängd (serier). */
  runtime: number | null;
  tagline: string | null;
}

export interface WatchProvider {
  id: number;
  name: string;
  logoPath: string;
}

export interface WatchProviders {
  /** Länk till TMDB:s sida där man väljer tjänst. */
  link: string | null;
  stream: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
}

// ---- Råa svar från TMDB (bara de fält vi använder) ----

export interface TmdbPage<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbMediaResult {
  id: number;
  media_type?: MediaType | "person";
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

export interface TmdbDetailsResult extends TmdbMediaResult {
  genres?: { id: number; name: string }[];
  runtime?: number | null;
  episode_run_time?: number[];
  tagline?: string | null;
}

export interface TmdbVideo {
  key: string;
  site: string;
  type: string;
  official?: boolean;
  iso_639_1?: string;
}

export interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface TmdbProvidersResult {
  results: Record<
    string,
    {
      link?: string;
      flatrate?: TmdbProvider[];
      rent?: TmdbProvider[];
      buy?: TmdbProvider[];
    }
  >;
}
