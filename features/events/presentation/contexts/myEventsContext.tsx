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
import { getMyEventsAPI, deleteEventAPI, createEventAPI } from '../api/apiClient'
import type { EventItem } from '@/features/events/data/models/event'
import { CreateEventRequest } from "../../data/models/createEventRequest";
import { useAccount } from '@/features/Account/presentation/contexts/AccountContext'



type MyEventsContextValue = {
  myEvents: EventItem[]
  hasMore: boolean
  loading: boolean
  addEvent: (event: CreateEventRequest) => Promise<EventItem>
  loadMoreEvents: () => Promise<void>
  deleteEvent: (eventId: string) => Promise<void>
}

const MyEventsContext = createContext<MyEventsContextValue | undefined>(undefined)

function sortEventsByDate(events: EventItem[]) {
  return [...events].sort((first, second) => {
    const firstTime = Date.parse(first.eventDate)
    const secondTime = Date.parse(second.eventDate)
    const normalizedFirst = Number.isNaN(firstTime) ? Number.POSITIVE_INFINITY : firstTime
    const normalizedSecond = Number.isNaN(secondTime) ? Number.POSITIVE_INFINITY : secondTime
    return normalizedFirst - normalizedSecond
  })
}

type MyEventProps = {
  children: ReactNode
}

export function MyEventsProvider({ children }: MyEventProps) {
  const { user, isAuthLoading } = useAccount()
  const [myEvents, setMyEvents] = useState<EventItem[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false);

  const loadInitialEvents = useCallback(async () => {
    setLoading(true)
    const result = await getMyEventsAPI()
    if (!result.success || !result.events) {
      setLoading(false);
      return
    }

    setMyEvents(sortEventsByDate(result.events))
    setHasMore(false)
    setLoading(false)
  }, []);

  useEffect(() => {
    if (isAuthLoading || !user || myEvents.length > 0) return
    void loadInitialEvents()
  }, [isAuthLoading, user, myEvents.length, loadInitialEvents])

  const loadMoreEvents = useCallback(async () => {
    if (!hasMore) return;
    setLoading(true);
    const result = await getMyEventsAPI()
    if (!result.success || !result.events) {
      setLoading(false);
      return
    }

    const knownIds = new Set(myEvents.map((myEvent) => myEvent.id))
    const newEvents = result.events.filter((event) => !knownIds.has(event.id))
    setMyEvents((currentEvents) => sortEventsByDate([...currentEvents, ...newEvents]))
    setHasMore(newEvents.length > 0)
    setLoading(false);
  }, [myEvents, hasMore])

  const addEvent = useCallback(async (event: CreateEventRequest): Promise<EventItem> => {
    const result = await createEventAPI(event)
    if (!result.success || !result.event) {
      throw new Error('Failed to create event. Please try again.')
    }

    const newEvent = result.event
    setMyEvents((currentEvents) =>
      sortEventsByDate([
        ...currentEvents.filter((currentEvent) => currentEvent.id !== newEvent.id),
        newEvent,
      ]),
    )
    return newEvent
  }, [])

  const deleteEvent = useCallback(async (eventId: string) => {
   
    const result = await deleteEventAPI(eventId);

    if (!result.success) {
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
  if (!context) throw new Error('useMyEvents must be used within a MyEventsProvider')
  return context
}
