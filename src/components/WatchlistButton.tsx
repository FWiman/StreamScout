import { router } from "expo-router";
import { useIsInWatchlist, useToggleWatchlist } from "@/api/watchlist";
import type { MediaItem } from "@/api/types";
import { useAuth } from "@/auth/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "./Button";

/**
 * "+ Min lista" / "I min lista". Utloggad skickas man till inloggningen.
 * Visas inte alls om konton inte är uppsatta.
 */
export function WatchlistButton({ item, size = "md" }: { item: MediaItem; size?: "md" | "lg" }) {
  const { user } = useAuth();
  const inList = useIsInWatchlist(item.type, item.id);
  const toggle = useToggleWatchlist();

  if (!isSupabaseConfigured) return null;

  return (
    <Button
      label={inList ? "I min lista" : "Min lista"}
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
