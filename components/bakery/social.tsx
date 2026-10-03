import { cn } from '@/lib/utils'

export const INSTAGRAM_URL = 'https://www.instagram.com/frenchtouch_bakery'
export const FACEBOOK_URL = 'https://www.facebook.com/search/top?q=French%20Touch%20Bakery'
export const PHONE_DISPLAY = '(707) 782-3138'
export const PHONE_HREF = 'tel:+17077823138'
export const EMAIL = 'frenchtouch.bakery@gmail.com'

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className={cn('size-5', className)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={cn('size-5', className)}>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" />
    </svg>
  )
}

export function SocialLinks({ className }: { className?: string }) {
  const linkClass =
    'inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        <InstagramIcon />
        <span className="sr-only">French Touch Bakery on Instagram</span>
      </a>
      <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        <FacebookIcon />
        <span className="sr-only">French Touch Bakery on Facebook</span>
      </a>
    </div>
  )
}
