import type { MediaItem, MediaType } from "./types";

/**
 * One shared genre list for movies and TV shows. TMDB has separate genre ids for each
 * (and TV merges some, e.g. "Action & Adventure"), so each genre maps to the ids it
 * covers per type. Static on purpose: TMDB's genre ids practically never change.
 */
export interface Genre {
  key: string;
  name: string;
  movie: number[];
  tv: number[];
}

export const GENRES: Genre[] = [
  { key: "action", name: "Action", movie: [28], tv: [10759] },
  { key: "adventure", name: "Adventure", movie: [12], tv: [10759] },
  { key: "animation", name: "Animation", movie: [16], tv: [16] },
  { key: "comedy", name: "Comedy", movie: [35], tv: [35] },
  { key: "crime", name: "Crime", movie: [80], tv: [80] },
  { key: "documentary", name: "Documentary", movie: [99], tv: [99] },
  { key: "drama", name: "Drama", movie: [18], tv: [18] },
  { key: "family", name: "Family", movie: [10751], tv: [10751] },
  { key: "kids", name: "Kids", movie: [10751, 16], tv: [10762] },
  { key: "fantasy", name: "Fantasy", movie: [14], tv: [10765] },
  { key: "scifi", name: "Sci-Fi", movie: [878], tv: [10765] },
  { key: "horror", name: "Horror", movie: [27], tv: [9648] },
  { key: "thriller", name: "Thriller", movie: [53], tv: [80, 9648] },
  { key: "mystery", name: "Mystery", movie: [9648], tv: [9648] },
  { key: "romance", name: "Romance", movie: [10749], tv: [10749] },
  { key: "history", name: "History", movie: [36], tv: [10768] },
  { key: "war", name: "War", movie: [10752], tv: [10768] },
  { key: "western", name: "Western", movie: [37], tv: [37] },
  { key: "music", name: "Music", movie: [10402], tv: [10402] },
  { key: "reality", name: "Reality", movie: [], tv: [10764] },
];

export function findGenre(key: string | null | undefined) {
  return GENRES.find((g) => g.key === key) ?? null;
}

/** Genres that exist for a type – or for either type when searching both. */
export function genresFor(type: MediaType | "all") {
  return type === "all" ? GENRES : GENRES.filter((g) => g[type].length > 0);
}

/** Whether a search result belongs to a genre (search results include their genre ids). */
export function matchesGenre(item: MediaItem, genre: Genre) {
  const ids = genre[item.type];
  return (item.genreIds ?? []).some((id) => ids.includes(id));
}
