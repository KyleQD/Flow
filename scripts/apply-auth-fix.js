#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyAuthFix() {
  console.log('🔧 Applying Authentication Fix...\n')
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250101000000_fix_authentication_system.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Migration file loaded successfully')
    console.log('🚀 Applying migration...')

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.trim()) {
        try {
          console.log(`   Executing statement ${i + 1}/${statements.length}...`)
          
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            console.log(`   ⚠️  Statement ${i + 1} had an issue: ${error.message}`)
            errorCount++
          } else {
            successCount++
          }
        } catch (err) {
          console.log(`   ❌ Statement ${i + 1} failed: ${err.message}`)
          errorCount++
        }
      }
    }

    console.log(`\n📊 Migration Results:`)
    console.log(`   ✅ Successful statements: ${successCount}`)
    console.log(`   ❌ Failed statements: ${errorCount}`)

    if (errorCount === 0) {
      console.log('\n🎉 Authentication fix applied successfully!')
      console.log('\nNext steps:')
      console.log('1. Test the authentication system with: node scripts/test-auth-fix.js')
      console.log('2. Try signing up a new user through the application')
      console.log('3. Check that profiles are created automatically')
    } else {
      console.log('\n⚠️  Some statements failed. Please check the logs above.')
      console.log('The authentication system may still work, but some features might be affected.')
    }

  } catch (error) {
    console.error('❌ Failed to apply migration:', error.message)
    process.exit(1)
  }
}

// Run the migration
applyAuthFix()
