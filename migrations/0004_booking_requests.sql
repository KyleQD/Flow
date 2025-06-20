-- Create booking_requests table
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  booking_details JSONB NOT NULL,
  token TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  request_type TEXT DEFAULT 'performance' CHECK (request_type IN ('performance', 'collaboration')),
  response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure either artist_id is set OR email/phone is provided for invitations
  CONSTRAINT booking_request_recipient_check CHECK (
    (artist_id IS NOT NULL) OR (email IS NOT NULL OR phone IS NOT NULL)
  ),
  
  -- Ensure either event_id or tour_id is set
  CONSTRAINT booking_request_target_check CHECK (
    (event_id IS NOT NULL AND tour_id IS NULL) OR 
    (tour_id IS NOT NULL AND event_id IS NULL)
  )
);

-- Add RLS policies for booking_requests
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Admin users can manage all booking requests
CREATE POLICY "Admin users can manage booking requests" ON booking_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Artists can view their own booking requests
CREATE POLICY "Artists can view own booking requests" ON booking_requests
  FOR SELECT USING (artist_id = auth.uid());

-- Artists can update their own booking requests (accept/decline)
CREATE POLICY "Artists can update own booking requests" ON booking_requests
  FOR UPDATE USING (artist_id = auth.uid())
  WITH CHECK (artist_id = auth.uid());

-- Event organizers can view booking requests for their events
CREATE POLICY "Event organizers can view their event bookings" ON booking_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = booking_requests.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

-- Tour organizers can view booking requests for their tours
CREATE POLICY "Tour organizers can view their tour bookings" ON booking_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tours 
      WHERE tours.id = booking_requests.tour_id 
      AND tours.organizer_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_booking_requests_artist ON booking_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_event ON booking_requests(event_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_tour ON booking_requests(tour_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_token ON booking_requests(token);
CREATE INDEX IF NOT EXISTS idx_booking_requests_email ON booking_requests(email);

-- Create function to handle booking request notifications
CREATE OR REPLACE FUNCTION handle_booking_request_response()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to accepted or declined
  IF NEW.status != OLD.status AND NEW.status IN ('accepted', 'declined') THEN
    -- Create notification for admin/organizer
    INSERT INTO notifications (
      type,
      content,
      metadata,
      created_at
    ) VALUES (
      'booking_response',
      CASE 
        WHEN NEW.status = 'accepted' THEN 'An artist has accepted your booking request'
        ELSE 'An artist has declined your booking request'
      END,
      jsonb_build_object(
        'bookingRequestId', NEW.id,
        'artistId', NEW.artist_id,
        'eventId', NEW.event_id,
        'tourId', NEW.tour_id,
        'status', NEW.status,
        'responseMessage', NEW.response_message
      ),
      CURRENT_TIMESTAMP
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking request response notifications
DROP TRIGGER IF EXISTS booking_request_response_notification ON booking_requests;
CREATE TRIGGER booking_request_response_notification
  AFTER UPDATE ON booking_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_booking_request_response();

-- Update notifications table to support booking-related notifications
-- Add new notification types to the enum if they don't exist
DO $$ 
BEGIN 
  -- Add booking_request type
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'booking_request' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'booking_request';
  END IF;
  
  -- Add booking_response type
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'booking_response' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'booking_response';
  END IF;
  
  -- Add artist_signup_invite type
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'artist_signup_invite' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')
  ) THEN
    ALTER TYPE notification_type ADD VALUE 'artist_signup_invite';
  END IF;
  
EXCEPTION 
  WHEN others THEN
    -- If notification_type enum doesn't exist, create it
    CREATE TYPE notification_type AS ENUM (
      'booking_request',
      'booking_response', 
      'artist_signup_invite',
      'staff_invite',
      'staff_signup_invite',
      'onboarding_completed'
    );
    
    -- Update notifications table to use the enum
    ALTER TABLE notifications 
    ALTER COLUMN type TYPE notification_type USING type::notification_type;
END $$; 