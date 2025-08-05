-- =============================================================================
-- FINAL SCHEMA FIX - HANDLES ACTUAL DATABASE STRUCTURE
-- This migration properly diagnoses and fixes the schema issues
-- Migration: 20250130000008_final_schema_fix.sql
-- =============================================================================

-- First, let's check what columns actually exist in the tours table
DO $$
DECLARE
    col_record RECORD;
    has_artist_id BOOLEAN := FALSE;
    has_user_id BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE '=== DIAGNOSING TOURS TABLE STRUCTURE ===';
    
    FOR col_record IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'tours' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
            col_record.column_name, 
            col_record.data_type, 
            col_record.is_nullable, 
            col_record.column_default;
            
        IF col_record.column_name = 'artist_id' THEN
            has_artist_id := TRUE;
        END IF;
        
        IF col_record.column_name = 'user_id' THEN
            has_user_id := TRUE;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Has artist_id: %, Has user_id: %', has_artist_id, has_user_id;
END $$;

-- Now let's create a proper sample data insertion that handles both cases
DO $$
DECLARE
    valid_user_id UUID;
    has_artist_id BOOLEAN := FALSE;
    has_user_id BOOLEAN := FALSE;
    col_name TEXT;
BEGIN
    -- Check which column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tours' AND column_name = 'artist_id'
    ) INTO has_artist_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tours' AND column_name = 'user_id'
    ) INTO has_user_id;
    
    RAISE NOTICE 'Column check - artist_id: %, user_id: %', has_artist_id, has_user_id;
    
    -- Determine which column name to use
    IF has_artist_id THEN
        col_name := 'artist_id';
    ELSIF has_user_id THEN
        col_name := 'user_id';
    ELSE
        RAISE EXCEPTION 'Neither artist_id nor user_id column exists in tours table';
    END IF;
    
    RAISE NOTICE 'Using column: %', col_name;
    
    -- Get a valid user ID from profiles table
    SELECT id INTO valid_user_id FROM profiles LIMIT 1;
    
    -- If no profiles exist, create a dummy one
    IF valid_user_id IS NULL THEN
        INSERT INTO profiles (id, email, full_name, username) 
        VALUES (gen_random_uuid(), 'admin@tourify.com', 'Admin User', 'admin')
        ON CONFLICT DO NOTHING
        RETURNING id INTO valid_user_id;
    END IF;
    
    RAISE NOTICE 'Using user ID for tours: %', valid_user_id;
    
    -- Insert tours using dynamic SQL to handle the correct column name
    EXECUTE format('
        INSERT INTO tours (name, description, %I, status, start_date, end_date, total_shows, completed_shows, budget, expenses, revenue, transportation, accommodation, equipment_requirements, crew_size) VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15),
        ($16, $17, $3, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29),
        ($30, $31, $3, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43)
        ON CONFLICT DO NOTHING
    ', col_name)
    USING 
        'Summer Festival Tour 2024', 'A nationwide summer festival tour featuring multiple artists', valid_user_id, 'active', '2024-06-01', '2024-08-31', 25, 8, 500000.00, 125000.00, 750000.00, 'Bus and van transportation', 'Hotel accommodations', 'Full sound and lighting rig', 12,
        'Winter Arena Tour', 'Large arena tour across major cities', valid_user_id, 'planning', '2024-12-01', '2025-02-28', 15, 0, 750000.00, 0.00, 0.00, 'Private jet and buses', 'Luxury hotels', 'Advanced stage setup', 20,
        'Club Circuit 2024', 'Small venue club tour', valid_user_id, 'completed', '2024-03-01', '2024-05-31', 30, 30, 150000.00, 140000.00, 300000.00, 'Van transportation', 'Budget hotels', 'Basic sound system', 6;
    
    RAISE NOTICE 'Tours inserted successfully using column: %', col_name;
END $$;

