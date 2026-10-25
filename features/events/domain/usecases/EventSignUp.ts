import { User } from '@/features/Account/data/models/user'
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

    const body = input as { eventId?: unknown, user?: unknown } | null
    if (typeof body?.eventId !== 'string' || !body.eventId.trim()) {
      return Response.json({ success: false, error: 'Bad Request: eventId must be provided.' }, { status: 400 })
    }
    const user = body.user as User
    if (!user || typeof user.id !== 'string' || !user.id.trim()) {
      return Response.json({ success: false, error: 'Bad Request: User must be provided.' }, { status: 400 })
    }
    if (user.id !== token.uid) {
      return Response.json({ success: false, error: 'User does not match the authenticated account.' }, { status: 403 })
    }

    return this.repository.eventSignUp(body.eventId.trim(), user)
  }
}
