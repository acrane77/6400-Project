type SparklineProps = {
  values: number[]
  width?: number
  height?: number
}

export function Sparkline({ values, width = 120, height = 36 }: SparklineProps) {
  if (values.length < 2) return null

  const pad = 5 
  const max = Math.max(1, ...values)
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2)
  const y = (v: number) => height - pad - (v / max) * (height - pad * 2)
  const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const last = values.length - 1

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="shrink-0">
      <polyline
        points={points}
        fill="none"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="stroke-viz-series"
      />
      <circle cx={x(last)} cy={y(values[last])} r={4} strokeWidth={2} className="fill-viz-series stroke-background" />
    </svg>
  )
}
