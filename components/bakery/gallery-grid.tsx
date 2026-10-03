'use client'

import Image from 'next/image'
import { useSiteData } from '@/components/site-data-provider'
import { SHAPE_CLASS } from '@/lib/site-data'
import { ContentLoading } from './content-loading'

export function GalleryGrid() {
  const { photos, status } = useSiteData()

  if (status === 'loading') return <ContentLoading className="min-h-96" />

  return (
    <ul className="columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
      {photos.map((photo) => (
        <li key={photo.id} className="mb-3 break-inside-avoid md:mb-4">
          <div className={`relative ${SHAPE_CLASS[photo.shape]} overflow-hidden rounded-2xl`}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
