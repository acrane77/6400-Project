import { requireAuth } from '@/core/auth'
import { adminAuth } from '@/lib/firebaseAdmin'
import { isRole } from '@/features/Account/data/models/roles'

export async function PATCH(request: Request): Promise<Response> {
	const auth = await requireAuth(request, ['DEVELOPER'])
	if (auth instanceof Response) return auth
	
	const input = await request.json().catch(() => null)
	if (typeof input?.email !== 'string' || !input.email.trim() || !isRole(input.role)) {
		return Response.json({ success: false, error: 'Bad Request: Please provide an email and a role'}, { status: 400 })
	}

	let target
	try {
		target = await adminAuth.getUserByEmail(input.email.trim())
	}
	catch {
		return Response.json({ success: false, error: 'User not found.' }, { status: 404 })
	}
	
	await adminAuth.setCustomUserClaims(target.uid, { ...target.customClaims, role: input.role })

	return Response.json({ success: true, body: { id: target.uid, role: input.role } }, { status: 200 })
}
