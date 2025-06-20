"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  user: {
    id: string
    name: string
    email: string
    role: string
  } | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthContextType["user"]>(null)

  const login = async (email: string, password: string) => {
    // TODO: Implement actual login logic
    setIsAuthenticated(true)
    setUser({
      id: "1",
      name: "Test User",
      email: email,
      role: "venue"
    })
  }

  const logout = async () => {
    // TODO: Implement actual logout logic
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 