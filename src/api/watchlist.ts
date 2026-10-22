import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { MediaItem, MediaType } from "./types";

/**
 * My List – stored in the Supabase table `watchlist` (see the Supabase project).
 * Row Level Security in the database ensures each user can only reach their own rows.
 */

interface WatchlistRow {
  media_type: MediaType;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_year: string | null;
  vote_average: number | null;
  added_at: string;
}

const COLUMNS = "media_type, tmdb_id, title, poster_path, backdrop_path, release_year, vote_average, added_at";

function toMediaItem(row: WatchlistRow): MediaItem {
  return {
    id: row.tmdb_id,
    type: row.media_type,
    title: row.title,
    overview: "",
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
    voteAverage: row.vote_average ?? 0,
    year: row.release_year,
  };
}

async function fetchWatchlist(): Promise<MediaItem[]> {
  const { data, error } = await supabase.from("watchlist").select(COLUMNS).order("added_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as WatchlistRow[]).map(toMediaItem);
}

async function addToWatchlist(item: MediaItem) {
  const { error } = await supabase.from("watchlist").upsert(
    {
      media_type: item.type,
      tmdb_id: item.id,
      title: item.title,
      poster_path: item.posterPath,
      backdrop_path: item.backdropPath,
      release_year: item.year,
      vote_average: item.voteAverage || null,
    },
    { onConflict: "user_id,media_type,tmdb_id", ignoreDuplicates: true }
  );
  if (error) throw error;
}

async function removeFromWatchlist(type: MediaType, id: number) {
  const { error } = await supabase.from("watchlist").delete().eq("media_type", type).eq("tmdb_id", id);
  if (error) throw error;
}

const key = (userId: string | undefined) => ["watchlist", userId] as const;
const sameItem = (a: { type: MediaType; id: number }, b: { type: MediaType; id: number }) =>
  a.type === b.type && a.id === b.id;

/** The signed-in user's list, newest first. Empty when signed out. */
export function useWatchlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: key(user?.id),
    queryFn: fetchWatchlist,
    enabled: Boolean(user),
    staleTime: 60 * 1000,
  });
}

/** Add / remove a title. The list updates on screen immediately and is rolled back if the server refuses. */
export function useToggleWatchlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = key(user?.id);

  return useMutation({
    mutationFn: async ({ item, add }: { item: MediaItem; add: boolean }) => {
      if (add) await addToWatchlist(item);
      else await removeFromWatchlist(item.type, item.id);
    },
    onMutate: async ({ item, add }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<MediaItem[]>(queryKey);
      queryClient.setQueryData<MediaItem[]>(queryKey, (list = []) =>
        add ? [item, ...list.filter((i) => !sameItem(i, item))] : list.filter((i) => !sameItem(i, item))
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

/** Whether a given title is in the list. */
export function useIsInWatchlist(type: MediaType, id: number | undefined) {
  const { data } = useWatchlist();
  return id !== undefined && Boolean(data?.some((i) => i.type === type && i.id === id));
}
