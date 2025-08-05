-- Migration: Enhanced Achievements and Badges
-- Description: Add missing achievements and badges referenced in the achievement trigger service

-- =============================================
-- ADD MISSING ACHIEVEMENTS
-- =============================================

-- Add "First Steps" achievement for profile completion
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('First Steps', 'Complete your profile setup', 'milestone', 'onboarding', 'UserCheck', '#10b981', 15, 'common', '{"profile_completed": true}');

-- Add "First Job" achievement
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('First Job', 'Complete your first job or project', 'business', 'clients', 'Briefcase', '#10b981', 25, 'common', '{"jobs_completed": 1}');

-- Add "Event Attendee" achievement
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('Event Attendee', 'Attend your first event', 'community', 'participation', 'Calendar', '#10b981', 10, 'common', '{"events_attended": 1}');

-- Add "Endorsed" achievement
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('Endorsed', 'Receive your first skill endorsement', 'recognition', 'skills', 'ThumbsUp', '#10b981', 20, 'common', '{"endorsements_received": 1}');

-- Add "Endorser" achievement
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('Endorser', 'Give your first skill endorsement', 'community', 'support', 'Heart', '#10b981', 15, 'common', '{"endorsements_given": 1}');

-- Add "Responsive" achievement for high response rates
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('Responsive', 'Maintain a 95%+ response rate', 'business', 'communication', 'MessageSquare', '#f59e0b', 50, 'uncommon', '{"response_rate": 95}');

-- Add "Quality Performer" achievement for high ratings
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('Quality Performer', 'Maintain a 4.5+ average rating', 'recognition', 'quality', 'Star', '#f59e0b', 75, 'rare', '{"average_rating": 4.5, "minimum_reviews": 10}');

-- Add "Consistent" achievement for regular activity
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('Consistent', 'Be active on the platform for 30 consecutive days', 'milestone', 'activity', 'Calendar', '#8b5cf6', 100, 'rare', '{"consecutive_days": 30}');

-- Add "Networker" achievement for connections
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('Networker', 'Connect with 50+ other users', 'community', 'networking', 'Users', '#8b5cf6', 75, 'rare', '{"connections_made": 50}');

-- Add "Innovator" achievement for unique projects
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('Innovator', 'Complete a project in a new genre or style', 'creative', 'innovation', 'Zap', '#ef4444', 150, 'epic', '{"new_genre_project": true}');

-- Add "International" achievement for global reach
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('International', 'Work with clients from 5+ different countries', 'business', 'global', 'Globe', '#ef4444', 200, 'epic', '{"countries_worked": 5}');

-- Add "Legend" achievement for exceptional performance
INSERT INTO achievements (name, description, category, subcategory, icon, color, points, rarity, requirements) VALUES
('Legend', 'Achieve legendary status in the community', 'recognition', 'legendary', 'Crown', '#fbbf24', 500, 'legendary', '{"legendary_status": true}');

-- =============================================
-- ADD PROFILE COMPLETION BADGES
-- =============================================

-- Add profile completion badges for different user types
INSERT INTO badges (name, description, category, subcategory, icon, color, level, rarity, is_verification_badge, is_auto_granted, requirements) VALUES
('Artist Profile Complete', 'Completed artist profile setup', 'verification', 'profile', 'UserCheck', '#10b981', 1, 'common', false, true, '{"profile_type": "artist", "profile_completed": true}'),
('Venue Profile Complete', 'Completed venue profile setup', 'verification', 'profile', 'Building', '#3b82f6', 1, 'common', false, true, '{"profile_type": "venue", "profile_completed": true}'),
('Industry Profile Complete', 'Completed industry profile setup', 'verification', 'profile', 'Headphones', '#8b5cf6', 1, 'common', false, true, '{"profile_type": "industry", "profile_completed": true}'),
('Fan Profile Complete', 'Completed fan profile setup', 'verification', 'profile', 'Heart', '#ef4444', 1, 'common', false, true, '{"profile_type": "general", "profile_completed": true}');

-- Add additional expertise badges
INSERT INTO badges (name, description, category, subcategory, icon, color, level, rarity, is_verification_badge, requirements) VALUES
('Sound Designer', 'Expert in sound design and audio post-production', 'expertise', 'technical', 'Waveform', '#10b981', 1, 'rare', false, '{"skills": ["sound_design"], "projects_completed": 20}'),
('Mix Engineer', 'Professional mixing engineer', 'expertise', 'technical', 'Sliders', '#f59e0b', 1, 'rare', false, '{"skills": ["mixing"], "projects_completed": 30}'),
('Mastering Engineer', 'Expert mastering engineer', 'expertise', 'technical', 'Volume2', '#ef4444', 1, 'epic', false, '{"skills": ["mastering"], "projects_completed": 50}'),
('Live Engineer', 'Professional live sound engineer', 'expertise', 'technical', 'Radio', '#8b5cf6', 1, 'rare', false, '{"skills": ["live_sound"], "events_worked": 100}'),
('Studio Manager', 'Professional studio manager', 'expertise', 'business', 'Settings', '#06b6d4', 1, 'rare', false, '{"skills": ["studio_management"], "experience_years": 3}');

