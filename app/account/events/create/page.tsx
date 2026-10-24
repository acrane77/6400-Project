'use client'

import { useState, type FormEvent } from 'react'
import { createEvent } from '@/features/events/presentation/api/apiClient'
import { useAccount } from '@/features/Account/presentation/contexts/AccountContext'

export default function EventCreator() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { isAuthLoading, hasRole } = useAccount()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setIsSubmitting(true)
    setMessage('')
    setError('')

    const formData = new FormData(form)
    const eventDate = formData.get('eventDate')?.toString()

    try {
      const result = await createEvent({
        dateCreated: new Date().toISOString(),
        title: formData.get('title')?.toString().trim() ?? '',
        description: formData.get('description')?.toString().trim() ?? '',
        // Keep date-only form values at UTC midnight to avoid timezone shifts.
        eventDate: eventDate ? `${eventDate}T00:00:00Z` : '',
        people: [],
        volenteers: [],
        atMun: false,
      })

      if (!result.success) {
        throw new Error('The server rejected the event.')
      }

      form.reset()
      setMessage('Event created successfully.')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? `Could not create event: ${submitError.message}`
          : 'Could not create event. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isAuthLoading) return <p className="p-6" role="status">Loading...</p>
  if(!hasRole(['DEVELOPER', 'ORGANIZER'])) {
	  return <p className="p-6">Must be an organizer to create events.</p>
  }

  return (
    <div>
      <form className="p-6" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl">Event Creation Form</h1>
          <div className="flex flex-col gap-2">
            <label className="text-xl" htmlFor="title">Title</label>
            <input
              className="rounded-lg border-2 border-white px-2 py-1"
              id="title"
              name="title"
              type="text"
              required
              maxLength={120}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xl" htmlFor="description">Description</label>
            <textarea
              className="rounded-lg border-2 border-white px-2 py-1"
              id="description"
              name="description"
              required
              rows={4}
              maxLength={5000}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xl" htmlFor="eventDate">Event date</label>
            <input
              className="rounded-lg border-2 border-white px-2 py-1"
              id="eventDate"
              name="eventDate"
              type="date"
              required
            />
          </div>
          {message && <p role="status">{message}</p>}
          {error && <p className="text-red-600" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-8 w-28 rounded-xl border-2 border-white bg-white font-bold text-black disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}
