import { EventsList } from './events-list'
import { SectionHeading } from './ornaments'
import { SocialLinks } from './social'

export function Markets() {
  return (
    <section id="markets" aria-labelledby="markets-title" className="bg-muted/60 py-20 md:py-28">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 md:px-6">
        <SectionHeading
          id="markets-title"
          eyebrow="Events & markets"
          title="Au Marché"
          intro="Come say bonjour and pick up a treat at these upcoming local markets."
        />

        <EventsList />

        <div className="flex flex-col items-center gap-4 text-center">
          <p className="leading-relaxed text-muted-foreground text-pretty">
            Market dates can change with the weather. Follow along on social media for the latest updates.
          </p>
          <SocialLinks />
        </div>
      </div>
    </section>
  )
}
