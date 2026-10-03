import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Parisienne } from 'next/font/google'
import { PublicOnly } from '@/components/bakery/public-only'
import { SiteFooter } from '@/components/bakery/site-footer'
import { SiteHeader } from '@/components/bakery/site-header'
import { OrderBar } from '@/components/order/order-bar'
import { OrderProvider } from '@/components/order/order-provider'
import { SiteDataProvider } from '@/components/site-data-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const parisienne = Parisienne({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-parisienne',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://frenchtouch-bakery.com'),
  title: 'French Touch Bakery | French Cakes & Pastries in Meridian, Idaho',
  description:
    'French-inspired cakes, tarts, madeleines and pastries made by hand to order by Agathe Perrier in Meridian, Idaho. Order for pickup or find us at local markets.',
  openGraph: {
    title: 'French Touch Bakery',
    description: 'French-inspired cakes & pastries, made by hand in Meridian.',
    images: ['/images/hero-tart.png'],
  },
  // Tab icons use the cake from the logo (the lettering is unreadable at 16-48px); iOS gets the full logo.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FBF7F1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${parisienne.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SiteDataProvider>
          <OrderProvider>
            <PublicOnly>
              <SiteHeader />
            </PublicOnly>
            <main id="main">{children}</main>
            <PublicOnly>
              <SiteFooter />
              <OrderBar />
            </PublicOnly>
          </OrderProvider>
        </SiteDataProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}
