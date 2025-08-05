-- =============================================================================
-- ENHANCE VENUE PROFILES TABLE FOR COMPREHENSIVE SETTINGS
-- Migration: 20250120300000_enhance_venue_profiles_comprehensive.sql
-- =============================================================================

-- Add comprehensive venue profile fields to support new settings
DO $$ 
BEGIN
  -- Basic venue information enhancements
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'tagline') THEN
    ALTER TABLE venue_profiles ADD COLUMN tagline TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'neighborhood') THEN
    ALTER TABLE venue_profiles ADD COLUMN neighborhood TEXT;
  END IF;
  
  -- Location and coordinates
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'coordinates') THEN
    ALTER TABLE venue_profiles ADD COLUMN coordinates JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  -- Enhanced capacity information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'capacity_standing') THEN
    ALTER TABLE venue_profiles ADD COLUMN capacity_standing INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'capacity_seated') THEN
    ALTER TABLE venue_profiles ADD COLUMN capacity_seated INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'capacity_total') THEN
    ALTER TABLE venue_profiles ADD COLUMN capacity_total INTEGER;
  END IF;
  
  -- Age restrictions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'age_restrictions') THEN
    ALTER TABLE venue_profiles ADD COLUMN age_restrictions TEXT;
  END IF;
  
  -- Operating hours
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'operating_hours') THEN
    ALTER TABLE venue_profiles ADD COLUMN operating_hours JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  -- Public URL slug for sharing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'url_slug') THEN
    ALTER TABLE venue_profiles ADD COLUMN url_slug TEXT UNIQUE;
  END IF;
  
  -- Avatar and cover images
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE venue_profiles ADD COLUMN avatar_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'cover_image_url') THEN
    ALTER TABLE venue_profiles ADD COLUMN cover_image_url TEXT;
  END IF;
  
  -- SEO and discoverability
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'meta_description') THEN
    ALTER TABLE venue_profiles ADD COLUMN meta_description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'keywords') THEN
    ALTER TABLE venue_profiles ADD COLUMN keywords TEXT[] DEFAULT '{}';
  END IF;
  
  -- Public profile visibility
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'is_public') THEN
    ALTER TABLE venue_profiles ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;
  
  -- Profile completion percentage
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venue_profiles' AND column_name = 'profile_completion') THEN
    ALTER TABLE venue_profiles ADD COLUMN profile_completion INTEGER DEFAULT 0;
  END IF;

END $$;

-- Update social_links to support extended platforms
UPDATE venue_profiles 
SET social_links = social_links || '{
  "tiktok": null,
  "youtube": null, 
  "linkedin": null
}'::jsonb
WHERE social_links IS NOT NULL AND NOT (social_links ? 'tiktok');

-- Enhance settings structure with new comprehensive options
UPDATE venue_profiles 
SET settings = settings || '{
  "booking": {
    "accept_bookings": true,
    "min_advance_booking": "2_weeks",
    "max_advance_booking": "1_year", 
    "auto_approve_bookings": false,
    "require_deposit": false,
    "deposit_percentage": null,
    "cancellation_policy": "",
    "house_rules": "",
    "age_restriction": "all_ages"
  },
  "amenities": {
    "sound_system": false,
    "lighting_system": false,
    "stage": false,
    "recording_capabilities": false,
    "live_streaming": false,
    "projection_screen": false,
    "dj_booth": false,
    "green_room": false,
    "dressing_rooms": false,
    "storage_space": false,
    "load_in_dock": false,
    "merchandise_space": false,
    "office_space": false,
    "bar_service": false,
    "food_service": false,
    "catering_kitchen": false,
    "security": false,
    "coat_check": false,
    "valet_parking": false,
    "event_planning": false,
    "photography_services": false,
    "accessible": false,
    "elevator": false,
    "air_conditioning": false,
    "heating": false,
    "outdoor_space": false,
    "smoking_area": false,
    "parking": false,
    "parking_spaces": null,
    "valet_available": false,
    "public_transport_nearby": false,
    "uber_dropoff": false,
    "wifi": false,
    "high_speed_internet": false,
    "power_outlets": false,
    "charging_stations": false
  },
  "technical_specs": {
    "stage_dimensions": {
      "length": null,
      "width": null,
      "height": null
    },
    "sound_system_details": "",
    "lighting_details": "",
    "power_specifications": "",
    "internet_speed": "",
    "load_in_details": "",
    "acoustic_treatment": "",
    "ceiling_height": null,
    "noise_restrictions": ""
  },
  "operational": {
    "setup_time_required": "",
    "breakdown_time_required": "",
    "staff_provided": false,
    "security_required": false,
    "insurance_required": false,
    "permits_required": false,
    "union_venue": false,
    "preferred_vendors": "",
    "house_rules": "",
    "noise_curfew": "",
    "alcohol_policy": ""
  },
  "payment": {
    "base_rental_rate": "",
    "hourly_rate": "",
    "security_deposit": "",
    "accepted_payment_methods": [],
    "payment_terms": "50_50",
    "late_fee_percentage": null,
    "currency": "USD"
  }
}'::jsonb
WHERE settings IS NOT NULL;

