import Link from 'next/link'
import { MapPin, MessageCircleHeart, ShoppingBasket } from 'lucide-react'
import { SectionHeading } from './ornaments'

const STEPS = [
  {
    icon: ShoppingBasket,
    title: 'Pick your treats',
    body: 'Browse the menu and tap Add to order on anything that catches your eye.',
  },
  {
    icon: MessageCircleHeart,
    title: 'Send your request',
    body: 'Choose flavors, quantities and a pickup date, then send it over. Nothing is charged online: Agathe confirms your order, total and pickup time by email or text.',
  },
  {
    icon: MapPin,
    title: 'Pick up in Meridian',
    body: 'Collect your freshly baked order from Agathe’s home kitchen in Meridian, ID 83646.',
  },
]

export function HowToOrder() {
  return (
    <section id="how-to-order" aria-labelledby="how-to-order-title" className="bg-muted/60 py-20 md:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:px-6">
        <SectionHeading id="how-to-order-title" eyebrow="Simple as un, deux, trois" title="How to Order" />

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

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/menu"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Browse the menu
          </Link>
          <Link
            href="/order"
            className="inline-flex h-12 items-center justify-center rounded-full border border-primary/30 bg-card px-8 text-lg font-semibold text-foreground transition-colors hover:bg-blush"
          >
            Go to your order
          </Link>
        </div>
      </div>
    </section>
  )
}
