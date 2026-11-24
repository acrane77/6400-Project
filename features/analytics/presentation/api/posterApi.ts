import APIFetch from '@/core/APIFetch'
import type { CreatePosterRequest, Poster } from '../../data/models/poster'

async function readBody<T>(response: Response, fallbackError: string): Promise<T> {
	const result = await response.json().catch(() => null)
	if (!response.ok) throw new Error(result?.error || fallbackError) 
	
	return result.body as T
}

export async function getPostersAPI(eventId: string): Promise<Poster[]> {
	const response = await APIFetch('GET', `/api/events/${encodeURIComponent(eventId)}/posters`, {})
	return readBody<Poster[]>(response, 'Could not load posters.')
}

export async function createPosterAPI(eventId: string, input: CreatePosterRequest): Promise<Poster> {
	const response = await APIFetch('POST', `/api/events/${encodeURIComponent(eventId)}/posters`, input)
	return readBody<Poster>(response, 'Could not create the poster.')
}
