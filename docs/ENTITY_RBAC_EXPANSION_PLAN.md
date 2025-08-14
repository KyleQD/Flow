## Entity-scoped RBAC and Domain Expansion Plan

### Goal
- **Unify RBAC** across all entity types using a single polymorphic model
- **Add missing entities** (agencies, companies, equipment ownership, multi-location events, participants, packages) from `ROLE_PERMISSIONS` and `RELATIONSHIP_RULES` in `.cursor/rules/role rules`
- **Preserve backward compatibility** with existing tour/venue flows without breaking routes or UI
- **Never reset the database**; use additive migrations only

### Success Criteria
- New `rbac_*` tables and permission RPC in place, with RLS using them for new tables
- Legacy tour/venue role APIs continue to work via views/aliases
- New entities (agencies, equipment ownership, locations, participants, packages) are created and usable with RLS
- API routes can call a single helper for permission checks

---

## Phase 0 — Prereqs and Safety
- Create branch: `feat/entity-rbac-expansion`
- Add feature flag env: `FEATURE_ENTITY_RBAC=1`
- Prepare db backups and migration dry-run process
- Validate existing migrations are green in staging

Artifacts
- None (process/toggles only)

---

## Phase 1 — Polymorphic RBAC (Additive)

Tables (add with IF NOT EXISTS)
- `rbac_roles(id, name, display_name, scope_type, is_system, description)`
- `rbac_permissions(id, name, display_name, category, description)`
- `rbac_role_permissions(role_id, permission_id)` unique(role_id, permission_id)
- `rbac_user_entity_roles(id, user_id, entity_type, entity_id, role_id, start_at, end_at, is_active)`
- `rbac_user_permission_overrides(id, user_id, entity_type, entity_id, permission_id, allow)`
- `rbac_permission_audit_log(id, actor_id, target_user_id, entity_type, entity_id, action, permission_name, created_at)`

Compatibility Views (non-breaking)
- `user_tour_roles` → view over `rbac_user_entity_roles` where `entity_type = 'tour'`
- `venue_user_roles` → view over `rbac_user_entity_roles` where `entity_type = 'venue'`
- `tour_role_permissions`/`venue_role_permissions` → joins filtered by role scope

Permission Check RPC
- `has_entity_permission(user_id, entity_type, entity_id, permission_name) returns boolean`
- Logic: merge role-permission membership with highest-precedence overrides

Seed Data
- Import roles and permissions from `.cursor/rules/role rules`:
  - Roles for: Individual, Artist, Venue, Organizer, PerformanceAgency, StaffingAgency, RentalCompany, ProductionCompany, Promoter, PublicLocation, PrivateLocation, VirtualLocation
  - Permissions: CREATE_PROFILE, EDIT_PROFILE, JOIN_ENTITY, MANAGE_MEMBERS, BOOK_EVENTS, ASSIGN_EVENT_ROLES, EDIT_EVENT_LOGISTICS, MANAGE_ASSETS, PUBLISH_MEDIA, MANAGE_TICKETING, MANAGE_PERMITS
- Map legacy names to new canonical names via an internal alias list for app code

Files to add
- `supabase/migrations/<timestamp>_entity_rbac_core.sql`
- `lib/services/rbac.ts` helper for RPC access (Phase 4)

---

## Phase 2 — Domain Expansion (Additive)

2.1 Agencies/Companies
- Tables:
  - `performance_agencies(id, name, managers uuid[])`
  - `staffing_agencies(id, name, managers uuid[])`
  - `rental_companies(id, name, managers uuid[])`
  - `production_companies(id, name, managers uuid[])`
  - `promoters(id, name, managers uuid[])`
- Link tables:
  - `agency_artists(agency_id, artist_id)` unique(agency_id, artist_id)
  - `staffing_agency_staff(agency_id, individual_id)`
  - Optional: `entity_managers(entity_type, entity_id, individual_id)` for cross-entity managers

2.2 Equipment Ownership (polymorphic)
- Option A (least risk): extend existing `equipment` with `owner_type text`, `owner_id uuid`, default to current owner semantics
- Option B: create `equipment_assets` with owner polymorphism; expose legacy `equipment` as a view

2.3 Locations and Event Multi-place
- `locations(id, location_type, name, address, coordinates, meta)`
- `event_locations(event_id, location_type, location_id, is_primary)`
- Keep existing `events.venue_*` columns for compatibility

2.4 Event Participants and Packages
- `event_participants(event_id, participant_type, participant_id, role)`
- `event_packages(id, name, description)`
- `event_package_assets(event_package_id, equipment_asset_id)`
- `event_package_services(event_package_id, entity_type, entity_id)`

Files to add
- `supabase/migrations/<timestamp>_entity_domain_expansion.sql`

---

## Phase 3 — RLS Unification for New Tables
- Keep existing RLS on `events`, `tours`, and `artist_*` tables
- Add RLS for new tables using `has_entity_permission` RPC:
  - Equipment/equipment_assets: updates require `MANAGE_ASSETS` on owner scope
  - event_locations: inserts/updates require `EDIT_EVENT_LOGISTICS` on the event scope (or parent tour/venue)
  - event_participants: `ASSIGN_EVENT_ROLES`
  - event_packages: `EDIT_EVENT_LOGISTICS` or owner scope role

