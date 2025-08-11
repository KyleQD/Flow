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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface StorageCheckResult {
  bucketName: string
  exists: boolean
  public: boolean
  fileCount: number
  error?: string
  policies: {
    select: boolean
    insert: boolean
    update: boolean
    delete: boolean
  }
}

async function checkStorageStatus() {
  console.log('🔍 Checking Supabase Storage Status...\n')

  const expectedBuckets = [
    'avatars',
    'post-media', 
    'venue-media',
    'event-media',
    'documents',
    'profile-images'
  ]

  const results: StorageCheckResult[] = []

  try {
    // Get all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Failed to list storage buckets:', bucketsError.message)
      return
    }

    console.log(`✅ Found ${buckets.length} storage buckets`)
    console.log('📦 Available buckets:', buckets.map(b => b.name).join(', '))

    // Check each expected bucket
    for (const bucketName of expectedBuckets) {
      console.log(`\n🔍 Checking bucket: ${bucketName}`)
      
      const bucket = buckets.find(b => b.name === bucketName)
      const result: StorageCheckResult = {
        bucketName,
        exists: !!bucket,
        public: bucket?.public || false,
        fileCount: 0,
        policies: {
          select: false,
          insert: false,
          update: false,
          delete: false
        }
      }

      if (bucket) {
        console.log(`   ✅ Bucket exists`)
        console.log(`   📊 Public: ${bucket.public ? 'Yes' : 'No'}`)
        
        // Count files in bucket
        try {
          const { data: files, error: filesError } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 1000 })
          
          if (filesError) {
            console.log(`   ⚠️  Could not list files: ${filesError.message}`)
            result.error = filesError.message
          } else {
            result.fileCount = files?.length || 0
            console.log(`   📁 Files: ${result.fileCount}`)
          }
        } catch (err) {
          console.log(`   ⚠️  Error listing files: ${err}`)
          result.error = err instanceof Error ? err.message : 'Unknown error'
        }

        // Test basic operations
        try {
          // Test SELECT policy
          const { data: testList, error: listError } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 1 })
          
          result.policies.select = !listError
          console.log(`   🔓 SELECT policy: ${result.policies.select ? '✅ Working' : '❌ Failed'}`)
        } catch (err) {
          console.log(`   ❌ SELECT policy test failed: ${err}`)
        }

      } else {
        console.log(`   ❌ Bucket does not exist`)
      }

      results.push(result)
    }

    // Summary
    console.log('\n📊 Storage Status Summary:')
    console.log('========================')
    
    const existingBuckets = results.filter(r => r.exists)
    const missingBuckets = results.filter(r => !r.exists)
    
    console.log(`✅ Existing buckets: ${existingBuckets.length}/${expectedBuckets.length}`)
    existingBuckets.forEach(bucket => {
      console.log(`   • ${bucket.bucketName} (${bucket.fileCount} files, ${bucket.public ? 'public' : 'private'})`)
    })
    
    if (missingBuckets.length > 0) {
      console.log(`\n❌ Missing buckets: ${missingBuckets.length}`)
      missingBuckets.forEach(bucket => {
        console.log(`   • ${bucket.bucketName}`)
      })
    }

    // Check for any critical issues
    const criticalBuckets = ['avatars', 'post-media', 'venue-media']
    const missingCritical = criticalBuckets.filter(name => 
      !results.find(r => r.bucketName === name && r.exists)
    )

    if (missingCritical.length > 0) {
      console.log('\n🚨 CRITICAL: Missing essential buckets:')
      missingCritical.forEach(name => console.log(`   • ${name}`))
      console.log('\n💡 To fix, run the storage setup script:')
      console.log('   Copy and paste the contents of supabase/setup-storage-buckets.sql into your Supabase SQL Editor')
    } else {
      console.log('\n✅ All critical storage buckets are present!')
    }

    // Test file upload functionality (if authenticated)
    console.log('\n🧪 Testing upload functionality...')
    try {
      // Create a test file
      const testContent = 'test file content'
      const testFile = new Blob([testContent], { type: 'text/plain' })
      
      // Try to upload to avatars bucket (should work with service role)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload('test-file.txt', testFile, {
          upsert: true
        })

      if (uploadError) {
        console.log(`   ⚠️  Upload test failed: ${uploadError.message}`)
      } else {
        console.log('   ✅ Upload test successful')
        
        // Clean up test file
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(['test-file.txt'])
        
        if (deleteError) {
          console.log(`   ⚠️  Test file cleanup failed: ${deleteError.message}`)
        } else {
          console.log('   ✅ Test file cleaned up')
        }
      }
    } catch (err) {
      console.log(`   ❌ Upload test failed: ${err}`)
    }

    console.log('\n🎉 Storage status check completed!')
    
    if (missingCritical.length === 0) {
      console.log('✅ Your storage system is ready to use!')
    } else {
      console.log('⚠️  Please fix the missing buckets before using storage features')
    }

  } catch (error) {
    console.error('\n❌ Storage check failed:', error)
    process.exit(1)
  }
}

// Run the check
checkStorageStatus() 