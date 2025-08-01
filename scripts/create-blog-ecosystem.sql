-- Blog Ecosystem Setup Script
-- Creates a dummy account for Sarah Johnson and her blog post

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- STEP 1: Create dummy user account for Sarah Johnson
-- =============================================================================

-- Insert dummy user into auth.users (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sarah.johnson@example.com') THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data
    ) VALUES (
      '550e8400-e29b-41d4-a716-446655440001', -- Fixed UUID for consistency
      'sarah.johnson@example.com',
      crypt('password123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"full_name": "Sarah Johnson", "username": "sarahjohnson", "bio": "Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape.", "location": "Los Angeles, CA"}'
    );
    RAISE NOTICE '✅ Created dummy user account for Sarah Johnson';
  ELSE
    RAISE NOTICE 'ℹ️  Sarah Johnson user account already exists';
  END IF;
END $$;

-- =============================================================================
-- STEP 2: Create profile for Sarah Johnson
-- =============================================================================

-- Insert profile for Sarah Johnson
INSERT INTO profiles (
  id,
  user_id,
  username,
  full_name,
  bio,
  avatar_url,
  location,
  is_verified,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440001',
  'sarahjohnson',
  'Sarah Johnson',
  'Music industry analyst and independent artist advocate. Passionate about the future of music and helping artists navigate the digital landscape.',
  'https://dummyimage.com/150x150/8b5cf6/ffffff?text=SJ',
  'Los Angeles, CA',
  false,
  NOW(),
  NOW()
) ON CONFLICT (username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  location = EXCLUDED.location,
  updated_at = NOW();

-- =============================================================================
-- STEP 3: Create artist profile for Sarah Johnson (as a music industry analyst)
-- =============================================================================

-- Insert artist profile for Sarah Johnson
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
) ON CONFLICT (user_id) DO UPDATE SET
  artist_name = EXCLUDED.artist_name,
  bio = EXCLUDED.bio,
  genres = EXCLUDED.genres,
  profile_image_url = EXCLUDED.profile_image_url,
  updated_at = NOW();

-- =============================================================================
-- STEP 4: Create the blog post "The Future of Independent Music"
-- =============================================================================

-- Insert the blog post
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

-- =============================================================================
-- STEP 5: Create a regular post linking to the blog
-- =============================================================================

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
  '550e8400-e29b-41d4-a716-446655440005',
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
);

-- =============================================================================
-- STEP 6: Create some engagement data (likes, comments)
-- =============================================================================

-- Insert some demo likes for the blog post
INSERT INTO post_likes (post_id, user_id, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '23 hours'),
  ('550e8400-e29b-41d4-a716-446655440005', 'bce15693-d2bf-42db-a2f2-68239568fafe', NOW() - INTERVAL '22 hours')
ON CONFLICT (post_id, user_id) DO NOTHING;

-- Insert some demo comments
INSERT INTO post_comments (post_id, user_id, content, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440005', 'bce15693-d2bf-42db-a2f2-68239568fafe', 'Great insights! As an independent artist, I''ve definitely seen these changes firsthand. The direct fan connection through social media has been game-changing for my career.', NOW() - INTERVAL '20 hours'),
  ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Thanks for reading! The direct fan connection is indeed one of the most powerful tools independent artists have today. It''s amazing to see how technology is leveling the playing field.', NOW() - INTERVAL '19 hours')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STEP 7: Create account entry for Sarah Johnson
-- =============================================================================

-- Insert account entry for Sarah Johnson
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

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Blog Ecosystem Setup Complete!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Created dummy user account for Sarah Johnson';
  RAISE NOTICE '✅ Created profile for Sarah Johnson';
  RAISE NOTICE '✅ Created artist profile for Sarah Johnson';
  RAISE NOTICE '✅ Created blog post: "The Future of Independent Music"';
  RAISE NOTICE '✅ Created regular post linking to the blog';
  RAISE NOTICE '✅ Added engagement data (likes, comments)';
  RAISE NOTICE '✅ Created account entry for Sarah Johnson';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Blog Post Details:';
  RAISE NOTICE '   - Title: The Future of Independent Music';
  RAISE NOTICE '   - Slug: the-future-of-independent-music';
  RAISE NOTICE '   - Author: Sarah Johnson (@sarahjohnson)';
  RAISE NOTICE '   - Published: 1 day ago';
  RAISE NOTICE '   - Views: 1,247 | Likes: 89 | Comments: 23 | Shares: 45';
  RAISE NOTICE '';
  RAISE NOTICE '🔗 You can now:';
  RAISE NOTICE '   - View the blog post on the feed page';
  RAISE NOTICE '   - Visit Sarah Johnson''s profile to see her blog posts';
  RAISE NOTICE '   - See the blog post in the blog ecosystem';
  RAISE NOTICE '';
END $$; 