const LOCALE = 'en-US'

export function formatCount(value: number): string {
  return value >= 10_000
    ? new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
    : value.toLocaleString(LOCALE)
}

export function formatPercent(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`
}

export function formatShortDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString(LOCALE, { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function formatLongDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString(LOCALE, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export function formatHour(hour: number): string {
  const suffix = hour < 12 ? 'am' : 'pm'
  return `${hour % 12 === 0 ? 12 : hour % 12}${suffix}`
}
