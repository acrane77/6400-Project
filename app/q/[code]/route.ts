import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { getPosterEventId, onPosterScan } from '@/features/analytics/data/posterRepository'

const VISITOR_COOKIE = 'qr_vid'
const ONE_YEAR = 60 * 60 * 24 * 365
const THIRTY_DAYS = 60 * 60 * 24 * 30
const FIRESTORE_ID = /^[A-Za-z0-9]{1,64}$/
const UUID = /^[0-9a-f-]{36}$/

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }): Promise<Response> {
	const { code } = await params
	const fallback = () => NextResponse.redirect(new URL('/events', request.url))

	if (!FIRESTORE_ID.test(code)) return fallback()

	let eventId: string | null
	try {
		eventId = await getPosterEventId(code)
	}
	catch (error) {
		console.error('Failed to look up poster:', error)
		return fallback()
	}
	if (!eventId) return fallback()

	const existingVisitor = request.cookies.get(VISITOR_COOKIE)?.value
	const visitorId = existingVisitor && UUID.test(existingVisitor) ? existingVisitor : randomUUID()

	try {
		await onPosterScan(code, eventId, visitorId)
	} 
	catch (error) {
    console.error('Failed to record poster scan:', error)
	}

	const response = NextResponse.redirect(new URL(`/events/${eventId}`, request.url))
	response.headers.set('Cache-Control', 'no-store')

	const cookieOptions = {
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: process.env.NODE_ENV === 'production',
		path: '/',
	}
	response.cookies.set(VISITOR_COOKIE, visitorId, { ...cookieOptions, maxAge: ONE_YEAR })
  
	response.cookies.set(`qr_ref_${eventId}`, code, { ...cookieOptions, maxAge: THIRTY_DAYS })

	return response
}

// answer link previews without counting a scan.
export async function HEAD(): Promise<Response> {
	return new Response(null, { status: 200, headers: { 'Cache-Control': 'no-store' } })
}
