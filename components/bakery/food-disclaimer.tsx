import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// Required disclosure for home-based (cottage) food sales. Keep this wording exactly as given;
// it is shown in the footer on every page and on the Order page before sending.
export const FOOD_DISCLAIMER =
  'These products are not subject to government food safety inspection or licensing requirements. They may contain allergens.'

// Allergens used in Agathe's kitchen. Shown on the Order page (notice and sidebar).
export const KITCHEN_ALLERGENS = 'gluten, eggs, fish, milk, mustard, tree nuts and peanuts'

// The fuller version shown right before sending an order: what the notice is, the required
// wording, and which allergens the kitchen actually uses.
export function OrderNotice({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5 rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-relaxed', className)}>
      <p className="flex items-center gap-2 text-base font-semibold text-foreground">
        <Info className="size-4 shrink-0" aria-hidden="true" />
        Home kitchen &amp; allergen notice
      </p>
      <p>{FOOD_DISCLAIMER}</p>
      <p>
        Everything is made in a home kitchen that uses <strong className="font-semibold">{KITCHEN_ALLERGENS}</strong>.
        If you have an allergy, mention it in the notes so Agathe can tell you which items contain it.
      </p>
    </div>
  )
}

export function FoodDisclaimer({ className, centered = false }: { className?: string; centered?: boolean }) {
  if (centered) {
    // The icon sits inline with the first word so the whole sentence centers as one block.
    return (
      <p className={cn('text-center text-sm leading-relaxed text-balance', className)}>
        <Info className="mr-1.5 inline size-4 align-[-0.15em]" aria-hidden="true" />
        {FOOD_DISCLAIMER}
      </p>
    )
  }
  return (
    <p className={cn('flex items-start gap-2 text-sm leading-relaxed', className)}>
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{FOOD_DISCLAIMER}</span>
    </p>
  )
}
