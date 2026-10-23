import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

/**
 * "My services" – the streaming services the user has (TMDB provider ids).
 * Like My List it needs an account: stored in the Supabase table `user_services`
 * (RLS: own rows only), so it follows the user between devices. Signed out it's empty.
 */

async function fetchMyServices(): Promise<number[]> {
  const { data, error } = await supabase.from("user_services").select("provider_id").order("added_at");
  if (error) throw error;
  return (data ?? []).map((row: { provider_id: number }) => row.provider_id);
}

async function addServices(ids: number[]) {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("user_services")
    .upsert(ids.map((provider_id) => ({ provider_id })), { onConflict: "user_id,provider_id", ignoreDuplicates: true });
  if (error) throw error;
}

async function removeServices(ids: number[]) {
  if (ids.length === 0) return;
  const { error } = await supabase.from("user_services").delete().in("provider_id", ids);
  if (error) throw error;
}

export function useMyServices() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["myServices", user?.id];

  const query = useQuery({
    queryKey,
    queryFn: fetchMyServices,
    enabled: Boolean(user),
    staleTime: Infinity,
  });
  const ids = user ? query.data ?? [] : [];

  const mutation = useMutation({
    mutationFn: async ({ next, previous }: { next: number[]; previous: number[] }) => {
      await addServices(next.filter((id) => !previous.includes(id)));
      await removeServices(previous.filter((id) => !next.includes(id)));
    },
    // Update the screen at once; roll back if saving fails.
    onMutate: async ({ next, previous }) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  const set = (next: number[]) => {
    if (user) mutation.mutate({ next, previous: ids });
  };
  const toggle = (id: number) => set(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);

  return {
    ids,
    set,
    toggle,
    signedIn: Boolean(user),
    /** True while we don't yet know the user's services (auth or the list still loading). */
    isLoading: loading || (Boolean(user) && query.isPending),
    saveError: mutation.isError,
  };
}
