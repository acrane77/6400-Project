import { createHash } from 'node:crypto'
import { adminDb } from '@/lib/firebaseAdmin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<Response> {

  const { token } = await params

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return Response.json(
      { success: false, error: 'Invalid invitation' },
      { status: 400 }
    )
  }

  const tokenHash = createHash('sha256')
    .update(token)
    .digest('hex')

  const inviteDoc = await adminDb
    .collection('eventInvites')
    .doc(tokenHash)
    .get()

  if (!inviteDoc.exists) {
    return Response.json(
      { success: false, error: 'Invitation not found' },
      { status: 404 }
    )
  }

  const invite = inviteDoc.data()!

  if (
    typeof invite.expiresAt !== 'number' ||
    invite.expiresAt < Date.now()
  ) {
    return Response.json(
      { success: false, error: 'Invitation expired' },
      { status: 410 }
    )
  }

  if (
    !['ORGANIZER', 'VOLUNTEER', 'PARTICIPANT'].includes(invite.role) ||
    typeof invite.eventId !== 'string'
  ) {
    return Response.json(
      { success: false, error: 'Invalid invitation' },
      { status: 400 }
    )
  }

  const eventDoc = await adminDb
    .collection('events')
    .doc(invite.eventId)
    .get()

  if (!eventDoc.exists) {
    return Response.json(
      { success: false, error: 'Event not found' },
      { status: 404 }
    )
  }

  return Response.json({
    success: true,
    body: {
      eventId: invite.eventId,
      title: eventDoc.get('title'),
      role: invite.role
    }
  }, {
    headers: { 'Cache-Control': 'no-store' }
  })
}
