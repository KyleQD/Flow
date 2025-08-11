import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkStorageData() {
  console.log('🔍 Checking Storage Data and Files...\n')

  const bucketsToCheck = [
    'avatars',
    'post-media',
    'venue-media',
    'event-media',
    'profile-images',
    'posts',
    'profiles',
    'artist-photos'
  ]

  for (const bucketName of bucketsToCheck) {
    console.log(`📁 Checking ${bucketName} bucket:`)
    
    try {
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 100 })
      
      if (error) {
        console.log(`   ❌ Error listing files: ${error.message}`)
        continue
      }
      
      if (!files || files.length === 0) {
        console.log(`   📭 No files found`)
      } else {
        console.log(`   📄 Found ${files.length} files:`)
        
        // Group files by user/folder
        const fileGroups: Record<string, string[]> = {}
        files.forEach(file => {
          const pathParts = file.name.split('/')
          const userFolder = pathParts[0] || 'root'
          if (!fileGroups[userFolder]) {
            fileGroups[userFolder] = []
          }
          fileGroups[userFolder].push(file.name)
        })
        
        Object.entries(fileGroups).forEach(([folder, fileList]) => {
          console.log(`      📂 ${folder}/ (${fileList.length} files)`)
          fileList.slice(0, 5).forEach(file => {
            const fileName = file.split('/').pop() || file
            console.log(`         • ${fileName}`)
          })
          if (fileList.length > 5) {
            console.log(`         ... and ${fileList.length - 5} more files`)
          }
        })
        
        // Test accessing a few files
        const testFiles = files.slice(0, 3)
        console.log(`   🔗 Testing file access:`)
        
        for (const file of testFiles) {
          try {
            const { data: { publicUrl } } = supabase.storage
              .from(bucketName)
              .getPublicUrl(file.name)
            
            console.log(`      ✅ ${file.name} - URL accessible`)
            
            // Test if the file is actually accessible via HTTP
            try {
              const response = await fetch(publicUrl, { method: 'HEAD' })
              if (response.ok) {
                console.log(`         📡 HTTP accessible (${response.status})`)
              } else {
                console.log(`         ⚠️  HTTP not accessible (${response.status})`)
              }
            } catch (httpError) {
              console.log(`         ⚠️  HTTP test failed: ${httpError}`)
            }
            
          } catch (urlError) {
            console.log(`      ❌ ${file.name} - URL generation failed`)
          }
        }
      }
      
    } catch (err) {
      console.log(`   ❌ Error checking bucket: ${err}`)
    }
    
    console.log('')
  }

  // Check database references to storage files
  console.log('🗄️  Checking database references to storage files...\n')
  
  try {
    // Check profiles table for avatar_url and header_url
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, avatar_url, header_url')
      .not('avatar_url', 'is', null)
      .limit(10)
    
    if (profilesError) {
      console.log(`❌ Error checking profiles: ${profilesError.message}`)
    } else if (profiles && profiles.length > 0) {
      console.log(`✅ Found ${profiles.length} profiles with avatar/header URLs:`)
      profiles.forEach(profile => {
        console.log(`   • User ${profile.id}:`)
        if (profile.avatar_url) console.log(`     Avatar: ${profile.avatar_url}`)
        if (profile.header_url) console.log(`     Header: ${profile.header_url}`)
      })
    } else {
      console.log(`📭 No profiles with avatar/header URLs found`)
    }
    
    // Check posts table for media_url
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, media_url')
      .not('media_url', 'is', null)
      .limit(10)
    
    if (postsError) {
      console.log(`❌ Error checking posts: ${postsError.message}`)
    } else if (posts && posts.length > 0) {
      console.log(`✅ Found ${posts.length} posts with media URLs:`)
      posts.forEach(post => {
        console.log(`   • Post ${post.id}: ${post.media_url}`)
      })
    } else {
      console.log(`📭 No posts with media URLs found`)
    }
    
  } catch (err) {
    console.log(`❌ Error checking database references: ${err}`)
  }

  console.log('\n🎉 Storage data check completed!')
}

checkStorageData() 