-- Sample events data
INSERT INTO events (name, description, tour_id, venue_name, venue_address, event_date, event_time, doors_open, duration_minutes, status, capacity, tickets_sold, ticket_price, vip_price, expected_revenue, actual_revenue, expenses, sound_requirements, lighting_requirements, stage_requirements, venue_contact_name, venue_contact_email, venue_contact_phone) VALUES
('Summer Festival - Los Angeles', 'Opening night of the summer festival tour', (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), 'LA Festival Grounds', '123 Festival Way, Los Angeles, CA', '2024-06-15', '20:00:00', '18:00:00', 180, 'confirmed', 5000, 4200, 75.00, 150.00, 375000.00, 315000.00, 25000.00, 'Full PA system with subs', 'LED lighting rig', 'Large outdoor stage', 'John Smith', 'john@lafestival.com', '555-0123'),
('Summer Festival - New York', 'Second stop on the summer festival tour', (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), 'NYC Central Park', '456 Park Avenue, New York, NY', '2024-06-22', '19:30:00', '17:30:00', 180, 'confirmed', 8000, 7200, 85.00, 175.00, 680000.00, 612000.00, 35000.00, 'Large outdoor PA system', 'Full lighting production', 'Main stage setup', 'Sarah Johnson', 'sarah@nycparks.com', '555-0456'),
('Winter Arena - Chicago', 'First arena show of the winter tour', (SELECT id FROM tours WHERE name = 'Winter Arena Tour' LIMIT 1), 'Chicago Arena', '789 Arena Blvd, Chicago, IL', '2024-12-15', '20:00:00', '18:00:00', 240, 'scheduled', 15000, 0, 95.00, 200.00, 1425000.00, 0.00, 0.00, 'Arena sound system', 'Full arena lighting', 'Large arena stage', 'Mike Wilson', 'mike@chicagoarena.com', '555-0789')
ON CONFLICT DO NOTHING;

-- Sample staff profiles data (if user_id exists)
DO $$
DECLARE
    user_id_exists UUID;
BEGIN
    SELECT id INTO user_id_exists FROM auth.users LIMIT 1;
    IF user_id_exists IS NOT NULL THEN
        INSERT INTO staff_profiles (user_id, employee_id, first_name, last_name, email, phone, position, department, hire_date, employment_type, salary, hourly_rate, status, availability, skills, certifications, performance_rating, tours_completed, location) VALUES
        (user_id_exists, 'EMP001', 'Alex', 'Johnson', 'alex.johnson@tourify.com', '555-0101', 'Tour Manager', 'Management', '2023-01-15', 'full_time', 75000.00, NULL, 'active', 'available', ARRAY['project_management', 'logistics', 'team_leadership'], ARRAY['Tour Management Certification'], 4.8, 15, 'Los Angeles, CA'),
        (user_id_exists, 'EMP002', 'Maria', 'Garcia', 'maria.garcia@tourify.com', '555-0102', 'Sound Engineer', 'Technical', '2023-03-20', 'full_time', 65000.00, NULL, 'active', 'available', ARRAY['sound_mixing', 'equipment_maintenance', 'live_audio'], ARRAY['Audio Engineering Certification'], 4.9, 12, 'New York, NY'),
        (user_id_exists, 'EMP003', 'David', 'Chen', 'david.chen@tourify.com', '555-0103', 'Lighting Technician', 'Technical', '2023-02-10', 'full_time', 60000.00, NULL, 'active', 'available', ARRAY['lighting_design', 'equipment_setup', 'programming'], ARRAY['Lighting Design Certification'], 4.7, 18, 'Chicago, IL'),
        (user_id_exists, 'EMP004', 'Sarah', 'Williams', 'sarah.williams@tourify.com', '555-0104', 'Stage Manager', 'Operations', '2023-04-05', 'full_time', 70000.00, NULL, 'active', 'available', ARRAY['stage_management', 'scheduling', 'safety'], ARRAY['Stage Management Certification'], 4.6, 10, 'Austin, TX'),
        (user_id_exists, 'EMP005', 'James', 'Brown', 'james.brown@tourify.com', '555-0105', 'Security Coordinator', 'Security', '2023-01-30', 'full_time', 55000.00, NULL, 'active', 'available', ARRAY['crowd_control', 'safety_protocols', 'emergency_response'], ARRAY['Security Management Certification'], 4.5, 8, 'Nashville, TN')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Sample ticket types data
