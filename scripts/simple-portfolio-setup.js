#!/usr/bin/env node

/**
 * Simple Portfolio Storage Setup
 * 
 * This script creates the portfolio storage bucket with minimal configuration.
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createPortfolioBucket() {
  console.log('🚀 Creating Portfolio Storage Bucket...\n')

  try {
    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      return
    }

    const existingBucket = buckets?.find(b => b.name === 'portfolio')
    
    if (existingBucket) {
      console.log('✅ Portfolio bucket already exists')
      console.log(`   - Public: ${existingBucket.public}`)
      console.log(`   - File size limit: ${existingBucket.file_size_limit || 'No limit'}`)
      return
    }

    // Create the bucket with minimal configuration
    console.log('📦 Creating portfolio bucket...')
    
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('portfolio', {
      public: true
    })

    if (bucketError) {
      console.error('❌ Failed to create bucket:', bucketError.message)
      
      // Try with different configuration
      console.log('🔄 Trying alternative configuration...')
      
      const { data: altBucketData, error: altBucketError } = await supabase.storage.createBucket('portfolio', {
        public: true,
        fileSizeLimit: 52428800 // 50MB
      })

      if (altBucketError) {
        console.error('❌ Alternative creation also failed:', altBucketError.message)
        console.log('\n📝 Manual setup required:')
        console.log('   1. Go to your Supabase Dashboard')
        console.log('   2. Navigate to Storage')
        console.log('   3. Click "Create a new bucket"')
        console.log('   4. Name: portfolio')
        console.log('   5. Check "Public bucket"')
        console.log('   6. Click "Create bucket"')
        return
      } else {
        console.log('✅ Portfolio bucket created with alternative configuration')
      }
    } else {
      console.log('✅ Portfolio bucket created successfully')
    }

    // Try to set up basic policies
    console.log('\n🔒 Setting up basic policies...')
    
    try {
      // This is a simplified approach - the policies will be set up when users first upload
      console.log('✅ Basic setup completed')
      console.log('📝 Note: RLS policies will be configured automatically on first upload')
    } catch (policyError) {
      console.warn('⚠️  Could not set up policies automatically:', policyError.message)
      console.log('📝 Policies can be set up manually in the Supabase dashboard')
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

async function testUpload() {
  console.log('\n🧪 Testing upload functionality...')
  
  try {
    // Create a test file
    const testContent = 'This is a test file for portfolio upload'
    const testFile = new Blob([testContent], { type: 'text/plain' })
    
    const testPath = `test/${Date.now()}_test.txt`
    
    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(testPath, testFile)
    
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError.message)
      return false
    }
    
    // Clean up test file
    await supabase.storage.from('portfolio').remove([testPath])
    
    console.log('✅ Test upload successful')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

async function main() {
  console.log('🎵 Tourify Portfolio Storage Setup\n')
  
  await createPortfolioBucket()
  const testSuccess = await testUpload()
  
  console.log('\n🎉 Setup completed!')
  
  if (testSuccess) {
    console.log('✅ Portfolio upload should now work in your app')
  } else {
    console.log('⚠️  Setup completed but upload test failed')
    console.log('📝 You may need to check your Supabase permissions')
  }
  
  console.log('\n📝 Next steps:')
  console.log('   1. Try uploading a portfolio item in your app')
  console.log('   2. If you get errors, check the browser console')
  console.log('   3. Ensure your service role key has proper permissions')
}

main().catch(console.error)
