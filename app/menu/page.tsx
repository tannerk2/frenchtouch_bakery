import type { Metadata } from 'next'
import { MenuSection } from '@/components/bakery/menu-section'

export const metadata: Metadata = {
  title: 'Menu | French Touch Bakery',
  description: 'Tarts, quiches, crêpes, madeleines, celebration cakes and seasonal French specialties, baked to order in Meridian, Idaho.',
}

export default function MenuPage() {
  return <MenuSection />
}
