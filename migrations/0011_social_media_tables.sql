-- Migration: Social Media Tables
-- Ensures all necessary tables exist for social media functionality

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

-- Comments for documentation
COMMENT ON TABLE follows IS 'User follow relationships for social media functionality';
COMMENT ON TABLE post_likes IS 'Post likes for social media functionality';
COMMENT ON COLUMN profiles.followers_count IS 'Cached count of followers for performance';
COMMENT ON COLUMN profiles.following_count IS 'Cached count of users being followed for performance'; 