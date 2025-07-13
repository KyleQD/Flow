import { toast } from "@/components/ui/use-toast"

export interface NotificationOptions {
  title: string
  description: string
  variant?: "default" | "destructive"
  duration?: number
}

export const profileNotifications = {
  updateSuccess: (customMessage?: string) => {
    toast({
      title: "✅ Profile Updated Successfully!",
      description: customMessage || "Your profile information has been saved and synced to the database.",
      duration: 4000,
    })
  },

  updateError: (error: string | Error, customMessage?: string) => {
    const errorMessage = error instanceof Error ? error.message : error
    toast({
      title: "❌ Update Failed",
      description: customMessage || errorMessage || "Failed to update profile. Please try again.",
      variant: "destructive",
      duration: 6000,
    })
  },

  validationError: (fieldName: string, message: string) => {
    toast({
      title: "⚠️ Validation Error",
      description: `${fieldName}: ${message}`,
      variant: "destructive",
      duration: 5000,
    })
  },

  networkError: () => {
    toast({
      title: "🌐 Network Error",
      description: "Please check your internet connection and try again.",
      variant: "destructive",
      duration: 6000,
    })
  },

  avatarUploadSuccess: () => {
    toast({
      title: "✅ Avatar Updated",
      description: "Your profile picture has been updated successfully.",
      duration: 4000,
    })
  },

  avatarUploadError: (error: string) => {
    toast({
      title: "❌ Upload Failed",
      description: `${error}. Make sure storage buckets are set up properly.`,
      variant: "destructive",
      duration: 6000,
    })
  },

  loadingError: () => {
    toast({
      title: "❌ Loading Failed",
      description: "Failed to load profile data. Please refresh the page.",
      variant: "destructive",
      duration: 6000,
    })
  },

  saveInProgress: () => {
    toast({
      title: "💾 Saving...",
      description: "Your changes are being saved to the database.",
      duration: 2000,
    })
  },

  customSuccess: (title: string, description: string) => {
    toast({
      title: `✅ ${title}`,
      description,
      duration: 4000,
    })
  },

  customError: (title: string, description: string) => {
    toast({
      title: `❌ ${title}`,
      description,
      variant: "destructive",
      duration: 6000,
    })
  }
}

export const artistNotifications = {
  profileUpdateSuccess: () => {
    toast({
      title: "✅ Artist Profile Updated!",
      description: "Your artist profile has been successfully updated and synced.",
      duration: 4000,
    })
  },

  musicSettingsUpdateSuccess: () => {
    toast({
      title: "✅ Music Settings Updated!",
      description: "Your music preferences have been saved successfully.",
      duration: 4000,
    })
  },

  bookingSettingsUpdateSuccess: () => {
    toast({
      title: "✅ Booking Settings Updated!",
      description: "Your booking preferences have been saved successfully.",
      duration: 4000,
    })
  }
}

export const venueNotifications = {
  profileUpdateSuccess: () => {
    toast({
      title: "✅ Venue Profile Updated!",
      description: "Your venue information has been successfully updated and synced.",
      duration: 4000,
    })
  },

  amenitiesUpdateSuccess: () => {
    toast({
      title: "✅ Amenities Updated!",
      description: "Your venue amenities have been saved successfully.",
      duration: 4000,
    })
  },

  bookingPolicyUpdateSuccess: () => {
    toast({
      title: "✅ Booking Policies Updated!",
      description: "Your booking policies have been saved successfully.",
      duration: 4000,
    })
  }
}

export const adminNotifications = {
  systemSettingsUpdateSuccess: () => {
    toast({
      title: "✅ System Settings Updated!",
      description: "System configuration has been saved successfully.",
      duration: 4000,
    })
  },

  moderationSettingsUpdateSuccess: () => {
    toast({
      title: "✅ Moderation Settings Updated!",
      description: "Moderation policies have been saved successfully.",
      duration: 4000,
    })
  }
}

// Real-time validation helpers
export const validationHelpers = {
  checkUsernameAvailability: async (username: string, currentUsername?: string): Promise<boolean> => {
    if (!username || username === currentUsername) return true
    
    try {
      const response = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username)}`)
      const result = await response.json()
      return result.available
    } catch (error) {
      console.error('Error checking username availability:', error)
      return false
    }
  },

  checkCustomUrlAvailability: async (customUrl: string, currentUrl?: string): Promise<boolean> => {
    if (!customUrl || customUrl === currentUrl) return true
    
    try {
      const response = await fetch(`/api/profile/check-url?url=${encodeURIComponent(customUrl)}`)
      const result = await response.json()
      return result.available
    } catch (error) {
      console.error('Error checking custom URL availability:', error)
      return false
    }
  }
} 