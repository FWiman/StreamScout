import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors, spacing } from "@/theme";
import { Button } from "./Button";

interface Props {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  text: string;
}

/**
 * Centered card for features that need an account (My List, My services),
 * laid out like the sign-in card on the account page. "Sign in" opens the account page,
 * which comes back here after signing in.
 */
export function SignInPrompt({ icon, title, text }: Props) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Ionicons name={icon} size={32} color={colors.accentText} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
        {isSupabaseConfigured && (
          <Button label="Sign in" icon="person-circle-outline" block onPress={() => router.push("/account")} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  text: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
});
