require('dotenv').config({ path: '.env.production' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables')
  console.log('URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('Service Key:', serviceRoleKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createFollowRequestsTable() {
  try {
    console.log('Creating follow_requests table...')

    // First, let's check if the table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('follow_requests')
      .select('id')
      .limit(1)

    if (checkError && checkError.code === 'PGRST116') {
      console.log('Follow requests table does not exist, creating it...')
      
      // Since we can't use exec_sql, we'll need to create the table manually
      // For now, let's just test if we can insert into a table that might exist
      console.log('Note: Table creation requires database admin access')
      console.log('Please run the following SQL in your Supabase dashboard:')
      console.log(`
        CREATE TABLE IF NOT EXISTS follow_requests (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(requester_id, target_id)
        );

        CREATE INDEX IF NOT EXISTS idx_follow_requests_requester_id ON follow_requests(requester_id);
        CREATE INDEX IF NOT EXISTS idx_follow_requests_target_id ON follow_requests(target_id);
        CREATE INDEX IF NOT EXISTS idx_follow_requests_status ON follow_requests(status);

        ALTER TABLE follow_requests ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view their own follow requests" ON follow_requests;
        CREATE POLICY "Users can view their own follow requests" ON follow_requests
          FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = target_id);

        DROP POLICY IF EXISTS "Users can manage their own follow requests" ON follow_requests;
        CREATE POLICY "Users can manage their own follow requests" ON follow_requests
          FOR ALL USING (auth.uid() = requester_id OR auth.uid() = target_id);
      `)
      return
    }

    if (checkError) {
      console.error('Error checking follow_requests table:', checkError)
      return
    }

    console.log('✅ Follow requests table already exists!')

    // Test inserting a follow request
    console.log('Testing follow request functionality...')
    
    // Get sample profiles to test with
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(2)

    if (profileError) {
      console.error('Error fetching profiles:', profileError)
      return
    }

    if (!profiles || profiles.length < 2) {
      console.log('Need at least 2 profiles to test follow request functionality')
      return
    }

    const [profile1, profile2] = profiles

    // Try to create a follow request
    const { data: requestData, error: requestError } = await supabase
      .from('follow_requests')
      .insert({
        requester_id: profile1.id,
        target_id: profile2.id,
        status: 'pending'
      })
      .select()

    if (requestError) {
      console.error('❌ Error creating follow request:', requestError)
    } else {
      console.log('✅ Follow request created successfully!')
      console.log('Request data:', requestData)
    }

  } catch (error) {
    console.error('Follow requests table creation error:', error)
  }
}

createFollowRequestsTable()
