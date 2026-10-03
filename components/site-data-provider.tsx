'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CONTENT_PATH,
  SEED_CONTENT,
  parseSiteContent,
  type GalleryPhoto,
  type MarketEvent,
  type MenuItem,
  type SiteContent,
} from '@/lib/site-data'

// Editable content is fetched from /data/site.json, which the admin portal writes to S3.
// The setters only change in-memory state; the admin portal's auto-save persists them.
type LoadStatus = 'loading' | 'ready' | 'error'

type SiteData = {
  status: LoadStatus
  menu: MenuItem[]
  events: MarketEvent[]
  photos: GalleryPhoto[]
  saveMenuItem: (item: MenuItem) => void
  deleteMenuItem: (id: string) => void
  moveMenuItem: (id: string, direction: 'up' | 'down') => void
  saveEvent: (event: MarketEvent) => void
  deleteEvent: (id: string) => void
  addPhotos: (photos: GalleryPhoto[]) => void
  updatePhoto: (photo: GalleryPhoto) => void
  deletePhoto: (id: string) => void
}

const SiteDataContext = createContext<SiteData | null>(null)

function upsert<T extends { id: string }>(list: T[], next: T) {
  return list.some((entry) => entry.id === next.id)
    ? list.map((entry) => (entry.id === next.id ? next : entry))
    : [...list, next]
}

function moveWithinGroup(list: MenuItem[], id: string, direction: 'up' | 'down') {
  const index = list.findIndex((entry) => entry.id === id)
  if (index === -1) return list
  const group = list[index].group
  const step = direction === 'up' ? -1 : 1
  let target = index + step
  while (target >= 0 && target < list.length && list[target].group !== group) target += step
  if (target < 0 || target >= list.length) return list
  const next = [...list]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

// Until the admin saves for the first time there is no file, and CloudFront answers 404.
async function loadSiteContent(): Promise<SiteContent> {
  const response = await fetch(`/${CONTENT_PATH}`, { cache: 'no-store' })
  if (response.status === 404) return SEED_CONTENT
  if (!response.ok) throw new Error(`Loading site content failed: HTTP ${response.status}`)
  return parseSiteContent(await response.json())
}

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [menu, setMenu] = useState(SEED_CONTENT.menu)
  const [events, setEvents] = useState(SEED_CONTENT.events)
  const [photos, setPhotos] = useState(SEED_CONTENT.photos)

  useEffect(() => {
    let cancelled = false
    loadSiteContent().then(
      (content) => {
        if (cancelled) return
        setMenu(content.menu)
        setEvents(content.events)
        setPhotos(content.photos)
        setStatus('ready')
      },
      (error) => {
        if (cancelled) return
        console.error(error)
        // Public pages fall back to the built-in content; the admin portal refuses to edit.
        setStatus('error')
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<SiteData>(
    () => ({
      status,
      menu,
      events: [...events].sort((a, b) => a.date.localeCompare(b.date)),
      photos,
      saveMenuItem: (item) => setMenu((list) => upsert(list, item)),
      deleteMenuItem: (id) => setMenu((list) => list.filter((entry) => entry.id !== id)),
      moveMenuItem: (id, direction) => setMenu((list) => moveWithinGroup(list, id, direction)),
      saveEvent: (event) => setEvents((list) => upsert(list, event)),
      deleteEvent: (id) => setEvents((list) => list.filter((entry) => entry.id !== id)),
      addPhotos: (added) => setPhotos((list) => [...added, ...list]),
      updatePhoto: (photo) => setPhotos((list) => upsert(list, photo)),
      deletePhoto: (id) => setPhotos((list) => list.filter((entry) => entry.id !== id)),
    }),
    [status, menu, events, photos],
  )

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
}

export function useSiteData() {
  const context = useContext(SiteDataContext)
  if (!context) throw new Error('useSiteData must be used inside SiteDataProvider')
  return context
}
