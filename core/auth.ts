import { adminAuth } from '@/lib/firebaseAdmin'
import { isRole, type Role } from '@/features/Account/data/models/roles'

export type AuthUser = { uid: string; role: Role }

export async function requireAuth(request: Request, allowedRoles?: readonly Role[]): Promise<AuthUser | Response> {
	const authHeader = request.headers.get('Authorization')
	if (!authHeader?.startsWith('Bearer ')) {
		return Response.json(
			{ 
				success: false, 
				error: 'Unauthorized: Missing token.'
			}, 
			{
				status: 401
			}
		)
	}

	let user: AuthUser
	try {
		const decoded = await adminAuth.verifyIdToken(authHeader.slice('Bearer '.length))
		user = { uid: decoded.uid, role: isRole(decoded.role) ? decoded.role : 'PARTICIPANT' }
	} 
	catch {
		return Response.json({ success: false, error: 'Unauthorized: Invalid token.' }, { status: 401 })
	}

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		return Response.json({ success: false, error: 'Forbidden: Your role cannot access this function.' }, { status: 403 })
	}
	return user
}
