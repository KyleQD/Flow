'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import { useMultiAccount } from '@/hooks/use-multi-account'

interface ArtistProfile {
  id: string
  user_id: string
  artist_name: string | null
  bio: string | null
  genres: string[] | null
  social_links: Record<string, string> | null
  verification_status: string
  account_tier: string
  settings: Record<string, any> | null
  created_at: string
  updated_at: string
}

interface ArtistStats {
  totalRevenue: number
  totalFans: number
  totalStreams: number
  engagementRate: number
  monthlyListeners: number
  totalTracks: number
  totalEvents: number
  totalCollaborations: number
  // New stats from content
  musicCount: number
  videoCount: number
  photoCount: number
  blogCount: number
  eventCount: number
  merchandiseCount: number
  totalPlays: number
  totalViews: number
}

interface ArtistContextType {
  // User & Profile
  user: any | null
  profile: ArtistProfile | null
  isLoading: boolean
  
  // Computed values
  displayName: string
  avatarInitial: string
  
  // Stats & Analytics
  stats: ArtistStats
  
  // Actions
  updateProfile: (data: Partial<ArtistProfile>) => Promise<boolean>
  refreshStats: () => Promise<void>
  syncArtistName: () => Promise<boolean>
  updateDetailedProfile: (profileData: any) => Promise<{ success: boolean; errors?: string[] }>
  
  // Content Management
  createContent: (type: string, data: any) => Promise<any>
  
  // Feature Flags
  features: {
    feedEnabled: boolean
    storeEnabled: boolean
    analyticsEnabled: boolean
    collaborationEnabled: boolean
  }
}

const ArtistContext = createContext<ArtistContextType | undefined>(undefined)

