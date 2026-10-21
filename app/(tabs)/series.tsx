import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { Screen } from "@/components/Screen";

export default function SeriesScreen() {
  return (
    <Screen hero={<Hero kind="trending" type="tv" label="Trendande serie" />}>
      <MediaRow title="Trendande just nu" kind="trending" type="tv" />
      <MediaRow title="Populära" kind="popular" type="tv" />
      <MediaRow title="Topprankade" kind="topRated" type="tv" />
    </Screen>
  );
}
