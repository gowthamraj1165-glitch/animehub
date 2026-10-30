"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { friendlyAuthError } from "@/lib/auth";
import type { AuthState } from "@/lib/auth-types";
import { isHttpUrl, parsePositiveInt } from "@/lib/validation";

const NOT_AUTHORIZED: AuthState = {
  status: "error",
  message: "Admins only — your account does not have permission to do that.",
};

const MAX_URL_LENGTH = 2048;

function str(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function optionalText(value: FormDataEntryValue | null): string | null {
  const text = str(value);
  return text || null;
}

/** Parse an optional integer field. `valid: false` means the value was not a whole number. */
function optionalInteger(value: FormDataEntryValue | null): { value: number | null; valid: boolean } {
  const raw = str(value);
  if (!raw) return { value: null, valid: true };
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return { value: null, valid: false };
  return { value: parsed, valid: true };
}

/** Parse an optional 0–10 rating. */
function optionalRating(value: FormDataEntryValue | null): { value: number | null; valid: boolean } {
  const raw = str(value);
  if (!raw) return { value: null, valid: true };
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) return { value: null, valid: false };
  return { value: parsed, valid: true };
}

/** Validate an optional absolute http(s) URL (used for media links). */
function optionalHttpUrl(
  value: FormDataEntryValue | null,
  label: string,
): { value: string | null; error?: string } {
  const raw = str(value);
  if (!raw) return { value: null };
  if (raw.length > MAX_URL_LENGTH) return { value: null, error: `${label} is too long.` };
  if (!isHttpUrl(raw)) return { value: null, error: `${label} must be a full http(s) URL.` };
  return { value: raw };
}

type AnimeFormValues = {
  mal_id: number;
  title: string;
  title_english: string | null;
  synopsis: string | null;
  image_url: string | null;
  type: string | null;
  status: string | null;
  year: number | null;
  score: number | null;
  episode_count: number | null;
  studio: string | null;
};

/** Validate every anime field before it reaches the service-role client. */
function parseAnimeForm(formData: FormData): { values: AnimeFormValues } | { error: string } {
  const malId = parsePositiveInt(formData.get("mal_id"));
  if (malId === null) return { error: "Anime id must be a positive whole number." };

  const title = str(formData.get("title"));
  if (!title) return { error: "Title is required." };
  if (title.length > 300) return { error: "Title is too long (300 characters max)." };

  const synopsis = optionalText(formData.get("synopsis"));
  if (synopsis && synopsis.length > 20_000) return { error: "Synopsis is too long." };

  const image = optionalHttpUrl(formData.get("image_url"), "Image URL");
  if (image.error) return { error: image.error };

  const year = optionalInteger(formData.get("year"));
  if (!year.valid || (year.value !== null && (year.value < 1900 || year.value > 2100))) {
    return { error: "Year must be a whole number between 1900 and 2100." };
  }

  const score = optionalRating(formData.get("score"));
  if (!score.valid) return { error: "Score must be between 0 and 10." };

  const episodeCount = optionalInteger(formData.get("episode_count"));
  if (!episodeCount.valid || (episodeCount.value !== null && episodeCount.value < 0)) {
    return { error: "Episode count must be zero or a positive whole number." };
  }

  return {
    values: {
      mal_id: malId,
      title,
      title_english: optionalText(formData.get("title_english")),
      synopsis,
      image_url: image.value,
      type: optionalText(formData.get("type")),
      status: optionalText(formData.get("status")),
      year: year.value,
      score: score.value,
      episode_count: episodeCount.value,
      studio: optionalText(formData.get("studio")),
    },
  };
}

/** Catalogue pages are cached; refresh every surface a mutation can change. */
function revalidateCatalogue(malId?: number) {
  revalidatePath("/");
  revalidatePath("/browse");
  revalidatePath("/admin");
  if (malId) revalidatePath(`/anime/${malId}`);
}

/** Create a new anime row in the catalogue. */
export async function createAnimeAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const admin = await getAdminUser();
  if (!admin) return NOT_AUTHORIZED;

  const parsed = parseAnimeForm(formData);
  if ("error" in parsed) return { status: "error", message: parsed.error };
  const { values } = parsed;

  const supabase = await createAdminClient();
  const { error } = await supabase.from("anime").insert(values);

  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  revalidateCatalogue(values.mal_id);
  return { status: "success", message: `Anime “${values.title}” was created.` };
}

