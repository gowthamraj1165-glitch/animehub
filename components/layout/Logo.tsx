import Link from "next/link";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="AnimeHub home"
      className={`group flex shrink-0 items-center gap-2.5 rounded-xl ${className}`}
    >
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-accent to-fuchsia-600 shadow-[0_6px_18px_-8px_var(--color-accent)] transition-transform group-hover:scale-105">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="size-4 translate-x-px text-white"
        >
          <path d="M8 5.5v13l10-6.5-10-6.5Z" fill="currentColor" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight">
        Anime<span className="text-accent-soft">Hub</span>
      </span>
    </Link>
  );
}
