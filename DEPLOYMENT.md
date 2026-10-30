# Deploying AnimeHub to Vercel + Supabase

AnimeHub is a Next.js 16 (App Router) app that uses Supabase for Postgres, Auth and Row Level Security. Everything below fits inside the free tiers of both services.

Estimated time: **20–30 minutes** for a first deploy.

---

## 0. Prerequisites

- A [GitHub](https://github.com) account (Vercel deploys from a Git repository).
- A [Vercel](https://vercel.com) account.
- A [Supabase](https://supabase.com) account.
- Node.js **20.9+** and npm installed locally.
- The code in a GitHub repository — already set up at
  <https://github.com/gowthamraj1165-glitch/animehub> (`main`, first commit pushed).
  If you ever need to point a fresh clone at it:

```bash
git clone https://github.com/gowthamraj1165-glitch/animehub.git
cd animehub
```

> `.env.local` is git-ignored on purpose. Only `.env.example` (placeholders) is committed.
> Every deploy after this is just `git push` — Vercel rebuilds automatically.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard> → **New project**.
2. Pick an organisation, name the project (e.g. `animehub`), set a strong database password and choose the region closest to your users.
3. Wait for provisioning to finish (about a minute).

### 1a. Create the database schema

Open **SQL Editor** in the left sidebar, click **New query**, then paste **`supabase/setup-all.sql`** (open it in VS Code or Notepad, `Ctrl+A`, `Ctrl+C`) and click **Run**.

It contains all four migrations in the right order, so it is a single paste. You should see **"Success. No rows returned"** — that is correct, the file creates tables rather than returning data.

Then, optionally, load the sample catalogue: paste **`supabase/seed.sql`** into a new query and **Run**.

<details>
<summary>Prefer to run the migrations one at a time?</summary>

Use these four files in this exact order, then the seed:

1. `supabase/migrations/20261029000000_init.sql`
2. `supabase/migrations/20261030000000_anime_detail_columns.sql`
3. `supabase/migrations/20261031000000_admin_role_and_episode_fields.sql`
4. `supabase/migrations/20261031000001_protect_profile_role.sql`
5. `supabase/seed.sql` (optional sample data)

`setup-all.sql` is just those four concatenated, so use one or the other — not both.
</details>

> **Alternative (Supabase CLI):** install the CLI, run `supabase login`, `supabase link --project-ref <ref>`, then `supabase db push`. The seed runs automatically on `supabase db reset`; to load it into a hosted project, paste `supabase/seed.sql` into the SQL editor.

The schema sets up:

- `anime`, `episodes`, `genres`, `anime_genres` — public read, **no client writes** (only the server-side service role writes).
- `profiles`, `watchlist`, `watch_history` — owner-only RLS (`auth.uid() = user_id`).
- A trigger that creates a `profiles` row whenever a user signs up.
- A guard trigger that stops users from changing their own `profiles.role` (otherwise they could self-promote to admin).

### 1b. Collect the API credentials

In the Supabase dashboard go to **Project Settings → API** (newer dashboards call this **Project Settings → API Keys**) and copy:

| Value | Where it goes |
| --- | --- |
| **Project URL** (`https://<ref>.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon / publishable** key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role / secret** key | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ The **service_role** key bypasses Row Level Security. It must stay server-side:
> never prefix it with `NEXT_PUBLIC_`, never paste it into client code, never commit it.
> If it ever leaks, rotate it immediately in the Supabase dashboard.

### 1c. Configure Auth redirect URLs

Go to **Authentication → URL Configuration**:

- **Site URL:** `https://<your-production-domain>` (you can temporarily use `http://localhost:3000`).
- **Redirect URLs** — add all of these:
  - `http://localhost:3000/auth/callback`
  - `https://<your-app>.vercel.app/auth/callback`
  - `https://<your-custom-domain>/auth/callback` (if you add one)

If you want to test locally before deploying, also set **Site URL** to `http://localhost:3000` for now and change it after deployment.

> **Email confirmation:** with it enabled, sign-ups must click the emailed link; the app exchanges the code at `/auth/callback`. With it disabled, users are signed in immediately. Both paths work.

### 1d. Make yourself an admin (after signing up)

1. Deploy the site (next section) or run it locally.
2. Sign up with the account you want as admin.
3. In **SQL Editor**, run:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

4. Sign out and back in. `/admin` now opens; everyone else is redirected to `/dashboard`.

---

## 2. Deploy to Vercel

### 2a. Import the repository

1. Go to <https://vercel.com/new>.
2. Select your GitHub repository → **Import**.
3. Vercel detects **Next.js** automatically. Leave **Build Command** (`next build`), **Output Directory** (`.next`) and **Install Command** (`npm install`) at their defaults.
4. Set **Root Directory** to the repo root (or `./` if the app lives in a subfolder).

### 2b. Add environment variables

Before the first deploy, expand **Environment Variables** and add each value. Select all three environments (**Production**, **Preview**, **Development**) unless noted.

| Name | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Safe in the browser. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon / publishable key | Safe in the browser; protected by RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | your service_role / secret key | **Server-only.** Required for admin CRUD. |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-app>.vercel.app` | No trailing slash. Used for metadata + auth email links. |

> Preview deployments get a different URL on every deploy. If you want auth emails to work from previews, either set `NEXT_PUBLIC_SITE_URL` per-deployment (Vercel → Environment Variables → scope to Preview) or rely on the automatic `VERCEL_URL` fallback that the app uses when `NEXT_PUBLIC_SITE_URL` is unset.

### 2c. Deploy

1. Click **Deploy**.
2. Wait for the build to finish. The app builds successfully even without Supabase keys (it renders setup notices), so a green build does not prove the keys are correct — check the runtime.
3. Open the deployment URL. You should see the home page.

### 2d. Point Supabase at the deployed URL

After the first deploy, copy your production domain (e.g. `https://animehub.vercel.app`) and update Supabase **Authentication → URL Configuration**:

- **Site URL:** `https://animehub.vercel.app`
- Keep `http://localhost:3000/auth/callback` and add `https://animehub.vercel.app/auth/callback`.

If you changed `NEXT_PUBLIC_SITE_URL` after deploying, trigger a redeploy so the new value is baked into the build:

```bash
vercel --prod
```

(or **Deployments → … → Redeploy** in the dashboard).

---

## 3. Verify the deployment

Run through this checklist on the live URL:

- [ ] Home page shows the hero + rails (or the empty-state after seeding).
- [ ] `/browse` filters by genre/year/status and paginates.
- [ ] `/search?q=naruto` returns matches.
- [ ] Sign up → confirmation email arrives → link returns to `/dashboard`.
- [ ] Sign in / sign out works; `/dashboard` redirects to `/login` when signed out.
- [ ] Add and remove a watchlist entry from an anime page.
- [ ] Play an episode; progress appears under **Continue Watching**.
- [ ] `/admin` is reachable only by the admin account; non-admins are sent to `/dashboard`.
- [ ] Create / edit / delete an anime and an episode in `/admin`.
- [ ] `/about`, `/contact`, `/faq`, `/terms`, `/privacy`, `/dmca` render; unknown route → custom 404.
- [ ] Security headers present on responses (see below).

Quick header check:

```bash
curl -I https://animehub.vercel.app
```

You should see `x-content-type-options: nosniff`, `x-frame-options: SAMEORIGIN`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy`, and `strict-transport-security`.

---

## 4. Local development

Create `.env.local` from the example and fill in the same values:

```bash
copy .env.example .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then:

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

---

## 5. Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| Home/browse are empty with a "setup required" notice | `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` missing or wrong. Re-add in Vercel and redeploy (public vars are baked in at build time). |
| Admin pages say "Admins only" | Your `profiles.role` is not `admin`. Run the SQL in step 1d and sign in again. |
| Admin create/edit/delete fails with a service-role error | `SUPABASE_SERVICE_ROLE_KEY` is missing or scoped to the wrong environment. |
| Auth emails link to `localhost` | Supabase **Site URL** / **Redirect URLs** still point at localhost, or `NEXT_PUBLIC_SITE_URL` is wrong. Update both and redeploy. |
| "Email not confirmed" on login | Confirm the email (or disable confirmation under **Authentication → Providers → Email**). |
| Progress not saved | The user must be signed in. `watch_history` RLS only accepts the owner's rows. |
| `fetch failed` / network errors | Supabase project paused (free tier pauses after inactivity) or wrong project URL. |
| YouTube links do not play | Use a normal `youtube.com/watch?v=…`, `youtu.be/…`, or `/embed/…` URL. Private/age-restricted videos cannot be embedded. |

---

## 6. Security notes

- **Secrets:** only `.env.example` is committed; `.env.local` and Vercel env vars stay out of git. The service-role key is read exclusively through `lib/supabase/server.ts` on the server.
- **RLS:** the catalogue is public-read; user tables are owner-only; admin mutations go through the service-role client **after** a server-side `profiles.role === 'admin'` check. A database trigger blocks users from changing their own `role`, closing the self-promotion loophole that row-level policies alone cannot cover.
- **Auth redirects:** only same-site paths are accepted after login/confirmation, so the callback cannot be used as an open redirect.
- **Headers:** `next.config.ts` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and HSTS, and disables the `X-Powered-By` header.
- **Input validation:** server actions validate IDs, numbers, URLs and enum values before touching the database, and admin media URLs must be absolute `http(s)` URLs.
- If a key is ever exposed, rotate it in Supabase **Project Settings → API** and update Vercel immediately.

---

## 7. Free-tier notes

- **Vercel Hobby:** plenty for a small catalogue; serverless functions and bandwidth are metered.
- **Supabase Free:** 500 MB database, 50k monthly active users, project pauses after ~1 week of inactivity. Open the dashboard to wake it, or upgrade if that is a problem.
- The catalogue is small enough that `/browse` filters in memory after one query. If the catalogue grows past a few thousand rows, move filtering/sorting/pagination into the database with PostgREST range queries.
- Replace the placeholder contact addresses (`hello@example.com`, `dmca@example.com`) and the template legal copy before launch.
