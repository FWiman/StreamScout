import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getDetails,
  getPopular,
  getTopRated,
  getTrailerUrl,
  getTrending,
  getWatchProviders,
  searchMedia,
} from "./tmdb";
import type { MediaItem, MediaType } from "./types";

// React Query cachar svaren, så samma lista hämtas inte om och om igen.

export type ListKind = "trending" | "popular" | "topRated";

const listFetchers = {
  trending: getTrending,
  popular: getPopular,
  topRated: getTopRated,
} as const;

/**
 * En lista som hämtar nästa sida när man närmar sig slutet (`fetchNextPage`).
 * `items` är alla hämtade sidor ihopslagna, utan dubbletter.
 */
export function useMediaList(kind: ListKind, type: MediaType) {
  const query = useInfiniteQuery({
    queryKey: ["list", kind, type],
    queryFn: ({ pageParam }) => listFetchers[kind](type, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const items = useMemo(() => {
    // Trendlistor kan flytta en titel mellan sidor medan man scrollar – visa den bara en gång.
    const seen = new Set<string>();
    const result: MediaItem[] = [];
    for (const page of query.data?.pages ?? []) {
      for (const item of page.items) {
        const key = `${item.type}-${item.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(item);
        }
      }
    }
    return result;
  }, [query.data]);

  return { ...query, items };
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

/** `id` kan vara undefined medan titeln fortfarande laddas – då väntar hämtningen. */
export function useTrailer(type: MediaType, id: number | undefined) {
  return useQuery({
    queryKey: ["trailer", type, id],
    queryFn: () => getTrailerUrl(type, id!),
    enabled: id !== undefined,
  });
}

export function useWatchProviders(type: MediaType, id: number) {
  return useQuery({
    queryKey: ["providers", type, id],
    queryFn: () => getWatchProviders(type, id),
  });
}
