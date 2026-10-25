'use client'

import { useEffect, useState } from 'react'
import { useAccount } from '../../features/Account/presentation/contexts/AccountContext'

export default function SiteHeader() {
  const { isAuthenticated, isAuthLoading, logout } = useAccount()

  return (
    <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
      <nav className="mx-auto flex w-full max-w-4xl gap-6" aria-label="Main navigation">
        <a className="font-semibold hover:underline" href="/events">Events</a>
        {!isAuthLoading && isAuthenticated && (
        <>
        <a className="font-semibold hover:underline" href="/account/events/create">Create event</a>
        <a className="font-semibold hover:underline" href="/account/events/my-events">My Events</a>
        <button className="font-semibold hover:underline" onClick={logout}>Sign-out</button>
        </>
        )}
        {!isAuthLoading && !isAuthenticated && (
          <a className="font-semibold hover:underline" href="/account/login">Login/Sign-Up</a>
        )}
      </nav>
    </header>
  )
}
