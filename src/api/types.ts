export type MediaType = "movie" | "tv";

/** A normalized object the app uses for both movies and TV shows. */
export interface MediaItem {
  id: number;
  type: MediaType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  year: string | null;
  /** TMDB genre ids – set for TMDB lists and search results (used to filter by genre). */
  genreIds?: number[];
}

/** One page of a list from TMDB. */
export interface MediaPage {
  items: MediaItem[];
  page: number;
  totalPages: number;
}

export interface MediaDetails extends MediaItem {
  genres: string[];
  /** Runtime in minutes (movies) or episode length (TV shows). */
  runtime: number | null;
  tagline: string | null;
}

export interface WatchProvider {
  id: number;
  name: string;
  logoPath: string;
}

export interface WatchProviders {
  /** Link to TMDB's page where you pick a service. */
  link: string | null;
  stream: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
}

// ---- Raw TMDB responses (only the fields we use) ----

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
  original_title?: string;
  original_name?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
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

/** /watch/providers/{type}: every service available in a region. */
export interface TmdbProviderListResult {
  results: (TmdbProvider & { display_priorities?: Record<string, number> })[];
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
