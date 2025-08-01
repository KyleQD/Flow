-- Create Real Blog Accounts Script
-- This script creates real accounts that can be interacted with
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- STEP 0: Fix the stage_name error in refresh_account_display_info function
-- =============================================================================

-- Drop the problematic function first
DROP FUNCTION IF EXISTS refresh_account_display_info(UUID);

-- Recreate the function with dynamic column checking
CREATE OR REPLACE FUNCTION refresh_account_display_info(account_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  account_record RECORD;
  new_display_name TEXT;
  new_username TEXT;
  new_avatar_url TEXT;
  new_is_verified BOOLEAN;
  has_profile_image_url BOOLEAN;
  has_is_verified BOOLEAN;
BEGIN
  -- Get account record
  SELECT * INTO account_record FROM accounts WHERE id = account_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Refresh from source table based on account type
  CASE account_record.profile_table
    WHEN 'artist_profiles' THEN
      -- Check if columns exist dynamically
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artist_profiles' AND column_name = 'profile_image_url'
      ) INTO has_profile_image_url;
      
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artist_profiles' AND column_name = 'is_verified'
      ) INTO has_is_verified;
      
      -- Use dynamic query based on column existence
      IF has_profile_image_url AND has_is_verified THEN
        SELECT 
          COALESCE(artist_name, 'Artist'),
          LOWER(REGEXP_REPLACE(COALESCE(artist_name, 'artist'), '[^a-zA-Z0-9]', '', 'g')),
          profile_image_url,
          COALESCE(is_verified, false)
        INTO new_display_name, new_username, new_avatar_url, new_is_verified
        FROM artist_profiles 
        WHERE id = account_record.profile_id;
      ELSIF has_profile_image_url THEN
        SELECT 
          COALESCE(artist_name, 'Artist'),
          LOWER(REGEXP_REPLACE(COALESCE(artist_name, 'artist'), '[^a-zA-Z0-9]', '', 'g')),
          profile_image_url,
          false
        INTO new_display_name, new_username, new_avatar_url, new_is_verified
        FROM artist_profiles 
        WHERE id = account_record.profile_id;
      ELSIF has_is_verified THEN
        SELECT 
          COALESCE(artist_name, 'Artist'),
          LOWER(REGEXP_REPLACE(COALESCE(artist_name, 'artist'), '[^a-zA-Z0-9]', '', 'g')),
          NULL,
          COALESCE(is_verified, false)
        INTO new_display_name, new_username, new_avatar_url, new_is_verified
        FROM artist_profiles 
        WHERE id = account_record.profile_id;
      ELSE
        SELECT 
          COALESCE(artist_name, 'Artist'),
          LOWER(REGEXP_REPLACE(COALESCE(artist_name, 'artist'), '[^a-zA-Z0-9]', '', 'g')),
          NULL,
          false
        INTO new_display_name, new_username, new_avatar_url, new_is_verified
        FROM artist_profiles 
        WHERE id = account_record.profile_id;
      END IF;
      
    WHEN 'venue_profiles' THEN
      SELECT 
        COALESCE(name, 'Venue'),
        LOWER(REGEXP_REPLACE(COALESCE(name, 'venue'), '[^a-zA-Z0-9]', '', 'g')),
        logo_url,
        COALESCE(is_verified, false)
      INTO new_display_name, new_username, new_avatar_url, new_is_verified
      FROM venue_profiles 
      WHERE id = account_record.profile_id;
      
    WHEN 'business_profiles' THEN
      SELECT 
        COALESCE(name, 'Business'),
        LOWER(REGEXP_REPLACE(COALESCE(name, 'business'), '[^a-zA-Z0-9]', '', 'g')),
        logo_url,
        COALESCE(is_verified, false)
      INTO new_display_name, new_username, new_avatar_url, new_is_verified
      FROM business_profiles 
      WHERE id = account_record.profile_id;
      
    WHEN 'profiles' THEN
      SELECT 
        COALESCE(full_name, 'User'),
        COALESCE(username, LOWER(REGEXP_REPLACE(COALESCE(full_name, 'user'), '[^a-zA-Z0-9]', '', 'g'))),
        avatar_url,
        COALESCE(is_verified, false)
      INTO new_display_name, new_username, new_avatar_url, new_is_verified
      FROM profiles 
      WHERE id = account_record.profile_id;
      
    ELSE
      -- Unknown profile table, keep existing values
      RETURN FALSE;
  END CASE;
  
  -- Update account with refreshed info
  UPDATE accounts SET
    display_name = COALESCE(new_display_name, display_name),
    username = COALESCE(new_username, username),
    avatar_url = new_avatar_url,
    is_verified = COALESCE(new_is_verified, is_verified),
    updated_at = NOW()
  WHERE id = account_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Fixed refresh_account_display_info function - now uses artist_name instead of stage_name';
