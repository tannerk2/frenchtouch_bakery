export type MenuGroupKey = 'sweet' | 'savory'

export type MenuItem = {
  id: string
  group: MenuGroupKey
  name: string
  description: string
  price: string
  image: string
  alt: string
  examples: string[]
}

export type MenuGroupMeta = {
  key: MenuGroupKey
  label: string
  intro: string
}

export type MarketEvent = {
  id: string
  date: string
  time: string
  name: string
  place: string
}

export type PhotoShape = 'portrait' | 'square' | 'landscape'

export type GalleryPhoto = {
  id: string
  src: string
  alt: string
  shape: PhotoShape
}

export const MENU_GROUPS: MenuGroupMeta[] = [
  {
    key: 'sweet',
    label: 'Sweet',
    intro: 'Tarts, cakes and little French treats for dessert, goûter and every celebration.',
  },
  {
    key: 'savory',
    label: 'Savory',
    intro: 'Quiches, galettes and apéritif bites for brunches, showers and gatherings.',
  },
]

export const SEED_MENU: MenuItem[] = [
  {
    id: 'tarts',
    group: 'sweet',
    name: 'Tarts, tartlets & pies',
    description: 'Crisp pâte sucrée filled with curds, ganache and seasonal fruit.',
    price: '$28',
    image: '/images/menu-tarts.png',
    alt: 'Lemon meringue tartlets with toasted meringue peaks',
    examples: ['Lemon meringue tartlets', 'Chocolate hazelnut tartlets', 'Chocolate hazelnut tart'],
  },
  {
    id: 'cakes',
    group: 'sweet',
    name: 'Cakes',
    description: 'Celebration cakes for birthdays, weddings and every little fête.',
    price: '$45',
    image: '/images/menu-cakes.png',
    alt: 'A blush pink layered celebration cake topped with raspberries',
    examples: ['Fraisier', 'Chocolate entremet', 'Custom celebration cakes'],
  },
  {
    id: 'madeleines',
    group: 'sweet',
    name: 'Madeleines',
    description: 'Shell-shaped little sponge cakes with a golden, buttery edge.',
    price: '$14 / dozen',
    image: '/images/menu-madeleines.png',
    alt: 'Shell-shaped madeleines and almond financiers on parchment',
    examples: ['Classic vanilla madeleines', 'Almond financiers', 'Lemon-glazed madeleines'],
  },
  {
    id: 'sweet-crepes',
    group: 'sweet',
    name: 'Sweet crêpes',
    description: 'Paper-thin and tender, folded warm for parties and events.',
    price: '$18',
    image: '/images/menu-crepes.png',
    alt: 'Folded crêpes dusted with powdered sugar with fresh strawberries',
    examples: ['Sugar & butter', 'Chocolate hazelnut', 'Salted caramel'],
  },
  {
    id: 'seasonal',
    group: 'sweet',
    name: 'Seasonal specials',
    description: 'Whatever the orchard and the French calendar are calling for.',
    price: '$22',
    image: '/images/menu-seasonal.png',
    alt: 'A rustic apple tarte tatin and a galette des rois with a paper crown',
    examples: ['Tarte tatin', 'Galette des rois', 'Bûche de Noël'],
  },
  {
    id: 'quiches',
    group: 'savory',
    name: 'Quiches & appetizers',
    description: 'Savory bites for brunches, showers and apéritif hour.',
    price: '$24',
    image: '/images/menu-quiche.png',
    alt: 'A golden quiche lorraine with a slice cut out, beside small gougères',
    examples: ['Quiche lorraine', 'Gougères', 'Mini savory tartlets'],
  },
  {
    id: 'savory-crepes',
    group: 'savory',
    name: 'Savory crêpes & galettes',
    description: 'Buckwheat galettes and crêpes filled the Breton way.',
    price: '$20',
    image: '/images/menu-savory-crepes.png',
    alt: 'Folded buckwheat galettes filled with ham, gruyère and an egg',
    examples: ['Ham & gruyère', 'Galette complète', 'Spinach & goat cheese'],
  },
]

