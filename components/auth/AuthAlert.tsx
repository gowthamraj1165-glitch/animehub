import type { ReactNode } from "react";

type AuthAlertProps = {
  tone: "error" | "success";
  children: ReactNode;
};

export function AuthAlert({ tone, children }: AuthAlertProps) {
  const styles =
    tone === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-3.5 py-3 text-sm leading-6 ${styles}`}
    >
      {children}
    </div>
  );
}
