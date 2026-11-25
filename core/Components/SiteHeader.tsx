'use client'

import { useEffect, useState } from 'react'
import { useAccount } from '../../features/Account/presentation/contexts/AccountContext'
import { usePathname } from 'next/navigation'

export default function SiteHeader() {
  const { isAuthenticated, isAuthLoading, logout } = useAccount()
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-card px-6 text-foreground">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center gap-6" aria-label="Main navigation">
        <a
          href="/events"
          className="mr-auto font-mono text-lg font-semibold tracking-tight text-primary"
        >
          Event Planner
        </a>
        <a
          href="/events"
          className="relative grid h-full place-items-center font-medium text-foreground hover:text-primary"
        >
          Events

          {pathname === '/events' && (
            <span className="absolute bottom-0 left-0 h-1 w-full bg-primary" />
          )}
        </a>
        {!isAuthLoading && isAuthenticated && (
        <>
        <a
          href="/account/events/my-events"
          className="relative grid h-full place-items-center font-medium text-foreground hover:text-primary"
        >
          My Events

          {pathname.startsWith('/account/events/') && (
            <span className="absolute bottom-0 left-0 h-1 w-full bg-primary" />
          )}
        </a>
        <a
          href="/account/analytics"
          className="relative grid h-full place-items-center font-medium text-foreground hover:text-primary"
        >
          Analytics

          {pathname.startsWith('/account/analytics') && (
            <span className="absolute bottom-0 left-0 h-1 w-full bg-primary" />
          )}
        </a>
        <button
          type="button"
          onClick={() => void logout()}
          className="grid h-full place-items-center font-medium text-foreground hover:text-primary"
        >
          Sign-out
        </button>
        </>
        )}
        {!isAuthLoading && !isAuthenticated && (
          <a className="font-semibold hover:underline" href="/account/login">Login/Sign-Up</a>
        )}
      </nav>
    </header>
  )
}
