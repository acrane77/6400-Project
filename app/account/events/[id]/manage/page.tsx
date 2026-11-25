'use client'

import { useMemo, useState } from 'react'
import MatrixDisplay from '@/app/events/invite/qr_code/MatrixDisplay'
import { generate } from '@/app/events/invite/qr_code/qrcode'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import APIFetch from '@/core/APIFetch'
import { useAccount } from '@/features/Account/presentation/contexts/AccountContext'
import EventMembers from '@/features/events/presentation/components/EventMembers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PosterManager from '@/features/analytics/presentation/components/PosterManager'

type EventRole = 'ORGANIZER' | 'VOLUNTEER' | 'PARTICIPANT'

export default function ManageEventPage() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthLoading } = useAccount()

  const [role, setRole] = useState<EventRole>('PARTICIPANT')
  const [inviteUrl, setInviteUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const matrix = useMemo(() => {
    if (!inviteUrl) return null
    try {
      return generate(inviteUrl)
    } catch {
      return null
    }
  }, [inviteUrl])

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
    <main className="mx-auto w-full max-w-5xl px-6 py-10">

      <h1 className="mb-8 text-3xl font-bold">
        Manage Event
      </h1>
	  <EventMembers eventId={id} />
      <PosterManager eventId={id} />

      <section className="rounded-lg border border-border bg-card p-6">

        <h2 className="mb-4 text-xl font-semibold">
          Invite People
        </h2>

        <p className="mb-6 text-sm text-muted-foreground">
          Generate an invitation link to add someone to your event.
        </p>

        <div className="flex flex-col gap-4">

          <Label htmlFor="role" className="text-sm">
            Invitation Role
          </Label>

          <select
            id="role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as EventRole)
              setInviteUrl('')
              setMessage('')
            }}
            className="h-11 w-full rounded-none border border-border bg-background px-3 text-base text-foreground outline-none focus-visible:border-ring
                        focus-visible:ring-1 [color-scheme:dark]"
          >
            <option value="ORGANIZER">Organizer</option>
            <option value="VOLUNTEER">Volunteer</option>
            <option value="PARTICIPANT">Participant</option>
          </select>

          <Button
            onClick={generateInvite}
            disabled={loading}
            className="h-11 w-full rounded-none text-base"
          >
            {loading ? 'Generating...' : 'Generate Invitation Link'}
          </Button>

          {error && (
            <p className="text-sm text-destructive" role="alert">{error}</p>
          )}
          {inviteUrl && (
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-6">

              {matrix && (
                <div className="mx-auto aspect-square w-full max-w-[400px] overflow-hidden rounded-md border border-border">
                  <MatrixDisplay matrix={matrix} border={4} />
                </div>
              )}

              <Label htmlFor="invite-link" className="text-sm">
                Invitation Link
              </Label>

              <Input
                id="invite-link"
                type="text"
                readOnly
                value={inviteUrl}
                className="h-11 rounded-none border-border bg-background px-3 text-base md:text-base"
              />

              <Button
                onClick={copyInvite}
                variant="outline"
                className="h-11 rounded-none text-base"
              >
                Copy Link
              </Button>

              {message && (
                <p className="text-sm text-primary" role="status">
                  {message}
                </p>
              )}

            </div>
          )}

        </div>
      </section>

      <Link
        href="/account/events/my-events"
        className="mt-8 inline-block text-sm font-medium text-primary hover:underline"
      >
        Back to My Events
      </Link>

    </main>
  )
}
