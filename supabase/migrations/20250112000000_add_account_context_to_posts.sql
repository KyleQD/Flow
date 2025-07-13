-- Add Account Context Columns to Posts Table
-- This migration adds columns to track which account type posted each post

-- Add account context columns to posts table if they don't exist
DO $$ 
BEGIN
  -- Add posted_as_profile_id column to track which profile posted
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'posted_as_profile_id') THEN
    ALTER TABLE posts ADD COLUMN posted_as_profile_id UUID;
    RAISE NOTICE '✅ Added posted_as_profile_id column to posts table';
  ELSE
    RAISE NOTICE 'ℹ️  posted_as_profile_id column already exists';
  END IF;
  
  -- Add posted_as_account_type column to track account type (artist, venue, business, primary)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'posted_as_account_type') THEN
    ALTER TABLE posts ADD COLUMN posted_as_account_type TEXT DEFAULT 'primary' CHECK (posted_as_account_type IN ('primary', 'artist', 'venue', 'business'));
    RAISE NOTICE '✅ Added posted_as_account_type column to posts table';
  ELSE
    RAISE NOTICE 'ℹ️  posted_as_account_type column already exists';
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_account_context ON posts(posted_as_profile_id, posted_as_account_type);
CREATE INDEX IF NOT EXISTS idx_posts_account_type ON posts(posted_as_account_type);

-- Update RLS policies to include account context (if needed)
-- Note: This assumes posts table already has RLS enabled

COMMENT ON COLUMN posts.posted_as_profile_id IS 'ID of the profile that made the post (artist_profiles.id, venue_profiles.id, etc.)';
COMMENT ON COLUMN posts.posted_as_account_type IS 'Type of account that made the post (primary, artist, venue, business)';

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '🎉 Account context columns added to posts table successfully!';
  RAISE NOTICE 'ℹ️  Posts can now track which account type was used for posting';
  RAISE NOTICE 'ℹ️  This enables proper multi-account display names in feeds';
END $$; 