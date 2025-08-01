-- Add sample crew members for testing calendar team selection
-- Run this script in your Supabase SQL editor

-- First, get a venue profile ID (replace with actual venue_id if needed)
DO $$
DECLARE
  venue_id UUID;
BEGIN
  -- Get the first venue profile
  SELECT id INTO venue_id FROM venue_profiles LIMIT 1;
  
  IF venue_id IS NOT NULL THEN
    -- Insert sample crew members
    INSERT INTO venue_crew_members (
      venue_id,
      name,
      email,
      phone,
      specialty,
      skills,
      rate,
      rate_type,
      is_available,
      preferred_event_types
    ) VALUES 
    (
      venue_id,
      'Alex Johnson',
      'alex@tourify.com',
      '+1-555-0101',
      'Sound Engineer',
      ARRAY['Live Sound', 'Studio Recording', 'Equipment Setup'],
      150.00,
      'daily',
      true,
      ARRAY['concerts', 'festivals', 'corporate']
    ),
    (
      venue_id,
      'Sarah Williams',
      'sarah@tourify.com',
      '+1-555-0102',
      'Lighting Technician',
      ARRAY['Stage Lighting', 'LED Systems', 'DMX Control'],
      120.00,
      'daily',
      true,
      ARRAY['concerts', 'theater', 'corporate']
    ),
    (
      venue_id,
      'Michael Chen',
      'michael@tourify.com',
      '+1-555-0103',
      'Stage Manager',
      ARRAY['Event Coordination', 'Crew Management', 'Safety Protocols'],
      180.00,
      'daily',
      true,
      ARRAY['concerts', 'festivals', 'theater']
    ),
    (
      venue_id,
      'Emily Davis',
      'emily@tourify.com',
      '+1-555-0104',
      'Event Coordinator',
      ARRAY['Event Planning', 'Vendor Management', 'Timeline Management'],
      200.00,
      'daily',
      true,
      ARRAY['corporate', 'weddings', 'private_events']
    ),
    (
      venue_id,
      'David Rodriguez',
      'david@tourify.com',
      '+1-555-0105',
      'Security Specialist',
      ARRAY['Crowd Control', 'Access Management', 'Emergency Response'],
      100.00,
      'daily',
      true,
      ARRAY['concerts', 'festivals', 'large_events']
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added sample crew members for venue: %', venue_id;
  ELSE
    RAISE NOTICE 'No venue profiles found. Please create a venue profile first.';
  END IF;
END $$;

-- Also add some team members
DO $$
DECLARE
  venue_id UUID;
BEGIN
  SELECT id INTO venue_id FROM venue_profiles LIMIT 1;
  
  IF venue_id IS NOT NULL THEN
    INSERT INTO venue_team_members (
      venue_id,
      name,
      email,
      phone,
      role,
      employment_type,
      status
    ) VALUES 
    (
      venue_id,
      'Lisa Thompson',
      'lisa@tourify.com',
      '+1-555-0201',
      'Marketing Manager',
      'full_time',
      'active'
    ),
    (
      venue_id,
      'James Wilson',
      'james@tourify.com',
      '+1-555-0202',
      'Finance Director',
      'full_time',
      'active'
    ),
    (
      venue_id,
      'Maria Garcia',
      'maria@tourify.com',
      '+1-555-0203',
      'HR Coordinator',
      'part_time',
      'active'
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Added sample team members for venue: %', venue_id;
  END IF;
END $$; 