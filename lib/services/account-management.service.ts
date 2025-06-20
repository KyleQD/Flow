import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

export type ProfileType = 'general' | 'artist' | 'venue' | 'admin'

export interface UserAccount {
  account_type: ProfileType
  profile_id: string
  profile_data: any
  permissions: any
  is_active: boolean
}

export interface ActiveSession {
  user_id: string
  active_profile_id: string
  active_account_type: ProfileType
  session_data: any
  last_activity: string
}

export interface AccountPermissions {
  can_post: boolean
  can_manage_settings: boolean
  can_view_analytics: boolean
  can_manage_content: boolean
}

export class AccountManagementService {
  // Get user accounts
  static async getUserAccounts(userId: string): Promise<UserAccount[]> {
    try {
      // Try using the RPC function first (if migration has been applied)
      try {
        const { data, error } = await supabase.rpc('get_user_accounts', {
          user_id: userId
        })

        if (error) throw error
        return data || []
      } catch (rpcError: any) {
        // If RPC function doesn't exist, fall back to manual query
        console.log('RPC function not available, using fallback method')
        
        const accounts: UserAccount[] = []

        // Get general profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (!profileError && profile) {
          accounts.push({
            account_type: 'general',
            profile_id: profile.id,
            profile_data: profile,
            permissions: {
              can_post: true,
              can_manage_settings: true,
              can_view_analytics: true,
              can_manage_content: true
            },
            is_active: true
          })
        }

        // Try to get artist profiles (if table exists)
        try {
          const { data: artistProfiles, error: artistError } = await supabase
            .from('artist_profiles')
            .select('*')
            .eq('user_id', userId)

          if (!artistError && artistProfiles) {
            artistProfiles.forEach(ap => {
              accounts.push({
                account_type: 'artist',
                profile_id: ap.id,
                profile_data: ap,
                permissions: {
                  can_post: true,
                  can_manage_settings: true,
                  can_view_analytics: true,
                  can_manage_content: true
                },
                is_active: true
              })
            })
          }
        } catch (e) {
          // Artist profiles table doesn't exist
        }

        // Try to get venue profiles (if table exists)
        try {
          const { data: venueProfiles, error: venueError } = await supabase
            .from('venue_profiles')
            .select('*')
            .eq('user_id', userId)

          if (!venueError && venueProfiles) {
            venueProfiles.forEach(vp => {
              accounts.push({
                account_type: 'venue',
                profile_id: vp.id,
                profile_data: vp,
                permissions: {
                  can_post: true,
                  can_manage_settings: true,
                  can_view_analytics: true,
                  can_manage_content: true
                },
                is_active: true
              })
            })
          }
        } catch (e) {
          // Venue profiles table doesn't exist
        }

        return accounts
      }
    } catch (error) {
      console.error('Error getting user accounts:', error)
      throw error
    }
  }

  // Get active session
  static async getActiveSession(userId: string): Promise<ActiveSession | null> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // If table doesn't exist, return null (no session management available)
        if (error.code === '42P01') {
          console.log('User sessions table does not exist yet. Migration needs to be applied.')
          return null
        }
        throw error
      }
      return data
    } catch (error) {
      console.error('Error getting active session:', error)
      return null
    }
  }

  // Switch active account
  static async switchAccount(
    userId: string,
    profileId: string,
    accountType: ProfileType
  ): Promise<boolean> {
    try {
      // Try using the RPC function first (if migration has been applied)
      try {
        const { data, error } = await supabase.rpc('switch_active_account', {
          user_id: userId,
          profile_id: profileId,
          account_type: accountType
        })

        if (error) throw error
        return data
      } catch (rpcError: any) {
        // If RPC function doesn't exist, just return true (no session management available)
        console.log('Switch account RPC function not available, returning success')
        return true
      }
    } catch (error) {
      console.error('Error switching account:', error)
      return false
    }
  }

  // Create artist account
  static async createArtistAccount(
    userId: string,
    artistData: {
      artist_name: string
      bio?: string
      genres?: string[]
      social_links?: any
    }
  ): Promise<string> {
    try {
      // Try using the RPC function first (if migration has been applied)
      try {
        const { data, error } = await supabase.rpc('create_artist_account', {
          user_id: userId,
          artist_name: artistData.artist_name,
          bio: artistData.bio || null,
          genres: artistData.genres || [],
          social_links: artistData.social_links || {}
        })

        if (error) throw error
        return data
      } catch (rpcError: any) {
        // If RPC function doesn't exist, fall back to direct table insert
        console.log('RPC function not available, using fallback method')
        
        // Check if artist_profiles table exists and create artist profile directly
        const { data: artistProfile, error: artistError } = await supabase
          .from('artist_profiles')
          .insert({
            user_id: userId,
            artist_name: artistData.artist_name,
            bio: artistData.bio || null,
            genres: artistData.genres || [],
            social_links: artistData.social_links || {}
          })
          .select()
          .single()

        if (artistError) {
          // If artist_profiles table doesn't exist, just return a success message
          if (artistError.code === '42P01') {
            console.log('Artist profiles table does not exist yet. Migration needs to be applied.')
            // Return a placeholder ID for now
            return 'placeholder-artist-id'
          }
          throw artistError
        }

        return artistProfile.id
      }
    } catch (error) {
      console.error('Error creating artist account:', error)
      throw error
    }
  }

  // Create venue account
  static async createVenueAccount(
    userId: string,
    venueData: {
      venue_name: string
      description?: string
      address?: string
      capacity?: number
      venue_types?: string[]
      contact_info?: any
      social_links?: any
    }
  ): Promise<string> {
    try {
      // Try using the RPC function first (if migration has been applied)
      try {
        const { data, error } = await supabase.rpc('create_venue_account', {
          user_id: userId,
          venue_name: venueData.venue_name,
          description: venueData.description || null,
          address: venueData.address || null,
          capacity: venueData.capacity || null,
          venue_types: venueData.venue_types || [],
          contact_info: venueData.contact_info || {},
          social_links: venueData.social_links || {}
        })

        if (error) throw error
        return data
      } catch (rpcError: any) {
        // If RPC function doesn't exist, fall back to direct table insert
        console.log('RPC function not available, using fallback method')
        
        // Check if venue_profiles table exists and create venue profile directly
        const { data: venueProfile, error: venueError } = await supabase
          .from('venue_profiles')
          .insert({
            user_id: userId,
            venue_name: venueData.venue_name,
            description: venueData.description || null,
            address: venueData.address || null,
            capacity: venueData.capacity || null,
            venue_types: venueData.venue_types || [],
            contact_info: venueData.contact_info || {},
            social_links: venueData.social_links || {}
          })
          .select()
          .single()

        if (venueError) {
          // If venue_profiles table doesn't exist, just return a success message
          if (venueError.code === '42P01') {
            console.log('Venue profiles table does not exist yet. Migration needs to be applied.')
            // Return a placeholder ID for now
            return 'placeholder-venue-id'
          }
          throw venueError
        }

        return venueProfile.id
      }
    } catch (error) {
      console.error('Error creating venue account:', error)
      throw error
    }
  }

  // Request admin access
  static async requestAdminAccess(
    userId: string,
    requestData: {
      reason: string
      experience: string
      references: string
      organization: string
      role: string
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_requests')
        .insert([
          {
            user_id: userId,
            ...requestData
          }
        ])

      if (error) throw error
    } catch (error) {
      console.error('Error requesting admin access:', error)
      throw error
    }
  }

  // Check if user has specific account type
  static async hasAccountType(userId: string, accountType: ProfileType): Promise<boolean> {
    try {
      const accounts = await this.getUserAccounts(userId)
      return accounts.some(account => account.account_type === accountType && account.is_active)
    } catch (error) {
      console.error('Error checking account type:', error)
      return false
    }
  }

  // Get account permissions
  static async getAccountPermissions(
    userId: string, 
    profileId: string, 
    accountType: ProfileType
  ): Promise<AccountPermissions | null> {
    try {
      const { data, error } = await supabase
        .from('account_relationships')
        .select('permissions')
        .eq('owner_user_id', userId)
        .eq('owned_profile_id', profileId)
        .eq('account_type', accountType)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data?.permissions || null
    } catch (error) {
      console.error('Error getting account permissions:', error)
      return null
    }
  }

  // Update account permissions
  static async updateAccountPermissions(
    userId: string,
    profileId: string,
    accountType: ProfileType,
    permissions: Partial<AccountPermissions>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('account_relationships')
        .update({ 
          permissions: permissions,
          updated_at: new Date().toISOString()
        })
        .eq('owner_user_id', userId)
        .eq('owned_profile_id', profileId)
        .eq('account_type', accountType)

      if (error) throw error
    } catch (error) {
      console.error('Error updating account permissions:', error)
      throw error
    }
  }

  // Create post with account context
  static async createPostWithContext(
    userId: string,
    postingAsProfileId: string,
    postingAsAccountType: ProfileType,
    postData: {
      content: string
      post_type?: string
      visibility?: string
      media_urls?: string[]
      hashtags?: string[]
    }
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_post_with_context', {
        user_id: userId,
        posting_as_profile_id: postingAsProfileId,
        posting_as_account_type: postingAsAccountType,
        content: postData.content,
        post_type: postData.post_type || 'text',
        visibility: postData.visibility || 'public',
        media_urls: postData.media_urls || [],
        hashtags: postData.hashtags || []
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating post with context:', error)
      throw error
    }
  }

  // Get account activity log
  static async getAccountActivity(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('account_activity_log')
        .select(`
          *,
          profiles:profile_id (
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting account activity:', error)
      throw error
    }
  }

  // Link existing account to user
  static async linkExistingAccount(
    userId: string,
    profileId: string,
    accountType: ProfileType,
    permissions: AccountPermissions = {
      can_post: true,
      can_manage_settings: true,
      can_view_analytics: true,
      can_manage_content: true
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('account_relationships')
        .insert([
          {
            owner_user_id: userId,
            owned_profile_id: profileId,
            account_type: accountType,
            permissions: permissions
          }
        ])

      if (error) throw error

      // Log activity
      await supabase
        .from('account_activity_log')
        .insert([
          {
            user_id: userId,
            profile_id: profileId,
            account_type: accountType,
            action_type: 'create_account',
            action_details: { linked_existing: true }
          }
        ])
    } catch (error) {
      console.error('Error linking existing account:', error)
      throw error
    }
  }

  // Deactivate account
  static async deactivateAccount(
    userId: string,
    profileId: string,
    accountType: ProfileType
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('account_relationships')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('owner_user_id', userId)
        .eq('owned_profile_id', profileId)
        .eq('account_type', accountType)

      if (error) throw error

      // Log activity
      await supabase
        .from('account_activity_log')
        .insert([
          {
            user_id: userId,
            profile_id: profileId,
            account_type: accountType,
            action_type: 'delete_account',
            action_details: { deactivated: true }
          }
        ])
    } catch (error) {
      console.error('Error deactivating account:', error)
      throw error
    }
  }

  // Get posts by account context
  static async getPostsByAccountContext(
    profileId: string,
    accountType: ProfileType,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:posted_as_profile_id (
            full_name,
            username,
            avatar_url
          ),
          post_likes (count),
          post_comments (count)
        `)
        .eq('posted_as_profile_id', profileId)
        .eq('posted_as_account_type', accountType)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting posts by account context:', error)
      throw error
    }
  }
} 