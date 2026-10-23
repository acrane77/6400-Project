import { EventRepositoryImpl } from "../../data/repositories/eventRepositoryImpl";


export class GetMyEvents {

    private repo: EventRepositoryImpl;

    constructor(repo: EventRepositoryImpl) {this.repo = repo}

    async execute(request: Request): Promise<Response> {
        return this.repo.getMyEvents();
    }
}