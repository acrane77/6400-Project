export type Poster = {
	id: string
	eventId: string
	label: string
	location: string
	createdBy: string
	createdAt: string 
	scanCount: number
	lastScanTime: string | null
}

export type CreatePosterRequest = {
	label: string
	location: string
}
