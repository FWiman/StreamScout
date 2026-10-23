import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/AuthProvider";
import { useGutter } from "@/hooks/useGutter";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors } from "@/theme";

/**
 * Phone header, top right: the account page. A round initial badge when signed in,
 * a person icon when signed out (same idea as the avatar in the desktop top nav).
 */
export function HeaderAccountButton() {
  const router = useRouter();
  const gutter = useGutter();
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured || loading) return null;

  return (
    <Pressable
      onPress={() => router.push("/account")}
      accessibilityRole="button"
      accessibilityLabel={user ? "My account" : "Sign in"}
      hitSlop={8}
      style={({ pressed }) => [{ marginRight: gutter }, pressed && styles.pressed]}
    >
      {user ? (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user.email ?? "?").charAt(0).toUpperCase()}</Text>
        </View>
      ) : (
        <Ionicons name="person-circle-outline" size={30} color={colors.text} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.onAccent,
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.7,
  },
});
