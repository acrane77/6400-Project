import { requireAuth } from '@/core/auth'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'

type EventRole = 'ORGANIZER' | 'VOLUNTEER' | 'PARTICIPANT'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const { id } = await params

  try {
    const eventDoc = await adminDb.collection('events').doc(id).get()

    if (!eventDoc.exists) {
      return Response.json({ error: 'Event not found' }, { status: 404 })
    }

    const event = eventDoc.data()!

    const organizerIds: string[] = Array.isArray(event.organizerIds)
      ? event.organizerIds
      : []

    // Only event organizers can view the member list
    if (event.ownerId !== auth.uid && !organizerIds.includes(auth.uid)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const members = new Map<string, {
      id: string
      username: string
      email: string
      roles: Set<EventRole>
      isOwner: boolean
    }>()

    function addMember(
      id: string,
      role: EventRole,
      username = '',
      email = ''
    ) {
      if (!id) return

      const member = members.get(id) ?? {
        id,
        username,
        email,
        roles: new Set<EventRole>(),
        isOwner: id === event.ownerId
      }

      member.roles.add(role)
      members.set(id, member)
    }

    addMember(event.ownerId, 'ORGANIZER')

    for (const uid of organizerIds) {
      addMember(uid, 'ORGANIZER')
    }

    for (const user of event.volenteers ?? []) {
      addMember(user.id, 'VOLUNTEER', user.username, user.email)
    }

    for (const user of event.people ?? []) {
      addMember(user.id, 'PARTICIPANT', user.username, user.email)
    }

    // Retrieve usernames and emails from Firebase
    const result = await Promise.all(
      Array.from(members.values()).map(async (member) => {
        try {
          const user = await adminAuth.getUser(member.id)
          member.username = user.displayName || member.username
          member.email = user.email || member.email
        } catch {
          // Empty to keep existing info if a lookup fails
        }

        return {
          ...member,
          roles: Array.from(member.roles)
        }
      })
    )

    return Response.json({
      success: true,
      body: { members: result }
    })

  } catch (error) {
    console.error(error)

    return Response.json(
      { error: 'Failed to retrieve members' },
      { status: 500 }
    )
  }
}
