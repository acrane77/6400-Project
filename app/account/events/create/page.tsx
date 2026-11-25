'use client'

import { useEvents } from '@/features/events/presentation/contexts/eventsContext'
import { useState, type FormEvent } from 'react'
import { useAccount } from '@/features/Account/presentation/contexts/AccountContext'
import { EVENT_CATEGORIES, getCategoryName } from '@/features/events/data/models/categories'
import CategorySelect from '@/features/events/presentation/components/CategorySelect'

export default function EventCreator() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { isAuthLoading, isAuthenticated } = useAccount()
  const [atMun, setAtMun] = useState(true);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')

  const {addEvent} = useEvents();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setIsSubmitting(true)
    setMessage('')
    setError('')

    const formData = new FormData(form);
    const eventDate = formData.get('eventDate')?.toString();
    const eventTime = formData.get('eventTime')?.toString();
    console.log(eventDate, eventTime)
    try {
      await addEvent({
        dateCreated: new Date().toISOString(),
        title: formData.get('title')?.toString().trim() ?? '',
        description: formData.get('description')?.toString().trim() ?? '',
        category: selectedCategory,
        eventDate: eventDate ? `${eventDate}T${eventTime}:00Z` : '',
        atMun: atMun,
        room: formData.get('roomCode')?.toString().trim() ?? '',
        address: formData.get('address')?.toString().trim() ?? '',
      })

      form.reset()
      setSelectedCategory('')
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
  if(!isAuthenticated) {
	  return <p className="p-6">You must log in to create events.</p>
  }

  return (
    <div>
      <form className="p-6" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-3xl">Event Creation Form</h1>
          <div className="flex w-full max-w-md flex-col gap-2">
            <label className="text-xl" htmlFor="category-picker">Category</label>
            <input type="hidden" name="category" value={selectedCategory} />
            <button
              className="rounded-lg border border-zinc-600 bg-black px-4 py-3 text-left text-white hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              id="category-picker"
              type="button"
              aria-haspopup="dialog"
              aria-expanded={categoryDialogOpen}
              onClick={() => setCategoryDialogOpen(true)}
            >
              {getCategoryName(selectedCategory) ?? 'Choose a category'}
            </button>
          </div>
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
          <div className="flex flex-col gap-2">
            <label className="text-xl" htmlFor="eventTime">Event Time</label>
            <input
              className="rounded-lg border-2 border-white px-2 py-1"
              id="eventTime"
              name="eventTime"
              type="time"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xl" htmlFor="atMun">At Mun</label>
            <input
              className="rounded-lg border-2 border-white px-2 py-1"
              id="atMun"
              name="atMun"
              type="checkbox"
              checked={atMun}
              onChange={(e) => setAtMun(e.target.checked)}
            />
          </div>
          {atMun && (
            <div className="flex flex-col gap-2">
            <label className="text-xl" htmlFor="roomCode">Room Code</label>
            <input
              className="rounded-lg border-2 border-white px-2 py-1"
              id="roomCode"
              name="roomCode"
              type="text"
              required
            />
            </div>
          )}
          {!atMun && (
            <div className="flex flex-col gap-2">
            <label className="text-xl" htmlFor="address">Address</label>
            <input
              className="rounded-lg border-2 border-white px-2 py-1"
              id="address"
              name="address"
              type="text"
              required
            />
            </div>
          )}
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
      {categoryDialogOpen && (
        <CategorySelect
          closeDialog={() => setCategoryDialogOpen(false)}
          setSelectedCategory={(category) => setSelectedCategory(category)}
        />
      )}
    </div>
  )
}
