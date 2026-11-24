'use client'

import { useEvents } from '@/features/events/presentation/contexts/eventsContext'
import { useState, type FormEvent } from 'react'
import { useAccount } from '@/features/Account/presentation/contexts/AccountContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CreateEventForm({
  onCreated,
  onCancel,
}: {
  onCreated?: () => void
  onCancel?: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { isAuthLoading, isAuthenticated } = useAccount()
  const [atMun, setAtMun] = useState(true);

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
        eventDate: eventDate ? `${eventDate}T${eventTime}:00Z` : '',
        atMun: atMun,
        room: formData.get('roomCode')?.toString().trim() ?? '',
        address: formData.get('address')?.toString().trim() ?? '',
      })

      form.reset()

      if (onCreated) {
        onCreated()
      } else {
        setMessage('Event created successfully.')
      }

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
    <form onSubmit={handleSubmit} className="w-full space-y-5">
  
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm">
          Event title
        </Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Enter event title"
          required
          maxLength={120}
          className="h-11 rounded-none border-border bg-background px-3 text-base md:text-base"
        />
      </div>
  
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm">
          Description
        </Label>
        <textarea
          id="description"
          name="description"
          placeholder="Describe your event..."
          required
          rows={4}
          maxLength={5000}
          className="w-full resize-y rounded-none border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1"
        />
      </div>
  
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  
        <div className="space-y-2">
          <Label htmlFor="eventDate" className="text-sm">
            Event date
          </Label>
          <Input
            id="eventDate"
            name="eventDate"
            type="date"
            required
            className="h-11 rounded-none border-border bg-background px-3 text-base md:text-base [color-scheme:dark]"
          />
        </div>
  
        <div className="space-y-2">
          <Label htmlFor="eventTime" className="text-sm">
            Event time
          </Label>
          <Input
            id="eventTime"
            name="eventTime"
            type="time"
            required
            className="h-11 rounded-none border-border bg-background px-3 text-base md:text-base [color-scheme:dark]"
          />
        </div>
  
      </div>
  
      <div className="space-y-3">
        <Label className="text-sm">Location</Label>
  
        <div className="grid grid-cols-2 gap-3">
  
          <button
            type="button"
            aria-pressed={atMun}
            onClick={() => setAtMun(true)}
            className={`h-11 rounded-none border px-3 text-sm font-medium transition-colors ${
              atMun
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            At MUN
          </button>
  
          <button
            type="button"
            aria-pressed={!atMun}
            onClick={() => setAtMun(false)}
            className={`h-11 rounded-none border px-3 text-sm font-medium transition-colors ${
              !atMun
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            Elsewhere
          </button>
  
        </div>
      </div>
  
      {atMun ? (
        <div className="space-y-2">
          <Label htmlFor="roomCode" className="text-sm">
            Room code
          </Label>
          <Input
            id="roomCode"
            name="roomCode"
            type="text"
            placeholder="Enter room code"
            required
            className="h-11 rounded-none border-border bg-background px-3 text-base md:text-base"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm">
            Address
          </Label>
          <Input
            id="address"
            name="address"
            type="text"
            placeholder="Enter event address"
            required
            className="h-11 rounded-none border-border bg-background px-3 text-base md:text-base"
          />
        </div>
      )}
  
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
  
      {message && (
        <p role="status" className="text-sm text-primary">
          {message}
        </p>
      )}
  
      <div className="flex justify-end gap-3 border-t border-border pt-5">
  
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 rounded-none px-6 text-base"
          >
            Cancel
          </Button>
        )}
  
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-none px-6 text-base"
        >
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </Button>
  
      </div>
  
    </form>
  )
}
