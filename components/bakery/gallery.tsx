import { GalleryGrid } from './gallery-grid'
import { SectionHeading } from './ornaments'

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
      </div>
    </section>
  )
}
