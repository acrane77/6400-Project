import { requireAuth } from '@/core/auth'
import { createPoster, hasAccessToEvent, listPosters } from '@/features/analytics/data/posterRepository'

type Params = { params: Promise<{ id: string }> }

// Check if organizer has auth to access event
async function authorizeOrganizer(request: Request, eventId: string): Promise<string | Response> {
	const auth = await requireAuth(request)
	if (auth instanceof Response) return auth

	const access = await hasAccessToEvent(eventId, auth.uid)
	if (access === 'missing') {
		return Response.json({ success: false, error: 'Event not found' }, { status: 404 })
	}

	if (access === 'forbidden') {
		return Response.json({ success: false, error: 'Only organizers can manage posters' }, { status: 403 })
	}
	return auth.uid
}

export async function GET(request: Request, { params }: Params): Promise<Response> {
	const { id } = await params
	try {
		const uid = await authorizeOrganizer(request, id)
		if (uid instanceof Response) return uid

		return Response.json({ success: true, body: await listPosters(id) })
	}
	catch (error) {
		console.error(error)
		return Response.json({ success: false, error: 'Failed to load posters' }, { status: 500 })
	}
}

export async function POST(request: Request, { params }: Params): Promise<Response> {
	const { id } = await params
	try {
		const uid = await authorizeOrganizer(request, id)
		if (uid instanceof Response) return uid

		const body = await request.json().catch(() => null)
		const label = typeof body?.label === 'string' ? body.label.trim() : ''
		const location = typeof body?.location === 'string' ? body.location.trim() : ''

		if (!label || label.length > 80 || location.length > 120) {
			return Response.json(
				{
					success: false,
					error: `Give the poster a name (up to 60 characters) and an optional location.`,
				},
				{ status: 400 }
			)
		}

		const poster = await createPoster({ eventId: id, label, location, createdBy: uid })
		return Response.json({ success: true, body: poster }, { status: 201 })
	}
	catch (error) {
		console.error(error)
		return Response.json({ success: false, error: 'Failed to create poster' }, { status: 500})
	}
}
