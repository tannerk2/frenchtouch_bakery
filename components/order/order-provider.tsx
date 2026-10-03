'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSiteData } from '@/components/site-data-provider'
import type { MenuItem } from '@/lib/site-data'

// What a visitor has added from the menu, kept in their browser so it survives moving between pages.
// It is a request list, not a cart: Agathe confirms the order and total by reply.
// Items are added from the menu; flavors and quantities are chosen on the Order page. Items with flavors
// are ordered per flavor (`flavors`: name -> quantity); items without use `quantity`.
export type OrderSelection = { itemId: string; quantity: number; flavors: Record<string, number> }

export type OrderLine = {
  item: MenuItem
  quantity: number
  // Every flavor Agathe offers for the item, in her order, with how many the visitor wants (0 = none).
  flavors: { name: string; quantity: number }[]
  // An item with flavors can't be sent until at least one flavor has a quantity.
  needsFlavor: boolean
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

const clamp = (quantity: number, min: number) => Math.min(MAX_QUANTITY, Math.max(min, Math.round(quantity)))

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
    const update = (itemId: string, change: (selection: OrderSelection) => OrderSelection) =>
      setSelections((list) => list.map((entry) => (entry.itemId === itemId ? change(entry) : entry)))
    return {
      ready,
      selections,
      add: (itemId) =>
        setSelections((list) =>
          list.some((entry) => entry.itemId === itemId) ? list : [...list, { itemId, quantity: 1, flavors: {} }],
        ),
      remove: (itemId) => setSelections((list) => list.filter((entry) => entry.itemId !== itemId)),
      setQuantity: (itemId, quantity) => update(itemId, (entry) => ({ ...entry, quantity: clamp(quantity, 1) })),
      setFlavorQuantity: (itemId, flavor, quantity) =>
        update(itemId, (entry) => {
          const { [flavor]: _previous, ...flavors } = entry.flavors
          const next = clamp(quantity, 0)
          return { ...entry, flavors: next > 0 ? { ...flavors, [flavor]: next } : flavors }
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

// Selections joined with the current menu, so whatever Agathe changes in the admin wins: removed items drop
// out and flavors always match her list. Returns null until both the saved order and the live menu have loaded.
export function useOrderLines(): OrderLine[] | null {
  const { ready, selections } = useOrder()
  const { menu, status } = useSiteData()
  return useMemo(() => {
    if (!ready || status === 'loading') return null
    return selections.flatMap((selection): OrderLine[] => {
      const item = menu.find((entry) => entry.id === selection.itemId)
      if (!item) return []
      const flavors = item.flavors.map((name) => ({ name, quantity: selection.flavors[name] ?? 0 }))
      return [
        {
          item,
          quantity: Math.max(1, selection.quantity),
          flavors,
          needsFlavor: flavors.length > 0 && flavors.every((flavor) => flavor.quantity === 0),
        },
      ]
    })
  }, [ready, selections, menu, status])
}

// Number of menu items in the order (quantities are chosen on the Order page).
export const orderCount = (lines: OrderLine[] | null) => lines?.length ?? 0
