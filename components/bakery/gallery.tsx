import { GalleryGrid } from './gallery-grid'
import { SectionHeading } from './ornaments'
import { INSTAGRAM_URL, InstagramIcon } from './social'

export function Gallery() {
  return (
    <section id="gallery" aria-labelledby="gallery-title" className="bg-muted/60 py-20 md:py-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:px-6">
        <SectionHeading
          id="gallery-title"
          eyebrow="From the oven"
          title="La Galerie"
          intro="A peek at recent bakes. Follow along for fresh-from-the-oven photos and weekly specials."
        />

        <GalleryGrid />

        <div className="flex justify-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-primary/30 bg-card px-6 text-lg font-semibold transition-colors hover:bg-blush"
          >
            <InstagramIcon />
            @frenchtouch_bakery
          </a>
        </div>
      </div>
    </section>
  )
}
