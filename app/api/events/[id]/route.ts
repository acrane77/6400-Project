import { EventRepositoryImpl } from "@/features/events/data/repositories/eventRepositoryImpl";
import { EventApiClient } from "@/features/events/domain/api/EventApi";
import { DeleteEvent } from "@/features/events/domain/usecases/deleteEvent";

const repo = new EventRepositoryImpl(new EventApiClient());

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const usecase = new DeleteEvent(repo);
  return usecase.execute(new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify({ id }),
  }));
}
