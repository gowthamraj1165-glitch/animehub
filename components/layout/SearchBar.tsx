"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SearchBarProps = {
  /** Must be unique per page: the input id is used by the hidden label. */
  id?: string;
  className?: string;
  placeholder?: string;
};

/**
 * Controlled input that pushes `/search?q=…` into the history on a debounce,
 * so the navbar gives live search without a page reload. Still exposes a real
 * GET form-less fallback behaviour: typing is the only trigger.
 */
export function SearchBar({
  id = "site-search",
  className = "",
  placeholder = "Search anime…",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState("");

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) return;

    const timer = setTimeout(() => {
      router.replace(`/search?q=${encodeURIComponent(query)}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [value, router]);

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search anime
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className="h-10 w-full rounded-full border border-line bg-surface pr-3 pl-10 text-sm text-ink transition-colors placeholder:text-muted/70 hover:border-line/60 hover:bg-surface-hover focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
      />
    </div>
  );
}
