"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/lib/auth-actions";
import { Avatar } from "./Avatar";

type UserMenuClientProps = {
  username: string;
  email: string;
  avatarUrl: string | null;
};

export function UserMenuClient({ username, email, avatarUrl }: UserMenuClientProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Account menu for ${username}`}
        className="flex h-9 items-center gap-2 rounded-full border border-line bg-surface pr-2.5 pl-1 text-sm transition-colors hover:border-accent/50 hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none"
      >
        <Avatar username={username} avatarUrl={avatarUrl} size={28} />
        <span className="hidden max-w-28 truncate font-medium sm:block">{username}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className={`size-3.5 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface shadow-2xl shadow-black/50">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium">{username}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>

          <div className="p-1.5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-ink"
            >
              Dashboard
            </Link>
          </div>

          <div className="border-t border-line p-1.5">
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-red-500/10 hover:text-red-200"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
