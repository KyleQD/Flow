"use client"
import { createContext, useContext } from "react"

interface ProfileContextType {
  profile: {
    id: string
    name: string
    avatar?: string
    type?: string
    description?: string
    bio?: string
    artistType?: string
    location?: string
    website?: string
    contactEmail?: string
    phone?: string
    capacity?: string
    theme?: string
    skills?: string[]
    gallery?: Array<{
      id: string
      url: string
      type: string
    }>
    experience?: Array<{
      title: string
      company: string
      duration: string
    }>
    certifications?: Array<{
      title: string
      organization: string
      year: string
    }>
    bookingSettings?: {
      leadTime: string
      autoApprove: string
      requireDeposit: boolean
      depositAmount: string
      cancellationPolicy: string
    }
    notifications?: {
      newBookings: boolean
      bookingUpdates: boolean
      messages: boolean
      marketing: boolean
    }
    team?: {
      members: any[]
      roles: any[]
    }
    payment?: {
      acceptedMethods: string[]
      taxRate: string
      currency: string
    }
  }
  createEPK: () => Promise<string>
  upgradeToPremiumEPK: () => Promise<boolean>
  // Add other context properties as needed
}

const ProfileContext = createContext<ProfileContextType>({
  profile: {
    id: "",
    name: "",
    avatar: "",
    type: "",
    description: "",
    bio: "",
    artistType: "",
    location: "",
    website: "",
    contactEmail: "",
    phone: "",
    capacity: "",
    theme: "dark",
    skills: [],
    gallery: [],
    experience: [],
    certifications: [],
    bookingSettings: {
      leadTime: "2 weeks",
      autoApprove: "never",
      requireDeposit: false,
      depositAmount: "",
      cancellationPolicy: "",
    },
    notifications: {
      newBookings: true,
      bookingUpdates: true,
      messages: true,
      marketing: false,
    },
    team: {
      members: [],
      roles: [],
    },
    payment: {
      acceptedMethods: [],
      taxRate: "",
      currency: "USD",
    },
  },
  createEPK: async () => "",
  upgradeToPremiumEPK: async () => false,
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  // TODO: Replace with actual profile data
  const value = {
    profile: {
      id: "1",
      name: "Test Venue",
      avatar: "/placeholder.svg",
      type: "Concert Hall",
      description: "A premier venue for live music events",
      bio: "A premier venue for live music events with state-of-the-art sound and lighting systems.",
      artistType: "venue",
      location: "New York, NY",
      website: "https://testvenue.com",
      contactEmail: "contact@testvenue.com",
      phone: "+1 (555) 123-4567",
      capacity: "500",
      skills: ["Live Music", "Event Planning", "Sound Engineering"],
      gallery: [
        {
          id: "1",
          url: "/placeholder.svg",
          type: "image"
        }
      ],
      experience: [
        {
          title: "Venue Manager",
          company: "Test Venue",
          duration: "2020 - Present"
        }
      ],
      certifications: [
        {
          title: "Event Management Certification",
          organization: "Event Management Institute",
          year: "2021"
        }
      ],
      theme: "dark",
      bookingSettings: {
        leadTime: "2 weeks",
        autoApprove: "never",
        requireDeposit: false,
        depositAmount: "",
        cancellationPolicy: "",
      },
      notifications: {
        newBookings: true,
        bookingUpdates: true,
        messages: true,
        marketing: false,
      },
      team: {
        members: [],
        roles: [],
      },
      payment: {
        acceptedMethods: [],
        taxRate: "",
        currency: "USD",
      },
    },
    createEPK: async () => {
      // Simulate EPK creation and return a URL
      return "https://tourify.com/epk/username"
    },
    upgradeToPremiumEPK: async () => {
      // Simulate a successful upgrade
      return true
    },
  }
  
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  return useContext(ProfileContext)
}
