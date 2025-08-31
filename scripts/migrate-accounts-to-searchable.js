require('dotenv').config({ path: '.env.production' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateAccountsToSearchable() {
  try {
    console.log('🔄 Starting account migration to searchable structure...')
    
    // Step 1: Check if accounts table exists
    console.log('\n📊 Step 1: Checking if accounts table exists...')
    
    const { data: accountsTest, error: accountsTestError } = await supabase
      .from('accounts')
      .select('id')
      .limit(1)
    
    if (accountsTestError) {
      console.error('❌ Accounts table does not exist. Please run the migration first:')
      console.error('   Copy the contents of migrations/0012_fix_search_and_accounts.sql')
      console.error('   and run it in your Supabase SQL Editor')
      return
    }
    
    console.log('✅ Accounts table exists')
    
    // Step 2: Get all profiles
    console.log('\n📊 Step 2: Getting all profiles...')
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return
    }
    
    console.log(`Found ${profiles?.length || 0} profiles to migrate`)
    
    // Step 3: Create accounts for each profile
    console.log('\n🔄 Step 3: Creating accounts for each profile...')
    
    let createdAccounts = 0
    let skippedAccounts = 0
    
    for (const profile of profiles || []) {
      try {
        // Check if account already exists
        const { data: existingAccount, error: checkError } = await supabase
          .from('accounts')
          .select('id')
          .eq('profile_table', 'profiles')
          .eq('profile_id', profile.id)
          .single()
        
        if (existingAccount) {
          console.log(`⏭️  Skipping profile ${profile.name || profile.username} (account already exists)`)
          skippedAccounts++
          continue
        }
        
        // Create account entry
        const { error: accountError } = await supabase
          .from('accounts')
          .insert({
            owner_user_id: profile.id,
            account_type: profile.account_type || 'general',
            profile_table: 'profiles',
            profile_id: profile.id,
            display_name: profile.name || profile.username || 'User',
            username: profile.username,
            avatar_url: profile.avatar_url,
            is_active: true,
            metadata: {
              bio: profile.bio,
              account_settings: profile.account_settings
            }
          })
        
        if (accountError) {
          console.error(`❌ Error creating account for profile ${profile.name || profile.username}:`, accountError.message)
        } else {
          console.log(`✅ Created account for profile: ${profile.name || profile.username}`)
          createdAccounts++
        }
        
        // If profile has account_settings with artist/venue data, create those accounts too
        if (profile.account_settings) {
          // Handle artist accounts
          if (profile.account_settings.artist_accounts) {
            console.log(`🎵 Processing ${profile.account_settings.artist_accounts.length} artist accounts for ${profile.name || profile.username}`)
            
            for (const artistData of profile.account_settings.artist_accounts) {
              try {
                // Check if artist profile already exists
                const { data: existingArtist, error: artistCheckError } = await supabase
                  .from('artist_profiles')
                  .select('id')
                  .eq('user_id', profile.id)
                  .eq('artist_name', artistData.artist_name)
                  .single()
                
                let artistProfileId = existingArtist?.id
                
                if (!existingArtist) {
                  // Create artist profile
                  const { data: artistProfile, error: artistError } = await supabase
                    .from('artist_profiles')
                    .insert({
                      user_id: profile.id,
                      artist_name: artistData.artist_name,
                      bio: artistData.bio,
                      genres: artistData.genres || [],
                      social_links: artistData.social_links || {},
                      avatar_url: artistData.avatar_url
                    })
                    .select()
                    .single()
                  
                  if (artistError) {
                    console.error(`❌ Error creating artist profile for ${artistData.artist_name}:`, artistError.message)
                    continue
                  }
                  
                  artistProfileId = artistProfile.id
                  console.log(`✅ Created artist profile: ${artistData.artist_name}`)
                }
                
                // Create account entry for artist
                const { error: artistAccountError } = await supabase
                  .from('accounts')
                  .insert({
                    owner_user_id: profile.id,
                    account_type: 'artist',
                    profile_table: 'artist_profiles',
                    profile_id: artistProfileId,
                    display_name: artistData.artist_name,
                    username: artistData.artist_name.toLowerCase().replace(/\s+/g, '-'),
                    avatar_url: artistData.avatar_url,
                    is_active: true,
                    metadata: artistData
                  })
                
                if (artistAccountError) {
                  console.error(`❌ Error creating artist account for ${artistData.artist_name}:`, artistAccountError.message)
                } else {
                  console.log(`✅ Created artist account: ${artistData.artist_name}`)
                  createdAccounts++
                }
              } catch (err) {
                console.error(`❌ Error processing artist account ${artistData.artist_name}:`, err.message)
              }
            }
          }
          
          // Handle venue accounts
          if (profile.account_settings.venue_accounts) {
            console.log(`🏢 Processing ${profile.account_settings.venue_accounts.length} venue accounts for ${profile.name || profile.username}`)
            
            for (const venueData of profile.account_settings.venue_accounts) {
              try {
                // Check if venue profile already exists
                const { data: existingVenue, error: venueCheckError } = await supabase
                  .from('venue_profiles')
                  .select('id')
                  .eq('user_id', profile.id)
                  .eq('venue_name', venueData.venue_name)
                  .single()
                
                let venueProfileId = existingVenue?.id
                
                if (!existingVenue) {
                  // Create venue profile
                  const { data: venueProfile, error: venueError } = await supabase
                    .from('venue_profiles')
                    .insert({
                      user_id: profile.id,
                      venue_name: venueData.venue_name,
                      description: venueData.description,
                      address: venueData.address,
                      city: venueData.city,
                      state: venueData.state,
                      country: venueData.country,
                      capacity: venueData.capacity,
                      amenities: venueData.amenities || [],
                      avatar_url: venueData.avatar_url
                    })
                    .select()
                    .single()
                  
                  if (venueError) {
                    console.error(`❌ Error creating venue profile for ${venueData.venue_name}:`, venueError.message)
                    continue
                  }
                  
                  venueProfileId = venueProfile.id
                  console.log(`✅ Created venue profile: ${venueData.venue_name}`)
                }
                
                // Create account entry for venue
                const { error: venueAccountError } = await supabase
                  .from('accounts')
                  .insert({
                    owner_user_id: profile.id,
                    account_type: 'venue',
                    profile_table: 'venue_profiles',
                    profile_id: venueProfileId,
                    display_name: venueData.venue_name,
                    username: venueData.venue_name.toLowerCase().replace(/\s+/g, '-'),
                    avatar_url: venueData.avatar_url,
                    is_active: true,
                    metadata: venueData
                  })
                
                if (venueAccountError) {
                  console.error(`❌ Error creating venue account for ${venueData.venue_name}:`, venueAccountError.message)
                } else {
                  console.log(`✅ Created venue account: ${venueData.venue_name}`)
                  createdAccounts++
                }
              } catch (err) {
                console.error(`❌ Error processing venue account ${venueData.venue_name}:`, err.message)
              }
            }
          }
        }
      } catch (err) {
        console.error(`❌ Error processing profile ${profile.id}:`, err.message)
      }
    }
    
    // Step 4: Verify the migration
    console.log('\n✅ Step 4: Verifying migration...')
    
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('account_type')
    
    if (accountsError) {
      console.error('Error checking accounts:', accountsError)
    } else {
      const accountTypes = accounts?.reduce((acc, a) => {
        acc[a.account_type] = (acc[a.account_type] || 0) + 1
        return acc
      }, {}) || {}
      
      console.log(`✅ Migration complete!`)
      console.log(`📊 Created: ${createdAccounts} new accounts`)
      console.log(`⏭️  Skipped: ${skippedAccounts} existing accounts`)
      console.log(`📈 Total accounts: ${accounts?.length || 0}`)
      console.log(`📋 Account types:`, accountTypes)
    }
    
    console.log('\n🎉 Account migration completed successfully!')
    console.log('📝 Next steps:')
    console.log('1. Deploy the updated search API')
    console.log('2. Test search functionality')
    console.log('3. Verify that all accounts are now searchable')
    
  } catch (error) {
    console.error('❌ Error in migration script:', error)
  }
}

migrateAccountsToSearchable()