export const SEED_EVENTS: MarketEvent[] = [
  { id: 'meridian-oct', date: '2026-10-10', time: '9am – 1pm', name: 'Meridian Main Street Market', place: 'Generations Plaza, Meridian' },
  { id: 'kuna-oct', date: '2026-10-24', time: '9am – 1pm', name: 'Kuna Farmers Market', place: 'Bernie Fisher Park, Kuna' },
  { id: 'holiday-popup', date: '2026-11-07', time: '10am – 2pm', name: 'Holiday Artisan Pop-Up', place: 'Location to be announced' },
  { id: 'winter-market', date: '2026-12-12', time: '10am – 3pm', name: 'Winter Holiday Market', place: 'Downtown Meridian' },
]

export const SEED_PHOTOS: GalleryPhoto[] = [
  { id: 'g1', src: '/images/gallery-1.png', alt: 'Chocolate hazelnut tartlets arranged on linen', shape: 'portrait' },
  { id: 'g2', src: '/images/gallery-2.png', alt: 'A pastry box of macarons and almond financiers tied with pink ribbon', shape: 'square' },
  { id: 'g3', src: '/images/gallery-3.png', alt: 'The French Touch Bakery table at a local farmers market', shape: 'landscape' },
  { id: 'g4', src: '/images/gallery-4.png', alt: 'A slice of strawberry fraisier cake on a vintage floral plate', shape: 'portrait' },
  { id: 'g5', src: '/images/gallery-5.png', alt: 'Piping meringue onto lemon tartlets', shape: 'portrait' },
  { id: 'g6', src: '/images/gallery-6.png', alt: 'A pear and almond frangipane tart with a cup of coffee', shape: 'square' },
  { id: 'g7', src: '/images/menu-cakes.png', alt: 'Blush pink celebration cake with raspberries', shape: 'landscape' },
  { id: 'g8', src: '/images/menu-madeleines.png', alt: 'Fresh madeleines on parchment paper', shape: 'square' },
]

export const SHAPE_CLASS: Record<PhotoShape, string> = {
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
}

const EVENT_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

export function formatEventDate(isoDate: string) {
  const parsed = new Date(`${isoDate}T00:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? isoDate : EVENT_DATE_FORMAT.format(parsed)
}

export function createId() {
  return Math.random().toString(36).slice(2, 10)
}

// Local calendar date as YYYY-MM-DD, so it compares directly with event dates.
export function todayIso() {
  return new Date().toLocaleDateString('en-CA')
}

export type SiteContent = {
  menu: MenuItem[]
  events: MarketEvent[]
  photos: GalleryPhoto[]
}

export const SEED_CONTENT: SiteContent = { menu: SEED_MENU, events: SEED_EVENTS, photos: SEED_PHOTOS }

// The admin portal saves all editable content to this one file in the content bucket.
export const CONTENT_PATH = 'data/site.json'

type Loose = Record<string, unknown>

const isObject = (value: unknown): value is Loose => typeof value === 'object' && value !== null
const hasStrings = (value: Loose, keys: string[]) => keys.every((key) => typeof value[key] === 'string')

function isMenuItem(value: unknown): value is MenuItem {
  return (
    isObject(value) &&
    hasStrings(value, ['id', 'name', 'description', 'price', 'image', 'alt']) &&
    MENU_GROUPS.some((group) => group.key === value.group) &&
    Array.isArray(value.examples) &&
    value.examples.every((example) => typeof example === 'string')
  )
}

function isMarketEvent(value: unknown): value is MarketEvent {
  return isObject(value) && hasStrings(value, ['id', 'date', 'time', 'name', 'place'])
}

function isGalleryPhoto(value: unknown): value is GalleryPhoto {
  return isObject(value) && hasStrings(value, ['id', 'src', 'alt']) && typeof value.shape === 'string' && value.shape in SHAPE_CLASS
}

function listOf<T>(value: unknown, isEntry: (entry: unknown) => entry is T): T[] {
  return Array.isArray(value) ? value.filter(isEntry) : []
}

// Drop anything malformed so one bad entry in the saved file can't break a public page.
export function parseSiteContent(raw: unknown): SiteContent {
  const data = isObject(raw) ? raw : {}
  return {
    menu: listOf(data.menu, isMenuItem),
    events: listOf(data.events, isMarketEvent),
    photos: listOf(data.photos, isGalleryPhoto),
  }
}
