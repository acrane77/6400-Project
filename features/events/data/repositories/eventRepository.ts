import { User } from "@/features/Account/data/models/user";


export interface EventRepository {
    createEvent(event: any): Promise<Response>;
    getEvents(): Promise<Response>;
    getMyEvents(ownerId: string): Promise<Response>;
    deleteEvent(id: string, ownerId: string): Promise<Response>;
    eventSignUp(eventId: string, user: User): Promise<Response>;
}
