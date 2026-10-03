'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { orderCount, useOrderLines } from './order-provider'

// Follows the visitor around the public pages once they've picked something, so the order is one tap away.
export function OrderBar() {
  const pathname = usePathname()
  const count = orderCount(useOrderLines())
  if (!count || pathname === '/order') return null

  return (
    <>
      {/* Keeps the footer from ending up underneath the bar. */}
      <div aria-hidden="true" className="h-20" />
      <div
        role="region"
        aria-label="Your order"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <p aria-live="polite" className="text-lg">
            <span className="font-semibold">Your order:</span> {count} item{count === 1 ? '' : 's'}
          </p>
          <Link
            href="/order"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Review &amp; send
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  )
}
