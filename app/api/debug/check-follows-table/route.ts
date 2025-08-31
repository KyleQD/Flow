import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Check if follows table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'follows')
      .eq('table_schema', 'public')
      .single()

    if (tableError && tableError.code !== 'PGRST116') {
      console.error('Error checking follows table:', tableError)
      return NextResponse.json({ error: 'Failed to check follows table' }, { status: 500 })
    }

    if (!tableExists) {
      // Apply the migration
      console.log('Follows table does not exist, applying migration...')
      
      // Create follows table
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS follows (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(follower_id, following_id),
            CHECK (follower_id != following_id)
          );
          
          CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
          CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
          
          ALTER TABLE profiles 
          ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
          ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
          
          ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
          
          DROP POLICY IF EXISTS "Users can view all follows" ON follows;
          CREATE POLICY "Users can view all follows" ON follows
            FOR SELECT USING (true);
          
          DROP POLICY IF EXISTS "Users can manage their own follows" ON follows;
          CREATE POLICY "Users can manage their own follows" ON follows
            FOR ALL USING (auth.uid() = follower_id);
        `
      })

      if (createError) {
        console.error('Error creating follows table:', createError)
        return NextResponse.json({ error: 'Failed to create follows table' }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Follows table created successfully',
        tableExists: true 
      })
    }

    // Check if we can query the follows table
    const { data: followsData, error: followsError } = await supabase
      .from('follows')
      .select('id')
      .limit(1)

    if (followsError) {
      console.error('Error querying follows table:', followsError)
      return NextResponse.json({ 
        error: 'Follows table exists but cannot be queried',
        details: followsError 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Follows table exists and is working',
      tableExists: true,
      canQuery: true,
      sampleData: followsData
    })

  } catch (error) {
    console.error('Debug follows table error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
