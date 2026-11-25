'use client'

import { useId, useState } from 'react'

export type Column = {
  key: string 
  tick: string 
  label: string
  value: number
}

type ColumnChartProps = {
  title: string
  description?: string
  unit: string
  categoryLabel: string
  columns: Column[]
  tickEvery?: number
}

const WIDTH = 640
const HEIGHT = 220
const MARGIN = { top: 20, right: 8, bottom: 24, left: 36 }
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom
const MAX_BAR_WIDTH = 18

function niceStep(max: number): number {
  const raw = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normalized = raw / magnitude
  const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude
  return Math.max(1, step)
}

function columnPath(x: number, y: number, width: number, height: number): string {
  if (height <= 0) return ''
  const r = Math.min(4, width / 2, height)
  return `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}`
    + `Q${x + width},${y} ${x + width},${y + r}V${y + height}Z`
}

export function ColumnChart({ title, description, unit, categoryLabel, columns, tickEvery = 1 }: ColumnChartProps) {
  const [active, setActive] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)
  const titleId = useId()

  const max = Math.max(1, ...columns.map((c) => c.value))
  const step = niceStep(max)
  const yMax = Math.ceil(max / step) * step
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step)
  const band = PLOT_WIDTH / Math.max(1, columns.length)
  const barWidth = Math.min(MAX_BAR_WIDTH, band * 0.7)
  const yFor = (value: number) => MARGIN.top + PLOT_HEIGHT - (value / yMax) * PLOT_HEIGHT
  const peakIndex = columns.reduce((best, c, i) => (c.value > columns[best].value ? i : best), 0)
  const activeColumn = active === null ? null : columns[active]

  return (
    <section aria-labelledby={titleId} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((shown) => !shown)}
          className="rounded-lg border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                <th className="py-1 font-medium">{categoryLabel}</th>
                <th className="py-1 text-right font-medium capitalize">{unit}</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((c) => (
                <tr key={c.key} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-1">{c.label}</td>
                  <td className="py-1 text-right tabular-nums">{c.value.toLocaleString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative" onPointerLeave={() => setActive(null)}>
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="group" aria-label={title}>
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={MARGIN.left}
                  x2={WIDTH - MARGIN.right}
                  y1={yFor(tick)}
                  y2={yFor(tick)}
                  strokeWidth={1}
                  className={tick === 0 ? 'stroke-zinc-300 dark:stroke-zinc-600' : 'stroke-zinc-200 dark:stroke-zinc-800'}
                />
                <text x={MARGIN.left - 6} y={yFor(tick)} dy="0.32em" textAnchor="end" className="fill-zinc-500 text-[11px] tabular-nums">
                  {tick.toLocaleString('en-US')}
                </text>
              </g>
            ))}

            {columns.map((c, i) => {
              const center = MARGIN.left + band * (i + 0.5)
              const top = yFor(c.value)
              return (
                <g key={c.key}>
                  <path
                    d={columnPath(center - barWidth / 2, top, barWidth, MARGIN.top + PLOT_HEIGHT - top)}
                    className={`fill-viz-series transition-opacity ${active === i ? 'opacity-75' : ''}`}
                  />
                  {i % tickEvery === 0 && (
                    <text x={center} y={HEIGHT - 6} textAnchor="middle" className="fill-zinc-500 text-[11px]">
                      {c.tick}
                    </text>
                  )}
                  {i === peakIndex && c.value > 0 && (
                    <text x={center} y={top - 6} textAnchor="middle" className="fill-zinc-700 text-[11px] font-semibold dark:fill-zinc-300">
                      {c.value.toLocaleString('en-US')}
                    </text>
                  )}
                  {}
                  <rect
                    x={center - band / 2}
                    y={MARGIN.top}
                    width={band}
                    height={PLOT_HEIGHT}
                    fill="transparent"
                    tabIndex={0}
                    aria-label={`${c.label}: ${c.value} ${unit}`}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="outline-none focus-visible:stroke-zinc-400"
                  />
                </g>
              )
            })}
          </svg>

          {activeColumn && active !== null && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-md dark:border-zinc-700 dark:bg-zinc-900"
              style={{
                left: `${Math.min(90, Math.max(10, ((MARGIN.left + band * (active + 0.5)) / WIDTH) * 100))}%`,
                top: `calc(${(yFor(activeColumn.value) / HEIGHT) * 100}% - 8px)`,
              }}
            >
              <p className="font-semibold tabular-nums">{activeColumn.value.toLocaleString('en-US')} {unit}</p>
              <p className="text-zinc-600 dark:text-zinc-400">{activeColumn.label}</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