END $$;

-- =============================================================================
-- STEP 1: Create real user accounts using Supabase Auth
-- =============================================================================

-- Create Sarah Johnson's account
DO $$
BEGIN
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sarah.johnson@example.com') THEN
    -- Insert user into auth.users
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440001',
      'sarah.johnson@example.com',
      crypt('password123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"full_name": "Sarah Johnson", "username": "sarahjohnson", "bio": "Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape.", "location": "Los Angeles, CA"}'
    );
    RAISE NOTICE '✅ Created real user account for Sarah Johnson';
  ELSE
    RAISE NOTICE 'ℹ️  Sarah Johnson user account already exists';
  END IF;
END $$;

-- =============================================================================
-- STEP 2: Create profile for Sarah Johnson
-- =============================================================================

-- Insert profile for Sarah Johnson (using id instead of user_id)
INSERT INTO profiles (
  id,
  username,
  full_name,
  bio,
  avatar_url,
  location,
  is_verified,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'sarahjohnson',
  'Sarah Johnson',
  'Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape.',
  'https://dummyimage.com/150x150/8b5cf6/ffffff?text=SJ',
  'Los Angeles, CA',
  false,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  location = EXCLUDED.location,
  updated_at = NOW();

-- =============================================================================
-- STEP 3: Create artist profile for Sarah Johnson (with dynamic column handling)
-- =============================================================================

-- Insert artist profile for Sarah Johnson with dynamic column handling
DO $$
DECLARE
  has_profile_image_url BOOLEAN;
  has_is_verified BOOLEAN;
  existing_profile_id UUID;
BEGIN
  -- Check if profile_image_url column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'artist_profiles' 
    AND column_name = 'profile_image_url'
  ) INTO has_profile_image_url;
  
  -- Check if is_verified column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'artist_profiles' 
    AND column_name = 'is_verified'
  ) INTO has_is_verified;
  
  -- Check if artist profile already exists for this user
  SELECT id INTO existing_profile_id
  FROM artist_profiles 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';
  
  -- If profile exists, update it; otherwise insert new one
  IF existing_profile_id IS NOT NULL THEN
    RAISE NOTICE 'ℹ️  Artist profile already exists for Sarah Johnson, updating...';
    
    -- Update existing profile
    IF has_profile_image_url AND has_is_verified THEN
      UPDATE artist_profiles SET
        artist_name = 'Sarah Johnson',
        bio = 'Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape. I write about industry trends, artist development, and the evolving relationship between technology and creativity.',
        genres = ARRAY['Industry Analysis', 'Independent Music', 'Digital Platforms', 'Artist Development'],
        profile_image_url = 'https://dummyimage.com/150x150/8b5cf6/ffffff?text=SJ',
        is_verified = false,
        updated_at = NOW()
      WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';
    ELSIF has_profile_image_url THEN
      UPDATE artist_profiles SET
        artist_name = 'Sarah Johnson',
        bio = 'Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape. I write about industry trends, artist development, and the evolving relationship between technology and creativity.',
        genres = ARRAY['Industry Analysis', 'Independent Music', 'Digital Platforms', 'Artist Development'],
        profile_image_url = 'https://dummyimage.com/150x150/8b5cf6/ffffff?text=SJ',
        updated_at = NOW()
      WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';
    ELSIF has_is_verified THEN
      UPDATE artist_profiles SET
        artist_name = 'Sarah Johnson',
        bio = 'Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape. I write about industry trends, artist development, and the evolving relationship between technology and creativity.',
        genres = ARRAY['Industry Analysis', 'Independent Music', 'Digital Platforms', 'Artist Development'],
        is_verified = false,
        updated_at = NOW()
      WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';
    ELSE
      UPDATE artist_profiles SET
        artist_name = 'Sarah Johnson',
        bio = 'Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape. I write about industry trends, artist development, and the evolving relationship between technology and creativity.',
        genres = ARRAY['Industry Analysis', 'Independent Music', 'Digital Platforms', 'Artist Development'],
        updated_at = NOW()
      WHERE user_id = '550e8400-e29b-41d4-a716-446655440001';
    END IF;
  ELSE
    RAISE NOTICE '✅ Creating new artist profile for Sarah Johnson...';
    
    -- Insert new profile with dynamic columns
    IF has_profile_image_url AND has_is_verified THEN
      INSERT INTO artist_profiles (
        id,
        user_id,
        artist_name,
        bio,
        genres,
        profile_image_url,
        is_verified,
        created_at,
        updated_at
      ) VALUES (
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440001',
        'Sarah Johnson',
        'Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape. I write about industry trends, artist development, and the evolving relationship between technology and creativity.',
        ARRAY['Industry Analysis', 'Independent Music', 'Digital Platforms', 'Artist Development'],
        'https://dummyimage.com/150x150/8b5cf6/ffffff?text=SJ',
        false,
        NOW(),
        NOW()
      );
    ELSIF has_profile_image_url THEN
      INSERT INTO artist_profiles (
        id,
        user_id,
        artist_name,
        bio,
        genres,
        profile_image_url,
        created_at,
        updated_at
      ) VALUES (
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440001',
        'Sarah Johnson',
        'Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape. I write about industry trends, artist development, and the evolving relationship between technology and creativity.',
        ARRAY['Industry Analysis', 'Independent Music', 'Digital Platforms', 'Artist Development'],
        'https://dummyimage.com/150x150/8b5cf6/ffffff?text=SJ',
        NOW(),
        NOW()
      );
    ELSIF has_is_verified THEN
      INSERT INTO artist_profiles (
        id,
        user_id,
        artist_name,
        bio,
        genres,
        is_verified,
        created_at,
        updated_at
      ) VALUES (
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440001',
        'Sarah Johnson',
        'Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape. I write about industry trends, artist development, and the evolving relationship between technology and creativity.',
        ARRAY['Industry Analysis', 'Independent Music', 'Digital Platforms', 'Artist Development'],
        false,
        NOW(),
        NOW()
      );
    ELSE
      INSERT INTO artist_profiles (
        id,
        user_id,
        artist_name,
        bio,
        genres,
        created_at,
        updated_at
      ) VALUES (
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440001',
        'Sarah Johnson',
        'Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape. I write about industry trends, artist development, and the evolving relationship between technology and creativity.',
        ARRAY['Industry Analysis', 'Independent Music', 'Digital Platforms', 'Artist Development'],
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  
  RAISE NOTICE '✅ Created/updated artist profile for Sarah Johnson (profile_image_url: %, is_verified: %)', has_profile_image_url, has_is_verified;
END $$;

-- =============================================================================
-- STEP 4: Create the blog post "The Future of Independent Music" (with dynamic column handling)
-- =============================================================================

-- Insert the blog post with dynamic column handling
DO $$
DECLARE
  has_artist_profile_id BOOLEAN;
BEGIN
  -- Check if artist_profile_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'artist_blog_posts' 
    AND column_name = 'artist_profile_id'
  ) INTO has_artist_profile_id;
  
  -- Insert blog post with or without artist_profile_id
  IF has_artist_profile_id THEN
    INSERT INTO artist_blog_posts (
      id,
      user_id,
      artist_profile_id,
      title,
      slug,
      content,
      excerpt,
      featured_image_url,
      status,
      published_at,
      seo_title,
      seo_description,
      stats,
      tags,
      categories,
      created_at,
      updated_at
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440004',
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440003',
      'The Future of Independent Music',
      'the-future-of-independent-music',
      'The music industry is undergoing a profound transformation, driven by digital platforms and changing consumer behaviors. Independent artists are at the forefront of this revolution, leveraging new technologies to reach audiences directly and build sustainable careers without traditional label support.

## The Digital Revolution

Streaming platforms like Spotify, Apple Music, and Bandcamp have democratized music distribution, allowing independent artists to reach global audiences with minimal upfront costs. This shift has fundamentally changed the power dynamics in the industry, giving artists unprecedented control over their careers.

## Direct Fan Engagement

Social media platforms have become essential tools for independent artists to build and maintain direct relationships with their fans. Platforms like Instagram, TikTok, and YouTube allow artists to share their creative process, behind-the-scenes content, and personal stories, creating deeper connections with their audience.

## Revenue Diversification

Independent artists are increasingly diversifying their revenue streams beyond traditional album sales and streaming royalties. Merchandise sales, live performances, licensing deals, and fan subscriptions through platforms like Patreon are becoming crucial components of sustainable artist income.

## The Role of Technology

Artificial intelligence and machine learning are playing an increasingly important role in music discovery and recommendation. While some artists worry about being lost in the algorithm, others are learning to work with these systems to increase their visibility and reach new audiences.

## Challenges and Opportunities

Despite the opportunities, independent artists face significant challenges, including:
- Discoverability in an oversaturated market
- Maintaining consistent income streams
- Managing the business side of their careers
- Building sustainable touring models

However, these challenges also present opportunities for innovation and new business models.

## Looking Ahead

The future of independent music is bright, with technology continuing to create new opportunities for artists to connect with fans and build sustainable careers. The key to success lies in embracing these changes while maintaining artistic integrity and authentic connections with audiences.

As we move forward, the line between independent and major label artists will continue to blur, with success being measured not by label affiliation, but by the ability to build and maintain meaningful relationships with fans while creating compelling, authentic music.',
      'Exploring how independent artists are reshaping the music industry through digital platforms and direct fan engagement.',
      'https://dummyimage.com/800x400/8b5cf6/ffffff?text=The+Future+of+Independent+Music',
      'published',
      NOW() - INTERVAL '1 day',
      'The Future of Independent Music - Industry Analysis',
      'Explore how independent artists are reshaping the music industry through digital platforms and direct fan engagement. Industry insights and analysis.',
      '{"views": 1247, "likes": 89, "comments": 23, "shares": 45}',
      ARRAY['Independent Music', 'Digital Age', 'Music Industry', 'Artist Development', 'Streaming', 'Fan Engagement'],
      ARRAY['Industry Analysis', 'Digital Music', 'Artist Development'],
      NOW() - INTERVAL '1 day',
      NOW() - INTERVAL '1 day'
    ) ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      excerpt = EXCLUDED.excerpt,
      featured_image_url = EXCLUDED.featured_image_url,
      status = EXCLUDED.status,
      seo_title = EXCLUDED.seo_title,
      seo_description = EXCLUDED.seo_description,
      stats = EXCLUDED.stats,
      tags = EXCLUDED.tags,
      categories = EXCLUDED.categories,
      updated_at = NOW();
  ELSE
    INSERT INTO artist_blog_posts (
      id,
      user_id,
      title,
      slug,
      content,
      excerpt,
      featured_image_url,
      status,
      published_at,
      seo_title,
      seo_description,
      stats,
      tags,
      categories,
      created_at,
      updated_at
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440004',
      '550e8400-e29b-41d4-a716-446655440001',
      'The Future of Independent Music',
      'the-future-of-independent-music',
      'The music industry is undergoing a profound transformation, driven by digital platforms and changing consumer behaviors. Independent artists are at the forefront of this revolution, leveraging new technologies to reach audiences directly and build sustainable careers without traditional label support.

## The Digital Revolution

Streaming platforms like Spotify, Apple Music, and Bandcamp have democratized music distribution, allowing independent artists to reach global audiences with minimal upfront costs. This shift has fundamentally changed the power dynamics in the industry, giving artists unprecedented control over their careers.

## Direct Fan Engagement

Social media platforms have become essential tools for independent artists to build and maintain direct relationships with their fans. Platforms like Instagram, TikTok, and YouTube allow artists to share their creative process, behind-the-scenes content, and personal stories, creating deeper connections with their audience.

## Revenue Diversification

Independent artists are increasingly diversifying their revenue streams beyond traditional album sales and streaming royalties. Merchandise sales, live performances, licensing deals, and fan subscriptions through platforms like Patreon are becoming crucial components of sustainable artist income.

## The Role of Technology

Artificial intelligence and machine learning are playing an increasingly important role in music discovery and recommendation. While some artists worry about being lost in the algorithm, others are learning to work with these systems to increase their visibility and reach new audiences.

## Challenges and Opportunities

Despite the opportunities, independent artists face significant challenges, including:
- Discoverability in an oversaturated market
- Maintaining consistent income streams
- Managing the business side of their careers
- Building sustainable touring models

However, these challenges also present opportunities for innovation and new business models.

## Looking Ahead

The future of independent music is bright, with technology continuing to create new opportunities for artists to connect with fans and build sustainable careers. The key to success lies in embracing these changes while maintaining artistic integrity and authentic connections with audiences.

As we move forward, the line between independent and major label artists will continue to blur, with success being measured not by label affiliation, but by the ability to build and maintain meaningful relationships with fans while creating compelling, authentic music.',
      'Exploring how independent artists are reshaping the music industry through digital platforms and direct fan engagement.',
      'https://dummyimage.com/800x400/8b5cf6/ffffff?text=The+Future+of+Independent+Music',
      'published',
      NOW() - INTERVAL '1 day',
      'The Future of Independent Music - Industry Analysis',
      'Explore how independent artists are reshaping the music industry through digital platforms and direct fan engagement. Industry insights and analysis.',
      '{"views": 1247, "likes": 89, "comments": 23, "shares": 45}',
      ARRAY['Independent Music', 'Digital Age', 'Music Industry', 'Artist Development', 'Streaming', 'Fan Engagement'],
      ARRAY['Industry Analysis', 'Digital Music', 'Artist Development'],
      NOW() - INTERVAL '1 day',
      NOW() - INTERVAL '1 day'
    ) ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      excerpt = EXCLUDED.excerpt,
      featured_image_url = EXCLUDED.featured_image_url,
      status = EXCLUDED.status,
      seo_title = EXCLUDED.seo_title,
      seo_description = EXCLUDED.seo_description,
      stats = EXCLUDED.stats,
      tags = EXCLUDED.tags,
      categories = EXCLUDED.categories,
      updated_at = NOW();
  END IF;
  
  RAISE NOTICE '✅ Created blog post for Sarah Johnson (artist_profile_id: %)', has_artist_profile_id;
