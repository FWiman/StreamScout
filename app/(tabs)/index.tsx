import { Hero } from "@/components/Hero";
import { MediaRow } from "@/components/MediaRow";
import { Screen } from "@/components/Screen";

export default function HomeScreen() {
  return (
    <Screen hero={<Hero kind="trending" type="movie" label="Trendar just nu" />}>
      <MediaRow title="Trendande filmer" kind="trending" type="movie" />
      <MediaRow title="Trendande serier" kind="trending" type="tv" />
      <MediaRow title="Topprankade filmer" kind="topRated" type="movie" />
      <MediaRow title="Topprankade serier" kind="topRated" type="tv" />
    </Screen>
  );
}
