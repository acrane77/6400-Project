import { EventRepositoryImpl } from "../../data/repositories/eventRepositoryImpl";
import { requireAuth } from '@/core/auth'
import type { SearchParams } from '../../data/models/SearchParams'

export class GetEvents {

    private repo: EventRepositoryImpl;

    constructor(repo: EventRepositoryImpl) {this.repo = repo}

    async execute(request: Request): Promise<Response> {
        const auth = await requireAuth(request);
        if (auth instanceof Response) return auth;
        const { searchParams } = new URL(request.url);
        const params: SearchParams = {};

        const keywords = [...searchParams.getAll('keywords'), ...searchParams.getAll('Keywords')].filter(Boolean);
        if (keywords.length > 0) params.keywords = keywords;

        const minDate = searchParams.get('dateRange[min]') ?? searchParams.get('DateRange[min]');
        const maxDate = searchParams.get('dateRange[max]') ?? searchParams.get('DateRange[max]');
        if (minDate || maxDate) {
            params.dateRange = {
                ...(minDate ? { min: minDate } : {}),
                ...(maxDate ? { max: maxDate } : {}),
            };
        }

        return this.repo.getEvents(params);
    }
}
