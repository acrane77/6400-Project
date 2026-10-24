

// export async function GET(): Promise<Response> {
//   return getEventsResponse()

import { EventRepositoryImpl } from "@/features/events/data/repositories/eventRepositoryImpl"
import { EventApiClient } from "@/features/events/domain/api/EventApi"
import { GetMyEvents } from "@/features/events/domain/usecases/getMyEvents";

// }
const repo = new EventRepositoryImpl(new EventApiClient)

export async function GET(request: Request): Promise<Response> {
  const usecase = new GetMyEvents(repo);
  return usecase.execute(request);
}
