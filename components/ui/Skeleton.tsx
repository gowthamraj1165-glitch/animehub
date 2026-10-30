type SkeletonProps = {
  className?: string;
};

/** Shimmering placeholder block used while route-level content loads. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-surface ${className}`} />;
}
