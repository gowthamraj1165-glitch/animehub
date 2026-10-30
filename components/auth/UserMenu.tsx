import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { UserMenuClient } from "./UserMenuClient";

/**
 * Async on purpose: this reads the session cookie, so the Navbar renders it
 * inside a <Suspense> boundary.
 */
export async function UserMenu() {
  if (!isSupabaseConfigured()) {
    return (
      <Link href="/login" className={buttonClass("primary", "sm")}>
        Login
      </Link>
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link href="/login" className={buttonClass("primary", "sm")}>
        Login
      </Link>
    );
  }

  return (
    <UserMenuClient
      username={user.username}
      email={user.email}
      avatarUrl={user.avatarUrl}
    />
  );
}
