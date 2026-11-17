export type EventCategory = {
  id: string
  name: string
  b?: string
  c?: string[]
}

// Compact tree: b = parent branch, c = child category IDs.
export const EVENT_CATEGORIES: EventCategory[] = [
  { id: 'b1000', name: 'Holiday', c: ['b1100', 'b1200'] },
  { id: 'b2000', name: 'Fundraiser', c: ['b2100', 'b2200', 'b2300'] },
  { id: 'b3000', name: 'Student groups', c: ['b3100', 'b3200', 'b3300'] },
  { id: 'b4000', name: 'Parties and Games', c: ['b4100', 'b4200', 'b4300'] },
  { id: 'b5000', name: 'Career', c: ['b5100', 'b5200', 'b5300'] },
  { id: 'b1100', name: 'Celebrations', b: 'b1000' },
  { id: 'b1200', name: 'Seasonal', b: 'b1000' },
  { id: 'b2100', name: 'Bake sales', b: 'b2000' },
  { id: 'b2200', name: 'Sports fundraisers', b: 'b2000' },
  { id: 'b2300', name: 'Medical fundraisers', b: 'b2000' },
  { id: 'b3100', name: 'Clubs', b: 'b3000' },
  { id: 'b3200', name: 'Societies', b: 'b3000' },
  { id: 'b3300', name: 'Academic groups', b: 'b3000' },
  { id: 'b4100', name: 'Parties', b: 'b4000' },
  { id: 'b4200', name: 'Board games', b: 'b4000' },
  { id: 'b4300', name: 'Video games', b: 'b4000' },
  { id: 'b5100', name: 'Networking', b: 'b5000' },
  { id: 'b5200', name: 'Career fairs', b: 'b5000' },
  { id: 'b5300', name: 'Workshops', b: 'b5000' },
]

const categoriesById = new Map(EVENT_CATEGORIES.map((category) => [category.id, category]))

export function getCategoryName(id: string | undefined): string | undefined {
  return id ? categoriesById.get(id)?.name : undefined
}

export function getCategoryDescendants(id: string): string[] {
  const category = categoriesById.get(id)
  return [id, ...(category?.c ?? [])]
}

export function isEventCategory(id: unknown): id is string {
  return typeof id === 'string' && categoriesById.has(id)
}
