

export interface EventRepository {
    createEvent(event: any): Promise<Response>;
    getEvents(): Promise<Response>;
    deleteEvent(id: string, ownerId: string): Promise<Response>;
}
