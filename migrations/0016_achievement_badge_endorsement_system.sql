-- Migration: Achievement, Badge, and Endorsement System
-- Description: Comprehensive system for tracking user accomplishments, achievements, and peer endorsements

-- =============================================
-- ACHIEVEMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'music', 'performance', 'collaboration', 'business', 'community', 
    'technical', 'creative', 'leadership', 'innovation', 'milestone'
  )),
  subcategory TEXT,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#10b981',
  bg_color TEXT DEFAULT '#f0fdf4',
  border_color TEXT DEFAULT '#22c55e',
  
  -- Achievement Requirements
  requirements JSONB NOT NULL DEFAULT '{}',
  points INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  
  -- Display Settings
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER ACHIEVEMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  
  -- Achievement Progress
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Progress Tracking
  current_value INTEGER DEFAULT 0,
  target_value INTEGER NOT NULL,
  progress_data JSONB DEFAULT '{}',
  
  -- Context
  related_project_id UUID,
  related_event_id UUID,
  related_collaboration_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- BADGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'verification', 'expertise', 'specialization', 'recognition', 'partnership',
    'certification', 'award', 'milestone', 'community', 'custom'
  )),
  subcategory TEXT,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  bg_color TEXT DEFAULT '#faf5ff',
  border_color TEXT DEFAULT '#a855f7',
  
  -- Badge Properties
  level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  is_verification_badge BOOLEAN DEFAULT false,
  is_auto_granted BOOLEAN DEFAULT false,
  
  -- Requirements
  requirements JSONB DEFAULT '{}',
  auto_grant_conditions JSONB DEFAULT '{}',
  
  -- Display Settings
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER BADGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  
  -- Badge Status
  is_active BOOLEAN DEFAULT true,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  
  -- Granting Context
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_reason TEXT,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revocation_reason TEXT,
  
  -- Context
  related_project_id UUID,
  related_event_id UUID,
  related_collaboration_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);

-- =============================================
-- ENDORSEMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS endorsements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endorser_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endorsee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Endorsement Details
  skill TEXT NOT NULL,
  category TEXT CHECK (category IN (
    'technical', 'creative', 'business', 'interpersonal', 'leadership', 'specialized'
  )),
  level INTEGER CHECK (level BETWEEN 1 AND 5),
  comment TEXT,
  
  -- Context
  project_id UUID,
  collaboration_id UUID,
  event_id UUID,
  job_id UUID,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate endorsements for same skill from same person
  UNIQUE(endorser_id, endorsee_id, skill)
);

-- =============================================
-- SKILL CATEGORIES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS skill_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#6b7280',
  parent_category_id UUID REFERENCES skill_categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER SKILLS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  category_id UUID REFERENCES skill_categories(id) ON DELETE SET NULL,
  
  -- Skill Level
  self_assessed_level INTEGER CHECK (self_assessed_level BETWEEN 1 AND 5),
  endorsed_level INTEGER DEFAULT 0,
  total_endorsements INTEGER DEFAULT 0,
  
  -- Skill Details
  description TEXT,
  years_experience INTEGER,
  is_primary_skill BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, skill_name)
);

-- =============================================
-- ACHIEVEMENT PROGRESS TRACKING
-- =============================================

CREATE TABLE IF NOT EXISTS achievement_progress_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  
  -- Event Details
  event_type TEXT NOT NULL,
  event_value INTEGER DEFAULT 1,
  event_data JSONB DEFAULT '{}',
  
  -- Context
  related_project_id UUID,
  related_event_id UUID,
  related_collaboration_id UUID,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Achievements
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category, is_active);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievements(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_events_user ON achievement_progress_events(user_id, achievement_id);

-- Badges
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category, is_active);
CREATE INDEX IF NOT EXISTS idx_badges_verification ON badges(is_verification_badge);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_active ON user_badges(user_id, is_active);

-- Endorsements
CREATE INDEX IF NOT EXISTS idx_endorsements_endorsee ON endorsements(endorsee_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_endorser ON endorsements(endorser_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_skill ON endorsements(skill);
CREATE INDEX IF NOT EXISTS idx_endorsements_active ON endorsements(endorsee_id, is_active);

-- Skills
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_category ON user_skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skill_categories_parent ON skill_categories(parent_category_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress_events ENABLE ROW LEVEL SECURITY;

-- Achievements policies (read-only for all users)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- Badges policies (read-only for all users)
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "Users can view their own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public badges" ON user_badges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = user_badges.user_id 
      AND profiles.profile_visibility = 'public'
    )
  );

-- Endorsements policies
CREATE POLICY "Users can view endorsements they gave or received" ON endorsements
  FOR SELECT USING (auth.uid() = endorser_id OR auth.uid() = endorsee_id);

CREATE POLICY "Users can view public endorsements" ON endorsements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = endorsements.endorsee_id 
      AND profiles.profile_visibility = 'public'
    )
  );

