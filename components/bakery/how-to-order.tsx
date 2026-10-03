import { CalendarHeart, MapPin, MessageCircleHeart, Clock, Info } from 'lucide-react'
import { SectionHeading } from './ornaments'

const STEPS = [
  {
    icon: MessageCircleHeart,
    title: 'Reach out',
    body: 'Send a message through the form below, call or text, or DM on Instagram or Facebook with what you have in mind.',
  },
  {
    icon: CalendarHeart,
    title: 'Confirm details & pickup date',
    body: 'We’ll settle flavors, sizes, quantities and price together, then lock in your pickup day and time.',
  },
  {
    icon: MapPin,
    title: 'Pick up in Meridian',
    body: 'Collect your freshly baked order from Agathe’s home kitchen in Meridian, ID 83646.',
  },
]

export function HowToOrder() {
  return (
    <section id="how-to-order" aria-labelledby="order-title" className="py-20 md:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:px-6">
        <SectionHeading id="order-title" eyebrow="Simple as un, deux, trois" title="How to Order" />

        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center">
              <span className="font-script text-4xl leading-none text-foreground" aria-hidden="true">
                {['un', 'deux', 'trois'][index]}
              </span>
              <span className="flex size-14 items-center justify-center rounded-full bg-blush/60">
                <step.icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="text-2xl font-semibold">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </h3>
              <p className="leading-relaxed text-muted-foreground text-pretty">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-3xl bg-sage/30 p-6 sm:flex-row sm:gap-8 md:p-8">
          <p className="flex flex-1 items-start gap-3 leading-relaxed">
            <Clock className="mt-1 size-5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold">Please allow 48–72 hours notice</strong> for most orders. Larger
              celebration cakes may need a little more.
            </span>
          </p>
          <p className="flex flex-1 items-start gap-3 leading-relaxed">
            <Info className="mt-1 size-5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold">Allergen information is available on request.</strong> Everything is
              made in a home kitchen that uses nuts, dairy, eggs and wheat.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
