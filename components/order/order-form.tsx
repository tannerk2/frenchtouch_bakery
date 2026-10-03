'use client'

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { EMAIL, PHONE_DISPLAY } from '@/components/bakery/social'
import { ContentLoading } from '@/components/bakery/content-loading'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useOrder, useOrderLines, type OrderLine } from './order-provider'
import { QuantityStepper } from './quantity-stepper'

const fieldClass = 'h-12 rounded-xl bg-background text-base'

// Password-manager extensions (LastPass, 1Password) inject icon elements next to inputs
// before React hydrates, causing hydration mismatches. These flags tell them to skip the fields.
const ignorePasswordManagers = { 'data-lpignore': 'true', 'data-1p-ignore': 'true' } as const

// Web3Forms emails each submission to the address the key was created with. The key is public by design.
// Field names are sent as-is and become the labels in that email; `email` is used as the Reply-To.
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY

// Orders need 48 hours' notice. The earliest pickup day is the day that notice runs out; Agathe arranges
// the time when she confirms.
const NOTICE_HOURS = 48

const earliestPickupDate = () => new Date(Date.now() + NOTICE_HOURS * 60 * 60 * 1000).toLocaleDateString('en-CA')

const formatDay = (isoDate: string, year: boolean) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(year ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`))

// The date picker's min isn't enforced by every phone browser, so the rule is also checked here.
function checkPickupDate(input: HTMLInputElement) {
  const earliest = earliestPickupDate()
  input.setCustomValidity(
    input.value && input.value < earliest
      ? `Please choose ${formatDay(earliest, false)} or later. Orders need at least 48 hours' notice.`
      : '',
  )
}

function describeLine({ item, quantity, flavors }: OrderLine) {
  return flavors.length
    ? `${item.name} (${item.price}): ${flavors.map((flavor) => `${flavor.quantity} × ${flavor.name}`).join(', ')}`
    : `${quantity} × ${item.name} (${item.price})`
}

export function OrderForm() {
  const order = useOrder()
  const lines = useOrderLines()
  const [submitting, setSubmitting] = useState(false)
  // Set after mount: the page is pre-built, so a date computed during the build would be stale.
  const [minDate, setMinDate] = useState<string>()

  useEffect(() => {
    setMinDate(earliestPickupDate())
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    // Re-checked on send in case the page has been open long enough for the earliest date to move.
    const dateInput = form.elements.namedItem('pickupDate') as HTMLInputElement
    checkPickupDate(dateInput)
    if (!dateInput.reportValidity()) return
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
    data.append('Desired pickup date', pickupDate ? formatDay(pickupDate, true) : '')
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
                <OrderLineRow key={line.item.id} line={line} />
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
          Desired pickup date
        </Label>
        <Input
          {...ignorePasswordManagers}
          id="pickup-date"
          name="pickupDate"
          type="date"
          required
          min={minDate}
          onChange={(event: ChangeEvent<HTMLInputElement>) => checkPickupDate(event.currentTarget)}
          aria-describedby="pickup-date-hint"
          className={`${fieldClass} sm:max-w-xs`}
        />
        <p id="pickup-date-hint" className="text-sm text-muted-foreground">
          Orders need at least 48 hours&apos; notice{minDate ? `, so the earliest date is ${formatDay(minDate, false)}` : ''}.
          Need it sooner? Call or text {PHONE_DISPLAY}.
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
  const { remove, setQuantity, setFlavorQuantity } = useOrder()
  const { item, quantity, flavors } = line
  const unchosen = item.flavors.filter((name) => !flavors.some((flavor) => flavor.name === name))

  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex items-start gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
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

      {/* Full width on phones so flavor names don't wrap; lined up under the name on wider screens. */}
      <div className="flex flex-col gap-3 sm:pl-20">

        {flavors.length ? (
          <ul className="flex flex-col gap-2">
            {flavors.map((flavor) => (
              <li key={flavor.name} className="flex items-center justify-between gap-3">
                <span className="min-w-0 text-base">{flavor.name}</span>
                <QuantityStepper
                  label={`${flavor.name} (${item.name})`}
                  value={flavor.quantity}
                  onChange={(next) => setFlavorQuantity(item.id, flavor.name, next)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="text-base text-muted-foreground">Quantity</span>
            <QuantityStepper label={item.name} value={quantity} onChange={(next) => setQuantity(item.id, next)} />
          </div>
        )}

        {unchosen.length ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Add another flavor</p>
            <div className="flex flex-wrap gap-2">
              {unchosen.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFlavorQuantity(item.id, name, 1)}
                  className="inline-flex min-h-8 items-center gap-1 rounded-full border border-dashed border-rouge/50 px-3 py-1 text-sm font-medium transition-colors hover:bg-blush/50"
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  {name}
                  <span className="sr-only"> ({item.name})</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </li>
  )
}
