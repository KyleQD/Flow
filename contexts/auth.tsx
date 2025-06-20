"use client"

import * as React from "react"
import { User } from "@/types/user"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  // Load initial user data
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        // TODO: Replace with actual API call
        const mockUser: User = {
          id: "1",
          fullName: "Alex Johnson",
          username: "alexj",
          avatar: "/placeholder.svg",
          title: "Music Producer",
          location: "Los Angeles, CA",
          status: "online",
          email: "alex@example.com",
          connections: ["2"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setUser(mockUser)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load user"))
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockUser: User = {
        id: "1",
        fullName: "Alex Johnson",
        username: "alexj",
        avatar: "/placeholder.svg",
        title: "Music Producer",
        location: "Los Angeles, CA",
        status: "online",
        email: email,
        connections: ["2"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setUser(mockUser)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign in"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign out"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        fullName: userData.fullName || "",
        username: userData.username || "",
        avatar: userData.avatar || "/placeholder.svg",
        title: userData.title || "",
        location: userData.location || "",
        status: "online",
        email: email,
        connections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setUser(mockUser)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to sign up"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (data: Partial<User>) => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
      if (user) {
        const updatedUser = { ...user, ...data, updatedAt: new Date().toISOString() }
        setUser(updatedUser)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update user"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to reset password"))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    signUp,
    updateUser,
    resetPassword,
    clearError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 