import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeRedirectPath } from "@/lib/validation";

/**
 * Handles the `?code=...` links Supabase emails out (signup confirmation and
 * password recovery), exchanging the code for a session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  // Only allow same-site paths: blocks "//evil.com", absolute URLs and backslash tricks.
  const next = safeRedirectPath(nextParam, "/dashboard");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const fallback = next.startsWith("/reset-password") ? "/forgot-password" : "/login";

  if (!code) {
    return NextResponse.redirect(`${origin}${fallback}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}${fallback}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
