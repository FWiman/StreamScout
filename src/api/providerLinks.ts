/**
 * Länkar till streamingtjänster.
 *
 * TMDB säger bara VILKA tjänster som har en titel, inte en direktlänk till den hos tjänsten
 * (de länkarna ägs av JustWatch och kräver ett partneravtal). Därför öppnar vi tjänstens
 * egen sökning med titeln ifylld – titeln hamnar då överst. På telefonen öppnas ofta
 * tjänstens app direkt, eftersom de flesta tjänster tar över sina egna webbadresser.
 *
 * Tjänster som saknas här får i stället TMDB:s "var kan jag se"-sida, som har
 * direktlänkar till titeln hos alla tjänster.
 *
 * Lägg bara till sök-URL:er som du har testat – en felaktig adress hamnar på fel sida.
 */

type SearchUrl = (query: string) => string;

/** Nyckel = del av tjänstens namn hos TMDB (gemener), t.ex. "Amazon Prime Video". */
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
  // TMDB har kallat tjänsten både "HBO Max" och "Max" – se även exakt namn nedan.
  ["hbo", (q) => `https://play.hbomax.com/search/result?q=${q}`],
  ["tv4 play", (q) => `https://www.tv4play.se/sok/${q}`],
];

/** Tjänster vars namn är för kort för att matcha på en del av namnet. */
const EXACT_NAMES: Record<string, SearchUrl> = {
  max: (q) => `https://play.hbomax.com/search/result?q=${q}`,
};

/**
 * Var ett tryck på en tjänsts logga ska leda.
 * @param providerName tjänstens namn från TMDB
 * @param title titelns namn att söka efter
 * @param fallbackUrl TMDB:s sida med alla tjänster för titeln
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
