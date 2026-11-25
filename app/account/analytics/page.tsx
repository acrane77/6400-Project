import Link from 'next/link'
import { getPosterSummaries } from '@/features/analytics/data/sampleAnalytics'
import { StatTile } from '@/features/analytics/presentation/components/StatTile'
import { Sparkline } from '@/features/analytics/presentation/components/Sparkline'
import { formatCount, formatPercent, formatShortDate } from '@/features/analytics/presentation/format'

export default async function AnalyticsHomePage() {
  const posters = await getPosterSummaries()
  const totalScans = posters.reduce((sum, p) => sum + p.totals.scans, 0)
  const totalSignups = posters.reduce((sum, p) => sum + p.totals.signups, 0)
  const bestPoster = posters.reduce<(typeof posters)[number] | null>(
    (best, p) => (!best || p.totals.conversion > best.totals.conversion ? p : best),
    null,
  )

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Poster analytics</h1>
        <p className="mt-2 text-muted-foreground">
          See how many people scan each poster&apos;s QR code, and how many of them sign up.
        </p> 
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Posters" value={formatCount(posters.length)} />
        <StatTile label="Total scans" value={formatCount(totalScans)} />
        <StatTile label="Signups from QR" value={formatCount(totalSignups)} />
        <StatTile
          label="Best conversion"
          value={bestPoster ? formatPercent(bestPoster.totals.conversion) : '–'}
          hint={bestPoster?.label}
        />
      </div>

      <h2 className="mb-4 text-xl font-semibold">Your posters</h2>
      {posters.length === 0 ? (
        <p>No posters yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {posters.map((poster) => (
            <li key={poster.id}>
              <Link
                href={`/account/analytics/${poster.id}`}
				className="block h-full rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{poster.label}</h3>
                    <p className="text-sm text-muted-foreground">{poster.eventTitle}</p>
                  </div>
                  <Sparkline values={poster.dailyScans} />
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Scans</dt>
                    <dd className="text-lg font-semibold">{formatCount(poster.totals.scans)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Signups</dt>
                    <dd className="text-lg font-semibold">{formatCount(poster.totals.signups)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Conversion</dt>
                    <dd className="text-lg font-semibold">{formatPercent(poster.totals.conversion)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-muted-foreground">
                  Posted {formatShortDate(poster.postedOn)} · {poster.location}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
