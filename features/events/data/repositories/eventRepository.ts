

export interface EventRepository {
    createEvent(event: any): Promise<Response>;
    getEvents(): Promise<Response>;
    getMyEvents(): Promise<Response>;
    deleteEvent(id: string, ownerId: string): Promise<Response>;
}
