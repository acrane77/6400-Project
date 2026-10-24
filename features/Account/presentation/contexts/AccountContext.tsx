'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
	createUserWithEmailAndPassword,
	onIdTokenChanged,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
	type User as FirebaseUser,
} from 'firebase/auth'
import { clientAuth } from '@/lib/firebase'
import APIFetch from '@/core/APIFetch'
import type { User } from '@/features/Account/data/models/user'
import { isRole, type Role } from '@/features/Account/data/models/roles'
import type { Credentials, SignupDetails } from '../../data/models/Credentials'
type AccountContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAuthLoading: boolean
  hasRole: (roles: readonly Role[]) => boolean
  login: (credentials: Credentials) => Promise<User>
  signup: (details: SignupDetails) => Promise<User>
  logout: () => Promise<void>
}

const AccountContext = createContext<AccountContextValue | undefined>(undefined)

async function toAccount(firebaseUser: FirebaseUser, forceRefresh = false): Promise<User> {
	const { claims } = await firebaseUser.getIdTokenResult(forceRefresh)
	return {
		id: firebaseUser.uid,
		username: firebaseUser.displayName ?? '',
		email: firebaseUser.email ?? '',
		role: isRole(claims.role) ? claims.role : undefined,
	}
}

export function AccountProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(false)
	const [authLoading, setAuthLoading] = useState(true)

	const login = useCallback(async (credentials: Credentials) => {
		setLoading(true)
		try {
			const result = await signInWithEmailAndPassword(clientAuth, credentials.email, credentials.password)
			const account = await toAccount(result.user)
			setUser(account)
			return account
		} 
		finally {
			setLoading(false)
		}
	}, [])

	const signup = useCallback(async (details: SignupDetails): Promise<User> => {
		setLoading(true)
		try {
			const result = await createUserWithEmailAndPassword(clientAuth, details.email, details.password)
			await updateProfile(result.user, { displayName: details.username })
			const response = await APIFetch('POST', '/api/account', { username: details.username })
			if (!response.ok) {
				throw new Error("Could not register account, try logging in.")
			}
			const account = await toAccount(result.user, true)
			setUser(account)
			return account
		}
		finally {
			setLoading(false)
		}
	}, [])

	const logout = useCallback(async () => {
		await signOut(clientAuth)
		setUser(null)
	}, [])

	const hasRole = useCallback((roles: readonly Role[]) => user?.role !== undefined && roles.includes(user.role), [user])
	const value = useMemo(() => ({
		user, isAuthenticated:user !== null, isLoading:loading, isAuthLoading:authLoading, hasRole, login, signup, logout }),
		[user, loading, authLoading, hasRole, login, signup, logout])

	useEffect(() =>{
		const unsubscribe = onIdTokenChanged(clientAuth, async (firebaseUser) => {
			setUser(firebaseUser ? await toAccount(firebaseUser) : null)
			setAuthLoading(false)
		})
		return unsubscribe
	}, [])

	return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export function useAccount() {
	const context = useContext(AccountContext)
	if (!context) {
		throw new Error('useAccount has to be used within AccountProvider')
	}
	return context

}
