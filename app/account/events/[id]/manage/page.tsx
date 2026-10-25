'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import APIFetch from '@/core/APIFetch'
import { useAccount } from '@/features/Account/presentation/contexts/AccountContext'

type EventRole = 'ORGANIZER' | 'VOLUNTEER' | 'PARTICIPANT'

export default function ManageEventPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthLoading } = useAccount()

  const [role, setRole] = useState<EventRole>('PARTICIPANT')
  const [inviteUrl, setInviteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function generateInvite() {
    setLoading(true)
    setError('')
    setMessage('')
    setInviteUrl('')

    try {
      const response = await APIFetch(
        'POST',
        `/api/events/${id}/invites`,
        { role }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate invitation')
      }

      setInviteUrl(result.body.inviteUrl)

    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setMessage('Invitation link copied!')
    } catch {
      setError('Could not copy link. Please copy it manually.')
    }
  }

  if (isAuthLoading) {
    return <p className="p-6">Loading...</p>
  }

  if (!user) {
    return (
      <main className="p-6">
        <p>You must be logged in to manage events.</p>
        <Link href="/account/login" className="text-blue-500">
          Log in
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl p-8">

      <h1 className="mb-8 text-3xl font-bold">
        Manage Event
      </h1>

      <section className="rounded-xl border border-zinc-700 p-6">

        <h2 className="mb-4 text-xl font-semibold">
          Invite People
        </h2>

        <p className="mb-6 text-zinc-500">
          Generate an invitation link to add someone to your event.
        </p>

        <div className="flex flex-col gap-4">

          <label htmlFor="role">
            Invitation Role
          </label>

          <select
            id="role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as EventRole)
              setInviteUrl('')
              setMessage('')
            }}
            className="rounded-lg border border-zinc-600 bg-zinc-900 p-3 text-white"
          >
            <option value="ORGANIZER">Organizer</option>
            <option value="VOLUNTEER">Volunteer</option>
            <option value="PARTICIPANT">Participant</option>
          </select>

          <button
            onClick={generateInvite}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Invitation Link'}
          </button>

          {error && (
            <p className="text-red-500">{error}</p>
          )}

          {inviteUrl && (
            <div className="mt-4 flex flex-col gap-3">

              <label className="font-semibold">
                Invitation Link
              </label>

              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="w-full rounded-lg border border-zinc-600 bg-transparent p-3"
              />

              <button
                onClick={copyInvite}
                className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800"
              >
                Copy Link
              </button>

              {message && (
                <p className="text-green-500">{message}</p>
              )}

            </div>
          )}

        </div>
      </section>

      <Link
        href="/account/events/my-events"
        className="mt-8 inline-block text-blue-500 hover:underline"
      >
        Back to My Events
      </Link>

    </main>
  )
}
