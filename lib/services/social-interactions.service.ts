import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface SocialInteraction {
  type: 'follow' | 'unfollow' | 'like' | 'unlike' | 'comment' | 'share'
  targetId: string
  targetType: 'profile' | 'post' | 'event' | 'music'
  content?: string
  userId?: string
}

export interface InteractionResponse {
  success: boolean
  message: string
  data?: any
}

class SocialInteractionsService {
  // Profile Interactions
  async followProfile(profileId: string, userId?: string): Promise<InteractionResponse> {
    try {
      if (!userId) {
        return { success: false, message: 'Please log in to follow profiles' }
      }

      if (userId === profileId) {
        return { success: false, message: 'You cannot follow yourself' }
      }

      // Use API endpoint instead of direct database call
      const response = await fetch('/api/demo-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'follow',
          profileId,
          userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to follow profile')
      }

      return { 
        success: true, 
        message: 'Profile followed successfully! 🎵',
        data: { action: 'follow', profileId, userId }
      }
    } catch (error) {
      console.error('Error following profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { 
        success: false, 
        message: `Failed to follow profile: ${errorMessage}` 
      }
    }
  }

  async unfollowProfile(profileId: string, userId?: string): Promise<InteractionResponse> {
    try {
      if (!userId) {
        return { success: false, message: 'Please log in to unfollow profiles' }
      }

      // Use API endpoint instead of direct database call
      const response = await fetch('/api/demo-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unfollow',
          profileId,
          userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to unfollow profile')
      }

      return { 
        success: true, 
        message: 'Profile unfollowed',
        data: { action: 'unfollow', profileId, userId }
      }
    } catch (error) {
      console.error('Error unfollowing profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return { success: false, message: `Failed to unfollow profile: ${errorMessage}` }
    }
  }

  async checkFollowStatus(profileId: string, userId?: string): Promise<boolean> {
    try {
      if (!userId) return false

      // Use API endpoint to check follow status
      const response = await fetch(`/api/demo-accounts?action=checkFollow&profileId=${profileId}&userId=${userId}`)
      
      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.isFollowing || false
    } catch (error) {
      console.error('Error checking follow status:', error)
      return false
    }
  }

  // Post Interactions
  async likePost(postId: string, userId?: string): Promise<InteractionResponse> {
    try {
      if (!userId) {
        return { success: false, message: 'Please log in to like posts' }
      }

      // Use API endpoint instead of direct database call
      const response = await fetch('/api/demo-accounts/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'like',
          postId,
          userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to like post')
      }

      return { 
        success: true, 
        message: 'Post liked! ❤️',
        data: { action: 'like', postId, userId }
      }
    } catch (error) {
      console.error('Error liking post - Full error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error liking post - Message:', errorMessage)
      return { 
        success: false, 
        message: `Failed to like post: ${errorMessage}` 
      }
    }
  }

  async unlikePost(postId: string, userId?: string): Promise<InteractionResponse> {
    try {
      if (!userId) {
        return { success: false, message: 'Please log in to unlike posts' }
      }

      // Use API endpoint instead of direct database call
      const response = await fetch('/api/demo-accounts/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unlike',
          postId,
          userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to unlike post')
      }

      return { 
        success: true, 
        message: 'Post unliked',
        data: { action: 'unlike', postId, userId }
      }
    } catch (error) {
      console.error('Error unliking post - Full error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error unliking post - Message:', errorMessage)
      return { 
        success: false, 
        message: `Failed to unlike post: ${errorMessage}` 
      }
    }
  }

  async commentOnPost(postId: string, content: string, userId?: string): Promise<InteractionResponse> {
    try {
      if (!userId) {
        return { success: false, message: 'Please log in to comment on posts' }
      }

      if (!content.trim()) {
        return { success: false, message: 'Comment cannot be empty' }
      }

      const { data, error } = await supabase
        .from('demo_comments')
        .insert({
          post_id: postId,
          profile_id: userId,
          content: content.trim()
        })
        .select()

      if (error) {
        throw error
      }

      return { 
        success: true, 
        message: 'Comment added! 💬',
        data: { action: 'comment', postId, userId, comment: data[0] }
      }
    } catch (error) {
      console.error('Error commenting on post:', error)
      return { success: false, message: 'Failed to add comment' }
    }
  }

  async checkLikeStatus(postId: string, userId?: string): Promise<boolean> {
    try {
      if (!userId) return false

      // Use API endpoint to check like status
      const response = await fetch(`/api/demo-accounts/posts?action=checkLike&postId=${postId}&userId=${userId}`)
      
      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.isLiked || false
    } catch (error) {
      console.error('Error checking like status:', error)
      return false
    }
  }

  async getPostLikes(postId: string): Promise<{ count: number; isLiked: boolean; userId?: string }> {
    try {
      const { data, error } = await supabase
        .from('demo_likes')
        .select('profile_id')
        .eq('post_id', postId)

      if (error) {
        throw error
      }

      const userId = this.getCurrentUserId()
      const isLiked = userId ? await this.checkLikeStatus(postId, userId) : false

      return {
        count: data?.length || 0,
        isLiked,
        userId: userId || undefined
      }
    } catch (error) {
      console.error('Error getting post likes:', error)
      return { count: 0, isLiked: false }
    }
  }

  async getPostComments(postId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('demo_comments')
        .select(`
          *,
          profile:demo_profiles(
            id,
            username,
            avatar_url,
            verified,
            profile_data
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error getting post comments:', error)
      return []
    }
  }

  // Messaging
  async sendMessage(recipientId: string, content: string, senderId?: string): Promise<InteractionResponse> {
    try {
      if (!senderId) {
        return { success: false, message: 'Please log in to send messages' }
      }

      if (!content.trim()) {
        return { success: false, message: 'Message cannot be empty' }
      }

      const { data, error } = await supabase
        .from('demo_messages')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          content: content.trim()
        })
        .select()

      if (error) {
        throw error
      }

      return { 
        success: true, 
        message: 'Message sent! 📩',
        data: { action: 'message', recipientId, senderId, message: data[0] }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false, message: 'Failed to send message' }
    }
  }

  // Sharing
  async shareProfile(profileId: string, platform?: string): Promise<InteractionResponse> {
    try {
      // Get profile data for sharing
      const { data: profile, error } = await supabase
        .from('demo_profiles')
        .select('username, profile_data, bio')
        .eq('id', profileId)
        .single()

      if (error || !profile) {
        throw new Error('Profile not found')
      }

      const displayName = profile.profile_data?.name || 
                          profile.profile_data?.artist_name || 
                          profile.profile_data?.venue_name || 
                          profile.username

      const shareData = {
        title: `Check out ${displayName} on Tourify`,
        text: profile.bio || `Discover ${displayName} on Tourify`,
        url: `${window.location.origin}/profile/${profile.username}`
      }

      if (navigator.share && !platform) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
      }

      return { 
        success: true, 
        message: 'Profile shared! 🔗',
        data: { action: 'share', profileId, shareData }
      }
    } catch (error) {
      console.error('Error sharing profile:', error)
      return { success: false, message: 'Failed to share profile' }
    }
  }

  async sharePost(postId: string, platform?: string): Promise<InteractionResponse> {
    try {
      // Get post data for sharing
      const { data: post, error } = await supabase
        .from('demo_posts')
        .select(`
          *,
          profile:demo_profiles(username, profile_data)
        `)
        .eq('id', postId)
        .single()

      if (error || !post) {
        throw new Error('Post not found')
      }

      const displayName = post.profile.profile_data?.name || 
                          post.profile.profile_data?.artist_name || 
                          post.profile.profile_data?.venue_name || 
                          post.profile.username

      const shareData = {
        title: `Check out this post from ${displayName}`,
        text: post.content,
        url: `${window.location.origin}/profile/${post.profile.username}`
      }

      if (navigator.share && !platform) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`)
      }

      return { 
        success: true, 
        message: 'Post shared! 🔗',
        data: { action: 'share', postId, shareData }
      }
    } catch (error) {
      console.error('Error sharing post:', error)
      return { success: false, message: 'Failed to share post' }
    }
  }

  // Analytics and Stats
  async trackInteraction(interaction: SocialInteraction): Promise<void> {
    try {
      // In a real app, you'd track analytics here
      console.log('Interaction tracked:', interaction)
    } catch (error) {
      console.error('Error tracking interaction:', error)
    }
  }

  async getProfileStats(profileId: string): Promise<any> {
    try {
      const { data: profile, error } = await supabase
        .from('demo_profiles')
        .select('stats')
        .eq('id', profileId)
        .single()

      if (error) {
        throw error
      }

      return profile.stats || {}
    } catch (error) {
      console.error('Error getting profile stats:', error)
      return {}
    }
  }

  // Utility functions
  getCurrentUserId(): string | null {
    // For demo purposes, we'll use one of the existing demo profile IDs
    // In a real app, you'd get this from auth context
    // Using Sarah's profile ID as the current user for demo interactions
    return '6c0a1bb9-9c71-4775-ba28-fd820d69b5da' // musiclover_sarah's ID
  }

  isAuthenticated(): boolean {
    // In a real app, you'd check auth status
    // For demo purposes, return true
    return true
  }
}

export const socialInteractionsService = new SocialInteractionsService()
export default socialInteractionsService