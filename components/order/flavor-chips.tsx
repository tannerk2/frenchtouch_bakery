'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MenuItem } from '@/lib/site-data'
import { useOrder } from './order-provider'

// Tappable flavor chips for a menu item. Choosing one also adds the item to the order.
export function FlavorChips({ item, chosen }: { item: MenuItem; chosen: string[] }) {
  const { toggleFlavor } = useOrder()
  if (item.examples.length === 0) return null

  return (
    <div role="group" aria-label={`Flavors for ${item.name}`} className="flex flex-wrap gap-2">
      {item.examples.map((flavor) => {
        const selected = chosen.includes(flavor)
        return (
          <button
            key={flavor}
            type="button"
            aria-pressed={selected}
            onClick={() => toggleFlavor(item.id, flavor)}
            className={cn(
              'inline-flex min-h-8 items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              selected ? 'border-rouge bg-blush text-foreground' : 'border-transparent bg-blush/50 hover:bg-blush',
            )}
          >
            {selected ? <Check className="size-3.5" aria-hidden="true" /> : null}
            {flavor}
          </button>
        )
      })}
    </div>
  )
}
