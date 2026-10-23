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
import { toast } from 'sonner'
import { getMyEventsAPI, deleteEventAPI } from '../api/apiClient'
import type { EventItem } from '@/features/events/data/models/event'
import { CreateEventRequest } from "../../data/models/createEventRequest";
import { useEvents } from './eventsContext'


type MyEventsContextValue = {
  myEvents: EventItem[]
  hasMore: boolean
  loading: boolean
  addEvent: (event: CreateEventRequest) => Promise<void>
  loadMoreEvents: () => Promise<void>
  deleteEvent: (eventId: string) => Promise<void>
}

const MyEventsContext = createContext<MyEventsContextValue | undefined>(undefined)

const {addEvent} = useEvents();

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
  const [myEvents, setMyEvents] = useState<EventItem[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false);

  const loadInitialEvents = useCallback(async () => {
    setLoading(true)
    const result = await getMyEventsAPI()
    if (!result.success || !result.events) {
      toast('Failed to load events')
      setLoading(false);
      return
    }

    setMyEvents(sortEventsByDate(result.events))
    setHasMore(false)
    setLoading(false)
  }, []);

  useEffect(() => {
    if (myEvents.length === 0) void loadInitialEvents()
  }, [myEvents.length, loadInitialEvents])

  const loadMoreEvents = useCallback(async () => {
    if (!hasMore) return;
    setLoading(true);
    const result = await getMyEventsAPI()
    if (!result.success || !result.events) {
      toast('Failed to load events')
      setLoading(false);
      return
    }

    const knownIds = new Set(myEvents.map((myEvent) => myEvent.id))
    const newEvents = result.events.filter((event) => !knownIds.has(event.id))
    setMyEvents((currentEvents) => sortEventsByDate([...currentEvents, ...newEvents]))
    setHasMore(newEvents.length > 0)
    setLoading(false);
  }, [myEvents, hasMore])

  const deleteEvent = useCallback(async (eventId: string) => {
   
    const result = await deleteEventAPI(eventId);

    if (!result.success) {
        toast('Failed to create event')
        throw new Error('Failed to create event. Please try again.')
    }
    setMyEvents((currentEvents) =>
        sortEventsByDate([
        ...currentEvents.filter((currentEvent) => currentEvent.id !== eventId),
        ]),
        )
  },[])

  const value = useMemo(
    () => ({ myEvents, hasMore, loading, addEvent, loadMoreEvents, deleteEvent }),
    [myEvents, hasMore, loading, addEvent,  loadMoreEvents, deleteEvent],
  )

  return <MyEventsContext.Provider value={value}>{children}</MyEventsContext.Provider>
}

export function useMyEvents() {
  const context = useContext(MyEventsContext)
  if (!context) throw new Error('useEvents must be used within an EventsProvider')
  return context
}
