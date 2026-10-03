'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { MAX_QUANTITY } from './order-provider'

// − n + control. At 1, the minus becomes a remove button (going to 0 takes the line out of the order).
export function QuantityStepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (quantity: number) => void
}) {
  const removes = value <= 1
  return (
    <div role="group" aria-label={`Quantity of ${label}`} className="inline-flex shrink-0 items-center rounded-full border border-border bg-card">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted"
      >
        {removes ? <Trash2 className="size-4" aria-hidden="true" /> : <Minus className="size-4" aria-hidden="true" />}
        <span className="sr-only">{removes ? `Remove ${label}` : `One fewer ${label}`}</span>
      </button>
      <output aria-live="polite" className="w-8 text-center text-base font-semibold">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
      >
        <Plus className="size-4" aria-hidden="true" />
        <span className="sr-only">One more {label}</span>
      </button>
    </div>
  )
}
