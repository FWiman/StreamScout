import { MediaRow } from "@/components/MediaRow";
import { Screen } from "@/components/Screen";

export default function MoviesScreen() {
  return (
    <Screen>
      <MediaRow title="Trendande just nu" kind="trending" type="movie" />
      <MediaRow title="Populära" kind="popular" type="movie" />
      <MediaRow title="Topprankade" kind="topRated" type="movie" />
    </Screen>
  );
}
