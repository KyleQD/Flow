"use client"
import { createContext, useContext } from "react"

interface ProfileContextType {
  profile: {
    id: string
    name: string
    // Add other profile properties as needed
  }
  // Add other context properties as needed
}

const ProfileContext = createContext<ProfileContextType>({
  profile: {
    id: "",
    name: "",
  },
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  // TODO: Replace with actual profile data
  const value = {
    profile: {
      id: "1",
      name: "Test Venue",
    },
  }
  
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  return useContext(ProfileContext)
}
