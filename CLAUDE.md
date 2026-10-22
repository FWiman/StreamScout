# StreamWatch – project context for Claude

## About the project
App for finding movies/TV shows and seeing where they stream in Sweden. One Expo codebase (SDK 57 – the same version Expo Go in the App Store supports; upgrade once Expo Go supports newer) that builds for web, iOS and Android. The owner develops on Windows.

**Language:** the whole project – UI text, code, comments, commit messages and docs – is in English. The owner writes in Swedish in chat, so reply to them in Swedish.

## Stack
- Expo SDK 57, Expo Router (file-based routing in `app/`), TypeScript strict
- `@tanstack/react-query` for data fetching and caching
- `expo-image` for images, `@expo/vector-icons` (Ionicons) for icons
- TMDB API v3, language `en-US`, region `SE` (Swedish streaming services)
- Supabase for accounts (email/password, Google, Apple): client in `src/lib/supabase.ts`, `useAuth()` from `src/auth/AuthProvider.tsx`. Session storage: the browser's localStorage on web, expo-sqlite localStorage on mobile (`sessionStorage.native.ts`)
- Supabase project `streamwatch` (ref `zhodxslqoycsohosqlrg`, eu-north-1). Table `public.watchlist` with RLS (select/insert/delete on own rows). Client code in `src/api/watchlist.ts` (`useWatchlist`, `useToggleWatchlist`, `useIsInWatchlist`). Schema changes are done as migrations – always run the security advisors afterwards
- Supabase Auth rejects redirect URLs with an IP-address host (verified), even if allow-listed. Expo Go uses `exp://<LAN IP>:8081`, so `oauthRedirectUrl()` in AuthProvider swaps the host for `localhost` on iOS (the auth session intercepts by scheme). Email links can't reach Expo Go; test them on web
- Sign-in buttons are controlled by `.env`: `EXPO_PUBLIC_AUTH_GOOGLE`, `EXPO_PUBLIC_AUTH_APPLE` (iOS native via expo-apple-authentication + `signInWithIdToken`; Expo Go lacks the native module (verified), so it only works in a development/production build – the button is hidden when `isAvailableAsync()` is false) and `EXPO_PUBLIC_AUTH_APPLE_WEB` (OAuth on web/Android, needs an Apple Developer account). Bundle ID / package: `com.fwiman.streamwatch`

## Conventions
- All TMDB communication goes through `src/api/tmdb.ts`; components use the hooks in `src/api/queries.ts`
- TMDB responses are normalized to `MediaItem`/`MediaDetails` (`src/api/types.ts`) – components should never see raw TMDB fields
- Colors and spacing come from `src/theme.ts`, no hard-coded colors in components. Brand color is violet (`accent`, `accentText` for text on dark); errors use `danger` (red) – never `accent`
- Navigation: "My List" (`app/(tabs)/my-list.tsx`) only shows the list; sign-in/profile is `app/account.tsx`, reached from the avatar in `TopNav` (desktop) or `HeaderAccountButton` top right (phone)
- Import from `src` with the `@/` alias
- Wording: "Movies", "TV Shows", "My List"; "Movie"/"TV Show" as type labels
- Everything must work on web, iOS and Android – avoid web- or native-only APIs without a fallback
- Desktop and phone have different layouts: `useIsWide()` (`src/hooks/useIsWide.ts`) controls top nav (`TopNav`) vs tab bar, card sizes and the hero's (`Hero`) look
- Side margin: use `useGutter()` (4% of the width, 16–64 px) for left/right padding – everything aligns to the same left edge, no centered max-width content. Poster rows run edge to edge
- React Native (0.86+) has strict types: write refs as `useRef<ComponentRef<typeof TextInput>>(null)` (not `useRef<TextInput>`), and `ListFooterComponent` etc. take `undefined`, not `null`
- Install packages with `npx expo install <package>` (not `npm install`) so versions match the SDK. Don't change SDK version without checking which one Expo Go in the App Store supports

## Commands
- `npm run web` / `npm start` – dev server
- `npm run typecheck` – TypeScript
- `npm run lint` – ESLint

## Secrets
`.env` contains `EXPO_PUBLIC_TMDB_API_KEY`, `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and is gitignored. `EXPO_PUBLIC_` variables end up in the client code; the plan is to move TMDB requests to a backend.
The Supabase key is publishable on purpose – all data must be protected with Row Level Security in the database.
