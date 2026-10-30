"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { friendlyAuthError } from "@/lib/auth";
import type { AuthState } from "@/lib/auth-types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  parsePositiveInt,
  safeRedirectPath,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/validation";

const NOT_CONFIGURED: AuthState = {
  status: "error",
  message: "Supabase is not configured. Add your project keys to .env.local and restart.",
};

/** Values the database's watchlist status check constraint accepts. */
const WATCHLIST_STATUSES = new Set(["planning", "watching", "completed", "on_hold", "dropped"]);

/** Prefer the configured public URL so email links never trust a request header. */
async function getOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  }
  // Vercel sets VERCEL_URL without a protocol; preview deploys need it.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const headerList = await headers();
  return headerList.get("origin") ?? "http://localhost:3000";
}

function firstError(errors: AuthState["fieldErrors"]): boolean {
  return Boolean(errors && Object.keys(errors).length > 0);
}

export async function signInAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: AuthState["fieldErrors"] = {};
  const emailError = validateEmail(email);
  if (emailError) fieldErrors.email = emailError;
  // Only require a value here: an existing password may predate the 8-char rule.
  if (!password) fieldErrors.password = "Enter your password.";
  if (firstError(fieldErrors)) return { status: "error", fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: AuthState["fieldErrors"] = {};
  const usernameError = validateUsername(username);
  if (usernameError) fieldErrors.username = usernameError;
  const emailError = validateEmail(email);
  if (emailError) fieldErrors.email = emailError;
  const passwordError = validatePassword(password);
  if (passwordError) fieldErrors.password = passwordError;
  const confirmError = validateConfirmPassword(password, confirmPassword);
  if (confirmError) fieldErrors.confirmPassword = confirmError;
  if (firstError(fieldErrors)) return { status: "error", fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Picked up by the handle_new_user() trigger to name the profile row.
      data: { username },
      emailRedirectTo: `${await getOrigin()}/auth/callback`,
    },
  });

  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  // Email confirmation disabled → the user is signed in immediately.
  if (data.session) redirect("/dashboard");

  // Deliberately identical for brand-new and existing emails, so this form
  // cannot be used to discover which addresses have accounts.
  return {
    status: "success",
    message: "Check your inbox — we sent you a link to confirm your email address.",
  };
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function forgotPasswordAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const email = String(formData.get("email") ?? "").trim();
  const emailError = validateEmail(email);
  if (emailError) return { status: "error", fieldErrors: { email: emailError } };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await getOrigin()}/auth/callback?next=/reset-password`,
  });

  // Surface throttling, but never reveal whether the address exists.
  if (error && /rate limit|too many/i.test(error.message)) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  return {
    status: "success",
    message: "If that address has an account, a reset link is on its way.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: AuthState["fieldErrors"] = {};
  const passwordError = validatePassword(password);
  if (passwordError) fieldErrors.password = passwordError;
  const confirmError = validateConfirmPassword(password, confirmPassword);
  if (confirmError) fieldErrors.confirmPassword = confirmError;
  if (firstError(fieldErrors)) return { status: "error", fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  redirect("/dashboard");
}

export async function addToWatchlistAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const malId = parsePositiveInt(formData.get("malId"));
  const requestedStatus = String(formData.get("status") ?? "planning");
  const status = WATCHLIST_STATUSES.has(requestedStatus) ? requestedStatus : "planning";
  if (malId === null) {
    return { status: "error", message: "That anime could not be found." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Sign in to add titles to your watchlist." };
  }

  const { error } = await supabase.from("watchlist").insert({ user_id: user.id, mal_id: malId, status });
  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  redirect(`/anime/${malId}`);
}

export async function removeFromWatchlistAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const malId = parsePositiveInt(formData.get("malId"));
  if (malId === null) {
    return { status: "error", message: "That anime could not be found." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Sign in to manage your watchlist." };
  }

  const { error } = await supabase.from("watchlist").delete().eq("user_id", user.id).eq("mal_id", malId);
  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  // Only same-site paths are honoured — otherwise this would be an open redirect.
  redirect(safeRedirectPath(String(formData.get("redirectTo") ?? ""), `/anime/${malId}`));
}

export async function updateProfileAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const username = String(formData.get("username") ?? "").trim();
  const fieldErrors: AuthState["fieldErrors"] = {};
  const usernameError = validateUsername(username);
  if (usernameError) fieldErrors.username = usernameError;
  if (Object.keys(fieldErrors).length > 0) return { status: "error", fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Sign in to update your profile." };
  }

  const { error } = await supabase.from("profiles").update({ username }).eq("id", user.id);
  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  return { status: "success", message: "Your display name has been updated." };
}

export type WatchProgressState = {
  status: "idle" | "saving" | "saved" | "error";
  message?: string;
};

/** Upsert the signed-in user's playback position for one episode. */
export async function saveWatchProgressAction(input: {
  episodeId: number;
  positionSeconds: number;
  completed: boolean;
}): Promise<WatchProgressState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: "Supabase is not configured. Add your project keys to .env.local and restart." };
  }

  // The client controls this payload, so never trust it: the DB has a
  // `position_seconds >= 0` check and a positive-episode-id FK.
  const episodeId = Number(input?.episodeId);
  const positionSeconds = Math.floor(Number(input?.positionSeconds));
  const completed = input?.completed === true;

  if (!Number.isInteger(episodeId) || episodeId <= 0) {
    return { status: "error", message: "That episode could not be saved." };
  }
  if (!Number.isFinite(positionSeconds) || positionSeconds < 0) {
    return { status: "error", message: "That playback position is invalid." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Sign in to save your playback position." };
  }

  const { error } = await supabase.from("watch_history").upsert(
    {
      user_id: user.id,
      episode_id: episodeId,
      position_seconds: positionSeconds,
      completed,
      watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,episode_id" },
  );

  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  return { status: "saved" };
}

/** The signed-in user's last playback position for one episode. */
export async function getWatchProgressAction(episodeId: number): Promise<{ positionSeconds: number; completed: boolean } | null> {
  if (!isSupabaseConfigured()) return null;
  if (!Number.isInteger(episodeId) || episodeId <= 0) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("watch_history")
    .select("position_seconds, completed")
    .eq("user_id", user.id)
    .eq("episode_id", episodeId)
    .maybeSingle();

  if (!data) return null;
  return { positionSeconds: data.position_seconds, completed: data.completed };
}
