'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAccount } from '@/features/Account/presentation/contexts/AccountContext'
import APIFetch from '@/core/APIFetch'

type Invitation = {
  eventId: string
  title: string
  role: 'ORGANIZER' | 'VOLUNTEER' | 'PARTICIPANT'
}

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>()
  const { user, isAuthLoading } = useAccount()

  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Load invitation details
  useEffect(() => {
    let active = true

    async function loadInvitation() {
      try {
        const response = await fetch(
          `/api/events/invites/${token}`,
          { cache: 'no-store' }
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Invalid invitation')
        }

        if (active) {
          setInvitation(result.body)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Something went wrong'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadInvitation()

    return () => {
      active = false
    }
  }, [token])

  // Accept invitation
  async function acceptInvitation() {
    if (!user || !invitation) return

    setSubmitting(true)
    setError('')

    try {
      const response = await APIFetch(
        'POST',
        '/api/events/invites/accept',
        { token }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to accept invitation')
      }

      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || isAuthLoading) {
    return <p className="p-6">Loading invitation...</p>
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center gap-6 p-10">

      <h1 className="text-3xl font-bold">
        Event Invitation
      </h1>

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {invitation && (
        <>
          <h2 className="text-2xl font-semibold">
            {invitation.title}
          </h2>

          <p>
            You've been invited to join this event as a{' '}
            <strong>{invitation.role.toLowerCase()}</strong>.
          </p>

          {success ? (
            <>
              <p className="text-green-500">
                Invitation accepted successfully!
              </p>

              <Link
                href="/events"
                className="rounded-lg bg-blue-600 px-6 py-2 text-white"
              >
                View Events
              </Link>
            </>
          ) : !user ? (
            <>
              <p>You must log in or create an account to join.</p>

              <div className="flex gap-4">
                <Link
                  href="/account/login"
                  target="_blank"
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white"
                >
                  Log In
                </Link>

                <Link
                  href="/account/signup"
                  target="_blank"
                  className="rounded-lg border px-6 py-2"
                >
                  Sign Up
                </Link>
              </div>

              <p className="text-sm text-zinc-500">
                Sign in using the new tab, then return here to accept.
              </p>
            </>
          ) : (
            <>
              <p>
                Joining as <strong>{user.username}</strong>
              </p>

              <button
                onClick={acceptInvitation}
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white disabled:opacity-50"
              >
                {submitting ? 'Accepting...' : 'Accept Invitation'}
              </button>
            </>
          )}
        </>
      )}

    </main>
  )
}
