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

### Logga in med Google (gratis)

1. Öppna [Google Cloud Console](https://console.cloud.google.com/) och skapa ett projekt, t.ex. *StreamWatch*.
2. Gå till **Google Auth Platform** (sök på "OAuth" i sökfältet):
   - **Branding:** appnamn *StreamWatch* och din e-post som supportadress.
   - **Audience:** *External*. Medan appen är i läget *Testing* kan bara de testanvändare du lägger till logga in – lägg till dig själv, eller tryck *Publish app* när du vill att alla ska kunna.
   - **Clients → Create client:** typ **Web application**, namn *StreamWatch Supabase*.
     - *Authorized JavaScript origins:* `http://localhost:8081`
     - *Authorized redirect URIs:* `https://zhodxslqoycsohosqlrg.supabase.co/auth/v1/callback`
3. Kopiera **Client ID** och **Client secret** till Supabase: [Authentication → Sign In / Providers → Google](https://supabase.com/dashboard/project/zhodxslqoycsohosqlrg/auth/providers). Slå på och spara.
4. Sätt `EXPO_PUBLIC_AUTH_GOOGLE=true` i `.env` och starta om servern.

### Logga in med Apple

**På iPhone (gratis, testas i Expo Go):**

1. I Supabase: [Authentication → Sign In / Providers → Apple](https://supabase.com/dashboard/project/zhodxslqoycsohosqlrg/auth/providers) – slå på och skriv under *Client IDs*:
   `host.exp.Exponent,com.fwiman.streamwatch`
   (`host.exp.Exponent` är Expo Go, den andra är den riktiga appen). Fälten för *Secret Key* lämnas tomma.
2. Sätt `EXPO_PUBLIC_AUTH_APPLE=true` i `.env` och starta om servern.

**På webb och Android** krävs ett [Apple Developer-konto](https://developer.apple.com/programs/) (99 USD/år) för att skapa ett *Services ID* och en signeringsnyckel. Följ [Supabases guide](https://supabase.com/docs/guides/auth/social-login/auth-apple) och sätt sedan `EXPO_PUBLIC_AUTH_APPLE_WEB=true`. Apple kräver att nyckeln förnyas var 6:e månad.

> App Store kräver *Logga in med Apple* om appen erbjuder Google-inloggning – därför finns båda.

### Databas

Tabellen `watchlist` (Min lista) har Row Level Security: varje användare kan bara läsa, lägga till och ta bort sina egna rader. Titel och bilder sparas med raden så att listan visas utan extra TMDB-anrop.

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
- [x] Watchlist (Min lista) som synkas mellan webb och app
- [x] Glömt lösenord
- [x] Logga in med Google och Apple (Apple på webb/Android kräver Apple Developer-konto)
- [ ] Egen backend som döljer TMDB-nyckeln
- [ ] Filtrera på streamingtjänst ("vad finns på Netflix?")
- [ ] Publicera webben (t.ex. EAS Hosting eller Vercel)
- [ ] Publicera i App Store och Google Play (EAS Build)

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Streaminginformation kommer från JustWatch via TMDB.
