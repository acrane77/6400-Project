'use client'

import { useEvents } from "../contexts/eventsContext"

export function EventList() {

    const {events, loading} = useEvents();

    return <div>
        {loading && events.length == 0 && <p>... Loading Events</p>}
        {!loading && events.length === 0 && (
            <p>No events yet. Create the first one.</p>
        )}

        <ul className="space-y-4">
            {events.map((event) => {
            const date = new Date(event.eventDate)
            return (
                <li key={event.id} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold">{event.title}</h2>
                    <time className="text-sm text-zinc-600 dark:text-zinc-400" dateTime={event.eventDate}>
                    {Number.isNaN(date.getTime())
                        ? 'Date to be announced'
                        : date.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap">{event.description}</p>
                {(event.locationDetails || event.address || event.room || event.atMun) && (
                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {[event.locationDetails, event.address, event.room]
                        .filter(Boolean)
                        .join(' · ') || 'At Memorial University'}
                    </p>
                )}
                {event.fee !== undefined && event.fee > 0 && (
                    <p className="mt-2 text-sm">Fee: ${event.fee.toFixed(2)}</p>
                )}
                </li>
            )
            })}
        </ul>
    </div>
}