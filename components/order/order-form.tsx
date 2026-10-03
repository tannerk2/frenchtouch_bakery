'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { EMAIL, PHONE_DISPLAY } from '@/components/bakery/social'
import { ContentLoading } from '@/components/bakery/content-loading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FlavorChips } from './flavor-chips'
import { MAX_QUANTITY, useOrder, useOrderLines, type OrderLine } from './order-provider'

const fieldClass = 'h-12 rounded-xl bg-background text-base'

// Password-manager extensions (LastPass, 1Password) inject icon elements next to inputs
// before React hydrates, causing hydration mismatches. These flags tell them to skip the fields.
const ignorePasswordManagers = { 'data-lpignore': 'true', 'data-1p-ignore': 'true' } as const

// Web3Forms emails each submission to the address the key was created with. The key is public by design.
// Field names are sent as-is and become the labels in that email; `email` is used as the Reply-To.
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY

// Most orders need 48–72 hours, so the date picker starts two days out.
const NOTICE_DAYS = 2

const PICKUP_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

function describeLine({ item, flavors, quantity }: OrderLine) {
  return `${quantity} × ${item.name} (${item.price})${flavors.length ? `: ${flavors.join(', ')}` : ''}`
}

export function OrderForm() {
  const order = useOrder()
  const lines = useOrderLines()
  const [submitting, setSubmitting] = useState(false)
  // Set after mount: the page is pre-built, so a date computed during the build would be stale.
  const [minDate, setMinDate] = useState<string>()

  useEffect(() => {
    const earliest = new Date()
    earliest.setDate(earliest.getDate() + NOTICE_DAYS)
    setMinDate(earliest.toLocaleDateString('en-CA'))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fields = new FormData(form)
    const field = (name: string) => String(fields.get(name) ?? '').trim()
    const name = field('name')
    const pickupDate = field('pickupDate')

    // Built in the order Agathe should read it.
    const data = new FormData()
    data.append('access_key', WEB3FORMS_KEY ?? '')
    data.append('subject', `New order request from ${name || 'the website'}`)
    data.append('from_name', 'French Touch Bakery website')
    if (fields.get('botcheck')) data.append('botcheck', 'on')
    data.append('name', name)
    data.append('email', field('email'))
    data.append('Order', lines?.length ? lines.map(describeLine).join('\n') : 'Nothing picked from the menu (see notes)')
    data.append('Pickup date', pickupDate ? PICKUP_DATE_FORMAT.format(new Date(`${pickupDate}T00:00:00Z`)) : '')
    data.append('Phone', field('phone'))
    data.append('Notes', field('notes'))

    setSubmitting(true)
    try {
      if (!WEB3FORMS_KEY) throw new Error('NEXT_PUBLIC_WEB3FORMS_KEY is not set')
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
      const result = await response.json()
      if (!result.success) throw new Error(result.message ?? result.body?.message ?? `HTTP ${response.status}`)
      form.reset()
      order.clear()
      toast.success(`Merci${name ? `, ${name.split(' ')[0]}` : ''}!`, {
        description: 'Your order request has been sent. Agathe will confirm it with you within a day or two.',
      })
    } catch (error) {
      console.error('Order form submission failed:', error)
      toast.error('Sorry, your order didn’t go through.', {
        description: `Please call or text ${PHONE_DISPLAY}, or email ${EMAIL}.`,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 rounded-3xl border border-border bg-card p-6 md:p-8">
      {/* Honeypot: hidden from people; Web3Forms rejects submissions where a bot ticked it. */}
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4 text-2xl font-semibold">What you&apos;d like</legend>
        {lines === null ? <ContentLoading className="min-h-24" /> : null}
        {lines?.length === 0 ? (
          <p className="rounded-2xl bg-muted/60 px-5 py-4 text-base leading-relaxed">
            Nothing picked yet.{' '}
            <Link href="/menu" className="font-semibold underline underline-offset-4">
              Browse the menu
            </Link>{' '}
            and tap <strong>Add to order</strong>, or describe what you&apos;d like in the notes below.
          </p>
        ) : null}
        {lines?.length ? (
          <>
            <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
              {lines.map((line) => (
                <OrderLineRow key={line.itemId} line={line} />
              ))}
            </ul>
            <Link href="/menu" className="self-start text-base font-semibold underline underline-offset-4">
              + Add more from the menu
            </Link>
          </>
        ) : null}
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pickup-date" className="text-base">
          Pickup date
        </Label>
        <Input
          {...ignorePasswordManagers}
          id="pickup-date"
          name="pickupDate"
          type="date"
          required
          min={minDate}
          aria-describedby="pickup-date-hint"
          className={`${fieldClass} sm:max-w-xs`}
        />
        <p id="pickup-date-hint" className="text-sm text-muted-foreground">
          Most orders need 48–72 hours. Need it sooner? Call or text {PHONE_DISPLAY}.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-base">Name</Label>
          <Input {...ignorePasswordManagers} id="name" name="name" required autoComplete="name" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-base">Email</Label>
          <Input {...ignorePasswordManagers} id="email" name="email" type="email" required autoComplete="email" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone" className="text-base">
            Phone <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input {...ignorePasswordManagers} id="phone" name="phone" type="tel" autoComplete="tel" className={fieldClass} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes" className="text-base">
          Notes{' '}
          {lines?.length ? <span className="font-normal text-muted-foreground">(optional)</span> : null}
        </Label>
        <Textarea
          {...ignorePasswordManagers}
          id="notes"
          name="notes"
          required={!lines?.length}
          rows={4}
          placeholder="Sizes, number of guests, allergies, a message for the cake…"
          className="rounded-xl bg-background text-base"
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Send my order request'}
        </button>
        <p className="text-center text-sm text-muted-foreground">
          Nothing is charged online. Agathe will confirm your order, total and pickup time by email or text.
        </p>
      </div>
    </form>
  )
}

function OrderLineRow({ line }: { line: OrderLine }) {
  const { remove, setQuantity } = useOrder()
  const { item, flavors, quantity } = line

  return (
    <li className="flex gap-4 p-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <p className="text-lg font-semibold leading-snug">{item.name}</p>
            <p className="text-base italic text-muted-foreground">{item.price}</p>
          </div>
          <button
            type="button"
            onClick={() => remove(item.id)}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Remove {item.name}</span>
          </button>
        </div>
        <FlavorChips item={item} chosen={flavors} />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground" id={`qty-${item.id}`}>
            Quantity
          </span>
          <div role="group" aria-labelledby={`qty-${item.id}`} className="inline-flex items-center rounded-full border border-border">
            <button
              type="button"
              onClick={() => setQuantity(item.id, quantity - 1)}
              disabled={quantity <= 1}
              className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
            >
              <Minus className="size-4" aria-hidden="true" />
              <span className="sr-only">One fewer {item.name}</span>
            </button>
            <output aria-live="polite" className="w-8 text-center text-base font-semibold">
              {quantity}
            </output>
            <button
              type="button"
              onClick={() => setQuantity(item.id, quantity + 1)}
              disabled={quantity >= MAX_QUANTITY}
              className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span className="sr-only">One more {item.name}</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
