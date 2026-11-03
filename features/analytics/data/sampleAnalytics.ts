import type {
	DailyStats,
	TotalStats,
	PosterSummary,
	PosterAnalytics
} from './models/posterAnalytics'

type Poster = {
	id: string
	label: string
	location: string
	eventTitle: string
	eventDate: string
	posted: number
	peakScans: number 
	decay: number // interest decay per day
	uniqueRatio: number
	conversion: number
	peakHours: number[]
	seed: number
}

const POSTERS: Poster[] = [ 
	{
		id: 'csf-atrium', label: 'Core Science', location: 'CSF Whale Atrium', eventTitle: 'ECE Hackathon 2026', eventDate: '2026-11-21T14:00:00.000Z', posted: 10, peakScans: 30, decay: 0.1, uniqueRatio: 0.5, conversion: 0.25, peakHours: [10, 11, 12], seed: 1
	},
	{
		id: 'library', label: 'QEII Library Lobby', location: 'Main lobby, ground floor', eventTitle: 'Library Tour', eventDate: '2026-12-04T13:00:00.000Z', posted: 20, peakScans: 50, decay: 0.05, uniqueRatio: 0.8, conversion: 0.1, peakHours: [10, 12, 13], seed: 2
	}
]

// Small deterministic PRNG (mulberry32) so the sample data is stable.
function seededRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildDaily(poster: Poster, random: () => number): DailyStats[] {
  const end = Date.parse(`${'2026-11-03'}T00:00:00Z`)
  return Array.from({ length: poster.posted }, (_, day) => {
    const time = end - (poster.posted - 1 - day) * 86400000
    const weekday = new Date(time).getUTCDay()
    const weekendDip = weekday === 0 || weekday === 6 ? 0.45 : 1
    const expected = poster.peakScans * Math.exp(-poster.decay * day) * weekendDip

    const scans = Math.round(expected * (0.7 + random() * 0.6))
    const uniqueScanners = Math.min(scans, Math.round(scans * poster.uniqueRatio * (0.9 + random() * 0.2)))
    const signups = Math.min(uniqueScanners, Math.round(uniqueScanners * poster.conversion * (0.5 + random())))

    return { date: new Date(time).toISOString().slice(0, 10), scans, unique: uniqueScanners, signups }
  })
}

// Splits total in proportion to weights
function distribute(total: number, weights: number[]): number[] {
  const weightSum = weights.reduce((sum, w) => sum + w, 0)
  const exact = weights.map((w) => (w / weightSum) * total)
  const parts = exact.map(Math.floor)
  let remaining = total - parts.reduce((sum, p) => sum + p, 0)
  const byRemainder = exact
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder)
  for (const { index } of byRemainder) {
    if (remaining <= 0) break
    parts[index]++
    remaining--
  }
  return parts
}

function buildHourly(poster: Poster, totalScans: number, random: () => number): number[] {
  const weights = Array.from({ length: 24 }, (_, hour) => {
    const nearPeak = poster.peakHours.reduce((sum, peak) => sum + Math.exp(-((hour - peak) ** 2) / 4), 0)
    const background = hour < 7 ? 0.02 : 0.15
    return (background + nearPeak) * (0.8 + random() * 0.4)
  })
  return distribute(totalScans, weights)
}

function sumTotals(daily: DailyStats[]): TotalStats {
  const scans = daily.reduce((sum, d) => sum + d.scans, 0)
  const uniqueScanners = daily.reduce((sum, d) => sum + d.unique, 0)
  const signups = daily.reduce((sum, d) => sum + d.signups, 0)
  return { scans, unique: uniqueScanners, signups, conversion: uniqueScanners ? signups / uniqueScanners : 0 }
}

function buildPoster(poster: Poster): PosterAnalytics {
  const random = seededRandom(poster.seed)
  const daily = buildDaily(poster, random)
  const totals = sumTotals(daily)
  return {
    id: poster.id,
    label: poster.label,
    location: poster.location,
    eventTitle: poster.eventTitle,
    eventDate: poster.eventDate,
    postedOn: daily[0].date,
    totals,
    dailyScans: daily.map((d) => d.scans),
    daily,
    hourly: buildHourly(poster, totals.scans, random),
    tracking: `/q/${poster.id}`,
  }
}

const SAMPLE_POSTERS = POSTERS.map(buildPoster)

function toSummary(poster: PosterAnalytics): PosterSummary {
  const { id, label, location, eventTitle, eventDate, postedOn, totals, dailyScans } = poster
  return { id, label, location, eventTitle, eventDate, postedOn, totals, dailyScans }
}


export async function getPosterSummaries(): Promise<PosterSummary[]> {
  return SAMPLE_POSTERS.map(toSummary).sort((a, b) => b.totals.scans - a.totals.scans)
}

export async function getPosterAnalytics(id: string): Promise<PosterAnalytics | null> {
  return SAMPLE_POSTERS.find((poster) => poster.id === id) ?? null
}

