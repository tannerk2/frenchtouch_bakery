'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSiteData } from '@/components/site-data-provider'
import type { MenuItem } from '@/lib/site-data'

// What a visitor has picked from the menu, kept in their browser so it survives moving between pages.
// It is a request list, not a cart: Agathe confirms the order and total by reply.
// Items with flavors are ordered per flavor (`flavors`: name -> quantity); items without use `quantity`.
export type OrderSelection = { itemId: string; quantity: number; flavors: Record<string, number> }

export type OrderLine = {
  item: MenuItem
  quantity: number
  // Chosen flavors in the order Agathe listed them on the menu.
  flavors: { name: string; quantity: number }[]
  count: number
}

type OrderState = {
  ready: boolean
  selections: OrderSelection[]
  add: (itemId: string) => void
  remove: (itemId: string) => void
  setQuantity: (itemId: string, quantity: number) => void
  setFlavorQuantity: (itemId: string, flavor: string, quantity: number) => void
  clear: () => void
}

const STORAGE_KEY = 'ftb-order-v2'
export const MAX_QUANTITY = 99

const clamp = (quantity: number) => Math.min(MAX_QUANTITY, Math.max(0, Math.round(quantity)))

const OrderContext = createContext<OrderState | null>(null)

function readStored(): OrderSelection[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is OrderSelection =>
        typeof entry?.itemId === 'string' &&
        Number.isInteger(entry.quantity) &&
        typeof entry.flavors === 'object' &&
        entry.flavors !== null &&
        Object.values(entry.flavors).every((quantity) => Number.isInteger(quantity) && (quantity as number) > 0),
    )
  } catch {
    return []
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [selections, setSelections] = useState<OrderSelection[]>([])

  useEffect(() => {
    setSelections(readStored())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selections))
    } catch {
      // Private browsing or blocked storage: the order still works until the page is closed.
    }
  }, [ready, selections])

  const value = useMemo<OrderState>(() => {
    const upsert = (itemId: string, change: (selection: OrderSelection) => OrderSelection | null) =>
      setSelections((list) => {
        const existing = list.find((entry) => entry.itemId === itemId) ?? { itemId, quantity: 0, flavors: {} }
        const next = change(existing)
        const others = list.filter((entry) => entry.itemId !== itemId)
        if (!next || (next.quantity === 0 && Object.keys(next.flavors).length === 0)) return others
        return list.some((entry) => entry.itemId === itemId)
          ? list.map((entry) => (entry.itemId === itemId ? next : entry))
          : [...list, next]
      })
    return {
      ready,
      selections,
      add: (itemId) => upsert(itemId, (entry) => ({ ...entry, quantity: Math.max(1, entry.quantity) })),
      remove: (itemId) => upsert(itemId, () => null),
      setQuantity: (itemId, quantity) => upsert(itemId, (entry) => ({ ...entry, quantity: clamp(quantity) })),
      // A quantity of 0 removes the flavor; removing the last flavor removes the item.
      setFlavorQuantity: (itemId, flavor, quantity) =>
        upsert(itemId, (entry) => {
          const { [flavor]: _previous, ...flavors } = entry.flavors
          return { ...entry, flavors: clamp(quantity) > 0 ? { ...flavors, [flavor]: clamp(quantity) } : flavors }
        }),
      clear: () => setSelections([]),
    }
  }, [ready, selections])

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrder() {
  const context = useContext(OrderContext)
  if (!context) throw new Error('useOrder must be used inside OrderProvider')
  return context
}

// Selections joined with the current menu, so whatever Agathe changes in the admin wins: removed items and
// renamed flavors drop out. Returns null until both the saved selections and the live menu have loaded.
export function useOrderLines(): OrderLine[] | null {
  const { ready, selections } = useOrder()
  const { menu, status } = useSiteData()
  return useMemo(() => {
    if (!ready || status === 'loading') return null
    return selections.flatMap((selection): OrderLine[] => {
      const item = menu.find((entry) => entry.id === selection.itemId)
      if (!item) return []
      if (item.flavors.length === 0) {
        const quantity = Math.max(1, selection.quantity)
        return [{ item, quantity, flavors: [], count: quantity }]
      }
      const flavors = item.flavors
        .filter((name) => selection.flavors[name])
        .map((name) => ({ name, quantity: selection.flavors[name] }))
      if (flavors.length === 0) return []
      return [{ item, quantity: 0, flavors, count: flavors.reduce((sum, flavor) => sum + flavor.quantity, 0) }]
    })
  }, [ready, selections, menu, status])
}

export const orderCount = (lines: OrderLine[] | null) => lines?.reduce((sum, line) => sum + line.count, 0) ?? 0
