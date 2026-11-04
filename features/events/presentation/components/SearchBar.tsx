'use client'

import { useState, type FormEvent } from 'react'
import { useEvents } from '../contexts/eventsContext'

const inputClassName = 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100'

export function SearchBar() {
  const { updateSearchParams, loading } = useEvents()
  const [keywords, setKeywords] = useState('')
  const [minDate, setMinDate] = useState('')
  const [maxDate, setMaxDate] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await updateSearchParams({
      keywords: keywords.trim() ? [keywords.trim()] : [],
      dateRange: minDate || maxDate ? { min: minDate, max: maxDate } : undefined,
    })
  }

  async function clearFilters() {
    setKeywords('')
    setMinDate('')
    setMaxDate('')
    await updateSearchParams({})
  }

  return (
    <form className="mb-8 space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="event-search">Search events</label>
        <input
          id="event-search"
          className={`${inputClassName} flex-1 rounded-full px-5`}
          value={keywords}
          onChange={(event) => setKeywords(event.target.value)}
          placeholder="Search events by keyword..."
          type="search"
        />
        <button
          className="rounded-full bg-blue-700 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          Search
        </button>
      </div>

      <fieldset className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
        <legend className="px-2 text-sm font-semibold">Filter events</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="event-date-from">Date from</label>
            <input
              id="event-date-from"
              className={inputClassName}
              type="date"
              value={minDate}
              max={maxDate || undefined}
              onChange={(event) => setMinDate(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="event-date-to">Date to</label>
            <input
              id="event-date-to"
              className={inputClassName}
              type="date"
              value={maxDate}
              min={minDate || undefined}
              onChange={(event) => setMaxDate(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <button
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            type="button"
            onClick={() => void clearFilters()}
            disabled={loading}
          >
            Clear
          </button>
          <button
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            type="submit"
            disabled={loading}
          >
            Apply filters
          </button>
        </div>
      </fieldset>
    </form>
  )
}
