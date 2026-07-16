// Shimmer skeleton primitives — compose these to match the real layout.
// The shimmer itself is `.skeleton` in index.css (single definition, shared
// with non-React surfaces). Pass className to size it; utilities win over the
// component layer, so per-instance overrides like `rounded-full` still apply.
export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

// One card skeleton — matches the note/company card grid layout.
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900">
      <Skeleton className="mb-3 h-4 w-20" />
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-2/3" />
      <Skeleton className="mt-3 h-3 w-24" />
    </div>
  );
}

// Grid of N card skeletons.
export function CardGridSkeleton({ count = 6, cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid gap-3 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// One row skeleton — matches list/feed item layout (title + meta line).
export function RowSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
      </div>
    </div>
  );
}

// Stack of N row skeletons.
export function FeedSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

// Dashboard-style tile skeleton (2-col grid of stat tiles).
export function TileSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900">
          <Skeleton className="mb-3 h-3 w-20" />
          <Skeleton className="mb-2 h-8 w-16" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}
