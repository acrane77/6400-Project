'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import MatrixDisplay from '@/app/events/invite/qr_code/MatrixDisplay'
import { generate } from '@/app/events/invite/qr_code/qrcode'
import type { Poster } from '../../data/models/poster'
import { createPosterAPI, getPostersAPI } from '../api/posterApi'
import { downloadQrPng } from '../qrDownload'

function trackingUrl(posterId: string): string {
	 const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
	return `${base.replace(/\/$/, '')}/q/${posterId}`
}

function fileNameFor(label: string): string {
	  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
	return `poster-qr-${slug || 'code'}.png`
}

export default function PosterManager({ eventId }: { eventId: string }) {
	const [posters, setPosters] = useState<Poster[]>([])
	const [loading, setLoading] = useState(true)
	const [creating, setCreating] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		let active = true
			getPostersAPI(eventId)
			.then((result) => { if (active) setPosters(result) })
			.catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Could not load posters.') })
			.finally(() => { if (active) setLoading(false) })
		return () => { active = false }
	}, [eventId])

	async function handleCreate(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const form = event.currentTarget
		const data = new FormData(form)

		setCreating(true)
		setError('')
	
		try {
			const poster = await createPosterAPI(eventId, {
				label: data.get('label')?.toString().trim() ?? '',
				location: data.get('location')?.toString().trim() ?? '',
			})
			setPosters((current) => [poster, ...current])
			form.reset()

		} 
		catch (err) {
			setError(err instanceof Error ? err.message : 'Could not create the poster.')
		} 
		finally {
			setCreating(false)
		}
	}

	return (
		<section className="mb-8 rounded-lg border border-border bg-card p-6">
			<h2 className="mb-2 text-xl font-semibold">Posters</h2>
			<p className="mb-6 text-muted-foreground">Create a QR code for each poster you post.</p>
			<form onSubmit={handleCreate} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
				<label className="flex flex-1 flex-col gap-1 text-sm">Poster name<input name="label" required maxLength={80} className="h-11 rounded-none border border-border bg-background px-3 text-base outline-none focus-visible:border-ring"/> </label>
				<label className="flex flex-1 flex-col gap-1 text-sm">Location (optional)<input name="location" maxLength={120} className="h-11 rounded-none border border-border bg-background px-3 text-base outline-none focus-visible:border-ring"/> </label>
				<button type="submit" disabled={creating} className="h-11 rounded-none bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"> 
			{creating ? 'Creating...' : 'Create QR code'}
				</button>
			</form>

		{error && <p className="mb-4 text-destructive">{error}</p>}

		{loading ? (
			<p className="text-muted-foreground">Loading posters...</p>
		) : posters.length === 0 ? (
			<p className="text-muted-foreground">No posters yet.</p>
		) : (
			<ul className="flex flex-col gap-4">
			{posters.map((poster) => (
				<PosterRow key={poster.id} poster={poster} />
			))}
			</ul>
		)}
		</section>
	)
}

function PosterRow({ poster }: { poster: Poster }) {
	const url = useMemo(() => trackingUrl(poster.id), [poster.id])
	const matrix = useMemo<number[][] | null>(() => {
    try {
		return generate(url)
	} 
	catch {
			return null
		}
	}, [url])
	
	const [copied, setCopied] = useState(false)

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url)
			setCopied(true)
		} 
		catch {}
	}

	return (
		<li className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4 sm:flex-row">
		<div className="size-36 shrink-0 overflow-hidden rounded-md">
			{matrix ? (
				<MatrixDisplay matrix={matrix} border={4} />
				) : (
					<p className="text-sm text-destructive">Could not generate a QR code.</p>
			)}
		</div>

		<div className="flex min-w-0 flex-1 flex-col gap-1">
			<h3 className="font-semibold">{poster.label}</h3>
			{poster.location && <p className="text-sm text-muted-foreground">{poster.location}</p>}
			<p className="text-sm">
				{poster.scanCount} {poster.scanCount === 1 ? 'scan' : 'scans'}
				{poster.lastScanTime && ` · last ${new Date(poster.lastScanTime).toLocaleString()}`}
			</p>
			<code className="break-all text-xs text-muted-foreground">{url}</code>

				<div className="mt-2 flex flex-wrap gap-2">
				<button type="button" disabled={!matrix} onClick={() => matrix && downloadQrPng(matrix, fileNameFor(poster.label))} className="rounded-md border border-primary/40 px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/10 disabled:opacity-50">Download PNG</button>
				<button type="button" onClick={copyLink} className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted">{copied ? 'Copied!' : 'Copy link'}</button>
			</div>
		</div>
	</li>
	)
}
