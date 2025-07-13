-- Seed Demo Posts and Content Data
-- Populates posts, events, and music releases for demo accounts

-- First, let's get the profile IDs
DO $$
DECLARE
    sarah_id UUID;
    mike_id UUID;
    emma_id UUID;
    neon_lounge_id UUID;
    desert_sky_id UUID;
    velvet_room_id UUID;
    neon_pulse_id UUID;
    desert_rose_id UUID;
    maya_soul_id UUID;
BEGIN
    -- Get profile IDs
    SELECT id INTO sarah_id FROM demo_profiles WHERE username = 'musiclover_sarah';
    SELECT id INTO mike_id FROM demo_profiles WHERE username = 'vegasvibes_mike';
    SELECT id INTO emma_id FROM demo_profiles WHERE username = 'festival_emma';
    SELECT id INTO neon_lounge_id FROM demo_profiles WHERE username = 'neon_lounge_lv';
    SELECT id INTO desert_sky_id FROM demo_profiles WHERE username = 'desert_sky_amphitheater';
    SELECT id INTO velvet_room_id FROM demo_profiles WHERE username = 'velvet_room_vegas';
    SELECT id INTO neon_pulse_id FROM demo_profiles WHERE username = 'neon_pulse_official';
    SELECT id INTO desert_rose_id FROM demo_profiles WHERE username = 'desert_rose_band';
    SELECT id INTO maya_soul_id FROM demo_profiles WHERE username = 'maya_soul_official';

    -- Insert demo posts
    INSERT INTO demo_posts (profile_id, content, media_url, media_type, post_type, likes_count, comments_count, created_at) VALUES
    
    -- Sarah's posts
    (sarah_id, 'Just discovered this amazing new electronic artist! The synth work is incredible 🎹✨', '/venue/gallery/synthesizer-setup.jpg', 'image', 'image', 24, 8, NOW() - INTERVAL '2 hours'),
    (sarah_id, 'Last night at The Neon Lounge was absolutely electric! The crowd, the music, the vibes - everything was perfect 🎵', NULL, NULL, 'text', 67, 15, NOW() - INTERVAL '1 day'),
    (sarah_id, 'Working on some new photography inspired by the Vegas music scene. Light and sound have so much in common 📸', '/venue/gallery/concert-crowd.jpg', 'image', 'image', 89, 23, NOW() - INTERVAL '3 days'),
    (sarah_id, 'Can''t wait for the upcoming festival season! Already planning my schedule 🎪', NULL, NULL, 'text', 45, 12, NOW() - INTERVAL '5 days'),
    
    -- Mike's posts
    (mike_id, 'New article up on Vegas Music Scene! Diving deep into the underground jazz revival happening in the Arts District 🎺', NULL, NULL, 'text', 156, 34, NOW() - INTERVAL '4 hours'),
    (mike_id, 'Been following Desert Rose since their first show. Incredible to see how far they''ve come! 🌹🎸', '/venue/gallery/band-desert-photo.jpg', 'image', 'image', 203, 45, NOW() - INTERVAL '2 days'),
    (mike_id, 'The Velvet Room continues to showcase world-class talent. If you haven''t been, you''re missing out on something special', NULL, NULL, 'text', 78, 19, NOW() - INTERVAL '4 days'),
    (mike_id, 'Interview with Maya Soul coming up! Her voice is absolutely incredible 🎤', NULL, NULL, 'text', 92, 28, NOW() - INTERVAL '6 days'),
    
    -- Emma's posts
    (emma_id, 'Festival season planning is in full swing! Already scouting locations for next year''s events 🎪', '/venue/gallery/festival-stage.jpg', 'image', 'image', 134, 28, NOW() - INTERVAL '6 hours'),
    (emma_id, 'Shoutout to all the local artists making Vegas'' music scene so vibrant! Your creativity inspires us all 🎨', NULL, NULL, 'text', 92, 17, NOW() - INTERVAL '1 day'),
    (emma_id, 'Just finished coordinating the logistics for the summer concert series. So excited! 🎵', NULL, NULL, 'text', 67, 14, NOW() - INTERVAL '3 days'),
    (emma_id, 'The energy at live shows is unmatched. Nothing beats that connection between artist and audience ⚡', NULL, NULL, 'text', 78, 21, NOW() - INTERVAL '5 days'),
    
    -- Neon Lounge posts
    (neon_lounge_id, 'Tonight: Electronic Nights featuring the best DJs in the city! Doors open at 9 PM 🎧', '/venue/gallery/club-interior.jpg', 'image', 'event', 245, 67, NOW() - INTERVAL '3 hours'),
    (neon_lounge_id, 'Thank you to everyone who made last weekend incredible! The energy was off the charts ⚡', '/venue/gallery/neon-sign.jpg', 'image', 'image', 189, 43, NOW() - INTERVAL '2 days'),
    (neon_lounge_id, 'New sound system installation complete! Can''t wait for you to experience the upgraded audio quality 🔊', NULL, NULL, 'text', 156, 29, NOW() - INTERVAL '4 days'),
    (neon_lounge_id, 'Local artist spotlight: Neon Pulse will be performing next Friday! Don''t miss this amazing show 🌟', NULL, NULL, 'text', 178, 45, NOW() - INTERVAL '6 days'),
    
    -- Desert Sky posts
    (desert_sky_id, 'Summer lineup announcement coming soon! Get ready for the biggest acts under the desert stars ⭐', '/venue/gallery/desert-stage.jpg', 'image', 'image', 567, 123, NOW() - INTERVAL '8 hours'),
    (desert_sky_id, 'Sunset soundcheck vibes. There''s nothing quite like music in the Nevada desert 🌅', '/venue/gallery/amphitheater-sunset.jpg', 'image', 'image', 423, 89, NOW() - INTERVAL '2 days'),
    (desert_sky_id, 'Preparing for another incredible season of outdoor concerts. The stage is set! 🎪', NULL, NULL, 'text', 234, 56, NOW() - INTERVAL '5 days'),
    
    -- Velvet Room posts
    (velvet_room_id, 'Jazz Legends Night was absolutely magical. Marcus Williams Quartet delivered a performance for the ages 🎷', '/venue/gallery/jazz-club-interior.jpg', 'image', 'image', 167, 34, NOW() - INTERVAL '1 day'),
    (velvet_room_id, 'Craft cocktails and smooth jazz - the perfect combination for a sophisticated evening 🍸', '/venue/gallery/piano-spotlight.jpg', 'image', 'image', 134, 28, NOW() - INTERVAL '3 days'),
    (velvet_room_id, 'Maya Soul graced our stage last week. Her soulful voice filled every corner of the room 💜', NULL, NULL, 'text', 145, 32, NOW() - INTERVAL '7 days'),
    
    -- Neon Pulse posts
    (neon_pulse_id, 'New track "Midnight Drive" is live on all platforms! This one''s been brewing in the studio for months 🌃', '/venue/gallery/synthesizer-setup.jpg', 'image', 'image', 456, 78, NOW() - INTERVAL '5 hours'),
    (neon_pulse_id, 'Studio session vibes. Working on something special for the upcoming EP 🎛️', '/venue/gallery/synthesizer-setup.jpg', 'image', 'image', 234, 45, NOW() - INTERVAL '2 days'),
    (neon_pulse_id, 'Thank you Las Vegas for an incredible show! The energy was electric ⚡', NULL, NULL, 'text', 189, 67, NOW() - INTERVAL '4 days'),
    (neon_pulse_id, 'Collaborating with some amazing local artists. Vegas music scene is on fire! 🔥', NULL, NULL, 'text', 167, 34, NOW() - INTERVAL '6 days'),
    
    -- Desert Rose posts
    (desert_rose_id, 'Highway Mirage album is out now! This collection represents our journey through the desert landscape 🏜️', '/venue/gallery/band-desert-photo.jpg', 'image', 'image', 345, 89, NOW() - INTERVAL '7 hours'),
    (desert_rose_id, 'Band practice in the desert. Sometimes you need to get back to your roots 🎸', '/venue/gallery/band-desert-photo.jpg', 'image', 'image', 267, 56, NOW() - INTERVAL '3 days'),
    (desert_rose_id, 'Excited to announce our upcoming tour dates! See you on the road 🚗', NULL, NULL, 'text', 198, 43, NOW() - INTERVAL '5 days'),
    
    -- Maya Soul posts
    (maya_soul_id, 'Working on my debut album. Each song tells a piece of my story 📝', '/venue/gallery/vocalist-microphone.jpg', 'image', 'image', 178, 34, NOW() - INTERVAL '10 hours'),
    (maya_soul_id, 'Velvet Nights single is out! This one comes straight from the heart 💜', '/venue/gallery/vocalist-microphone.jpg', 'image', 'image', 234, 67, NOW() - INTERVAL '3 days'),
    (maya_soul_id, 'The Velvet Room show was magical. Thank you to everyone who came out 🎤', NULL, NULL, 'text', 156, 45, NOW() - INTERVAL '7 days');

    -- Insert demo events
    INSERT INTO demo_events (profile_id, title, description, event_date, event_time, venue_name, location, ticket_price, tickets_available, genre, image_url, ticket_link, created_at) VALUES
    
    -- Neon Lounge events
    (neon_lounge_id, 'Electronic Nights: DJ Collective', 'The best electronic DJs in Vegas come together for one incredible night', '2024-08-25 21:00:00', '21:00', 'The Neon Lounge', 'Downtown Las Vegas, NV', '$25', 150, 'Electronic', '/venue/gallery/club-interior.jpg', 'https://tickets.com/electric-nights', NOW() - INTERVAL '2 days'),
    (neon_lounge_id, 'Indie Rock Showcase', 'Local indie bands take the stage for an unforgettable showcase', '2024-08-30 20:00:00', '20:00', 'The Neon Lounge', 'Downtown Las Vegas, NV', '$20', 180, 'Indie Rock', '/venue/gallery/live-band.jpg', 'https://tickets.com/indie-showcase', NOW() - INTERVAL '5 days'),
    (neon_lounge_id, 'Neon Pulse Live', 'Electronic music experience featuring new tracks from Midnight Drive', '2024-09-10 22:00:00', '22:00', 'The Neon Lounge', 'Las Vegas, NV', '$30', 180, 'Electronic', '/venue/gallery/synthesizer-setup.jpg', 'https://tickets.com/neonpulse-sep10', NOW() - INTERVAL '1 day'),
    
    -- Desert Sky events
    (desert_sky_id, 'Summer Rock Festival', 'Multiple headliners bring the heat to the desert', '2024-09-15 18:00:00', '18:00', 'Desert Sky Amphitheater', 'Las Vegas, NV', '$89', 6500, 'Rock', '/venue/gallery/desert-stage.jpg', 'https://tickets.com/summer-rock', NOW() - INTERVAL '3 days'),
    (desert_sky_id, 'Country Under the Stars', 'Nashville''s finest perform under the Nevada sky', '2024-09-22 19:30:00', '19:30', 'Desert Sky Amphitheater', 'Las Vegas, NV', '$65', 7200, 'Country', '/venue/gallery/amphitheater-sunset.jpg', 'https://tickets.com/country-stars', NOW() - INTERVAL '6 days'),
    (desert_sky_id, 'Desert Rose: Highway Tour', 'Celebrating the release of Highway Mirage album', '2024-09-15 19:30:00', '19:30', 'Desert Sky Amphitheater', 'Las Vegas, NV', '$45', 7500, 'Indie Rock', '/venue/gallery/band-desert-photo.jpg', 'https://tickets.com/desertrose-sep15', NOW() - INTERVAL '2 days'),
    
    -- Velvet Room events
    (velvet_room_id, 'Jazz Legends Night', 'Marcus Williams Quartet delivers timeless jazz classics', '2024-08-28 20:30:00', '20:30', 'The Velvet Room', 'Las Vegas Arts District, NV', '$45', 90, 'Jazz', '/venue/gallery/jazz-club-interior.jpg', 'https://tickets.com/jazz-legends', NOW() - INTERVAL '4 days'),
    (velvet_room_id, 'Blues & Soul Evening', 'Sofia Blues Band brings authentic blues to the intimate setting', '2024-09-05 21:00:00', '21:00', 'The Velvet Room', 'Las Vegas Arts District, NV', '$35', 100, 'Blues', '/venue/gallery/piano-spotlight.jpg', 'https://tickets.com/blues-soul', NOW() - INTERVAL '7 days'),
    (velvet_room_id, 'Maya Soul: Intimate Sessions', 'Soulful evening featuring songs from the upcoming debut album', '2024-09-05 21:00:00', '21:00', 'The Velvet Room', 'Las Vegas, NV', '$40', 110, 'R&B/Soul', '/venue/gallery/vocalist-microphone.jpg', 'https://tickets.com/mayasoul-sep05', NOW() - INTERVAL '1 day');

    -- Insert music releases
    INSERT INTO demo_music_releases (profile_id, title, release_type, release_date, tracks, duration, artwork_url, streams, spotify_url, soundcloud_url, created_at) VALUES
    
    -- Neon Pulse releases
    (neon_pulse_id, 'Midnight Drive', 'album', '2023-11-15', 10, '42:35', '/venue/gallery/synthesizer-setup.jpg', 89456, 'https://open.spotify.com/album/midnight-drive', 'https://soundcloud.com/neonpulse/midnight-drive', '2023-11-15'),
    (neon_pulse_id, 'Neon Dreams EP', 'ep', '2023-06-20', 5, '22:18', '/venue/gallery/synthesizer-setup.jpg', 67234, 'https://open.spotify.com/album/neon-dreams', 'https://soundcloud.com/neonpulse/neon-dreams', '2023-06-20'),
    (neon_pulse_id, 'Electric Nights', 'single', '2024-01-10', 1, '4:23', '/venue/gallery/synthesizer-setup.jpg', 34567, 'https://open.spotify.com/track/electric-nights', 'https://soundcloud.com/neonpulse/electric-nights', '2024-01-10'),
    
    -- Desert Rose releases
    (desert_rose_id, 'Highway Mirage', 'album', '2023-09-22', 12, '48:45', '/venue/gallery/band-desert-photo.jpg', 178945, 'https://open.spotify.com/album/highway-mirage', NULL, '2023-09-22'),
    (desert_rose_id, 'Sunrise Sessions', 'ep', '2023-03-15', 6, '26:30', '/venue/gallery/band-desert-photo.jpg', 123456, 'https://open.spotify.com/album/sunrise-sessions', NULL, '2023-03-15'),
    (desert_rose_id, 'Desert Wind', 'single', '2024-02-14', 1, '3:45', '/venue/gallery/band-desert-photo.jpg', 45678, 'https://open.spotify.com/track/desert-wind', NULL, '2024-02-14'),
    
    -- Maya Soul releases
    (maya_soul_id, 'Velvet Nights', 'single', '2024-01-20', 1, '4:15', '/venue/gallery/vocalist-microphone.jpg', 45678, 'https://open.spotify.com/track/velvet-nights', 'https://soundcloud.com/mayasoul/velvet-nights', '2024-01-20'),
    (maya_soul_id, 'Golden Hour Sessions', 'ep', '2023-08-10', 4, '18:22', '/venue/gallery/vocalist-microphone.jpg', 43789, 'https://open.spotify.com/album/golden-hour', 'https://soundcloud.com/mayasoul/golden-hour', '2023-08-10'),
    (maya_soul_id, 'Soulful Mornings', 'single', '2024-03-05', 1, '3:58', '/venue/gallery/vocalist-microphone.jpg', 23456, 'https://open.spotify.com/track/soulful-mornings', 'https://soundcloud.com/mayasoul/soulful-mornings', '2024-03-05');

    -- Add some cross-interactions (follows)
    INSERT INTO demo_follows (follower_id, following_id, created_at) VALUES
    (sarah_id, neon_pulse_id, NOW() - INTERVAL '10 days'),
    (sarah_id, desert_rose_id, NOW() - INTERVAL '15 days'),
    (sarah_id, neon_lounge_id, NOW() - INTERVAL '20 days'),
    (mike_id, maya_soul_id, NOW() - INTERVAL '5 days'),
    (mike_id, velvet_room_id, NOW() - INTERVAL '12 days'),
    (mike_id, desert_rose_id, NOW() - INTERVAL '18 days'),
    (emma_id, desert_sky_id, NOW() - INTERVAL '8 days'),
    (emma_id, neon_lounge_id, NOW() - INTERVAL '14 days'),
    (emma_id, neon_pulse_id, NOW() - INTERVAL '25 days'),
    (neon_pulse_id, desert_rose_id, NOW() - INTERVAL '30 days'),
    (desert_rose_id, maya_soul_id, NOW() - INTERVAL '22 days'),
    (maya_soul_id, velvet_room_id, NOW() - INTERVAL '16 days');

    -- Add some likes to posts
    INSERT INTO demo_likes (profile_id, post_id, created_at) VALUES
    (sarah_id, (SELECT id FROM demo_posts WHERE profile_id = neon_pulse_id LIMIT 1), NOW() - INTERVAL '1 hour'),
    (mike_id, (SELECT id FROM demo_posts WHERE profile_id = maya_soul_id LIMIT 1), NOW() - INTERVAL '2 hours'),
    (emma_id, (SELECT id FROM demo_posts WHERE profile_id = desert_sky_id LIMIT 1), NOW() - INTERVAL '3 hours'),
    (neon_pulse_id, (SELECT id FROM demo_posts WHERE profile_id = sarah_id LIMIT 1), NOW() - INTERVAL '4 hours'),
    (desert_rose_id, (SELECT id FROM demo_posts WHERE profile_id = mike_id LIMIT 1), NOW() - INTERVAL '5 hours'),
    (maya_soul_id, (SELECT id FROM demo_posts WHERE profile_id = velvet_room_id LIMIT 1), NOW() - INTERVAL '6 hours');

    -- Add some comments
    INSERT INTO demo_comments (post_id, profile_id, content, created_at) VALUES
    ((SELECT id FROM demo_posts WHERE profile_id = neon_pulse_id LIMIT 1), sarah_id, 'This track is absolutely incredible! Can''t wait to hear it live 🎵', NOW() - INTERVAL '30 minutes'),
    ((SELECT id FROM demo_posts WHERE profile_id = maya_soul_id LIMIT 1), mike_id, 'Your voice is pure magic! Looking forward to the interview 🎤', NOW() - INTERVAL '45 minutes'),
    ((SELECT id FROM demo_posts WHERE profile_id = desert_sky_id LIMIT 1), emma_id, 'This venue is perfect for large events! Great work on the setup 🎪', NOW() - INTERVAL '1 hour'),
    ((SELECT id FROM demo_posts WHERE profile_id = desert_rose_id LIMIT 1), neon_pulse_id, 'Love the desert rock vibes! We should collaborate sometime 🤝', NOW() - INTERVAL '2 hours');

END $$; 