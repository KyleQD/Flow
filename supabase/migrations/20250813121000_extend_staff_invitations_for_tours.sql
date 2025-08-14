-- Extend staff_invitations to support tour-scoped invites and roles

-- Add columns if they do not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff_invitations' AND column_name = 'tour_id'
  ) THEN
    ALTER TABLE staff_invitations ADD COLUMN tour_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff_invitations' AND column_name = 'role'
  ) THEN
    ALTER TABLE staff_invitations ADD COLUMN role TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff_invitations' AND column_name = 'origin'
  ) THEN
    ALTER TABLE staff_invitations ADD COLUMN origin TEXT DEFAULT 'tour';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff_invitations' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE staff_invitations ADD COLUMN created_by UUID;
  END IF;
END $$;

-- Indexes for quick filtering
CREATE INDEX IF NOT EXISTS idx_staff_invitations_tour ON staff_invitations(tour_id);
CREATE INDEX IF NOT EXISTS idx_staff_invitations_role ON staff_invitations(role);


