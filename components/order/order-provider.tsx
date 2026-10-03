'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSiteData } from '@/components/site-data-provider'
import type { MenuItem } from '@/lib/site-data'

// What a visitor has picked from the menu, kept in their browser so it survives moving between pages.
// It is a request list, not a cart: Agathe confirms the order and total by reply.
export type OrderSelection = { itemId: string; flavors: string[]; quantity: number }

export type OrderLine = OrderSelection & { item: MenuItem }

type OrderState = {
  ready: boolean
  selections: OrderSelection[]
  add: (itemId: string) => void
  remove: (itemId: string) => void
  toggleFlavor: (itemId: string, flavor: string) => void
  setQuantity: (itemId: string, quantity: number) => void
  clear: () => void
}

const STORAGE_KEY = 'ftb-order'
export const MAX_QUANTITY = 99

const OrderContext = createContext<OrderState | null>(null)

function readStored(): OrderSelection[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is OrderSelection =>
        typeof entry?.itemId === 'string' &&
        Array.isArray(entry.flavors) &&
        entry.flavors.every((flavor: unknown) => typeof flavor === 'string') &&
        Number.isInteger(entry.quantity) &&
        entry.quantity >= 1,
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
    const update = (itemId: string, change: (selection: OrderSelection) => OrderSelection) =>
      setSelections((list) => list.map((entry) => (entry.itemId === itemId ? change(entry) : entry)))
    return {
      ready,
      selections,
      add: (itemId) =>
        setSelections((list) =>
          list.some((entry) => entry.itemId === itemId) ? list : [...list, { itemId, flavors: [], quantity: 1 }],
        ),
      remove: (itemId) => setSelections((list) => list.filter((entry) => entry.itemId !== itemId)),
      // Picking a flavor also adds the item, so one tap on the menu is enough.
      toggleFlavor: (itemId, flavor) =>
        setSelections((list) => {
          const existing = list.find((entry) => entry.itemId === itemId)
          if (!existing) return [...list, { itemId, flavors: [flavor], quantity: 1 }]
          const flavors = existing.flavors.includes(flavor)
            ? existing.flavors.filter((entry) => entry !== flavor)
            : [...existing.flavors, flavor]
          return list.map((entry) => (entry === existing ? { ...entry, flavors } : entry))
        }),
      setQuantity: (itemId, quantity) =>
        update(itemId, (entry) => ({ ...entry, quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.round(quantity))) })),
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

// Selections joined with the current menu. Items Agathe has since removed, and flavors she has renamed,
// drop out. Returns null until both the saved selections and the live menu have loaded.
export function useOrderLines(): OrderLine[] | null {
  const { ready, selections } = useOrder()
  const { menu, status } = useSiteData()
  return useMemo(() => {
    if (!ready || status === 'loading') return null
    return selections.flatMap((selection) => {
      const item = menu.find((entry) => entry.id === selection.itemId)
      if (!item) return []
      return [{ ...selection, item, flavors: selection.flavors.filter((flavor) => item.examples.includes(flavor)) }]
    })
  }, [ready, selections, menu, status])
}
