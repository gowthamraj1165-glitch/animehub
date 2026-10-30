"use client";

import { useActionState } from "react";
import { signUpAction } from "@/lib/auth-actions";
import { initialAuthState } from "@/lib/auth-types";
import { AuthAlert } from "./AuthAlert";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialAuthState);
  const errors = state.fieldErrors;

  // Keep the success message visible; the form stays usable for a resend.
  const succeeded = state.status === "success" && state.message;

  return (
    <form action={formAction} className="space-y-4">
      {succeeded ? <AuthAlert tone="success">{state.message}</AuthAlert> : null}
      {state.status === "error" && state.message ? (
        <AuthAlert tone="error">{state.message}</AuthAlert>
      ) : null}

      <FormField
        id="username"
        name="username"
        label="Username"
        autoComplete="username"
        placeholder="sakura"
        hint="3–30 characters. Letters, numbers and underscores."
        error={errors?.username}
        minLength={3}
      />

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
        autoComplete="new-password"
        placeholder="••••••••"
        hint="At least 8 characters."
        error={errors?.password}
        minLength={8}
      />

      <FormField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors?.confirmPassword}
        minLength={8}
      />

      <SubmitButton pending={pending} pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
