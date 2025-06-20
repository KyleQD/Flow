"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface AuthContextType {
  user: null
  loading: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const signIn = () => {
    setLoading(true)
    // Handle sign in logic here
    setLoading(false)
  }

  const signOut = () => {
    setLoading(true)
    // Handle sign out logic here
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider")
  return context
} 