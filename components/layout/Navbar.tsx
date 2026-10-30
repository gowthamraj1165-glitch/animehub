import { Suspense } from "react";
import { Logo } from "@/components/layout/Logo";
import { SearchBar } from "@/components/layout/SearchBar";
import { UserMenu } from "@/components/auth/UserMenu";
import { Container } from "@/components/ui/Container";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo />

          {/* Desktop / tablet search sits in the middle of the bar */}
          <div className="hidden flex-1 justify-center px-4 sm:flex">
            <SearchBar className="w-full max-w-md" />
          </div>

          {/* Session read → streams in; the rest of the bar stays static */}
          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="h-9 w-[86px] animate-pulse rounded-full bg-surface"
              />
            }
          >
            <UserMenu />
          </Suspense>
        </div>

        {/* On phones the search gets its own row so it stays one tap away */}
        <div className="pb-3 sm:hidden">
          <SearchBar id="mobile-search" placeholder="Search anime…" />
        </div>
      </Container>
    </header>
  );
}
