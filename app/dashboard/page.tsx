import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "@/components/auth/Avatar";
import { ProfileSettingsForm } from "@/components/auth/ProfileSettingsForm";
import { SupabaseSetupNotice } from "@/components/auth/SupabaseSetupNotice";
import { WatchlistRemoveButton } from "@/components/dashboard/WatchlistRemoveButton";
import { Container } from "@/components/ui/Container";
import { buttonClass } from "@/components/ui/button";
import { getWatchHistoryForUser, getWatchlistForUser, type WatchHistoryEntry, type WatchlistEntryWithAnime } from "@/lib/catalog";
import { requireUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your AnimeHub watchlist and progress.",
  robots: { index: false, follow: false },
};

const TABS = [
  { id: "continue", label: "Continue Watching" },
  { id: "watchlist", label: "Watchlist" },
  { id: "history", label: "History" },
  { id: "settings", label: "Profile Settings" },
] as const;

type DashboardTab = (typeof TABS)[number]["id"];

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <Container className="py-12 sm:py-16">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function DashboardContent({ searchParams }: { searchParams: PageProps<"/dashboard">["searchParams"] }) {
  const params = await searchParams;
  const requested = typeof params.tab === "string" ? params.tab : "continue";
  const tab: DashboardTab = (TABS.some((t) => t.id === requested) ? requested : "continue") as DashboardTab;

  if (!isSupabaseConfigured()) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
          This page is only available to signed-in users once authentication is connected.
        </p>
        <div className="mt-6 max-w-xl">
          <SupabaseSetupNotice />
        </div>
      </div>
    );
  }

  const user = await requireUser();
  const joined = user.createdAt ? new Date(user.createdAt) : null;

  // Only load the data the active tab actually renders.
  const needsHistory = tab === "continue" || tab === "history";
  const needsWatchlist = tab === "watchlist";

  const [watchlist, history] = await Promise.all([
    needsWatchlist ? getWatchlistForUser(user.id) : Promise.resolve([]),
    needsHistory ? getWatchHistoryForUser(user.id) : Promise.resolve([]),
  ]);

  const usableHistory = history.filter((entry) => entry.anime);
  const continueWatching = usableHistory.filter((entry) => !entry.completed);

  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar username={user.username} avatarUrl={user.avatarUrl} size={56} />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {user.username}
          </h1>
          <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
        </div>
      </div>

      {joined ? (
        <p className="mt-3 text-xs text-muted">
          Member since {new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(joined)}
        </p>
      ) : null}

      <nav aria-label="Dashboard sections" className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <Link
              key={t.id}
              href={`/dashboard?tab=${t.id}`}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-white"
                  : "border border-line bg-surface text-muted hover:border-accent/60 hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10">
        {tab === "continue" ? <ContinueWatching entries={continueWatching} /> : null}
        {tab === "watchlist" ? <WatchlistTab entries={watchlist} /> : null}
        {tab === "history" ? <HistoryTab entries={usableHistory} /> : null}
        {tab === "settings" ? <ProfileSettings /> : null}
      </div>
    </>
  );
}

function ContinueWatching({ entries }: { entries: WatchHistoryEntry[] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">Continue Watching</h2>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          Nothing in progress right now. Start an episode and your progress will show up here.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.episode_id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/60 p-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/anime/${entry.anime!.mal_id}`}
                  className="block truncate text-sm font-medium hover:text-accent-soft"
                >
                  {entry.anime!.title_english ?? entry.anime!.title}
                </Link>
                <p className="mt-1 text-xs text-muted">Episode {entry.episode?.number ?? "?"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-muted">{Math.floor((entry.position_seconds ?? 0) / 60)} min in</span>
                {entry.episode?.source_url ? (
                  <Link href={`/watch/${entry.anime!.mal_id}/${entry.episode.number}`} className={buttonClass("primary", "sm")}>
                    Resume
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function WatchlistTab({ entries }: { entries: WatchlistEntryWithAnime[] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">Watchlist</h2>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted">
          Your watchlist is empty. Add titles from the browse or anime pages to start tracking them here.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.mal_id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/60 p-4"
            >
              <div className="min-w-0">
                <Link href={`/anime/${entry.mal_id}`} className="block truncate text-sm font-medium hover:text-accent-soft">
                  {entry.anime?.title_english ?? entry.anime?.title}
                </Link>
                <p className="mt-1 text-xs text-muted">Status: {entry.status}</p>
              </div>
              <WatchlistRemoveButton malId={entry.mal_id} redirectTo="/dashboard?tab=watchlist" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function HistoryTab({ entries }: { entries: WatchHistoryEntry[] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">History</h2>
      {entries.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-muted">No watch history yet. Finished or in-progress episodes will appear here.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {entries.map((entry) => (
            <li
              key={entry.episode_id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/60 p-4"
            >
              <div className="min-w-0">
                <Link href={`/anime/${entry.anime!.mal_id}`} className="block truncate text-sm font-medium hover:text-accent-soft">
                  {entry.anime!.title_english ?? entry.anime!.title}
                </Link>
                <p className="mt-1 text-xs text-muted">
                  Episode {entry.episode?.number ?? "?"}
                  {entry.completed ? " · Completed" : ` · ${Math.floor((entry.position_seconds ?? 0) / 60)} min in`}
                </p>
              </div>
              {entry.episode?.source_url ? (
                <Link href={`/watch/${entry.anime!.mal_id}/${entry.episode.number}`} className={buttonClass("secondary", "sm")}>
                  Watch again
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProfileSettings() {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">Profile Settings</h2>
      <p className="mt-2 text-sm text-muted">Update your display name.</p>
      <div className="mt-4 max-w-md">
        <ProfileSettingsForm />
      </div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="flex items-center gap-4" aria-hidden="true">
        <div className="size-14 animate-pulse rounded-full bg-surface" />
        <div className="space-y-2">
          <div className="h-5 w-48 animate-pulse rounded bg-surface" />
          <div className="h-4 w-32 animate-pulse rounded bg-surface" />
        </div>
      </div>
      <span className="sr-only">Loading your dashboard…</span>
    </Container>
  );
}
