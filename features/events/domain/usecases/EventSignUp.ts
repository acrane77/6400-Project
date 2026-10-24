import type { EventRepository } from '@/features/events/data/repositories/eventRepository'
import { adminAuth } from '@/lib/firebaseAdmin'

export class EventSignUp {
  constructor(private readonly repository: EventRepository) {}

  async execute(request: Request): Promise<Response> {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ success: false, error: 'Unauthorized: Missing token.' }, { status: 401 })
    }

    let token
    try {
      token = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length))
    } catch {
      return Response.json({ success: false, error: 'Unauthorized: Invalid token.' }, { status: 401 })
    }

    let input: unknown
    try {
      input = await request.json()
    } catch {
      return Response.json({ success: false, error: 'Bad Request: Body must contain valid JSON.' }, { status: 400 })
    }

    const body = input as { eventId?: unknown } | null
    if (typeof body?.eventId !== 'string' || !body.eventId.trim()) {
      return Response.json({ success: false, error: 'Bad Request: eventId must be provided.' }, { status: 400 })
    }

    return this.repository.eventSignUp(body.eventId.trim(), {
      id: token.uid,
      username: token.name ?? token.email ?? '',
      firstName: '',
      lastName: '',
      email: token.email ?? '',
    })
  }
}
