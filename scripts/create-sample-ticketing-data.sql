-- Create sample events and ticket types for testing ticketing integration
-- This script assumes you have some tours in the database

-- First, let's create some sample events if they don't exist
INSERT INTO events (
  id,
  name,
  description,
  tour_id,
  venue_name,
  venue_address,
  event_date,
  event_time,
  doors_open,
  duration_minutes,
  capacity,
  ticket_price,
  vip_price,
  expected_revenue,
  sound_requirements,
  lighting_requirements,
  stage_requirements,
  special_requirements,
  venue_contact_name,
  venue_contact_email,
  venue_contact_phone,
  load_in_time,
  sound_check_time,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'Summer Music Festival 2025',
  'Annual summer music festival featuring local and national artists',
  (SELECT id FROM tours LIMIT 1),
  'Central Park',
  '123 Central Park Ave, New York, NY',
  '2025-06-15',
  '19:00',
  '18:00',
  180,
  5000,
  75.00,
  150.00,
  375000.00,
  'Full PA system with monitors',
  'Professional lighting rig',
  'Main stage with backline',
  'Outdoor event - weather contingency needed',
  'John Smith',
  'john@centralpark.com',
  '555-0123',
  '14:00',
  '16:00',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Downtown Concert Series',
  'Monthly concert series featuring emerging artists',
  (SELECT id FROM tours LIMIT 1),
  'Downtown Arena',
  '456 Downtown Blvd, New York, NY',
  '2025-07-20',
  '20:00',
  '19:00',
  120,
  2000,
  45.00,
  90.00,
  90000.00,
  'Standard arena setup',
  'Basic lighting package',
  'Standard stage setup',
  'Indoor venue',
  'Jane Doe',
  'jane@downtownarena.com',
  '555-0456',
  '16:00',
  '18:00',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'TechCorp Annual Conference',
  'Annual technology conference with keynote speakers',
  (SELECT id FROM tours LIMIT 1),
  'Convention Center',
  '789 Tech Street, San Francisco, CA',
  '2025-08-10',
  '09:00',
  '08:00',
  480,
  1000,
  299.00,
  599.00,
  299000.00,
  'Presentation audio system',
  'Conference lighting',
  'Podium and screens',
  'Corporate event',
  'Bob Johnson',
  'bob@techcorp.com',
  '555-0789',
  '07:00',
  '08:30',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;

-- Now let's create sample ticket types for these events
INSERT INTO ticket_types (
  id,
  event_id,
  name,
  description,
  price,
  quantity_available,
  quantity_sold,
  max_per_customer,
  sale_start,
  sale_end,
  category,
  benefits,
  seating_section,
  is_transferable,
  transfer_fee,
  refund_policy,
  age_restriction,
  requires_id,
  featured,
  priority_order,
  is_active,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  e.id,
  'General Admission',
  'Standard admission ticket',
  75.00,
  3000,
  150,
  10,
  NOW() - INTERVAL '30 days',
  e.event_date,
  'general',
  ARRAY['Access to main stage', 'Food vendors', 'Restrooms'],
  'General',
  true,
  10.00,
  'No refunds within 7 days of event',
  NULL,
  false,
  false,
  1,
  true,
  NOW(),
  NOW()
FROM events e 
WHERE e.name = 'Summer Music Festival 2025'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_types (
  id,
  event_id,
  name,
  description,
  price,
  quantity_available,
  quantity_sold,
  max_per_customer,
  sale_start,
  sale_end,
  category,
  benefits,
  seating_section,
  is_transferable,
  transfer_fee,
  refund_policy,
  age_restriction,
  requires_id,
  featured,
  priority_order,
  is_active,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  e.id,
  'VIP Access',
  'Premium VIP experience with exclusive benefits',
  150.00,
  500,
  75,
  4,
  NOW() - INTERVAL '30 days',
  e.event_date,
  'vip',
  ARRAY['VIP seating area', 'Exclusive food & drinks', 'Meet & greet', 'Early entry'],
  'VIP',
  true,
  25.00,
  'No refunds within 14 days of event',
  NULL,
  false,
  true,
  2,
  true,
  NOW(),
  NOW()
FROM events e 
WHERE e.name = 'Summer Music Festival 2025'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_types (
  id,
  event_id,
  name,
  description,
  price,
  quantity_available,
  quantity_sold,
  max_per_customer,
  sale_start,
  sale_end,
  category,
  benefits,
  seating_section,
  is_transferable,
  transfer_fee,
  refund_policy,
  age_restriction,
  requires_id,
  featured,
  priority_order,
  is_active,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  e.id,
  'General Admission',
  'Standard admission ticket',
  45.00,
  1500,
  200,
  8,
  NOW() - INTERVAL '30 days',
  e.event_date,
  'general',
  ARRAY['Access to arena', 'Concessions available'],
  'General',
  true,
  5.00,
  'No refunds within 3 days of event',
  NULL,
  false,
  false,
  1,
  true,
  NOW(),
  NOW()
FROM events e 
WHERE e.name = 'Downtown Concert Series'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_types (
  id,
  event_id,
  name,
  description,
  price,
  quantity_available,
  quantity_sold,
  max_per_customer,
  sale_start,
  sale_end,
  category,
  benefits,
  seating_section,
  is_transferable,
  transfer_fee,
  refund_policy,
  age_restriction,
  requires_id,
  featured,
  priority_order,
  is_active,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  e.id,
  'Premium Seating',
  'Premium seating with better views',
  90.00,
  500,
  50,
  6,
  NOW() - INTERVAL '30 days',
  e.event_date,
  'premium',
  ARRAY['Premium seating', 'Complimentary drinks', 'Priority entry'],
  'Premium',
  true,
  15.00,
  'No refunds within 7 days of event',
  NULL,
  false,
  true,
  2,
  true,
  NOW(),
  NOW()
FROM events e 
WHERE e.name = 'Downtown Concert Series'
ON CONFLICT DO NOTHING;

-- Create some sample ticket sales
INSERT INTO ticket_sales (
  id,
  event_id,
  ticket_type_id,
  customer_name,
  customer_email,
  customer_phone,
  quantity,
  unit_price,
  total_amount,
  payment_status,
  payment_method,
  transaction_id,
  purchase_date,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  tt.event_id,
  tt.id,
  'John Doe',
  'john.doe@example.com',
  '555-0101',
  2,
  tt.price,
  tt.price * 2,
  'paid',
  'credit_card',
  'txn_' || substr(md5(random()::text), 1, 10),
  NOW() - INTERVAL '5 days',
  NOW(),
  NOW()
FROM ticket_types tt
WHERE tt.name = 'General Admission'
LIMIT 10
ON CONFLICT DO NOTHING;

INSERT INTO ticket_sales (
  id,
  event_id,
  ticket_type_id,
  customer_name,
  customer_email,
  customer_phone,
  quantity,
  unit_price,
  total_amount,
  payment_status,
  payment_method,
  transaction_id,
  purchase_date,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  tt.event_id,
  tt.id,
  'Jane Smith',
  'jane.smith@example.com',
  '555-0202',
  1,
  tt.price,
  tt.price,
  'paid',
  'credit_card',
  'txn_' || substr(md5(random()::text), 1, 10),
  NOW() - INTERVAL '3 days',
  NOW(),
  NOW()
FROM ticket_types tt
WHERE tt.name = 'VIP Access'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Create some sample campaigns
INSERT INTO ticket_campaigns (
  id,
  event_id,
  name,
  description,
  campaign_type,
  discount_type,
  discount_value,
  start_date,
  end_date,
  max_uses,
  current_uses,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  e.id,
  'Early Bird Special',
  'Get 20% off when you buy early',
  'early_bird',
  'percentage',
  20.00,
  NOW() - INTERVAL '60 days',
  NOW() + INTERVAL '30 days',
  100,
  25,
  true,
  NOW(),
  NOW()
FROM events e 
WHERE e.name = 'Summer Music Festival 2025'
ON CONFLICT DO NOTHING;

INSERT INTO ticket_campaigns (
  id,
  event_id,
  name,
  description,
  campaign_type,
  discount_type,
  discount_value,
  start_date,
  end_date,
  max_uses,
  current_uses,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  e.id,
  'Group Discount',
  'Buy 4+ tickets and save 15%',
  'group_discount',
  'percentage',
  15.00,
  NOW() - INTERVAL '30 days',
  e.event_date,
  50,
  12,
  true,
  NOW(),
  NOW()
FROM events e 
WHERE e.name = 'Downtown Concert Series'
ON CONFLICT DO NOTHING;

-- Create some sample promo codes
INSERT INTO promo_codes (
  id,
  event_id,
  code,
  description,
  discount_type,
  discount_value,
  min_purchase_amount,
  max_discount_amount,
  max_uses,
  current_uses,
  start_date,
  end_date,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  e.id,
  'SUMMER20',
  'Summer festival discount',
  'percentage',
  20.00,
  50.00,
  30.00,
  200,
  45,
  NOW() - INTERVAL '30 days',
  e.event_date,
  true,
  NOW(),
  NOW()
FROM events e 
WHERE e.name = 'Summer Music Festival 2025'
ON CONFLICT DO NOTHING;

INSERT INTO promo_codes (
  id,
  event_id,
  code,
  description,
  discount_type,
  discount_value,
  min_purchase_amount,
  max_discount_amount,
  max_uses,
  current_uses,
  start_date,
  end_date,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  e.id,
  'CONCERT10',
  'Concert series discount',
  'percentage',
  10.00,
  25.00,
  15.00,
  100,
  18,
  NOW() - INTERVAL '20 days',
  e.event_date,
  true,
  NOW(),
  NOW()
FROM events e 
WHERE e.name = 'Downtown Concert Series'
ON CONFLICT DO NOTHING;

-- Create some sample social shares
INSERT INTO ticket_shares (
  id,
  event_id,
  ticket_type_id,
  platform,
  share_text,
  share_url,
  click_count,
  conversion_count,
  revenue_generated,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  tt.event_id,
  tt.id,
  'facebook',
  'Check out this amazing event!',
  'https://example.com/event/' || tt.event_id,
  150,
  12,
  900.00,
  NOW() - INTERVAL '10 days',
  NOW()
FROM ticket_types tt
WHERE tt.name = 'General Admission'
LIMIT 5
ON CONFLICT DO NOTHING;

INSERT INTO ticket_shares (
  id,
  event_id,
  ticket_type_id,
  platform,
  share_text,
  share_url,
  click_count,
  conversion_count,
  revenue_generated,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  tt.event_id,
  tt.id,
  'twitter',
  'Don''t miss this incredible show!',
  'https://example.com/event/' || tt.event_id,
  85,
  8,
  600.00,
  NOW() - INTERVAL '7 days',
  NOW()
FROM ticket_types tt
WHERE tt.name = 'VIP Access'
LIMIT 3
ON CONFLICT DO NOTHING;

-- Display summary of created data
SELECT 'Events created:' as summary, COUNT(*) as count FROM events WHERE name IN ('Summer Music Festival 2025', 'Downtown Concert Series', 'TechCorp Annual Conference')
UNION ALL
SELECT 'Ticket types created:', COUNT(*) FROM ticket_types WHERE event_id IN (SELECT id FROM events WHERE name IN ('Summer Music Festival 2025', 'Downtown Concert Series', 'TechCorp Annual Conference'))
UNION ALL
SELECT 'Ticket sales created:', COUNT(*) FROM ticket_sales WHERE event_id IN (SELECT id FROM events WHERE name IN ('Summer Music Festival 2025', 'Downtown Concert Series', 'TechCorp Annual Conference'))
UNION ALL
SELECT 'Campaigns created:', COUNT(*) FROM ticket_campaigns WHERE event_id IN (SELECT id FROM events WHERE name IN ('Summer Music Festival 2025', 'Downtown Concert Series', 'TechCorp Annual Conference'))
UNION ALL
SELECT 'Promo codes created:', COUNT(*) FROM promo_codes WHERE event_id IN (SELECT id FROM events WHERE name IN ('Summer Music Festival 2025', 'Downtown Concert Series', 'TechCorp Annual Conference'))
UNION ALL
SELECT 'Social shares created:', COUNT(*) FROM ticket_shares WHERE event_id IN (SELECT id FROM events WHERE name IN ('Summer Music Festival 2025', 'Downtown Concert Series', 'TechCorp Annual Conference')); 