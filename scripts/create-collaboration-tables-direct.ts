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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createCollaborationTables() {
  console.log('🎵 Creating Collaboration Tables Directly...\n')

  try {
    // Test 1: Try to create the main collaboration_projects table using a simple approach
    console.log('1. Creating collaboration_projects table...')
    
    // Use the REST API to check if we can create a simple record structure
    // This will give us insight into whether the table exists
    const { error: projectError } = await supabase
      .from('collaboration_projects')
      .select('id')
      .limit(1)

    if (projectError && projectError.message.includes('does not exist')) {
      console.log('   ℹ️  Table does not exist, needs to be created via migration')
      
      // Since we can't create tables directly via the client, let's use the Studio UI
      console.log('\n📋 Manual Steps Required:')
      console.log('   1. Open Supabase Studio at: http://127.0.0.1:54323')
      console.log('   2. Go to SQL Editor')
      console.log('   3. Copy and paste the contents of: supabase/sql/create_collaboration_tables.sql')
      console.log('   4. Click "Run" to execute the SQL')
      console.log('   5. Return here and run: npx tsx scripts/test-collaboration.ts')
      
      return false
    } else if (projectError) {
      console.error('   ❌ Unexpected error:', projectError.message)
      return false
    } else {
      console.log('   ✅ collaboration_projects table exists!')
    }

    // Test other tables
    const tables = [
      'project_collaborators', 
      'project_files',
      'project_tasks',
      'project_activity',
      'collaboration_invitations'
    ]

    let allTablesExist = true
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error && error.message.includes('does not exist')) {
        console.log(`   ❌ Table '${table}' does not exist`)
        allTablesExist = false
      } else if (error) {
        console.log(`   ⚠️  Table '${table}' error: ${error.message}`)
      } else {
        console.log(`   ✅ Table '${table}' exists`)
      }
    }

    if (allTablesExist) {
      console.log('\n🎉 All collaboration tables exist!')
      console.log('✨ Your collaboration system is ready!')
      return true
    } else {
      console.log('\n⚠️  Some tables are missing. Please follow the manual steps above.')
      return false
    }

  } catch (error) {
    console.error('\n❌ Error checking tables:', error)
    return false
  }
}

// Run the check
createCollaborationTables().then(success => {
  if (success) {
    console.log('\n🚀 Next step: Run npm run dev to test the collaboration features!')
  } else {
    console.log('\n📝 Please complete the manual table creation steps above.')
  }
})