import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { Screen } from "@/components/Screen";

export default function HomeScreen() {
  return (
    <Screen hero={<Hero kind="trending" type="movie" label="Trending now" />}>
      <MediaRow title="Trending movies" kind="trending" type="movie" />
      <MediaRow title="Trending TV shows" kind="trending" type="tv" />
      <MediaRow title="Top rated movies" kind="topRated" type="movie" />
      <MediaRow title="Top rated TV shows" kind="topRated" type="tv" />
    </Screen>
  );
}
