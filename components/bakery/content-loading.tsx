import { cn } from '@/lib/utils'

// Holds the space while live content loads, so built-in sample content never flashes on screen.
export function ContentLoading({ className }: { className?: string }) {
  return (
    <div role="status" className={cn('min-h-64', className)}>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
