import type { EventItem } from '@/features/events/data/models/event'
import type { EventRepository } from '@/features/events/data/repositories/eventRepository'
import { requireAuth } from '@/core/auth'
import { isEventCategory } from '@/features/events/data/models/categories'

export class CreateEvent {

  private repo: EventRepository;

  constructor(repo: EventRepository) {this.repo = repo}
  
  /** Server-side entry point: validate handler input, then persist through the server repository. */
  async execute(request: Request)
  : Promise<Response> {
	  const auth = await requireAuth(request)
	  if (auth instanceof Response) return auth
	  const ownerId = auth.uid

      let input: any;
      try {
        input = await request.json()
      } catch {
        return Response.json({ success: false, error: 'Bad Request: Body must contain valid JSON format' }, { status: 400 })
      }
    
    if (typeof input?.eventDate !== 'string' || Number.isNaN(Date.parse(input.eventDate))
      || typeof input.title !== 'string' || !input.title.trim()
      || typeof input.description !== 'string' || !input.description.trim()
      || !isEventCategory(input.category)) {
      return Response.json({ success: false, error: 'Bad Request: Provide a valid event date, title, and description.' }, { status: 400 })
    }

    let capacity: number | undefined
    let fee: number | undefined
    try {
      capacity = this.optionalNumber(input.capacity, 'Capacity')
      fee = this.optionalNumber(input.fee, 'Fee')
    } catch (error) {
       return Response.json({ success: false, error: (error as Error).message }, { status: 400 })
    } 

    const body = {
      eventDate: new Date(input.eventDate).toISOString(),
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      people: Array.isArray(input.people) ? input.people as EventItem['people'] : [],
      volenteers: Array.isArray(input.volenteers) ? input.volenteers as EventItem['volenteers'] : [],
      ownerId,
      organizerIds: [ownerId],
      atMun: input.atMun === true,
      ...(capacity !== undefined && { capacity }),
      ...(fee !== undefined && { fee }),
      ...(this.optionalString(input.address) && { address: this.optionalString(input.address) }),
      ...(this.optionalString(input.room) && { room: this.optionalString(input.room) }),
      ...(this.optionalString(input.locationDetails) && { locationDetails: this.optionalString(input.locationDetails) }),
    }

    return this.repo.createEvent(body);
  }

  private optionalNumber(value: unknown, field: string): number | undefined {
    if (value === undefined || value === null || value === '') return undefined
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`${field} must be a non-negative number.`)
    return parsed
  }

  private optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined
  }
}
