import type { Metadata } from "next";
import { SimplePage } from "@/components/content/SimplePage";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about AnimeHub — accounts, watchlists, continue watching, playback and streaming.",
};

export default function FaqPage() {
  return (
    <SimplePage
      title="Frequently Asked Questions"
      intro="Quick answers to the questions people usually ask before pressing play."
    >
      <h2>What is AnimeHub?</h2>
      <p>
        AnimeHub is a free anime tracker. You sign in, keep a watchlist, and log what
        you have watched — including where playback was stopped, so you can pick up
        right where you left off.
      </p>

      <h2>Do I need an account?</h2>
      <p>
        You need an account to save a watchlist, history and playback progress. Browsing
        and searching series works without one, but you will be asked to sign in when you
        try to watch or track something.
      </p>

      <h2>How do I add or remove anime from my watchlist?</h2>
      <p>
        Open any series page and use the{" "}
        <a href="/browse">browse page</a> — the watchlist button on any series page
        saves it for you. From your{" "}
        <a href="/dashboard?tab=watchlist">dashboard watchlist tab</a> you can also remove
        entries.
      </p>

      <h2>What does Continue Watching do?</h2>
      <p>
        Every time you play an episode, AnimeHub records your playback position and
        completion state. The dashboard&apos;s Continue Watching tab lists anything you
        have not finished yet, newest activity first, with a one-tap resume link.
      </p>

      <h2>What video formats can I watch?</h2>
      <p>
        Episodes are streamed through adaptive bitrate playback. Sources hosted on
        HLS or MP4 can switch quality mid-episode; episodes linked to YouTube play in the
        built-in player.
      </p>

      <h2>How do subtitles work?</h2>
      <p>
        If a subtitle track is attached to an episode (a{" "}
        <code>.vtt</code> file), the player subtitle menu lists it alongside the quality
        tracks so you can switch while watching.
      </p>

      <h2>How much does AnimeHub cost?</h2>
      <p>
        Nothing. The project runs entirely on free tiers — Vercel hosting, Supabase
        database and the Jikan API for metadata — which is also why the feature set stays
        small.
      </p>

      <h2>How do I delete my account or my watch data?</h2>
      <p>
        Account deletion removes your profile, watchlist and playback history. You can
        start that flow from the{" "}
        <a href="/dashboard?tab=settings">profile settings tab</a> or by writing to the{" "}
        <a href="/contact">contact page</a>.
      </p>

      <h2>I still need help. What now?</h2>
      <p>
        Jump into the{" "}
        <a href="/contact">contact page</a> for support questions or the{" "}
        <a href="/dmca">DMCA page</a> if you need to file a takedown notice.
      </p>
    </SimplePage>
  );
}
