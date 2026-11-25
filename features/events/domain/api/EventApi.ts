import type { EventItem } from '@/features/events/data/models/event'
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import type { User } from '@/features/Account/data/models/user';
import { AuthUser } from '@/core/auth'
import type { SearchParams } from '@/features/events/data/models/SearchParams'
import { getCategoryDescendants } from '@/features/events/data/models/categories'
import type { Query } from 'firebase-admin/firestore'


export class EventApiClient {
  async createEvent(body: any): Promise<Response> {
    try {

      const createdAt = new Date().toISOString();

      const docRef = await adminDb.collection("events").add({
      ...body,
      createdAt: createdAt
    }
  )
     return NextResponse.json({ success: true, body:{...body, createdAt: createdAt, id: docRef.id}}, { status: 200 });
    } catch (error:any){
       return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
  }

  async getEvents(params: SearchParams): Promise<Response> {
    try {
      // Use today as the default lower bound, but allow an explicit date filter
      // to include older events in the calendar.
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      const maxDate = params.dateRange?.max
      const inclusiveMaxDate = maxDate && /^\d{4}-\d{2}-\d{2}$/.test(maxDate)
        ? `${maxDate}T23:59:59.999Z`
        : maxDate
      let query: Query = adminDb
        .collection('events')
      if (params.category) {
        query = query.where('category', 'in', getCategoryDescendants(params.category))
      }
      if (params.dateRange?.min || !params.dateRange?.max) {
        query = query.where('eventDate', '>=', params.dateRange?.min || today.toISOString())
      }

      if (inclusiveMaxDate) {
        query = query.where('eventDate', '<=', inclusiveMaxDate)
      }

      const snapshot = await query.orderBy('eventDate', 'asc').get()

      const keywords = (params.keywords ?? [])
        .flatMap((keyword) => keyword.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])

      const allEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EventItem))

      const events = allEvents.filter((event) => {
        if (keywords.length > 0) {
          const searchableText = `${event.title ?? ''} ${event.description ?? ''}`.toLocaleLowerCase()
          if (!keywords.every((keyword) => searchableText.includes(keyword))) return false
        }

        return true
      })

      return NextResponse.json({ success: true, body: events }, {status: 200})

    } catch (error) {
      return NextResponse.json({error: (error as Error).message }, {status: 500});
    }
  }


  async getMyEvents(ownerId: string): Promise<Response> {
    try {
      const snapshot = await adminDb
        .collection('events')
        .where('ownerId', '==', ownerId)
        .orderBy('eventDate', 'asc')
        .get()

      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return NextResponse.json({ success: true, body: events}, {status: 200})

    } catch (error) {
      return NextResponse.json({error: (error as Error).message }, {status: 500});
    }
  }

  async deleteEvent(id: string, requester: AuthUser): Promise<Response> {
    try {
       const eventRef = adminDb.collection('events').doc(id);
       const event = await eventRef.get();
       if (!event.exists) {
         return NextResponse.json({ success: false, error: 'Event not found.' }, { status: 404 });
       }
       if (event.get('ownerId') !== requester.uid) {
         return NextResponse.json({ success: false, error: 'You are not allowed to delete this event.' }, { status: 403 });
       }
       await eventRef.delete();
       return NextResponse.json({success: true, body:{}}, {status: 200})
    } catch (error:any) {
      return NextResponse.json({error: (error as Error).message}, {status: 500});
    }

  }

  async eventSignUp(eventId: string, user: User): Promise<Response> {
    try {
      const eventRef = adminDb.collection('events').doc(eventId)
      const result = await adminDb.runTransaction(async (transaction) => {
        const eventSnapshot = await transaction.get(eventRef)
        if (!eventSnapshot.exists) return { error: 'Event not found.', status: 404 as const }

        const event = eventSnapshot.data()!
        const people = Array.isArray(event.people) ? event.people as User[] : []
        if (people.some((person) => person?.id === user.id)) {
          return { error: 'You are already signed up for this event.', status: 409 as const }
        }

        const capacity = typeof event.capacity === 'number' ? event.capacity : undefined
        if (capacity !== undefined && people.length >= capacity) {
          return { error: 'This event is full.', status: 409 as const }
        }

        transaction.update(eventRef, { people: [...people, user] })
        return { event: { id: eventSnapshot.id, ...event, people: [...people, user] } }
      })

      if ('error' in result) {
        return NextResponse.json({ success: false, error: result.error }, { status: result.status })
      }
      return NextResponse.json({ success: true, body: result.event }, { status: 200 })
    } catch (error:any){
       return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
  }
}
