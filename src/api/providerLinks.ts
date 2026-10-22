/**
 * Links to streaming services.
 *
 * TMDB only tells us WHICH services carry a title, not a deep link to it on the service
 * (those links belong to JustWatch and require a partner agreement). So we open the service's
 * own search with the title filled in – the title then shows up first. On phones this often
 * opens the service's app directly, since most services claim their own web addresses.
 *
 * Services missing here get TMDB's "where to watch" page instead, which links
 * straight to the title on every service.
 *
 * Only add search URLs you have tested – a wrong address lands on the wrong page.
 */

type SearchUrl = (query: string) => string;

/** Key = part of the service name at TMDB (lowercase), e.g. "Amazon Prime Video". */
const SEARCH_URLS: [match: string, url: SearchUrl][] = [
  ["netflix", (q) => `https://www.netflix.com/search?q=${q}`],
  ["amazon", (q) => `https://www.primevideo.com/search/?phrase=${q}`],
  ["apple tv", (q) => `https://tv.apple.com/se/search?term=${q}`],
  ["disney", (q) => `https://www.disneyplus.com/search?q=${q}`],
  ["svt play", (q) => `https://www.svtplay.se/sok?q=${q}`],
  ["youtube", (q) => `https://www.youtube.com/results?search_query=${q}`],
  ["google play", (q) => `https://play.google.com/store/search?q=${q}&c=movies`],
  ["viaplay", (q) => `https://viaplay.se/search#search=${q}`],
  ["sf anytime", (q) => `https://www.sfanytime.com/sv/search?query=${q}`],
  ["tele2", (q) => `https://www.tele2play.se/search?q=${q}`],
  ["crunchyroll", (q) => `https://www.crunchyroll.com/search?q=${q}`],
  // TMDB has called the service both "HBO Max" and "Max" – see the exact name below too.
  ["hbo", (q) => `https://play.hbomax.com/search/result?q=${q}`],
  ["tv4 play", (q) => `https://www.tv4play.se/sok/${q}`],
];

/** Services whose name is too short to match on part of the name. */
const EXACT_NAMES: Record<string, SearchUrl> = {
  max: (q) => `https://play.hbomax.com/search/result?q=${q}`,
};

/**
 * Where tapping a service's logo should lead.
 * @param providerName the service name from TMDB
 * @param title the title to search for
 * @param fallbackUrl TMDB's page listing every service for the title
 */
export function providerUrl(providerName: string, title: string, fallbackUrl: string | null) {
  const name = providerName.toLowerCase().trim();
  const query = encodeURIComponent(title);
  const exact = EXACT_NAMES[name];
  if (exact) return exact(query);
  const match = SEARCH_URLS.find(([key]) => name.includes(key));
  if (match) return match[1](query);
  return fallbackUrl;
}
