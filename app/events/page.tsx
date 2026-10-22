import { EventsProvider } from '@/features/events/presentation/contexts/eventsContext'
import { adminDb } from '@/lib/firebaseAdmin'
import type { EventItem } from '@/features/events/data/models/event'
import { connection } from 'next/server'
import {EventList} from '@/features/events/presentation/components/EventList'


export default async function EventsPage() {

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
      <EventList/>
    </main>
  )
}
