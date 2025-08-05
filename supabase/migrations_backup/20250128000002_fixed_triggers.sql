-- Fixed Triggers Migration
-- This migration fixes the trigger issues by ensuring proper table structure

-- =============================================================================
-- FIXED FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Drop existing triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS update_ticket_analytics_trigger ON ticket_sales;
DROP TRIGGER IF EXISTS update_ticket_type_sold_count_trigger ON ticket_sales;

-- Function to generate unique ticket codes
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM ticket_types WHERE ticket_code = code) INTO exists_already;
    
    -- If code doesn't exist, return it
    IF NOT exists_already THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update ticket analytics (fixed version)
CREATE OR REPLACE FUNCTION update_ticket_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if the ticket_analytics table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ticket_analytics') THEN
    -- Insert or update analytics for the event and ticket type
    INSERT INTO ticket_analytics (event_id, ticket_type_id, date, tickets_sold, revenue_generated)
    VALUES (
      NEW.event_id,
      NEW.ticket_type_id,
      DATE(NEW.purchase_date),
      1,
      NEW.total_amount
    )
    ON CONFLICT (event_id, ticket_type_id, date)
    DO UPDATE SET
      tickets_sold = ticket_analytics.tickets_sold + 1,
      revenue_generated = ticket_analytics.revenue_generated + NEW.total_amount,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update ticket type sold count (fixed version)
CREATE OR REPLACE FUNCTION update_ticket_type_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if the quantity_sold column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'quantity_sold') THEN
    -- Update the quantity_sold in ticket_types
    UPDATE ticket_types 
    SET quantity_sold = COALESCE(quantity_sold, 0) + NEW.quantity
    WHERE id = NEW.ticket_type_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers with proper error handling
DO $$
BEGIN
  -- Check if ticket_sales table exists and has the required columns
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'ticket_sales'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ticket_sales' AND column_name = 'payment_status'
  ) THEN
    
    -- Create analytics trigger
    CREATE TRIGGER update_ticket_analytics_trigger
      AFTER INSERT ON ticket_sales
      FOR EACH ROW
      WHEN (NEW.payment_status = 'paid')
      EXECUTE FUNCTION update_ticket_analytics();

    -- Create sold count trigger
    CREATE TRIGGER update_ticket_type_sold_count_trigger
      AFTER INSERT ON ticket_sales
      FOR EACH ROW
      WHEN (NEW.payment_status = 'paid')
      EXECUTE FUNCTION update_ticket_type_sold_count();
      
  END IF;
END $$;

-- =============================================================================
-- ADDITIONAL SAFETY CHECKS
-- =============================================================================

-- Ensure ticket_types has quantity_sold column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ticket_types' AND column_name = 'quantity_sold') THEN
    ALTER TABLE ticket_types ADD COLUMN quantity_sold INTEGER DEFAULT 0;
  END IF;
END $$;

-- Update existing ticket_types to have proper quantity_sold values
UPDATE ticket_types 
SET quantity_sold = COALESCE(quantity_sold, 0)
WHERE quantity_sold IS NULL;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check if triggers were created successfully
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'ticket_sales'
AND trigger_name IN ('update_ticket_analytics_trigger', 'update_ticket_type_sold_count_trigger');

-- Check if required columns exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('ticket_sales', 'ticket_types', 'ticket_analytics')
AND column_name IN ('payment_status', 'quantity_sold', 'event_id', 'ticket_type_id')
ORDER BY table_name, column_name;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log successful migration (only if admin_audit_log table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_audit_log') THEN
    INSERT INTO admin_audit_log (user_id, action, resource_type, resource_id, details, timestamp)
    VALUES (
      NULL,
      'migration_completed',
      'system',
      'fixed_triggers',
      '{"version": "1.1", "triggers_created": 2, "functions_updated": 3}',
      NOW()
    );
  END IF;
END $$; 