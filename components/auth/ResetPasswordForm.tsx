"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "@/lib/auth-actions";
import { initialAuthState } from "@/lib/auth-types";
import { AuthAlert } from "./AuthAlert";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialAuthState,
  );
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && state.message ? (
        <AuthAlert tone="error">{state.message}</AuthAlert>
      ) : null}

      <FormField
        id="password"
        name="password"
        label="New password"
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
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        error={errors?.confirmPassword}
        minLength={8}
      />

      <SubmitButton pending={pending} pendingLabel="Updating…">
        Update password
      </SubmitButton>
    </form>
  );
}
