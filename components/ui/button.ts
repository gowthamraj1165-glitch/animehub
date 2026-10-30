const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-accent text-white shadow-[0_8px_24px_-12px_var(--color-accent)] hover:bg-accent-hover",
  secondary:
    "border border-line bg-surface text-ink hover:border-accent/60 hover:bg-surface-hover",
  ghost: "text-muted hover:bg-surface hover:text-ink",
} as const;

export type ButtonVariant = keyof typeof variants;

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: "sm" | "md" = "md",
  className = "",
) {
  const sizing = size === "sm" ? "h-9 px-4" : "h-11 px-5";
  return `${base} ${sizing} ${variants[variant]} ${className}`.trim();
}
