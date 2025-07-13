-- Seed Demo Accounts Data
-- Populates the database with demo accounts and their content

-- Insert demo profiles
INSERT INTO demo_profiles (username, account_type, profile_data, avatar_url, cover_image, verified, bio, location, social_links, stats) VALUES

-- General Accounts
('musiclover_sarah', 'general', '{
  "name": "Sarah Chen",
  "interests": ["Electronic Music", "Photography", "Live Concerts", "Music Festivals", "DJ Sets"],
  "genre_preferences": ["Electronic", "House", "Techno", "Ambient", "Progressive"],
  "favorite_venues": ["Omnia Nightclub", "XS Nightclub", "The Smith Center"],
  "occupation": "Graphic Designer",
  "age_range": "25-30"
}', '/placeholder-user.jpg', '/venue/gallery/concert-crowd.jpg', false, 
'Music enthusiast from Las Vegas. Love discovering new artists and attending live shows. Electronic music is my passion, but I''m always open to new genres. Photographer in my spare time.', 
'Las Vegas, NV', '{
  "instagram": "sarah_music_lv",
  "twitter": "sarahchenlv", 
  "website": "https://sarahchen.design"
}', '{
  "followers": 342,
  "following": 567,
  "posts": 89,
  "likes": 1245,
  "views": 2890
}'),

('vegasvibes_mike', 'general', '{
  "name": "Mike Rodriguez",
  "interests": ["Local Music Scene", "Rock Music", "Blues", "Jazz", "Music History"],
  "genre_preferences": ["Rock", "Blues", "Jazz", "Alternative", "Indie"],
  "favorite_venues": ["The Joint", "Brooklyn Bowl", "House of Blues", "Downtown Las Vegas Events Center"],
  "occupation": "Music Journalist",
  "age_range": "35-40"
}', '/placeholder-user.jpg', '/venue/gallery/live-band.jpg', true,
'Las Vegas local and music scene insider. I''ve been following the Vegas music scene for over 10 years. Always looking for the next big thing and hidden gems. Love supporting local artists.',
'Las Vegas, NV', '{
  "instagram": "vegasvibes_mike",
  "twitter": "mikerodriguezlv",
  "website": "https://vegasmusicscene.com"
}', '{
  "followers": 1823,
  "following": 432,
  "posts": 234,
  "likes": 5679,
  "views": 12340
}'),

('festival_emma', 'general', '{
  "name": "Emma Thompson",
  "interests": ["Music Festivals", "Event Planning", "Travel", "Community Building", "Live Music"],
  "genre_preferences": ["EDM", "Pop", "Hip-Hop", "Alternative", "World Music"],
  "favorite_venues": ["Las Vegas Festival Grounds", "Life is Beautiful", "Electric Daisy Carnival"],
  "occupation": "Event Coordinator",
  "age_range": "28-33"
}', '/placeholder-user.jpg', '/venue/gallery/festival-stage.jpg', false,
'Festival fanatic and event coordinator. I travel across the country for music festivals and help organize local events in Vegas. Always planning the next adventure!',
'Las Vegas, NV', '{
  "instagram": "festival_emma_lv",
  "twitter": "emmathompsonlv",
  "website": "https://vegasevents.co"
}', '{
  "followers": 987,
  "following": 1234,
  "posts": 156,
  "likes": 3456,
  "views": 7890
}'),

-- Venue Accounts
('neon_lounge_lv', 'venue', '{
  "venue_name": "The Neon Lounge",
  "address": "1234 Fremont Street, Las Vegas, NV 89101",
  "capacity": 200,
  "venue_type": "Nightclub/Lounge",
  "genres": ["Electronic", "Indie", "Alternative", "House", "Techno"],
  "amenities": ["Full Bar", "VIP Seating", "Professional Sound System", "LED Lighting", "Outdoor Patio"],
  "established": "2019",
  "contact": {
    "phone": "(702) 555-0123",
    "booking": "booking@neonlounge.com"
  }
}', '/venue/gallery/neon-sign.jpg', '/venue/gallery/club-interior.jpg', true,
'Premier intimate music venue in the heart of Las Vegas. Featuring the best in electronic, indie, and alternative music. State-of-the-art sound system and lighting in a cozy 200-person capacity space.',
'Downtown Las Vegas, NV', '{
  "instagram": "neonlounge_lv",
  "twitter": "neonloungelv",
  "website": "https://neonloungelv.com"
}', '{
  "followers": 5432,
  "following": 234,
  "posts": 189,
  "likes": 12890,
  "views": 23456,
  "events": 156
}'),

('desert_sky_amphitheater', 'venue', '{
  "venue_name": "Desert Sky Amphitheater",
  "address": "5678 Desert View Drive, Las Vegas, NV 89117",
  "capacity": 8000,
  "venue_type": "Amphitheater",
  "genres": ["Rock", "Pop", "Country", "Hip-Hop", "Alternative"],
  "amenities": ["Outdoor Seating", "VIP Boxes", "Full Concessions", "Parking", "Accessibility Features"],
  "established": "2015",
  "contact": {
    "phone": "(702) 555-0456",
    "booking": "booking@desertskyamp.com"
  }
}', '/venue/gallery/amphitheater-sunset.jpg', '/venue/gallery/desert-stage.jpg', true,
'Las Vegas''s premier outdoor concert venue with stunning desert views. Hosting major touring acts and festivals with a capacity of 8,000. Experience music under the stars in the Nevada desert.',
'Las Vegas, NV', '{
  "instagram": "desertskyamp",
  "twitter": "desertskyamp",
  "website": "https://desertskyamphitheater.com"
}', '{
  "followers": 18765,
  "following": 145,
  "posts": 298,
  "likes": 45678,
  "views": 89123,
  "events": 89
}'),

