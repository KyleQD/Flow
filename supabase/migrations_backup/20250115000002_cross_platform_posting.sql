-- Cross-Platform Posting System Migration
-- Enables posting to multiple accounts simultaneously with scheduling and templates

-- Create post_templates table for reusable content
CREATE TABLE IF NOT EXISTS post_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_name TEXT NOT NULL,
  template_category TEXT DEFAULT 'general' CHECK (template_category IN ('general', 'promotion', 'announcement', 'event', 'personal', 'business')),
  content_template TEXT NOT NULL,
  media_templates JSONB DEFAULT '[]',
  hashtag_groups JSONB DEFAULT '[]',
  account_types TEXT[] DEFAULT ARRAY[]::TEXT[], -- Which account types this template is suitable for
  variables JSONB DEFAULT '{}', -- Template variables like {venue_name}, {event_date}, etc.
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE, -- Can other users see/use this template
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scheduled_posts table for post scheduling
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES post_templates(id) ON DELETE SET NULL,
  
  -- Content
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  location TEXT,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'audio', 'poll', 'event')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  repeat_pattern TEXT CHECK (repeat_pattern IN ('none', 'daily', 'weekly', 'monthly', 'custom')),
  repeat_config JSONB DEFAULT '{}',
  
  -- Target accounts
  target_accounts UUID[] NOT NULL, -- Array of account IDs to post to
  account_specific_content JSONB DEFAULT '{}', -- Different content per account if needed
  
  -- Status tracking
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posting', 'completed', 'failed', 'cancelled')),
  posted_at TIMESTAMP WITH TIME ZONE,
  failed_accounts UUID[] DEFAULT ARRAY[]::UUID[],
  success_accounts UUID[] DEFAULT ARRAY[]::UUID[],
  error_details JSONB DEFAULT '{}',
  
  -- Results
  created_post_ids UUID[] DEFAULT ARRAY[]::UUID[], -- IDs of posts created
  total_reach INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cross_posts table to link related posts across accounts
CREATE TABLE IF NOT EXISTS cross_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  master_post_id UUID, -- The "main" post if there is one
  related_post_ids UUID[] DEFAULT ARRAY[]::UUID[], -- All related posts across accounts
  campaign_id TEXT, -- For grouping related cross-posts
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'out_of_sync', 'partial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_variations table for account-specific content
CREATE TABLE IF NOT EXISTS content_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT NOT NULL,
  
  -- Customized content
  custom_content TEXT,
  custom_media_urls JSONB DEFAULT '[]',
  custom_hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_visibility TEXT,
  
  -- Optimization settings
  optimal_posting_time TIMESTAMP WITH TIME ZONE,
  audience_targeting JSONB DEFAULT '{}',
  platform_specific_settings JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scheduled_post_id, account_id)
);

