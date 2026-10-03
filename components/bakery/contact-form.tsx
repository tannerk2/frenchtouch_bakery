'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EMAIL, PHONE_DISPLAY } from './social'

const fieldClass = 'h-12 rounded-xl bg-background text-base'

// Password-manager extensions (LastPass, 1Password) inject icon elements next to inputs
// before React hydrates, causing hydration mismatches. These flags tell them to skip the fields.
const ignorePasswordManagers = { 'data-lpignore': 'true', 'data-1p-ignore': 'true' } as const

// Web3Forms emails each submission to the address the key was created with. The key is public by design.
// Field names are sent as-is and become the labels in that email; `email` is used as the Reply-To.
const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    data.append('access_key', WEB3FORMS_KEY ?? '')
    data.append('subject', `New order request from ${name || 'the website'}`)
    data.append('from_name', 'French Touch Bakery website')
    setSubmitting(true)
    try {
      if (!WEB3FORMS_KEY) throw new Error('NEXT_PUBLIC_WEB3FORMS_KEY is not set')
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data })
      const result = await response.json()
      if (!result.success) throw new Error(result.message ?? result.body?.message ?? `HTTP ${response.status}`)
      form.reset()
      toast.success(`Merci${name ? `, ${name.split(' ')[0]}` : ''}!`, {
        description: 'Your message has been sent. Agathe will be in touch within a day or two.',
      })
    } catch (error) {
      console.error('Contact form submission failed:', error)
      toast.error('Sorry, your message didn’t go through.', {
        description: `Please call or text ${PHONE_DISPLAY}, or email ${EMAIL}.`,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 md:p-8">
      {/* Honeypot: hidden from people; Web3Forms rejects submissions where a bot ticked it. */}
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
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
          <Input {...ignorePasswordManagers} id="phone" name="Phone" type="tel" autoComplete="tel" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="event-date" className="text-base">Event date</Label>
          <Input {...ignorePasswordManagers} id="event-date" name="Event date" type="date" className={fieldClass} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="order" className="text-base">What you&apos;d like</Label>
        <Input {...ignorePasswordManagers}
          id="order"
          name="Order"
          placeholder="e.g. 12 lemon meringue tartlets and a chocolate hazelnut tart"
          className={fieldClass}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="message" className="text-base">Message</Label>
        <Textarea {...ignorePasswordManagers}
          id="message"
          name="Message"
          required
          rows={5}
          placeholder="Tell me about your celebration, number of guests, any allergies…"
          className="rounded-xl bg-background text-base"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Send my request'}
      </button>
    </form>
  )
}
