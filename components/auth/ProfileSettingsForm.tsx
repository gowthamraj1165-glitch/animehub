"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/lib/auth-actions";
import { initialAuthState } from "@/lib/auth-types";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { FormField } from "@/components/auth/FormField";
import { SubmitButton } from "@/components/auth/SubmitButton";

/** Edit the signed-in user's display name. */
export function ProfileSettingsForm() {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialAuthState);
  const fieldErrors = state.fieldErrors;

  return (
    <form action={formAction} className="max-w-md space-y-4">
      {state.status === "error" && state.message ? <AuthAlert tone="error">{state.message}</AuthAlert> : null}

      <FormField
        id="username"
        name="username"
        label="Display name"
        type="text"
        autoComplete="username"
        placeholder="e.g. otaku42"
        error={fieldErrors?.username}
      />

      <SubmitButton pending={pending} pendingLabel="Saving…">
        Save changes
      </SubmitButton>
    </form>
  );
}
