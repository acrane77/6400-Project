type StatTileProps = {
	label: string
	value: string
	hint?: string
}

export function StatTile({ label, value, hint }: StatTileProps) {
	return (
		<div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
			<p className="text-sm text-zinc-600 dark:text-zinc-400">{label}</p>
			<p className="mt-1 text-3xl font-semibold">{value}</p>
			{hint && <p className="mt-1 truncate text-xs text-zinc-500">{hint}</p>}
		</div>
	)
}
