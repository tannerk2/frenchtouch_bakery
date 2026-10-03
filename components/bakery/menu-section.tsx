import { BotanicalDivider, SectionHeading } from './ornaments'
import { MenuFilter } from './menu-filter'

export function MenuSection() {
  return (
    <section id="menu" aria-labelledby="menu-title" className="bg-muted/60 py-20 md:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:px-6">
        <SectionHeading
          id="menu-title"
          eyebrow="What we make"
          title="La Carte"
          intro="Everything is baked to order in small batches. Tap the flavors you love and add them to your order, then send it from the Order page."
        />

        <MenuFilter />

        <BotanicalDivider />
      </div>
    </section>
  )
}
