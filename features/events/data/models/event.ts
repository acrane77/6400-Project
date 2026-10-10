import {User} from '@/features/Account/data/models/user'

export type EventItem = {
    dateCreated: string;
    eventDate: string;
    capacity?: number;
    title: string;
    description: string;
    fee?: number;
    people: User[];
    volenteers: User[];
    ownerId: string;
    id: string;
    atMun: boolean;
    address?: string;
    room?: string;
    locationDetails?: string;
};