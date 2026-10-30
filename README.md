# AnimeHub

A free-tier anime tracker and streaming shell built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Auth + DB | Supabase (Postgres + Auth) |
| Hosting | Vercel |
| Metadata | [Jikan API](https://jikan.moe) |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase keys
npm run dev
```

Open http://localhost:3000.

> Node.js 20.9+ is required. This project was scaffolded with Node 26.

## Scripts

```bash
npm run dev     # dev server on :3000
npm run build   # production build (also runs type checks)
npm run start   # serve the production build
npm run lint    # eslint
```

## Environment

All variables live in `.env.local` (git-ignored). See `.env.example` for the full list.
Only `NEXT_PUBLIC_*` values are exposed to the browser — the Supabase service role key
must never be prefixed that way.

## Routes

| Route | Status |
| --- | --- |
| `/` | Home — featured hero + Trending / New Episodes / Free to Watch rails from Supabase |
| `/browse` | Browse catalogue: genre / year / status filters, sorting (popular / newest / A–Z), pagination |
| `/anime/[id]` | Anime detail — poster, synopsis, genres, studio, year, rating, episode list, Watch / Add to Watchlist |
| `/search?q=…` | Title search across the Supabase catalogue (debounced navbar → results grid) |
| `/watch/[malId]/[number]` | Episode player view (hls.js + quality selector, MP4/YouTube fallback, subtitles, resume position, prev/next) |
| `/login`, `/signup` | Email + password auth (server actions) |
| `/forgot-password`, `/reset-password` | Reset link request + new password form |
| `/auth/callback` | Exchanges the emailed `?code=` for a session cookie |
| `/dashboard` | Signed-in only — tabs: Continue Watching, Watchlist, History, Profile Settings |
| `/about`, `/contact`, `/terms`, `/privacy`, `/dmca` | Info pages (legal copy is template text) |

## Authentication

`@supabase/ssr` with the `getAll`/`setAll` cookie API. Reads go through
`lib/auth.ts` (`getCurrentUser`, `requireUser`); writes through the server actions
in `lib/auth-actions.ts`, driven by `useActionState` in the forms.

- **Without keys** the app still builds and runs: auth pages show a setup notice,
  the Navbar shows "Login", and `isSupabaseConfigured()` short-circuits every
  Supabase call.
- **Session reads happen in async components inside `<Suspense>`.** Cache Components
  turns a top-level `cookies()` call into a build error, so the Navbar's `UserMenu`
  and the dashboard body stream in behind a boundary.
- **`proxy.ts`** (Next 16's renamed middleware) refreshes the session on every
  request, redirects signed-out `/dashboard` visits to `/login`, and bounces
  signed-in users away from `/login` and `/signup`.
- **Signup** passes the username as `options.data.username`; the
  `handle_new_user()` trigger copies it into `profiles`.

In the Supabase dashboard, add `<your site>/auth/callback` to
**Authentication → URL Configuration → Redirect URLs** (both
`http://localhost:3000/auth/callback` and the production URL). Email
confirmation and recovery links point there, then the route swaps the code for a
session. Set `NEXT_PUBLIC_SITE_URL` so those links never depend on a request host.

Known quirk: Next.js 16.4 (dev, with Cache Components) can throw an internal
`InvariantError` from `cookies()` while the page re-renders right after a server
action that touches the session. The session read in `lib/auth.ts` degrades to
"signed out" instead of crashing the page; production builds are unaffected. If
you still see a server error after signing in, restart the dev server.

## Database

Migrations live in `supabase/migrations/` and must be applied **in filename order**:

| File | Purpose |
| --- | --- |
| `20261029000000_init.sql` | 7 tables, foreign keys, indexes, RLS policies, `updated_at` + new-user triggers |
| `20261030000000_anime_detail_columns.sql` | `anime.studio`, `episodes.season` |
| `20261031000000_admin_role_and_episode_fields.sql` | `profiles.role`, `episodes.thumbnail_url`, `episodes.subtitle_url` |
| `20261031000001_protect_profile_role.sql` | Trigger that stops users promoting themselves to admin |
| `supabase/seed.sql` | (optional) 5 anime, 10 genres, their links, and 5 placeholder episodes |

Apply them with the Supabase CLI (`supabase db push`, then `supabase db reset` to seed),
or paste each migration and then the seed into the SQL editor — in that order.
Step-by-step instructions (including Vercel) are in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

Schema in one line: `anime` ← `anime_genres` → `genres`, `anime` ← `episodes`,
and `profiles` / `watchlist` / `watch_history` hang off `auth.users`. Catalogue
tables are public-read with no client write policy, so only the service role can
change them.

## Structure

```
app/            routes, root layout, metadata
components/
  content/      long-form page wrappers
  layout/       Navbar, Footer, Logo, SearchBar
  ui/           Container, button styles
  anime/        AnimeCard (poster, title, rating; `className` swaps rail vs grid width)
lib/            (next) Jikan client + Supabase clients, auth, catalog queries
supabase/       migration + seed SQL
```

## Notes for the next steps

- Jikan allows ~3 requests/second. Call it only from the server and cache responses
  (`fetch(url, { next: { revalidate: 86400 } })`); never call it from the browser.
- Metadata pages are static today. `/search` is the only partially prerendered route
  because it reads `searchParams` inside a `Suspense` boundary — keep that pattern.
- Do not proxy video through Vercel or store it in Supabase Storage; both free tiers
  are far too small for it.
