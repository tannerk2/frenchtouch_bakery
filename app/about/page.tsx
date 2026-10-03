import type { Metadata } from 'next'
import { About } from '@/components/bakery/about'

export const metadata: Metadata = {
  title: 'Our Story | French Touch Bakery',
  description:
    'Meet Agathe Perrier, the French baker behind French Touch Bakery in Meridian, Idaho.',
}

export default function AboutPage() {
  return <About />
}
