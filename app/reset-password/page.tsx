import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { SupabaseSetupNotice } from "@/components/auth/SupabaseSetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Set a new password for your AnimeHub account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick something you have not used before. You will be signed in straight after."
      footer={
        <>
          Link expired?{" "}
          <Link
            href="/forgot-password"
            className="rounded text-accent-soft underline-offset-4 hover:underline"
          >
            Request a new one
          </Link>
        </>
      }
    >
      {isSupabaseConfigured() ? <ResetPasswordForm /> : <SupabaseSetupNotice />}
    </AuthShell>
  );
}
