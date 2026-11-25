import { EventPage } from '@/features/events/presentation/components/EventPage'


export default async function EventsPage() {

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events calendar</h1>
          <p className="mt-2 text-muted-foreground">
            Browse events by month or week and filter by date.
          </p>
        </div>
      </div>
      <EventPage/>
    </main>
  )
}
