import type { Metadata } from "next";
import { SimplePage } from "@/components/content/SimplePage";

export const metadata: Metadata = {
  title: "About",
  description: "What AnimeHub is and how it is built.",
};

export default function AboutPage() {
  return (
    <SimplePage
      title="About AnimeHub"
      intro="A small, fast anime tracker built to stay out of your way."
    >
      <p>
        AnimeHub keeps a single list of the series you are watching, what you have
        finished, and where you stopped. It is intentionally narrow: no social feed,
        no autoplay rabbit holes, no infinite scroll.
      </p>

      <h2>How it works</h2>
      <p>
        Series metadata comes from the{" "}
        <a href="https://jikan.moe" target="_blank" rel="noreferrer">
          Jikan API
        </a>
        , a free, unofficial REST API for MyAnimeList data. Accounts and your
        watchlist live in Supabase. The site runs on Next.js and is hosted on
        Vercel&apos;s free tier.
      </p>

      <h2>Costs</h2>
      <p>
        The whole stack runs on free plans. That is also the reason the feature set
        is deliberately small: every extra query costs bandwidth and database
        storage.
      </p>
    </SimplePage>
  );
}
