export type PublicEvent = {
	id: string
	title: string
	description: string
	eventDate: string
	atMun: boolean
	address: string | null
	room: string | null
	locationDetails: string | null
	fee: number | null
	capacity: number | null
	spotsLeft: number | null
}