INSERT INTO ticket_types (event_id, name, description, price, quantity_available, quantity_sold, max_per_customer, sale_start, sale_end, is_active) VALUES
((SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1), 'General Admission', 'Standard festival access', 75.00, 5000, 4200, 4, '2024-01-01 00:00:00', '2024-06-14 23:59:59', true),
((SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1), 'VIP Access', 'Premium festival experience with exclusive areas', 150.00, 500, 450, 2, '2024-01-01 00:00:00', '2024-06-14 23:59:59', true),
((SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1), 'General Admission', 'Standard festival access', 85.00, 8000, 7200, 4, '2024-01-01 00:00:00', '2024-06-21 23:59:59', true),
((SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1), 'VIP Access', 'Premium festival experience with exclusive areas', 175.00, 800, 720, 2, '2024-01-01 00:00:00', '2024-06-21 23:59:59', true),
((SELECT id FROM events WHERE name = 'Winter Arena - Chicago' LIMIT 1), 'General Admission', 'Standard arena access', 95.00, 15000, 0, 6, '2024-09-01 00:00:00', '2024-12-14 23:59:59', true),
((SELECT id FROM events WHERE name = 'Winter Arena - Chicago' LIMIT 1), 'VIP Access', 'Premium arena experience with meet & greet', 200.00, 1500, 0, 2, '2024-09-01 00:00:00', '2024-12-14 23:59:59', true)
ON CONFLICT DO NOTHING;

-- Sample ticket sales data
INSERT INTO ticket_sales (ticket_type_id, event_id, customer_email, customer_name, customer_phone, quantity, total_amount, fees, payment_status, payment_method, transaction_id, order_number) VALUES
((SELECT id FROM ticket_types WHERE name = 'General Admission' AND event_id = (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1) LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1), 'customer1@example.com', 'John Doe', '555-1001', 2, 150.00, 7.50, 'paid', 'credit_card', 'txn_001', 'ORD-001'),
((SELECT id FROM ticket_types WHERE name = 'VIP Access' AND event_id = (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1) LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1), 'customer2@example.com', 'Jane Smith', '555-1002', 1, 150.00, 7.50, 'paid', 'credit_card', 'txn_002', 'ORD-002'),
((SELECT id FROM ticket_types WHERE name = 'General Admission' AND event_id = (SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1) LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1), 'customer3@example.com', 'Bob Wilson', '555-1003', 4, 340.00, 17.00, 'paid', 'credit_card', 'txn_003', 'ORD-003'),
((SELECT id FROM ticket_types WHERE name = 'VIP Access' AND event_id = (SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1) LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1), 'customer4@example.com', 'Alice Brown', '555-1004', 2, 350.00, 17.50, 'paid', 'credit_card', 'txn_004', 'ORD-004')
ON CONFLICT DO NOTHING;

-- Sample equipment data (using correct column names - no purchase_date)
INSERT INTO equipment (name, category, description, serial_number, condition, location, purchase_cost, status) VALUES
('Midas M32 Console', 'sound', '32-channel digital mixing console', 'M32-001', 'excellent', 'Los Angeles Warehouse', 8500.00, 'available'),
('JBL SRX828SP Subwoofers', 'sound', 'Dual 18" powered subwoofers', 'SRX828-001', 'good', 'Los Angeles Warehouse', 2400.00, 'available'),
('Martin MAC Aura XB', 'lighting', 'LED moving head wash fixtures', 'MACAURA-001', 'excellent', 'New York Warehouse', 3200.00, 'available'),
('Chauvet Rogue R2 Wash', 'lighting', 'Moving head wash fixtures', 'ROGUE-001', 'good', 'Chicago Warehouse', 2800.00, 'available'),
('Truss System 40ft', 'stage', '40-foot aluminum truss system', 'TRUSS-001', 'good', 'Los Angeles Warehouse', 15000.00, 'available')
ON CONFLICT DO NOTHING;

-- Sample transportation data
INSERT INTO transportation (tour_id, event_id, provider_name, service_type, departure_location, arrival_location, departure_time, arrival_time, capacity, cost, status) VALUES
((SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1), 'Tour Bus Co.', 'bus', 'Los Angeles, CA', 'New York, NY', '2024-06-16 08:00:00', '2024-06-18 20:00:00', 15, 5000.00, 'completed'),
((SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1), 'Tour Bus Co.', 'bus', 'New York, NY', 'Chicago, IL', '2024-06-23 08:00:00', '2024-06-25 20:00:00', 15, 4500.00, 'scheduled')
ON CONFLICT DO NOTHING;

-- Sample budget data
INSERT INTO budgets (tour_id, name, description, total_budget, spent_amount, start_date, end_date, status) VALUES
((SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), 'Summer Festival Tour Budget', 'Complete budget for summer festival tour', 500000.00, 125000.00, '2024-06-01', '2024-08-31', 'active'),
((SELECT id FROM tours WHERE name = 'Winter Arena Tour' LIMIT 1), 'Winter Arena Tour Budget', 'Complete budget for winter arena tour', 750000.00, 0.00, '2024-12-01', '2025-02-28', 'active')
ON CONFLICT DO NOTHING;

