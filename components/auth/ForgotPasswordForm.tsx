"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/lib/auth-actions";
import { initialAuthState } from "@/lib/auth-types";
import { AuthAlert } from "./AuthAlert";
import { FormField } from "./FormField";
import { SubmitButton } from "./SubmitButton";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialAuthState,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "success" && state.message ? (
        <AuthAlert tone="success">{state.message}</AuthAlert>
      ) : null}
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
        error={state.fieldErrors?.email}
      />

      <SubmitButton pending={pending} pendingLabel="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  );
}