/** Edit an existing anime row (identified by its Jikan mal_id). */
export async function updateAnimeAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const admin = await getAdminUser();
  if (!admin) return NOT_AUTHORIZED;

  const parsed = parseAnimeForm(formData);
  if ("error" in parsed) return { status: "error", message: parsed.error };
  const { values } = parsed;

  const supabase = await createAdminClient();
  const { error } = await supabase.from("anime").update(values).eq("mal_id", values.mal_id);

  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  revalidateCatalogue(values.mal_id);
  return { status: "success", message: `Anime “${values.title}” was updated.` };
}

/** Delete an anime (episodes + genre links cascade). */
export async function deleteAnimeAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const admin = await getAdminUser();
  if (!admin) return NOT_AUTHORIZED;

  const malId = parsePositiveInt(formData.get("mal_id"));
  if (malId === null) return { status: "error", message: "Anime id must be a positive whole number." };

  const supabase = await createAdminClient();
  const { error } = await supabase.from("anime").delete().eq("mal_id", malId);
  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  revalidateCatalogue(malId);
  return { status: "success", message: "Anime deleted." };
}

/** Add an episode with a video URL, optional subtitle + thumbnail. */
export async function createEpisodeAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const admin = await getAdminUser();
  if (!admin) return NOT_AUTHORIZED;

  const malId = parsePositiveInt(formData.get("mal_id"));
  const number = parsePositiveInt(formData.get("number"));
  if (malId === null || number === null) {
    return { status: "error", message: "Anime and episode number must be positive whole numbers." };
  }

  const source = optionalHttpUrl(formData.get("source_url"), "Video URL");
  if (source.error || !source.value) {
    return { status: "error", message: source.error ?? "Video URL is required." };
  }

  const subtitle = optionalHttpUrl(formData.get("subtitle_url"), "Subtitle URL");
  if (subtitle.error) return { status: "error", message: subtitle.error };

  const thumbnail = optionalHttpUrl(formData.get("thumbnail_url"), "Thumbnail URL");
  if (thumbnail.error) return { status: "error", message: thumbnail.error };

  const duration = optionalInteger(formData.get("duration_seconds"));
  if (!duration.valid) {
    return { status: "error", message: "Duration must be a positive whole number of seconds." };
  }
  // The form defaults to 0 for "not set"; the DB constraint requires > 0.
  const durationSeconds = duration.value !== null && duration.value > 0 ? duration.value : null;

  const season = optionalInteger(formData.get("season"));
  if (!season.valid || (season.value !== null && season.value < 0)) {
    return { status: "error", message: "Season must be zero or a positive whole number." };
  }

  const supabase = await createAdminClient();
  const { error } = await supabase.from("episodes").insert({
    mal_id: malId,
    number,
    title: optionalText(formData.get("title")),
    source_url: source.value,
    subtitle_url: subtitle.value,
    thumbnail_url: thumbnail.value,
    duration_seconds: durationSeconds,
    season: season.value,
  });

  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  revalidateCatalogue(malId);
  revalidatePath(`/watch/${malId}/${number}`);
  return { status: "success", message: `Episode ${number} of anime ${malId} was added.` };
}

/** Delete one episode of a series. */
export async function deleteEpisodeAction(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const admin = await getAdminUser();
  if (!admin) return NOT_AUTHORIZED;

  const malId = parsePositiveInt(formData.get("mal_id"));
  const number = parsePositiveInt(formData.get("number"));
  if (malId === null || number === null) {
    return { status: "error", message: "Anime and episode number must be positive whole numbers." };
  }

  const supabase = await createAdminClient();
  const { error } = await supabase.from("episodes").delete().eq("mal_id", malId).eq("number", number);
  if (error) {
    return { status: "error", message: friendlyAuthError(error.message) };
  }

  revalidateCatalogue(malId);
  revalidatePath(`/watch/${malId}/${number}`);
  return { status: "success", message: "Episode deleted." };
}
