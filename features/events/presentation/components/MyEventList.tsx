'use client'

import { useState } from "react";
import { useMyEvents } from "../contexts/myEventsContext"
import { UserListDialog } from "@/features/Account/presentation/components/UserListDialog";

export function MyEventList() {

    const {myEvents, loading, deleteEvent} = useMyEvents();
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const selectedEvent = myEvents.find((event) => event.id === selectedEventId)

    return <div>
        {loading && myEvents.length == 0 && <p>... Loading Events</p>}
        {!loading && myEvents.length === 0 && (
            <p>No events yet. Create the first one.</p>
        )}

        <ul className="space-y-4">
            {myEvents.map((event) => {
            const date = new Date(event.eventDate)
            return (
                <li 
                key={event.id} 
                className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700"
                onClick={() => setSelectedEventId(event.id)}
                >
                <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold">{event.title}</h2>
                    <time className="text-sm text-zinc-600 dark:text-zinc-400" dateTime={event.eventDate}>
                    {Number.isNaN(date.getTime())
                        ? 'Date to be announced'
                        : date.toLocaleTimeString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'UTC',
                        })}
                    </time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap">{event.description}</p>
                    {(event.locationDetails || event.address || event.room || event.atMun) && (
                        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {[event.locationDetails, event.address, event.room]
                            .filter(Boolean)
                            .join(' · ') + ' At Memorial University'}
                        </p>
                    )}
                    {event.fee !== undefined && event.fee > 0 && (
                        <p className="mt-2 text-sm">Fee: ${event.fee.toFixed(2)}</p>
                    )}
                </div>
                <div className="py-2">
                    <button
                        className="rounded-lg border border-red-800 px-3 py-1 transition-colors hover:bg-red-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        onClick={(clickEvent) => {
                            clickEvent.stopPropagation()
                            void deleteEvent(event.id)
                        }}
                    >
                        Delete
                    </button>
                </div>
                </li>
            )
            })}
        </ul>
        <UserListDialog
            users={selectedEvent?.people ?? []}
            open={selectedEvent !== undefined}
            onClose={() => setSelectedEventId(null)}
        />
    </div>
}
