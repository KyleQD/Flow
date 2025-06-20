"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useMemo } from "react"
import type { ProfileData, ProfileContextType } from "@/lib/types"
import { defaultProfile } from "@/lib/mock-data"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useLocalStorage<ProfileData | null>("profile", null)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useLocalStorage<boolean>("isConnected", false)
  const { toast } = useToast()

  // Initialize profile if not exists
  useEffect(() => {
    if (profile === null) {
      setProfile(defaultProfile)
    }
    setLoading(false)
  }, [profile, setProfile])

  // Memoized update functions
  const updateProfile = useCallback(
    (data: Partial<ProfileData>) => {
      setProfile((prev) => {
        if (!prev) return null
        const updated = { ...prev, ...data }
        return updated
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    },
    [setProfile, toast],
  )

  const addExperience = useCallback(
    (experience: Omit<ProfileData["experience"][0], "id">) => {
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          experience: [...prev.experience, { ...experience, id: uuidv4() }],
        }
      })

      toast({
        title: "Experience added",
        description: "New experience has been added to your profile.",
      })
    },
    [setProfile, toast],
  )

  const updateExperience = useCallback(
    (id: string, experience: Partial<Omit<ProfileData["experience"][0], "id">>) => {
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, ...experience } : exp)),
        }
      })
    },
    [setProfile],
  )

  const removeExperience = useCallback(
    (id: string) => {
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          experience: prev.experience.filter((exp) => exp.id !== id),
        }
      })

      toast({
        title: "Experience removed",
        description: "The experience has been removed from your profile.",
      })
    },
    [setProfile, toast],
  )

  const addCertification = useCallback(
    (certification: Omit<ProfileData["certifications"][0], "id">) => {
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          certifications: [...prev.certifications, { ...certification, id: uuidv4() }],
        }
      })

      toast({
        title: "Certification added",
        description: "New certification has been added to your profile.",
      })
    },
    [setProfile, toast],
  )

  const updateCertification = useCallback(
    (id: string, certification: Partial<Omit<ProfileData["certifications"][0], "id">>) => {
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          certifications: prev.certifications.map((cert) => (cert.id === id ? { ...cert, ...certification } : cert)),
        }
      })
    },
    [setProfile],
  )

  const removeCertification = useCallback(
    (id: string) => {
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          certifications: prev.certifications.filter((cert) => cert.id !== id),
        }
      })

      toast({
        title: "Certification removed",
        description: "The certification has been removed from your profile.",
      })
    },
    [setProfile, toast],
  )

  const addSkill = useCallback(
    (skill: string) => {
      setProfile((prev) => {
        if (!prev) return null
        if (prev.skills.includes(skill)) {
          toast({
            title: "Skill already exists",
            description: "This skill is already in your profile.",
            variant: "destructive",
          })
          return prev
        }
        return {
          ...prev,
          skills: [...prev.skills, skill],
        }
      })

      toast({
        title: "Skill added",
        description: "New skill has been added to your profile.",
      })
    },
    [setProfile, toast],
  )

  const removeSkill = useCallback(
    (skill: string) => {
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          skills: prev.skills.filter((s) => s !== skill),
        }
      })

      toast({
        title: "Skill removed",
        description: "The skill has been removed from your profile.",
      })
    },
    [setProfile, toast],
  )

  const addGalleryItem = useCallback(
    (item: Omit<ProfileData["gallery"][0], "id">) => {
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          gallery: [...prev.gallery, { ...item, id: uuidv4() }],
        }
      })

      toast({
        title: "Media added",
        description: "New media has been added to your gallery.",
      })
    },
    [setProfile, toast],
  )

  const removeGalleryItem = useCallback(
    (id: string) => {
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          gallery: prev.gallery.filter((item) => item.id !== id),
        }
      })

      toast({
        title: "Media removed",
        description: "The media has been removed from your gallery.",
      })
    },
    [setProfile, toast],
  )

  const reorderGallery = useCallback(
    (newOrder: ProfileData["gallery"]) => {
      setProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          gallery: newOrder,
        }
      })
    },
    [setProfile],
  )

  const toggleConnection = useCallback(() => {
    setIsConnected((prev) => {
      const newStatus = !prev

      toast({
        title: `${newStatus ? "Connected" : "Disconnected"}`,
        description: `You are now ${newStatus ? "connected" : "disconnected"} with this profile.`,
      })

      return newStatus
    })
  }, [setIsConnected, toast])

  const toggleTheme = useCallback(() => {
    setProfile((prev) => {
      if (!prev) return null
      const newTheme = prev.theme === "dark" ? "light" : "dark"

      toast({
        title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
        description: `Your profile is now in ${newTheme} mode.`,
      })

      return {
        ...prev,
        theme: newTheme,
      }
    })
  }, [setProfile, toast])

  const exportProfile = useCallback(() => {
    if (!profile) return

    try {
      const dataStr = JSON.stringify(profile)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

      const exportFileDefaultName = `tourify-profile-${profile.username}-${new Date().toISOString().slice(0, 10)}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Profile exported",
        description: "Your profile has been exported successfully.",
      })
    } catch (error) {
      console.error("Error exporting profile:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your profile.",
        variant: "destructive",
      })
    }
  }, [profile, toast])

  const importProfile = useCallback(
    (data: string) => {
      try {
        // Validate input data
        if (!data || typeof data !== 'string' || data.trim() === '') {
          throw new Error("No data provided")
        }

        const parsedData = JSON.parse(data) as ProfileData

        // Validate the imported data
        if (!parsedData.id || !parsedData.fullName || !parsedData.username) {
          throw new Error("Invalid profile data")
        }

        setProfile(parsedData)

        toast({
          title: "Profile imported",
          description: "Your profile has been imported successfully.",
        })

        return true
      } catch (error) {
        console.error("Error importing profile:", error)
        toast({
          title: "Import failed",
          description: "There was an error importing your profile. Please check the file format.",
          variant: "destructive",
        })
        return false
      }
    },
    [setProfile, toast],
  )

  const searchSkills = useCallback(
    (query: string): string[] => {
      if (!profile || !query.trim()) return []

      const normalizedQuery = query.toLowerCase().trim()
      return profile.skills.filter((skill) => skill.toLowerCase().includes(normalizedQuery))
    },
    [profile],
  )

  const createGroup = useCallback(
    async (groupData: any) => {
      try {
        // In a real app, this would call an API to create a group
        toast({
          title: "Group created",
          description: `Your group "${groupData.name}" has been created successfully.`,
        })
        return true
      } catch (error) {
        console.error("Error creating group:", error)
        toast({
          title: "Error creating group",
          description: "There was an error creating your group. Please try again.",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  const createEPK = useCallback(async () => {
    try {
      // In a real app, this would call an API to create an EPK
      toast({
        title: "EPK created",
        description: "Your Electronic Press Kit has been created successfully.",
      })
      return "https://tourify.com/epk/username"
    } catch (error) {
      console.error("Error creating EPK:", error)
      toast({
        title: "Error creating EPK",
        description: "There was an error creating your EPK. Please try again.",
        variant: "destructive",
      })
      return ""
    }
  }, [toast])

  const upgradeToPremiumEPK = useCallback(async () => {
    try {
      // In a real app, this would call an API to upgrade the EPK
      toast({
        title: "EPK upgraded",
        description: "Your EPK has been upgraded to premium successfully.",
      })
      return true
    } catch (error) {
      console.error("Error upgrading EPK:", error)
      toast({
        title: "Error upgrading EPK",
        description: "There was an error upgrading your EPK. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }, [toast])

  const createEvent = useCallback(
    async (eventData: any) => {
      try {
        // In a real app, this would call an API to create an event
        toast({
          title: "Event created",
          description: `Your event "${eventData.title}" has been created successfully.`,
        })
        return true
      } catch (error) {
        console.error("Error creating event:", error)
        toast({
          title: "Error creating event",
          description: "There was an error creating your event. Please try again.",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  const generateTickets = useCallback(
    async (eventId: string, quantity: number) => {
      try {
        // In a real app, this would call an API to generate tickets
        toast({
          title: "Tickets generated",
          description: `${quantity} tickets have been generated for your event.`,
        })
        return true
      } catch (error) {
        console.error("Error generating tickets:", error)
        toast({
          title: "Error generating tickets",
          description: "There was an error generating tickets. Please try again.",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  const promotePaidContent = useCallback(
    async (contentId: string, budget: number) => {
      try {
        // In a real app, this would call an API to promote content
        toast({
          title: "Promotion created",
          description: `Your content is now being promoted with a budget of $${budget}.`,
        })
        return true
      } catch (error) {
        console.error("Error promoting content:", error)
        toast({
          title: "Error promoting content",
          description: "There was an error promoting your content. Please try again.",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  const postJob = useCallback(
    async (jobData: any) => {
      try {
        // In a real app, this would call an API to post a job
        toast({
          title: "Job posted",
          description: `Your job listing for "${jobData.title}" has been posted successfully.`,
        })
        return true
      } catch (error) {
        console.error("Error posting job:", error)
        toast({
          title: "Error posting job",
          description: "There was an error posting your job. Please try again.",
          variant: "destructive",
        })
        return false
      }
    },
    [toast],
  )

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      profile,
      loading,
      updateProfile,
      addExperience,
      updateExperience,
      removeExperience,
      addCertification,
      updateCertification,
      removeCertification,
      addSkill,
      removeSkill,
      addGalleryItem,
      removeGalleryItem,
      reorderGallery,
      isConnected,
      toggleConnection,
      toggleTheme,
      exportProfile,
      importProfile,
      searchSkills,
      createGroup,
      createEPK,
      upgradeToPremiumEPK,
      createEvent,
      generateTickets,
      promotePaidContent,
      postJob,
    }),
    [
      profile,
      loading,
      updateProfile,
      addExperience,
      updateExperience,
      removeExperience,
      addCertification,
      updateCertification,
      removeSkill,
      addGalleryItem,
      removeGalleryItem,
      reorderGallery,
      isConnected,
      toggleConnection,
      toggleTheme,
      exportProfile,
      importProfile,
      searchSkills,
      createGroup,
      createEPK,
      upgradeToPremiumEPK,
      createEvent,
      generateTickets,
      promotePaidContent,
      postJob,
    ],
  )

  return <ProfileContext.Provider value={contextValue}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
