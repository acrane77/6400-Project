type StatTileProps = {
	label: string
	value: string
	hint?: string
}

export function StatTile({ label, value, hint }: StatTileProps) {
	return (
		<div className="rounded-lg border border-border bg-card p-4">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className="mt-1 text-3xl font-semibold text-primary">{value}</p>
			{hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
		</div>
	)
}
