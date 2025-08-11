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

async function checkDatabaseSchema() {
  console.log('🔍 Checking Database Schema...\n')

  try {
    // Check profiles table structure
    console.log('📋 Profiles table structure:')
    const { data: profilesColumns, error: profilesError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'profiles')
      .order('ordinal_position')
    
    if (profilesError) {
      console.log(`❌ Error checking profiles schema: ${profilesError.message}`)
    } else if (profilesColumns) {
      console.log(`✅ Found ${profilesColumns.length} columns in profiles table:`)
      profilesColumns.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
    }

    console.log('')

    // Check posts table structure
    console.log('📋 Posts table structure:')
    const { data: postsColumns, error: postsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'posts')
      .order('ordinal_position')
    
    if (postsError) {
      console.log(`❌ Error checking posts schema: ${postsError.message}`)
    } else if (postsColumns) {
      console.log(`✅ Found ${postsColumns.length} columns in posts table:`)
      postsColumns.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
    }

    console.log('')

    // Check for any storage-related columns in profiles
    console.log('🔍 Looking for storage-related columns in profiles:')
    const storageColumns = profilesColumns?.filter(col => 
      col.column_name.includes('url') || 
      col.column_name.includes('avatar') || 
      col.column_name.includes('image') ||
      col.column_name.includes('media') ||
      col.column_name.includes('photo')
    ) || []
    
    if (storageColumns.length > 0) {
      console.log(`✅ Found ${storageColumns.length} storage-related columns:`)
      storageColumns.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type})`)
      })
    } else {
      console.log(`📭 No storage-related columns found in profiles table`)
    }

    console.log('')

    // Check for any storage-related columns in posts
    console.log('🔍 Looking for storage-related columns in posts:')
    const postStorageColumns = postsColumns?.filter(col => 
      col.column_name.includes('url') || 
      col.column_name.includes('media') || 
      col.column_name.includes('image') ||
      col.column_name.includes('photo') ||
      col.column_name.includes('file')
    ) || []
    
    if (postStorageColumns.length > 0) {
      console.log(`✅ Found ${postStorageColumns.length} storage-related columns:`)
      postStorageColumns.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type})`)
      })
    } else {
      console.log(`📭 No storage-related columns found in posts table`)
    }

    console.log('')

    // Check sample data from profiles
    console.log('📊 Sample profiles data:')
    const { data: sampleProfiles, error: sampleError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3)
    
    if (sampleError) {
      console.log(`❌ Error fetching sample profiles: ${sampleError.message}`)
    } else if (sampleProfiles && sampleProfiles.length > 0) {
      console.log(`✅ Found ${sampleProfiles.length} sample profiles:`)
      sampleProfiles.forEach((profile, index) => {
        console.log(`   Profile ${index + 1}:`)
        Object.entries(profile).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            console.log(`     ${key}: ${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value}`)
          }
        })
      })
    } else {
      console.log(`📭 No profiles found`)
    }

    console.log('')

    // Check sample data from posts
    console.log('📊 Sample posts data:')
    const { data: samplePosts, error: postsSampleError } = await supabase
      .from('posts')
      .select('*')
      .limit(3)
    
    if (postsSampleError) {
      console.log(`❌ Error fetching sample posts: ${postsSampleError.message}`)
    } else if (samplePosts && samplePosts.length > 0) {
      console.log(`✅ Found ${samplePosts.length} sample posts:`)
      samplePosts.forEach((post, index) => {
        console.log(`   Post ${index + 1}:`)
        Object.entries(post).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            console.log(`     ${key}: ${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value}`)
          }
        })
      })
    } else {
      console.log(`📭 No posts found`)
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error)
  }

  console.log('\n🎉 Database schema check completed!')
}

checkDatabaseSchema() 