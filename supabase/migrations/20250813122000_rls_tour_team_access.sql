-- RLS policies to allow confirmed team members scoped access to tours and related tables

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tour_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tour_vendors ENABLE ROW LEVEL SECURITY;

-- Tours: read access for owner or confirmed team members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tours' AND policyname = 'tours_read_owner_or_team'
  ) THEN
    CREATE POLICY tours_read_owner_or_team
    ON tours FOR SELECT
    USING (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM tour_team_members ttm
        WHERE ttm.tour_id = tours.id
          AND ttm.user_id = auth.uid()
          AND COALESCE(ttm.status, 'pending') = 'confirmed'
      )
    );
  END IF;
END $$;

-- Events: owner or confirmed team can read; owner can write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'events_read_owner_or_team'
  ) THEN
    CREATE POLICY events_read_owner_or_team
    ON events FOR SELECT
    USING (
      EXISTS (SELECT 1 FROM tours WHERE tours.id = events.tour_id AND tours.user_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM tour_team_members ttm
        WHERE ttm.tour_id = events.tour_id
          AND ttm.user_id = auth.uid()
          AND COALESCE(ttm.status, 'pending') = 'confirmed'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'events_write_owner_only'
  ) THEN
    CREATE POLICY events_write_owner_only
    ON events FOR ALL
    USING (
      EXISTS (SELECT 1 FROM tours WHERE tours.id = events.tour_id AND tours.user_id = auth.uid())
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM tours WHERE tours.id = events.tour_id AND tours.user_id = auth.uid())
    );
  END IF;
END $$;

-- Team members: owner read/write; confirmed team read; owner can insert/delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tour_team_members' AND policyname = 'team_read_owner_or_team'
  ) THEN
    CREATE POLICY team_read_owner_or_team
    ON tour_team_members FOR SELECT
    USING (
      EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_team_members.tour_id AND tours.user_id = auth.uid()) OR
      (tour_team_members.user_id = auth.uid() AND COALESCE(tour_team_members.status, 'pending') = 'confirmed')
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tour_team_members' AND policyname = 'team_write_owner_only'
  ) THEN
    CREATE POLICY team_write_owner_only
    ON tour_team_members FOR ALL
    USING (
      EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_team_members.tour_id AND tours.user_id = auth.uid())
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_team_members.tour_id AND tours.user_id = auth.uid())
    );
  END IF;
END $$;

-- Vendors: owner read/write; confirmed team read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tour_vendors' AND policyname = 'vendors_read_owner_or_team'
  ) THEN
    CREATE POLICY vendors_read_owner_or_team
    ON tour_vendors FOR SELECT
    USING (
      EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_vendors.tour_id AND tours.user_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM tour_team_members ttm
        WHERE ttm.tour_id = tour_vendors.tour_id
          AND ttm.user_id = auth.uid()
          AND COALESCE(ttm.status, 'pending') = 'confirmed'
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tour_vendors' AND policyname = 'vendors_write_owner_only'
  ) THEN
    CREATE POLICY vendors_write_owner_only
    ON tour_vendors FOR ALL
    USING (
      EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_vendors.tour_id AND tours.user_id = auth.uid())
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM tours WHERE tours.id = tour_vendors.tour_id AND tours.user_id = auth.uid())
    );
  END IF;
END $$;