CREATE POLICY "Users can create endorsements" ON endorsements
  FOR INSERT WITH CHECK (auth.uid() = endorser_id);

CREATE POLICY "Users can update their own endorsements" ON endorsements
  FOR UPDATE USING (auth.uid() = endorser_id);

-- Skill categories policies (read-only for all users)
CREATE POLICY "Anyone can view skill categories" ON skill_categories
  FOR SELECT USING (true);

-- User skills policies
CREATE POLICY "Users can view their own skills" ON user_skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public skills" ON user_skills
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = user_skills.user_id 
      AND profiles.profile_visibility = 'public'
    )
  );

CREATE POLICY "Users can manage their own skills" ON user_skills
  FOR ALL USING (auth.uid() = user_id);

-- Achievement progress events policies
CREATE POLICY "Users can view their own progress events" ON achievement_progress_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create progress events" ON achievement_progress_events
  FOR INSERT WITH CHECK (true);

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Insert default skill categories
INSERT INTO skill_categories (name, description, icon, color, display_order) VALUES
('Technical', 'Technical skills and expertise', 'Code', '#3b82f6', 1),
('Creative', 'Creative and artistic skills', 'Palette', '#8b5cf6', 2),
('Business', 'Business and management skills', 'Briefcase', '#10b981', 3),
('Interpersonal', 'Communication and people skills', 'Users', '#f59e0b', 4),
('Leadership', 'Leadership and team management', 'Award', '#ef4444', 5),
('Specialized', 'Specialized industry skills', 'Star', '#06b6d4', 6);

-- Insert default achievements
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
-- Music Achievements
('First Track', 'Upload your first track', 'music', 'production', 'Music', '#10b981', 10, 'common', '{"tracks_uploaded": 1}'),
('Hit Maker', 'Reach 10,000 streams on a single track', 'music', 'success', 'TrendingUp', '#f59e0b', 50, 'uncommon', '{"track_streams": 10000}'),
('Album Artist', 'Release a full album', 'music', 'production', 'Disc3', '#8b5cf6', 100, 'rare', '{"albums_released": 1}'),
('Viral Sensation', 'Reach 1 million streams', 'music', 'success', 'Zap', '#ef4444', 200, 'epic', '{"total_streams": 1000000}'),

-- Performance Achievements
('First Gig', 'Complete your first live performance', 'performance', 'live', 'Mic', '#10b981', 20, 'common', '{"performances_completed": 1}'),
('Festival Headliner', 'Headline a major festival', 'performance', 'live', 'Star', '#f59e0b', 150, 'epic', '{"festival_headlines": 1}'),
('Sold Out', 'Sell out a venue', 'performance', 'success', 'Ticket', '#8b5cf6', 75, 'rare', '{"sold_out_shows": 1}'),

-- Collaboration Achievements
('Team Player', 'Complete your first collaboration', 'collaboration', 'teamwork', 'Users', '#10b981', 25, 'common', '{"collaborations_completed": 1}'),
('Collaboration Master', 'Complete 10 collaborations', 'collaboration', 'teamwork', 'Handshake', '#f59e0b', 100, 'rare', '{"collaborations_completed": 10}'),
('Cross-Genre Pioneer', 'Collaborate across 5 different genres', 'collaboration', 'innovation', 'Globe', '#8b5cf6', 150, 'epic', '{"genres_collaborated": 5}'),

-- Business Achievements
('First Client', 'Get your first paying client', 'business', 'clients', 'DollarSign', '#10b981', 30, 'common', '{"paying_clients": 1}'),
('Business Owner', 'Earn $10,000 from your music', 'business', 'revenue', 'TrendingUp', '#f59e0b', 100, 'rare', '{"total_earnings": 10000}'),
('Industry Leader', 'Be featured in major media', 'business', 'recognition', 'Award', '#ef4444', 200, 'epic', '{"media_features": 1}'),

-- Community Achievements
('Helper', 'Help 10 other artists', 'community', 'support', 'Heart', '#10b981', 50, 'common', '{"artists_helped": 10}'),
('Mentor', 'Mentor 5 emerging artists', 'community', 'leadership', 'GraduationCap', '#f59e0b', 150, 'rare', '{"artists_mentored": 5}'),
('Community Champion', 'Build a community of 1,000 followers', 'community', 'growth', 'Users', '#8b5cf6', 200, 'epic', '{"community_size": 1000}');

