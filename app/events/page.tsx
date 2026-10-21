'use client'

import { useEffect, useState } from 'react'

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
const API_BASE_URL =
  configuredApiBaseUrl &&
  configuredApiBaseUrl !== 'undefined' &&
  configuredApiBaseUrl !== 'null'
    ? configuredApiBaseUrl.replace(/\/$/, '')
    : 'http://localhost:8080'

type EventResponse = {
  id: string
  title: string
  description: string
  eventDate: string
  atMun: boolean
  address?: string
  room?: string
  locationDetails?: string
  fee?: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadEvents() {
      try {
        const response = await fetch(`/api/events`)
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`)
        }

        const result: {
          success: boolean
          body: EventResponse[]
        } = await response.json()
        const data = result.body

        if (isCurrent) {
          setEvents(
            data.sort(
              (first, second) =>
                new Date(first.eventDate).getTime() -
                new Date(second.eventDate).getTime(),
            ),
          )
        }
      } catch (loadError) {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? `Could not load events: ${loadError.message}`
              : 'Could not load events. Please try again.',
          )
        }
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadEvents()
    return () => { isCurrent = false }
  }, [])

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Upcoming events</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Events are listed by date, starting with the soonest.
          </p>
        </div>
        <a
          className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
          href="/account/events/create"
        >
          Create an event
        </a>
      </div>

      {isLoading && <p role="status">Loading events…</p>}
      {error && <p className="text-red-600" role="alert">{error}</p>}
      {!isLoading && !error && events.length === 0 && (
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
    </main>
  )
}
