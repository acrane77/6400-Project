'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import APIFetch from '@/core/APIFetch'
import { useAccount } from '@/features/Account/presentation/contexts/AccountContext'
import type { PublicEvent } from '@/features/events/data/models/publicEvent'

export default function PublicEventPage() {
    const { id } = useParams<{ id: string }>()
    const { user, isAuthLoading } = useAccount()

    const [event, setEvent] = useState<PublicEvent | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [signingUp, setSigningUp] = useState(false)
    const [signUpError, setSignUpError] = useState('')
    const [signedUp, setSignedUp] = useState(false)

    useEffect(() => {
        let active = true

        async function loadEvent() {
            try {
                const response = await fetch(`/api/events/${encodeURIComponent(id)}`, { cache: 'no-store' })
                const result = await response.json()
                if (!response.ok) throw new Error(result.error || 'Event not found')
                if (active) setEvent(result.body)
            } catch (err) {
                if (active) setError(err instanceof Error ? err.message : 'Something went wrong')
            } finally {
                if (active) setLoading(false)
            }
        }

        void loadEvent()
        return () => { active = false }
    }, [id])

    async function signUp() {
        if (!user || !event) return
        setSigningUp(true)
        setSignUpError('')
        try {
            const response = await APIFetch('POST', '/api/events/signup', { eventId: event.id, user })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error || 'Could not sign up')
            setSignedUp(true)
            setEvent((current) =>
                current && current.spotsLeft !== null ? { ...current, spotsLeft: current.spotsLeft - 1 } : current
            )
        } catch (err) {
            setSignUpError(err instanceof Error ? err.message : 'Could not sign up')
        } finally {
            setSigningUp(false)
        }
    }

    if (loading) {
        return <p className="p-6">Loading event...</p>
    }

    if (error || !event) {
        return (
            <main className="mx-auto max-w-2xl p-8">
                <p className="text-red-500">{error || 'Event not found'}</p>
                <Link href="/events" className="mt-4 inline-block text-blue-500 hover:underline">
                    Browse events
                </Link>
            </main>
        )
    }

    const date = new Date(event.eventDate)
    const location = [event.locationDetails, event.room, event.address, event.atMun ? 'Memorial University' : null]
        .filter(Boolean)
        .join(' · ')
    const returnPath = encodeURIComponent(`/events/${event.id}`)
    const isFull = event.spotsLeft === 0

    return (
        <main className="mx-auto flex max-w-2xl flex-col gap-6 p-8">
            <div>
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    {Number.isNaN(date.getTime())
                        ? 'Date to be announced'
                        : date.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short', timeZone: 'UTC' })}
                </p>
                {location && <p className="mt-1 text-sm text-zinc-500">{location}</p>}
            </div>

            <p className="whitespace-pre-wrap">{event.description}</p>

            <div className="flex flex-wrap gap-4 text-sm">
                {event.fee !== null && event.fee > 0 && <span>Fee: ${event.fee.toFixed(2)}</span>}
                {event.spotsLeft !== null && (
                    <span>{isFull ? 'No spots left' : `${event.spotsLeft} of ${event.capacity} spots left`}</span>
                )}
            </div>

            <section className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-700">
                {signedUp ? (
                    <p className="text-green-500">You&apos;re signed up! See you there.</p>
                ) : isAuthLoading ? (
                    <p className="text-zinc-500">Checking your account...</p>
                ) : !user ? (
                    <div className="flex flex-col gap-4">
                        <p>Log in or create an account to sign up.</p>
                        <div className="flex gap-4">
                            <Link href={`/account/login?next=${returnPath}`} className="rounded-lg bg-blue-600 px-6 py-2 text-white">
                                Log In
                            </Link>
                            <Link href={`/account/signup?next=${returnPath}`} className="rounded-lg border px-6 py-2">
                                Sign Up
                            </Link>
                        </div>
                    </div>
                ) : isFull ? (
                    <p>This event is full.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p>
                            Signing up as <strong>{user.username || user.email}</strong>
                        </p>
                        <button
                            type="button"
                            onClick={signUp}
                            disabled={signingUp}
                            className="self-start rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {signingUp ? 'Signing up...' : 'Sign up for this event'}
                        </button>
                    </div>
                )}
                {signUpError && <p className="mt-3 text-red-500">{signUpError}</p>}
            </section>
        </main>
    )
}
