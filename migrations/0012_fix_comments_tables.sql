-- Migration: Fix Comments Tables
-- Ensures post_comments table exists with proper structure and permissions

-- Create post_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE, -- For nested comments
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON post_comments(parent_comment_id);

-- Create comment_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Create indexes for comment_likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Enable RLS on post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on comment_likes
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_comments
DROP POLICY IF EXISTS "Anyone can view comments" ON post_comments;
CREATE POLICY "Anyone can view comments" ON post_comments
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON post_comments;
CREATE POLICY "Authenticated users can create comments" ON post_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
CREATE POLICY "Users can update their own comments" ON post_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
CREATE POLICY "Users can delete their own comments" ON post_comments
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comment_likes
DROP POLICY IF EXISTS "Anyone can view comment likes" ON comment_likes;
CREATE POLICY "Anyone can view comment likes" ON comment_likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own comment likes" ON comment_likes;
CREATE POLICY "Users can manage their own comment likes" ON comment_likes
    FOR ALL USING (auth.uid() = user_id);

-- Function to automatically update comments_count on posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts
        SET comments_count = comments_count + 1,
            updated_at = NOW()
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts
        SET comments_count = GREATEST(comments_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for post_comments
DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON post_comments;
CREATE TRIGGER trigger_update_post_comments_count
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comments_count();

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE post_comments
        SET likes_count = likes_count + 1
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE post_comments
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment_likes
DROP TRIGGER IF EXISTS trigger_update_comment_likes_count ON comment_likes;
CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_likes_count();

-- Ensure posts table has comments_count column
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Update existing posts to have correct comment counts
UPDATE posts 
SET comments_count = (
    SELECT COUNT(*) 
    FROM post_comments 
    WHERE post_comments.post_id = posts.id
)
WHERE comments_count != (
    SELECT COUNT(*) 
    FROM post_comments 
    WHERE post_comments.post_id = posts.id
);

-- Comments for documentation
COMMENT ON TABLE post_comments IS 'Comments on posts with support for nested replies';
COMMENT ON TABLE comment_likes IS 'Likes on individual comments';
COMMENT ON COLUMN post_comments.parent_comment_id IS 'For nested comment replies';
COMMENT ON FUNCTION update_post_comments_count() IS 'Automatically updates posts.comments_count when comments are added/removed';
COMMENT ON FUNCTION update_comment_likes_count() IS 'Automatically updates post_comments.likes_count when comment likes are added/removed'; 