import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-mono text-sm tracking-widest text-accent-soft uppercase">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        This page slipped into another timeline
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted">
        The page you were looking for doesn&apos;t exist or has moved. Try
        searching for the series instead.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClass("primary")}>
          Back home
        </Link>
        <Link href="/search" className={buttonClass("secondary")}>
          Search anime
        </Link>
      </div>
    </Container>
  );
}
