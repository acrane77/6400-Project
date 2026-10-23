import APIFetch from "@/core/APIFetch";
import { User } from "@/features/Account/data/models/user";
import { EventItem } from "../../data/models/event";
import { CreateEventRequest } from "../../data/models/createEventRequest";

export async function createEventAPI(body: CreateEventRequest) : Promise<{event: EventItem | undefined, success: boolean}> {
    
    const response = await APIFetch("POST", "/api/events", body);
    if (!response.ok) {
        console.error('Event was not created');
        return {event: undefined, success: false}
    } else {
        const res = await response.json();
        return {event: res.body as EventItem, success: true}
    }
}

export async function getEventsAPI() : Promise<{events: EventItem[] | undefined, success: boolean}> {
    
    const response = await APIFetch("GET", "/api/events", {});
    if (!response.ok) {
        console.error('Events were not Loaded');
        return {events: [], success: false}
    } else {
        const res = await response.json();
        return {events: res.body as EventItem[], success: true }
    }
}

export async function getMyEventsAPI() : Promise<{events: EventItem[] | undefined, success: boolean}> {
    
    const response = await APIFetch("GET", "/api/events/my-events", {});
    if (!response.ok) {
        console.error('My events were not loaded');
        return {events: [], success: false}
    } else {
        const res = await response.json();
        return {events: res.body as EventItem[], success: true }
    }
}

export async function deleteEventAPI(id: string): Promise<{success: boolean}> {
    if (!id.trim()) return { success: false };
    const response = await APIFetch("DELETE", `/api/events/${encodeURIComponent(id.trim())}`, {});
    return { success: response.ok };
}
