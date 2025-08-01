const { createClient } = require('@supabase/supabase-js')

// Create client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function testSimpleFix() {
  try {
    console.log('🔍 Testing simple fix...')
    
    // Test 1: Check if columns exist
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'posts')
      .in('column_name', ['posted_as_profile_id', 'posted_as_account_type'])
    
    if (colError) {
      console.error('❌ Error checking columns:', colError)
      return
    }
    
    const hasProfileId = columns.some(col => col.column_name === 'posted_as_profile_id')
    const hasAccountType = columns.some(col => col.column_name === 'posted_as_account_type')
    
    console.log('✅ Column check:')
    console.log('  - posted_as_profile_id:', hasProfileId ? '✅' : '❌')
    console.log('  - posted_as_account_type:', hasAccountType ? '✅' : '❌')
    
    if (!hasProfileId || !hasAccountType) {
      console.log('❌ Columns missing. Run the simple fix SQL first.')
      return
    }
    
    // Test 2: Check recent posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, user_id, posted_as_profile_id, posted_as_account_type')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (postsError) {
      console.error('❌ Error checking posts:', postsError)
      return
    }
    
    console.log('✅ Recent posts:')
    posts.forEach(post => {
      console.log(`  - ${post.id.substring(0, 8)}: ${post.posted_as_account_type} (${post.posted_as_profile_id ? 'has profile ID' : 'no profile ID'})`)
    })
    
    // Test 3: Check artist profile exists
    const { data: artistProfile, error: artistError } = await supabase
      .from('artist_profiles')
      .select('id, artist_name, stage_name')
      .eq('user_id', 'bce15693-d2bf-42db-a2f2-68239568fafe')
      .single()
    
    if (artistError) {
      console.error('❌ Error checking artist profile:', artistError)
    } else {
      console.log('✅ Artist profile found:', artistProfile.stage_name || artistProfile.artist_name)
    }
    
    console.log('')
    console.log('🎉 Simple fix test complete!')
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Go to /artist/feed')
    console.log('2. Create a post as "Clive Malone"')
    console.log('3. Verify it shows "Clive Malone" instead of "John"')
    
  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

testSimpleFix()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Test script failed:', error)
    process.exit(1)
  }) 