END $$;

-- =============================================================================
-- STEP 5: Create a regular post linking to the blog
-- =============================================================================

-- Create post with engagement data in a single transaction
DO $$
DECLARE
  new_post_id UUID;
BEGIN
  -- Insert a regular post that references the blog
  INSERT INTO posts (
    id,
    user_id,
    content,
    type,
    visibility,
    hashtags,
    media_urls,
    likes_count,
    comments_count,
    shares_count,
    posted_as_profile_id,
    posted_as_account_type,
    account_display_name,
    account_username,
    account_avatar_url,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'Just published my latest blog post: "The Future of Independent Music" 🎵

Exploring how independent artists are reshaping the music industry through digital platforms and direct fan engagement. From streaming revolution to AI-powered discovery, the landscape is changing rapidly.

What do you think about the future of independent music? Are you an independent artist navigating these changes? I''d love to hear your thoughts and experiences!

#IndependentMusic #DigitalAge #MusicIndustry #ArtistDevelopment #Streaming #FanEngagement',
    'text',
    'public',
    ARRAY['IndependentMusic', 'DigitalAge', 'MusicIndustry', 'ArtistDevelopment', 'Streaming', 'FanEngagement'],
    ARRAY['https://dummyimage.com/800x400/8b5cf6/ffffff?text=The+Future+of+Independent+Music'],
    89,
    23,
    45,
    '550e8400-e29b-41d4-a716-446655440003',
    'artist',
    'Sarah Johnson',
    'sarahjohnson',
    'https://dummyimage.com/150x150/8b5cf6/ffffff?text=SJ',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ) RETURNING id INTO new_post_id;

  -- Insert some demo likes for the blog post
  INSERT INTO post_likes (post_id, user_id, created_at) VALUES
    (new_post_id, '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '23 hours')
  ON CONFLICT (post_id, user_id) DO NOTHING;

  -- Insert some demo comments
  INSERT INTO post_comments (post_id, user_id, content, created_at) VALUES
    (new_post_id, '550e8400-e29b-41d4-a716-446655440001', 'Thanks for reading! The direct fan connection is indeed one of the most powerful tools independent artists have today. It''s amazing to see how technology is leveling the playing field.', NOW() - INTERVAL '19 hours')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Created post with ID: % and added engagement data', new_post_id;
END $$;

-- =============================================================================
-- STEP 7: Create account entry for Sarah Johnson (if accounts table exists)
-- =============================================================================

-- Check if accounts table exists and create entry
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') THEN
    INSERT INTO accounts (
      id,
      owner_user_id,
      account_type,
      profile_table,
      profile_id,
      display_name,
      username,
      avatar_url,
      is_verified,
      created_at,
      updated_at
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440006',
      '550e8400-e29b-41d4-a716-446655440001',
      'artist',
      'artist_profiles',
      '550e8400-e29b-41d4-a716-446655440003',
      'Sarah Johnson',
      'sarahjohnson',
      'https://dummyimage.com/150x150/8b5cf6/ffffff?text=SJ',
      false,
      NOW(),
      NOW()
    ) ON CONFLICT (profile_table, profile_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      username = EXCLUDED.username,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Created account entry for Sarah Johnson';
  ELSE
    RAISE NOTICE 'ℹ️  Accounts table does not exist, skipping account entry';
  END IF;
END $$;

-- =============================================================================
-- STEP 8: Create a second real account for variety
-- =============================================================================

-- Create Alex Chen's account (music producer)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'alex.chen@example.com') THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440007',
      'alex.chen@example.com',
      crypt('password123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"full_name": "Alex Chen", "username": "alexchen", "bio": "Electronic music producer and sound designer. Creating immersive soundscapes and pushing the boundaries of digital music production.", "location": "San Francisco, CA"}'
    );
    RAISE NOTICE '✅ Created real user account for Alex Chen';
  ELSE
    RAISE NOTICE 'ℹ️  Alex Chen user account already exists';
  END IF;
END $$;

-- Create profile for Alex Chen
INSERT INTO profiles (
  id,
  username,
  full_name,
  bio,
  avatar_url,
  location,
  is_verified,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440007',
  'alexchen',
  'Alex Chen',
  'Electronic music producer and sound designer. Creating immersive soundscapes and pushing the boundaries of digital music production.',
  'https://dummyimage.com/150x150/10b981/ffffff?text=AC',
  'San Francisco, CA',
  false,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  location = EXCLUDED.location,
  updated_at = NOW();

-- Create artist profile for Alex Chen (with dynamic column handling)
DO $$
DECLARE
  has_profile_image_url BOOLEAN;
  has_is_verified BOOLEAN;
  existing_profile_id UUID;
BEGIN
  -- Check if profile_image_url column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'artist_profiles' 
    AND column_name = 'profile_image_url'
  ) INTO has_profile_image_url;
  
  -- Check if is_verified column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'artist_profiles' 
    AND column_name = 'is_verified'
  ) INTO has_is_verified;
  
  -- Check if artist profile already exists for this user
  SELECT id INTO existing_profile_id
  FROM artist_profiles 
  WHERE user_id = '550e8400-e29b-41d4-a716-446655440007';
  
  -- If profile exists, update it; otherwise insert new one
  IF existing_profile_id IS NOT NULL THEN
    RAISE NOTICE 'ℹ️  Artist profile already exists for Alex Chen, updating...';
    
    -- Update existing profile
    IF has_profile_image_url AND has_is_verified THEN
      UPDATE artist_profiles SET
        artist_name = 'Alex Chen',
        bio = 'Electronic music producer and sound designer. Creating immersive soundscapes and pushing the boundaries of digital music production. Specializing in ambient, techno, and experimental electronic music.',
        genres = ARRAY['Electronic', 'Ambient', 'Techno', 'Experimental', 'Sound Design'],
        profile_image_url = 'https://dummyimage.com/150x150/10b981/ffffff?text=AC',
        is_verified = false,
        updated_at = NOW()
      WHERE user_id = '550e8400-e29b-41d4-a716-446655440007';
    ELSIF has_profile_image_url THEN
      UPDATE artist_profiles SET
        artist_name = 'Alex Chen',
        bio = 'Electronic music producer and sound designer. Creating immersive soundscapes and pushing the boundaries of digital music production. Specializing in ambient, techno, and experimental electronic music.',
        genres = ARRAY['Electronic', 'Ambient', 'Techno', 'Experimental', 'Sound Design'],
        profile_image_url = 'https://dummyimage.com/150x150/10b981/ffffff?text=AC',
        updated_at = NOW()
      WHERE user_id = '550e8400-e29b-41d4-a716-446655440007';
    ELSIF has_is_verified THEN
      UPDATE artist_profiles SET
        artist_name = 'Alex Chen',
        bio = 'Electronic music producer and sound designer. Creating immersive soundscapes and pushing the boundaries of digital music production. Specializing in ambient, techno, and experimental electronic music.',
        genres = ARRAY['Electronic', 'Ambient', 'Techno', 'Experimental', 'Sound Design'],
        is_verified = false,
        updated_at = NOW()
      WHERE user_id = '550e8400-e29b-41d4-a716-446655440007';
    ELSE
      UPDATE artist_profiles SET
        artist_name = 'Alex Chen',
        bio = 'Electronic music producer and sound designer. Creating immersive soundscapes and pushing the boundaries of digital music production. Specializing in ambient, techno, and experimental electronic music.',
        genres = ARRAY['Electronic', 'Ambient', 'Techno', 'Experimental', 'Sound Design'],
        updated_at = NOW()
      WHERE user_id = '550e8400-e29b-41d4-a716-446655440007';
    END IF;
  ELSE
    RAISE NOTICE '✅ Creating new artist profile for Alex Chen...';
    
    -- Insert new profile with dynamic columns
    IF has_profile_image_url AND has_is_verified THEN
      INSERT INTO artist_profiles (
        id,
        user_id,
        artist_name,
        bio,
        genres,
        profile_image_url,
        is_verified,
        created_at,
        updated_at
      ) VALUES (
        '550e8400-e29b-41d4-a716-446655440008',
        '550e8400-e29b-41d4-a716-446655440007',
        'Alex Chen',
        'Electronic music producer and sound designer. Creating immersive soundscapes and pushing the boundaries of digital music production. Specializing in ambient, techno, and experimental electronic music.',
        ARRAY['Electronic', 'Ambient', 'Techno', 'Experimental', 'Sound Design'],
        'https://dummyimage.com/150x150/10b981/ffffff?text=AC',
        false,
        NOW(),
        NOW()
      );
    ELSIF has_profile_image_url THEN
      INSERT INTO artist_profiles (
        id,
        user_id,
        artist_name,
        bio,
        genres,
        profile_image_url,
        created_at,
        updated_at
      ) VALUES (
        '550e8400-e29b-41d4-a716-446655440008',
        '550e8400-e29b-41d4-a716-446655440007',
        'Alex Chen',
        'Electronic music producer and sound designer. Creating immersive soundscapes and pushing the boundaries of digital music production. Specializing in ambient, techno, and experimental electronic music.',
        ARRAY['Electronic', 'Ambient', 'Techno', 'Experimental', 'Sound Design'],
        'https://dummyimage.com/150x150/10b981/ffffff?text=AC',
        NOW(),
        NOW()
      );
    ELSIF has_is_verified THEN
      INSERT INTO artist_profiles (
        id,
        user_id,
        artist_name,
        bio,
        genres,
        is_verified,
        created_at,
        updated_at
      ) VALUES (
        '550e8400-e29b-41d4-a716-446655440008',
        '550e8400-e29b-41d4-a716-446655440007',
        'Alex Chen',
        'Electronic music producer and sound designer. Creating immersive soundscapes and pushing the boundaries of digital music production. Specializing in ambient, techno, and experimental electronic music.',
        ARRAY['Electronic', 'Ambient', 'Techno', 'Experimental', 'Sound Design'],
        false,
        NOW(),
        NOW()
      );
    ELSE
      INSERT INTO artist_profiles (
        id,
        user_id,
        artist_name,
        bio,
        genres,
        created_at,
        updated_at
      ) VALUES (
        '550e8400-e29b-41d4-a716-446655440008',
        '550e8400-e29b-41d4-a716-446655440007',
        'Alex Chen',
        'Electronic music producer and sound designer. Creating immersive soundscapes and pushing the boundaries of digital music production. Specializing in ambient, techno, and experimental electronic music.',
        ARRAY['Electronic', 'Ambient', 'Techno', 'Experimental', 'Sound Design'],
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  
  RAISE NOTICE '✅ Created/updated artist profile for Alex Chen (profile_image_url: %, is_verified: %)', has_profile_image_url, has_is_verified;
END $$;

-- Create a second blog post by Alex Chen (with dynamic column handling)
DO $$
DECLARE
  has_artist_profile_id BOOLEAN;
BEGIN
  -- Check if artist_profile_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'artist_blog_posts' 
    AND column_name = 'artist_profile_id'
  ) INTO has_artist_profile_id;
  
  -- Insert blog post with or without artist_profile_id
  IF has_artist_profile_id THEN
    INSERT INTO artist_blog_posts (
      id,
      user_id,
      artist_profile_id,
      title,
      slug,
      content,
      excerpt,
      featured_image_url,
      status,
      published_at,
      seo_title,
      seo_description,
      stats,
      tags,
      categories,
      created_at,
      updated_at
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440009',
      '550e8400-e29b-41d4-a716-446655440007',
      '550e8400-e29b-41d4-a716-446655440008',
      'The Art of Sound Design in Electronic Music',
      'the-art-of-sound-design-in-electronic-music',
      'Sound design is the foundation of electronic music production. It''s the process of creating, manipulating, and organizing sounds to create unique sonic experiences that transport listeners to new worlds.

## Understanding Sound Design

Sound design goes beyond simply choosing presets or samples. It involves understanding the fundamental properties of sound—frequency, amplitude, timbre, and spatial characteristics. Every sound we create or manipulate contributes to the emotional and physical impact of our music.

## Tools and Techniques

Modern producers have access to an incredible array of tools for sound design:
- **Synthesizers**: Analog, digital, and modular synthesizers for creating unique timbres
- **Effects Processing**: Reverb, delay, distortion, and modulation effects
- **Field Recording**: Capturing real-world sounds for organic textures
- **Granular Synthesis**: Breaking sounds into tiny grains for complex textures

## The Creative Process

My approach to sound design involves several key steps:
1. **Conceptualization**: Understanding the emotional intent
2. **Sound Selection**: Choosing or creating appropriate source material
3. **Manipulation**: Processing and transforming sounds
4. **Organization**: Arranging sounds in a coherent structure
5. **Refinement**: Fine-tuning for maximum impact

## Emotional Impact

The most successful electronic music creates an emotional connection with listeners. Sound design plays a crucial role in this by:
- Creating atmosphere and mood
- Building tension and release
- Evoking specific emotions
- Creating memorable sonic signatures

## Looking Forward

As technology continues to evolve, the possibilities for sound design are expanding. AI-assisted synthesis, spatial audio, and new synthesis techniques are opening up exciting new creative possibilities for electronic music producers.',
      'Exploring the creative process and techniques behind sound design in electronic music production.',
      'https://dummyimage.com/800x400/10b981/ffffff?text=The+Art+of+Sound+Design',
      'published',
      NOW() - INTERVAL '2 days',
      'The Art of Sound Design in Electronic Music - Production Guide',
      'Learn about sound design techniques and creative processes in electronic music production.',
      '{"views": 892, "likes": 67, "comments": 18, "shares": 32}',
      ARRAY['Sound Design', 'Electronic Music', 'Music Production', 'Synthesis', 'Creative Process'],
      ARRAY['Production Guide', 'Electronic Music', 'Sound Design'],
      NOW() - INTERVAL '2 days',
      NOW() - INTERVAL '2 days'
    ) ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      excerpt = EXCLUDED.excerpt,
      featured_image_url = EXCLUDED.featured_image_url,
      status = EXCLUDED.status,
      seo_title = EXCLUDED.seo_title,
      seo_description = EXCLUDED.seo_description,
      stats = EXCLUDED.stats,
      tags = EXCLUDED.tags,
      categories = EXCLUDED.categories,
      updated_at = NOW();
  ELSE
    INSERT INTO artist_blog_posts (
      id,
      user_id,
      title,
      slug,
      content,
      excerpt,
      featured_image_url,
      status,
      published_at,
      seo_title,
      seo_description,
      stats,
      tags,
      categories,
      created_at,
      updated_at
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440009',
      '550e8400-e29b-41d4-a716-446655440007',
      'The Art of Sound Design in Electronic Music',
      'the-art-of-sound-design-in-electronic-music',
      'Sound design is the foundation of electronic music production. It''s the process of creating, manipulating, and organizing sounds to create unique sonic experiences that transport listeners to new worlds.

## Understanding Sound Design

Sound design goes beyond simply choosing presets or samples. It involves understanding the fundamental properties of sound—frequency, amplitude, timbre, and spatial characteristics. Every sound we create or manipulate contributes to the emotional and physical impact of our music.

## Tools and Techniques

Modern producers have access to an incredible array of tools for sound design:
- **Synthesizers**: Analog, digital, and modular synthesizers for creating unique timbres
- **Effects Processing**: Reverb, delay, distortion, and modulation effects
- **Field Recording**: Capturing real-world sounds for organic textures
- **Granular Synthesis**: Breaking sounds into tiny grains for complex textures

## The Creative Process

My approach to sound design involves several key steps:
1. **Conceptualization**: Understanding the emotional intent
2. **Sound Selection**: Choosing or creating appropriate source material
3. **Manipulation**: Processing and transforming sounds
4. **Organization**: Arranging sounds in a coherent structure
5. **Refinement**: Fine-tuning for maximum impact

## Emotional Impact

The most successful electronic music creates an emotional connection with listeners. Sound design plays a crucial role in this by:
- Creating atmosphere and mood
- Building tension and release
- Evoking specific emotions
- Creating memorable sonic signatures

## Looking Forward

As technology continues to evolve, the possibilities for sound design are expanding. AI-assisted synthesis, spatial audio, and new synthesis techniques are opening up exciting new creative possibilities for electronic music producers.',
      'Exploring the creative process and techniques behind sound design in electronic music production.',
      'https://dummyimage.com/800x400/10b981/ffffff?text=The+Art+of+Sound+Design',
      'published',
      NOW() - INTERVAL '2 days',
      'The Art of Sound Design in Electronic Music - Production Guide',
      'Learn about sound design techniques and creative processes in electronic music production.',
      '{"views": 892, "likes": 67, "comments": 18, "shares": 32}',
      ARRAY['Sound Design', 'Electronic Music', 'Music Production', 'Synthesis', 'Creative Process'],
      ARRAY['Production Guide', 'Electronic Music', 'Sound Design'],
      NOW() - INTERVAL '2 days',
      NOW() - INTERVAL '2 days'
    ) ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      excerpt = EXCLUDED.excerpt,
      featured_image_url = EXCLUDED.featured_image_url,
      status = EXCLUDED.status,
      seo_title = EXCLUDED.seo_title,
      seo_description = EXCLUDED.seo_description,
      stats = EXCLUDED.stats,
      tags = EXCLUDED.tags,
      categories = EXCLUDED.categories,
      updated_at = NOW();
  END IF;
  
  RAISE NOTICE '✅ Created blog post for Alex Chen (artist_profile_id: %)', has_artist_profile_id;
END $$;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Real Blog Accounts Setup Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Created real user accounts with proper authentication';
  RAISE NOTICE '✅ Created profiles for both users';
  RAISE NOTICE '✅ Created artist profiles for both users (with dynamic column handling)';
  RAISE NOTICE '✅ Created blog posts with real content (with dynamic column handling)';
  RAISE NOTICE '✅ Created regular posts linking to blogs';
  RAISE NOTICE '✅ Added engagement data';
  RAISE NOTICE '';
  RAISE NOTICE '👥 Real Accounts Created:';
  RAISE NOTICE '   1. Sarah Johnson (@sarahjohnson) - Music Industry Analyst';
  RAISE NOTICE '      - Blog: "The Future of Independent Music"';
  RAISE NOTICE '      - Email: sarah.johnson@example.com';
  RAISE NOTICE '      - Password: password123';
  RAISE NOTICE '';
  RAISE NOTICE '   2. Alex Chen (@alexchen) - Electronic Music Producer';
  RAISE NOTICE '      - Blog: "The Art of Sound Design in Electronic Music"';
  RAISE NOTICE '      - Email: alex.chen@example.com';
  RAISE NOTICE '      - Password: password123';
  RAISE NOTICE '';
  RAISE NOTICE '🔗 You can now:';
  RAISE NOTICE '   - Log in as these users using their email/password';
  RAISE NOTICE '   - View their blog posts on the feed page';
  RAISE NOTICE '   - Interact with their content (like, comment, follow)';
  RAISE NOTICE '   - See their profiles and artist pages';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 These are real accounts that can be fully interacted with!';
  RAISE NOTICE '';
END $$; 