

// export async function GET(): Promise<Response> {
//   return getEventsResponse()

import { EventRepositoryImpl } from "@/features/events/data/repositories/eventRepositoryImpl"
import { EventApiClient } from "@/features/events/domain/api/EventApi"
import { CreateEvent } from "@/features/events/domain/usecases/createEvent"
import { GetEvents } from "@/features/events/domain/usecases/getEvents";
import { requireAuth } from '@/core/auth'
import { adminDb } from '@/lib/firebaseAdmin'

// }
const repo = new EventRepositoryImpl(new EventApiClient)

export async function POST(request: Request): Promise<Response> {
  const usecase = new CreateEvent(repo);
  return usecase.execute(request)
}

export async function GET(request: Request): Promise<Response> {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  try {
    const snapshot = await adminDb.collection('events').get()

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const events = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(event => {
        const belongsToUser =
          event.ownerId === auth.uid ||
          event.organizerIds?.includes(auth.uid) ||
          event.people?.some((user: { id: string }) =>
            user.id === auth.uid
          ) ||
          event.volenteers?.some((user: { id: string }) =>
            user.id === auth.uid
          )

        return belongsToUser
      })
      .filter(event =>
        new Date(event.eventDate).getTime() >= today.getTime()
      )
      .sort((a, b) =>
        new Date(a.eventDate).getTime() -
        new Date(b.eventDate).getTime()
      )

    return Response.json({
      success: true,
      body: events
    })

  } catch (error) {
    console.error(error)

    return Response.json(
      { success: false, error: 'Failed to retrieve events' },
      { status: 500 }
    )
  }
}
