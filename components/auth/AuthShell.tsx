import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Shared centred card used by login, signup and password pages. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12 sm:py-16">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-line bg-surface/60 p-6 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.9)] sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer ? <div className="mt-5 text-center text-sm text-muted">{footer}</div> : null}
      </div>
    </Container>
  );
}
