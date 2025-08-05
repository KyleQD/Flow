-- =====================================================
-- EPK Tables Migration
-- =====================================================
-- This migration adds tables for storing EPK settings and data
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- EPK Settings Table
-- =====================================================

CREATE TABLE IF NOT EXISTS artist_epk_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
  template TEXT DEFAULT 'modern' CHECK (template IN ('modern', 'classic', 'minimal', 'bold')),
  is_public BOOLEAN DEFAULT false,
  custom_domain TEXT,
  seo_title TEXT,
  seo_description TEXT,
  settings JSONB DEFAULT '{
    "branding": {
      "primary_color": "#8b5cf6",
      "secondary_color": "#1f2937",
      "font_family": "Inter"
    },
    "layout": {
      "hero_style": "cover",
      "navigation_style": "tabs",
      "show_stats": true
    },
    "privacy": {
      "show_contact": true,
      "show_booking_info": false,
      "require_password": false
    }
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- EPK Photos Table (extends artist_photos for EPK-specific use)
-- =====================================================

CREATE TABLE IF NOT EXISTS artist_epk_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  alt_text TEXT,
  is_hero BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EPK Press/Media Table
-- =====================================================

CREATE TABLE IF NOT EXISTS artist_epk_press (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  outlet TEXT,
  url TEXT,
  excerpt TEXT,
  publication_date DATE,
  article_type TEXT DEFAULT 'article' CHECK (article_type IN ('article', 'interview', 'review', 'feature', 'news')),
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EPK Custom Sections Table (for flexible content)
-- =====================================================

CREATE TABLE IF NOT EXISTS artist_epk_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_profile_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('text', 'gallery', 'video', 'audio', 'links', 'timeline')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'password')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Update existing artist_photos table if needed
-- =====================================================

-- Add EPK-specific columns to existing artist_photos table if they don't exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_photos' AND table_schema = 'public') THEN
    -- Add is_epk_featured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_photos' AND column_name = 'is_epk_featured') THEN
      ALTER TABLE artist_photos ADD COLUMN is_epk_featured BOOLEAN DEFAULT false;
    END IF;
    
    -- Add epk_caption column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_photos' AND column_name = 'epk_caption') THEN
      ALTER TABLE artist_photos ADD COLUMN epk_caption TEXT;
    END IF;
  END IF;
END $$;

-- =====================================================
-- Update existing artist_music table if needed
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_music' AND table_schema = 'public') THEN
    -- Add EPK-specific columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_music' AND column_name = 'is_epk_featured') THEN
      ALTER TABLE artist_music ADD COLUMN is_epk_featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_music' AND column_name = 'epk_description') THEN
      ALTER TABLE artist_music ADD COLUMN epk_description TEXT;
    END IF;
  END IF;
END $$;

-- =====================================================
-- Update existing artist_events table if needed
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'artist_events' AND table_schema = 'public') THEN
    -- Add EPK-specific columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_events' AND column_name = 'is_epk_featured') THEN
      ALTER TABLE artist_events ADD COLUMN is_epk_featured BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_events' AND column_name = 'poster_url') THEN
      ALTER TABLE artist_events ADD COLUMN poster_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artist_events' AND column_name = 'set_length') THEN
      ALTER TABLE artist_events ADD COLUMN set_length INTEGER;
    END IF;
  END IF;
END $$;

-- =====================================================
-- Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_epk_settings_user_id ON artist_epk_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_epk_settings_public ON artist_epk_settings(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_epk_photos_user_id ON artist_epk_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_epk_photos_featured ON artist_epk_photos(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_epk_photos_hero ON artist_epk_photos(is_hero) WHERE is_hero = true;

CREATE INDEX IF NOT EXISTS idx_epk_press_user_id ON artist_epk_press(user_id);
CREATE INDEX IF NOT EXISTS idx_epk_press_featured ON artist_epk_press(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_epk_press_date ON artist_epk_press(publication_date);

CREATE INDEX IF NOT EXISTS idx_epk_sections_user_id ON artist_epk_sections(user_id);
CREATE INDEX IF NOT EXISTS idx_epk_sections_enabled ON artist_epk_sections(is_enabled) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_epk_sections_order ON artist_epk_sections(sort_order);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- EPK Settings policies
ALTER TABLE artist_epk_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own EPK settings"
  ON artist_epk_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own EPK settings"
  ON artist_epk_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own EPK settings"
  ON artist_epk_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own EPK settings"
  ON artist_epk_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Public EPK settings can be viewed by anyone
CREATE POLICY "Public EPK settings are viewable by everyone"
  ON artist_epk_settings FOR SELECT
  USING (is_public = true);

-- EPK Photos policies
ALTER TABLE artist_epk_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own EPK photos"
  ON artist_epk_photos FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public EPK photos are viewable by everyone"
  ON artist_epk_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artist_epk_settings 
      WHERE artist_epk_settings.user_id = artist_epk_photos.user_id 
      AND artist_epk_settings.is_public = true
    )
  );

-- EPK Press policies
ALTER TABLE artist_epk_press ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own EPK press"
  ON artist_epk_press FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public EPK press is viewable by everyone"
  ON artist_epk_press FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM artist_epk_settings 
      WHERE artist_epk_settings.user_id = artist_epk_press.user_id 
      AND artist_epk_settings.is_public = true
    )
  );

-- EPK Sections policies
ALTER TABLE artist_epk_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own EPK sections"
  ON artist_epk_sections FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public EPK sections are viewable by everyone"
  ON artist_epk_sections FOR SELECT
  USING (
    visibility = 'public' AND
    EXISTS (
      SELECT 1 FROM artist_epk_settings 
      WHERE artist_epk_settings.user_id = artist_epk_sections.user_id 
      AND artist_epk_settings.is_public = true
    )
  );

-- =====================================================
-- Trigger for updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_artist_epk_settings_updated_at
  BEFORE UPDATE ON artist_epk_settings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_artist_epk_photos_updated_at
  BEFORE UPDATE ON artist_epk_photos
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_artist_epk_press_updated_at
  BEFORE UPDATE ON artist_epk_press
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_artist_epk_sections_updated_at
  BEFORE UPDATE ON artist_epk_sections
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column(); 