import type { EventRepository } from '@/features/events/data/repositories/eventRepository'
import { EventApiClient } from '@/features/events/domain/api/EventApi'
import { AuthUser } from '@/core/auth'

export class EventRepositoryImpl implements EventRepository {
  constructor(private readonly apiClient = new EventApiClient()) {}

  createEvent(event: any): Promise<Response> { 
    return this.apiClient.createEvent(event)
  }

  getEvents(): Promise<Response> {
    return this.apiClient.getEvents();
  }

  getMyEvents(ownerId: string): Promise<Response> {
	  return this.apiClient.getMyEvents(ownerId);
  }

  deleteEvent(id: string, requester: AuthUser): Promise<Response> {
	  return this.apiClient.deleteEvent(id, requester);
  }
}
