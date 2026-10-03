import Link from 'next/link'
import { Logo } from './logo'
import { BotanicalDivider } from './ornaments'
import { SocialLinks } from './social'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/60 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 text-center md:px-6">
        <BotanicalDivider />
        <Logo size={72} />
        <p className="font-script text-3xl">French Touch Bakery</p>
        <SocialLinks />
        <p className="text-sm text-muted-foreground">Home-based bakery &bull; Meridian, Idaho</p>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} French Touch Bakery &bull;{' '}
          <Link href="/admin" className="underline-offset-4 hover:underline">
            Admin
          </Link>
        </p>
      </div>
    </footer>
  )
}
