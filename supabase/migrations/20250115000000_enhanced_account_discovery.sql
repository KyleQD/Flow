-- Enhanced Account Discovery and Search Migration
-- Optimizes account discovery, search, and social interactions

-- Add search optimization to accounts table
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS search_vector tsvector,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_score FLOAT DEFAULT 0.0;

-- Create search index for better discoverability
CREATE INDEX IF NOT EXISTS idx_accounts_search ON accounts USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_accounts_engagement ON accounts(engagement_score DESC, follower_count DESC);

-- Function to update search vector when account info changes
CREATE OR REPLACE FUNCTION update_account_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.display_name, '') || ' ' || 
    COALESCE(NEW.username, '') || ' ' || 
    COALESCE(NEW.metadata->>'bio', '') || ' ' ||
    COALESCE(NEW.metadata->>'genres', '') || ' ' ||
    COALESCE(NEW.metadata->>'location', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
DROP TRIGGER IF EXISTS update_accounts_search_vector ON accounts;
CREATE TRIGGER update_accounts_search_vector
  BEFORE INSERT OR UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_account_search_vector();

-- Enhanced account discovery function
CREATE OR REPLACE FUNCTION discover_accounts(
  p_search_term TEXT DEFAULT '',
  p_account_types TEXT[] DEFAULT ARRAY['artist', 'venue', 'primary'],
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  account_type TEXT,
  display_name TEXT,
  username TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN,
  follower_count INTEGER,
  engagement_score FLOAT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.account_type,
    a.display_name,
    a.username,
    a.avatar_url,
    a.is_verified,
    a.follower_count,
    a.engagement_score,
    a.metadata
  FROM accounts a
  WHERE 
    a.is_active = TRUE
    AND a.account_type = ANY(p_account_types)
    AND (
      p_search_term = '' OR
      a.search_vector @@ plainto_tsquery('english', p_search_term) OR
      a.display_name ILIKE '%' || p_search_term || '%' OR
      a.username ILIKE '%' || p_search_term || '%'
    )
  ORDER BY 
    CASE WHEN p_search_term = '' THEN 0 ELSE ts_rank(a.search_vector, plainto_tsquery('english', p_search_term)) END DESC,
    a.engagement_score DESC,
    a.follower_count DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update account statistics
CREATE OR REPLACE FUNCTION update_account_stats(account_id UUID)
RETURNS VOID AS $$
DECLARE
  post_count_val INTEGER;
  follower_count_val INTEGER;
  following_count_val INTEGER;
  engagement_val FLOAT;
BEGIN
  -- Get post count
  SELECT COUNT(*) INTO post_count_val
  FROM posts 
  WHERE account_id = $1;
  
  -- Get follower count (assuming a follows table exists)
  SELECT COUNT(*) INTO follower_count_val
  FROM follows f
  JOIN accounts a ON f.following_id = a.owner_user_id
  WHERE a.id = $1;
  
  -- Get following count
  SELECT COUNT(*) INTO following_count_val
  FROM follows f
  JOIN accounts a ON f.follower_id = a.owner_user_id
  WHERE a.id = $1;
  
  -- Calculate engagement score (posts + likes + comments)
  SELECT 
    COALESCE(post_count_val * 1.0 + SUM(p.likes_count) * 0.5 + SUM(p.comments_count) * 0.3, 0.0)
  INTO engagement_val
  FROM posts p 
  WHERE p.account_id = $1;
  
  -- Update account stats
  UPDATE accounts SET
    post_count = post_count_val,
    follower_count = follower_count_val,
    following_count = following_count_val,
    engagement_score = engagement_val,
    updated_at = NOW()
  WHERE id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get account feed with proper attribution
CREATE OR REPLACE FUNCTION get_account_feed(
  p_account_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  account_id UUID,
  account_type TEXT,
  display_name TEXT,
  username TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.content,
    p.created_at,
    a.id,
    a.account_type,
    a.display_name,
    a.username,
    a.avatar_url,
    a.is_verified,
    p.likes_count,
    p.comments_count,
    p.shares_count
  FROM posts p
  JOIN accounts a ON p.account_id = a.id
  WHERE p.account_id = p_account_id
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update all existing accounts' search vectors
UPDATE accounts SET updated_at = NOW();

-- Create RLS policies for enhanced account discovery
CREATE POLICY "Public account discovery" ON accounts
  FOR SELECT USING (is_active = TRUE);

COMMENT ON FUNCTION discover_accounts IS 'Enhanced account discovery with search capabilities';
COMMENT ON FUNCTION update_account_stats IS 'Updates account statistics for engagement tracking';
COMMENT ON FUNCTION get_account_feed IS 'Gets posts from a specific account with proper attribution'; 