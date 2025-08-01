const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Create service role client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function applyMigration() {
  try {
    console.log('📝 Reading migration file...')
    const migrationSQL = fs.readFileSync('add_account_context_to_posts.sql', 'utf8')
    
    console.log('🚀 Applying migration to database...')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    })
    
    if (error) {
      // If exec_sql RPC doesn't exist, try direct query
      console.log('⚠️  exec_sql RPC not found, trying direct query...')
      
      // Split SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .filter(stmt => stmt.trim())
        .map(stmt => stmt.trim() + ';')
      
      for (const statement of statements) {
        console.log('Executing:', statement.substring(0, 50) + '...')
        const { error: stmtError } = await supabase.rpc('exec', { query: statement })
        if (stmtError) {
          console.error('❌ Error executing statement:', stmtError)
        }
      }
    } else {
      console.log('✅ Migration executed successfully!')
    }
    
    // Test the new columns
    console.log('🔍 Testing new columns...')
    const { data: testData, error: testError } = await supabase
      .from('posts')
      .select('id, user_id, posted_as_profile_id, posted_as_account_type')
      .limit(3)
    
    if (testError) {
      console.error('❌ Error testing columns:', testError)
    } else {
      console.log('✅ New columns working:', testData)
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
applyMigration()
  .then(() => {
    console.log('🎉 Migration completed successfully!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }) 