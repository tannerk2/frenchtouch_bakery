'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useSiteData } from '@/components/site-data-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadImage } from '@/lib/admin-storage'
import { createId, type GalleryPhoto, type PhotoShape } from '@/lib/site-data'
import { selectClass } from './fields'

const SHAPES: { value: PhotoShape; label: string }[] = [
  { value: 'portrait', label: 'Tall' },
  { value: 'square', label: 'Square' },
  { value: 'landscape', label: 'Wide' },
]

const plural = (count: number) => `${count} photo${count > 1 ? 's' : ''}`

export function GalleryEditor() {
  const { photos, addPhotos, updatePhoto, deletePhoto } = useSiteData()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(files: FileList | null) {
    const list = Array.from(files ?? [])
    if (!list.length) return
    setUploading(true)
    const toastId = toast.loading(`Uploading ${plural(list.length)}…`)
    const results = await Promise.allSettled(
      list.map(async (file): Promise<GalleryPhoto> => ({
        id: createId(),
        alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        ...(await uploadImage(file)),
      })),
    )
    const added = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
    results.forEach((result) => result.status === 'rejected' && console.error('Photo upload failed:', result.reason))
    if (added.length) addPhotos(added)
    const failed = list.length - added.length
    if (failed) toast.error(`${plural(failed)} couldn’t be uploaded. JPG or PNG photos work best.`, { id: toastId })
    else toast.success(`Added ${plural(added.length)} to the gallery`, { id: toastId })
    setUploading(false)
  }

  function handleDelete(photo: GalleryPhoto) {
    if (!window.confirm('Remove this photo from the gallery?')) return
    deletePhoto(photo.id)
    toast('Photo removed')
  }

  return (
    <section aria-labelledby="gallery-editor-title" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id="gallery-editor-title" className="text-3xl font-semibold">
          Gallery <span className="text-lg font-normal text-muted-foreground">({photos.length})</span>
        </h2>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          aria-label="Upload gallery photos"
          onChange={(event) => {
            handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <Button className="rounded-full text-base" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload aria-hidden="true" />
          {uploading ? 'Uploading…' : 'Add photos'}
        </Button>
      </div>
      <p className="text-base text-muted-foreground">
        New photos appear first. Write a short description of each one for visitors using screen readers.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <li key={photo.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[4/3] bg-muted">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-3 p-4" data-lpignore="true">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`alt-${photo.id}`} className="text-sm">
                  Description
                </Label>
                <Input
                  id={`alt-${photo.id}`}
                  value={photo.alt}
                  onChange={(e) => updatePhoto({ ...photo, alt: e.target.value })}
                  className="text-base"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor={`shape-${photo.id}`} className="text-sm">
                    Shape
                  </Label>
                  <select
                    id={`shape-${photo.id}`}
                    value={photo.shape}
                    onChange={(e) => updatePhoto({ ...photo, shape: e.target.value as PhotoShape })}
                    className={selectClass}
                  >
                    {SHAPES.map((shape) => (
                      <option key={shape.value} value={shape.value}>
                        {shape.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(photo)}>
                  <Trash2 aria-hidden="true" />
                  <span className="sr-only">Delete photo</span>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
