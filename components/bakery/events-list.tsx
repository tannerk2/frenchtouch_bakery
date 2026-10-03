'use client'

import { useSiteData } from '@/components/site-data-provider'
import { formatEventDate, todayIso } from '@/lib/site-data'
import { ContentLoading } from './content-loading'

export function EventsList() {
  const { events: allEvents, status } = useSiteData()

  if (status === 'loading') return <ContentLoading className="min-h-40" />

  // Past markets drop off on their own; the admin portal still lists them until they're deleted.
  const today = todayIso()
  const events = allEvents.filter((event) => event.date >= today)

  if (events.length === 0) {
    return (
      <p className="rounded-3xl border border-border bg-card px-6 py-10 text-center text-lg text-muted-foreground">
        No markets scheduled right now. Check back soon!
      </p>
    )
  }

  return (
    <ul className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-col gap-1 border-b border-border px-6 py-5 last:border-0 sm:flex-row sm:items-center sm:gap-6"
        >
          <p className="flex shrink-0 flex-col sm:w-36">
            <span className="text-lg font-semibold">{formatEventDate(event.date)}</span>
            <span className="text-sm text-muted-foreground">{event.time}</span>
          </p>
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold">{event.name}</h3>
            <p className="text-muted-foreground">{event.place}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
