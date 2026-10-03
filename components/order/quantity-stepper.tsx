'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAX_QUANTITY } from './order-provider'

// − n + control. Items are removed with their own ✕, so the stepper never goes below `min`.
export function QuantityStepper({
  label,
  value,
  min,
  onChange,
}: {
  label: string
  value: number
  min: number
  onChange: (quantity: number) => void
}) {
  return (
    <div
      role="group"
      aria-label={`Quantity of ${label}`}
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border bg-card',
        value > 0 ? 'border-rouge/60' : 'border-border',
      )}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted disabled:opacity-40"
      >
        <Minus className="size-4" aria-hidden="true" />
        <span className="sr-only">One fewer {label}</span>
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
