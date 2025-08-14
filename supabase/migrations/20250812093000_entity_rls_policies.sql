-- =============================================================================
-- RBAC-driven RLS Policies (Additive, Idempotent)
-- Depends on: 20250812090000_entity_rbac_core.sql (has_entity_permission)
-- Notes: Guard existence of target tables; use minimal assumptions
-- =============================================================================

-- Helper: enable RLS safely
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'staff_shifts') then
    execute 'alter table staff_shifts enable row level security';

    -- Drop conflicting policies if present (safe)
    begin execute 'drop policy if exists staff_shifts_select on staff_shifts'; exception when others then end;
    begin execute 'drop policy if exists staff_shifts_write on staff_shifts'; exception when others then end;

    -- Read access: event/venue logistics editors
    execute $$
      create policy staff_shifts_select on staff_shifts
      for select using (
        has_entity_permission(auth.uid(), 'Venue', venue_id, 'EDIT_EVENT_LOGISTICS')
        or (event_id is not null and has_entity_permission(auth.uid(), 'Event', event_id, 'ASSIGN_EVENT_ROLES'))
      )
    $$;

    -- Write access: assignment role on venue/event
    execute $$
      create policy staff_shifts_write on staff_shifts
      for all using (
        has_entity_permission(auth.uid(), 'Venue', venue_id, 'ASSIGN_EVENT_ROLES')
        or (event_id is not null and has_entity_permission(auth.uid(), 'Event', event_id, 'ASSIGN_EVENT_ROLES'))
      ) with check (true)
    $$;
  end if;
end $$;

-- event_vendor_requests
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'event_vendor_requests') then
    execute 'alter table event_vendor_requests enable row level security';

    begin execute 'drop policy if exists event_vendor_requests_select on event_vendor_requests'; exception when others then end;
    begin execute 'drop policy if exists event_vendor_requests_write on event_vendor_requests'; exception when others then end;

    execute $$
      create policy event_vendor_requests_select on event_vendor_requests
      for select using (
        has_entity_permission(auth.uid(), 'Event', event_id, 'EDIT_EVENT_LOGISTICS')
      )
    $$;

    execute $$
      create policy event_vendor_requests_write on event_vendor_requests
      for all using (
        has_entity_permission(auth.uid(), 'Event', event_id, 'ASSIGN_EVENT_ROLES')
      ) with check (true)
    $$;
  end if;
end $$;

-- job_posting_templates
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'job_posting_templates') then
    execute 'alter table job_posting_templates enable row level security';

    begin execute 'drop policy if exists job_posting_templates_select on job_posting_templates'; exception when others then end;
    begin execute 'drop policy if exists job_posting_templates_write on job_posting_templates'; exception when others then end;

    execute $$
      create policy job_posting_templates_select on job_posting_templates
      for select using (
        has_entity_permission(auth.uid(), 'Venue', venue_id, 'EDIT_EVENT_LOGISTICS')
      )
    $$;

    execute $$
      create policy job_posting_templates_write on job_posting_templates
      for all using (
        has_entity_permission(auth.uid(), 'Venue', venue_id, 'ASSIGN_EVENT_ROLES')
      ) with check (true)
    $$;
  end if;
end $$;

-- job_applications
do $$ begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'job_applications') then
    execute 'alter table job_applications enable row level security';

    begin execute 'drop policy if exists job_applications_select on job_applications'; exception when others then end;
    begin execute 'drop policy if exists job_applications_write on job_applications'; exception when others then end;

    execute $$
      create policy job_applications_select on job_applications
      for select using (
        has_entity_permission(auth.uid(), 'Venue', venue_id, 'EDIT_EVENT_LOGISTICS') or auth.uid() = applicant_id
      )
    $$;

    execute $$
      create policy job_applications_write on job_applications
      for all using (
        has_entity_permission(auth.uid(), 'Venue', venue_id, 'ASSIGN_EVENT_ROLES') or auth.uid() = reviewed_by
      ) with check (true)
    $$;
  end if;
end $$;

-- Note: Public job board views remain unchanged for published content