-- Create function to generate unique URL slug
CREATE OR REPLACE FUNCTION generate_venue_slug(venue_name TEXT, venue_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from venue name
  base_slug := lower(regexp_replace(venue_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'venue-' || substring(venue_id::text from 1 for 8);
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM venue_profiles WHERE url_slug = final_slug AND id != venue_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update existing venues with URL slugs
UPDATE venue_profiles 
SET url_slug = generate_venue_slug(venue_name, id)
WHERE url_slug IS NULL;

-- Create function to calculate profile completion
CREATE OR REPLACE FUNCTION calculate_venue_profile_completion(venue_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion_score INTEGER := 0;
  venue_record RECORD;
BEGIN
  SELECT * INTO venue_record FROM venue_profiles WHERE id = venue_id;
  
  IF venue_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Basic information (30 points)
  IF venue_record.venue_name IS NOT NULL AND length(venue_record.venue_name) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF venue_record.description IS NOT NULL AND length(venue_record.description) > 50 THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF venue_record.tagline IS NOT NULL AND length(venue_record.tagline) > 0 THEN
    completion_score := completion_score + 3;
  END IF;
  
  IF venue_record.venue_types IS NOT NULL AND array_length(venue_record.venue_types, 1) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF venue_record.address IS NOT NULL AND length(venue_record.address) > 0 THEN
    completion_score := completion_score + 4;
  END IF;
  
  IF venue_record.capacity_total IS NOT NULL AND venue_record.capacity_total > 0 THEN
    completion_score := completion_score + 3;
  END IF;
  
  IF venue_record.age_restrictions IS NOT NULL THEN
    completion_score := completion_score + 2;
  END IF;
  
  IF venue_record.avatar_url IS NOT NULL THEN
    completion_score := completion_score + 3;
  END IF;
  
  -- Contact information (20 points)
  IF venue_record.contact_info->>'phone' IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF venue_record.contact_info->>'email' IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF venue_record.social_links->>'website' IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF venue_record.social_links->>'instagram' IS NOT NULL OR 
     venue_record.social_links->>'facebook' IS NOT NULL OR 
     venue_record.social_links->>'twitter' IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  -- Settings and policies (30 points)
  IF venue_record.settings->'booking' IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF venue_record.settings->'amenities' IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF venue_record.settings->'payment' IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Additional details (20 points)
  IF venue_record.operating_hours IS NOT NULL AND venue_record.operating_hours != '{}'::jsonb THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF venue_record.cover_image_url IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF venue_record.meta_description IS NOT NULL AND length(venue_record.meta_description) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF venue_record.keywords IS NOT NULL AND array_length(venue_record.keywords, 1) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  
  RETURN completion_score;
END;
$$ LANGUAGE plpgsql;

-- Update profile completion for existing venues
UPDATE venue_profiles 
SET profile_completion = calculate_venue_profile_completion(id);

-- Create trigger to auto-update profile completion
CREATE OR REPLACE FUNCTION update_venue_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion := calculate_venue_profile_completion(NEW.id);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_venue_profile_completion
  BEFORE UPDATE ON venue_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_venue_profile_completion();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_venue_profiles_url_slug ON venue_profiles(url_slug);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_is_public ON venue_profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_venue_types ON venue_profiles USING GIN(venue_types);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_keywords ON venue_profiles USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_profile_completion ON venue_profiles(profile_completion);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_city ON venue_profiles(city);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_state ON venue_profiles(state);

-- Create composite indexes for search
CREATE INDEX IF NOT EXISTS idx_venue_profiles_search ON venue_profiles(venue_name, city, state, is_public);
CREATE INDEX IF NOT EXISTS idx_venue_profiles_capacity_search ON venue_profiles(capacity_total, is_public);

-- Add RLS policies for venue profiles
ALTER TABLE venue_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for public profiles to be viewable by everyone
CREATE POLICY "Public venue profiles are viewable by everyone" ON venue_profiles
FOR SELECT USING (is_public = true);

-- Policy for venue owners to manage their own profiles
CREATE POLICY "Venue owners can manage their own profiles" ON venue_profiles
FOR ALL USING (auth.uid() = user_id);

-- Policy for authenticated users to view all profiles (for admin/search purposes)
CREATE POLICY "Authenticated users can view venue profiles" ON venue_profiles
FOR SELECT TO authenticated USING (true);

-- Create venue profile analytics tracking
CREATE TABLE IF NOT EXISTS venue_profile_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venue_profiles(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_ip INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venue_profile_views_venue_id ON venue_profile_views(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_profile_views_viewed_at ON venue_profile_views(viewed_at);

-- Create function to track profile views
CREATE OR REPLACE FUNCTION track_venue_profile_view(
  venue_id UUID,
  viewer_id UUID DEFAULT NULL,
  viewer_ip INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  referrer TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO venue_profile_views (venue_id, viewer_id, viewer_ip, user_agent, referrer)
  VALUES (venue_id, viewer_id, viewer_ip, user_agent, referrer);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create venue search function
CREATE OR REPLACE FUNCTION search_venues(
  search_query TEXT DEFAULT NULL,
  venue_type TEXT DEFAULT NULL,
  city_filter TEXT DEFAULT NULL,
  state_filter TEXT DEFAULT NULL,
  min_capacity INTEGER DEFAULT NULL,
  max_capacity INTEGER DEFAULT NULL,
  amenities_filter TEXT[] DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  venue_name TEXT,
  tagline TEXT,
  description TEXT,
  city TEXT,
  state TEXT,
  capacity_total INTEGER,
  venue_types TEXT[],
  avatar_url TEXT,
  url_slug TEXT,
  profile_completion INTEGER,
  average_rating DECIMAL,
  total_reviews INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vp.id,
    vp.venue_name,
    vp.tagline,
    vp.description,
    vp.city,
    vp.state,
    vp.capacity_total,
    vp.venue_types,
    vp.avatar_url,
    vp.url_slug,
    vp.profile_completion,
    COALESCE(AVG(vr.rating), 0)::DECIMAL as average_rating,
    COUNT(vr.id)::INTEGER as total_reviews
  FROM venue_profiles vp
  LEFT JOIN venue_reviews vr ON vp.id = vr.venue_id
  WHERE 
    vp.is_public = true
    AND (search_query IS NULL OR 
         vp.venue_name ILIKE '%' || search_query || '%' OR
         vp.description ILIKE '%' || search_query || '%' OR
         vp.city ILIKE '%' || search_query || '%')
    AND (venue_type IS NULL OR venue_type = ANY(vp.venue_types))
    AND (city_filter IS NULL OR vp.city ILIKE '%' || city_filter || '%')
    AND (state_filter IS NULL OR vp.state ILIKE '%' || state_filter || '%')
    AND (min_capacity IS NULL OR vp.capacity_total >= min_capacity)
    AND (max_capacity IS NULL OR vp.capacity_total <= max_capacity)
    AND (amenities_filter IS NULL OR 
         (vp.settings->'amenities'->>'sound_system')::boolean = true AND 'sound_system' = ANY(amenities_filter) OR
         (vp.settings->'amenities'->>'lighting_system')::boolean = true AND 'lighting_system' = ANY(amenities_filter) OR
         (vp.settings->'amenities'->>'stage')::boolean = true AND 'stage' = ANY(amenities_filter) OR
         (vp.settings->'amenities'->>'parking')::boolean = true AND 'parking' = ANY(amenities_filter) OR
         (vp.settings->'amenities'->>'wifi')::boolean = true AND 'wifi' = ANY(amenities_filter) OR
         (vp.settings->'amenities'->>'accessible')::boolean = true AND 'accessible' = ANY(amenities_filter))
  GROUP BY vp.id, vp.venue_name, vp.tagline, vp.description, vp.city, vp.state, 
           vp.capacity_total, vp.venue_types, vp.avatar_url, vp.url_slug, vp.profile_completion
  ORDER BY vp.profile_completion DESC, average_rating DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 