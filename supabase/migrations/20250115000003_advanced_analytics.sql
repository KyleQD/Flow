-- Advanced Analytics System Migration
-- Comprehensive analytics with historical data, growth metrics, and insights

-- Create analytics_snapshots table for historical tracking
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  snapshot_date DATE NOT NULL,
  snapshot_type TEXT DEFAULT 'daily' CHECK (snapshot_type IN ('hourly', 'daily', 'weekly', 'monthly')),
  
  -- Follower metrics
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  follower_growth INTEGER DEFAULT 0,
  following_growth INTEGER DEFAULT 0,
  
  -- Content metrics
  post_count INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  
  -- Engagement metrics
  engagement_rate FLOAT DEFAULT 0.0,
  average_likes_per_post FLOAT DEFAULT 0.0,
  average_comments_per_post FLOAT DEFAULT 0.0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  
  -- Growth rates (percentage change from previous period)
  follower_growth_rate FLOAT DEFAULT 0.0,
  engagement_growth_rate FLOAT DEFAULT 0.0,
  post_frequency FLOAT DEFAULT 0.0,
  
  -- Quality metrics
  content_quality_score FLOAT DEFAULT 0.0,
  audience_quality_score FLOAT DEFAULT 0.0,
  viral_coefficient FLOAT DEFAULT 0.0,
  
  -- Platform-specific metrics
  platform_metrics JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, snapshot_date, snapshot_type)
);

-- Create engagement_analytics table for detailed engagement tracking
CREATE TABLE IF NOT EXISTS engagement_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  
  -- Time-based engagement
  hour_of_day INTEGER CHECK (hour_of_day BETWEEN 0 AND 23),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7), -- 1 = Monday
  date_posted DATE NOT NULL,
  
  -- Engagement metrics by time periods
  engagement_1h INTEGER DEFAULT 0,
  engagement_6h INTEGER DEFAULT 0,
  engagement_24h INTEGER DEFAULT 0,
  engagement_7d INTEGER DEFAULT 0,
  engagement_30d INTEGER DEFAULT 0,
  
  -- Detailed engagement breakdown
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  
  -- Audience insights
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  
  -- Content performance
  content_type TEXT,
  has_media BOOLEAN DEFAULT FALSE,
  hashtag_count INTEGER DEFAULT 0,
  content_length INTEGER DEFAULT 0,
  
  -- Performance scores
  viral_score FLOAT DEFAULT 0.0,
  engagement_quality_score FLOAT DEFAULT 0.0,
  content_resonance_score FLOAT DEFAULT 0.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audience_analytics table for follower insights
CREATE TABLE IF NOT EXISTS audience_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  analysis_date DATE NOT NULL,
  
  -- Demographics (anonymized aggregates)
  age_distribution JSONB DEFAULT '{}', -- {"18-24": 25, "25-34": 40, ...}
  gender_distribution JSONB DEFAULT '{}', -- {"male": 45, "female": 52, "other": 3}
  location_distribution JSONB DEFAULT '{}', -- {"US": 60, "UK": 15, "CA": 10, ...}
  
  -- Engagement patterns
  most_active_hours JSONB DEFAULT '{}', -- {"12": 45, "18": 67, "20": 89}
  most_active_days JSONB DEFAULT '{}', -- {"monday": 120, "friday": 200}
  
  -- Audience quality metrics
  average_follower_engagement FLOAT DEFAULT 0.0,
  bot_percentage FLOAT DEFAULT 0.0,
  real_follower_percentage FLOAT DEFAULT 100.0,
  audience_overlap_percentage FLOAT DEFAULT 0.0,
  
  -- Interest analysis
  top_interests JSONB DEFAULT '[]', -- ["music", "art", "technology"]
  hashtag_affinity JSONB DEFAULT '{}', -- {"#music": 0.8, "#art": 0.6}
  
  -- Growth analysis
  new_followers INTEGER DEFAULT 0,
  lost_followers INTEGER DEFAULT 0,
  net_growth INTEGER DEFAULT 0,
  follower_retention_rate FLOAT DEFAULT 0.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, analysis_date)
);

