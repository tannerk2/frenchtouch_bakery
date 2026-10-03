'use client'

import { useId, useRef, useState, type KeyboardEvent } from 'react'
import Image from 'next/image'
import { useSiteData } from '@/components/site-data-provider'
import { MENU_GROUPS } from '@/lib/site-data'
import { cn } from '@/lib/utils'
import { ContentLoading } from './content-loading'

export function MenuFilter() {
  const { menu, status } = useSiteData()
  const groups = MENU_GROUPS.map((group) => ({
    ...group,
    items: status === 'loading' ? [] : menu.filter((item) => item.group === group.key),
  }))
  const [activeKey, setActiveKey] = useState(groups[0].key)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()
  const active = groups.find((group) => group.key === activeKey) ?? groups[0]

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const nextIndex = (index + direction + groups.length) % groups.length
    setActiveKey(groups[nextIndex].key)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center gap-4">
        <div
          role="tablist"
          aria-label="Menu type"
          className="inline-flex rounded-full border border-border bg-card p-1.5"
        >
          {groups.map((group, index) => {
            const selected = group.key === activeKey
            return (
              <button
                key={group.key}
                ref={(node) => {
                  tabRefs.current[index] = node
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${group.key}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${group.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveKey(group.key)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cn(
                  'min-w-32 rounded-full px-6 py-2.5 text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                  selected
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {group.label}
                <span className="sr-only">{` (${group.items.length} categories)`}</span>
              </button>
            )
          })}
        </div>
        <p className="max-w-xl text-center leading-relaxed text-pretty text-muted-foreground">{active.intro}</p>
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${active.key}`}
        aria-labelledby={`${baseId}-tab-${active.key}`}
      >
        {status === 'loading' ? <ContentLoading /> : null}
        {status !== 'loading' && active.items.length === 0 ? (
          <p className="py-10 text-center text-lg text-muted-foreground">New items are coming soon.</p>
        ) : null}
        <ul key={active.key} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {active.items.map((item, index) => (
            <li
              key={item.id}
              style={{ animationDelay: `${index * 70}ms` }}
              className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <h3 className="text-2xl font-semibold leading-snug">{item.name}</h3>
                <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                <ul className="flex flex-wrap gap-2" aria-label={`Examples of ${item.name}`}>
                  {item.examples.map((example) => (
                    <li key={example} className="rounded-full bg-blush/50 px-3 py-1 text-sm font-medium">
                      {example}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto pt-2 text-lg font-semibold italic">{item.price}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
