import {User} from '@/features/Account/data/models/user'

export type EventItem = {
    dateCreated: string;
    eventDate: string;
    title: string;
    description: string;
    people: User[];
    volenteers: User[];
    ownerId: string;
    id: string;
    atMun: boolean;
    capacity?: number;
    fee?: number;
    address?: string;
    room?: string;
    locationDetails?: string;
    organizerIds?: string[];
};
