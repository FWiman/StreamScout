import { useQuery } from "@tanstack/react-query";
import {
  getDetails,
  getPopular,
  getTopRated,
  getTrailerUrl,
  getTrending,
  getWatchProviders,
  searchMedia,
} from "./tmdb";
import type { MediaType } from "./types";

// React Query cachar svaren, så samma lista hämtas inte om och om igen.

export type ListKind = "trending" | "popular" | "topRated";

const listFetchers = {
  trending: getTrending,
  popular: getPopular,
  topRated: getTopRated,
} as const;

export function useMediaList(kind: ListKind, type: MediaType) {
  return useQuery({
    queryKey: ["list", kind, type],
    queryFn: () => listFetchers[kind](type),
  });
}

export function useSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["search", trimmed],
    queryFn: () => searchMedia(trimmed),
    enabled: trimmed.length > 1,
  });
}

export function useDetails(type: MediaType, id: number) {
  return useQuery({
    queryKey: ["details", type, id],
    queryFn: () => getDetails(type, id),
  });
}

export function useTrailer(type: MediaType, id: number) {
  return useQuery({
    queryKey: ["trailer", type, id],
    queryFn: () => getTrailerUrl(type, id),
  });
}

export function useWatchProviders(type: MediaType, id: number) {
  return useQuery({
    queryKey: ["providers", type, id],
    queryFn: () => getWatchProviders(type, id),
  });
}
