"use client"

import { createContext, useContext, useState } from "react"

interface SocialContextType {
  posts: any[]
  users: any[]
}

const SocialContext = createContext<SocialContextType | undefined>(undefined)

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [posts] = useState<any[]>([])
  const [users] = useState<any[]>([])

  return (
    <SocialContext.Provider value={{ posts, users }}>
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const context = useContext(SocialContext)
  if (context === undefined) {
    throw new Error("useSocial must be used within a SocialProvider")
  }
  return context
}
