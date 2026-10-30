import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type SimplePageProps = {
  title: string;
  intro?: string;
  /** Legal pages ship with template copy — this flags that it must be reviewed. */
  draft?: boolean;
  children: ReactNode;
};

export function SimplePage({ title, intro, draft = false, children }: SimplePageProps) {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>

        {intro ? <p className="mt-3 text-base text-muted">{intro}</p> : null}

        {draft ? (
          <p className="mt-6 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-soft">
            Template copy — replace this with your own policy and a working contact
            address before launch.
          </p>
        ) : null}

        <div className="mt-8 space-y-6 text-sm leading-7 text-muted [&_a]:text-accent-soft [&_a]:underline [&_a]:decoration-accent-soft/40 [&_a]:underline-offset-4 [&_a:hover]:decoration-accent-soft [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink">
          {children}
        </div>
      </div>
    </Container>
  );
}
