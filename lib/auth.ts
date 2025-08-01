import { checkAuth } from "./auth/server"

/**
 * Get authenticated user for API routes using Supabase
 * This function uses the existing checkAuth utility
 */
export async function getAuthUser() {
  try {
    const auth = await checkAuth()
    return auth?.user || null
  } catch (error) {
    console.error('[getAuthUser] Error getting authenticated user:', error)
    return null
  }
} 