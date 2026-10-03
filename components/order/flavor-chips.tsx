'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MenuItem } from '@/lib/site-data'
import { useOrder } from './order-provider'

// The flavors Agathe set up for an item. Tapping one adds a single one of it; tapping again takes it out.
// Quantities per flavor are set on the Order page.
export function FlavorChips({ item, chosen }: { item: MenuItem; chosen: Record<string, number> }) {
  const { setFlavorQuantity } = useOrder()
  if (item.flavors.length === 0) return null

  return (
    <div role="group" aria-label={`Flavors for ${item.name}`} className="flex flex-wrap gap-2">
      {item.flavors.map((flavor) => {
        const quantity = chosen[flavor] ?? 0
        return (
          <button
            key={flavor}
            type="button"
            aria-pressed={quantity > 0}
            onClick={() => setFlavorQuantity(item.id, flavor, quantity > 0 ? 0 : 1)}
            className={cn(
              'inline-flex min-h-8 items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              quantity > 0 ? 'border-rouge bg-blush text-foreground' : 'border-transparent bg-blush/50 hover:bg-blush',
            )}
          >
            {quantity > 0 ? <Check className="size-3.5" aria-hidden="true" /> : null}
            {flavor}
            {quantity > 1 ? <span className="font-semibold">×{quantity}</span> : null}
          </button>
        )
      })}
    </div>
  )
}
