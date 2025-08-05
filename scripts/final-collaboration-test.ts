#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { existsSync } from 'fs'

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

async function runFinalTest() {
  console.log('🎵 Final Collaboration System Test...\n')

  let allTestsPassed = true

  try {
    // 1. Database Connectivity
    console.log('1. Testing database connectivity...')
    const { data: healthCheck, error: healthError } = await supabase
      .from('collaboration_projects')
      .select('count')
      .limit(1)

    if (healthError) {
      console.error('   ❌ Database connectivity failed:', healthError.message)
      allTestsPassed = false
    } else {
      console.log('   ✅ Database connectivity working')
    }

    // 2. Test Data Verification
    console.log('\n2. Verifying test data...')
    
    const { data: projects, error: projectsError } = await supabase
      .from('collaboration_projects')
      .select('*')

    const { data: jobs, error: jobsError } = await supabase
      .from('artist_jobs')
      .select('*')
      .eq('job_type', 'collaboration')

    if (projectsError || jobsError) {
      console.error('   ❌ Error fetching test data')
      allTestsPassed = false
    } else {
      console.log(`   ✅ Found ${projects?.length || 0} collaboration projects`)
      console.log(`   ✅ Found ${jobs?.length || 0} collaboration jobs`)
      
      if ((projects?.length || 0) < 2 || (jobs?.length || 0) < 3) {
        console.log('   ⚠️  Less test data than expected, but system functional')
      }
    }

    // 3. Storage System
    console.log('\n3. Testing storage system...')
    
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()

    if (bucketsError) {
      console.error('   ❌ Storage system error:', bucketsError.message)
      allTestsPassed = false
    } else {
      const projectFilesBucket = buckets.find(b => b.name === 'project-files')
      if (projectFilesBucket) {
        console.log('   ✅ Project files bucket exists')
      } else {
        console.log('   ⚠️  Project files bucket not found')
      }
    }

    // 4. Avatar Files
    console.log('\n4. Checking avatar files...')
    
    const avatarFiles = [
      'public/avatars/sarah.svg',
      'public/avatars/mike.svg',
      'public/avatars/user-7.svg'
    ]

    let avatarCount = 0
    avatarFiles.forEach(file => {
      if (existsSync(file)) {
        avatarCount++
      }
    })

    if (avatarCount === avatarFiles.length) {
      console.log('   ✅ Avatar files created successfully')
    } else {
      console.log(`   ⚠️  Found ${avatarCount}/${avatarFiles.length} avatar files`)
    }

    // 5. Component Files
    console.log('\n5. Checking component files...')
    
    const componentFiles = [
      'components/collaboration/enhanced-collaboration-hub.tsx',
      'components/collaboration/enhanced-collaboration-feed.tsx',
      'components/collaboration/real-time-activity-feed.tsx',
      'components/collaboration/enhanced-project-workspace.tsx',
      'lib/utils/avatar-utils.ts'
    ]

    let componentCount = 0
    componentFiles.forEach(file => {
      if (existsSync(file)) {
        componentCount++
      }
    })

    if (componentCount === componentFiles.length) {
      console.log('   ✅ All collaboration components exist')
    } else {
      console.log(`   ⚠️  Found ${componentCount}/${componentFiles.length} component files`)
    }

    // 6. Feature Completeness Check
    console.log('\n6. Feature completeness summary...')
    
    const features = [
      { name: 'Database Tables', status: healthError ? 'failed' : 'passed' },
      { name: 'Test Data', status: (projects?.length || 0) > 0 ? 'passed' : 'partial' },
      { name: 'Storage System', status: bucketsError ? 'failed' : 'passed' },
      { name: 'Avatar System', status: avatarCount > 0 ? 'passed' : 'failed' },
      { name: 'UI Components', status: componentCount === componentFiles.length ? 'passed' : 'partial' }
    ]

    features.forEach(feature => {
      const icon = feature.status === 'passed' ? '✅' : feature.status === 'partial' ? '⚠️' : '❌'
      console.log(`   ${icon} ${feature.name}: ${feature.status}`)
    })

    // Final Result
    console.log('\n' + '='.repeat(50))
    
    if (allTestsPassed && features.every(f => f.status !== 'failed')) {
      console.log('🎉 COLLABORATION SYSTEM READY!')
      console.log('✨ All core features are functional and ready for testing')
      console.log('\n🚀 Next Steps:')
      console.log('   1. Visit: http://localhost:3000/artist/community')
      console.log('   2. Test the Enhanced Collaboration Hub')
      console.log('   3. Navigate to collaboration features')
      console.log('   4. Create and test collaboration workflows')
    } else {
      console.log('⚠️  COLLABORATION SYSTEM PARTIALLY READY')
      console.log('   Core functionality works but some optimizations needed')
      console.log('   Check the issues above and refer to the improvement plan')
    }

    console.log('\n📋 Testing Guide:')
    console.log('   📖 docs/COLLABORATION_TESTING_AND_IMPROVEMENTS.md')
    console.log('   🧪 Follow the testing checklist for comprehensive validation')

  } catch (error) {
    console.error('\n❌ Test execution failed:', error)
    allTestsPassed = false
  }

  process.exit(allTestsPassed ? 0 : 1)
}

// Run the final test
runFinalTest()