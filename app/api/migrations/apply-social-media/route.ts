import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('Applying social media tables migration...')

    // Apply the social media tables migration
    const migrationSQL = `
      -- Create follows table if it doesn't exist
      CREATE TABLE IF NOT EXISTS follows (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(follower_id, following_id),
        CHECK (follower_id != following_id)
      );

      -- Create post_likes table if it doesn't exist
      CREATE TABLE IF NOT EXISTS post_likes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, post_id)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
      CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
      CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
      CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);

      -- Add followers_count and following_count to profiles if they don't exist
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

      -- Create function to update follower counts
      CREATE OR REPLACE FUNCTION update_follower_counts()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          -- Increment following count for follower
          UPDATE profiles 
          SET following_count = following_count + 1 
          WHERE id = NEW.follower_id;
          
          -- Increment followers count for followed user
          UPDATE profiles 
          SET followers_count = followers_count + 1 
          WHERE id = NEW.following_id;
          
          RETURN NEW;
        ELSIF TG_OP = 'DELETE' THEN
          -- Decrement following count for follower
          UPDATE profiles 
          SET following_count = GREATEST(0, following_count - 1) 
          WHERE id = OLD.follower_id;
          
          -- Decrement followers count for followed user
          UPDATE profiles 
          SET followers_count = GREATEST(0, followers_count - 1) 
          WHERE id = OLD.following_id;
          
          RETURN OLD;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      -- Create trigger to automatically update follower counts
      DROP TRIGGER IF EXISTS update_follower_counts_trigger ON follows;
      CREATE TRIGGER update_follower_counts_trigger
        AFTER INSERT OR DELETE ON follows
        FOR EACH ROW
        EXECUTE FUNCTION update_follower_counts();

      -- Enable RLS on social media tables
      ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
      ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

      -- RLS policies for follows table
      DROP POLICY IF EXISTS "Users can view all follows" ON follows;
      CREATE POLICY "Users can view all follows" ON follows
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Users can manage their own follows" ON follows;
      CREATE POLICY "Users can manage their own follows" ON follows
        FOR ALL USING (auth.uid() = follower_id);

      -- RLS policies for post_likes table
      DROP POLICY IF EXISTS "Users can view all post likes" ON post_likes;
      CREATE POLICY "Users can view all post likes" ON post_likes
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Users can manage their own likes" ON post_likes;
      CREATE POLICY "Users can manage their own likes" ON post_likes
        FOR ALL USING (auth.uid() = user_id);
    `

    // Execute the migration using raw SQL
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

    if (error) {
      console.error('Error applying social media migration:', error)
      return NextResponse.json({ 
        error: 'Failed to apply social media migration',
        details: error 
      }, { status: 500 })
    }

    console.log('Social media tables migration applied successfully')

    // Verify the tables were created
    const { data: followsData, error: followsError } = await supabase
      .from('follows')
      .select('id')
      .limit(1)

    if (followsError) {
      console.error('Error verifying follows table:', followsError)
      return NextResponse.json({ 
        error: 'Migration applied but follows table verification failed',
        details: followsError 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Social media tables migration applied successfully',
      followsTableExists: true,
      canQueryFollows: true
    })

  } catch (error) {
    console.error('Social media migration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
