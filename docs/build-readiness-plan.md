## Build Readiness Plan (Tourify)

Audience: Engineering
Purpose: Deliver a reliable `npm run build` by end of day without quick hacks; preserve platform integrity and future maintainability.

### Objectives
- Ensure a clean, reproducible Next.js 15 build (App Router)
- Avoid masking issues with band-aids; document and fix root causes
- Keep SSR/RSC boundaries correct; honor client/server contexts
- Maintain security around service-role usage; avoid Edge runtime pitfalls

### Constraints & Non-Goals
- Do not reset the database (explicit constraint)
- Preserve existing UX and URL contracts where already public
- Minimize disruption to ongoing feature work

---

## High-Risk Items – Inventory and Strategy

1) Node runtime required for specific API routes
- Context: Routes using `Buffer`, Supabase Storage, or Service Role must run on Node, not Edge.
- Files (confirmed):
  - `app/api/portfolio/upload/route.ts`
  - `app/api/upload-profile-image/route.ts`
- Strategy:
  - Annotate these routes with `export const runtime = 'nodejs'`
  - Validate in Next build output (check route chunks labeled as node)
  - Add unit smoke tests that verify `process.versions.node` is defined inside handlers
- Acceptance Criteria:
  - No Edge runtime errors; storage uploads succeed locally and in staging

2) Environment variables (build/run time)
- Context: Many server routes use `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL`.
- Strategy:
  - Create `.env.example` with required keys
  - Update deployment secrets (CI/CD) with non-prod service keys; prod uses managed secrets
  - Add startup validation util (development-only) to warn on missing env
- Acceptance Criteria:
  - `npm run build` passes in CI with injected secrets
  - `npm start` warns (dev) if critical envs are missing

3) Public profile routing consistency (username vs slug/ID)
- Context: We introduced `/venue/[username]` and already have `/artist/[username]`. Legacy `/venues/[slug]` exists.
- Strategy:
  - Source of truth for public venue profile is `/venue/[username]`
  - Keep legacy `/venues/[slug]` for backward-compat for now; add a 301 redirect to `/venue/[username]` when mapping is possible; otherwise show soft notice
  - Phase out hard-coded `/venues/...` links where actionable context includes username
- Acceptance Criteria:
  - All UI-driven links point to `/venue/[username]` and `/artist/[username]`
  - Legacy pages either redirect or remain isolated (no new links to them)

4) Mock vs live data surfaces
- Context: Some venue sections (specs/amenities/events) still show mock data if live data absent.
- Strategy:
  - Define a feature flag: `FEATURE_PORTFOLIO_MOCKS=false` (default)
  - Replace mocks with guarded renders that show "Coming soon" or read from tables when available
  - Document data contracts for: `portfolio_items`, `profile_experiences`, `profile_certifications`
- Acceptance Criteria:
  - No mock-only hard dependencies at render time
  - Profiles render gracefully with real or empty states

5) Undefined imports & browser globals
- Context: TikTok icon ReferenceError found and fixed; potential similar cases exist
- Strategy:
  - Code audit: search for unknown globals (`TikTok`, `FB`, etc.) and replace with safe fallbacks
  - Ensure all `window.*` usages are inside client components or guarded by `typeof window !== 'undefined'`
- Acceptance Criteria:
  - Zero ReferenceErrors in client runtime for social components

6) Migrations & schema
- Context: New migrations add fields/tables/policies (profiles expansion, portfolio, experiences, certifications, indexes)
- Strategy:
  - Run migrations in staging; confirm policies allow owner-only writes and public reads per spec
  - Add a lightweight schema check script to report missing columns/policies (non-destructive)
- Acceptance Criteria:
  - All APIs relying on new tables pass basic CRUD smoke tests in staging environment

7) CI/CD & Build Signals
- Context: `next.config.mjs` currently ignores ESLint/TS build errors (ok short-term)
- Strategy:
  - Keep ignore flags for today’s build; track a follow-up task to re-enable stricter checks gradually
  - Add `npm run build` in CI; cache `.next` appropriately
- Acceptance Criteria:
  - CI passes build step reliably; artifacts deploy to preview/staging

---

## Execution Plan (Step-by-Step)

Step 1 — Runtime Hardening for Upload Routes
- Annotate Node runtime:
  - `app/api/portfolio/upload/route.ts` → `export const runtime = 'nodejs'`
  - `app/api/upload-profile-image/route.ts` → `export const runtime = 'nodejs'`
- Add quick smoke tests (or manual cURL) to confirm uploads
- Risk: None; low change-surface

