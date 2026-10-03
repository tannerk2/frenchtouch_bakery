'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSiteData } from '@/components/site-data-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MENU_GROUPS, createId, uniqueFlavors, type MenuGroupKey, type MenuItem } from '@/lib/site-data'
import { Field, ImagePicker, selectClass } from './fields'

export function MenuEditor() {
  const { menu, saveMenuItem, deleteMenuItem, moveMenuItem } = useSiteData()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<MenuGroupKey | null>(null)
  const [movedId, setMovedId] = useState<string | null>(null)

  function handleMove(item: MenuItem, direction: 'up' | 'down') {
    moveMenuItem(item.id, direction)
    setMovedId(item.id)
    toast(`Moved “${item.name}” ${direction}`)
  }

  function handleSave(item: MenuItem) {
    saveMenuItem(item)
    setEditingId(null)
    setAddingTo(null)
    toast.success(`Saved “${item.name}”`)
  }

  function handleDelete(item: MenuItem) {
    if (!window.confirm(`Remove “${item.name}” from the menu?`)) return
    deleteMenuItem(item.id)
    toast(`Removed “${item.name}”`)
  }

  return (
    <section aria-labelledby="menu-editor-title" className="flex flex-col gap-10">
      <h2 id="menu-editor-title" className="text-3xl font-semibold">
        Menu items
      </h2>

      {MENU_GROUPS.map((group) => {
        const items = menu.filter((item) => item.group === group.key)
        return (
          <div key={group.key} className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold">
                {group.label} <span className="text-lg font-normal text-muted-foreground">({items.length})</span>
              </h3>
              <Button
                className="rounded-full text-base"
                onClick={() => {
                  setEditingId(null)
                  setAddingTo(group.key)
                }}
              >
                <Plus aria-hidden="true" />
                Add {group.label.toLowerCase()} item
              </Button>
            </div>

            {addingTo === group.key ? (
              <MenuItemForm
                initial={emptyItem(group.key)}
                onSave={handleSave}
                onCancel={() => setAddingTo(null)}
              />
            ) : null}

            <ul className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
              {items.length === 0 ? (
                <li className="px-6 py-8 text-center text-muted-foreground">No items yet.</li>
              ) : null}
              {items.map((item, index) =>
                editingId === item.id ? (
                  <li key={item.id} className="border-b border-border p-4 last:border-0">
                    <MenuItemForm initial={item} onSave={handleSave} onCancel={() => setEditingId(null)} />
                  </li>
                ) : (
                  <li
                    key={item.id}
                    className={`flex items-center gap-4 border-b border-border px-4 py-3 transition-colors duration-500 last:border-0 md:px-6 ${
                      movedId === item.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex shrink-0 flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={index === 0}
                        onClick={() => handleMove(item, 'up')}
                      >
                        <ChevronUp aria-hidden="true" />
                        <span className="sr-only">Move {item.name} up</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        disabled={index === items.length - 1}
                        onClick={() => handleMove(item, 'down')}
                      >
                        <ChevronDown aria-hidden="true" />
                        <span className="sr-only">Move {item.name} down</span>
                      </Button>
                    </div>
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate text-xl font-semibold">{item.name}</p>
                      <p className="truncate text-base text-muted-foreground">
                        {item.price} &bull;{' '}
                        {item.flavors.length ? `${item.flavors.length} flavor${item.flavors.length === 1 ? '' : 's'}` : 'no flavors'}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAddingTo(null)
                          setEditingId(item.id)
                        }}
                      >
                        <Pencil aria-hidden="true" />
                        <span className="sr-only">Edit {item.name}</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item)}>
                        <Trash2 aria-hidden="true" />
                        <span className="sr-only">Delete {item.name}</span>
                      </Button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

function emptyItem(group: MenuGroupKey): MenuItem {
  return { id: createId(), group, name: '', description: '', price: '', image: '', alt: '', flavors: [] }
}

function MenuItemForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: MenuItem
  onSave: (item: MenuItem) => void
  onCancel: () => void
}) {
  const [item, setItem] = useState(initial)
  const [flavors, setFlavors] = useState(() => initial.flavors.map((name) => ({ key: createId(), name })))
  const update = (patch: Partial<MenuItem>) => setItem((current) => ({ ...current, ...patch }))
  const prefix = `menu-${item.id}`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!item.image) {
      toast.error('Please choose a photo for this item.')
      return
    }
    const names = flavors.map((flavor) => flavor.name.trim()).filter(Boolean)
    const duplicate = names.find((name, index) => names.findIndex((other) => other.toLowerCase() === name.toLowerCase()) !== index)
    if (duplicate) {
      toast.error(`“${duplicate}” is listed twice. Each flavor can only appear once.`)
      return
    }
    onSave({
      ...item,
      name: item.name.trim(),
      alt: item.alt.trim() || item.name.trim(),
      flavors: uniqueFlavors(names),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      data-lpignore="true"
      className="flex flex-col gap-5 rounded-2xl border border-border bg-muted/50 p-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" htmlFor={`${prefix}-name`}>
          <Input
            id={`${prefix}-name`}
            required
            value={item.name}
            onChange={(e) => update({ name: e.target.value })}
            className="bg-card text-base"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Section" htmlFor={`${prefix}-group`}>
            <select
              id={`${prefix}-group`}
              value={item.group}
              onChange={(e) => update({ group: e.target.value as MenuGroupKey })}
              className={`${selectClass} bg-card`}
            >
              {MENU_GROUPS.map((group) => (
                <option key={group.key} value={group.key}>
                  {group.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price" htmlFor={`${prefix}-price`}>
            <Input
              id={`${prefix}-price`}
              required
              placeholder="$28 or $14 / dozen"
              value={item.price}
              onChange={(e) => update({ price: e.target.value })}
              className="bg-card text-base"
            />
          </Field>
        </div>
      </div>

      <Field label="Description" htmlFor={`${prefix}-description`}>
        <Textarea
          id={`${prefix}-description`}
          required
          rows={2}
          value={item.description}
          onChange={(e) => update({ description: e.target.value })}
          className="bg-card text-base"
        />
      </Field>

      <FlavorList flavors={flavors} onChange={setFlavors} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="text-base font-medium">Photo</span>
          <ImagePicker value={item.image} alt={item.alt} onChange={(image) => update({ image })} />
        </div>
        <Field label="Photo description" htmlFor={`${prefix}-alt`} hint="Describes the photo for screen readers.">
          <Input
            id={`${prefix}-alt`}
            value={item.alt}
            onChange={(e) => update({ alt: e.target.value })}
            className="bg-card text-base"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" className="text-base" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="rounded-full text-base">
          Save item
        </Button>
      </div>
    </form>
  )
}

type FlavorDraft = { key: string; name: string }

// One field per flavor. Customers pick from exactly these when they order, so each one is added on purpose.
function FlavorList({ flavors, onChange }: { flavors: FlavorDraft[]; onChange: (flavors: FlavorDraft[]) => void }) {
  const [focusKey, setFocusKey] = useState<string | null>(null)

  function addFlavor() {
    const key = createId()
    onChange([...flavors, { key, name: '' }])
    setFocusKey(key)
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-base font-medium">Flavors</legend>
      <p className="text-sm text-muted-foreground">
        Customers choose from these when they order, each with its own quantity. Leave the list empty if this item
        has no flavor options.
      </p>
      {flavors.length ? (
        <ul className="flex flex-col gap-2">
          {flavors.map((flavor, index) => (
            <li key={flavor.key} className="flex items-center gap-2">
              <Input
                aria-label={`Flavor ${index + 1}`}
                value={flavor.name}
                autoFocus={flavor.key === focusKey}
                placeholder="e.g. Lemon meringue"
                onChange={(e) =>
                  onChange(flavors.map((entry) => (entry.key === flavor.key ? { ...entry, name: e.target.value } : entry)))
                }
                // Enter adds the next flavor instead of saving the whole item.
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  addFlavor()
                }}
                className="bg-card text-base"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => onChange(flavors.filter((entry) => entry.key !== flavor.key))}
              >
                <Trash2 aria-hidden="true" />
                <span className="sr-only">Remove flavor {flavor.name || index + 1}</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      <Button type="button" variant="outline" className="self-start text-base" onClick={addFlavor}>
        <Plus aria-hidden="true" />
        Add flavor
      </Button>
    </fieldset>
  )
}
