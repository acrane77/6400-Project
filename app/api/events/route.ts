

// export async function GET(): Promise<Response> {
//   return getEventsResponse()

import { EventRepositoryImpl } from "@/features/events/data/repositories/eventRepositoryImpl"
import { EventApiClient } from "@/features/events/domain/api/EventApi"
import { CreateEvent } from "@/features/events/domain/usecases/createEvent"
import { GetEvents } from "@/features/events/domain/usecases/getEvents";

// }
const repo = new EventRepositoryImpl(new EventApiClient)

export async function POST(request: Request): Promise<Response> {
  const usecase = new CreateEvent(repo);
  return usecase.execute(request)
}

export async function GET(request: Request): Promise<Response> {
  const usecase = new GetEvents(repo);
  return usecase.execute(request);
}
