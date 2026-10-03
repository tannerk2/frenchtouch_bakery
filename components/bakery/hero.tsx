import Image from 'next/image'
import Link from 'next/link'
import { Logo } from './logo'
import { TricolorRule, WatercolorWash } from './ornaments'

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 md:grid-cols-2 md:gap-12 md:px-6 md:pt-16 md:pb-24">
        <div className="relative isolate flex flex-col items-center gap-6 text-center md:items-start md:text-left">
          <WatercolorWash className="-inset-10 -z-10 md:-left-24" />
          <Logo size={160} priority className="animate-in fade-in zoom-in-95 duration-700" />
          <div className="flex flex-col items-center gap-4 md:items-start">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Bonjour from Meridian, Idaho
            </p>
            <h1
              id="hero-title"
              className="font-script text-5xl leading-[1.15] text-balance lg:text-6xl animate-in fade-in slide-in-from-bottom-3 duration-700"
            >
              French-inspired cakes &amp; pastries, made by hand in Meridian
            </h1>
            <TricolorRule />
          </div>
          <p className="max-w-md text-xl leading-relaxed text-muted-foreground text-pretty">
            Buttery tarts, delicate madeleines and celebration cakes, baked to order in Agathe&apos;s home
            kitchen with the recipes she grew up with in France.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href="#contact"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Place an Order
            </a>
            <Link
              href="/menu"
              className="inline-flex h-12 items-center justify-center rounded-full border border-primary/30 bg-card px-8 text-lg font-semibold text-foreground transition-colors hover:bg-blush"
            >
              See the Menu
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-3 -bottom-3 h-full w-full rounded-[2.5rem] bg-sage/40" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border-8 border-card md:aspect-[5/6]">
            <Image
              src="/images/hero-tart.png"
              alt="A chocolate hazelnut tart beside lemon meringue tartlets on a linen tablecloth"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <p className="absolute -bottom-5 left-6 rotate-[-3deg] rounded-full bg-card px-5 py-2 font-script text-2xl shadow-sm">
            fait maison
          </p>
        </div>
      </div>
    </section>
  )
}
