-- Create artist_profiles table
CREATE TABLE IF NOT EXISTS artist_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  bio TEXT,
  genres TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{"instagram": "", "twitter": "", "facebook": "", "youtube": "", "spotify": ""}'::jsonb,
  portfolio_url TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create artist_works table for portfolio items
CREATE TABLE IF NOT EXISTS artist_works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_type TEXT NOT NULL, -- 'image', 'video', 'audio', etc.
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create artist_events table for upcoming events
CREATE TABLE IF NOT EXISTS artist_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artist_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  location TEXT,
  ticket_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for artist_profiles
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artist profiles"
  ON artist_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own artist profile"
  ON artist_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own artist profile"
  ON artist_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for artist_works
ALTER TABLE artist_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artist works"
  ON artist_works FOR SELECT
  USING (true);

CREATE POLICY "Artists can update their own works"
  ON artist_works FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM artist_profiles
      WHERE artist_profiles.id = artist_works.artist_id
      AND artist_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Artists can insert their own works"
  ON artist_works FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artist_profiles
      WHERE artist_profiles.id = artist_works.artist_id
      AND artist_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Artists can delete their own works"
  ON artist_works FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM artist_profiles
      WHERE artist_profiles.id = artist_works.artist_id
      AND artist_profiles.user_id = auth.uid()
    )
  );

-- Create RLS policies for artist_events
ALTER TABLE artist_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artist events"
  ON artist_events FOR SELECT
  USING (true);

CREATE POLICY "Artists can update their own events"
  ON artist_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM artist_profiles
      WHERE artist_profiles.id = artist_events.artist_id
      AND artist_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Artists can insert their own events"
  ON artist_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artist_profiles
      WHERE artist_profiles.id = artist_events.artist_id
      AND artist_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Artists can delete their own events"
  ON artist_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM artist_profiles
      WHERE artist_profiles.id = artist_events.artist_id
      AND artist_profiles.user_id = auth.uid()
    )
  );

-- Add function to check if a user has an artist profile
CREATE OR REPLACE FUNCTION public.has_artist_profile(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM artist_profiles WHERE artist_profiles.user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 