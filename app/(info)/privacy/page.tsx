import type { Metadata } from "next";
import { SimplePage } from "@/components/content/SimplePage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What AnimeHub stores and why.",
};

export default function PrivacyPage() {
  return (
    <SimplePage
      title="Privacy Policy"
      intro="The short version: we store what is needed to keep your list, and nothing else."
      draft
    >
      <h2>What we store</h2>
      <p>
        Your email address, a hashed password (handled by Supabase Auth), your
        watchlist entries, and playback progress. No payment details are collected.
      </p>

      <h2>Cookies</h2>
      <p>
        A single session cookie keeps you signed in. Analytics cookies are not used.
      </p>

      <h2>Third parties</h2>
      <p>
        Authentication and database hosting are provided by Supabase. The site is
        served by Vercel, which processes standard request logs. Anime metadata is
        requested from the Jikan API; your searches are not sent with any account
        identifier.
      </p>

      <h2>Your choices</h2>
      <p>
        You can delete your account at any time, which removes your watchlist and
        history. To request deletion, use the <a href="/contact">contact page</a>.
      </p>
    </SimplePage>
  );
}
