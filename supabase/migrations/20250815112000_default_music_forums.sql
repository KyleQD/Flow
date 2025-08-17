-- Create 10 default music forums for Reddit-like discussions
-- This migration depends on forums table existing from 20250815111000_forums_core.sql

-- Only run if forums table exists
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'forums') then
    -- Insert default music forums using system UUID that will be updated later
    insert into forums (slug, name, description, created_by) values
      ('indie-music', 'Indie Music', 'Discover and discuss independent artists, hidden gems, and the latest indie releases', '00000000-0000-0000-0000-000000000000'),
      ('hip-hop', 'Hip-Hop', 'Everything hip-hop: new drops, classic albums, producers, and culture', '00000000-0000-0000-0000-000000000000'),
      ('songwriting', 'Songwriting', 'Share lyrics, discuss songwriting techniques, and collaborate on music creation', '00000000-0000-0000-0000-000000000000'),
      ('live-music', 'Live Music', 'Concert reviews, festival experiences, and live performance discussions', '00000000-0000-0000-0000-000000000000'),
      ('music-production', 'Music Production', 'Beat making, mixing, mastering, and home studio setups', '00000000-0000-0000-0000-000000000000'),
      ('electronic', 'Electronic', 'House, techno, ambient, EDM, and all electronic music genres', '00000000-0000-0000-0000-000000000000'),
      ('music-discovery', 'Music Discovery', 'Share your finds and discover new artists across all genres', '00000000-0000-0000-0000-000000000000'),
      ('gear-and-instruments', 'Gear & Instruments', 'Guitars, synths, interfaces, and all music equipment discussion', '00000000-0000-0000-0000-000000000000'),
      ('music-business', 'Music Business', 'Industry insights, marketing tips, and artist career advice', '00000000-0000-0000-0000-000000000000'),
      ('music-theory', 'Music Theory', 'Scales, chord progressions, composition, and musical analysis', '00000000-0000-0000-0000-000000000000')
    on conflict (slug) do nothing;
  end if;
end $$;
