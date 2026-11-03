import { formatCount, formatPercent } from '../format'

type FunnelStage = {
  label: string
  value: number
}

export function FunnelBars({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(1, ...stages.map((s) => s.value))

  return (
    <ol className="space-y-3">
      {stages.map((stage, i) => {
        const previous = i > 0 ? stages[i - 1].value : null
        const share = stage.value / max
        return (
          <li key={stage.label} className="grid grid-cols-[7rem_1fr] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr]">
            <span className="text-zinc-600 dark:text-zinc-400">{stage.label}</span>
            <div className="flex items-center gap-2">
              <div
                className="h-5 shrink-0 rounded-r bg-viz-series"
                style={{ width: `calc((100% - 7rem) * ${share})`, minWidth: stage.value > 0 ? 2 : 0 }}
              />
              <span className="whitespace-nowrap tabular-nums">
                <span className="font-semibold">{formatCount(stage.value)}</span>
                {previous !== null && (
                  <span className="text-zinc-500"> ({formatPercent(previous ? stage.value / previous : 0)})</span>
                )}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
