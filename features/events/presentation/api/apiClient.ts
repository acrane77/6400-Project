import APIFetch from "@/core/APIFetch";
import { User } from "@/features/Account/data/models/user";
import { EventItem } from "../../data/models/event";

type CreateEventRequest = {
    dateCreated: string;
        eventDate: string;
        capacity?: number;
        title: string;
        description: string;
        fee?: number;
        people: User[];
        volenteers: User[];
        atMun: boolean;
        address?: string;
        room?: string;
        locationDetails?: string;
}

export async function createEvent(body: CreateEventRequest) : Promise<{event: EventItem | undefined, success: boolean}> {
    
    const response = await APIFetch("POST", "/api/events", body);
    if (!response.ok) {
        console.error('Event was not created');
        return {event: undefined, success: false}
    } else {
        const res = await response.json();
        return {event: res.body as EventItem, success: true}
    }
}

export async function getEvents() : Promise<{events: EventItem[] | undefined, success: boolean}> {
    
    const response = await APIFetch("GET", "/api/events", {});
    if (!response.ok) {
        console.error('Event was not created');
        return {events: [], success: false}
    } else {
        const res = await response.json();
        return {events: res.body as EventItem[], success: true }
    }
}

export async function deleteEvent(id: string): Promise<{success: boolean}> {
    if (!id.trim()) return { success: false };
    const response = await APIFetch("DELETE", `/api/events/${encodeURIComponent(id.trim())}`, {});
    return { success: response.ok };
}
