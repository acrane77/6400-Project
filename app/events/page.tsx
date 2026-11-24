import { EventPage } from '@/features/events/presentation/components/EventPage'


export default async function EventsPage() {

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events calendar</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Browse events by month or week and filter by date.
          </p>
        </div>
        <a
          className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
          href="/account/events/create"
        >
          Create an event
        </a>
      </div>
      <EventPage/>
    </main>
  )
}
