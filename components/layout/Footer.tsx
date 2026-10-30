import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";

const siteLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/login", label: "Login" },
];

const infoLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/dmca", label: "DMCA" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface/40">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-6 text-muted">
              Track what you watch, pick up where you left off, and find your next
              favourite — all in one place.
            </p>
          </div>

          <nav aria-labelledby="footer-site">
            <h2
              id="footer-site"
              className="text-xs font-semibold tracking-widest text-muted uppercase"
            >
              Site
            </h2>
            <ul className="mt-4 space-y-2.5">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-info">
            <h2
              id="footer-info"
              className="text-xs font-semibold tracking-widest text-muted uppercase"
            >
              Info
            </h2>
            <ul className="mt-4 space-y-2.5">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© AnimeHub. All rights reserved.</p>
          <p>
            Anime metadata courtesy of{" "}
            <a
              href="https://jikan.moe"
              target="_blank"
              rel="noreferrer"
              className="rounded text-accent-soft underline decoration-accent-soft/40 underline-offset-4 hover:decoration-accent-soft"
            >
              the Jikan API
            </a>
            .
          </p>
        </div>
      </Container>
    </footer>
  );
}
