'use client'

import { useState } from 'react'
import {MyEventList} from '@/features/events/presentation/components/MyEventList'
import { Button } from "@/components/ui/button"
import CreateEventForm from '@/features/events/presentation/components/CreateEventForm'


export default function MyEventsPage() {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your events</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Your events are listed by date, starting with the soonest.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowCreate(true)}
          className="h-11 px-6 text-base"
        >
          Create an event
        </Button>
      </div>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-event-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-8"
          >
            <div className="mb-6 border-b border-border pb-5">
              <h2
                id="create-event-title"
                className="text-2xl font-semibold"
              >
                Create Event
              </h2>
            </div>
  
            <CreateEventForm
              onCreated={() => setShowCreate(false)}
              onCancel={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}
      <MyEventList/>
    </main>
  )
}
