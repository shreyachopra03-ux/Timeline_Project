interface Props {
  className?: string
}

export function MediaGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-gray-800 border border-gray-700" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="skeleton-playful h-40 w-full rounded-none" />
          <div className="p-3 space-y-2">
            <div className="skeleton-playful h-3 w-3/4" />
            <div className="skeleton-playful h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ClipGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-gray-800 border border-gray-700" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="skeleton-playful h-48 w-full rounded-none" />
          <div className="p-3 space-y-2">
            <div className="skeleton-playful h-4 w-2/3" />
            <div className="skeleton-playful h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ className }: Props) {
  return <div className={`skeleton ${className ?? ''}`} />
}
