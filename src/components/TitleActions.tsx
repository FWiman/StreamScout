import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MediaType } from "@/api/types";
import { useTitleState, useUpdateTitleState, type TitleState } from "@/api/userTitles";
import { useAuth } from "@/auth/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors, spacing } from "@/theme";

/**
 * Member actions on the title page: Seen, thumbs up/down and Not interested.
 * Signed out, tapping one opens the sign-in page (like My List).
 */
export function TitleActions({ type, id }: { type: MediaType; id: number }) {
  const { user } = useAuth();
  const router = useRouter();
  const state = useTitleState(type, id);
  const update = useUpdateTitleState();
  if (!isSupabaseConfigured) return null;

  const change = (patch: Partial<TitleState>) => {
    if (!user) {
      router.push("/account");
      return;
    }
    update.mutate({ type, id, next: { ...state, ...patch } });
  };

  return (
    <View style={styles.row}>
      <Action
        icon={state.seen ? "checkmark-circle" : "checkmark-circle-outline"}
        label={state.seen ? "Seen" : "Mark as seen"}
        active={state.seen}
        // Marking as seen also brings a hidden title back.
        onPress={() => change({ seen: !state.seen, hidden: state.seen ? state.hidden : false })}
      />
      <Action
        icon={state.rating === 1 ? "thumbs-up" : "thumbs-up-outline"}
        label="Like"
        iconOnly
        active={state.rating === 1}
        onPress={() => change({ rating: state.rating === 1 ? null : 1 })}
      />
      <Action
        icon={state.rating === -1 ? "thumbs-down" : "thumbs-down-outline"}
        label="Dislike"
        iconOnly
        active={state.rating === -1}
        onPress={() => change({ rating: state.rating === -1 ? null : -1 })}
      />
      <Action
        icon={state.hidden ? "eye-off" : "eye-off-outline"}
        label={state.hidden ? "Hidden" : "Not interested"}
        active={state.hidden}
        onPress={() => change({ hidden: !state.hidden })}
      />
    </View>
  );
}

interface ActionProps {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  active: boolean;
  iconOnly?: boolean;
  onPress: () => void;
}

function Action({ icon, label, active, iconOnly = false, onPress }: ActionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={4}
      style={({ pressed }) => [styles.action, active && styles.actionActive, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={18} color={active ? colors.accentText : colors.textMuted} />
      {!iconOnly && <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.text,
  },
});
