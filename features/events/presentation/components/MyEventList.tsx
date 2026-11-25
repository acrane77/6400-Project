'use client'

import { useState } from "react";
import { useMyEvents } from "../contexts/myEventsContext"
import Link from 'next/link'
import { UserListDialog } from "@/features/Account/presentation/components/UserListDialog";
import { Button, buttonVariants } from '@/components/ui/button'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MyEventList() {

    const {myEvents, loading, deleteEvent} = useMyEvents();
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const selectedEvent = myEvents.find((event) => event.id === selectedEventId)

    return <div>
        {loading && myEvents.length == 0 && <p className="py-8 text-center text-muted-foreground">Loading Events...</p>}
        {!loading && myEvents.length === 0 && (
            <div className="rounded-lg border border-dashed border-border py-12 text-center">
              <p className="font-medium">No events yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create the first one.
              </p>
            </div>

        )}
        <ul className="space-y-4">
            {myEvents.map((event) => {
                const date = new Date(event.eventDate)
                const validDate = !Number.isNaN(date.getTime())

                return (
                    <li
                        key={event.id}
                        className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/30"
                        onClick={() => setSelectedEventId(event.id)}
                    >
                        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">

                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl font-semibold text-foreground">
                                    {event.title}
                                </h2>

                                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                                    {event.description}
                                </p>

                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <p className="text-sm text-muted-foreground">
                                        {[
                                            event.locationDetails,
                                            event.address,
                                            event.room,
                                            event.atMun ? 'Memorial University' : '',
                                        ].filter(Boolean).join(', ')}
                                    </p>

                                    {event.atMun && (
                                        <span className="rounded border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                                            At MUN
                                        </span>
                                    )}
                                </div>

                                {event.fee !== undefined && event.fee > 0 && (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Fee: ${event.fee.toFixed(2)}
                                    </p>
                                )}
                            </div>

                            <div className="flex shrink-0 flex-col justify-between gap-5 sm:border-l sm:border-border sm:pl-6">

                                <div className="flex items-center gap-3">
                                    <CalendarDays className="size-6 text-primary" />

                                    <div>
                                        <p className="text-sm font-semibold">
                                            {validDate
                                                ? date.toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    timeZone: 'UTC',
                                                })
                                                : 'Date to be announced'}
                                        </p>

                                        {validDate && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {date.toLocaleTimeString(undefined, {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    timeZone: 'UTC',
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        href={`/account/events/${event.id}/manage`}
                                        className={cn(
                                            buttonVariants({ variant: 'outline' }),
                                            'h-9 rounded-md border-primary/40 bg-transparent px-4 text-sm hover:bg-primary/10'
                                        )}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Manage Event
                                    </Link>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-9 rounded-md border-destructive/50 bg-transparent px-4 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            void deleteEvent(event.id)
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>

                            </div>
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
