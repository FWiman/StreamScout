import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { Screen } from "@/components/Screen";

export default function SeriesScreen() {
  return (
    <Screen hero={<Hero kind="trending" type="tv" label="Trending show" />}>
      <MediaRow title="Trending now" kind="trending" type="tv" />
      <MediaRow title="Popular" kind="popular" type="tv" />
      <MediaRow title="Top rated" kind="topRated" type="tv" />
    </Screen>
  );
}
