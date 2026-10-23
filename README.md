# StreamScout

Find movies and TV shows and see where to stream them in Sweden. One codebase for **web, iOS and Android**, built with [Expo](https://expo.dev) (SDK 57), Expo Router and TypeScript. Data comes from [TMDB](https://www.themoviedb.org/).

Successor to [MovieApp](https://github.com/FWiman/MovieApp) (web) and [Movie-PhoneApp](https://github.com/FWiman/Movie-PhoneApp) (mobile).

## Getting started on Windows

You'll need:

- [Node.js](https://nodejs.org/) LTS (version 22.13 or later, or 24)
- [Git](https://git-scm.com/download/win)
- [VS Code](https://code.visualstudio.com/) – open the folder and the right extensions are suggested automatically
- A free API key from [TMDB](https://www.themoviedb.org/settings/api)

Run in the terminal (PowerShell or the VS Code terminal):

> **First time in PowerShell?** If you get *"running scripts is disabled on this system"* when running `npm`, allow scripts for your account once:
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

```powershell
git clone https://github.com/FWiman/StreamScout.git
cd StreamScout
npm install
npm run setup
copy .env.example .env
```

Then fill in the Supabase keys in `.env` (see *Accounts* below). TMDB requests go through the app's own backend (see *TMDB backend*). To try the app without Supabase, you can instead paste a TMDB key after `EXPO_PUBLIC_TMDB_API_KEY=` – it's then built into the app, so only do that locally.

> `npm run setup` installs the remaining packages in the versions that match Expo SDK 57. It only needs to run once.

### Running the app

```powershell
npm run web      # opens the web version in the browser
npm start        # shows a QR code – scan it with Expo Go on your phone
```

Your phone and computer must be on the same Wi-Fi. If Expo Go says the version isn't supported, test on the web for now or run `npx expo start --tunnel`.

## Accounts (Supabase)

Sign-in is handled by [Supabase](https://supabase.com) (the free tier is enough). Without keys the app still works – the account page just shows an explanation.

1. **Create a project** at [supabase.com](https://supabase.com/dashboard) – choose the region *North EU (Stockholm)*.
2. **Copy the keys** from *Project Settings → API* (or the *Connect* button) into `.env`:
   `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Restart `npm run web` / `npm start`.
3. **Allow redirects** under *Authentication → URL Configuration → Redirect URLs*, add:
   - `http://localhost:8081/**` (local web)
   - `exp://**` (Expo Go)
   - `streamscout://**` (the real app)

> **Expo Go and IP addresses:** Supabase rejects redirect URLs that contain an IP address, even if they're on the list – and Expo Go's URLs contain your computer's IP (`exp://192.168.x.x:8081`). The app works around this for Google/Apple sign-in on iPhone. Email links (confirmation, password reset) can't open in Expo Go for the same reason – test those on the web, or in a real build of the app.

### Sign in with Google (free)

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create a project, e.g. *StreamScout*.
2. Go to **Google Auth Platform** (search for "OAuth" in the search bar):
   - **Branding:** app name *StreamScout* and `streamscout.application@gmail.com` as the support address.
   - **Audience:** *External*. While the app is in *Testing* mode, only the test users you add can sign in – add yourself, or press *Publish app* when you want everyone to be able to.
   - **Clients → Create client:** type **Web application**, name *StreamScout Supabase*.
     - *Authorized JavaScript origins:* `http://localhost:8081`
     - *Authorized redirect URIs:* `https://zhodxslqoycsohosqlrg.supabase.co/auth/v1/callback`
3. Copy the **Client ID** and **Client secret** into Supabase: [Authentication → Sign In / Providers → Google](https://supabase.com/dashboard/project/zhodxslqoycsohosqlrg/auth/providers). Enable it and save.
4. Set `EXPO_PUBLIC_AUTH_GOOGLE=true` in `.env` and restart the server.

### Sign in with Apple

**On iPhone:** Expo Go does **not** include Apple's native sign-in module, so the Apple button is hidden there (a small "Dev:" note explains why). It works in a real build of the app (a development build via EAS Build), which in practice needs an [Apple Developer account](https://developer.apple.com/programs/) to install on a phone.

1. In Supabase: [Authentication → Sign In / Providers → Apple](https://supabase.com/dashboard/project/zhodxslqoycsohosqlrg/auth/providers) – enable it and enter under *Client IDs*:
   `com.fwiman.streamscout`. Leave the *Secret Key* fields empty (they're only needed for web).
2. Set `EXPO_PUBLIC_AUTH_APPLE=true` in `.env` and restart the server.

**On web and Android** you need an [Apple Developer account](https://developer.apple.com/programs/) (USD 99/year) to create a *Services ID* and a signing key. Follow [Supabase's guide](https://supabase.com/docs/guides/auth/social-login/auth-apple) and then set `EXPO_PUBLIC_AUTH_APPLE_WEB=true`. Apple requires the key to be renewed every 6 months.

> The App Store requires *Sign in with Apple* if the app offers Google sign-in – that's why both are there.

### TMDB backend (Edge Function)

The app never talks to TMDB directly. It calls the Supabase Edge Function `tmdb` ([supabase/functions/tmdb/index.ts](supabase/functions/tmdb/index.ts)), which adds the TMDB key on the server and only allows the read-only endpoints the app uses.

1. In Supabase: [Edge Functions → Secrets](https://supabase.com/dashboard/project/zhodxslqoycsohosqlrg/functions/secrets) – add `TMDB_API_KEY` with your TMDB key (the v3 *API Key* or the long *API Read Access Token* – both work).
2. Leave `EXPO_PUBLIC_TMDB_API_KEY` empty in `.env` and restart with `npx expo start --clear`.

To deploy a changed function: `npx supabase functions deploy tmdb --no-verify-jwt --project-ref zhodxslqoycsohosqlrg` (it must allow requests without a signed-in user).

### Deleting an account

Account → *Delete account* calls the database function `delete_own_account()` ([supabase/migrations](supabase/migrations)), which deletes the signed-in user; My List goes with it. The app stores and GDPR require this.

### Database

The `watchlist` table (My List) uses Row Level Security: each user can only read, add and remove their own rows. Title and images are stored with the row so the list shows up without extra TMDB requests.

## Publishing the website

The website is hosted on [EAS Hosting](https://docs.expo.dev/eas/hosting/introduction/) (free tier) with your Expo account.

**First time:**

1. `npm install --global eas-cli` and `eas login` (the same account as in Expo Go).
2. `eas init` – links the project to your Expo account (adds a project ID to `app.json`; commit it).
3. `npm run deploy:web` – builds the site with the keys in your `.env` and publishes it. The first time you choose a name, e.g. `streamscout`, which gives `https://streamscout.expo.app`.

**Then point the services to the new address** (replace with yours):

- Supabase → [Authentication → URL Configuration](https://supabase.com/dashboard/project/zhodxslqoycsohosqlrg/auth/url-configuration): *Site URL* `https://streamscout.expo.app`, and add `https://streamscout.expo.app/**` under *Redirect URLs* (keep the localhost ones for development).
- Google Cloud → your OAuth client: add `https://streamscout.expo.app` under *Authorized JavaScript origins*. Under *Audience*, press **Publish app** so anyone can sign in with Google, not just test users.

**Emails to real users:** Supabase's built-in email only sends to members of your Supabase project, and very few per hour. To send confirmation and password emails to everyone, connect your own SMTP service under [Authentication → Emails → SMTP Settings](https://supabase.com/dashboard/project/zhodxslqoycsohosqlrg/auth/smtp), e.g. [Resend](https://resend.com) (free up to 3,000 emails/month – needs a domain of your own to send from).

**Updating the site:** run `npm run deploy:web` again.

## Structure

```
app/                    Screens – the file name becomes the URL (Expo Router)
  (tabs)/               Tabs: Home, Movies, TV Shows, Search, My List
  title/[type]/[id].tsx Title page: info, trailer, Swedish streaming services
  account.tsx           Sign in / profile (phone: the icon top right)
  privacy.tsx           Privacy policy
  my-services.tsx       Pick the streaming services you have
supabase/functions/tmdb/ Edge Function that proxies TMDB and holds the key
supabase/migrations/    Database changes (SQL)
src/
  api/tmdb.ts           All TMDB requests (via the Edge Function)
  api/queries.ts        React Query hooks with caching
  api/watchlist.ts      My List (Supabase)
  api/types.ts          Types
  auth/AuthProvider.tsx Sign-in (useAuth)
  lib/supabase.ts       The Supabase client
  components/           Reusable components
  theme.ts              Colors and spacing
```

## Roadmap

- [x] Foundation: Expo Router, TMDB, trending/top rated, search, title page, trailers, streaming services in Sweden
- [x] Accounts and sign-in (email via Supabase)
- [x] Watchlist (My List) synced between web and app
- [x] Forgot password
- [x] Sign in with Google and Apple (Apple on web/Android needs an Apple Developer account)
- [x] Own backend that hides the TMDB key (Supabase Edge Function)
- [x] Filter by streaming service ("what's on Netflix?") on the Movies and TV Shows pages
- [x] Ready to publish: delete account, privacy policy, icons
- [ ] Publish the website on EAS Hosting (see *Publishing the website*)
- [ ] Own SMTP for emails to real users (needs a domain)
- [x] My services: pick your streaming services, filter by them, see them highlighted
- [ ] Publish on the App Store and Google Play (EAS Build)

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Streaming availability by JustWatch via TMDB.
