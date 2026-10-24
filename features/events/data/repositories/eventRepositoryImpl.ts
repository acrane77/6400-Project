import { User } from '@/features/Account/data/models/user';
import type { EventRepository } from '@/features/events/data/repositories/eventRepository'
import { EventApiClient } from '@/features/events/domain/api/EventApi'

export class EventRepositoryImpl implements EventRepository {
  constructor(private readonly apiClient = new EventApiClient()) {}

  createEvent(event: any): Promise<Response> { 
    return this.apiClient.createEvent(event)
  }

  getEvents(): Promise<Response> {
    return this.apiClient.getEvents();
  }

  deleteEvent(id: string, ownerId: string): Promise<Response> {
    return this.apiClient.deleteEvent(id, ownerId);
  }

  eventSignUp(eventId: string, user: User): Promise<Response>{
    return this.apiClient.eventSignUp(eventId, user);
  }
}
