import type { Metadata } from 'next'
import { Gallery } from '@/components/bakery/gallery'

export const metadata: Metadata = {
  title: 'Gallery | French Touch Bakery',
  description: 'A look at the cakes, tarts and pastries made by French Touch Bakery.',
}

export default function GalleryPage() {
  return <Gallery />
}
