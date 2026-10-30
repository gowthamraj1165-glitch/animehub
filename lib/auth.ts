import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt: string | null;
};

/**
 * Data Access Layer for the current user.
 *
 * Reads the session cookie, validates the JWT with Supabase, then loads the
 * matching profile row. Returns `null` when signed out (or when the project has
 * no Supabase keys yet).
 *
 * Because this reads cookies, callers must be inside a <Suspense> boundary —
 * Cache Components makes a top-level call a build error.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // RLS restricts this to the signed-in user's own row.
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url, created_at")
      .eq("id", user.id)
      .maybeSingle();

    const email = user.email ?? "";

    return {
      id: user.id,
      email,
      username: profile?.username ?? user.email?.split("@")[0] ?? "there",
      avatarUrl: profile?.avatar_url ?? null,
      createdAt: profile?.created_at ?? null,
    };
  } catch (error) {
    // Next 16.4 (dev, Cache Components) can throw an internal cookie-store
    // invariant while re-rendering after a server action — e.g. when a login
    // action refreshes the session. Degrade to "signed out" instead of taking
    // the whole page down.
    if (process.env.NODE_ENV === "development") {
      console.error("[auth] Could not read the session:", error);
    }
    return null;
  }
});

/** Same as getCurrentUser, but sends signed-out visitors to /login. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Turn a Supabase auth error into something a person can act on. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("invalid login credentials")) return "Email or password is incorrect.";
  if (m.includes("email not confirmed")) return "Confirm your email first — check your inbox.";
  if (m.includes("user already registered")) return "That email already has an account.";
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (m.includes("password should be")) return "That password is too weak. Use at least 8 characters.";
  if (m.includes("auth session missing") || m.includes("session_not_found")) {
    return "That link has expired. Request a new one.";
  }
  if (m.includes("failed to fetch") || m.includes("fetch failed") || m.includes("network")) {
    return "Could not reach Supabase. Check your connection and try again.";
  }

  // Postgres / PostgREST errors surfaced through the Supabase client.
  if (m.includes("duplicate key") || m.includes("unique constraint")) {
    return "That entry already exists.";
  }
  if (m.includes("violates check constraint")) {
    return "Some of those values are out of range.";
  }
  if (m.includes("violates foreign key constraint")) {
    return "That record no longer exists.";
  }
  if (m.includes("row-level security") || m.includes("permission denied")) {
    return "Your account does not have permission to do that.";
  }

  return message;
}
