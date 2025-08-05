#!/usr/bin/env npx tsx

/**
 * Script to gradually restore enhanced collaboration components
 */

import { readFileSync, writeFileSync } from 'fs'

async function restoreEnhancedComponents() {
  console.log('🔄 Restoring Enhanced Collaboration Components...\n')

  const communityPagePath = 'app/artist/community/page.tsx'
  
  try {
    let content = readFileSync(communityPagePath, 'utf-8')

    console.log('1. Restoring imports...')
    
    // Restore imports
    content = content.replace(
      /import { SimpleCollaborationHub } from "@\/components\/collaboration\/simple-collaboration-hub"\n\/\/ import { EnhancedCollaborationHub } from "@\/components\/collaboration\/enhanced-collaboration-hub"\n\/\/ import { RealTimeActivityFeed } from "@\/components\/collaboration\/real-time-activity-feed"/,
      `import { EnhancedCollaborationHub } from "@/components/collaboration/enhanced-collaboration-hub"
import { RealTimeActivityFeed } from "@/components/collaboration/real-time-activity-feed"
// Fallback: import { SimpleCollaborationHub } from "@/components/collaboration/simple-collaboration-hub"`
    )

    console.log('2. Restoring EnhancedCollaborationHub...')
    
    // Restore EnhancedCollaborationHub
    content = content.replace(
      /<SimpleCollaborationHub \/>/,
      '<EnhancedCollaborationHub />'
    )

    console.log('3. Restoring RealTimeActivityFeed...')
    
    // Restore RealTimeActivityFeed
    content = content.replace(
      /<Card className="bg-slate-950\/90 border-slate-800 text-white">\s*<CardHeader>\s*<CardTitle>Activity Feed<\/CardTitle>\s*<\/CardHeader>\s*<CardContent>\s*<p className="text-slate-400">Loading activity\.\.\.<\/p>\s*<\/CardContent>\s*<\/Card>/,
      '<RealTimeActivityFeed />'
    )

    // Write the restored content
    writeFileSync(communityPagePath, content)
    
    console.log('✅ Enhanced components restored!')
    console.log('\n🧪 Test the page:')
    console.log('   http://localhost:3000/artist/community')
    console.log('\n⚠️  If you get ChunkLoadError again:')
    console.log('   1. Run: npm run dev (restart server)')
    console.log('   2. Clear browser cache (Cmd+Shift+R)')
    console.log('   3. Try in incognito mode')

  } catch (error) {
    console.error('❌ Error restoring components:', error)
    console.log('\n🔄 Manual restoration steps:')
    console.log('1. Edit app/artist/community/page.tsx')
    console.log('2. Uncomment the enhanced component imports')
    console.log('3. Replace SimpleCollaborationHub with EnhancedCollaborationHub')
    console.log('4. Replace the Card placeholder with RealTimeActivityFeed')
  }
}

// Run the restoration
restoreEnhancedComponents()