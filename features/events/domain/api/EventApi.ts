import type { EventItem } from '@/features/events/data/models/event'
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { AuthUser } from '@/core/auth'

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

  async getEvents(): Promise<Response> {
    try {
      const snapshot = await adminDb.collection('events').get();

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
       if (event.get('ownerId') !== requester.uid && requester.role !== 'DEVELOPER') {
         return NextResponse.json({ success: false, error: 'You are not allowed to delete this event.' }, { status: 403 });
       }
       await eventRef.delete();
       return NextResponse.json({success: true, body:{}}, {status: 200})
    } catch (error:any) {
      return NextResponse.json({error: (error as Error).message}, {status: 500});
    }

  }
}
