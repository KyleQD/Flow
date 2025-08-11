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

interface BucketStatus {
  name: string
  exists: boolean
  public: boolean
  fileCount: number
  canList: boolean
  canUpload: boolean
  canDelete: boolean
  error?: string
}

async function checkBucketStatus(bucketName: string): Promise<BucketStatus> {
  const status: BucketStatus = {
    name: bucketName,
    exists: false,
    public: false,
    fileCount: 0,
    canList: false,
    canUpload: false,
    canDelete: false
  }

  try {
    // Check if bucket exists and get its properties
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      status.error = bucketsError.message
      return status
    }

    const bucket = buckets.find(b => b.name === bucketName)
    if (!bucket) {
      status.error = 'Bucket not found'
      return status
    }

    status.exists = true
    status.public = bucket.public

    // Test listing files
    try {
      const { data: files, error: listError } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 100 })
      
      if (!listError) {
        status.canList = true
        status.fileCount = files?.length || 0
      } else {
        status.error = `List error: ${listError.message}`
      }
    } catch (err) {
      status.error = `List failed: ${err}`
    }

    // Test upload (only for public buckets to avoid permission issues)
    if (bucket.public) {
      try {
        const testContent = 'test file content'
        const testFile = new Blob([testContent], { type: 'text/plain' })
        const testPath = `test-${Date.now()}.txt`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(testPath, testFile, { upsert: true })
        
        if (!uploadError) {
          status.canUpload = true
          
          // Test delete
          const { error: deleteError } = await supabase.storage
            .from(bucketName)
            .remove([testPath])
          
          if (!deleteError) {
            status.canDelete = true
          }
        } else {
          status.error = `Upload error: ${uploadError.message}`
        }
      } catch (err) {
        status.error = `Upload test failed: ${err}`
      }
    }

  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return status
}

async function detailedStorageCheck() {
  console.log('🔍 Detailed Storage Bucket Check...\n')

  const bucketsToCheck = [
    'avatars',
    'post-media',
    'venue-media', 
    'event-media',
    'documents',
    'profile-images',
    'posts',
    'profiles',
    'venue-documents',
    'artist-music',
    'artist-photos',
    'project-files'
  ]

  const results: BucketStatus[] = []

  for (const bucketName of bucketsToCheck) {
    console.log(`🔍 Checking ${bucketName}...`)
    const status = await checkBucketStatus(bucketName)
    results.push(status)
    
    if (status.exists) {
      console.log(`   ✅ Exists (${status.public ? 'public' : 'private'})`)
      console.log(`   📁 Files: ${status.fileCount}`)
      console.log(`   🔓 List: ${status.canList ? '✅' : '❌'}`)
      console.log(`   📤 Upload: ${status.canUpload ? '✅' : '❌'}`)
      console.log(`   🗑️  Delete: ${status.canDelete ? '✅' : '❌'}`)
      if (status.error) {
        console.log(`   ⚠️  Error: ${status.error}`)
      }
    } else {
      console.log(`   ❌ Not found`)
      if (status.error) {
        console.log(`   ⚠️  Error: ${status.error}`)
      }
    }
    console.log('')
  }

  // Summary
  console.log('📊 Storage Status Summary:')
  console.log('========================')
  
  const existingBuckets = results.filter(r => r.exists)
  const missingBuckets = results.filter(r => !r.exists)
  const fullyFunctional = results.filter(r => r.exists && r.canList && r.canUpload && r.canDelete)
  const partiallyFunctional = results.filter(r => r.exists && (r.canList || r.canUpload || r.canDelete) && !(r.canList && r.canUpload && r.canDelete))
  const nonFunctional = results.filter(r => r.exists && !r.canList && !r.canUpload && !r.canDelete)

  console.log(`✅ Existing buckets: ${existingBuckets.length}/${bucketsToCheck.length}`)
  console.log(`🎯 Fully functional: ${fullyFunctional.length}`)
  console.log(`⚠️  Partially functional: ${partiallyFunctional.length}`)
  console.log(`❌ Non-functional: ${nonFunctional.length}`)
  console.log(`❌ Missing: ${missingBuckets.length}`)

  if (fullyFunctional.length > 0) {
    console.log('\n✅ Fully functional buckets:')
    fullyFunctional.forEach(bucket => {
      console.log(`   • ${bucket.name} (${bucket.fileCount} files)`)
    })
  }

  if (partiallyFunctional.length > 0) {
    console.log('\n⚠️  Partially functional buckets:')
    partiallyFunctional.forEach(bucket => {
      const issues = []
      if (!bucket.canList) issues.push('list')
      if (!bucket.canUpload) issues.push('upload')
      if (!bucket.canDelete) issues.push('delete')
      console.log(`   • ${bucket.name} (issues: ${issues.join(', ')})`)
    })
  }

  if (nonFunctional.length > 0) {
    console.log('\n❌ Non-functional buckets:')
    nonFunctional.forEach(bucket => {
      console.log(`   • ${bucket.name}${bucket.error ? ` - ${bucket.error}` : ''}`)
    })
  }

  if (missingBuckets.length > 0) {
    console.log('\n❌ Missing buckets:')
    missingBuckets.forEach(bucket => {
      console.log(`   • ${bucket.name}`)
    })
  }

  // Check critical buckets
  const criticalBuckets = ['avatars', 'post-media', 'venue-media']
  const criticalStatus = results.filter(r => criticalBuckets.includes(r.name))
  const criticalIssues = criticalStatus.filter(r => !r.exists || !r.canList || !r.canUpload)

  if (criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:')
    criticalIssues.forEach(bucket => {
      console.log(`   • ${bucket.name}: ${bucket.exists ? 'permissions issue' : 'missing'}`)
    })
    console.log('\n💡 To fix critical issues, run the storage setup script:')
    console.log('   Copy and paste the contents of supabase/setup-storage-buckets.sql into your Supabase SQL Editor')
  } else {
    console.log('\n✅ All critical buckets are functional!')
  }

  console.log('\n🎉 Storage check completed!')
  
  if (criticalIssues.length === 0) {
    console.log('✅ Your storage system is ready to use!')
  } else {
    console.log('⚠️  Please address the critical issues before using storage features')
  }
}

detailedStorageCheck() 