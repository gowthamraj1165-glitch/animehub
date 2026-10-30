import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { SupabaseSetupNotice } from "@/components/auth/SupabaseSetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an AnimeHub account.",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Free, no card. Your watchlist and progress stay in sync across devices."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="rounded text-accent-soft underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {isSupabaseConfigured() ? <SignupForm /> : <SupabaseSetupNotice />}
    </AuthShell>
  );
}
