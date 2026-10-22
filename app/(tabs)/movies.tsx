import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { Screen } from "@/components/Screen";

export default function MoviesScreen() {
  return (
    <Screen hero={<Hero kind="popular" type="movie" label="Popular movie" />}>
      <MediaRow title="Trending now" kind="trending" type="movie" />
      <MediaRow title="Popular" kind="popular" type="movie" />
      <MediaRow title="Top rated" kind="topRated" type="movie" />
    </Screen>
  );
}
