-- Create staff_invitations table
CREATE TABLE IF NOT EXISTS staff_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  phone TEXT,
  position_details JSONB NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for staff_invitations
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own invitations
CREATE POLICY "Users can view their own invitations"
  ON staff_invitations FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own invitations
CREATE POLICY "Users can update their own invitations"
  ON staff_invitations FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow admins to view all invitations
CREATE POLICY "Admins can view all invitations"
  ON staff_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to create invitations
CREATE POLICY "Admins can create invitations"
  ON staff_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admins to update invitations
CREATE POLICY "Admins can update invitations"
  ON staff_invitations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to handle invitation status updates
CREATE OR REPLACE FUNCTION handle_invitation_status_update()
RETURNS trigger AS $$
BEGIN
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  -- If the invitation was accepted, create a notification for the admin
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    INSERT INTO notifications (
      type,
      content,
      metadata,
      created_at
    )
    SELECT
      'staff_invite_accepted',
      'Staff invitation accepted by ' || COALESCE(NEW.email, NEW.phone),
      jsonb_build_object(
        'invitationId', NEW.id,
        'userId', NEW.user_id,
        'positionDetails', NEW.position_details
      ),
      NOW()
    FROM profiles
    WHERE profiles.role = 'admin'
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invitation status updates
CREATE TRIGGER on_invitation_status_update
  BEFORE UPDATE ON staff_invitations
  FOR EACH ROW
  EXECUTE FUNCTION handle_invitation_status_update(); 