'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@/features/Account/data/models/user'
import type { Credentials, SignupDetails } from '../../data/models/Credentials'

type AccountContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: Credentials) => Promise<User>
  signup: (details: SignupDetails) => Promise<User>
  logout: () => void
}

type ApiUser = Pick<User, 'id' | 'username' | 'email'>

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
const AccountContext = createContext<AccountContextValue | undefined>(undefined)

async function requestAccount(path: string, body: object): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/account/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Account request failed (${response.status}).`)
  }

  const account = await response.json() as ApiUser
  if (typeof account.id !== 'string' || typeof account.email !== 'string'
    || typeof account.username !== 'string') {
    throw new Error('The account service returned an invalid response.')
  }

  return {
    id: account.id,
    username: account.username,
    email: account.email,
    firstName: '',
    lastName: '',
  }
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (credentials: Credentials) => {
    setIsLoading(true)
    try {
      const account = await requestAccount('login', credentials)
      setUser(account)
      return account
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(async (details: SignupDetails) => {
    setIsLoading(true)
    try {
      const account = await requestAccount('signup', details)
      setUser(account)
      return account
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => setUser(null), [])

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, signup, logout }),
    [user, isLoading, login, signup, logout],
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
}
