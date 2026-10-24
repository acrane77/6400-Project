import { requireAuth } from '@/core/auth'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'
import { isRole, type Role } from '@/features/Account/data/models/roles'

export async function POST(request: Request): Promise<Response> {
	const auth = await requireAuth(request)
	if (auth instanceof Response) return auth

	const input = await request.json().catch(() => ({}))
	try {
		const record = await adminAuth.getUser(auth.uid)
		const existingRole = record.customClaims?.role
		const role: Role = isRole(existingRole) ? existingRole : 'PARTICIPANT'
		
		if (existingRole !== role) {
			await adminAuth.setCustomUserClaims(auth.uid, { ...record.customClaims, role })
		}

		const username = typeof input?.username === 'string' && input.username.trim() ? input.username.trim() : record.displayName ?? ''
		const email = record.email ?? ''
		await adminDb.collection('users').doc(auth.uid).set({ username, email }, { merge: true })
		return Response.json({ success: true, body: { id: auth.uid, username, email, role } }, { status: 200 })
	}
	catch (error) {
		return Response.json({ success: false, error: (error as Error).message }, { status: 500 })
	}
}
