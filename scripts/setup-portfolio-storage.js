#!/usr/bin/env node

/**
 * Portfolio Storage Setup Script
 * 
 * This script sets up the portfolio storage bucket and policies in Supabase.
 * Run this script to fix the "Failed to prepare storage" error.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupPortfolioStorage() {
  console.log('🚀 Setting up Portfolio Storage...\n')

  try {
    // Read the SQL setup script
    const sqlPath = path.join(__dirname, '..', 'supabase', 'portfolio-storage-setup.sql')
    const sqlScript = fs.readFileSync(sqlPath, 'utf8')

    console.log('📝 Executing portfolio storage setup script...')

    // Execute the SQL script
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: sqlScript
    })

    if (error) {
      console.error('❌ Error executing SQL script:', error.message)
      
      // Try alternative approach - create bucket manually
      console.log('\n🔄 Trying alternative approach...')
      await createBucketManually()
      return
    }

    console.log('✅ Portfolio storage setup completed successfully!')
    console.log('\n📋 What was created:')
    console.log('   - Portfolio storage bucket (public)')
    console.log('   - RLS policies for secure access')
    console.log('   - Portfolio items table (if needed)')
    console.log('   - Database indexes for performance')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('\n🔄 Trying alternative approach...')
    await createBucketManually()
  }
}

async function createBucketManually() {
  console.log('🔧 Creating portfolio bucket manually...')

  try {
    // Create the portfolio bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('portfolio', {
      public: true,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg',
        'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/m4a', 'audio/ogg'
      ]
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Portfolio bucket already exists')
      } else {
        console.error('❌ Failed to create bucket:', bucketError.message)
        return
      }
    } else {
      console.log('✅ Portfolio bucket created successfully')
    }

    // Create basic RLS policies
    console.log('🔒 Setting up RLS policies...')
    
    const policies = [
      {
        name: 'Portfolio files are publicly accessible',
        operation: 'SELECT',
        definition: "bucket_id = 'portfolio'"
      },
      {
        name: 'Users can upload to their own portfolio folder',
        operation: 'INSERT',
        definition: "bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]"
      },
      {
        name: 'Users can update their own portfolio files',
        operation: 'UPDATE',
        definition: "bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]"
      },
      {
        name: 'Users can delete their own portfolio files',
        operation: 'DELETE',
        definition: "bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]"
      }
    ]

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql_query: `
          DROP POLICY IF EXISTS "${policy.name}" ON storage.objects;
          CREATE POLICY "${policy.name}" ON storage.objects
            FOR ${policy.operation} ${policy.operation === 'INSERT' ? 'WITH CHECK' : 'USING'} (${policy.definition});
        `
      })

      if (policyError) {
        console.warn(`⚠️  Warning: Could not create policy "${policy.name}":`, policyError.message)
      } else {
        console.log(`✅ Created policy: ${policy.name}`)
      }
    }

    console.log('\n✅ Manual setup completed!')
    console.log('📝 Note: Some policies may need to be created manually in the Supabase dashboard')

  } catch (error) {
    console.error('❌ Manual setup failed:', error.message)
  }
}

async function verifySetup() {
  console.log('\n🔍 Verifying setup...')

  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Could not list buckets:', bucketsError.message)
      return
    }

    const portfolioBucket = buckets?.find(b => b.name === 'portfolio')
    
    if (portfolioBucket) {
      console.log('✅ Portfolio bucket found')
      console.log(`   - Public: ${portfolioBucket.public}`)
      console.log(`   - File size limit: ${portfolioBucket.file_size_limit || 'No limit'}`)
    } else {
      console.log('❌ Portfolio bucket not found')
    }

    // Check if portfolio_items table exists
    const { data: tableData, error: tableError } = await supabase
      .from('portfolio_items')
      .select('count')
      .limit(1)

    if (tableError) {
      console.log('⚠️  Portfolio items table may not exist or have RLS issues')
    } else {
      console.log('✅ Portfolio items table accessible')
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

// Run the setup
async function main() {
  console.log('🎵 Tourify Portfolio Storage Setup\n')
  
  await setupPortfolioStorage()
  await verifySetup()
  
  console.log('\n🎉 Setup process completed!')
  console.log('\n📝 Next steps:')
  console.log('   1. Try uploading a portfolio item in your app')
  console.log('   2. If you still get errors, check the Supabase dashboard')
  console.log('   3. Ensure your service role key has proper permissions')
}

main().catch(console.error)