-- Add recognition badges for different achievements
INSERT INTO badges (name, description, category, subcategory, icon, color, level, rarity, is_verification_badge, requirements) VALUES
('Rising Star', 'Emerging talent in the industry', 'recognition', 'emerging', 'Star', '#f59e0b', 1, 'uncommon', false, '{"projects_completed": 5, "average_rating": 4.0}'),
('Established Professional', 'Established professional in the industry', 'recognition', 'professional', 'Award', '#8b5cf6', 1, 'rare', false, '{"projects_completed": 25, "average_rating": 4.5, "platform_years": 2}'),
('Industry Veteran', 'Long-time industry professional', 'recognition', 'veteran', 'Crown', '#ef4444', 1, 'epic', false, '{"projects_completed": 100, "platform_years": 5, "average_rating": 4.7}'),
('Community Leader', 'Active community leader and mentor', 'recognition', 'leadership', 'Users', '#10b981', 1, 'rare', false, '{"artists_mentored": 10, "community_contributions": 50}');

-- Add specialization badges
INSERT INTO badges (name, description, category, subcategory, icon, color, level, rarity, is_verification_badge, requirements) VALUES
('Rock Specialist', 'Specialized in rock music production', 'specialization', 'genre', 'Guitar', '#ef4444', 1, 'uncommon', false, '{"genre_specialization": "rock", "projects_completed": 10}'),
('Electronic Specialist', 'Specialized in electronic music production', 'specialization', 'genre', 'Zap', '#8b5cf6', 1, 'uncommon', false, '{"genre_specialization": "electronic", "projects_completed": 10}'),
('Jazz Specialist', 'Specialized in jazz music production', 'specialization', 'genre', 'Music', '#f59e0b', 1, 'uncommon', false, '{"genre_specialization": "jazz", "projects_completed": 10}'),
('Hip-Hop Specialist', 'Specialized in hip-hop music production', 'specialization', 'genre', 'Mic', '#10b981', 1, 'uncommon', false, '{"genre_specialization": "hip_hop", "projects_completed": 10}'),
('Classical Specialist', 'Specialized in classical music production', 'specialization', 'genre', 'Violin', '#06b6d4', 1, 'uncommon', false, '{"genre_specialization": "classical", "projects_completed": 10}');

-- Add partnership badges
INSERT INTO badges (name, description, category, subcategory, icon, color, level, rarity, is_verification_badge, requirements) VALUES
('Early Adopter', 'One of the first users on the platform', 'partnership', 'early', 'Zap', '#fbbf24', 1, 'rare', false, '{"platform_years": 1, "early_adopter": true}'),
('Beta Tester', 'Active beta tester and feedback provider', 'partnership', 'testing', 'Bug', '#8b5cf6', 1, 'rare', false, '{"beta_tester": true, "feedback_provided": 10}'),
('Platform Advocate', 'Active platform advocate and promoter', 'partnership', 'advocacy', 'Megaphone', '#10b981', 1, 'rare', false, '{"platform_advocacy": true, "referrals_made": 5}');

-- Add milestone badges for time-based achievements
INSERT INTO badges (name, description, category, subcategory, icon, color, level, rarity, is_verification_badge, requirements) VALUES
('First Month', 'Completed first month on platform', 'milestone', 'time', 'Calendar', '#6b7280', 1, 'common', false, '{"platform_months": 1}'),
('Six Months', 'Completed six months on platform', 'milestone', 'time', 'Clock', '#10b981', 1, 'uncommon', false, '{"platform_months": 6}'),
('Two Years', 'Completed two years on platform', 'milestone', 'time', 'Award', '#8b5cf6', 1, 'rare', false, '{"platform_years": 2}'),
('Decade', 'Completed ten years on platform', 'milestone', 'time', 'Crown', '#fbbf24', 1, 'legendary', false, '{"platform_years": 10}');

-- Add volume-based milestone badges
INSERT INTO badges (name, description, category, subcategory, icon, color, level, rarity, is_verification_badge, requirements) VALUES
('First Ten', 'Completed first 10 projects', 'milestone', 'volume', 'Target', '#10b981', 1, 'common', false, '{"projects_completed": 10}'),
('Fifty Projects', 'Completed 50 projects', 'milestone', 'volume', 'Target', '#f59e0b', 1, 'uncommon', false, '{"projects_completed": 50}'),
('Two Hundred', 'Completed 200 projects', 'milestone', 'volume', 'Target', '#8b5cf6', 1, 'rare', false, '{"projects_completed": 200}'),
('Thousand Club', 'Completed 1000+ projects', 'milestone', 'volume', 'Target', '#ef4444', 1, 'legendary', false, '{"projects_completed": 1000}');

-- =============================================
-- ADDITIONAL SKILL CATEGORIES
-- =============================================

