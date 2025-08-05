-- =============================================================================
-- AUTO-CREATE EVENT PAGES TRIGGER
-- Automatically creates event page settings when a new event is created
-- =============================================================================

-- Function to create event page settings automatically
CREATE OR REPLACE FUNCTION create_event_page_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default event page settings for the new event
  INSERT INTO event_page_settings (
    event_id,
    event_table,
    is_page_enabled,
    allow_public_posts,
    allow_attendee_posts,
    require_approval_for_posts,
    show_attendance_count,
    show_attendee_list,
    allow_comments,
    page_theme,
    custom_fields,
    seo_settings
  ) VALUES (
    NEW.id,
    'artist_events',
    TRUE,
    FALSE,
    TRUE,
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    '{"primary_color": "#8B5CF6", "cover_image": null}'::jsonb,
    '{}'::jsonb,
    '{"title": null, "description": null, "keywords": []}'::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for artist_events table
DROP TRIGGER IF EXISTS auto_create_event_page_settings ON artist_events;
CREATE TRIGGER auto_create_event_page_settings
  AFTER INSERT ON artist_events
  FOR EACH ROW
  EXECUTE FUNCTION create_event_page_settings();

-- Also create trigger for the general events table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events' AND table_schema = 'public') THEN
    -- Function for general events table
    CREATE OR REPLACE FUNCTION create_general_event_page_settings()
    RETURNS TRIGGER AS $inner$
    BEGIN
      INSERT INTO event_page_settings (
        event_id,
        event_table,
        is_page_enabled,
        allow_public_posts,
        allow_attendee_posts,
        require_approval_for_posts,
        show_attendance_count,
        show_attendee_list,
        allow_comments,
        page_theme,
        custom_fields,
        seo_settings
      ) VALUES (
        NEW.id,
        'events',
        TRUE,
        FALSE,
        TRUE,
        FALSE,
        TRUE,
        TRUE,
        TRUE,
        '{"primary_color": "#8B5CF6", "cover_image": null}'::jsonb,
        '{}'::jsonb,
        '{"title": null, "description": null, "keywords": []}'::jsonb
      );
      
      RETURN NEW;
    END;
    $inner$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create trigger for events table
    DROP TRIGGER IF EXISTS auto_create_general_event_page_settings ON events;
    CREATE TRIGGER auto_create_general_event_page_settings
      AFTER INSERT ON events
      FOR EACH ROW
      EXECUTE FUNCTION create_general_event_page_settings();
  END IF;
END $$;

-- Create any missing event page settings for existing events that don't have them
-- (This is a safety net in case some events were created between migrations)
INSERT INTO event_page_settings (
  event_id,
  event_table,
  is_page_enabled,
  allow_public_posts,
  allow_attendee_posts,
  require_approval_for_posts,
  show_attendance_count,
  show_attendee_list,
  allow_comments,
  page_theme,
  custom_fields,
  seo_settings
)
SELECT 
  id,
  'artist_events',
  TRUE,
  FALSE,
  TRUE,
  FALSE,
  TRUE,
  TRUE,
  TRUE,
  '{"primary_color": "#8B5CF6", "cover_image": null}'::jsonb,
  '{}'::jsonb,
  '{"title": null, "description": null, "keywords": []}'::jsonb
FROM artist_events
WHERE NOT EXISTS (
  SELECT 1 FROM event_page_settings 
  WHERE event_id = artist_events.id AND event_table = 'artist_events'
);

-- Do the same for general events table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events' AND table_schema = 'public') THEN
    INSERT INTO event_page_settings (
      event_id,
      event_table,
      is_page_enabled,
      allow_public_posts,
      allow_attendee_posts,
      require_approval_for_posts,
      show_attendance_count,
      show_attendee_list,
      allow_comments,
      page_theme,
      custom_fields,
      seo_settings
    )
    SELECT 
      id,
      'events',
      TRUE,
      FALSE,
      TRUE,
      FALSE,
      TRUE,
      TRUE,
      TRUE,
      '{"primary_color": "#8B5CF6", "cover_image": null}'::jsonb,
      '{}'::jsonb,
      '{"title": null, "description": null, "keywords": []}'::jsonb
    FROM events
    WHERE NOT EXISTS (
      SELECT 1 FROM event_page_settings 
      WHERE event_id = events.id AND event_table = 'events'
    );
  END IF;
END $$; 