"use client";

import { useSyncExternalStore } from "react";
import { buttonClass } from "@/components/ui/button";

const STORAGE_KEY = "animehub_cookie_consent";
const CHANGE_EVENT = "animehub:cookie_consent";

function subscribe(callback: () => void) {
  // The visibility flag lives in localStorage, so listen for changes made
  // here (the native `storage` event only fires across tabs).
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "accepted";
  } catch {
    // localStorage can be unavailable (private mode); show the banner.
    return true;
  }
}

function getServerSnapshot(): boolean {
  // Server rendering never sees localStorage, so default to showing it.
  return false;
}

/**
 * Minimal cookie consent banner. AnimeHub only ever sets the auth session
 * cookie; consent is remembered in localStorage so the notice does not nag
 * returning visitors. Links out to the Privacy Policy for the details.
 */
export function CookieConsent() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!visible) return null;

  function dismiss(accepted: boolean) {
    try {
      window.localStorage.setItem(STORAGE_KEY, accepted ? "accepted" : "declined");
    } catch {
      // localStorage can be unavailable (private mode); the banner just won't persist.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted">
          We use a single session cookie to keep you signed in and set no tracking or
          analytics cookies. See the{" "}
          <a href="/privacy" className="font-medium text-accent-soft underline decoration-accent-soft/40 underline-offset-4 hover:decoration-accent-soft">
            Privacy Policy
          </a>{" "}
          for the full breakdown.
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => dismiss(true)} className={buttonClass("primary", "sm")}>
            Accept
          </button>
          <button type="button" onClick={() => dismiss(false)} className={buttonClass("secondary", "sm")}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
