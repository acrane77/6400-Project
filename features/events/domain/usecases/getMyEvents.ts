import { EventRepositoryImpl } from "../../data/repositories/eventRepositoryImpl";
import { adminAuth } from "@/lib/firebaseAdmin";


export class GetMyEvents {

    private repo: EventRepositoryImpl;

    constructor(repo: EventRepositoryImpl) {this.repo = repo}

    async execute(request: Request): Promise<Response> {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return Response.json({ success: false, error: 'Unauthorized: Missing token.' }, { status: 401 })
        }

        try {
            const decodedToken = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length))
            return this.repo.getMyEvents(decodedToken.uid)
        } catch {
            return Response.json({ success: false, error: 'Unauthorized: Invalid token.' }, { status: 401 })
        }
    }
}
