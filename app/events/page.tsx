import type { Metadata } from 'next'
import { Markets } from '@/components/bakery/markets'

export const metadata: Metadata = {
  title: 'Events & Markets | French Touch Bakery',
  description: 'Upcoming markets and pop-up events where you can find French Touch Bakery.',
}

export default function EventsPage() {
  return <Markets />
}
