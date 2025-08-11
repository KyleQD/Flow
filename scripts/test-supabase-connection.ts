import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

console.log('🔍 Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Service Key:', supabaseServiceKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testConnection() {
  try {
    console.log('\n1. Testing basic database connection...')
    
    // Test a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    
    // Test storage connection
    console.log('\n2. Testing storage connection...')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Storage connection failed:', bucketsError.message)
      return false
    }
    
    console.log('✅ Storage connection successful')
    console.log(`📦 Found ${buckets.length} storage buckets:`)
    buckets.forEach(bucket => {
      console.log(`   • ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })
    
    return true
    
  } catch (error) {
    console.error('❌ Connection test failed:', error)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 All connection tests passed!')
  } else {
    console.log('\n❌ Connection tests failed. Please check your Supabase configuration.')
    process.exit(1)
  }
}) 