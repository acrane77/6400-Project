
import { clientAuth } from "@/lib/firebase";

type Method = "POST" | "GET" | "DELETE" | "PUT" | "PATCH" | "HEAD";

export default async function APIFetch(method: Method, route: string, body: any):Promise<Response> {

    const token = await clientAuth.currentUser?.getIdToken() || ''
    const hasBody = method !== "GET" && method !== "HEAD";

    try {
        return await fetch(route, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            ...(hasBody && { body: JSON.stringify(body ?? {}) })
        });
    } catch (error) {
        return Response.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
