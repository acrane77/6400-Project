'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { getEventsAPI, addUserToEvent } from '../api/apiClient'
import type { EventItem } from '@/features/events/data/models/event'
import { CreateEventRequest } from "../../data/models/createEventRequest";
import { useMyEvents } from './myEventsContext'
import { useAccount } from '@/features/Account/presentation/contexts/AccountContext';
import { toast } from '@/core/Components/toast';


type EventsContextValue = {
  events: EventItem[]
  hasMore: boolean
  loading: boolean
  addEvent: (event: CreateEventRequest) => Promise<void>;
  loadMoreEvents: () => Promise<void>
  eventSignUp: (eventId :string) => Promise<void>;
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined)

function sortEventsByDate(events: EventItem[]) {
  return [...events].sort((first, second) => {
    const firstTime = Date.parse(first.eventDate)
    const secondTime = Date.parse(second.eventDate)
    const normalizedFirst = Number.isNaN(firstTime) ? Number.POSITIVE_INFINITY : firstTime
    const normalizedSecond = Number.isNaN(secondTime) ? Number.POSITIVE_INFINITY : secondTime
    return normalizedFirst - normalizedSecond
  })
}

type EventProps = {
  children: ReactNode
}

export function EventsProvider({ children }: EventProps) {
  const { addEvent: addMyEvent } = useMyEvents()
  const { user } = useAccount()
  const [events, setEvents] = useState<EventItem[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false);

  const loadInitialEvents = useCallback(async () => {
    setLoading(true)
    const result = await getEventsAPI()
    if (!result.success || !result.events) {
      setLoading(false);
      return
    }

    setEvents(sortEventsByDate(result.events))
    setHasMore(false)
    setLoading(false);

  }, []);

  useEffect(() => {
    if (events.length === 0) void loadInitialEvents()
  }, [events.length, loadInitialEvents])

  const loadMoreEvents = useCallback(async () => {
    if (!hasMore) return;
    setLoading(true);
    const result = await getEventsAPI()
    if (!result.success || !result.events) {
      setLoading(false);
      return
    }

    const knownIds = new Set(events.map((event) => event.id))
    const newEvents = result.events.filter((event) => !knownIds.has(event.id))
    setEvents((currentEvents) => sortEventsByDate([...currentEvents, ...newEvents]))
    setHasMore(newEvents.length > 0)
    setLoading(false);
  }, [events, hasMore])

  const addEvent = useCallback(async (event: CreateEventRequest) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0)
    const eventTime = Date.parse(event.eventDate)
    if (eventTime - today.getTime() < 0) {
      throw new Error('Event can not be in the past');
    }
    const newEvent = await addMyEvent(event)
    setEvents((currentEvents) =>
      sortEventsByDate([
        ...currentEvents.filter((currentEvent) => currentEvent.id !== newEvent.id),
        newEvent,
      ]),
    )
  }, [addMyEvent])

  const eventSignUp = useCallback(async function name(eventId: string) {
    if (!user) {
      toast('Please sign in to join this event.', 'error')
      return
    }
    const response = await addUserToEvent(eventId, user)
    if (!response.success) {
      toast('Could not sign up for this event.', 'error')
      return
    }
    toast("you have signed up for this event.", "success")
  }, [user])

  const value = useMemo(
    () => ({ events, hasMore, loading, addEvent, loadMoreEvents, eventSignUp }),
    [events, hasMore, loading, addEvent,  loadMoreEvents, eventSignUp],
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) throw new Error('useEvents must be used within an EventsProvider')
  return context
}
