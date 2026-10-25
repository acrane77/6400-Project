import { createHash } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { requireAuth } from '@/core/auth'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'

export async function POST(request: Request): Promise<Response> {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const body = await request.json().catch(() => null)
  const token = body?.token

  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
    return Response.json(
      { success: false, error: 'Invalid invitation token' },
      { status: 400 }
    )
  }

  const tokenHash = createHash('sha256')
    .update(token)
    .digest('hex')

  const inviteRef = adminDb.collection('eventInvites').doc(tokenHash)

  try {

    const userRecord = await adminAuth.getUser(auth.uid)
    const user = {
      id: auth.uid,
      username: userRecord.displayName ?? '',
      email: userRecord.email ?? ''
    }

    const result = await adminDb.runTransaction(async (transaction) => {
      const inviteDoc = await transaction.get(inviteRef)

      if (!inviteDoc.exists) {
        return { status: 404, error: 'Invitation not found' }
      }

      const invite = inviteDoc.data()!

      if (
        typeof invite.expiresAt !== 'number' ||
        invite.expiresAt < Date.now()
      ) {
        return { status: 410, error: 'Invitation expired' }
      }

      const role = invite.role

      if (!['ORGANIZER', 'VOLUNTEER', 'PARTICIPANT'].includes(role)) {
        return { status: 400, error: 'Invalid invitation role' }
      }

      if (typeof invite.eventId !== 'string') {
        return { status: 400, error: 'Invalid event ID' }
      }

      const eventRef = adminDb.collection('events').doc(invite.eventId)
      const eventDoc = await transaction.get(eventRef)

      if (!eventDoc.exists) {
        return { status: 404, error: 'Event not found' }
      }

      // Assign the appropriate role
      switch (role) {
        case 'ORGANIZER':
          transaction.update(eventRef, {
            organizerIds: FieldValue.arrayUnion(auth.uid)
          })

          // Organizer invitations are single-use
          transaction.delete(inviteRef)
          break

        case 'VOLUNTEER': {
          const existing = eventDoc.get('volenteers')
          const volunteers = Array.isArray(existing) ? existing : []

          if (!volunteers.some(member => member?.id === auth.uid)) {
            transaction.update(eventRef, {
              volenteers: [...volunteers, user]
            })
          }
          break
        }

        case 'PARTICIPANT': {
          const existing = eventDoc.get('people')
          const participants = Array.isArray(existing) ? existing : []

          if (!participants.some(member => member?.id === auth.uid)) {
            transaction.update(eventRef, {
              people: [...participants, user]
            })
          }
          break
        }
      }

      return {
        status: 200,
        eventId: invite.eventId,
        role
      }
    })

    if (result.status !== 200) {
      return Response.json(
        { success: false, error: result.error },
        { status: result.status }
      )
    }

    return Response.json({
      success: true,
      body: {
        eventId: result.eventId,
        role: result.role
      }
    })

  } catch (error) {
    console.error('Invitation acceptance failed:', error)

    return Response.json(
      { success: false, error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