-- Add more specific skill categories
INSERT INTO skill_categories (name, description, icon, color, display_order) VALUES
('Audio Engineering', 'Audio engineering and technical skills', 'Settings', '#3b82f6', 7),
('Music Production', 'Music production and composition', 'Music', '#8b5cf6', 8),
('Live Performance', 'Live performance and stage skills', 'Mic', '#ef4444', 9),
('Business Management', 'Business and project management', 'Briefcase', '#10b981', 10),
('Marketing', 'Marketing and promotion skills', 'Megaphone', '#f59e0b', 11),
('Equipment', 'Equipment and gear expertise', 'Tool', '#06b6d4', 12);

-- =============================================
-- UPDATE EXISTING ACHIEVEMENTS
-- =============================================

-- Update "Sold Out" achievement to have a more specific name
UPDATE achievements 
SET name = 'Sold Out Show', 
    description = 'Sell out a venue for a performance'
WHERE name = 'Sold Out';

-- Update "Festival Headliner" to be more specific
UPDATE achievements 
SET description = 'Headline a major festival with 1000+ attendees'
WHERE name = 'Festival Headliner';

-- =============================================
-- CREATE INDEXES FOR NEW CONTENT
-- =============================================

-- Create indexes for better performance on new achievements and badges
CREATE INDEX IF NOT EXISTS idx_achievements_subcategory ON achievements(subcategory, is_active);
CREATE INDEX IF NOT EXISTS idx_badges_subcategory ON badges(subcategory, is_active);
CREATE INDEX IF NOT EXISTS idx_badges_auto_granted ON badges(is_auto_granted, is_active);

-- =============================================
-- ADD TRIGGER FOR PROFILE COMPLETION BADGES
-- =============================================

-- Function to automatically grant profile completion badges
CREATE OR REPLACE FUNCTION auto_grant_profile_badges()
RETURNS TRIGGER AS $$
DECLARE
  profile_badge RECORD;
  profile_type TEXT;
BEGIN
  -- Determine profile type based on completed profile fields
  IF NEW.artist_profile_completed = true THEN
    profile_type := 'artist';
  ELSIF NEW.venue_profile_completed = true THEN
    profile_type := 'venue';
  ELSIF NEW.industry_profile_completed = true THEN
    profile_type := 'industry';
  ELSIF NEW.general_profile_completed = true THEN
    profile_type := 'general';
  ELSE
    RETURN NEW;
  END IF;

  -- Find the appropriate profile completion badge
  SELECT * INTO profile_badge 
  FROM badges 
  WHERE name = profile_type || ' Profile Complete' 
  AND is_auto_granted = true;

  -- Grant the badge if found and user doesn't already have it
  IF profile_badge IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_badges 
    WHERE user_id = NEW.id AND badge_id = profile_badge.id
  ) THEN
    INSERT INTO user_badges (
      user_id, 
      badge_id, 
      is_active, 
      granted_reason,
      granted_at
    ) VALUES (
      NEW.id,
      profile_badge.id,
      true,
      'Profile completion auto-granted',
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile completion badges
CREATE TRIGGER trigger_auto_grant_profile_badges
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_grant_profile_badges();

-- =============================================
-- ADD NOTIFICATION FUNCTION FOR ACHIEVEMENTS
-- =============================================

-- Function to create notifications when achievements are completed
CREATE OR REPLACE FUNCTION notify_achievement_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when achievement is newly completed
  IF NEW.is_completed = true AND (OLD.is_completed = false OR OLD.is_completed IS NULL) THEN
    -- Insert notification for achievement completion
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data,
      created_at
    ) VALUES (
      NEW.user_id,
      'achievement',
      'Achievement Unlocked!',
      'Congratulations! You''ve earned a new achievement.',
      jsonb_build_object(
        'achievement_id', NEW.achievement_id,
        'achievement_name', (SELECT name FROM achievements WHERE id = NEW.achievement_id),
        'points_earned', (SELECT points FROM achievements WHERE id = NEW.achievement_id)
      ),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for achievement notifications
CREATE TRIGGER trigger_notify_achievement_completion
  AFTER UPDATE ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION notify_achievement_completion();

-- =============================================
-- ADD NOTIFICATION FUNCTION FOR BADGES
-- =============================================

-- Function to create notifications when badges are granted
CREATE OR REPLACE FUNCTION notify_badge_granted()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when badge is newly granted
  IF NEW.is_active = true AND (OLD.is_active = false OR OLD.is_active IS NULL) THEN
    -- Insert notification for badge grant
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data,
      created_at
    ) VALUES (
      NEW.user_id,
      'badge',
      'Badge Earned!',
      'Congratulations! You''ve earned a new badge.',
      jsonb_build_object(
        'badge_id', NEW.badge_id,
        'badge_name', (SELECT name FROM badges WHERE id = NEW.badge_id),
        'badge_category', (SELECT category FROM badges WHERE id = NEW.badge_id)
      ),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for badge notifications
CREATE TRIGGER trigger_notify_badge_granted
  AFTER INSERT OR UPDATE ON user_badges
  FOR EACH ROW
  EXECUTE FUNCTION notify_badge_granted(); 