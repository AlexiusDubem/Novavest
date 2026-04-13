'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { type User } from 'firebase/auth'
import { initializeFirebaseAnalytics } from '@/lib/firebase/client'
import { subscribeToAuthState } from '@/lib/firebase/auth'
import { subscribeToUserProfile } from '@/lib/firebase/firestore'
import type { UserProfile } from '@/lib/firebase/types'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeFirebaseAnalytics().catch(() => undefined)

    let stopProfile: () => void = () => undefined
    const stopAuth = subscribeToAuthState((nextUser) => {
      setUser(nextUser)

      if (!nextUser) {
        stopProfile()
        setProfile(null)
        setLoading(false)
        return
      }

      stopProfile = subscribeToUserProfile(nextUser.uid, (nextProfile) => {
        setProfile(nextProfile)
        setLoading(false)
      })
    })

    return () => {
      stopAuth()
      stopProfile()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
    }),
    [loading, profile, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
