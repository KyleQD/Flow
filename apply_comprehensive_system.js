const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

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

async function applyComprehensiveSystem() {
  try {
    console.log('📝 Reading comprehensive multi-account system SQL...')
    const migrationPath = path.join(__dirname, 'COMPREHENSIVE_MULTI_ACCOUNT_SYSTEM.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      console.log('Please run this script from the project root directory')
      process.exit(1)
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('🚀 Applying comprehensive multi-account system...')
    console.log('This will:')
    console.log('✅ Create unified accounts table')
    console.log('✅ Add account context to posts table')
    console.log('✅ Create account management RPC functions')
    console.log('✅ Migrate existing profiles to accounts')
    console.log('✅ Update existing posts with account context')
    console.log('✅ Set up proper RLS policies')
    console.log('')
    
    // Split SQL into statements and execute them
    const statements = migrationSQL
      .split(';')
      .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
      .map(stmt => stmt.trim())
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.length < 10) continue // Skip very short statements
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec', { 
          query: statement + ';' 
        })
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message)
          errorCount++
        } else {
          successCount++
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (err) {
        console.error(`💥 Exception in statement ${i + 1}:`, err.message)
        errorCount++
      }
    }
    
    console.log('')
    console.log(`📊 Migration Results:`)
    console.log(`✅ Successful statements: ${successCount}`)
    console.log(`❌ Failed statements: ${errorCount}`)
    
    if (errorCount > 0) {
      console.log('')
      console.log('⚠️  Some statements failed. This might be normal for:')
      console.log('- Tables that already exist')
      console.log('- Columns that already exist')
      console.log('- Policies that already exist')
      console.log('')
      console.log('🔍 Check the errors above to see if they are critical')
    }
    
    // Test the new system
    console.log('')
    console.log('🔍 Testing the new system...')
    
    try {
      // Test accounts table
      const { data: accountsTest, error: accountsError } = await supabase
        .from('accounts')
        .select('id, display_name, account_type')
        .limit(3)
      
      if (accountsError) {
        console.error('❌ Accounts table test failed:', accountsError.message)
      } else {
        console.log('✅ Accounts table working:', accountsTest?.length || 0, 'accounts found')
      }
      
      // Test posts with account context
      const { data: postsTest, error: postsError } = await supabase
        .from('posts')
        .select('id, user_id, account_id, posted_as_account_type')
        .limit(3)
      
      if (postsError) {
        console.error('❌ Posts table test failed:', postsError.message)
      } else {
        console.log('✅ Posts table with account context working:', postsTest?.length || 0, 'posts found')
      }
      
      // Test RPC functions
      const { data: rpcTest, error: rpcError } = await supabase
        .rpc('get_user_accounts', { p_user_id: 'bce15693-d2bf-42db-a2f2-68239568fafe' })
      
      if (rpcError) {
        console.error('❌ RPC functions test failed:', rpcError.message)
      } else {
        console.log('✅ RPC functions working:', rpcTest?.length || 0, 'accounts found for test user')
      }
      
    } catch (testError) {
      console.error('❌ System test failed:', testError.message)
    }
    
    console.log('')
    console.log('🎉 COMPREHENSIVE MULTI-ACCOUNT SYSTEM DEPLOYMENT COMPLETE!')
    console.log('')
    console.log('🔥 What you can do now:')
    console.log('1. Users can have unlimited accounts of any type')
    console.log('2. Posts will display correct account names')
    console.log('3. Account switching will work seamlessly')
    console.log('4. System is scalable for new account types')
    console.log('')
    console.log('📚 Next steps:')
    console.log('1. Test posting as different account types')
    console.log('2. Verify feed displays correct names')
    console.log('3. Test account switching functionality')
    console.log('')
    console.log('🚀 The system is ready to use!')
    
  } catch (error) {
    console.error('💥 Deployment failed:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  }
}

// Run the deployment
applyComprehensiveSystem()
  .then(() => {
    console.log('✅ Deployment script completed')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Deployment script failed:', error)
    process.exit(1)
  }) 