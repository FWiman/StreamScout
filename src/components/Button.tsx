import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, spacing } from "@/theme";

interface Props {
  label: string;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>["name"];
  variant?: "primary" | "secondary" | "outline" | "light";
  size?: "md" | "lg";
  /** Shows a spinner and can't be pressed. */
  loading?: boolean;
  disabled?: boolean;
  /** Fill the full width (e.g. in forms). */
  block?: boolean;
}

export function Button({
  label,
  onPress,
  icon,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  block = false,
}: Props) {
  const large = size === "lg";
  const inactive = disabled || loading;
  const contentColor = variant === "light" ? colors.onLight : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        large && styles.large,
        block && styles.block,
        styles[variant],
        pressed && styles.pressed,
        inactive && styles.inactive,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} />
      ) : (
        icon && <Ionicons name={icon} size={large ? 22 : 18} color={contentColor} />
      )}
      <Text style={[styles.label, large && styles.labelLarge, { color: contentColor }]}>{label}</Text>
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
  block: {
    alignSelf: "stretch",
    justifyContent: "center",
    paddingVertical: 13,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.glass,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  light: {
    backgroundColor: colors.light,
  },
  pressed: {
    opacity: 0.8,
  },
  inactive: {
    opacity: 0.5,
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
