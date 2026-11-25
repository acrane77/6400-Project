'use client'

import { type FormEvent, useState } from "react"
import Link from "next/link"

import { useAccount } from "@/features/Account/presentation/contexts/AccountContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

export default function LoginPage() {
  const { login, logout, user, isLoading } = useAccount()

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    setMessage("")
    setError("")

    try {
      await login({
        email: formData.get("email")?.toString().trim() ?? "",
        password: formData.get("password")?.toString() ?? "",
      })

      form.reset()

      const next = new URLSearchParams(
        window.location.search
      ).get("next")

      if (next?.startsWith('/events/')) {
          window.location.assign(next)
          return
      }

      if (next?.startsWith("/events/invite/")) {
        window.location.assign(next)
        return
      }

      setMessage("Login successful.")
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? `Could not login: ${submitError.message}`
          : "Could not login. Please try again."
      )
    }
  }

  if (user) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md rounded-3xl border-border bg-card p-8 text-center">
          <h1 className="text-3xl font-bold">
            Welcome back, {user.username}.
          </h1>

          <p className="mt-3 text-muted-foreground">
            You're signed in and ready to go.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/events"
              className="flex h-11 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Explore Events
            </Link>

            <Button
              variant="outline"
              onClick={() => void logout()}
            >
              Sign Out
            </Button>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
  
      <Card className="w-full max-w-sm gap-0 rounded-2xl border-border bg-card p-10">
  
        <CardContent className="px-0">
  
          <h1 className="text-center text-3xl font-semibold">
            Welcome back
          </h1>
  
          <p className="mt-2 text-center text-base text-muted-foreground">
            Log in to your account
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
              <Label htmlFor="password">Password</Label>
  
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
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
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
  
          </form>
  
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/account/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
  
        </CardContent>
  
      </Card>
  
    </main>
  )
}
