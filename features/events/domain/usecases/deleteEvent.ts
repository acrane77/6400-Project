import type { EventRepository } from '@/features/events/data/repositories/eventRepository'
import { adminAuth } from '@/lib/firebaseAdmin'

export class DeleteEvent {
  constructor(private readonly repository: EventRepository) {}

  async execute(request: Request): Promise<Response> {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ success: false, error: 'Unauthorized: Missing token.' }, { status: 401 })
    }

    let ownerId: string
    try {
      const decodedToken = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length))
      ownerId = decodedToken.uid
    } catch {
      return Response.json({ success: false, error: 'Unauthorized: Invalid token.' }, { status: 401 })
    }

    let input: any;
      try {
        input = await request.json()
      } catch {
        return Response.json({ success: false, error: 'Bad Request: Body must contain valid JSON format' }, { status: 400 })
      }

    if (typeof input?.id !== 'string' || !input.id.trim()) {
        return Response.json({success: false, error: 'Bad Request: Id must be provided'}, { status: 400 })
    }
    return this.repository.deleteEvent(input.id.trim(), ownerId);
  }
}
