import type { EventItem } from '@/features/events/data/models/event'
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import type { User } from '@/features/Account/data/models/user';
import { AuthUser } from '@/core/auth'
import type { SearchParams } from '@/features/events/data/models/SearchParams'

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
      // Event dates are stored as ISO strings; compare from the start of today
      // so date-only events scheduled for today remain in the upcoming list.
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      const snapshot = await adminDb
        .collection('events')
        .where('eventDate', '>=', params.DateRange?.min ? params.DateRange.min: today.toISOString())
        .where('eventDate', '<=', params.DateRange?.max)
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
