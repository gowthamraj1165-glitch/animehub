"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Hls from "hls.js";
import { saveWatchProgressAction } from "@/lib/auth-actions";
import { buttonClass } from "@/components/ui/button";

type WatchPlayerProps = {
  src: string;
  episodeId: number;
  /** Playback position restored from watch_history on load. */
  initialPositionSeconds?: number;
};

type QualityLevel = { height: number; id: number };

/** Normalise a YouTube watch/share link into an embeddable URL. */
function toYouTubeEmbedUrl(src: string): string {
  try {
    const url = new URL(src);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : src;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname.startsWith("/embed/")) return src;
      const id = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|live)\/([^/?#]+)/)?.[1];
      return id ? `https://www.youtube.com/embed/${id}` : src;
    }

    return src;
  } catch {
    // Not a parseable URL (e.g. an embed snippet); use it as-is.
    return src;
  }
}

/**
 * HTML5 video player for one episode.
 *
 * - YouTube embed URLs render in an iframe.
 * - HLS (.m3u8) streams use hls.js with a quality selector.
 * - Anything else (e.g. a plain MP4) uses the native HTML5 video element.
 * - Playback position is upserted into watch_history at most every 10 seconds,
 *   and immediately on pause / end.
 */
export function WatchPlayer({ src, episodeId, initialPositionSeconds = 0 }: WatchPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastSavedAtRef = useRef(0);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [quality, setQuality] = useState<number>(-1); // -1 = automatic
  const [hasSubtitles, setHasSubtitles] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hlsSupported] = useState(() => typeof window !== "undefined" && Hls.isSupported());

  const isYouTube = /youtube\.com|youtu\.be/i.test(src);
  const isHls = !isYouTube && src.includes(".m3u8");

  // Load the source (hls.js for HLS, native src for files) and restore position.
  useEffect(() => {
    if (isYouTube) return;
    const video = videoRef.current;
    if (!video) return;

    if (isHls) {
      if (!hlsSupported) return;

      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError("Playback failed to start. The stream source may be unavailable.");
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const tracks = hls.subtitleTracks;
        const has = Boolean(tracks && tracks.length > 0);
        setHasSubtitles(has);
        if (has) {
          hls.subtitleDisplay = true;
          hls.subtitleTrack = 0;
          setSubtitlesEnabled(true);
        }

        const loaded = hls.levels.map((level, index) => ({ height: level.height, id: index }));
        setQualities(loaded);
        hls.currentLevel = -1; // automatic

        if (initialPositionSeconds > 0) {
          video.currentTime = initialPositionSeconds;
        }

        video.play().catch(() => {
          // Autoplay can be blocked by browser policy; the user can press play.
        });
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    // Plain media file (MP4/WebM/…) — hand off to the native element.
    video.src = src;
    video.load();
    const applyPosition = () => {
      if (initialPositionSeconds > 0) video.currentTime = initialPositionSeconds;
    };
    video.addEventListener("loadedmetadata", applyPosition);
    return () => {
      video.removeAttribute("src");
      video.removeEventListener("loadedmetadata", applyPosition);
      video.load();
    };
  }, [src, isYouTube, isHls, hlsSupported, initialPositionSeconds]);

  // Save the playback position to watch_history every 10 seconds, and on pause/end.
  useEffect(() => {
    if (isYouTube) return;

    const video = videoRef.current;
    if (!video) return;

    const save = (force: boolean) => {
      const positionSeconds = Math.floor(video.currentTime);
      if (!Number.isFinite(positionSeconds) || positionSeconds < 0) return;

      const now = Date.now();
      if (!force && now - lastSavedAtRef.current < 10_000) return;
      lastSavedAtRef.current = now;

      const duration = video.duration;
      const completed =
        video.ended ||
        (Number.isFinite(duration) && duration > 0 && positionSeconds >= duration - 5);

      void saveWatchProgressAction({ episodeId, positionSeconds, completed });
    };

    const interval = window.setInterval(() => save(false), 1000);
    const handlePause = () => save(true);
    const handleEnded = () => save(true);

    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      window.clearInterval(interval);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [episodeId, isYouTube]);

  const handleQualityChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const level = value === "auto" ? -1 : Number(value);
    setQuality(level);
    if (hlsRef.current) hlsRef.current.currentLevel = level;
  };

  const toggleSubtitles = () => {
    const next = !subtitlesEnabled;
    setSubtitlesEnabled(next);
    if (hlsRef.current) hlsRef.current.subtitleDisplay = next;
  };

  if (isYouTube) {
    const embedSrc = toYouTubeEmbedUrl(src);
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={embedSrc}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black">
      <video
        ref={videoRef}
        src={isHls ? undefined : src}
        controls
        playsInline
        preload="metadata"
        className="h-full w-full"
      />

      {error ? (
        <p role="alert" className="absolute inset-x-0 top-3 z-10 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {isHls ? (
        <div className="absolute top-3 right-3 z-10">
          <label htmlFor="watch-quality" className="sr-only">
            Quality
          </label>
          <select
            id="watch-quality"
            value={quality === -1 ? "auto" : String(quality)}
            onChange={handleQualityChange}
            className="h-9 rounded-full border border-line bg-surface/90 px-3 text-xs text-ink backdrop-blur"
          >
            <option value="auto">Auto</option>
            {qualities.map((q) => (
              <option key={q.id} value={String(q.id)}>
                {q.height}p
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {isHls && hasSubtitles ? (
        <div className="absolute top-3 left-3 z-10">
          <button type="button" onClick={toggleSubtitles} className={buttonClass("secondary", "sm")}>
            {subtitlesEnabled ? "Disable subtitles" : "Enable subtitles"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
