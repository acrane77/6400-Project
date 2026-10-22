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
import { getEvents } from '../api/apiClient'
import type { EventItem } from '@/features/events/data/models/event'

type EventsContextValue = {
  events: EventItem[]
  hasMore: boolean
  loading: boolean
  loadMoreEvents: () => Promise<void>
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined)

type EventProps = {
  children: ReactNode
}

export function EventsProvider({ children }: EventProps) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (events.length != 0) return;
    loadInitialEvents();
    setLoading(false);
  },[])

  const loadInitialEvents = useCallback(async () => {
    setLoading(true)
    const result = await getEvents()
    if (!result.success || !result.events) {
      toast('Failed to load events')
      setLoading(false);
      return
    }

    setEvents(result.events)
    setHasMore(false)
    setLoading(false);

  }, []);

  const loadMoreEvents = useCallback(async () => {
    if (!hasMore) return;
    setLoading(true);
    const result = await getEvents()
    if (!result.success || !result.events) {
      toast('Failed to load events')
      setLoading(false);
      return
    }

    const knownIds = new Set(events.map((event) => event.id))
    const newEvents = result.events.filter((event) => !knownIds.has(event.id))
    setEvents((currentEvents) => [...currentEvents, ...newEvents])
    setHasMore(newEvents.length > 0)
    setLoading(false);
  }, [events])

  const value = useMemo(
    () => ({ events, hasMore, loading, loadMoreEvents }),
    [events, hasMore, loading,  loadMoreEvents],
  )

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) throw new Error('useEvents must be used within an EventsProvider')
  return context
}
