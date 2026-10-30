"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/lib/auth-actions";
import { initialAuthState } from "@/lib/auth-types";
import { AuthAlert } from "./AuthAlert";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialAuthState);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && state.message ? (
        <AuthAlert tone="error">{state.message}</AuthAlert>
      ) : null}

      <FormField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors?.email}
      />

      <FormField
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors?.password}
      />

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="rounded text-xs text-accent-soft underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <SubmitButton pending={pending} pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
