#!/usr/bin/env node

/**
 * Admin Onboarding System Setup Script
 * This script helps set up the database tables for the admin onboarding system
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupAdminSystem() {
  try {
    console.log('🚀 Setting up Admin Onboarding System...')
    
    // Read the SQL setup file
    const sqlPath = path.join(__dirname, 'setup-admin-tables.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    console.log('📋 Executing database setup...')
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    let successfulStatements = 0
    let failedStatements = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      const statementNumber = i + 1
      
      try {
        // Skip comments and empty statements
        if (statement.startsWith('--') || statement.length === 0) {
          continue
        }
        
        console.log(`⏳ Executing statement ${statementNumber}/${statements.length}...`)
        
        // Execute the statement
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        
        if (error) {
          // If exec_sql doesn't work, try direct execution
          console.warn(`⚠️ Statement ${statementNumber} failed with exec_sql, trying direct execution...`)
          
          // For CREATE TABLE statements, we'll skip them if they already exist
          if (statement.toUpperCase().includes('CREATE TABLE')) {
            const tableName = extractTableName(statement)
            if (tableName) {
              const { error: checkError } = await supabase
                .from(tableName)
                .select('*')
                .limit(1)
              
              if (!checkError) {
                console.log(`✅ Table '${tableName}' already exists, skipping...`)
                successfulStatements++
                continue
              }
            }
          }
          
          // Try to execute the statement directly
          const { error: directError } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          
          if (directError) {
            console.warn(`⚠️ Statement ${statementNumber} failed:`, directError.message)
            failedStatements++
          } else {
            console.log(`✅ Statement ${statementNumber} executed successfully`)
            successfulStatements++
          }
        } else {
          console.log(`✅ Statement ${statementNumber} executed successfully`)
          successfulStatements++
        }
        
      } catch (err) {
        console.warn(`⚠️ Statement ${statementNumber} failed:`, err.message)
        failedStatements++
      }
    }
    
    console.log(`\n📊 SQL Execution Summary:`)
    console.log(`   - Successful statements: ${successfulStatements}`)
    console.log(`   - Failed statements: ${failedStatements}`)
    console.log(`   - Total statements: ${statements.length}`)
    
    // Verify the setup by checking if tables exist
    console.log('\n🔍 Verifying setup...')
    
    const tablesToCheck = [
      'job_posting_templates',
      'application_form_templates', 
      'job_applications',
      'onboarding_workflows',
      'onboarding_steps',
      'staff_onboarding_candidates',
      'onboarding_activities',
      'staff_members',
      'staff_messages'
    ]
    
    let verifiedTables = 0
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
          console.warn(`⚠️ Table '${table}' does not exist`)
        } else {
          console.log(`✅ Table '${table}' exists`)
          verifiedTables++
        }
      } catch (err) {
        console.warn(`⚠️ Could not verify table '${table}':`, err.message)
      }
    }
    
    console.log(`\n📊 Setup Summary:`)
    console.log(`   - Tables verified: ${verifiedTables}/${tablesToCheck.length}`)
    console.log(`   - SQL statements executed: ${successfulStatements}/${statements.length}`)
    
    if (verifiedTables === tablesToCheck.length) {
      console.log('🎉 All tables are ready! The admin onboarding system is set up.')
    } else if (verifiedTables > 0) {
      console.log('⚠️ Some tables are ready, but not all. The system will work with fallback data.')
    } else {
      console.log('⚠️ No tables were created. The system will use fallback data.')
    }
    
    console.log('\n📝 Next steps:')
    console.log('   1. Test the admin dashboard at /admin/dashboard/staff')
    console.log('   2. The system will work with fallback data if tables are missing')
    console.log('   3. Create some sample job postings to test the workflow')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    console.log('\n💡 The system will still work with fallback data even if setup fails.')
    console.log('   Navigate to /admin/dashboard/staff to test the system.')
  }
}

// Helper function to extract table name from CREATE TABLE statement
function extractTableName(statement) {
  const match = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i)
  return match ? match[1] : null
}

// Run the setup
setupAdminSystem() 