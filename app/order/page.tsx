import type { Metadata } from 'next'
import { OrderSection } from '@/components/order/order-section'

export const metadata: Metadata = {
  title: 'Order | French Touch Bakery',
  description: 'Choose your cakes and pastries, pick a date and send an order request for pickup in Meridian, Idaho.',
}

export default function OrderPage() {
  return <OrderSection />
}