-- Insert default badges
INSERT INTO badges (name, description, category, subcategory, icon, color, level, rarity, is_verification_badge, requirements) VALUES
-- Verification Badges
('Verified Artist', 'Official verification badge for artists', 'verification', 'artist', 'CheckCircle', '#10b981', 1, 'rare', true, '{"verification_status": "verified"}'),
('Verified Venue', 'Official verification badge for venues', 'verification', 'venue', 'Building', '#3b82f6', 1, 'rare', true, '{"verification_status": "verified"}'),
('Business Verified', 'Verified business account', 'verification', 'business', 'Shield', '#8b5cf6', 1, 'rare', true, '{"verification_status": "verified"}'),

-- Expertise Badges
('Audio Engineer', 'Certified audio engineering skills', 'expertise', 'technical', 'Settings', '#10b981', 1, 'uncommon', false, '{"skills": ["audio_engineering"], "experience_years": 2}'),
('Producer', 'Professional music producer', 'expertise', 'creative', 'Music', '#f59e0b', 1, 'uncommon', false, '{"skills": ["music_production"], "projects_completed": 10}'),
('Live Sound Expert', 'Expert in live sound engineering', 'expertise', 'technical', 'Volume2', '#ef4444', 1, 'rare', false, '{"skills": ["live_sound"], "events_worked": 50}'),

-- Recognition Badges
('Top Performer', 'Consistently high-rated performer', 'recognition', 'quality', 'Star', '#f59e0b', 1, 'rare', false, '{"average_rating": 4.5, "minimum_reviews": 20}'),
('Client Favorite', 'Highly recommended by clients', 'recognition', 'reputation', 'Heart', '#ef4444', 1, 'rare', false, '{"client_satisfaction": 95, "minimum_clients": 10}'),
('Industry Expert', 'Recognized industry expert', 'recognition', 'authority', 'Award', '#8b5cf6', 1, 'epic', false, '{"industry_recognition": true}'),

-- Partnership Badges
('Official Partner', 'Official platform partner', 'partnership', 'platform', 'Handshake', '#10b981', 1, 'rare', false, '{"partnership_status": "official"}'),
('Premium Partner', 'Premium tier partner', 'partnership', 'platform', 'Crown', '#f59e0b', 1, 'epic', false, '{"partnership_tier": "premium"}'),

-- Milestone Badges
('First Year', 'Completed first year on platform', 'milestone', 'time', 'Calendar', '#6b7280', 1, 'common', false, '{"platform_years": 1}'),
('Veteran', '5+ years on platform', 'milestone', 'time', 'Clock', '#8b5cf6', 1, 'rare', false, '{"platform_years": 5}'),
('Century Club', '100+ projects completed', 'milestone', 'volume', 'Target', '#ef4444', 1, 'epic', false, '{"projects_completed": 100}');

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Function to update user skill endorsement levels
CREATE OR REPLACE FUNCTION update_user_skill_endorsements()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the endorsed level and total endorsements for the skill
  UPDATE user_skills 
  SET 
    endorsed_level = (
      SELECT COALESCE(AVG(level), 0)
      FROM endorsements 
      WHERE endorsee_id = NEW.endorsee_id 
      AND skill = NEW.skill 
      AND is_active = true
    ),
    total_endorsements = (
      SELECT COUNT(*)
      FROM endorsements 
      WHERE endorsee_id = NEW.endorsee_id 
      AND skill = NEW.skill 
      AND is_active = true
    ),
    updated_at = NOW()
  WHERE user_id = NEW.endorsee_id AND skill_name = NEW.skill;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update skill endorsements when endorsements change
CREATE TRIGGER trigger_update_skill_endorsements
  AFTER INSERT OR UPDATE OR DELETE ON endorsements
  FOR EACH ROW
  EXECUTE FUNCTION update_user_skill_endorsements();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  achievement_record RECORD;
  user_achievement_record RECORD;
  progress_value INTEGER;
BEGIN
  -- Loop through all active achievements
  FOR achievement_record IN 
    SELECT * FROM achievements WHERE is_active = true
  LOOP
    -- Check if user already has this achievement
    SELECT * INTO user_achievement_record 
    FROM user_achievements 
    WHERE user_id = NEW.user_id AND achievement_id = achievement_record.id;
    
    -- If user doesn't have this achievement, check if they qualify
    IF user_achievement_record IS NULL THEN
      -- Calculate progress based on achievement requirements
      -- This is a simplified version - you'd need to implement specific logic for each achievement type
      progress_value = 0;
      
      -- Insert user achievement record
      INSERT INTO user_achievements (
        user_id, 
        achievement_id, 
        progress_percentage, 
        target_value,
        current_value
      ) VALUES (
        NEW.user_id,
        achievement_record.id,
        progress_value,
        100,
        progress_value
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check achievements when progress events are added
CREATE TRIGGER trigger_check_achievements
  AFTER INSERT ON achievement_progress_events
  FOR EACH ROW
  EXECUTE FUNCTION check_achievements(); 