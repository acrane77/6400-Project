'use client'
import { type FormEvent, useState } from "react"
import { useAccount } from "@/features/Account/presentation/contexts/AccountContext"

export default function loginPage() {

    const { signup, isLoading } = useAccount();
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
         event.preventDefault();
         const form = event.currentTarget;
         setMessage('');
         setError('');

         const formData = new FormData(form);
         if (formData.get('password')?.toString() !== formData.get('confirm-password')?.toString()) {
            setError('Passwords do not Match');
            return;
         }

         try {
            await signup({
                email: formData.get('email')?.toString().trim() ?? '',
                username: formData.get('username')?.toString().trim() ?? '',
                password: formData.get('password')?.toString() ?? '',
            })

            form.reset();
            setMessage('Account created successfully.')
         } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? `Could not signup: ${submitError.message}`
                    : `Could not signup. Please try again.`
            )
         }
    } 

    return (
        <div>
            <form className="p-6" onSubmit={handleSubmit}>
                <div className="flex flex-col items-center justify-center gap-4">
                    <h1 className="text-3xl"> Sign-Up </h1>
                    <div className="flex flex-col gap-2">
                        <label className="text-xl" htmlFor="email">Email</label>
                        <input
                            className="rounded-lg border-2 border white px-2 py-1"
                            id="email"
                            name="email"
                            type="text"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xl" htmlFor="username">UserName</label>
                        <input
                            className="rounded-lg border-2 border white px-2 py-1"
                            id="username"
                            name="username"
                            type="text"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xl" htmlFor="password">Password</label>
                        <input
                            className="rounded-lg border-2 border white px-2 py-1"
                            id="password"
                            name="password"
                            type="password"
                            required
                        />
                    </div> 
                    <div className="flex flex-col gap-2">
                        <label className="text-xl" htmlFor="confirm-password">Confirm Password</label>
                        <input
                            className="rounded-lg border-2 border white px-2 py-1"
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="h-8 w-28 rounded-xl border-2 border-white bg-white font-bold text-black disabled:opacity-60"
                    >
                        {isLoading ? 'Signing Up...' : 'Sign Up'}

                    </button>
                </div>
                {message && <p className="text-lg" role="status">{message}</p>}
                {error && <p className="text-red-600" role="alert">{error}</p>}
            </form>
        </div>
    )
}
