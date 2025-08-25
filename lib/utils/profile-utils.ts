/**
 * Utility functions for consistent profile link generation
 */

export interface ProfileData {
  username?: string
  metadata?: {
    username?: string
  }
  user_metadata?: {
    username?: string
  }
  email?: string
}

/**
 * Gets the correct username for profile links, prioritizing the actual database username
 * over metadata or email-derived usernames
 */
export function getProfileUsername(profile: ProfileData | null | undefined): string {
  if (!profile) return 'user'
  
  // Prioritize the actual database username first
  if (profile.username) {
    return profile.username
  }
  
  // Then check metadata username (from email)
  if (profile.metadata?.username) {
    return profile.metadata.username
  }
  
  // Then check user metadata
  if (profile.user_metadata?.username) {
    return profile.user_metadata.username
  }
  
  // Fallback to email prefix
  if (profile.email?.split('@')[0]) {
    return profile.email.split('@')[0]
  }
  
  // Last resort fallback
  return 'user'
}

/**
 * Generates a consistent profile URL path
 */
export function getProfilePath(profile: ProfileData | null | undefined): string {
  const username = getProfileUsername(profile)
  return `/profile/${encodeURIComponent(username)}`
}

/**
 * Validates if a username is valid for profile URLs
 */
export function isValidProfileUsername(username: string): boolean {
  return Boolean(username && username.length > 0 && username !== 'user')
} 