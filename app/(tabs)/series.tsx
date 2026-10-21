import { MediaRow } from "@/components/MediaRow";
import { Screen } from "@/components/Screen";

export default function SeriesScreen() {
  return (
    <Screen>
      <MediaRow title="Trendande just nu" kind="trending" type="tv" />
      <MediaRow title="Populära" kind="popular" type="tv" />
      <MediaRow title="Topprankade" kind="topRated" type="tv" />
    </Screen>
  );
}
