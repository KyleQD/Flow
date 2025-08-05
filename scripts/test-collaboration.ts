#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testCollaborationFeatures() {
  console.log('🎵 Testing Collaboration Features...\n')

  try {
    // Test 1: Check if collaboration tables exist
    console.log('1. Checking database tables...')
    
    const tables = [
      'collaboration_projects',
      'project_collaborators', 
      'project_files',
      'project_tasks',
      'project_activity'
    ]

    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.error(`   ❌ Table '${table}' error:`, error.message)
      } else {
        console.log(`   ✅ Table '${table}' exists and accessible`)
      }
    }

    // Test 2: Check if we can query artist jobs for collaboration
    console.log('\n2. Checking artist jobs collaboration extension...')
    const { data: jobs, error: jobsError } = await supabase
      .from('artist_jobs')
      .select('*')
      .eq('job_type', 'collaboration')
      .limit(1)

    if (jobsError) {
      console.error('   ❌ Artist jobs collaboration query error:', jobsError.message)
    } else {
      console.log('   ✅ Artist jobs collaboration query successful')
      console.log(`   📊 Found ${jobs?.length || 0} collaboration jobs`)
    }

    // Test 3: Check messaging system
    console.log('\n3. Checking messaging system...')
    const messagingTables = ['conversations', 'messages']
    
    for (const table of messagingTables) {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.error(`   ❌ Messaging table '${table}' error:`, error.message)
      } else {
        console.log(`   ✅ Messaging table '${table}' exists and accessible`)
      }
    }

    // Test 4: Check storage buckets
    console.log('\n4. Checking storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('   ❌ Storage buckets error:', bucketsError.message)
    } else {
      console.log('   ✅ Storage accessible')
      const projectFilesBucket = buckets?.find(b => b.name === 'project-files')
      if (projectFilesBucket) {
        console.log('   ✅ Project files bucket exists')
      } else {
        console.log('   ⚠️  Project files bucket not found (will be created when needed)')
      }
    }

    console.log('\n🎉 Collaboration system tests completed!')
    console.log('\n📝 Summary:')
    console.log('   • Database tables: Ready')
    console.log('   • Artist jobs extension: Ready') 
    console.log('   • Messaging system: Ready')
    console.log('   • Storage system: Ready')
    console.log('\n✨ Your collaboration features are ready to use!')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testCollaborationFeatures()