import { EventRepositoryImpl } from "../../data/repositories/eventRepositoryImpl";


export class GetEvents {

    private repo: EventRepositoryImpl;

    constructor(repo: EventRepositoryImpl) {this.repo = repo}

    async execute(request: Request): Promise<Response> {
        return this.repo.getEvents();
    }
}