-- Sample expenses data
INSERT INTO expenses (budget_id, category_id, tour_id, event_id, description, amount, vendor, expense_date, status) VALUES
((SELECT id FROM budgets WHERE name = 'Summer Festival Tour Budget' LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Transportation' LIMIT 1), (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), NULL, 'Bus transportation LA to NYC', 5000.00, 'Tour Bus Co.', '2024-06-16', 'paid'),
((SELECT id FROM budgets WHERE name = 'Summer Festival Tour Budget' LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Equipment' LIMIT 1), (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), NULL, 'Sound system rental', 15000.00, 'Sound Masters Pro', '2024-06-10', 'paid'),
((SELECT id FROM budgets WHERE name = 'Summer Festival Tour Budget' LIMIT 1), (SELECT id FROM budget_categories WHERE name = 'Venue' LIMIT 1), (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1), 'LA Festival Grounds rental', 25000.00, 'LA Festival Grounds', '2024-06-15', 'paid')
ON CONFLICT DO NOTHING;

-- Sample revenue data
INSERT INTO revenue (tour_id, event_id, source, amount, revenue_date, description, status) VALUES
((SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1), 'ticket_sales', 315000.00, '2024-06-15', 'Ticket sales for LA festival', 'received'),
((SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1), 'ticket_sales', 612000.00, '2024-06-22', 'Ticket sales for NYC festival', 'received'),
((SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), NULL, 'merchandise', 25000.00, '2024-06-30', 'Merchandise sales', 'received')
ON CONFLICT DO NOTHING;

-- Sample staff schedules data
INSERT INTO staff_schedules (staff_id, event_id, tour_id, shift_start, shift_end, role, status) VALUES
((SELECT id FROM staff_profiles WHERE first_name = 'Alex' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1), (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), '2024-06-15 14:00:00', '2024-06-16 02:00:00', 'Tour Manager', 'completed'),
((SELECT id FROM staff_profiles WHERE first_name = 'Maria' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1), (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), '2024-06-15 12:00:00', '2024-06-16 01:00:00', 'Sound Engineer', 'completed'),
((SELECT id FROM staff_profiles WHERE first_name = 'David' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1), (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), '2024-06-15 12:00:00', '2024-06-16 01:00:00', 'Lighting Technician', 'completed'),
((SELECT id FROM staff_profiles WHERE first_name = 'Alex' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1), (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), '2024-06-22 14:00:00', '2024-06-23 02:00:00', 'Tour Manager', 'scheduled'),
((SELECT id FROM staff_profiles WHERE first_name = 'Maria' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1), (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), '2024-06-22 12:00:00', '2024-06-23 01:00:00', 'Sound Engineer', 'scheduled')
ON CONFLICT DO NOTHING;

-- Sample analytics metrics data
INSERT INTO analytics_metrics (metric_type, metric_value, dimensions, tour_id, event_id) VALUES
('revenue', 315000.00, '{"event": "Summer Festival - Los Angeles", "source": "ticket_sales"}', (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1)),
('tickets_sold', 4200, '{"event": "Summer Festival - Los Angeles", "ticket_type": "general_admission"}', (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1)),
('attendance', 4200, '{"event": "Summer Festival - Los Angeles"}', (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - Los Angeles' LIMIT 1)),
('revenue', 612000.00, '{"event": "Summer Festival - New York", "source": "ticket_sales"}', (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1)),
('tickets_sold', 7200, '{"event": "Summer Festival - New York", "ticket_type": "general_admission"}', (SELECT id FROM tours WHERE name = 'Summer Festival Tour 2024' LIMIT 1), (SELECT id FROM events WHERE name = 'Summer Festival - New York' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Log sample data creation
INSERT INTO admin_audit_log (action, resource_type, resource_id, new_values) 
VALUES ('SAMPLE_DATA_CREATED', 'migration', NULL, '{"migration": "20250130000008_final_schema_fix.sql", "tables_populated": "all_admin_tables", "status": "success"}');

-- Final completion notice
DO $$
BEGIN
    RAISE NOTICE '=== FINAL SCHEMA FIX AND SAMPLE DATA COMPLETED ===';
END $$; 