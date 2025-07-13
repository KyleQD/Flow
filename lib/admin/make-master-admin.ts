import { createClient } from '@supabase/supabase-js'

// Admin utility function to make a user a master admin
export async function makeMasterAdmin(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  // Use service role key for admin operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    console.log(`Making ${email} a master admin...`)

    // First, find the user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) throw userError

    const targetUser = userData.users.find(user => user.email === email)
    if (!targetUser) {
      throw new Error(`User with email ${email} not found`)
    }

    console.log(`Found user: ${targetUser.id}`)

    // Ensure admin columns exist in profiles table
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_level TEXT CHECK (admin_level IN ('super', 'moderator', 'support')) DEFAULT NULL;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_type TEXT DEFAULT 'general' CHECK (profile_type IN ('general', 'artist', 'venue', 'admin'));
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
      `
    })

    if (alterError) {
      console.warn('Could not alter table (may already exist):', alterError.message)
    }

    // Update or insert the user's profile to make them a master admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: targetUser.id,
        is_admin: true,
        admin_level: 'super',
        profile_type: 'admin',
        role: 'admin',
        full_name: 'Master Admin',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (profileError) throw profileError

    // Verify the admin was created
    const { data: verifyData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .eq('is_admin', true)
      .eq('admin_level', 'super')
      .single()

    if (verifyError) throw verifyError

    console.log('✅ SUCCESS: Master admin created!')
    console.log('Admin details:', {
      email: email,
      userId: targetUser.id,
      isAdmin: verifyData.is_admin,
      adminLevel: verifyData.admin_level,
      profileType: verifyData.profile_type,
      role: verifyData.role
    })

    return {
      success: true,
      userId: targetUser.id,
      profile: verifyData
    }

  } catch (error) {
    console.error('❌ FAILED to create master admin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Utility function to check if a user is a master admin
export async function checkAdminStatus(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Get user by email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) throw userError

    const user = userData.users.find(u => u.email === email)
    if (!user) return { exists: false }

    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    return {
      exists: true,
      isAdmin: profile.is_admin,
      adminLevel: profile.admin_level,
      profile
    }

  } catch (error) {
    console.error('Error checking admin status:', error)
    return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Usage example (can be called from a script or API endpoint)
if (require.main === module) {
  makeMasterAdmin('kyleqdaley@gmail.com')
    .then(result => {
      if (result.success) {
        console.log('Master admin creation completed successfully!')
      } else {
        console.error('Master admin creation failed:', result.error)
        process.exit(1)
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error)
      process.exit(1)
    })
} 