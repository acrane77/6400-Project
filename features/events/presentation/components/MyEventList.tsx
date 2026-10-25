'use client'

import { useMyEvents } from "../contexts/myEventsContext"
import Link from 'next/link'

export function MyEventList() {

    const {myEvents, loading, deleteEvent} = useMyEvents();

    return <div>
        {loading && myEvents.length == 0 && <p>... Loading Events</p>}
        {!loading && myEvents.length === 0 && (
            <p>No events yet. Create the first one.</p>
        )}

        <ul className="space-y-4">
            {myEvents.map((event) => {
            const date = new Date(event.eventDate)
            return (
                <li key={event.id} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
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
                <div className="flex gap-3 py-2">
                    <Link
                        href={`/account/events/${event.id}/manage`}
                        className="rounded-lg border border-blue-600 px-3 py-1 hover:bg-blue-600 hover:text-white"
                    >
                        Manage Event
                    </Link>

                    <button
                        className="rounded-lg border border-red-800 px-3 py-1 hover:bg-red-600 hover:text-white"
                        onClick={() => deleteEvent(event.id)}
                    >
                        Delete
                    </button>
                </div>
                </li>
            )
            })}
        </ul>
    </div>
}
