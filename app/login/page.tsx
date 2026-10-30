import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { SupabaseSetupNotice } from "@/components/auth/SupabaseSetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your AnimeHub account.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to sync your watchlist and pick up where you left off."
      footer={
        <>
          New to AnimeHub?{" "}
          <Link
            href="/signup"
            className="rounded text-accent-soft underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {isSupabaseConfigured() ? <LoginForm /> : <SupabaseSetupNotice />}
    </AuthShell>
  );
}
