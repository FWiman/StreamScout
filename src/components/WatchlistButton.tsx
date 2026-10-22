import { router } from "expo-router";
import { useIsInWatchlist, useToggleWatchlist } from "@/api/watchlist";
import type { MediaItem } from "@/api/types";
import { useAuth } from "@/auth/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "./Button";

/**
 * "+ My List" / "✓ In My List". Signed-out users are sent to sign in.
 * Not shown at all if accounts aren't set up.
 */
export function WatchlistButton({ item, size = "md" }: { item: MediaItem; size?: "md" | "lg" }) {
  const { user } = useAuth();
  const inList = useIsInWatchlist(item.type, item.id);
  const toggle = useToggleWatchlist();

  if (!isSupabaseConfigured) return null;

  return (
    <Button
      label={inList ? "In My List" : "My List"}
      icon={inList ? "checkmark" : "add"}
      variant="secondary"
      size={size}
      onPress={() => {
        if (!user) {
          router.push("/account");
          return;
        }
        toggle.mutate({ item, add: !inList });
      }}
    />
  );
}
