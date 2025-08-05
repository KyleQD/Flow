#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
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

async function applyCollaborationTables() {
  console.log('🎵 Creating Collaboration Tables...\n')

  try {
    // Read the SQL file
    const sqlContent = readFileSync('supabase/sql/create_collaboration_tables.sql', 'utf-8')
    
    console.log('📄 Read SQL file with', sqlContent.length, 'characters')
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log('🔄 Executing', statements.length, 'SQL statements...\n')

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      // Skip empty statements and comments
      if (statement.trim().length <= 1 || statement.trim().startsWith('--')) {
        continue
      }

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // Check if it's a harmless "already exists" error
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate')) {
            console.log(`   ⚠️  ${error.message.substring(0, 80)}...`)
          } else {
            console.error(`   ❌ Error in statement ${i + 1}:`, error.message.substring(0, 100) + '...')
            errorCount++
          }
        } else {
          successCount++
        }
      } catch (err) {
        console.error(`   ❌ Exception in statement ${i + 1}:`, err)
        errorCount++
      }
    }

    console.log(`\n📊 Results:`)
    console.log(`   ✅ Successful statements: ${successCount}`)
    console.log(`   ❌ Failed statements: ${errorCount}`)

    // Test if tables were created
    console.log('\n🧪 Testing table creation...')
    
    const tables = [
      'collaboration_projects',
      'project_collaborators', 
      'project_files',
      'project_tasks',
      'project_activity',
      'collaboration_invitations',
      'audio_files'
    ]

    let tablesCreated = 0
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.error(`   ❌ Table '${table}' not accessible:`, error.message)
      } else {
        console.log(`   ✅ Table '${table}' created and accessible`)
        tablesCreated++
      }
    }

    if (tablesCreated === tables.length) {
      console.log('\n🎉 All collaboration tables created successfully!')
      console.log('✨ Your collaboration system is now ready to use!')
    } else {
      console.log(`\n⚠️  Only ${tablesCreated}/${tables.length} tables were created successfully.`)
    }

  } catch (error) {
    console.error('\n❌ Failed to apply collaboration tables:', error)
    process.exit(1)
  }
}

// Note: We need to create the exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  const functionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `
  
  try {
    const { error } = await supabase.rpc('exec', { sql: functionSql })
    if (error) {
      console.log('Note: Could not create exec_sql function, using direct execution')
    }
  } catch (err) {
    console.log('Note: Using alternative approach for SQL execution')
  }
}

// Run the script
createExecSqlFunction().then(() => applyCollaborationTables())