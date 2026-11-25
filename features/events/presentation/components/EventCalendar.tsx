'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEvents } from '../contexts/eventsContext'
import { } from 'lucide-react';

type CalendarMode = 'month' | 'week'

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseDate(value: string) {
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnly) return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function weekStart(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  start.setDate(start.getDate() - start.getDay())
  return start
}

export function EventCalendar() {
  const { events, loading, eventSignUp, dateRange } = useEvents()
  const [mode, setMode] = useState<CalendarMode>('month')
  const [viewDate, setViewDate] = useState(() => new Date())

  useEffect(() => {
    const minimumDate = dateRange?.min ? parseDate(dateRange.min) : undefined
    setViewDate(minimumDate ?? new Date())
  }, [dateRange?.min])

  const calendarDays = useMemo(() => {
    if (mode === 'week') {
      return Array.from({ length: 7 }, (_, index) => {
        const day = weekStart(viewDate)
        day.setDate(day.getDate() + index)
        return day
      })
    }

    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const start = weekStart(firstDay)
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start)
      day.setDate(start.getDate() + index)
      return day
    })
  }, [mode, viewDate])

  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, typeof events>()
    for (const event of events) {
      const date = parseDate(event.eventDate)
      if (!date) continue
      const key = dateKey(date)
      grouped.set(key, [...(grouped.get(key) ?? []), event])
    }
    return grouped
  }, [events])

  function moveView(amount: number) {
    setViewDate((current) => {
      const next = new Date(current)
      if (mode === 'month') next.setMonth(next.getMonth() + amount, 1)
      else next.setDate(next.getDate() + amount * 7)
      return next
    })
  }

  const heading = mode === 'month'
    ? viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : `${weekStart(viewDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${new Date(weekStart(viewDate).getFullYear(), weekStart(viewDate).getMonth(), weekStart(viewDate).getDate() + 6).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <section aria-label="Events calendar" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" aria-label={`Previous ${mode}`} onClick={() => moveView(-1)} className="rounded-lg border border-border p-2 hover:bg-muted"><ChevronLeft className="size-5" /></button>
          <button type="button" aria-label={`Next ${mode}`} onClick={() => moveView(1)} className="rounded-lg border border-border p-2 hover:bg-muted"><ChevronRight className="size-5" /></button>
          <h2 className="min-w-44 text-xl font-semibold">{heading}</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="calendar-month">Jump to month and year</label>
          <input id="calendar-month" aria-label="Jump to month and year" type="month" value={`${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`} onChange={(event) => {
            const [year, month] = event.target.value.split('-').map(Number)
            if (year && month) setViewDate(new Date(year, month - 1, 1))
          }} className="rounded-lg border border-border bg-card px-3 py-2 text-foreground [color-scheme:dark]" />
          <div className="flex rounded-lg border border-border p-1"  aria-label="Calendar view" role="group">
            {(['month', 'week'] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={`rounded-md px-3 py-1.5 text-sm capitalize ${mode === value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{value}</button>)}
          </div>
        </div>
      </div>

      {loading && events.length === 0 && <p>Loading events…</p>}
      {!loading && events.length === 0 && <p className="rounded-xl border border-border p-5">No events found for these filters.</p>}

      <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="border-b border-border bg-card p-2 text-center text-xs font-semibold">{day}</div>)}
        {calendarDays.map((day) => {
          const dayEvents = eventsByDay.get(dateKey(day)) ?? []
          const outsideMonth = mode === 'month' && day.getMonth() !== viewDate.getMonth()
          return <div key={dateKey(day)} className={`min-h-28 border-b border-r border-border p-1.5 sm:min-h-36 sm:p-2 ${outsideMonth ? 'bg-muted/50 text-muted-foreground/50' : ''}`}>
            <time dateTime={dateKey(day)} className="mb-1 block text-right text-xs font-medium">{day.getDate()}</time>
            <ul className="space-y-1">
              {dayEvents.map((event) => <li key={event.id} className="rounded-md bg-primary/10 px-1.5 py-1 text-xs text-primary">
                <p className="truncate font-semibold" title={event.title}>{event.title}</p>
                <p>{parseDate(event.eventDate)?.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })}</p>
                <button type="button" onClick={() => void eventSignUp(event.id)} className="mt-0.5 underline">Sign up</button>
              </li>)}
            </ul>
          </div>
        })}
      </div>
    </section>
  )
}
