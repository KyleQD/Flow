### Job Posting Ecosystem — Implementation Plan

This plan delivers a complete, scalable ecosystem for high‑volume staffing: post → public board → apply → approve → onboard → crew assignment → team comms. It builds on the current codebase with small, safe edits first, then progressive functionality.

---

## Outcomes

- Admins create job listings once; they appear internally and on the public jobs board.
- Public job detail pages support applications; applicants land in the admin’s Staff Management.
- Admin approves applicants, starts and completes onboarding; approved users are assigned to the job crew.
- Approved crew are auto‑joined to a team comms channel for the job/event.
- Public profiles display organization/venue jobs.

---

## Phase 0 – Prereqs and Baseline

- DB: Core tables exist and are idempotent (done). Public board and org postings created; RLS policies enabled (done).
- API: `/api/job-board` exists (done). `/api/job-applications` exists (done). `/api/job-postings/[id]` returns internal template (done).

---

## Phase 1 – Immediate Fixes (stabilize core flow)

Goal: End‑to‑end posting and applying with minimal code changes.

- Template publishing
  - Change internal template creation to persist `status: 'published'` for dashboard posts.
  - File: `lib/services/admin-onboarding-staff.service.ts`

- Link public postings to internal template
  - Schema (already safe to run):
    - `ALTER TABLE job_board_postings ADD COLUMN IF NOT EXISTS template_id UUID;`
    - `ALTER TABLE organization_job_postings ADD COLUMN IF NOT EXISTS template_id UUID;`
  - Code: `lib/services/job-board.service.ts`
    - Accept a `templateId` param and write `template_id` on both board tables.
    - Order of operations when posting from dashboard:
      1) Create internal template (published) → get `template.id`
      2) Create public + org postings with `template_id = template.id`

- Public jobs tab
  - Add a “Staffing” tab to `app/jobs/page.tsx` that fetches `/api/job-board` and renders cards.
  - Each card links to `/jobs/[templateId]` using `template_id` from the API.

- Public job details
  - Keep `app/jobs/[id]/page.tsx` unchanged (it expects a template id). With the link above, detail + apply flow works.

- Board filters
  - Extend `/api/job-board` to support `organization_id`, `created_by` filtering for profile views.

Deliverable: Admin can post → listing appears on public board → users apply → application appears in Staff Management.

---

## Phase 2 – Application Review → Candidate Creation

Goal: Ensure applicants appear clearly and can be approved.

- Admin review UI (Staff dashboard)
  - Confirm applications list shows `pending` with approve/reject actions.
  - On approve: create (or update) `staff_onboarding_candidates` with linkage to the job posting and venue.
  - Files: `app/admin/dashboard/staff/page.tsx`, services in `lib/services/admin-onboarding-staff.service.ts`

- Service behavior
  - Add helper: `createOrLinkCandidateFromApplication(applicationId)`
    - Pull `job_applications` → create candidate row in `staff_onboarding_candidates` with `status='in_progress'`, `stage='onboarding'` and `employment_type`.

Deliverable: Approved applicants become onboarding candidates tied to the job/venue.

---

## Phase 3 – Onboarding → Staff Member → Crew Assignment

Goal: Convert approved candidates into crew and attach them to the job.

- Complete onboarding (existing)
  - `AdminOnboardingStaffService.completeOnboarding` creates `staff_members` (already present). Ensure it returns the created staff member.

- Crew assignment (new)
  - Schema (safe):
    - `ALTER TABLE staff_shifts ADD COLUMN IF NOT EXISTS job_posting_id UUID;`
  - On `completeOnboarding`, if the candidate came from a job posting, create a default `staff_shifts` row with `job_posting_id` and `staff_member_id`, or create a small `job_crew` table if preferred later.
  - File: `lib/services/admin-onboarding-staff.service.ts`

Deliverable: Completing onboarding automatically assigns the user to the job crew.

---

## Phase 4 – Team Communications / Group Chat

Goal: Auto‑join approved crew to job communications.

- Minimal viable comms (now)
  - Use `team_communications` to broadcast updates. When a user is approved or completes onboarding, create a thread entry with recipients.

- Real chat (future enhancement)
  - Introduce `chat_channels (id, job_posting_id, name)` and `chat_memberships (channel_id, user_id)`.
  - On approve/onboard: add membership for crew. Wire to existing messaging UI if present.

Deliverable: Admin can message the job’s crew; later upgrade to real‑time chat.

---

## Phase 5 – Public Profile Integration

Goal: Show an organization’s public job postings on its profile.

- API
  - Extend `/api/job-board` to accept `organization_id` and/or `created_by` to list that profile’s postings.

- UI
  - Add a “Jobs” tab in `ArtistPublicProfileView` and venue/org profile to render postings; link to `/jobs/[templateId]`.

Deliverable: Public profiles display current openings.

---

## Phase 6 – Analytics, Moderation, and Safety

- Tracking
  - Ensure view counts and application counts increment atomically.
  - Add simple rate limiting on apply endpoints (/api/job-applications) to avoid spam.

- Moderation
  - Simple profanity checks/client‑side filters on descriptions.
  - Server‑side validation (Zod) already present for create flows.

---

