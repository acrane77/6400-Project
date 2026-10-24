export type CreateEventRequest = {
    dateCreated: string;
    eventDate: string;
    title: string;
    description: string;
    atMun: boolean;
    capacity?: number;
    fee?: number;
    address?: string;
    room?: string;
    locationDetails?: string;
}