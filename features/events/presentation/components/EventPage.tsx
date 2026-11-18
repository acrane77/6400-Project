'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEvents } from '../contexts/eventsContext'
import { EventCalendar } from './EventCalendar';
import { SearchBar } from './SearchBar';
import { Calendar, List } from 'lucide-react';
import { EventList } from './EventList';

type ViewMode = 'Calendar' | 'List';



export function EventPage() {
  const { events, loading, eventSignUp, dateRange } = useEvents()
  const [mode, setMode] = useState<ViewMode>('Calendar')
  const [viewDate, setViewDate] = useState(() => new Date())

  return (
    <div>
    <SearchBar/>
    <section aria-label="Events calendar" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* <button type="button" aria-label={`Previous ${mode}`} onClick={() => moveView(-1)} className="rounded-lg border border-zinc-300 p-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><ChevronLeft className="size-5" /></button> */}
          {/* <button type="button" aria-label={`Next ${mode}`} onClick={() => moveView(1)} className="rounded-lg border border-zinc-300 p-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"><ChevronRight className="size-5" /></button> */}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-300 p-1 dark:border-zinc-700" aria-label="Event view" role="group">
            {(['Calendar', 'List'] as const).map((value) => (
              <button 
                key={value}
                type="button" 
                aria-pressed={mode === value} 
                onClick={() => setMode(value)} 
                className={`rounded-md px-3 py-1.5 text-sm capitalize ${mode === value ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                
                {value == 'Calendar' && <Calendar size={20}/>}
                {value == 'List' && <List size={20}/>}
              </button>
              ))}
          </div>
        </div>
      </div>

      {loading && events.length === 0 && <p>Loading events…</p>}
      {!loading && events.length === 0 && <p className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">No events found for these filters.</p>}
      {mode == 'Calendar' && <EventCalendar/>}
      {mode == 'List' && <EventList/>}
    </section>
    </div>
  )
}