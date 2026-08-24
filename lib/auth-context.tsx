'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '@/lib/firebase'

interface AuthContextType {
  user: User | { email: string; isDemo: boolean } | null
  loading: boolean
  isConfigured: boolean
  isDemoMode: boolean
  login: (email: string, pass: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  loginAsDemoAdmin: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  isDemoMode: false,
  login: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  loginAsDemoAdmin: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | { email: string; isDemo: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)

  useEffect(() => {
    // Check if demo admin was stored in sessionStorage
    const storedDemo = typeof window !== 'undefined' ? sessionStorage.getItem('portfolio_demo_admin') : null
    if (storedDemo) {
      setUser({ email: 'admin@fakhrulalam.com (Demo)', isDemo: true })
      setIsDemoMode(true)
      setLoading(false)
      return
    }

    if (!auth || !isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, pass: string) => {
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please add your credentials in .env.local or use Demo Mode.')
    }
    await signInWithEmailAndPassword(auth, email, pass)
    setIsDemoMode(false)
  }

  const logout = async () => {
    if (isDemoMode) {
      sessionStorage.removeItem('portfolio_demo_admin')
      setIsDemoMode(false)
      setUser(null)
      return
    }
    if (auth) {
      await signOut(auth)
    }
    setUser(null)
  }

  const resetPassword = async (email: string) => {
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured.')
    }
    await sendPasswordResetEmail(auth, email)
  }

  const loginAsDemoAdmin = () => {
    const demoUser = { email: 'admin@fakhrulalam.com (Demo Mode)', isDemo: true }
    sessionStorage.setItem('portfolio_demo_admin', 'true')
    setUser(demoUser)
    setIsDemoMode(true)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isFirebaseConfigured,
        isDemoMode,
        login,
        logout,
        resetPassword,
        loginAsDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