export function ArtistProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<ArtistProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<ArtistStats>({
    totalRevenue: 0,
    totalFans: 0,
    totalStreams: 0,
    engagementRate: 0,
    monthlyListeners: 0,
    totalTracks: 0,
    totalEvents: 0,
    totalCollaborations: 0,
    musicCount: 0,
    videoCount: 0,
    photoCount: 0,
    blogCount: 0,
    eventCount: 0,
    merchandiseCount: 0,
    totalPlays: 0,
    totalViews: 0
  })

  const supabase = createClientComponentClient<Database>()
  const { currentAccount } = useMultiAccount()

  // Feature flags (can be moved to database later)
  const features = {
    feedEnabled: true,
    storeEnabled: true,
    analyticsEnabled: true,
    collaborationEnabled: true
  }

  // Computed values for display
  const getDisplayName = (): string => {
    // Priority order: artist_name from profile, artist_name from account, user metadata, email
    if (profile?.artist_name) {
      return profile.artist_name
    }
    
    if (currentAccount?.profile_data?.artist_name) {
      return currentAccount.profile_data.artist_name
    }
    
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
    }
    
    if (user?.email) {
      return user.email.split('@')[0]
    }
    
    return 'Artist'
  }

  const getAvatarInitial = (): string => {
    const name = getDisplayName()
    return name.charAt(0).toUpperCase()
  }

  const displayName = getDisplayName()
  const avatarInitial = getAvatarInitial()

  useEffect(() => {
    initializeUser()
  }, [])

  const initializeUser = async () => {
    try {
      setIsLoading(true)
      
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Initialization timeout')), 10000)
      )
      
      const initPromise = async () => {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        if (user) {
          setUser(user)
          
          // Try to get artist profile
          const loadedProfile = await loadArtistProfile(user.id)
          await loadArtistStats(user.id)
          
          // Ensure artist account exists in multi-account system
          await ensureArtistAccountExists(user.id)
        }
      }

      // Race between initialization and timeout
      await Promise.race([initPromise(), timeoutPromise])
    } catch (error) {
      console.error('Error initializing user:', error)
      // Even on error, we should stop loading to prevent infinite loading states
    } finally {
      setIsLoading(false)
    }
  }

  const ensureArtistAccountExists = async (userId: string) => {
    try {
      // Check if artist account relationship exists
      const { data: existingRelation, error } = await supabase
        .from('account_relationships')
        .select('*')
        .eq('owner_user_id', userId)
        .eq('account_type', 'artist')
        .single()

      if (error && error.code === 'PGRST116') {
        // No relationship exists, create one
        console.log('Creating artist account relationship for user:', userId)
        
        const { error: relationError } = await supabase
          .from('account_relationships')
          .insert({
            owner_user_id: userId,
            owned_profile_id: userId, // Artist profile uses the same user ID
            account_type: 'artist',
            permissions: {},
            is_active: true
          })

        if (relationError) {
          console.error('Error creating artist account relationship:', relationError)
        }
      }
    } catch (error) {
      console.error('Error ensuring artist account exists:', error)
    }
  }

  const loadArtistProfile = async (userId: string): Promise<ArtistProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile exists, create one automatically
          console.log('No artist profile found, creating one for user:', userId)
          const createdProfile = await createArtistProfile(userId)
          return createdProfile
        } else {
          throw error
        }
      } else if (data) {
        setProfile(data)
        
        // Check if artist_name is missing and try to sync it
        if (!data.artist_name) {
          console.log('Artist name is missing, attempting to sync from account data')
          await syncArtistName()
        }
        
        return data
      }
      
      return null
    } catch (error) {
      console.error('Error loading artist profile:', error)
      setProfile(null)
      return null
    }
  }

  const createArtistProfile = async (userId: string): Promise<ArtistProfile | null> => {
    try {
      console.log('Creating artist profile for user:', userId)
      
      // Get artist name from user metadata or account data
      let artistName = null
      
      if (currentAccount?.profile_data?.artist_name) {
        artistName = currentAccount.profile_data.artist_name
      } else if (user?.user_metadata?.full_name) {
        artistName = user.user_metadata.full_name
      } else if (user?.user_metadata?.name) {
        artistName = user.user_metadata.name
      } else if (user?.email) {
        artistName = user.email.split('@')[0]
      }

      // First try to use the SQL function to ensure artist profile exists
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('ensure_artist_profile', { target_user_id: userId })

      if (rpcError) {
        console.log('RPC function not available, creating profile manually:', rpcError)
        
        // Fallback: Create profile manually
        const { error: insertError } = await supabase
          .from('artist_profiles')
          .insert({
            user_id: userId,
            artist_name: artistName,
            bio: null,
            genres: [],
            social_links: {},
            verification_status: 'unverified',
            account_tier: 'free',
            settings: {}
          })

        if (insertError && insertError.code !== '23505') { // 23505 is unique constraint violation (already exists)
          throw insertError
        }
      }

      // Update the profile with the artist name if we have one
      if (artistName) {
        const { error: updateError } = await supabase
          .from('artist_profiles')
          .update({ artist_name: artistName })
          .eq('user_id', userId)

        if (updateError) {
          console.error('Error updating artist name:', updateError)
        }
      }

      // Reload the profile after creation
      const { data: newProfile, error: loadError } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (loadError) throw loadError
      if (newProfile) {
        console.log('Artist profile created/loaded successfully:', newProfile)
        setProfile(newProfile)
        return newProfile
      }
      
      return null
    } catch (error) {
      console.error('Error creating artist profile:', error)
      setProfile(null)
      return null
    }
  }

  const syncArtistName = async (): Promise<boolean> => {
    if (!user?.id || !profile) return false

    try {
      let artistName = null
      
      // Priority order: account data, user metadata, email
      if (currentAccount?.profile_data?.artist_name) {
        artistName = currentAccount.profile_data.artist_name
      } else if (user?.user_metadata?.full_name) {
        artistName = user.user_metadata.full_name
      } else if (user?.user_metadata?.name) {
        artistName = user.user_metadata.name
      } else if (user?.email) {
        artistName = user.email.split('@')[0]
      }

      if (artistName && artistName !== profile.artist_name) {
        const { error } = await supabase
          .from('artist_profiles')
          .update({ 
            artist_name: artistName,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (error) throw error

        // Update local state
        setProfile(prev => prev ? { ...prev, artist_name: artistName } : prev)
        console.log('Artist name synced successfully:', artistName)
        return true
      }

      return false
    } catch (error) {
      console.error('Error syncing artist name:', error)
      return false
    }
  }

  const loadArtistStats = async (userId: string) => {
    try {
      // Try to get enhanced analytics from the new function
      const { data: enhancedStats, error: enhancedError } = await supabase
        .rpc('get_dashboard_analytics', { p_user_id: userId })

      if (!enhancedError && enhancedStats) {
        // Use the enhanced stats directly
        setStats({
          totalRevenue: enhancedStats.totalRevenue || 0,
          totalFans: enhancedStats.totalFans || 0,
          totalStreams: enhancedStats.totalStreams || 0,
          engagementRate: enhancedStats.engagementRate || 0,
          monthlyListeners: enhancedStats.monthlyListeners || 0,
          totalTracks: enhancedStats.totalTracks || 0,
          totalEvents: enhancedStats.totalEvents || 0,
          totalCollaborations: enhancedStats.totalCollaborations || 0,
          musicCount: enhancedStats.musicCount || 0,
          videoCount: enhancedStats.videoCount || 0,
          photoCount: enhancedStats.photoCount || 0,
          blogCount: enhancedStats.blogCount || 0,
          eventCount: enhancedStats.eventCount || 0,
          merchandiseCount: enhancedStats.merchandiseCount || 0,
          totalPlays: enhancedStats.totalPlays || 0,
          totalViews: enhancedStats.totalViews || 0
        })
        return
      }

      // Fallback to basic content stats if enhanced function not available
      const { data: contentStats, error } = await supabase
        .rpc('get_artist_content_stats', { artist_user_id: userId })

      if (error) {
        console.error('Error loading content stats:', error)
        return
      }

      const basicStats: ArtistStats = {
        // Real data from database
        musicCount: contentStats?.music_count || 0,
        videoCount: contentStats?.video_count || 0,
        photoCount: contentStats?.photo_count || 0,
        blogCount: contentStats?.blog_count || 0,
        eventCount: contentStats?.event_count || 0,
        merchandiseCount: contentStats?.merchandise_count || 0,
        totalPlays: contentStats?.total_plays || 0,
        totalViews: contentStats?.total_views || 0,
        
        // Calculated/derived stats
        totalTracks: contentStats?.music_count || 0,
        totalEvents: contentStats?.event_count || 0,
        totalFans: 0,
        engagementRate: 0,
        
        // Placeholder for features not yet implemented
        totalRevenue: 0,
        totalStreams: contentStats?.total_plays || 0,
        monthlyListeners: Math.round((contentStats?.total_plays || 0) * 0.3),
        totalCollaborations: 0
      }
      
      setStats(basicStats)
    } catch (error) {
      console.error('Error loading artist stats:', error)
      // Keep default stats on error
    }
  }

  const updateProfile = async (data: Partial<ArtistProfile>): Promise<boolean> => {
    if (!user || !profile) return false

    try {
      const { error } = await supabase
        .from('artist_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      // Update local state
      setProfile(prev => prev ? { ...prev, ...data } : prev)
      return true
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  }

  const createContent = async (type: string, data: any) => {
    if (!user || !profile) throw new Error('User not authenticated or no artist profile')

    const contentData = {
      user_id: user.id,
      artist_profile_id: profile.id,
      ...data
    }

    try {
      let result
      switch (type) {
        case 'music':
          const { data: musicData, error: musicError } = await supabase
            .from('artist_music')
            .insert(contentData)
            .select()
            .single()
          if (musicError) throw musicError
          result = musicData
          break

        case 'video':
          const { data: videoData, error: videoError } = await supabase
            .from('artist_videos')
            .insert(contentData)
            .select()
            .single()
          if (videoError) throw videoError
          result = videoData
          break

        case 'photo':
          const { data: photoData, error: photoError } = await supabase
            .from('artist_photos')
            .insert(contentData)
            .select()
            .single()
          if (photoError) throw photoError
          result = photoData
          break

        case 'blog':
          const { data: blogData, error: blogError } = await supabase
            .from('artist_blog_posts')
            .insert(contentData)
            .select()
            .single()
          if (blogError) throw blogError
          result = blogData
          break

        case 'event':
          const { data: eventData, error: eventError } = await supabase
            .from('artist_events')
            .insert(contentData)
            .select()
            .single()
          if (eventError) throw eventError
          result = eventData
          break

        case 'merchandise':
          const { data: merchData, error: merchError } = await supabase
            .from('artist_merchandise')
            .insert(contentData)
            .select()
            .single()
          if (merchError) throw merchError
          result = merchData
          break

        default:
          throw new Error(`Unsupported content type: ${type}`)
      }

      // Refresh stats after creating content
      await refreshStats()
      
      return result
    } catch (error) {
      console.error(`Error creating ${type}:`, error)
      throw error
    }
  }

  const refreshStats = async () => {
    if (user) {
      await loadArtistStats(user.id)
    }
  }

  const updateDetailedProfile = async (profileData: any): Promise<{ success: boolean; errors?: string[] }> => {
    console.log('🔍 updateDetailedProfile called with conditions:')
    console.log('  - User exists:', !!user)
    console.log('  - User ID:', user?.id)
    console.log('  - Profile exists:', !!profile)
    console.log('  - Profile ID:', profile?.id)
    console.log('  - Is loading:', isLoading)
    
    // Ensure we have user and profile data
    let currentUser = user
    let currentProfile = profile
    
    if (!currentUser) {
      console.log('⚠️  No user found, attempting to get current user...')
      const { data: { user: freshUser }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('❌ Failed to get current user:', error)
        return { success: false, errors: ['Authentication failed. Please log in again.'] }
      }
      if (!freshUser) {
        return { success: false, errors: ['You must be logged in to save your profile.'] }
      }
      currentUser = freshUser
      setUser(freshUser)
    }
    
    if (!currentProfile) {
      console.log('⚠️  No profile found, attempting to load for user:', currentUser.id)
      currentProfile = await loadArtistProfile(currentUser.id)
      if (!currentProfile) {
        return { success: false, errors: ['Artist profile not found. Please refresh the page and try again.'] }
      }
    }
    
    // Now we definitely have both user and profile
    const workingUser = currentUser
    const workingProfile = currentProfile

    const errors: string[] = []
    
    try {
      console.log('🔍 Starting updateDetailedProfile for user:', workingUser.id)
      console.log('📊 Current profile:', workingProfile)
      console.log('📝 Form data received:', profileData)

      // Validate required fields
      if (profileData.stage_name && profileData.stage_name.trim().length < 2) {
        errors.push('Artist name must be at least 2 characters long')
      }
      
      if (profileData.bio && profileData.bio.length > 1000) {
        errors.push('Bio must be 1000 characters or less')
      }

      if (profileData.contact_email && !isValidEmail(profileData.contact_email)) {
        errors.push('Please enter a valid contact email')
      }

      if (profileData.website && !isValidUrl(profileData.website)) {
        errors.push('Please enter a valid website URL')
      }

      // Check for validation errors
      if (errors.length > 0) {
        console.log('❌ Validation errors:', errors)
        return { success: false, errors }
      }

      // Prepare core profile data
      const coreProfileData = {
        artist_name: profileData.stage_name || workingProfile.artist_name,
        bio: profileData.bio || workingProfile.bio,
        genres: profileData.genre ? [profileData.genre] : workingProfile.genres || [],
        social_links: {
          ...workingProfile.social_links,
          website: profileData.website || '',
          instagram: profileData.instagram || '',
          twitter: profileData.twitter || '',
          youtube: profileData.youtube || '',
          spotify: profileData.spotify || ''
        }
      }

      // Prepare settings data for additional fields
      const settingsData = {
        ...workingProfile.settings,
        professional: {
          contact_email: profileData.contact_email || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          booking_rate: profileData.booking_rate || '',
          availability: profileData.availability || '',
          equipment: profileData.equipment || '',
          music_style: profileData.music_style || '',
          experience_years: profileData.experience_years || '',
          notable_performances: profileData.notable_performances || '',
          record_label: profileData.record_label || '',
          awards: profileData.awards || '',
          upcoming_releases: profileData.upcoming_releases || ''
        },
        preferences: {
          collaboration_interest: Boolean(profileData.collaboration_interest),
          available_for_hire: Boolean(profileData.available_for_hire),
          newsletter_signup: Boolean(profileData.newsletter_signup),
          privacy_settings: profileData.privacy_settings || 'public',
          preferred_contact: profileData.preferred_contact || 'email'
        },
        last_updated: new Date().toISOString()
      }

      console.log('💾 Core profile data to save:', coreProfileData)
      console.log('⚙️  Settings data to save:', settingsData)

      // First, let's check if the settings column exists
      try {
        const { data: testData, error: testError } = await supabase
          .from('artist_profiles')
          .select('settings')
          .eq('user_id', workingUser.id)
          .single()

        if (testError) {
          console.log('❌ Error checking settings column:', testError)
          if (testError.message.includes('column "settings" does not exist')) {
            return { 
              success: false, 
              errors: [
                'Database schema error: The artist_profiles table is missing the settings column.',
                'Please run the fix_artist_settings_table.sql migration in your Supabase dashboard.',
                'Go to: Supabase Dashboard → SQL Editor → Run the migration script.'
              ] 
            }
          }
        } else {
          console.log('✅ Settings column exists, current value:', testData?.settings)
        }
      } catch (schemaError) {
        console.log('❌ Schema check error:', schemaError)
        return { 
          success: false, 
          errors: ['Database connection error. Please check your Supabase configuration.'] 
        }
      }

      // Update the profile in the database
      console.log('🚀 Attempting to save to database...')
      
      const updatePayload = {
        ...coreProfileData,
        settings: settingsData,
        updated_at: new Date().toISOString()
      }

      console.log('📦 Full update payload:', updatePayload)

      const { data: updateResult, error } = await supabase
        .from('artist_profiles')
        .update(updatePayload)
        .eq('user_id', workingUser.id)
        .select()

      if (error) {
        console.error('❌ Database error details:', error)
        
        // Provide specific error messages based on error type
        let errorMessage = 'Failed to save changes. Please try again.'
        
        if (error.message.includes('column "settings" does not exist')) {
          errorMessage = 'Database schema error: Missing settings column. Please run the database migration.'
        } else if (error.message.includes('permission denied')) {
          errorMessage = 'Permission denied. Please check your account permissions.'
        } else if (error.message.includes('row-level security')) {
          errorMessage = 'Security error. You can only edit your own artist profile.'
        } else if (error.code === 'PGRST116') {
          errorMessage = 'Artist profile not found. Please contact support.'
        }
        
        return { success: false, errors: [errorMessage, `Technical details: ${error.message}`] }
      }

      console.log('✅ Database update successful:', updateResult)

      // Update local state
      setProfile(prev => prev ? { 
        ...prev, 
        ...coreProfileData,
        settings: settingsData
      } : prev)

      console.log('✅ Local state updated successfully')

      return { success: true }
    } catch (error: any) {
      console.error('❌ Unexpected error in updateDetailedProfile:', error)
      return { 
        success: false, 
        errors: [
          'An unexpected error occurred. Please try again.',
          `Error details: ${error.message || 'Unknown error'}`
        ] 
      }
    }
  }

  // Helper validation functions
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const value: ArtistContextType = {
    user,
    profile,
    isLoading,
    displayName,
    avatarInitial,
    stats,
    updateProfile,
    refreshStats,
    syncArtistName,
    updateDetailedProfile,
    createContent,
    features
  }

  return (
    <ArtistContext.Provider value={value}>
      {children}
    </ArtistContext.Provider>
  )
}

export function useArtist() {
  const context = useContext(ArtistContext)
  if (context === undefined) {
    throw new Error('useArtist must be used within an ArtistProvider')
  }
  return context
}

export type { ArtistProfile, ArtistStats, ArtistContextType } 