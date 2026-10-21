# StreamWatch – projektkontext för Claude

## Om projektet
App för att hitta filmer/serier och se var de streamas i Sverige. En Expo-kodbas (SDK 57 – samma version som Expo Go i App Store; uppgradera när Expo Go stöder nyare) som byggs till webb, iOS och Android. Ägaren utvecklar på Windows och kommunicerar på svenska.

## Stack
- Expo SDK 57, Expo Router (filbaserad routing i `app/`), TypeScript strict
- `@tanstack/react-query` för datahämtning och cache
- `expo-image` för bilder, `@expo/vector-icons` (Ionicons) för ikoner
- TMDB API v3, språk `sv-SE`, region `SE`

## Konventioner
- All TMDB-kommunikation går via `src/api/tmdb.ts`; komponenter använder hooks i `src/api/queries.ts`
- TMDB-svar normaliseras till `MediaItem`/`MediaDetails` (`src/api/types.ts`) – komponenter ska inte se råa TMDB-fält
- Färger och avstånd från `src/theme.ts`, inga hårdkodade färger i komponenter
- Importera från `src` med aliaset `@/`
- Användartext på svenska; kod, variabelnamn och commit-meddelanden på engelska
- Allt ska fungera på webb, iOS och Android – undvik webb- eller native-specifika API:er utan fallback
- Dator och telefon har olika layout: `useIsWide()` (`src/hooks/useIsWide.ts`) styr toppmeny (`TopNav`) vs flikmeny, kortstorlekar och toppsektionens (`Hero`) utseende
- Sidomarginal: använd `useGutter()` (4 % av bredden, 16–64 px) för vänster/höger padding – allt linjerar vid samma vänsterkant, inget centrerat maxbredd-innehåll. Rader med affischer går kant i kant
- React Native (0.86+) har strikta typer: skriv refs som `useRef<ComponentRef<typeof TextInput>>(null)` (inte `useRef<TextInput>`), och `ListFooterComponent` m.fl. tar `undefined`, inte `null`
- Installera paket med `npx expo install <paket>` (inte `npm install`) så versionerna passar SDK:n. Byt inte SDK-version utan att kolla vilken Expo Go i App Store stöder

## Kommandon
- `npm run web` / `npm start` – utvecklingsserver
- `npm run typecheck` – TypeScript
- `npm run lint` – ESLint

## Hemligheter
`.env` innehåller `EXPO_PUBLIC_TMDB_API_KEY` och är gitignorerad. `EXPO_PUBLIC_`-variabler hamnar i klientkoden; planen är att flytta TMDB-anrop till en backend.
