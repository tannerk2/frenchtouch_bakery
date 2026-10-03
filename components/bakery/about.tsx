import Image from 'next/image'
import { TricolorRule, WatercolorWash } from './ornaments'

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2 md:gap-16 md:px-6">
        <div className="relative isolate mx-auto w-full max-w-md">
          <WatercolorWash className="-inset-12 -z-10" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-3xl border-8 border-card">
            <Image
              src="/images/agathe.png"
              alt="Agathe Perrier dusting flour over pastry dough in her home kitchen"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            About Agathe
          </p>
          <h2 id="about-title" className="font-script text-5xl leading-tight md:text-6xl text-balance">
            A little corner of France in Idaho
          </h2>
          <TricolorRule />
          <div className="flex flex-col gap-4 text-lg leading-relaxed text-pretty">
            <p>
              Bonjour, I&apos;m Agathe Perrier. I grew up in France, where Sunday mornings meant a trip to the
              pâtisserie and afternoons meant baking alongside my grandmother, measuring butter by feel and
              learning that the best things take a little patience.
            </p>
            <p>
              When I made Meridian my home, I missed those flavors terribly, so I started baking them myself.
              French Touch Bakery is my way of sharing them with my new neighbors: real butter, simple
              ingredients and traditional techniques.
            </p>
            <p>
              Everything is baked to order from my home kitchen, so each tart, cake and madeleine is made
              just for you.
            </p>
          </div>
          <p className="font-script text-4xl text-foreground">
            <span className="sr-only">Signed, </span>Agathe
          </p>
        </div>
      </div>
    </section>
  )
}