-- Create content_performance table for content-specific analytics
CREATE TABLE IF NOT EXISTS content_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  
  -- Performance categories
  performance_tier TEXT DEFAULT 'average' CHECK (performance_tier IN ('viral', 'high', 'average', 'low', 'poor')),
  
  -- Content analysis
  content_type TEXT NOT NULL,
  content_category TEXT,
  primary_emotion TEXT, -- detected emotion in content
  sentiment_score FLOAT DEFAULT 0.0, -- -1 to 1
  readability_score FLOAT DEFAULT 0.0, -- 0 to 100
  
  -- Visual analysis (for image/video content)
  has_faces BOOLEAN DEFAULT FALSE,
  color_palette JSONB DEFAULT '[]',
  visual_complexity_score FLOAT DEFAULT 0.0,
  
  -- Timing analysis
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  optimal_time_score FLOAT DEFAULT 0.0, -- how close to optimal posting time
  time_zone TEXT DEFAULT 'UTC',
  
  -- Hashtag performance
  hashtag_performance JSONB DEFAULT '{}', -- {"#music": 0.8, "#viral": 0.3}
  
  -- Competitive analysis
  similar_content_average FLOAT DEFAULT 0.0,
  performance_vs_average FLOAT DEFAULT 0.0, -- percentage above/below average
  
  -- Predictions
  predicted_final_engagement INTEGER DEFAULT 0,
  viral_probability FLOAT DEFAULT 0.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create growth_trends table for trend analysis
CREATE TABLE IF NOT EXISTS growth_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  trend_period TEXT NOT NULL CHECK (trend_period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Growth metrics
  follower_growth_absolute INTEGER DEFAULT 0,
  follower_growth_percentage FLOAT DEFAULT 0.0,
  engagement_growth_percentage FLOAT DEFAULT 0.0,
  content_output_growth FLOAT DEFAULT 0.0,
  
  -- Trend analysis
  growth_acceleration FLOAT DEFAULT 0.0, -- is growth speeding up or slowing down
  seasonality_factor FLOAT DEFAULT 1.0,
  trend_direction TEXT DEFAULT 'stable' CHECK (trend_direction IN ('growing', 'stable', 'declining')),
  
  -- Benchmarking
  industry_percentile FLOAT DEFAULT 50.0, -- where account ranks in industry
  similar_accounts_comparison FLOAT DEFAULT 0.0,
  
  -- Key events that influenced growth
  significant_events JSONB DEFAULT '[]', -- [{"date": "2024-01-15", "event": "viral_post", "impact": 25.3}]
  
  -- Projections
  projected_growth_30d FLOAT DEFAULT 0.0,
  projected_growth_90d FLOAT DEFAULT 0.0,
  confidence_score FLOAT DEFAULT 0.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, trend_period, period_start)
);

-- Create competitor_analysis table
CREATE TABLE IF NOT EXISTS competitor_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  competitor_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  
  -- Comparative metrics
  follower_count_comparison JSONB DEFAULT '{}', -- {"self": 1000, "competitor": 1500, "ratio": 0.67}
  engagement_rate_comparison JSONB DEFAULT '{}',
  posting_frequency_comparison JSONB DEFAULT '{}',
  content_quality_comparison JSONB DEFAULT '{}',
  
  -- Content strategy analysis
  content_overlap_percentage FLOAT DEFAULT 0.0,
  hashtag_overlap JSONB DEFAULT '{}',
  posting_time_overlap FLOAT DEFAULT 0.0,
  
  -- Performance gaps
  opportunity_score FLOAT DEFAULT 0.0, -- potential for improvement
  threat_level FLOAT DEFAULT 0.0, -- competitive threat level
  
  -- Recommendations
  strategic_recommendations JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, competitor_account_id, analysis_date)
);