Step 2 — Env Inventory & Developer Ergonomics
- Add `.env.example` with:
  - `NEXT_PUBLIC_SUPABASE_URL=`
  - `SUPABASE_SERVICE_ROLE_KEY=`
  - `NEXT_PUBLIC_SITE_URL=` (optional)
- Add dev-only startup check (logs warning, no crash)
- CI: ensure secrets exist in pipeline
- Risk: None if handled carefully

Step 3 — Routing Consolidation
- Replace remaining `/venues/...` links where username is known:
  - `app/venue/page.tsx` (change only when username is available; otherwise leave)
  - Command search mocks can remain as dev data, but prepare real mapping
- Optional: Add a redirect rule (later) once slug→username map exists
- Risk: Broken links if username not available; mitigate by conditional rendering

Step 4 — Live Data Rendering (No Mocks)
- Components:
  - Venue: render gallery/images from `portfolio_items`; show empty states otherwise
  - Artist: already accepts arrays; verify empty rendering
- Add TODO backlog for venue specifications/events real source (out of scope for today’s build reliability)
- Risk: None; only improves robustness

Step 5 — Undefined Imports & Browser Globals Audit
- Grep pass for suspicious tokens (e.g., `TikTok`, `FB`, `TwitterWidget`)
- Any undefined symbol → replace with `ExternalLink` or guard behind existence checks
- Guard any remaining `window.` in components that might be server-rendered with `typeof window !== 'undefined'`
- Risk: Over-guarding; keep minimal and correct

Step 6 — Migrations & Policies Verification
- Apply new migrations in staging
- Verify RLS policies allow:
  - `skill_endorsements`: public read, endorser insert/delete
  - `portfolio_items`: public read when `is_public` or owner; owner full write
  - `profile_experiences`: public read when visible; owner full write
  - `profile_certifications`: public read when public; owner full write
- Smoke test APIs:
  - `/api/settings/portfolio` CRUD
  - `/api/settings/experience` CRUD
  - `/api/settings/certifications` CRUD
  - `/api/skills/endorse` POST/DELETE
- Risk: None; non-destructive changes already applied

Step 7 — CI Build & Release Pipeline
- Ensure `npm run build` is in pipeline
- Configure Node 18+ / 20+ environment (match Next recommendation)
- Cache `.next/cache` for faster builds
- Risk: Pipeline environment mismatch; verify Node version

---

## Acceptance Criteria Checklist
- [ ] Upload/storage routes run on Node runtime; uploads succeed in staging
- [ ] Required env vars documented and present in CI/staging
- [ ] Public links use username-based routes; legacy routes are not linked from new UI
- [ ] Profiles render without mock dependencies; empty states are handled
- [ ] No ReferenceErrors from undefined icons/globals in social components
- [ ] Migrations applied; RLS verified; CRUD APIs pass smoke tests
- [ ] CI builds succeed reliably with `npm run build`

---

## Build Verification Playbook
1) Local
   - `npm ci && npm run build && npm start`
   - Verify:
     - Artist `/artist/{username}` renders with top skills (endorsement counts), portfolio, experiences, certs
     - Venue `/venue/{username}` renders with gallery and public sections
     - Settings tabs save and reflect changes on public profile
2) Staging
   - Apply migrations
   - Seed minimal data for a test user; test image/video uploads
   - Confirm no 500s in logs for missing env

---

## Risks & Mitigations
- Edge vs Node execution:
  - Mitigate via explicit `runtime = 'nodejs'` annotations and validation
- Env drift between dev/staging/prod:
  - Mitigate via `.env.example`, CI secret management, and startup warnings
- Link rot from legacy paths:
  - Keep legacy pages; add future redirect plan post-username migration

---

## Follow-Ups (Post-Build Hardening)
- Re-enable ESLint/TypeScript enforcement gradually (remove `ignoreDuringBuilds` / `ignoreBuildErrors`)
- Add integration tests for profile CRUD and uploads
- Add redirects or canonicalization for legacy venue slug routes

---

## Appendix: Notable Files
- Runtime-sensitive APIs:
  - `app/api/portfolio/upload/route.ts`
  - `app/api/upload-profile-image/route.ts`
- Public profile pages:
  - `app/profile/[username]/page.tsx`
  - `app/artist/[username]/page.tsx`
  - `app/venue/[username]/page.tsx`
- Public profile APIs:
  - `app/api/profile/[username]/route.ts`
  - `app/api/artist/[artistName]/route.ts`
- Settings components:
  - `components/settings/*-settings.tsx`
- Data tables (migrations):
  - `supabase/migrations/2025081910*.sql`


