import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { MediaItem, MediaType } from "./types";

/**
 * What a signed-in user has marked on titles: seen, thumbs up/down and "not interested".
 * Stored in the Supabase table `user_titles` (RLS: own rows only). Signed out everything is unmarked.
 */

export interface TitleState {
  seen: boolean;
  /** 1 = thumbs up, -1 = thumbs down. */
  rating: 1 | -1 | null;
  /** "Not interested" – hidden from rows, grids and search. */
  hidden: boolean;
}

interface Row extends TitleState {
  media_type: MediaType;
  tmdb_id: number;
}

const EMPTY: TitleState = { seen: false, rating: null, hidden: false };
const titleKey = (type: MediaType, id: number) => `${type}-${id}`;
const queryKey = (userId: string | undefined) => ["userTitles", userId] as const;

async function fetchUserTitles(): Promise<Record<string, TitleState>> {
  const { data, error } = await supabase.from("user_titles").select("media_type, tmdb_id, seen, rating, hidden");
  if (error) throw error;
  const map: Record<string, TitleState> = {};
  for (const row of (data ?? []) as Row[]) {
    map[titleKey(row.media_type, row.tmdb_id)] = { seen: row.seen, rating: row.rating, hidden: row.hidden };
  }
  return map;
}

/** All of the user's marked titles, keyed "movie-123". */
export function useUserTitles() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: queryKey(user?.id),
    queryFn: fetchUserTitles,
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
  });
  return user ? query.data ?? {} : {};
}

export function useTitleState(type: MediaType, id: number): TitleState {
  return useUserTitles()[titleKey(type, id)] ?? EMPTY;
}

/** Change seen / rating / hidden for a title. Updates the screen at once; rolls back if saving fails. */
export function useUpdateTitleState() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = queryKey(user?.id);

  return useMutation({
    mutationFn: async ({ type, id, next }: { type: MediaType; id: number; next: TitleState }) => {
      const unmarked = !next.seen && next.rating === null && !next.hidden;
      const match = { media_type: type, tmdb_id: id };
      const { error } = unmarked
        ? await supabase.from("user_titles").delete().match(match)
        : await supabase
            .from("user_titles")
            .upsert({ ...match, ...next, updated_at: new Date().toISOString() }, {
              onConflict: "user_id,media_type,tmdb_id",
            });
      if (error) throw error;
    },
    onMutate: async ({ type, id, next }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Record<string, TitleState>>(key);
      queryClient.setQueryData<Record<string, TitleState>>(key, (map = {}) => ({ ...map, [titleKey(type, id)]: next }));
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
  });
}

/** Drops titles the user marked "Not interested". */
export function useWithoutHidden(items: MediaItem[]) {
  const states = useUserTitles();
  return useMemo(
    () => items.filter((item) => !states[titleKey(item.type, item.id)]?.hidden),
    [items, states]
  );
}
