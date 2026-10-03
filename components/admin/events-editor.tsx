'use client'

import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSiteData } from '@/components/site-data-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createId, formatEventDate, todayIso, type MarketEvent } from '@/lib/site-data'
import { Field } from './fields'

export function EventsEditor() {
  const { events, saveEvent, deleteEvent } = useSiteData()
  const today = todayIso()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  function handleSave(event: MarketEvent) {
    saveEvent(event)
    setEditingId(null)
    setAdding(false)
    toast.success(`Saved “${event.name}”`)
  }

  function handleDelete(event: MarketEvent) {
    if (!window.confirm(`Remove “${event.name}”?`)) return
    deleteEvent(event.id)
    toast(`Removed “${event.name}”`)
  }

  return (
    <section aria-labelledby="events-editor-title" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id="events-editor-title" className="text-3xl font-semibold">
          Events &amp; markets
        </h2>
        <Button
          className="rounded-full text-base"
          onClick={() => {
            setEditingId(null)
            setAdding(true)
          }}
        >
          <Plus aria-hidden="true" />
          Add event
        </Button>
      </div>
      <p className="text-base text-muted-foreground">Events are sorted by date automatically.</p>

      {adding ? (
        <EventForm
          initial={{ id: createId(), date: '', time: '', name: '', place: '' }}
          onSave={handleSave}
          onCancel={() => setAdding(false)}
        />
      ) : null}

      <ul className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
        {events.length === 0 ? <li className="px-6 py-8 text-center text-muted-foreground">No events yet.</li> : null}
        {events.map((event) =>
          editingId === event.id ? (
            <li key={event.id} className="border-b border-border p-4 last:border-0">
              <EventForm initial={event} onSave={handleSave} onCancel={() => setEditingId(null)} />
            </li>
          ) : (
            <li key={event.id} className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-0 md:px-6">
              <div className="flex w-28 shrink-0 flex-col">
                <span className="text-lg font-semibold">{formatEventDate(event.date)}</span>
                <span className="text-sm text-muted-foreground">{event.time}</span>
                {event.date < today ? <span className="text-sm font-semibold text-rouge">Past, hidden on site</span> : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-xl font-semibold">{event.name}</p>
                <p className="truncate text-base text-muted-foreground">{event.place}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setAdding(false)
                    setEditingId(event.id)
                  }}
                >
                  <Pencil aria-hidden="true" />
                  <span className="sr-only">Edit {event.name}</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(event)}>
                  <Trash2 aria-hidden="true" />
                  <span className="sr-only">Delete {event.name}</span>
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  )
}

function EventForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: MarketEvent
  onSave: (event: MarketEvent) => void
  onCancel: () => void
}) {
  const [event, setEvent] = useState(initial)
  const update = (patch: Partial<MarketEvent>) => setEvent((current) => ({ ...current, ...patch }))
  const prefix = `event-${event.id}`

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSave({ ...event, name: event.name.trim(), place: event.place.trim(), time: event.time.trim() })
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-lpignore="true"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-muted/50 p-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Event name" htmlFor={`${prefix}-name`}>
          <Input
            id={`${prefix}-name`}
            required
            value={event.name}
            onChange={(e) => update({ name: e.target.value })}
            className="bg-card text-base"
          />
        </Field>
        <Field label="Location" htmlFor={`${prefix}-place`}>
          <Input
            id={`${prefix}-place`}
            required
            value={event.place}
            onChange={(e) => update({ place: e.target.value })}
            className="bg-card text-base"
          />
        </Field>
        <Field label="Date" htmlFor={`${prefix}-date`}>
          <Input
            id={`${prefix}-date`}
            type="date"
            required
            value={event.date}
            onChange={(e) => update({ date: e.target.value })}
            className="bg-card text-base"
          />
        </Field>
        <Field label="Hours" htmlFor={`${prefix}-time`}>
          <Input
            id={`${prefix}-time`}
            required
            placeholder="9am – 1pm"
            value={event.time}
            onChange={(e) => update({ time: e.target.value })}
            className="bg-card text-base"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" className="text-base" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="rounded-full text-base">
          Save event
        </Button>
      </div>
    </form>
  )
}