## Phase 7 – QA, Tests, and Rollout

- Unit tests
  - Services: posting, board creation, application creation, candidate creation, onboarding completion, crew assignment.

- Integration tests
  - Public jobs tab → detail → apply → admin approve → onboarding → crew visible.

- E2E smoke
  - Post 3 roles; apply with 2 accounts; approve 1; confirm onboarding and crew presence; send a team message.

- Rollout
  - Feature flag: enable public “Staffing” tab after DB verified.
  - Rollback path: hide tab; internal flows still work.

---

## API and Data Contracts (concise)

- POST internal template: `AdminOnboardingStaffService.createJobPosting(venueId, data)`
  - Now saves `status='published'` when invoked from dashboard create.

- POST board posting: `JobBoardService.createJobPosting(venueId, data, organizationData, templateId)`
  - Writes to `job_board_postings` and `organization_job_postings` with `template_id`.

- GET job board: `/api/job-board`
  - Query params: `location, department, employment_type, experience_level, remote, urgent, limit, offset, organization_id, created_by`
  - Returns array; each item includes `template_id` for deep link.

- GET job detail: `/api/job-postings/[templateId]`
  - Returns internal template with form config.

- POST application: `/api/job-applications`
  - Body: `{ job_posting_id, form_responses }`
  - Creates `job_applications`, increments `applications_count`.

---

## Risks & Mitigations

- RLS lockouts
  - Policies simplified to `created_by = auth.uid()` for write; expand later with `user_venues` if vendor delegation needed.

- Data mismatch (board vs template)
  - `template_id` bridges public → internal details.

- Volume/performance
  - Indexes in place; paginate public board; avoid N+1 in profile tabs.

---

## Definition of Done

- Admin can post; listing appears on public “Staffing” tab and admin profile.
- Public users can open detail and apply; application appears in Staff Management.
- Admin approves; candidate created and onboarding starts; completing onboarding creates `staff_members` and assigns to crew.
- Crew can be messaged as a group via team comms.
- Tests: unit + integration green; UX verified on mobile and desktop.

---

## Task Checklist (execution order)

1) Publish templates by default for dashboard create (internal status)
2) Add `template_id` to board postings; wire service to set it
3) Add “Staffing” tab to `app/jobs/page.tsx` (fetch `/api/job-board`); link via `template_id`
4) Extend `/api/job-board` filters (`organization_id`, `created_by`)
5) Add candidate creation on approve; surface actions in Staff dashboard
6) On onboarding complete: create crew assignment (`staff_shifts.job_posting_id`)
7) Auto‑create team comms thread on approval/onboarding
8) Add profile “Jobs” tab to render org postings
9) Tests and rollout


---

## Robust Onboarding and Management System (Vision & Specs)

### Core Principles
- Streamline with smart defaults and single-link onboarding
- Operate at scale with bulk actions and virtualized UIs
- Reliability via RLS, audit logs, idempotent actions
- Explainability: clear blockers and remediation steps

### Onboarding (High-Scale)
- Role templates and dynamic forms with Zod validation and versioning
- Single-link onboarding (magic links), resume anywhere, autosave drafts
- Compliance gates: certifications upload, expiration tracking, age/license checks
- SLA timers with automated reminders (email/SMS) per step
- Bulk invite, bulk approve/reject, CSV import with mapping and validation reports
- Auto-screening: completeness, certs, age, availability, simple heuristic scoring
- Audit log for approvals/rejections and field changes

### Staff Management
- Assignment & shift planning: calendar/list/Kanban, drag-and-drop, conflicts detection
- Zones/roles per event; coverage indicators; smart suggestions by skill/cert
- Availability intake, check-in/out (QR), optional geo-fencing; late/no-show flags
- Performance dashboard: attendance, incidents, commendations, ratings, cert status
- Team comms: broadcast threads now; optional real-time channels later
- Bulk tools: mass assign/unassign, smart fill, batch export/printable rosters

### Admin UX
- Command Center: pipeline (Applied→Approved→Onboarding→Ready), shift planner, coverage heat map, alerts
- Virtualized tables with server-side filters; saved views; keyboard-first palette
- Mobile-first crew flows: minimal fields first, doc scanner helpers

### Data Model Extensions
- job_board_postings.template_id UUID (already planned)
- staff_shifts.job_posting_id UUID (crew attachment)
- staff_documents (owner_id, type, file_url, verified_status, expires_at)
- chat_channels, chat_memberships (optional)
- audit_log (actor, action, entity_type, entity_id, metadata, at)

### Reliability & Performance
- next-safe-action + Zod; idempotency keys; retries with backoff
- Real-time scoped to rooms; debounced UI updates
- Composite indexes on status, venue_id, role, shift_date; pagination everywhere
- Rate limits for apply/remind; captcha for public apply (optional)
- Edge Functions/cron for reminders and expirations

### Integrations & Notifications
- Email (Resend) & SMS (Twilio) for invites, reminders, shifts
- ICS exports; optional Google Calendar sync
- Webhooks to payroll/HR (future)

### KPIs
- Time-to-onboard, completion % before deadline
- Coverage achieved vs required
- No-show/late rates
- Application→hire conversion
- Admin actions saved (automation efficacy)