('velvet_room_vegas', 'venue', '{
  "venue_name": "The Velvet Room",
  "address": "987 Arts District Blvd, Las Vegas, NV 89106",
  "capacity": 120,
  "venue_type": "Jazz Club",
  "genres": ["Jazz", "Blues", "Soul", "Acoustic", "Classical"],
  "amenities": ["Craft Cocktails", "Fine Dining", "Intimate Seating", "Piano Bar", "Private Events"],
  "established": "2020",
  "contact": {
    "phone": "(702) 555-0789",
    "booking": "music@velvetroomlv.com"
  }
}', '/venue/gallery/jazz-club-interior.jpg', '/venue/gallery/piano-spotlight.jpg', true,
'Sophisticated jazz club and cocktail lounge in the Arts District. Featuring world-class jazz musicians, craft cocktails, and an intimate atmosphere. A hidden gem for true music connoisseurs.',
'Las Vegas Arts District, NV', '{
  "instagram": "velvetroomlv",
  "twitter": "velvetroomlv",
  "website": "https://velvetroomlv.com"
}', '{
  "followers": 3456,
  "following": 189,
  "posts": 145,
  "likes": 8901,
  "views": 15678,
  "events": 234
}'),

-- Artist Accounts
('neon_pulse_official', 'artist', '{
  "artist_name": "Neon Pulse",
  "real_name": "Alex Rivera",
  "genre": "Electronic/Synthwave",
  "sub_genres": ["Synthwave", "House", "Ambient", "Downtempo"],
  "artist_type": "Solo Artist",
  "years_active": "2018-Present",
  "label": "Independent",
  "instruments": ["Synthesizers", "Drum Machines", "Digital Audio Workstation"],
  "influences": ["Daft Punk", "Deadmau5", "Boards of Canada", "Tycho"]
}', '/placeholder-user.jpg', '/venue/gallery/synthesizer-setup.jpg', true,
'Electronic music producer and DJ from Las Vegas. Blending synthwave, house, and ambient sounds to create immersive sonic experiences. Performing at clubs and festivals worldwide.',
'Las Vegas, NV', '{
  "instagram": "neonpulse_music",
  "twitter": "neonpulsemusic",
  "website": "https://neonpulse.music",
  "spotify": "https://open.spotify.com/artist/neonpulse",
  "soundcloud": "https://soundcloud.com/neonpulse"
}', '{
  "followers": 12456,
  "following": 345,
  "posts": 167,
  "likes": 23890,
  "views": 45678,
  "streams": 156789
}'),

('desert_rose_band', 'artist', '{
  "artist_name": "Desert Rose",
  "band_members": [
    {"name": "Luna Martinez", "role": "Lead Vocals, Guitar"},
    {"name": "Jake Thompson", "role": "Bass Guitar"},
    {"name": "Riley Chen", "role": "Drums"},
    {"name": "Sam Williams", "role": "Lead Guitar, Backing Vocals"}
  ],
  "genre": "Indie Rock",
  "sub_genres": ["Alternative Rock", "Desert Rock", "Indie Pop"],
  "artist_type": "Band",
  "years_active": "2020-Present",
  "label": "Desert Sound Records",
  "influences": ["The National", "Arcade Fire", "Queens of the Stone Age", "Yeah Yeah Yeahs"]
}', '/placeholder-user.jpg', '/venue/gallery/band-desert-photo.jpg', true,
'Indie rock band from Las Vegas bringing desert-inspired melodies and powerful vocals. Our sound combines classic rock influences with modern indie sensibilities, creating anthems for the open road.',
'Las Vegas, NV', '{
  "instagram": "desertroseband",
  "twitter": "desertroseband",
  "website": "https://desertroseband.com",
  "spotify": "https://open.spotify.com/artist/desertrose",
  "youtube": "https://youtube.com/desertroseband"
}', '{
  "followers": 8934,
  "following": 234,
  "posts": 123,
  "likes": 18567,
  "views": 34567,
  "streams": 234567
}'),

('maya_soul_official', 'artist', '{
  "artist_name": "Maya Soul",
  "real_name": "Maya Johnson",
  "genre": "R&B/Soul",
  "sub_genres": ["Neo-Soul", "Jazz", "Contemporary R&B", "Blues"],
  "artist_type": "Solo Artist",
  "years_active": "2021-Present",
  "label": "Independent",
  "instruments": ["Vocals", "Piano", "Guitar"],
  "influences": ["Lauryn Hill", "Erykah Badu", "D''Angelo", "Jill Scott", "Amy Winehouse"]
}', '/placeholder-user.jpg', '/venue/gallery/vocalist-microphone.jpg', false,
'Soulful vocalist and songwriter blending R&B, jazz, and neo-soul. Las Vegas native with a voice that tells stories of love, loss, and resilience. Currently working on my debut album.',
'Las Vegas, NV', '{
  "instagram": "mayasoul_music",
  "twitter": "mayasoulmusic",
  "website": "https://mayasoul.com",
  "spotify": "https://open.spotify.com/artist/mayasoul",
  "youtube": "https://youtube.com/mayasoulmusic"
}', '{
  "followers": 6789,
  "following": 456,
  "posts": 98,
  "likes": 15234,
  "views": 28901,
  "streams": 89456
}'); 