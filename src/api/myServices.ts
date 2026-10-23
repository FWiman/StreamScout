import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthProvider";
import { readPref, writePref } from "@/lib/localPrefs";
import { supabase } from "@/lib/supabase";

/**
 * "My services" – the streaming services the user has (TMDB provider ids).
 * Always kept on the device, so it works without an account. When signed in it's also
 * stored in the Supabase table `user_services` (RLS: own rows only) and follows the user
 * between devices. The first time someone signs in, the device's choice is uploaded.
 */

const KEY = "streamscout.myServices";

function readLocal(): number[] {
  try {
    const parsed: unknown = JSON.parse(readPref(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((n): n is number => Number.isInteger(n) && n > 0) : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: number[]) {
  writePref(KEY, JSON.stringify(ids));
}

async function fetchRemote(): Promise<number[]> {
  const { data, error } = await supabase.from("user_services").select("provider_id").order("added_at");
  if (error) throw error;
  const remote = (data ?? []).map((row: { provider_id: number }) => row.provider_id);

  // First sign-in on this account: keep what was picked on this device.
  const local = readLocal();
  if (remote.length === 0 && local.length > 0) {
    await addRemote(local);
    return local;
  }
  writeLocal(remote);
  return remote;
}

async function addRemote(ids: number[]) {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from("user_services")
    .upsert(ids.map((provider_id) => ({ provider_id })), { onConflict: "user_id,provider_id", ignoreDuplicates: true });
  if (error) throw error;
}

async function removeRemote(ids: number[]) {
  if (ids.length === 0) return;
  const { error } = await supabase.from("user_services").delete().in("provider_id", ids);
  if (error) throw error;
}

export function useMyServices() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["myServices", user?.id ?? "device"];

  const query = useQuery({
    queryKey,
    queryFn: () => (user ? fetchRemote() : Promise.resolve(readLocal())),
    enabled: !loading,
    staleTime: Infinity,
  });
  const ids = query.data ?? [];

  const mutation = useMutation({
    mutationFn: async ({ next, previous }: { next: number[]; previous: number[] }) => {
      writeLocal(next);
      if (!user) return;
      await addRemote(next.filter((id) => !previous.includes(id)));
      await removeRemote(previous.filter((id) => !next.includes(id)));
    },
    // Update the screen at once; roll back if saving fails.
    onMutate: async ({ next, previous }) => {
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previous);
        writeLocal(context.previous);
      }
    },
  });

  const set = (next: number[]) => mutation.mutate({ next, previous: ids });
  const toggle = (id: number) => set(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);

  return { ids, set, toggle, isLoading: query.isPending, saveError: mutation.isError };
}