-- Create posting_analytics table
CREATE TABLE IF NOT EXISTS posting_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheduled_post_id UUID REFERENCES scheduled_posts(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  
  -- Performance metrics
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0.0,
  clicks INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  
  -- Time-based metrics
  posted_at TIMESTAMP WITH TIME ZONE,
  first_engagement_at TIMESTAMP WITH TIME ZONE,
  peak_engagement_time TIMESTAMP WITH TIME ZONE,
  
  -- Comparison data
  expected_performance JSONB DEFAULT '{}',
  performance_score FLOAT DEFAULT 0.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hashtag_groups table for organized hashtag management
CREATE TABLE IF NOT EXISTS hashtag_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  group_name TEXT NOT NULL,
  hashtags TEXT[] NOT NULL,
  account_types TEXT[] DEFAULT ARRAY[]::TEXT[], -- Which account types these hashtags work best for
  category TEXT DEFAULT 'general',
  performance_score FLOAT DEFAULT 0.0,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, group_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_templates_user ON post_templates(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user ON scheduled_posts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_time ON scheduled_posts(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_cross_posts_campaign ON cross_posts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_variations_scheduled ON content_variations(scheduled_post_id);
CREATE INDEX IF NOT EXISTS idx_posting_analytics_account ON posting_analytics(account_id, posted_at);
CREATE INDEX IF NOT EXISTS idx_hashtag_groups_user ON hashtag_groups(user_id, is_active);

-- Function to create cross-platform post
CREATE OR REPLACE FUNCTION create_cross_platform_post(
  p_user_id UUID,
  p_content TEXT,
  p_target_accounts UUID[],
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  p_media_urls JSONB DEFAULT '[]',
  p_hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  p_post_type TEXT DEFAULT 'text',
  p_visibility TEXT DEFAULT 'public',
  p_template_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  scheduled_post_id UUID;
  account_id UUID;
  post_id UUID;
  campaign_id TEXT;
BEGIN
  -- Generate campaign ID
  campaign_id := 'cross_' || extract(epoch from now())::text || '_' || substring(gen_random_uuid()::text, 1, 8);
  
  -- Create scheduled post
  INSERT INTO scheduled_posts (
    user_id,
    template_id,
    content,
    media_urls,
    hashtags,
    post_type,
    visibility,
    scheduled_for,
    target_accounts,
    status
  )
  VALUES (
    p_user_id,
    p_template_id,
    p_content,
    p_media_urls,
    p_hashtags,
    p_post_type,
    p_visibility,
    p_scheduled_for,
    p_target_accounts,
    CASE WHEN p_scheduled_for <= NOW() THEN 'posting' ELSE 'scheduled' END
  )
  RETURNING id INTO scheduled_post_id;
  
  -- If posting immediately, create posts for each account
  IF p_scheduled_for <= NOW() THEN
    FOREACH account_id IN ARRAY p_target_accounts
    LOOP
      -- Verify user owns this account
      IF EXISTS (SELECT 1 FROM accounts WHERE id = account_id AND owner_user_id = p_user_id AND is_active = TRUE) THEN
        -- Create post
        INSERT INTO posts (
          user_id,
          account_id,
          content,
          type,
          visibility,
          media_urls,
          hashtags
        )
        VALUES (
          p_user_id,
          account_id,
          p_content,
          p_post_type,
          p_visibility,
          p_media_urls,
          p_hashtags
        )
        RETURNING id INTO post_id;
        
        -- Update success accounts
        UPDATE scheduled_posts SET
          success_accounts = array_append(success_accounts, account_id),
          created_post_ids = array_append(created_post_ids, post_id)
        WHERE id = scheduled_post_id;
        
        -- Create analytics record
        INSERT INTO posting_analytics (scheduled_post_id, account_id, post_id, posted_at)
        VALUES (scheduled_post_id, account_id, post_id, NOW());
      ELSE
        -- Add to failed accounts
        UPDATE scheduled_posts SET
          failed_accounts = array_append(failed_accounts, account_id)
        WHERE id = scheduled_post_id;
      END IF;
    END LOOP;
    
    -- Update status to completed
    UPDATE scheduled_posts SET
      status = 'completed',
      posted_at = NOW()
    WHERE id = scheduled_post_id;
  END IF;
  
  -- Create cross-post record
  INSERT INTO cross_posts (scheduled_post_id, campaign_id)
  VALUES (scheduled_post_id, campaign_id);
  
  RETURN scheduled_post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process scheduled posts
CREATE OR REPLACE FUNCTION process_scheduled_posts()
RETURNS INTEGER AS $$
DECLARE
  scheduled_post RECORD;
  account_id UUID;
  post_id UUID;
  processed_count INTEGER := 0;
BEGIN
  -- Get posts that are ready to be posted
  FOR scheduled_post IN
    SELECT * FROM scheduled_posts
    WHERE status = 'scheduled'
    AND scheduled_for <= NOW()
    ORDER BY scheduled_for ASC
    LIMIT 50
  LOOP
    -- Update status to posting
    UPDATE scheduled_posts SET status = 'posting' WHERE id = scheduled_post.id;
    
    -- Process each target account
    FOREACH account_id IN ARRAY scheduled_post.target_accounts
    LOOP
      BEGIN
        -- Verify account still exists and is owned by user
        IF EXISTS (
          SELECT 1 FROM accounts 
          WHERE id = account_id 
          AND owner_user_id = scheduled_post.user_id 
          AND is_active = TRUE
        ) THEN
          -- Create post
          INSERT INTO posts (
            user_id,
            account_id,
            content,
            type,
            visibility,
            media_urls,
            hashtags
          )
          VALUES (
            scheduled_post.user_id,
            account_id,
            scheduled_post.content,
            scheduled_post.post_type,
            scheduled_post.visibility,
            scheduled_post.media_urls,
            scheduled_post.hashtags
          )
          RETURNING id INTO post_id;
          
          -- Update success accounts
          UPDATE scheduled_posts SET
            success_accounts = array_append(success_accounts, account_id),
            created_post_ids = array_append(created_post_ids, post_id)
          WHERE id = scheduled_post.id;
          
          -- Create analytics record
          INSERT INTO posting_analytics (scheduled_post_id, account_id, post_id, posted_at)
          VALUES (scheduled_post.id, account_id, post_id, NOW());
        ELSE
          -- Account not found or not owned
          UPDATE scheduled_posts SET
            failed_accounts = array_append(failed_accounts, account_id),
            error_details = jsonb_set(
              COALESCE(error_details, '{}'),
              ARRAY[account_id::text],
              '"Account not found or access denied"'
            )
          WHERE id = scheduled_post.id;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        -- Handle any errors
        UPDATE scheduled_posts SET
          failed_accounts = array_append(failed_accounts, account_id),
          error_details = jsonb_set(
            COALESCE(error_details, '{}'),
            ARRAY[account_id::text],
            to_jsonb(SQLERRM)
          )
        WHERE id = scheduled_post.id;
      END;
    END LOOP;
    
    -- Update final status
    UPDATE scheduled_posts SET
      status = 'completed',
      posted_at = NOW()
    WHERE id = scheduled_post.id;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create post template
CREATE OR REPLACE FUNCTION create_post_template(
  p_user_id UUID,
  p_template_name TEXT,
  p_content_template TEXT,
  p_template_category TEXT DEFAULT 'general',
  p_hashtag_groups JSONB DEFAULT '[]',
  p_account_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  p_variables JSONB DEFAULT '{}',
  p_is_public BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  template_id UUID;
BEGIN
  INSERT INTO post_templates (
    user_id,
    template_name,
    template_category,
    content_template,
    hashtag_groups,
    account_types,
    variables,
    is_public
  )
  VALUES (
    p_user_id,
    p_template_name,
    p_template_category,
    p_content_template,
    p_hashtag_groups,
    p_account_types,
    p_variables,
    p_is_public
  )
  RETURNING id INTO template_id;
  
  RETURN template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cross-platform analytics
CREATE OR REPLACE FUNCTION get_cross_platform_analytics(
  p_user_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() - INTERVAL '30 days'),
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_scheduled_posts INTEGER,
  total_posted INTEGER,
  total_failed INTEGER,
  average_success_rate FLOAT,
  total_reach INTEGER,
  total_engagement INTEGER,
  best_performing_account_type TEXT,
  optimal_posting_hour INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH post_stats AS (
    SELECT 
      sp.id,
      sp.status,
      array_length(sp.success_accounts, 1) as success_count,
      array_length(sp.failed_accounts, 1) as failure_count,
      array_length(sp.target_accounts, 1) as target_count,
      sp.total_reach,
      sp.total_engagement,
      EXTRACT(HOUR FROM sp.posted_at) as posting_hour
    FROM scheduled_posts sp
    WHERE sp.user_id = p_user_id
    AND sp.created_at BETWEEN p_start_date AND p_end_date
  ),
  account_performance AS (
    SELECT 
      a.account_type,
      AVG(pa.performance_score) as avg_performance
    FROM posting_analytics pa
    JOIN accounts a ON pa.account_id = a.id
    JOIN scheduled_posts sp ON pa.scheduled_post_id = sp.id
    WHERE sp.user_id = p_user_id
    AND pa.created_at BETWEEN p_start_date AND p_end_date
    GROUP BY a.account_type
  )
  SELECT 
    COUNT(*)::INTEGER as total_scheduled_posts,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as total_posted,
    COUNT(*) FILTER (WHERE status = 'failed')::INTEGER as total_failed,
    COALESCE(AVG(success_count::FLOAT / NULLIF(target_count, 0)), 0) as average_success_rate,
    COALESCE(SUM(total_reach), 0)::INTEGER as total_reach,
    COALESCE(SUM(total_engagement), 0)::INTEGER as total_engagement,
    (SELECT account_type FROM account_performance ORDER BY avg_performance DESC LIMIT 1) as best_performing_account_type,
    (SELECT posting_hour FROM post_stats WHERE posting_hour IS NOT NULL GROUP BY posting_hour ORDER BY COUNT(*) DESC LIMIT 1)::INTEGER as optimal_posting_hour
  FROM post_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE post_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE posting_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own post templates" ON post_templates
  FOR ALL USING (user_id = auth.uid() OR is_public = TRUE);

CREATE POLICY "Users can manage their own scheduled posts" ON scheduled_posts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view cross posts for their scheduled posts" ON cross_posts
  FOR SELECT USING (
    scheduled_post_id IN (SELECT id FROM scheduled_posts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage content variations for their posts" ON content_variations
  FOR ALL USING (
    scheduled_post_id IN (SELECT id FROM scheduled_posts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view analytics for their posts" ON posting_analytics
  FOR SELECT USING (
    scheduled_post_id IN (SELECT id FROM scheduled_posts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their own hashtag groups" ON hashtag_groups
  FOR ALL USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER post_templates_updated_at
  BEFORE UPDATE ON post_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '🎉 Cross-platform posting system created successfully!';
  RAISE NOTICE 'ℹ️  Features: Templates, scheduling, multi-account posting, analytics';
  RAISE NOTICE 'ℹ️  Use create_cross_platform_post() to post to multiple accounts';
  RAISE NOTICE 'ℹ️  Use process_scheduled_posts() to process scheduled content';
END $$; 