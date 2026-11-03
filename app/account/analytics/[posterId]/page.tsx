import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPosterAnalytics } from '@/features/analytics/data/sampleAnalytics'
import { StatTile } from '@/features/analytics/presentation/components/StatTile'
import { ColumnChart, type Column } from '@/features/analytics/presentation/components/ColumnChart'
import { FunnelBars } from '@/features/analytics/presentation/components/FunnelBars'
import {
  formatCount,
  formatEventDate,
  formatHour,
  formatLongDate,
  formatPercent,
  formatShortDate,
} from '@/features/analytics/presentation/format'

export default async function PosterAnalyticsPage({ params }: PageProps<'/account/analytics/[posterId]'>) {
  const { posterId } = await params
  const poster = await getPosterAnalytics(posterId)
  if (!poster) notFound()

  const { totals } = poster
  const scansLastWeek = poster.daily.slice(-7).reduce((sum, d) => sum + d.scans, 0)
  const busiestHour = poster.hourly.indexOf(Math.max(...poster.hourly))

  const dailyColumns: Column[] = poster.daily.map((d) => ({
    key: d.date,
    tick: formatShortDate(d.date),
    label: formatLongDate(d.date),
    value: d.scans,
  }))
  const hourlyColumns: Column[] = poster.hourly.map((scans, hour) => ({
    key: String(hour),
    tick: formatHour(hour),
    label: `${formatHour(hour)} – ${formatHour((hour + 1) % 24)}`,
    value: scans,
  }))

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link href="/account/analytics" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        ← All posters
      </Link>

      <div className="mt-4 mb-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">{poster.label}</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {poster.eventTitle} · {formatEventDate(poster.eventDate)}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {poster.location} · posted {formatShortDate(poster.postedOn)} ({poster.daily.length} days)
          </p>
		</div>

        {/* Placeholder until the QR generator is hooked up. */}
        <div className="flex w-40 flex-col items-center gap-2 text-center">
          <div className="flex size-32 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-xs text-zinc-500 dark:border-zinc-600">
            QR code
            <br />
            coming soon
          </div>
          <code className="break-all text-xs text-zinc-600 dark:text-zinc-400">{poster.tracking}</code>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total scans" value={formatCount(totals.scans)} hint={`${formatCount(scansLastWeek)} in the last 7 days`} />
        <StatTile
          label="Unique scanners"
          value={formatCount(totals.unique)}
          hint={`${formatPercent(totals.scans ? totals.unique / totals.scans : 0)} of scans`}
        />
        <StatTile label="Signups" value={formatCount(totals.signups)} hint="After scanning this poster" />
        <StatTile label="Conversion rate" value={formatPercent(totals.conversion)} hint="Signups ÷ unique scanners" />
      </div>

      <div className="space-y-6">
        <ColumnChart
          title="Scans per day"
          description="Every scan of this poster's QR code since it went up."
          unit="scans"
          categoryLabel="Day"
          columns={dailyColumns}
          tickEvery={Math.max(1, Math.ceil(dailyColumns.length / 6))}
        />

        <ColumnChart
          title="Scans by time of day"
          description={`Busiest around ${formatHour(busiestHour)}, so that's when the most people walk past.`}
          unit="scans"
          categoryLabel="Hour"
          columns={hourlyColumns}
          tickEvery={3}
        />

        <section className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">From scan to signup</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Percentages are relative to the step above.
          </p>
          <FunnelBars
            stages={[
              { label: 'Scans', value: totals.scans },
              { label: 'Unique scanners', value: totals.unique },
              { label: 'Signed up', value: totals.signups },
            ]}
          />
        </section>
      </div>
    </main>
  )
}
