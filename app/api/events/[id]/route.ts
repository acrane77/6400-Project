import { EventRepositoryImpl } from "@/features/events/data/repositories/eventRepositoryImpl";
import { EventApiClient } from "@/features/events/domain/api/EventApi";
import { DeleteEvent } from "@/features/events/domain/usecases/deleteEvent";
import { adminDb } from "@/lib/firebaseAdmin";

const repo = new EventRepositoryImpl(new EventApiClient());

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
	const { id } = await params;
	const usecase = new DeleteEvent(repo);
	return usecase.execute(new Request(request.url, {
		method: request.method,
		headers: request.headers,
		body: JSON.stringify({ id }),
	}));
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
	const { id } = await params;
	try {
		const doc = await adminDb.collection("events").doc(id).get();
		if (!doc.exists) {
			return Response.json({ success: false, error: "Event not found" }, { status: 404 });
		}

		const event = doc.data()!;
		const signedup = Array.isArray(event.people) ? event.people.length : 0;
		const capacity = typeof event.capacity === "number" ? event.capacity : null;

		return Response.json({
			success: true,
			body: {
				id: doc.id,
				title: event.title,
				description: event.description,
				eventDate: event.eventDate,
				atMun: event.atMun === true,
				address: event.address ?? null,
				room: event.room ?? null,
				locationDetails: event.locationDetails ?? null,
				fee: typeof event.fee === "number" ? event.fee : null,
				capacity,
				spotsLeft: capacity === null ? null : Math.max(0, capacity-signedup),
			},
		});
	}
	catch (error) {
		console.error(error);
		return Response.json({ success: false, error: "Failed to load"}, {status: 500});
	}
}
