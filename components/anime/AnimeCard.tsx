import Link from "next/link";

type AnimeCardProps = {
  malId: number;
  title: string;
  imageUrl: string | null;
  score: number | null;
  /** Episode the card deep-links to; omit for whole-series cards. */
  episodeNumber?: number;
  href: string;
  /** Card width modifier — rails use the default 148px, grids pass `w-full`. */
  className?: string;
};

/** Reusable poster card: image, title and rating. Used by the home rails + browse grid. */
export function AnimeCard({ title, imageUrl, score, episodeNumber, href, className }: AnimeCardProps) {
  return (
    <Link href={href} className={`group block shrink-0 snap-start ${className ?? "w-[148px]"}`}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-line bg-surface">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- poster comes from the anime table / Jikan CDN
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-accent/15">
            <span className="text-4xl font-semibold text-accent-soft">{title.slice(0, 1)}</span>
          </div>
        )}

        {episodeNumber ? (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            EP {episodeNumber}
          </span>
        ) : null}

        {score != null ? (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
            {score.toFixed(1)}
          </span>
        ) : null}
      </div>

      <p className="mt-2 truncate text-sm font-medium">{title}</p>
      <p className="text-xs text-muted">{score != null ? `Rating ${score.toFixed(1)}` : "Not rated yet"}</p>
    </Link>
  );
}
