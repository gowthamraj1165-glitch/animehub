/** Shared between the client forms and the server actions. */

export type AuthField = "username" | "email" | "password" | "confirmPassword";

export type AuthState = {
  status: "idle" | "error" | "success";
  /** Form-level message (bad credentials, check your inbox, ...). */
  message?: string;
  fieldErrors?: Partial<Record<AuthField, string>>;
};

export const initialAuthState: AuthState = { status: "idle" };
