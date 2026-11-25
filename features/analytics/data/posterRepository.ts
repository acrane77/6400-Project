import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebaseAdmin'
import type { Poster } from './models/poster'

// Firestore access for posters and scans
const posters = () => adminDb.collection('posters')
const posterScans = () => adminDb.collection('posterScans')

function convertToPoster(id: string, data: DocumentData): Poster {
	return {
		id,
		eventId: String(data.eventId ?? ''),
		label: String(data.label ?? ''),
		location: String(data.location ?? ''),
		createdBy: String(data.createdBy ?? ''),
		createdAt: String(data.createdAt ?? ''),
		scanCount: typeof data.scanCount === 'number' ? data.scanCount : 0,
		lastScanTime: typeof data.lastScanTime === 'string' ? data.lastScanTime : null
	}
}

// Determine if user has access to event
export async function hasAccessToEvent(eventId: string, uid: string): Promise<'missing' | 'organizer' | 'forbidden'> {
	const event = await adminDb.collection('events').doc(eventId).get();
	if (!event.exists) return 'missing'

	const organizerIds = event.get('organizerIds')
	const isOrganizer = event.get('ownerId') === uid || (Array.isArray(organizerIds) && organizerIds.includes(uid))

	return isOrganizer ? 'organizer' : 'forbidden'
}

// Lists an event's posters
export async function listPosters(eventId: string): Promise<Poster[]> {
	const p = await posters().where('eventId', '==', eventId).get()

	return p.docs.map((doc) => convertToPoster(doc.id, doc.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function createPoster(input: {
	eventId: string
	label: string
	location: string
	createdBy: string
}): Promise<Poster> {
	const data = { ...input, createdAt: new Date().toISOString(), scanCount: 0, lastScanTime: null }
	const ref = await posters().add(data)
	return convertToPoster(ref.id, data)
}

export async function getPosterEventId(posterId: string): Promise<string | null> {
	const poster = await posters().doc(posterId).get()
	const eventId = poster.exists ? poster.get('eventId') : null
	return typeof eventId === 'string' ? eventId : null
}

// Save a scan and increase the posters count
export async function onPosterScan(posterId: string, eventId: string, visitorId: string): Promise<void> {
	const scanTime = new Date().toISOString()
	const batch = adminDb.batch()
	
	batch.set(posterScans().doc(), { posterId, eventId, visitorId, scanTime })
	batch.update(posters().doc(posterId), { scanCount: FieldValue.increment(1), lastScanTime: scanTime})
	await batch.commit()
}
