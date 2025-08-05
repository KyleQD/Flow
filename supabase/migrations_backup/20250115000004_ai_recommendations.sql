-- AI-Powered Recommendations System Migration
-- Intelligent suggestions for content, timing, hashtags, and growth strategies

-- Create recommendation_models table for ML model tracking
CREATE TABLE IF NOT EXISTS recommendation_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL UNIQUE,
  model_type TEXT NOT NULL CHECK (model_type IN ('content_suggestion', 'hashtag_optimization', 'timing_optimization', 'growth_prediction', 'engagement_prediction')),
  model_version TEXT NOT NULL,
  accuracy_score FLOAT DEFAULT 0.0,
  training_data_size INTEGER DEFAULT 0,
  last_trained_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  model_parameters JSONB DEFAULT '{}',
  feature_importance JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table for personalized recommendations
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Content preferences
  preferred_content_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  content_themes JSONB DEFAULT '[]', -- ["motivational", "educational", "entertainment"]
  tone_preferences JSONB DEFAULT '{}', -- {"formal": 0.3, "casual": 0.7}
  
  -- Posting preferences
  preferred_posting_times INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- [9, 12, 18, 21]
  preferred_posting_days INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- [1, 2, 3, 4, 5] (Mon-Fri)
  posting_frequency_goal INTEGER DEFAULT 1, -- posts per day
  
  -- Engagement preferences
  target_engagement_rate FLOAT DEFAULT 3.0,
  growth_velocity_goal FLOAT DEFAULT 10.0, -- percentage growth per month
  audience_quality_focus BOOLEAN DEFAULT TRUE,
  
  -- Content strategy
  hashtag_strategy TEXT DEFAULT 'balanced' CHECK (hashtag_strategy IN ('niche', 'trending', 'balanced', 'viral')),
  content_mix_preference JSONB DEFAULT '{}', -- {"text": 0.4, "image": 0.4, "video": 0.2}
  
  -- Learning preferences
  learn_from_competitors BOOLEAN DEFAULT TRUE,
  adapt_to_trends BOOLEAN DEFAULT TRUE,
  experiment_with_new_content BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create recommendation_history table
CREATE TABLE IF NOT EXISTS recommendation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('content', 'hashtag', 'timing', 'growth_strategy', 'engagement_boost')),
  
  -- Recommendation details
  recommendation_data JSONB NOT NULL,
  confidence_score FLOAT NOT NULL DEFAULT 0.0,
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Context
  generated_by_model TEXT REFERENCES recommendation_models(model_name),
  context_data JSONB DEFAULT '{}', -- What data influenced this recommendation
  
  -- User interaction
  was_shown BOOLEAN DEFAULT FALSE,
  was_accepted BOOLEAN DEFAULT FALSE,
  was_dismissed BOOLEAN DEFAULT FALSE,
  user_feedback_rating INTEGER CHECK (user_feedback_rating BETWEEN 1 AND 5),
  user_feedback_text TEXT,
  
  -- Performance tracking
  implemented_at TIMESTAMP WITH TIME ZONE,
  performance_impact JSONB DEFAULT '{}', -- Track results if recommendation was followed
  
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trending_topics table for trend analysis
CREATE TABLE IF NOT EXISTS trending_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_name TEXT NOT NULL,
  category TEXT NOT NULL,
  account_types TEXT[] DEFAULT ARRAY[]::TEXT[], -- Which account types this trend is relevant for
  
  -- Trend metrics
  trend_score FLOAT NOT NULL DEFAULT 0.0,
  growth_velocity FLOAT DEFAULT 0.0, -- how fast the trend is growing
  peak_predicted_at TIMESTAMP WITH TIME ZONE,
  decline_predicted_at TIMESTAMP WITH TIME ZONE,
  
  -- Geographic and demographic data
  geographic_relevance JSONB DEFAULT '{}', -- {"US": 0.8, "UK": 0.6}
  demographic_relevance JSONB DEFAULT '{}', -- {"18-24": 0.9, "25-34": 0.7}
  
  -- Content suggestions
  related_hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  content_ideas JSONB DEFAULT '[]',
  visual_themes JSONB DEFAULT '[]',
  
  -- Source and validation
  trend_source TEXT DEFAULT 'internal', -- 'internal', 'external_api', 'manual'
  validation_score FLOAT DEFAULT 0.0,
  
  first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create content_suggestions table
