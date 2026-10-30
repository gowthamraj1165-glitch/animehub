import { Skeleton } from "@/components/ui/Skeleton";
import { Container } from "@/components/ui/Container";

export default function Loading() {
  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-4 h-6 w-full max-w-xl" />
        <Skeleton className="mt-2 h-6 w-2/3 max-w-lg" />
        <Skeleton className="mt-8 h-64 w-full rounded-2xl sm:h-80" />
      </div>

      <div className="mt-14 space-y-10">
        {[0, 1, 2, 3].map((rail) => (
          <section key={rail}>
            <Skeleton className="h-7 w-44" />
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
