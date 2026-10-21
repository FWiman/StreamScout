# StreamWatch

Hitta filmer och serier och se var de går att streama i Sverige. En gemensam kodbas för **webb, iOS och Android**, byggd med [Expo](https://expo.dev) (SDK 57), Expo Router och TypeScript. Data kommer från [TMDB](https://www.themoviedb.org/).

Efterföljare till [MovieApp](https://github.com/FWiman/MovieApp) (webb) och [Movie-PhoneApp](https://github.com/FWiman/Movie-PhoneApp) (mobil).

## Kom igång på Windows

Du behöver:

- [Node.js](https://nodejs.org/) LTS (version 22.13 eller senare, eller 24)
- [Git](https://git-scm.com/download/win)
- [VS Code](https://code.visualstudio.com/) – öppna mappen så föreslås rätt tillägg automatiskt
- En gratis API-nyckel från [TMDB](https://www.themoviedb.org/settings/api)

Kör i terminalen (PowerShell eller VS Code-terminalen):

> **Första gången i PowerShell?** Får du felet *"running scripts is disabled on this system"* när du kör `npm`, tillåt skript för ditt konto en gång:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

```powershell
git clone https://github.com/FWiman/StreamWatch.git
cd StreamWatch
npm install
npm run setup
copy .env.example .env
```

Öppna sedan `.env` och klistra in din TMDB-nyckel efter `EXPO_PUBLIC_TMDB_API_KEY=`.

> `npm run setup` installerar resten av paketen i de versioner som passar Expo SDK 57. Det behöver bara köras en gång.

### Starta appen

```powershell
npm run web      # öppnar webbversionen i webbläsaren
npm start        # visar en QR-kod – skanna med Expo Go på telefonen
```

Telefonen och datorn måste vara på samma wifi. Om Expo Go säger att versionen inte stöds, testa på webben så länge eller kör `npx expo start --tunnel`.

## Konton (Supabase)

Inloggning sköts av [Supabase](https://supabase.com) (gratisnivån räcker). Utan nycklar fungerar appen ändå – kontosidan visar då bara en förklaring.

1. **Skapa ett projekt** på [supabase.com](https://supabase.com/dashboard) – välj regionen *North EU (Stockholm)*.
2. **Kopiera nycklarna** från *Project Settings → API* (eller knappen *Connect*) till `.env`:
   `EXPO_PUBLIC_SUPABASE_URL` och `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Starta om `npm run web` / `npm start`.
3. **Tillåt omdirigeringar** under *Authentication → URL Configuration → Redirect URLs*, lägg till:
   - `http://localhost:8081/**` (webben lokalt)
   - `exp://**` (Expo Go)
   - `streamwatch://**` (den riktiga appen)

### Logga in med Google

1. Gå till [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), skapa ett projekt och konfigurera *OAuth consent screen* (extern, appnamn StreamWatch).
2. Skapa *OAuth client ID* av typen **Web application**. Under *Authorized redirect URIs*, lägg till
   `https://<ditt-projekt>.supabase.co/auth/v1/callback` (står även i Supabase under Google-inställningarna).
3. I Supabase: *Authentication → Sign In / Providers → Google* – slå på och klistra in *Client ID* och *Client secret*.

> När appen ska ut i App Store: Apple kräver *Logga in med Apple* om appen erbjuder Google-inloggning.

## Struktur

```
app/                    Skärmar – filnamnet blir adressen (Expo Router)
  (tabs)/               Flikarna: Hem, Filmer, Serier, Sök
  title/[type]/[id].tsx Detaljsida: info, trailer, svenska streamingtjänster
src/
  api/tmdb.ts           Alla anrop till TMDB
  api/queries.ts        React Query-hooks med cachning
  api/types.ts          Typer
  auth/AuthProvider.tsx Inloggning (useAuth)
  lib/supabase.ts       Supabase-klienten
  components/           Återanvändbara komponenter
  theme.ts              Färger och avstånd
```

## Färdplan

- [x] Grund: Expo Router, TMDB, trendande/topprankat, sök, detaljsida, trailers, streamingtjänster i Sverige
- [x] Konton och inloggning (e-post + Google via Supabase)
- [ ] Watchlist som synkas mellan webb och app
- [ ] Egen backend som döljer TMDB-nyckeln
- [ ] Filtrera på streamingtjänst ("vad finns på Netflix?")
- [ ] Publicera webben (t.ex. EAS Hosting eller Vercel)
- [ ] Publicera i App Store och Google Play (EAS Build)

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Streaminginformation kommer från JustWatch via TMDB.