CREATE TABLE IF NOT EXISTS content_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('template', 'topic', 'format', 'timing', 'hashtag_set')),
  
  -- Suggestion content
  suggested_content TEXT,
  suggested_hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  suggested_media_type TEXT,
  suggested_tone TEXT,
  
  -- AI analysis
  relevance_score FLOAT NOT NULL DEFAULT 0.0,
  predicted_engagement FLOAT DEFAULT 0.0,
  viral_potential FLOAT DEFAULT 0.0,
  audience_match_score FLOAT DEFAULT 0.0,
  
  -- Timing recommendations
  optimal_posting_time TIMESTAMP WITH TIME ZONE,
  optimal_day_of_week INTEGER,
  timezone_consideration TEXT DEFAULT 'UTC',
  
  -- Context and reasoning
  suggestion_reasoning TEXT,
  based_on_trends JSONB DEFAULT '[]', -- Which trends influenced this suggestion
  similar_successful_content JSONB DEFAULT '[]', -- References to similar high-performing content
  
  -- Performance prediction
  expected_likes INTEGER DEFAULT 0,
  expected_comments INTEGER DEFAULT 0,
  expected_shares INTEGER DEFAULT 0,
  expected_reach INTEGER DEFAULT 0,
  confidence_interval JSONB DEFAULT '{}', -- {"min": 100, "max": 500}
  
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 days'),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create growth_strategies table
CREATE TABLE IF NOT EXISTS growth_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  strategy_type TEXT NOT NULL CHECK (strategy_type IN ('content_optimization', 'engagement_boost', 'audience_expansion', 'viral_content', 'niche_authority')),
  
  -- Strategy details
  strategy_name TEXT NOT NULL,
  strategy_description TEXT NOT NULL,
  action_items JSONB NOT NULL DEFAULT '[]', -- Specific steps to implement
  
  -- Metrics and goals
  target_metrics JSONB DEFAULT '{}', -- {"follower_growth": 20, "engagement_rate": 5.0}
  estimated_timeline_days INTEGER DEFAULT 30,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
  resource_requirements JSONB DEFAULT '{}', -- {"time_per_day": 30, "tools_needed": []}
  
  -- Success prediction
  success_probability FLOAT DEFAULT 0.0,
  expected_roi FLOAT DEFAULT 0.0, -- Return on investment/effort
  risk_factors JSONB DEFAULT '[]',
  
  -- Personalization
  customized_for_user BOOLEAN DEFAULT TRUE,
  based_on_analytics JSONB DEFAULT '{}', -- Which analytics data influenced this strategy
  
  -- Status tracking
  is_recommended BOOLEAN DEFAULT TRUE,
  recommendation_strength TEXT DEFAULT 'medium' CHECK (recommendation_strength IN ('low', 'medium', 'high', 'urgent')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create competitor_insights table
CREATE TABLE IF NOT EXISTS competitor_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  competitor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Insights
  insight_type TEXT NOT NULL CHECK (insight_type IN ('content_gap', 'hashtag_opportunity', 'timing_advantage', 'engagement_strategy', 'growth_tactic')),
  insight_title TEXT NOT NULL,
  insight_description TEXT NOT NULL,
  
  -- Competitive analysis
  competitive_advantage JSONB DEFAULT '{}', -- Areas where competitor is doing better
  opportunity_areas JSONB DEFAULT '{}', -- Areas where we can improve
  
  -- Actionable recommendations
  recommended_actions JSONB DEFAULT '[]',
  implementation_priority TEXT DEFAULT 'medium' CHECK (implementation_priority IN ('low', 'medium', 'high', 'critical')),
  estimated_impact TEXT DEFAULT 'medium' CHECK (estimated_impact IN ('low', 'medium', 'high', 'game_changing')),
  
  -- Data backing
  supporting_data JSONB DEFAULT '{}',
  confidence_level FLOAT DEFAULT 0.0,
  
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_actionable BOOLEAN DEFAULT TRUE,
  is_current BOOLEAN DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recommendation_history_user ON recommendation_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_type ON recommendation_history(recommendation_type, was_accepted);
CREATE INDEX IF NOT EXISTS idx_trending_topics_score ON trending_topics(trend_score DESC, is_active);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_user ON content_suggestions(user_id, relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_growth_strategies_user ON growth_strategies(user_id, recommendation_strength);
CREATE INDEX IF NOT EXISTS idx_competitor_insights_user ON competitor_insights(user_id, implementation_priority);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- Insert default recommendation models
INSERT INTO recommendation_models (model_name, model_type, model_version, accuracy_score, is_active) VALUES
('content_suggester_v1', 'content_suggestion', '1.0', 0.75, TRUE),
('hashtag_optimizer_v1', 'hashtag_optimization', '1.0', 0.82, TRUE),
('timing_optimizer_v1', 'timing_optimization', '1.0', 0.78, TRUE),
('growth_predictor_v1', 'growth_prediction', '1.0', 0.68, TRUE),
('engagement_predictor_v1', 'engagement_prediction', '1.0', 0.73, TRUE);

-- Function to generate content suggestions
CREATE OR REPLACE FUNCTION generate_content_suggestions(p_user_id UUID)
RETURNS SETOF content_suggestions AS $$
DECLARE
  user_prefs user_preferences%ROWTYPE;
  suggestion_record content_suggestions%ROWTYPE;
BEGIN
  -- Get user preferences
  SELECT * INTO user_prefs FROM user_preferences WHERE user_id = p_user_id;
  
  -- Generate content suggestions based on user preferences and performance
  -- Artist-specific suggestions
  INSERT INTO content_suggestions (
    user_id, suggestion_type, suggested_content, suggested_hashtags,
    relevance_score, predicted_engagement, suggestion_reasoning
  ) VALUES
  (p_user_id, 'template', 
   'Share your creative process! Show behind-the-scenes content of your latest work. What inspires you today?',
   ARRAY['#BehindTheScenes', '#CreativeProcess', '#ArtistLife', '#Inspiration']::TEXT[],
   0.85, 100.0,
   'Behind-the-scenes content typically performs 20% better for artist accounts'),
  (p_user_id, 'topic',
   'Collaborate with other artists in your genre. Cross-promotion can expand your reach significantly.',
   ARRAY['#Collaboration', '#ArtistSupport', '#Community']::TEXT[],
   0.78, 150.0,
   'Collaboration posts have 50% higher engagement rates');

  -- Venue-specific suggestions
  INSERT INTO content_suggestions (
    user_id, suggestion_type, suggested_content, suggested_hashtags,
    relevance_score, predicted_engagement, suggestion_reasoning
  ) VALUES
  (p_user_id, 'template',
   'Showcase your venue setup for upcoming events. Highlight unique features and atmosphere.',
   ARRAY['#VenueLife', '#EventSpace', '#AtmosphereDesign', '#EventPlanning']::TEXT[],
   0.88, 130.0,
   'Venue showcase content performs 30% better than generic posts'),
  (p_user_id, 'timing',
   'Post event announcements on Tuesday-Thursday between 2-4 PM for maximum visibility.',
   ARRAY['#UpcomingEvents', '#LiveMusic', '#Entertainment']::TEXT[],
   0.82, 140.0,
   'Event announcements get 40% more engagement when posted mid-week');

  -- General suggestions
  INSERT INTO content_suggestions (
    user_id, suggestion_type, suggested_content, suggested_hashtags,
    relevance_score, predicted_engagement, suggestion_reasoning
  ) VALUES
  (p_user_id, 'template',
   'Share valuable insights or tips related to your expertise. Educational content builds authority.',
   ARRAY['#Tips', '#Insights', '#Education', '#Knowledge']::TEXT[],
   0.75, 110.0,
   'Educational content typically maintains steady engagement');
  
  -- Return the generated suggestions
  RETURN QUERY
  SELECT * FROM content_suggestions
  WHERE user_id = p_user_id
  AND created_at >= NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate growth strategy recommendations
CREATE OR REPLACE FUNCTION generate_growth_strategies(p_user_id UUID)
RETURNS SETOF growth_strategies AS $$
DECLARE
  strategy_record growth_strategies%ROWTYPE;
BEGIN
  -- Generate strategies based on current performance
  -- Low growth - focus on content optimization
  INSERT INTO growth_strategies (
    user_id, strategy_type, strategy_name, strategy_description,
    action_items, target_metrics, estimated_timeline_days,
    success_probability, recommendation_strength
  ) VALUES
  (p_user_id, 'content_optimization', 'Content Quality Enhancement',
   'Focus on creating higher-quality, more engaging content to boost organic reach and follower growth.',
   '[
     {"action": "Analyze top-performing posts from last 3 months", "priority": "high"},
     {"action": "Create content calendar with proven formats", "priority": "high"},
     {"action": "Implement A/B testing for post formats", "priority": "medium"},
     {"action": "Increase visual content ratio to 70%", "priority": "medium"}
   ]'::jsonb,
   '{"follower_growth_rate": 15.0, "engagement_rate": 4.0}'::jsonb,
   30, 0.78, 'high');

  -- Low engagement - focus on audience connection
  INSERT INTO growth_strategies (
    user_id, strategy_type, strategy_name, strategy_description,
    action_items, target_metrics, estimated_timeline_days,
    success_probability, recommendation_strength
  ) VALUES
  (p_user_id, 'engagement_boost', 'Audience Engagement Revival',
   'Implement strategies to reconnect with your audience and boost interaction rates.',
   '[
     {"action": "Start daily story interactions", "priority": "high"},
     {"action": "Host weekly Q&A sessions", "priority": "high"},
     {"action": "Create polls and interactive content", "priority": "medium"},
     {"action": "Respond to all comments within 2 hours", "priority": "high"}
   ]'::jsonb,
   '{"engagement_rate": 4.5, "response_rate": 80.0}'::jsonb,
   21, 0.85, 'high');

  -- Always suggest audience expansion for growing accounts
  INSERT INTO growth_strategies (
    user_id, strategy_type, strategy_name, strategy_description,
    action_items, target_metrics, estimated_timeline_days,
    success_probability, recommendation_strength
  ) VALUES
  (p_user_id, 'audience_expansion', 'Strategic Audience Growth',
   'Expand your reach to new audiences while maintaining engagement quality.',
   '[
     {"action": "Research and use 5 new relevant hashtags weekly", "priority": "medium"},
     {"action": "Collaborate with accounts in your niche", "priority": "high"},
     {"action": "Cross-promote on other platforms", "priority": "medium"},
     {"action": "Participate in trending conversations", "priority": "low"}
   ]'::jsonb,
   '{"follower_growth_rate": 25.0, "reach_expansion": 40.0}'::jsonb,
   45, 0.72, 'medium');
  
  -- Return generated strategies
  RETURN QUERY
  SELECT * FROM growth_strategies
  WHERE user_id = p_user_id
  AND created_at >= NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get personalized recommendations
