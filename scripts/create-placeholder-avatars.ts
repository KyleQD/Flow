#!/usr/bin/env npx tsx

import { writeFileSync } from 'fs'
import { join } from 'path'

// Create simple SVG placeholder avatars
function createSVGAvatar(name: string, color: string): string {
  const initial = name.charAt(0).toUpperCase()
  return `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="${color}"/>
  <text x="50" y="50" text-anchor="middle" dominant-baseline="central" 
        font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white">
    ${initial}
  </text>
</svg>`
}

async function createPlaceholderAvatars() {
  console.log('🎨 Creating placeholder avatar images...\n')

  const avatars = [
    { name: 'sarah.jpg', initial: 'S', color: '#8B5CF6' },
    { name: 'mike.jpg', initial: 'M', color: '#10B981' },
    { name: 'community.jpg', initial: 'C', color: '#F59E0B' },
    { name: 'alex.jpg', initial: 'A', color: '#EF4444' },
    { name: 'luna.jpg', initial: 'L', color: '#6366F1' },
    { name: 'emma.jpg', initial: 'E', color: '#EC4899' },
    { name: 'artist-user-123.jpg', initial: 'A', color: '#14B8A6' },
    { name: 'user-7.jpg', initial: 'U', color: '#F97316' },
    { name: 'user-0.jpg', initial: 'U', color: '#84CC16' },
    { name: 'user-1.jpg', initial: 'U', color: '#06B6D4' },
    { name: 'user-2.jpg', initial: 'U', color: '#8B5CF6' },
    { name: 'user-3.jpg', initial: 'U', color: '#10B981' },
    { name: 'user-4.jpg', initial: 'U', color: '#F59E0B' },
    { name: 'user-5.jpg', initial: 'U', color: '#EF4444' },
    { name: 'user-6.jpg', initial: 'U', color: '#6366F1' },
    { name: 'user-8.jpg', initial: 'U', color: '#EC4899' },
    { name: 'user-9.jpg', initial: 'U', color: '#14B8A6' },
    { name: 'user-10.jpg', initial: 'U', color: '#F97316' }
  ]

  try {
    for (const avatar of avatars) {
      const svgContent = createSVGAvatar(avatar.initial, avatar.color)
      const filePath = join('public', 'avatars', avatar.name.replace('.jpg', '.svg'))
      
      writeFileSync(filePath, svgContent)
      console.log(`   ✅ Created avatar: ${avatar.name} → ${avatar.name.replace('.jpg', '.svg')}`)
    }

    console.log('\n🎉 Placeholder avatars created successfully!')
    console.log('📝 Note: These are SVG placeholders. Replace with actual images as needed.')

  } catch (error) {
    console.error('\n❌ Error creating placeholder avatars:', error)
  }
}

// Run the script
createPlaceholderAvatars()