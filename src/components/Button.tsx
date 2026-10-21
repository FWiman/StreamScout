import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "@/theme";

interface Props {
  label: string;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>["name"];
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
}

export function Button({ label, onPress, icon, variant = "primary", size = "md" }: Props) {
  const large = size === "lg";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        large && styles.large,
        variant === "primary" ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      {icon && <Ionicons name={icon} size={large ? 22 : 18} color={colors.text} />}
      <Text style={[styles.label, large && styles.labelLarge]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 8,
  },
  large: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.glass,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  labelLarge: {
    fontSize: 17,
  },
});
