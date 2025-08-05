/**
 * Avatar utility functions for handling different image formats
 */

/**
 * Resolves avatar source to handle both JPG and SVG formats
 * Falls back to SVG if JPG is not available
 */
export function resolveAvatarSrc(avatar: string | undefined): string {
  if (!avatar) {
    return '/avatars/default.svg'
  }

  // If it's already an SVG, return as-is
  if (avatar.endsWith('.svg')) {
    return avatar
  }

  // If it's a JPG, try to resolve to SVG equivalent
  if (avatar.endsWith('.jpg') || avatar.endsWith('.jpeg')) {
    return avatar.replace(/\.(jpg|jpeg)$/, '.svg')
  }

  // If no extension, assume it's a filename and add .svg
  if (!avatar.includes('.')) {
    return `/avatars/${avatar}.svg`
  }

  // Return as-is for other formats
  return avatar
}

/**
 * Generates a default avatar SVG for a given name and color
 */
export function generateDefaultAvatar(name: string, color: string = '#8B5CF6'): string {
  const initial = name.charAt(0).toUpperCase()
  
  const svg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="${color}"/>
    <text x="50" y="50" text-anchor="middle" dominant-baseline="central" 
          font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white">
      ${initial}
    </text>
  </svg>`
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Gets avatar initials from a name
 */
export function getAvatarInitials(name: string): string {
  if (!name) return 'U'
  
  const names = name.trim().split(' ')
  if (names.length >= 2) {
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
  }
  
  return name.charAt(0).toUpperCase()
}

/**
 * Gets a deterministic color for a user based on their name/id
 */
export function getUserColor(identifier: string): string {
  const colors = [
    '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1',
    '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#06B6D4'
  ]
  
  // Simple hash function to get consistent color
  let hash = 0
  for (let i = 0; i < identifier.length; i++) {
    hash = ((hash << 5) - hash) + identifier.charCodeAt(i)
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return colors[Math.abs(hash) % colors.length]
}