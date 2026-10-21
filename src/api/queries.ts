import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getDetails,
  getPopular,
  getRecommendations,
  getTopRated,
  getTrailerUrl,
  getTrending,
  getWatchProviders,
  searchMedia,
  type SearchFilter,
} from "./tmdb";
import type { MediaItem, MediaPage, MediaType } from "./types";

// React Query cachar svaren, så samma lista hämtas inte om och om igen.

/** `recommendations` kräver ett titel-id ("mer som detta"). */
export type ListKind = "trending" | "popular" | "topRated" | "recommendations";

const listFetchers = {
  trending: (type: MediaType, page: number) => getTrending(type, page),
  popular: (type: MediaType, page: number) => getPopular(type, page),
  topRated: (type: MediaType, page: number) => getTopRated(type, page),
  recommendations: (type: MediaType, page: number, id?: number) => getRecommendations(type, id!, page),
} as const;

/**
 * En lista som hämtar nästa sida när man närmar sig slutet (`fetchNextPage`).
 * `items` är alla hämtade sidor ihopslagna, utan dubbletter.
 */
export function useMediaList(kind: ListKind, type: MediaType, id?: number) {
  const query = useInfiniteQuery({
    queryKey: ["list", kind, type, id],
    queryFn: ({ pageParam }) => listFetchers[kind](type, pageParam, id),
    enabled: kind !== "recommendations" || id !== undefined,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const items = useMemo(() => flattenPages(query.data?.pages), [query.data]);
  return { ...query, items };
}

/** Slår ihop sidor till en lista. En titel kan flytta mellan sidor medan man scrollar – visa den bara en gång. */
function flattenPages(pages: MediaPage[] | undefined): MediaItem[] {
  const seen = new Set<string>();
  const result: MediaItem[] = [];
  for (const page of pages ?? []) {
    for (const item of page.items) {
      const key = `${item.type}-${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
  }
  return result;
}

/** Sidindelad sökning. Startar först när söktexten är minst två tecken. */
export function useSearch(query: string, filter: SearchFilter) {
  const trimmed = query.trim();
  const result = useInfiniteQuery({
    queryKey: ["search", trimmed, filter],
    queryFn: ({ pageParam }) => searchMedia(trimmed, filter, pageParam),
    enabled: trimmed.length > 1,
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
  const items = useMemo(() => flattenPages(result.data?.pages), [result.data]);
  return { ...result, items };
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
