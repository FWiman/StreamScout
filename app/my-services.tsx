import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useMyServices } from "@/api/myServices";
import { useStreamingServices } from "@/api/queries";
import { imageUrl } from "@/api/tmdb";
import { useAuth } from "@/auth/AuthProvider";
import { Screen } from "@/components/Screen";
import { useGutter } from "@/hooks/useGutter";
import { useIsWide } from "@/hooks/useIsWide";
import { colors, spacing } from "@/theme";

/** Pick the streaming services you have. Saved right away – on the device, and on the account when signed in. */
export default function MyServicesScreen() {
  const gutter = useGutter();
  const isWide = useIsWide();
  const { user } = useAuth();
  const { data: services, isPending } = useStreamingServices("movie");
  const { ids, toggle, saveError } = useMyServices();

  return (
    <Screen>
      <Stack.Screen options={{ title: "My services" }} />
      <View style={[styles.page, { paddingHorizontal: gutter }]}>
        <Text style={styles.title}>My services</Text>
        <Text style={styles.lead}>
          Pick the streaming services you have. We&apos;ll highlight them on every title and let you browse just
          what you can watch.
        </Text>

        {isPending ? (
          <ActivityIndicator color={colors.textMuted} style={styles.loading} />
        ) : (
          <View style={styles.grid}>
            {(services ?? []).map((service) => {
              const selected = ids.includes(service.id);
              return (
                <Pressable
                  key={service.id}
                  onPress={() => toggle(service.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={service.name}
                  style={({ pressed }) => [
                    styles.tile,
                    isWide && styles.tileWide,
                    selected && styles.tileSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Image source={imageUrl(service.logoPath, "w92")} style={styles.logo} />
                  <Text style={styles.name} numberOfLines={2}>
                    {service.name}
                  </Text>
                  <Ionicons
                    name={selected ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={selected ? colors.accent : colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={styles.note}>
          {ids.length === 0
            ? "Nothing picked yet."
            : `${ids.length} ${ids.length === 1 ? "service" : "services"} picked – saved automatically.`}
          {user ? " Your choice follows your account to all your devices." : " Saved on this device."}
        </Text>
        {!user && (
          <Link href="/account" style={styles.link}>
            Sign in to keep them on all your devices
          </Link>
        )}
        {saveError && <Text style={styles.error}>Couldn&apos;t save to your account. Please try again.</Text>}
        {ids.length > 0 && (
          <Link href="/movies?service=mine" style={styles.link}>
            Browse movies on your services →
          </Link>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  lead: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 640,
  },
  loading: {
    alignSelf: "flex-start",
    marginTop: spacing.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    maxWidth: 900,
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    width: "100%",
    padding: spacing.sm,
    paddingRight: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileWide: {
    width: 280,
  },
  tileSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  pressed: {
    opacity: 0.75,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: colors.accentText,
    fontSize: 15,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
});
