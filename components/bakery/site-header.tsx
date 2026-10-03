'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useOrderLines } from '@/components/order/order-provider'
import { cn } from '@/lib/utils'
import { Logo } from './logo'

const NAV_LINKS = [
  { href: '/menu', label: 'Menu' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/events', label: 'Events' },
]

// On desktop the Order button sits beside these links; the mobile menu lists it at the end.
const MOBILE_LINKS = [...NAV_LINKS, { href: '/order', label: 'Order' }]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const close = () => setOpen(false)
  const isActive = (href: string) => pathname === href
  const orderCount = useOrderLines()?.length ?? 0

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:h-20 md:px-6"
      >
        <Link href="/" className="flex min-w-0 items-center gap-2.5" onClick={close}>
          <Logo size={48} priority className="md:size-14" />
          <span className="truncate font-script text-2xl leading-none md:text-3xl">French Touch Bakery</span>
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'text-base font-medium text-foreground underline-offset-8 decoration-rouge decoration-1 hover:underline',
                  isActive(link.href) && 'underline',
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/order"
            aria-current={isActive('/order') ? 'page' : undefined}
            className="hidden h-10 items-center gap-2 rounded-full bg-primary px-5 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Order
            {orderCount ? (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary-foreground px-1.5 text-sm text-primary">
                {orderCount}
                <span className="sr-only"> item{orderCount === 1 ? '' : 's'} picked</span>
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full text-foreground hover:bg-muted lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </nav>

      {open ? (
        <div id="mobile-nav" className="border-t border-border bg-background lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            <li>
              <Link
                href="/"
                onClick={close}
                aria-current={pathname === '/' ? 'page' : undefined}
                className="block border-b border-border/60 py-3 text-lg font-medium"
              >
                Home
              </Link>
            </li>
            {MOBILE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={cn(
                    'block border-b border-border/60 py-3 text-lg font-medium',
                    isActive(link.href) && 'text-rouge',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  )
}
