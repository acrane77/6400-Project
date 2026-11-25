'use client'

import { useEffect, useState } from 'react'
import APIFetch from '@/core/APIFetch'

type Member = {
  id: string
  username: string
  email: string
  roles: string[]
  isOwner: boolean
}

export default function EventMembers({ eventId }: { eventId: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadMembers() {
      setLoading(true)
      setError('')

      try {
        const response = await APIFetch(
          'GET',
          `/api/events/${eventId}/members`,
          {}
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to load members')
        }

        if (active) setMembers(result.body.members)

      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadMembers()

    return () => { active = false }
  }, [eventId])

  return (
    <section className="mb-8 rounded-lg border border-border bg-card p-6">
  
      <h2 className="mb-5 text-xl font-semibold">
        People ({members.length})
      </h2>
  
      {loading && (
        <p className="text-sm text-muted-foreground">
          Loading members...
        </p>
      )}
  
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
  
      {!loading && !error && (
        <div className="overflow-x-auto">
  
          <table className="w-full text-left text-sm">
  
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-3 py-3 font-medium">Username</th>
                <th className="px-3 py-3 font-medium">Email</th>
                <th className="px-3 py-3 font-medium">Role</th>
              </tr>
            </thead>
  
            <tbody className="divide-y divide-border">
              {members.map(member => (
                <tr
                  key={member.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="p-3 font-medium text-foreground">
                    {member.username}
                  </td>
  
                  <td className="p-3 text-muted-foreground">
                    {member.email}
                  </td>
  
                  <td className="p-3">
                    <span className="text-sm text-primary">
                      {member.roles.join(', ')}
                    </span>
  
                    {member.isOwner && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Owner)
                      </span>
                    )}
                  </td>
  
                </tr>
              ))}
            </tbody>
  
          </table>
  
          {members.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No members found.
            </p>
          )}
  
        </div>
      )}
  
    </section>
  )
}
