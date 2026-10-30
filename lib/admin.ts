import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth";

export type AdminUser = SessionUser & { role: string };

/**
 * The signed-in user, but only when their profile role is "admin".
 * Returns null for anonymous users and non-admins — every /admin data path
 * should go through here (or requireAdmin) so the check is server-side.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!data || data.role !== "admin") return null;

  return { ...user, role: data.role };
}

/** Same as getAdminUser, but redirects anyone else: signed-out → /login, signed-in non-admin → /dashboard. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (user) return user;

  const signedIn = await getCurrentUser();
  redirect(signedIn ? "/dashboard" : "/login");
}
