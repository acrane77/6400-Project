export type DailyStats = {
	date: string
	scans: number
	unique: number
	signups: number
}

export type TotalStats = {
	scans: number
	unique: number
	signups: number
	conversion: number
}

export type PosterSummary = {
	id: string
	label: string
	location: string
	eventTitle: string
	eventDate: string
	postedOn: string
	totals: TotalStats
	dailyScans: number[]
}

export type PosterAnalytics = PosterSummary & {
	daily: DailyStats[]
	hourly: number[]
	tracking: string
}
