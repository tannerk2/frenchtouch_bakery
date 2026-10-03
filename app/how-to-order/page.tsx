import type { Metadata } from 'next'
import { HowToOrder } from '@/components/bakery/how-to-order'

export const metadata: Metadata = {
  title: 'How to Order | French Touch Bakery',
  description: 'How to place an order with French Touch Bakery for pickup in Meridian, Idaho.',
}

export default function HowToOrderPage() {
  return <HowToOrder />
}
