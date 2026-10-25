import type { EventRepository } from '@/features/events/data/repositories/eventRepository'
import { requireAuth } from '@/core/auth'

export class DeleteEvent {
  constructor(private readonly repository: EventRepository) {}

  async execute(request: Request): Promise<Response> {
	const auth = await requireAuth(request)
	if (auth instanceof Response) return auth
	
	let input: any;
	try {
		input = await request.json()
	}
	catch {
		return Response.json({ success: false, error: 'Bad Request: Invalid JSON' }, { status:400 })
	}

	if (typeof input?.id !== 'string' || !input.id.trim()) {
		return Response.json({ success: false, error: 'Bad Request: Must provide an ID'}, { status: 400 })
	}
	return this.repository.deleteEvent(input.id.trim(), auth);
  } 
}
