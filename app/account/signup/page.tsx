'use client'
import { type FormEvent, useState } from "react"
import { useAccount } from "@/features/Account/presentation/contexts/AccountContext"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {

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

            const next = new URLSearchParams(window.location.search).get('next')

            if (next?.startsWith('/events/invite/')) {
                window.location.assign(next)
                return
            }

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
        <main className="flex flex-1 items-center justify-center px-4 py-16">

            <Card className="w-full max-w-md gap-0 rounded-2xl border-border bg-card p-10">

                <CardContent className="px-0">

                    <h1 className="text-center text-3xl font-semibold">
                        Create an account
                    </h1>

                    <p className="mt-2 text-center text-base text-muted-foreground">
                        Sign up to get started
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>

                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>

                            <Input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Choose a username"
                                autoComplete="username"
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>

                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">
                                Confirm Password
                            </Label>

                            <Input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                required
                                className="h-11"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-destructive" role="alert">
                                {error}
                            </p>
                        )}

                        {message && (
                            <p className="text-sm text-primary" role="status">
                                {message}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="mt-2 w-full"
                        >
                            {isLoading ? "Signing Up..." : "Sign Up"}
                        </Button>

                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/account/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>

                </CardContent>

            </Card>

        </main>
    )
}
