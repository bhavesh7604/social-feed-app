// components/PostSkeleton.tsx
export default function PostSkeleton() {
  return (
    <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 mb-4 animate-pulse">
      <div className="flex items-center space-x-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-neutral-800" />
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-neutral-800" />
          <div className="h-2 w-16 rounded bg-neutral-800" />
        </div>
      </div>
      <div className="space-y-2 my-4">
        <div className="h-3 w-full rounded bg-neutral-800" />
        <div className="h-3 w-4/5 rounded bg-neutral-800" />
      </div>
      <div className="h-48 w-full rounded-lg bg-neutral-800 mb-3" />
      <div className="flex gap-6 pt-2">
        <div className="h-4 w-12 rounded bg-neutral-800" />
        <div className="h-4 w-12 rounded bg-neutral-800" />
      </div>
    </div>
  )
}