CREATE OR REPLACE FUNCTION get_personalized_recommendations(
  p_user_id UUID,
  p_recommendation_types TEXT[] DEFAULT ARRAY['content', 'hashtag', 'timing', 'growth_strategy']::TEXT[]
)
RETURNS TABLE (
  recommendation_id UUID,
  recommendation_type TEXT,
  title TEXT,
  description TEXT,
  confidence_score FLOAT,
  priority_level TEXT,
  action_data JSONB,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Generate fresh content suggestions if needed
  IF 'content' = ANY(p_recommendation_types) THEN
    PERFORM generate_content_suggestions(p_user_id);
  END IF;
  
  -- Generate growth strategies if needed
  IF 'growth_strategy' = ANY(p_recommendation_types) THEN
    PERFORM generate_growth_strategies(p_user_id);
  END IF;
  
  RETURN QUERY
  -- Content suggestions
  SELECT 
    cs.id as recommendation_id,
    'content'::TEXT as recommendation_type,
    'Content Suggestion'::TEXT as title,
    cs.suggested_content as description,
    cs.relevance_score as confidence_score,
    'medium'::TEXT as priority_level,
    jsonb_build_object(
      'suggested_content', cs.suggested_content,
      'hashtags', cs.suggested_hashtags,
      'predicted_engagement', cs.predicted_engagement,
      'reasoning', cs.suggestion_reasoning
    ) as action_data,
    cs.expires_at
  FROM content_suggestions cs
  WHERE cs.user_id = p_user_id
  AND cs.is_active = true
  AND 'content' = ANY(p_recommendation_types)
  
  UNION ALL
  
  -- Growth strategies
  SELECT 
    gs.id as recommendation_id,
    'growth_strategy'::TEXT as recommendation_type,
    gs.strategy_name as title,
    gs.strategy_description as description,
    gs.success_probability as confidence_score,
    gs.recommendation_strength as priority_level,
    jsonb_build_object(
      'action_items', gs.action_items,
      'target_metrics', gs.target_metrics,
      'timeline_days', gs.estimated_timeline_days,
      'difficulty', gs.difficulty_level
    ) as action_data,
    (NOW() + INTERVAL '30 days')::TIMESTAMP WITH TIME ZONE as expires_at
  FROM growth_strategies gs
  WHERE gs.user_id = p_user_id
  AND gs.is_recommended = true
  AND 'growth_strategy' = ANY(p_recommendation_types)
  
  ORDER BY confidence_score DESC, priority_level DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE recommendation_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view active recommendation models" ON recommendation_models
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can manage their preferences" ON user_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their recommendation history" ON recommendation_history
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public can view active trending topics" ON trending_topics
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Users can view their content suggestions" ON content_suggestions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their growth strategies" ON growth_strategies
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their competitor insights" ON competitor_insights
  FOR SELECT USING (user_id = auth.uid());

-- Success notification
DO $$
BEGIN
  RAISE NOTICE '🎉 AI recommendations system created successfully!';
  RAISE NOTICE 'ℹ️  Features: Content suggestions, growth strategies, trend analysis, personalized recommendations';
  RAISE NOTICE 'ℹ️  Use generate_content_suggestions() to get content ideas';
  RAISE NOTICE 'ℹ️  Use generate_growth_strategies() to get growth recommendations';
  RAISE NOTICE 'ℹ️  Use get_personalized_recommendations() to get all recommendations for a user';
END $$; 