-- Create analytics_reports table for generated insights
CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'quarterly', 'custom')),
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  
  -- Key metrics summary
  key_metrics JSONB NOT NULL DEFAULT '{}',
  growth_summary JSONB DEFAULT '{}',
  top_performing_content JSONB DEFAULT '[]',
  audience_insights JSONB DEFAULT '{}',
  
  -- AI-generated insights
  insights JSONB DEFAULT '[]', -- [{"type": "opportunity", "insight": "...", "confidence": 0.8}]
  recommendations JSONB DEFAULT '[]',
  predictions JSONB DEFAULT '{}',
  
  -- Report metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  report_version TEXT DEFAULT '1.0',
  confidence_score FLOAT DEFAULT 0.0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_account_date ON analytics_snapshots(account_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_analytics_account ON engagement_analytics(account_id, date_posted DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_analytics_post ON engagement_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_audience_analytics_account ON audience_analytics(account_id, analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_content_performance_account ON content_performance(account_id, posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_growth_trends_account ON growth_trends(account_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_account ON competitor_analysis(account_id, analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_account ON analytics_reports(account_id, report_period_start DESC);

-- Function to create daily analytics snapshot
CREATE OR REPLACE FUNCTION create_daily_analytics_snapshot(p_account_id UUID)
RETURNS VOID AS $$
DECLARE
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  current_metrics RECORD;
  previous_metrics RECORD;
  growth_values RECORD;
BEGIN
  -- Get current metrics
  SELECT 
    a.follower_count,
    a.following_count,
    a.post_count,
    COALESCE(SUM(p.likes_count), 0) as total_likes,
    COALESCE(SUM(p.comments_count), 0) as total_comments,
    COALESCE(SUM(p.shares_count), 0) as total_shares,
    COUNT(p.id) as daily_posts
  INTO current_metrics
  FROM accounts a
  LEFT JOIN posts p ON a.id = p.account_id AND DATE(p.created_at) = today
  WHERE a.id = p_account_id
  GROUP BY a.id, a.follower_count, a.following_count, a.post_count;
  
  -- Get previous day metrics for growth calculation
  SELECT 
    follower_count,
    following_count,
    engagement_rate
  INTO previous_metrics
  FROM analytics_snapshots
  WHERE account_id = p_account_id 
  AND snapshot_date = yesterday
  AND snapshot_type = 'daily'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Calculate growth
  SELECT 
    COALESCE(current_metrics.follower_count - previous_metrics.follower_count, 0) as follower_growth,
    COALESCE(current_metrics.following_count - previous_metrics.following_count, 0) as following_growth,
    CASE 
      WHEN previous_metrics.follower_count > 0 THEN
        ((current_metrics.follower_count - previous_metrics.follower_count)::FLOAT / previous_metrics.follower_count) * 100
      ELSE 0
    END as follower_growth_rate,
    CASE 
      WHEN current_metrics.daily_posts > 0 THEN
        (current_metrics.total_likes::FLOAT / current_metrics.daily_posts)
      ELSE 0
    END as avg_likes_per_post
  INTO growth_values;
  
  -- Insert snapshot
  INSERT INTO analytics_snapshots (
    account_id,
    snapshot_date,
    snapshot_type,
    follower_count,
    following_count,
    follower_growth,
    following_growth,
    post_count,
    total_likes,
    total_comments,
    total_shares,
    follower_growth_rate,
    average_likes_per_post,
    engagement_rate
  )
  VALUES (
    p_account_id,
    today,
    'daily',
    current_metrics.follower_count,
    current_metrics.following_count,
    growth_values.follower_growth,
    growth_values.following_growth,
    current_metrics.daily_posts,
    current_metrics.total_likes,
    current_metrics.total_comments,
    current_metrics.total_shares,
    growth_values.follower_growth_rate,
    growth_values.avg_likes_per_post,
    CASE 
      WHEN current_metrics.follower_count > 0 THEN
        ((current_metrics.total_likes + current_metrics.total_comments)::FLOAT / current_metrics.follower_count) * 100
      ELSE 0
    END
  )
  ON CONFLICT (account_id, snapshot_date, snapshot_type)
  DO UPDATE SET
    follower_count = EXCLUDED.follower_count,
    following_count = EXCLUDED.following_count,
    follower_growth = EXCLUDED.follower_growth,
    following_growth = EXCLUDED.following_growth,
    post_count = EXCLUDED.post_count,
    total_likes = EXCLUDED.total_likes,
    total_comments = EXCLUDED.total_comments,
    total_shares = EXCLUDED.total_shares,
    follower_growth_rate = EXCLUDED.follower_growth_rate,
    average_likes_per_post = EXCLUDED.average_likes_per_post,
    engagement_rate = EXCLUDED.engagement_rate,
    created_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get comprehensive analytics
CREATE OR REPLACE FUNCTION get_account_analytics(
  p_account_id UUID,
  p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  period_start DATE,
  period_end DATE,
  follower_growth INTEGER,
  engagement_rate FLOAT,
  total_posts INTEGER,
  total_engagement INTEGER,
  avg_likes_per_post FLOAT,
  top_performing_post_id UUID,
  growth_trend TEXT,
  insights JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_metrics AS (
    SELECT 
      snapshot_date,
      follower_count,
      follower_growth,
      engagement_rate,
      post_count,
      total_likes + total_comments + total_shares as total_engagement,
      average_likes_per_post
    FROM analytics_snapshots
    WHERE account_id = p_account_id
    AND snapshot_date BETWEEN p_start_date AND p_end_date
    AND snapshot_type = 'daily'
    ORDER BY snapshot_date
  ),
  period_summary AS (
    SELECT 
      p_start_date as period_start,
      p_end_date as period_end,
      SUM(follower_growth) as total_follower_growth,
      AVG(engagement_rate) as avg_engagement_rate,
      SUM(post_count) as total_posts,
      SUM(total_engagement) as total_engagement,
      AVG(average_likes_per_post) as avg_likes_per_post
    FROM daily_metrics
  ),
  top_post AS (
    SELECT cp.post_id
    FROM content_performance cp
    JOIN posts p ON cp.post_id = p.id
    WHERE p.account_id = p_account_id
    AND DATE(cp.posted_at) BETWEEN p_start_date AND p_end_date
    ORDER BY (p.likes_count + p.comments_count + p.shares_count) DESC
    LIMIT 1
  ),
  trend_analysis AS (
    SELECT 
      CASE 
        WHEN AVG(follower_growth) OVER (ORDER BY snapshot_date ROWS BETWEEN 7 PRECEDING AND CURRENT ROW) > 
             AVG(follower_growth) OVER (ORDER BY snapshot_date ROWS BETWEEN 14 PRECEDING AND 7 PRECEDING)
        THEN 'growing'
        WHEN AVG(follower_growth) OVER (ORDER BY snapshot_date ROWS BETWEEN 7 PRECEDING AND CURRENT ROW) < 
             AVG(follower_growth) OVER (ORDER BY snapshot_date ROWS BETWEEN 14 PRECEDING AND 7 PRECEDING)
        THEN 'declining'
        ELSE 'stable'
      END as trend
    FROM daily_metrics
    ORDER BY snapshot_date DESC
    LIMIT 1
  )
  SELECT 
    ps.period_start,
    ps.period_end,
    ps.total_follower_growth,
    ps.avg_engagement_rate,
    ps.total_posts,
    ps.total_engagement,
    ps.avg_likes_per_post,
    tp.post_id,
    ta.trend,
    jsonb_build_object(
      'growth_consistency', CASE WHEN ps.total_follower_growth > 0 THEN 'positive' ELSE 'negative' END,
      'engagement_health', CASE WHEN ps.avg_engagement_rate > 3.0 THEN 'good' WHEN ps.avg_engagement_rate > 1.0 THEN 'average' ELSE 'poor' END,
      'posting_frequency', ps.total_posts::FLOAT / EXTRACT(DAYS FROM (p_end_date - p_start_date + 1))
    ) as insights
  FROM period_summary ps
  CROSS JOIN top_post tp
  CROSS JOIN trend_analysis ta;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate weekly analytics report
CREATE OR REPLACE FUNCTION generate_weekly_analytics_report(p_account_id UUID)
RETURNS UUID AS $$
DECLARE
  report_id UUID;
  week_start DATE := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  week_end DATE := (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days')::DATE;
  metrics RECORD;
  top_posts JSONB;
  insights_array JSONB;
BEGIN
  -- Get week metrics
  SELECT * INTO metrics
  FROM get_account_analytics(p_account_id, week_start, week_end);
  
  -- Get top performing posts
  SELECT jsonb_agg(
    jsonb_build_object(
      'post_id', p.id,
      'content', LEFT(p.content, 100),
      'engagement', p.likes_count + p.comments_count + p.shares_count,
      'posted_at', p.created_at
    )
  ) INTO top_posts
  FROM posts p
  WHERE p.account_id = p_account_id
  AND DATE(p.created_at) BETWEEN week_start AND week_end
  ORDER BY (p.likes_count + p.comments_count + p.shares_count) DESC
  LIMIT 5;
  
  -- Generate insights
  SELECT jsonb_build_array(
    jsonb_build_object(
      'type', 'growth',
      'insight', CASE 
        WHEN metrics.follower_growth > 0 THEN 'Positive follower growth this week'
        ELSE 'Focus on content strategy to improve growth'
      END,
      'confidence', 0.8
    ),
    jsonb_build_object(
      'type', 'engagement',
      'insight', CASE 
        WHEN metrics.engagement_rate > 3.0 THEN 'Excellent engagement rate maintained'
        WHEN metrics.engagement_rate > 1.0 THEN 'Good engagement, room for improvement'
        ELSE 'Engagement needs attention - consider content strategy review'
      END,
      'confidence', 0.9
    )
  ) INTO insights_array;
  
  -- Create report
  INSERT INTO analytics_reports (
    account_id,
    report_type,
    report_period_start,
    report_period_end,
    key_metrics,
    top_performing_content,
    insights,
    confidence_score
  )
  VALUES (
    p_account_id,
    'weekly',
    week_start,
    week_end,
    jsonb_build_object(
      'follower_growth', metrics.follower_growth,
      'engagement_rate', metrics.engagement_rate,
      'total_posts', metrics.total_posts,
      'total_engagement', metrics.total_engagement
    ),
    COALESCE(top_posts, '[]'::jsonb),
    insights_array,
    0.85
  )
  RETURNING id INTO report_id;
  
  RETURN report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view analytics for their accounts" ON analytics_snapshots
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Users can view engagement analytics for their accounts" ON engagement_analytics
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Users can view audience analytics for their accounts" ON audience_analytics
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Users can view content performance for their accounts" ON content_performance
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Users can view growth trends for their accounts" ON growth_trends
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Users can view competitor analysis for their accounts" ON competitor_analysis
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE owner_user_id = auth.uid())
  );

CREATE POLICY "Users can view reports for their accounts" ON analytics_reports
  FOR SELECT USING (
    account_id IN (SELECT id FROM accounts WHERE owner_user_id = auth.uid())
  );

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '🎉 Advanced analytics system created successfully!';
  RAISE NOTICE 'ℹ️  Features: Historical tracking, growth metrics, audience insights, content performance';
  RAISE NOTICE 'ℹ️  Use create_daily_analytics_snapshot() to track daily metrics';
  RAISE NOTICE 'ℹ️  Use get_account_analytics() to get comprehensive analytics';
  RAISE NOTICE 'ℹ️  Use generate_weekly_analytics_report() to create reports';
END $$; 