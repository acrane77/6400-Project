import type { User } from "@/features/Account/data/models/user";
import type { AuthUser } from '@/core/auth'

export interface EventRepository {
	createEvent(event: any): Promise<Response>;
	getEvents(): Promise<Response>;
	getMyEvents(ownerId: string): Promise<Response>;
	deleteEvent(id: string, requester: AuthUser): Promise<Response>;
  eventSignUp(eventId: string, user: User): Promise<Response>;
}
