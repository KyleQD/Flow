// Main auth module exports
export { authenticateApiRequest, checkAdminPermissions, checkAuth } from './api-auth'
export { authOptions } from '../supabase/auth'

// Create aliases for backward compatibility
export { authenticateApiRequest as parseAuthFromCookies } from './api-auth'
export { authenticateApiRequest as authenticateUser } from './api-auth'