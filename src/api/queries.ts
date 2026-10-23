import { useInfiniteQuery, useQueries, useQuery } from "@tanstack/react-query";
import { matchesGenre, type Genre } from "./genres";
import { useMemo } from "react";
import {
  getDetails,
  getDiscover,
  getStreamingServices,
  getPopular,
  getRecommendations,
  getTopRated,
  getTrailerUrl,
  getTrending,
  getWatchProviders,
  searchMedia,
  type DiscoverFilters,
  type SearchFilter,
} from "./tmdb";
import type { MediaItem, MediaPage, MediaType, WatchProvider } from "./types";

// React Query caches responses, so the same list isn't fetched over and over.

/**
 * `recommendations` needs a title id ("more like this"),
 * `services` a list of provider ids ("popular on your services").
 */
export type ListKind = "trending" | "popular" | "topRated" | "recommendations" | "services";

const listFetchers = {
  trending: (type: MediaType, page: number) => getTrending(type, page),
  services: (type: MediaType, page: number, _id?: number, services?: number[]) =>
    getDiscover(type, { services }, page),
  popular: (type: MediaType, page: number) => getPopular(type, page),
  topRated: (type: MediaType, page: number) => getTopRated(type, page),
  recommendations: (type: MediaType, page: number, id?: number) => getRecommendations(type, id!, page),
} as const;

/**
 * A list that fetches the next page as you approach the end (`fetchNextPage`).
 * `items` is all fetched pages merged, without duplicates.
 */
export function useMediaList(kind: ListKind, type: MediaType, id?: number, services?: number[]) {
  const query = useInfiniteQuery({
    queryKey: ["list", kind, type, id, services?.join("|")],
    queryFn: ({ pageParam }) => listFetchers[kind](type, pageParam, id, services),
    enabled:
      (kind !== "recommendations" || id !== undefined) && (kind !== "services" || Boolean(services?.length)),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });

  const items = useMemo(() => flattenPages(query.data?.pages), [query.data]);
  return { ...query, items };
}

/** Titles filtered by streaming service and/or genre ("comedies on Netflix"), paginated. */
export function useDiscover(type: MediaType, filters: DiscoverFilters) {
  const query = useInfiniteQuery({
    queryKey: ["discover", type, filters.services?.join("|") ?? null, filters.genreIds?.join("|") ?? null],
    queryFn: ({ pageParam }) => getDiscover(type, filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
  });
  const items = useMemo(() => flattenPages(query.data?.pages), [query.data]);
  return { ...query, items };
}

/** Merges pages into one list. A title can move between pages while scrolling – show it only once. */
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

/** Paginated search. Only starts once the query is at least two characters. */
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

/** The streaming services you can filter by. They rarely change, so they're cached for a day. */
export function useStreamingServices(type: MediaType) {
  return useQuery({
    queryKey: ["services", type],
    queryFn: () => getStreamingServices(type),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Narrows search results by genre and/or streaming service. Genre is checked directly on the
 * results; for a service each title's providers are fetched (cached, and shared with the title page).
 * `checking` is true while providers are still loading.
 */
export function useFilteredResults(items: MediaItem[], services: number[] | null, genre: Genre | null) {
  const byGenre = genre ? items.filter((item) => matchesGenre(item, genre)) : items;
  const providers = useQueries({
    queries:
      !services?.length
        ? []
        : byGenre.map((item) => ({
            queryKey: ["providers", item.type, item.id],
            queryFn: () => getWatchProviders(item.type, item.id),
          })),
  });
  if (!services?.length) return { items: byGenre, checking: false };
  return {
    items: byGenre.filter((_, i) => providers[i]?.data?.stream.some((p) => services.includes(p.id))),
    checking: providers.some((q) => q.isPending),
  };
}

/**
 * For each title: which of the given services include it (streaming, in Sweden).
 * Fetches each title's providers – cached, and shared with the title page.
 */
export function useAvailability(items: MediaItem[], services: number[]) {
  const providers = useQueries({
    queries:
      services.length === 0
        ? []
        : items.map((item) => ({
            queryKey: ["providers", item.type, item.id],
            queryFn: () => getWatchProviders(item.type, item.id),
          })),
  });
  const byTitle: Record<string, WatchProvider[]> = {};
  items.forEach((item, i) => {
    byTitle[`${item.type}-${item.id}`] = (providers[i]?.data?.stream ?? []).filter((p) => services.includes(p.id));
  });
  return { byTitle, checking: providers.some((q) => q.isPending) };
}

export function useDetails(type: MediaType, id: number) {
  return useQuery({
    queryKey: ["details", type, id],
    queryFn: () => getDetails(type, id),
  });
}

/** `id` may be undefined while the title is still loading – the fetch waits until then. */
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
