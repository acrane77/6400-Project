'use client'

import { type FormEvent, useState } from "react"
import { useAccount } from "@/features/Account/presentation/contexts/AccountContext"

export default function LoginPage() {

    const { login, logout, user, isLoading } = useAccount();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
         event.preventDefault();
         const form = event.currentTarget;
         setMessage('');
         setError('');

         const formData = new FormData(form);
         try {
            await login({
                email: formData.get('email')?.toString().trim() ?? '',
                password: formData.get('password')?.toString() ?? '',
            })

            form.reset();

            const next = new URLSearchParams(window.location.search).get('next')

            if (next?.startsWith('/events/')) {
                window.location.assign(next)
                return
            }

            setMessage('Login successful.')
         } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? `Could not login: ${submitError.message}`
                    : `Could not login. Please try again.`
            )
         }
    } 
	if (user) {
		return (
			<div className="flex flex-col items-center gap-4 p-6">
				<p className="text-lg">Logged in as {user.username}</p>
				<button type="button" onClick={() => void logout()} className="h-8 w-28 rounded-xl border-2 border-white bg-white font-bold text-black">Logout</button>
			</div>
		)
	}

    return (
        <div>
            <form className="p-6" onSubmit={handleSubmit}>
                <div className="flex flex-col items-center justify-center gap-4">
                    <h1 className="text-3xl"> Login </h1>
                    <div className="felx flex-col gap-2">
                        <label className="text-xl" htmlFor="email">Email</label>
                        <input
                            className="rounded-lg border-2 border white px-2 py-1"
                            id="email"
                            name="email"
                            type="text"
                            required
                        />
                    </div>
                    <div className="felx flex-col gap-2">
                        <label className="text-xl" htmlFor="password">Password</label>
                        <input
                            className="rounded-lg border-2 border white px-2 py-1"
                            id="password"
                            name="password"
                            type="password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-8 w-28 rounded-xl border-2 border-white bg-white font-bold text-black disabled:opacity-60"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}

                    </button>
                </div>
                {message && <p className="text-lg" role="status">{message}</p>}
                {error && <p className="text-red-600" role="alert">{error}</p>}
                <div className="text-lg flex flex-row gap-2">
                    <div>
                        Don't have an account? Click
                    </div>
                    <a className="text-blue font-semibold hover:underline" href="/account/signup">Here</a>
                    <div>
                         To Sign Up.
                    </div>
                </div>
            </form>
        </div>
    )
}
