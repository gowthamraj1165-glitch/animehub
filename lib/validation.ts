/** Validation rules shared by the auth forms and their server actions. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (!EMAIL_RE.test(email)) return "Enter a valid email address, like you@example.com.";
  if (email.length > 254) return "That email address is too long.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Enter a password.";
  if (value.length < 8) return "Use at least 8 characters.";
  // Supabase (bcrypt) rejects anything longer than 72 bytes.
  if (new TextEncoder().encode(value).length > 72) return "Use 72 characters or fewer.";
  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return "Re-enter your password.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export function validateUsername(value: string): string | null {
  const username = value.trim();
  if (!username) return "Choose a username.";
  if (username.length < 3) return "Use at least 3 characters.";
  if (username.length > 30) return "Use 30 characters or fewer.";
  if (!USERNAME_RE.test(username)) return "Use letters, numbers and underscores only.";
  return null;
}

/**
 * Only allow same-site absolute paths as redirect targets.
 * Blocks "https://evil.com", "//evil.com" and backslash tricks.
 */
export function safeRedirectPath(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}

/** True for absolute http(s) URLs — used to vet admin-supplied media links. */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Parse a positive whole number from form data, or null when invalid. */
export function parsePositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}
