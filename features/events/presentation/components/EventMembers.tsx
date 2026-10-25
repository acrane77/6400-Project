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
    <section className="mb-8 rounded-xl border border-zinc-700 p-6">
      <h2 className="mb-4 text-xl font-semibold">
        People ({members.length})
      </h2>

      {loading && <p>Loading members...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>

            <tbody>
              {members.map(member => (
                <tr key={member.id} className="border-b border-zinc-700">
                  <td className="p-3">{member.username}</td>
                  <td className="p-3">{member.email}</td>
                  <td className="p-3">
                    {member.roles.join(', ')}
                    {member.isOwner && ' (Owner)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {members.length === 0 && <p>No members found.</p>}
        </div>
      )}
    </section>
  )
}
