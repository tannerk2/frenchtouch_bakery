'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAX_QUANTITY } from './order-provider'

// − n + control with a typeable number. Items are removed with their own ✕, so it never goes below `min`.
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
      {/* Typeable too, so minimums like 12 don't take 12 taps. */}
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={MAX_QUANTITY}
        value={value}
        aria-label={`How many ${label}`}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => {
          const typed = Number.parseInt(event.target.value, 10)
          onChange(Number.isNaN(typed) ? min : typed)
        }}
        className="w-10 [appearance:textfield] bg-transparent text-center text-base font-semibold outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
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
