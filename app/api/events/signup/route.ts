
import { EventRepositoryImpl } from "@/features/events/data/repositories/eventRepositoryImpl"
import { EventApiClient } from "@/features/events/domain/api/EventApi"
import { EventSignUp } from "@/features/events/domain/usecases/EventSignUp"

const repo = new EventRepositoryImpl( new EventApiClient());

export async function POST(request: Request): Promise<Response> {
  const usecase = new EventSignUp(repo)
  return usecase.execute(request)
}
