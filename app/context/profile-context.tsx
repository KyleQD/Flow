"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface ProfileContextType {
  profile: any
  setProfile: (profile: any) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <ProfileContext.Provider value={{ profile, setProfile, isLoading, setIsLoading }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
} 