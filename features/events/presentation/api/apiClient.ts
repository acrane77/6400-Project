import APIFetch from "@/core/APIFetch";
import { User } from "@/features/Account/data/models/user";
import type { EventItem } from "../../data/models/event";
import { CreateEventRequest } from "../../data/models/createEventRequest";
import { generateQueryString } from "@/core/queryString";
import type { SearchParams } from "@/features/events/data/models/SearchParams";

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

export async function getEventsAPI(params: SearchParams = {}) : Promise<{events: EventItem[] | undefined, success: boolean}> {
    
    const response = await APIFetch("GET", `/api/events${generateQueryString(params)}`, {});
    console.log(generateQueryString(params));
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


export async function addUserToEvent(eventId: string, user: User) : Promise<{success: boolean}> {
    const response = await APIFetch("POST", "/api/events/signup", { eventId, user });
    if (!response.ok) {
        console.error('User was not added to event');
        return {success: false}
    } else {
        return {success: true}
    }
}
