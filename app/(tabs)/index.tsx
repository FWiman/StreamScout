import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useMyServices } from "@/api/myServices";
import { useWatchlist } from "@/api/watchlist";
import { Button } from "@/components/Button";
import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { Screen } from "@/components/Screen";
import { useGutter } from "@/hooks/useGutter";
import { colors, spacing } from "@/theme";

export default function HomeScreen() {
  const { ids: myServices, isLoading } = useMyServices();
  const hasServices = myServices.length > 0;
  // Personal tips: titles like the most recently saved movie and TV show in My List.
  const { data: saved } = useWatchlist();
  const tips = (["movie", "tv"] as const)
    .map((type) => saved?.find((item) => item.type === type))
    .filter((item) => item !== undefined);

  return (
    <Screen hero={<Hero kind="trending" type="movie" label="Trending now" />}>
      {hasServices ? (
        <>
          <MediaRow title="Popular movies on your services" kind="services" type="movie" services={myServices} />
          <MediaRow title="Popular TV shows on your services" kind="services" type="tv" services={myServices} />
        </>
      ) : (
        !isLoading && <PickServicesPrompt />
      )}
      {tips.map((item) => (
        <MediaRow
          key={`${item.type}-${item.id}`}
          title={`Because you saved ${item.title}`}
          kind="recommendations"
          type={item.type}
          id={item.id}
        />
      ))}
      <MediaRow title="Trending movies" kind="trending" type="movie" />
      <MediaRow title="Trending TV shows" kind="trending" type="tv" />
      <MediaRow title="Top rated movies" kind="topRated" type="movie" />
      <MediaRow title="Top rated TV shows" kind="topRated" type="tv" />
    </Screen>
  );
}

/** Shown until the user has picked their services. */
function PickServicesPrompt() {
  const router = useRouter();
  const gutter = useGutter();
  return (
    <View style={[styles.prompt, { marginHorizontal: gutter }]}>
      <Ionicons name="tv-outline" size={26} color={colors.accentText} />
      <View style={styles.promptText}>
        <Text style={styles.promptTitle}>Which services do you have?</Text>
        <Text style={styles.promptBody}>Pick them and we&apos;ll show what you can watch right now.</Text>
      </View>
      <Button label="Choose services" onPress={() => router.push("/my-services")} />
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "flex-start",
    maxWidth: 720,
  },
  promptText: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 220,
    gap: 2,
  },
  promptTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  promptBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
