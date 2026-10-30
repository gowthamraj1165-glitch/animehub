import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { SupabaseSetupNotice } from "@/components/auth/SupabaseSetupNotice";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Request a password reset link for your AnimeHub account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email you signed up with and we will send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="rounded text-accent-soft underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </>
      }
    >
      {isSupabaseConfigured() ? <ForgotPasswordForm /> : <SupabaseSetupNotice />}
    </AuthShell>
  );
}
