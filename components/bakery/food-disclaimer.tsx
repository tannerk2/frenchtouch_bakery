import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// Required disclosure for home-based (cottage) food sales. Keep this wording exactly as given;
// it is shown in the footer on every page and on the Order page before sending.
export const FOOD_DISCLAIMER =
  'These products are not subject to government food safety inspection or licensing requirements. They may contain allergens.'

export function FoodDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn('flex items-start gap-2 text-sm leading-relaxed', className)}>
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{FOOD_DISCLAIMER}</span>
    </p>
  )
}