Files to add
- `supabase/migrations/<timestamp>_entity_rls_policies.sql`

---

## Phase 4 — App Integration (Incremental, Non-breaking)

4.1 Permission Helper
- Add `lib/services/rbac.ts`:
  - `hasEntityPermission({ userId, entityType, entityId, permission })`
  - Internally calls RPC; returns boolean

4.2 API Routes
- Gradually add checks to event/tour/venue routes using the helper, keeping existing owner checks in place
- Prefer short-circuit: if owner/creator matches, allow; else check `hasEntityPermission`

4.3 UI
- Reuse existing venue roles/permissions UI with a parametric `entityType` and `entityId`
- Add screens to assign roles to users on any entity

---

## Phase 5 — Legacy Permission Name Bridging
- Introduce an in-app alias map: legacy → canonical (e.g., `events.view` → `EDIT_EVENT_LOGISTICS` or view-specific canonical)
- Wrap legacy checkers to call the new helper via alias resolution
- Defer removing legacy names until all call sites are migrated

---

## Phase 6 — Testing & Validation
- Unit tests: permission helper, aliasing, seed integrity
- Integration tests: API routes for events/tours/venue with mixed owner/role contexts
- E2E smoke tests: staff onboarding, job posting, event logistics edit, asset assignment
- RLS verification: PostgREST access checks for all new tables

---

## Phase 7 — Rollout & Deprecation
- Enable `FEATURE_ENTITY_RBAC` in staging; monitor logs and audit entries
- Roll out to production with read-only dashboards first
- Deprecate direct reads of legacy tables; keep compatibility views during transition
- Document new APIs and permissions in `docs/`

---

## SQL Skeletons (for reference)

RBAC core (excerpt)
```sql
create table if not exists rbac_roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  display_name text,
  scope_type text not null check (scope_type in ('global','entity')),
  is_system boolean default false,
  description text
);

create table if not exists rbac_permissions (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  display_name text,
  category text,
  description text
);

create table if not exists rbac_role_permissions (
  role_id uuid references rbac_roles(id) on delete cascade,
  permission_id uuid references rbac_permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists rbac_user_entity_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entity_type text not null,
  entity_id uuid not null,
  role_id uuid references rbac_roles(id) on delete cascade not null,
  start_at timestamptz default now(),
  end_at timestamptz,
  is_active boolean default true
);

create or replace function has_entity_permission(
  p_user_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_permission_name text
) returns boolean language sql stable as $$
  with role_perms as (
    select rp.permission_id
    from rbac_user_entity_roles ur
    join rbac_role_permissions rp on rp.role_id = ur.role_id
    join rbac_permissions p on p.id = rp.permission_id
    where ur.user_id = p_user_id
      and ur.entity_type = p_entity_type
      and ur.entity_id = p_entity_id
      and ur.is_active = true
      and (ur.end_at is null or ur.end_at > now())
      and p.name = p_permission_name
  ),
  overrides as (
    select allow
    from rbac_user_permission_overrides o
    join rbac_permissions p on p.id = o.permission_id
    where o.user_id = p_user_id
      and o.entity_type = p_entity_type
      and o.entity_id = p_entity_id
      and p.name = p_permission_name
    order by allow desc
    limit 1
  )
  select coalesce((select allow from overrides), exists(select 1 from role_perms));
$$;
```

Equipment ownership (Option A)
```sql
alter table if exists equipment
  add column if not exists owner_type text default 'venue',
  add column if not exists owner_id uuid;

create index if not exists equipment_owner_idx on equipment(owner_type, owner_id);
```

Event multi-location
```sql
create table if not exists locations (
  id uuid primary key default uuid_generate_v4(),
  location_type text not null check (location_type in ('Venue','PublicLocation','PrivateLocation','VirtualLocation')),
  name text not null,
  address text,
  coordinates jsonb,
  meta jsonb default '{}'::jsonb
);

create table if not exists event_locations (
  event_id uuid references events(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  location_type text not null,
  is_primary boolean default false,
  primary key (event_id, location_id)
);
```

---

## Task Checklist
- [ ] Phase 0 toggles and branch created
- [ ] Phase 1 RBAC tables + RPC + seed + compat views
- [ ] Phase 2 domain tables (agencies, ownership, locations, participants, packages)
- [ ] Phase 3 RLS policies for new tables
- [ ] Phase 4 helper + API route incremental adoption
- [ ] Phase 5 aliasing legacy permission names
- [ ] Phase 6 tests (unit/integration/e2e) and RLS validation
- [ ] Phase 7 rollout, monitoring, and docs

---

## Notes
- Use additive migrations and `IF NOT EXISTS`
- Keep legacy tables and columns until all dependents are migrated
- Document any permission name aliases centrally
- Coordinate with UI/Design for generalized role assignment screens using Shadcn components


