"use client"

import { useState, type FormEvent } from 'react'
import APIFetch from '@/core/APIFetch'
import RoleSelector from '@/features/Account/presentation/components/RoleSelector'
import { useAccount } from '@/features/Account/presentation/contexts/AccountContext'
import { type Role } from '@/features/Account/data/models/roles'

export default function RbacPage() {
	const { isAuthLoading, hasRole } = useAccount()
	const [role, setRole] = useState<Role>('ORGANIZER')
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')

	if (isAuthLoading) return <p className="p-6" role="status">Loading...</p>
	if (!hasRole(['DEVELOPER'])) return <p className="p-6">Only Admins can change roles.</p>
	
	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const email = new FormData(event.currentTarget).get('email')?.toString().trim() ?? ''
		setMessage('')
		setError('')

		const response = await APIFetch('PATCH', '/api/account/role', { email, role })
		const result = await response.json().catch(() => ({}))

		if (response.ok) {
			setMessage(`${email} is now a ${role}`)
		}
		else {
			setError(result.error ?? `Request failed (${response.status})`)
		}
	}

	return (
		<form className="flex flex-col items-center gap-4 p-6" onSubmit={submit}>
			<h1 className="text-3xl">Manage roles</h1>
			<input className="rounded-lg border-2 px-2 py-1" name="email" type="email" placeholder="User email" required />
			<RoleSelector role={role} onRoleChange={setRole} />
			<button type="submit" className="h-8 w-28 rounded-xl border-2 border-white bg-white font-bold text-black">Save</button>
			{message && <p role="status">{message}</p>}
			{error && <p className="text-red-600" role="alert">{error}</p>}
		</form>
	)
}
