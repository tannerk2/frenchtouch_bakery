'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSiteData } from '@/components/site-data-provider'
import { deleteUnusedUploads, saveSiteContent } from '@/lib/admin-storage'
import type { SiteContent } from '@/lib/site-data'

export type SaveState = 'saved' | 'pending' | 'saving' | 'error'

const DEBOUNCE_MS = 800

// Saves the whole site content shortly after each edit. Only enable it once content has loaded
// successfully, otherwise the built-in sample content could overwrite what's already saved.
export function useAutoSave(enabled: boolean) {
  const { menu, events, photos } = useSiteData()
  const content = useMemo<SiteContent>(() => ({ menu, events, photos }), [menu, events, photos])
  const [state, setState] = useState<SaveState>('saved')
  const latest = useRef(content)
  const saved = useRef<SiteContent | null>(null)
  const saving = useRef(false)

  const save = useCallback(async () => {
    // A save already in flight loops until it has written the newest content.
    if (saving.current || !saved.current) return
    saving.current = true
    setState('saving')
    try {
      do {
        const previous = saved.current
        const next = latest.current
        await saveSiteContent(next)
        saved.current = next
        void deleteUnusedUploads(previous, next)
      } while (latest.current !== saved.current)
      setState('saved')
    } catch (error) {
      console.error('Saving site content failed:', error)
      setState('error')
    } finally {
      saving.current = false
    }
  }, [])

  useEffect(() => {
    latest.current = content
    if (!enabled) return
    if (!saved.current) {
      saved.current = content
      return
    }
    if (JSON.stringify(content) === JSON.stringify(saved.current)) return
    setState((current) => (current === 'saving' ? current : 'pending'))
    const timer = setTimeout(save, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [enabled, content, save])

  // Leaving the admin (e.g. "View site") cancels the debounce above, so save right away instead of dropping the edit.
  useEffect(
    () => () => {
      if (saved.current && JSON.stringify(latest.current) !== JSON.stringify(saved.current)) void save()
    },
    [save],
  )

  useEffect(() => {
    if (state === 'saved') return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [state])

  return { state, retry: save }
}
