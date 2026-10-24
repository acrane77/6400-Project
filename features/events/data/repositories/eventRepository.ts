import type { AuthUser } from '@/core/auth'

export interface EventRepository {
    createEvent(event: any): Promise<Response>;
    getEvents(): Promise<Response>;
	deleteEvent(id: string, requester: AuthUser): Promise<Response>;
}
