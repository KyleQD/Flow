-- Temporarily mark all existing profiles as upgraded (Pro) during beta
-- NEVER RESET THE DATABASE

-- Artist profiles: set account_tier to 'pro' if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'artist_profiles' AND column_name = 'account_tier'
  ) THEN
    UPDATE artist_profiles SET account_tier = 'pro' WHERE account_tier IS NULL OR account_tier <> 'pro';
  END IF;
END $$;

-- Venue profiles: set account_tier to 'pro' if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venue_profiles' AND column_name = 'account_tier'
  ) THEN
    UPDATE venue_profiles SET account_tier = 'pro' WHERE account_tier IS NULL OR account_tier <> 'pro';
  END IF;
END $$;

-- Profiles table JSON settings: flip any obvious upgrade flags if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'account_settings'
  ) THEN
    UPDATE profiles
    SET account_settings = jsonb_set(
      COALESCE(account_settings, '{}'::jsonb),
      '{posting_permissions,as_artist}', 'true', true
    )
    WHERE TRUE;
  END IF;
END $$;

-- Organizer accounts: ensure is_active remains true; no billing gating
UPDATE organizer_accounts SET is_active = true WHERE is_active = false;


