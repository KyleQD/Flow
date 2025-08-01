-- Sample Ticketing Data Migration
-- This migration adds sample events, ticket types, and sales for testing

-- Insert sample events
INSERT INTO events (id, name, description, venue_name, event_date, event_time, status, capacity, ticket_price, created_at, updated_at)
VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Summer Music Festival 2024',
    'A three-day celebration of music featuring top artists from around the world',
    'Central Park',
    '2024-07-15',
    '18:00:00',
    'confirmed',
    5000,
    75.00,
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Jazz Night at The Blue Note',
    'An intimate evening of jazz featuring local and international artists',
    'The Blue Note',
    '2024-06-20',
    '20:00:00',
    'confirmed',
    200,
    45.00,
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Rock Concert Series',
    'High-energy rock performances in an outdoor amphitheater',
    'Riverside Amphitheater',
    '2024-08-10',
    '19:30:00',
    'confirmed',
    3000,
    60.00,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample ticket types for Summer Music Festival
INSERT INTO ticket_types (id, event_id, name, description, price, quantity_available, quantity_sold, max_per_customer, sale_start, sale_end, is_active, created_at, updated_at)
VALUES 
  (
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'General Admission',
    'Standard festival access with standing room',
    75.00,
    3000,
    2100,
    4,
    '2024-01-01 00:00:00',
    '2024-07-14 23:59:59',
    true,
    NOW(),
    NOW()
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'VIP Access',
    'Premium seating with exclusive amenities and backstage access',
    150.00,
    500,
    350,
    2,
    '2024-01-01 00:00:00',
    '2024-07-14 23:59:59',
    true,
    NOW(),
    NOW()
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'Early Bird',
    'Limited time discounted tickets',
    50.00,
    1000,
    1000,
    2,
    '2024-01-01 00:00:00',
    '2024-03-31 23:59:59',
    true,
    NOW(),
    NOW()
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440001',
    'Backstage Pass',
    'Ultimate experience with meet & greet opportunities',
    250.00,
    100,
    25,
    1,
    '2024-01-01 00:00:00',
    '2024-07-14 23:59:59',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample ticket types for Jazz Night
INSERT INTO ticket_types (id, event_id, name, description, price, quantity_available, quantity_sold, max_per_customer, sale_start, sale_end, is_active, created_at, updated_at)
VALUES 
  (
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'Standard Seating',
    'General seating in the main venue',
    45.00,
    150,
    120,
    4,
    '2024-01-01 00:00:00',
    '2024-06-19 23:59:59',
    true,
    NOW(),
    NOW()
  ),
  (
    '660e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440002',
    'Premium Seating',
    'Premium seats with table service',
    75.00,
    50,
    30,
    2,
    '2024-01-01 00:00:00',
    '2024-06-19 23:59:59',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample ticket types for Rock Concert
INSERT INTO ticket_types (id, event_id, name, description, price, quantity_available, quantity_sold, max_per_customer, sale_start, sale_end, is_active, created_at, updated_at)
VALUES 
  (
    '660e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440003',
    'General Admission',
    'Standing room in the pit area',
    60.00,
    2000,
    850,
    4,
    '2024-01-01 00:00:00',
    '2024-08-09 23:59:59',
    true,
    NOW(),
    NOW()
  ),
  (
    '660e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440003',
    'Reserved Seating',
    'Assigned seats in the amphitheater',
    80.00,
    1000,
    400,
    4,
    '2024-01-01 00:00:00',
    '2024-08-09 23:59:59',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample ticket sales
INSERT INTO ticket_sales (id, ticket_type_id, event_id, customer_email, customer_name, customer_phone, quantity, total_amount, fees, payment_status, payment_method, order_number, created_at, updated_at)
VALUES 
  -- Summer Music Festival sales
  (
    '770e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'john.smith@email.com',
    'John Smith',
    '+1-555-0101',
    2,
    150.00,
    4.50,
    'paid',
    'stripe',
    'TKT202401270001',
    NOW(),
    NOW()
  ),
  (
    '770e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'sarah.johnson@email.com',
    'Sarah Johnson',
    '+1-555-0102',
    1,
    150.00,
    4.50,
    'paid',
    'stripe',
    'TKT202401270002',
    NOW(),
    NOW()
  ),
  (
    '770e8400-e29b-41d4-a716-446655440003',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'michael.brown@email.com',
    'Michael Brown',
    '+1-555-0103',
    4,
    300.00,
    9.00,
    'refunded',
    'stripe',
    'TKT202401270003',
    NOW(),
    NOW()
  ),
  (
    '770e8400-e29b-41d4-a716-446655440004',
    '660e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440001',
    'emily.davis@email.com',
    'Emily Davis',
    '+1-555-0104',
    1,
    250.00,
    7.50,
    'paid',
    'stripe',
    'TKT202401270004',
    NOW(),
    NOW()
  ),
  (
    '770e8400-e29b-41d4-a716-446655440005',
    '660e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'david.wilson@email.com',
    'David Wilson',
    '+1-555-0105',
    3,
    225.00,
    6.75,
    'paid',
    'stripe',
    'TKT202401270005',
    NOW(),
    NOW()
  ),
  -- Jazz Night sales
  (
    '770e8400-e29b-41d4-a716-446655440006',
    '660e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440002',
    'lisa.garcia@email.com',
    'Lisa Garcia',
    '+1-555-0106',
    2,
    90.00,
    2.70,
    'paid',
    'stripe',
    'TKT202401270006',
    NOW(),
    NOW()
  ),
  (
    '770e8400-e29b-41d4-a716-446655440007',
    '660e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440002',
    'robert.taylor@email.com',
    'Robert Taylor',
    '+1-555-0107',
    1,
    75.00,
    2.25,
    'paid',
    'stripe',
    'TKT202401270007',
    NOW(),
    NOW()
  ),
  -- Rock Concert sales
  (
    '770e8400-e29b-41d4-a716-446655440008',
    '660e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440003',
    'amanda.lee@email.com',
    'Amanda Lee',
    '+1-555-0108',
    2,
    120.00,
    3.60,
    'paid',
    'stripe',
    'TKT202401270008',
    NOW(),
    NOW()
  ),
  (
    '770e8400-e29b-41d4-a716-446655440009',
    '660e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440003',
    'james.martinez@email.com',
    'James Martinez',
    '+1-555-0109',
    4,
    320.00,
    9.60,
    'paid',
    'stripe',
    'TKT202401270009',
    NOW(),
    NOW()
  ),
  (
    '770e8400-e29b-41d4-a716-446655440010',
    '660e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440003',
    'jennifer.white@email.com',
    'Jennifer White',
    '+1-555-0110',
    1,
    60.00,
    1.80,
    'pending',
    'stripe',
    'TKT202401270010',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Update event ticket counts based on sales
UPDATE events 
SET tickets_sold = (
  SELECT COALESCE(SUM(quantity), 0)
  FROM ticket_sales 
  WHERE event_id = events.id AND payment_status = 'paid'
)
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003'
);

-- Update event revenue based on sales
UPDATE events 
SET actual_revenue = (
  SELECT COALESCE(SUM(total_amount), 0)
  FROM ticket_sales 
  WHERE event_id = events.id AND payment_status = 'paid'
)
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003'
); 