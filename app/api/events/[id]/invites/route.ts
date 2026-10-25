import { randomBytes, createHash } from 'node:crypto'
import { requireAuth } from '@/core/auth'
import { adminDb } from '@/lib/firebaseAdmin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {

  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const { role } = await request.json().catch(() => ({}))

  const validRoles = ['ORGANIZER', 'VOLUNTEER', 'PARTICIPANT']

  if (!validRoles.includes(role)) {
    return Response.json(
      { error: 'Invalid invitation role' },
      { status: 400 }
    )
  }

  const { id } = await params

  const eventRef = adminDb.collection('events').doc(id)
  const event = await eventRef.get()

  if (!event.exists) {
    return Response.json(
      { error: 'Event not found' },
      { status: 404 }
    )
  }

  // Check that the user is an organizer
  const organizers = event.get('organizerIds') ?? []

  if (
    event.get('ownerId') !== auth.uid &&
    !organizers.includes(auth.uid)
  ) {
    return Response.json(
      { error: 'Only organizers can generate invitations' },
      { status: 403 }
    )
  }

  // Create invitation token
  const token = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256')
    .update(token)
    .digest('hex')

  // Store the invitation
  await adminDb.collection('eventInvites').doc(tokenHash).set({
    eventId: id,
    role,
    createdBy: auth.uid,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
  })

  // Generate the invitation URL
  const inviteUrl = new URL(`/events/invite/${token}`, request.url).toString()

  return Response.json({
    success: true,
    body: {
      inviteUrl
    }
  })
}
