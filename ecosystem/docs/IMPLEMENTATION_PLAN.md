# Flow Foundation F0 → F4: engineering execution

## Scope of this change
Bootstraps versioned contracts, a product/data registry, and offline validation. It does **not** implement authentication, deploy backends, publish live events, read production data, or alter production repositories.

## F0 — Governance and executable shared boundaries (this branch)
Owner: Flow architecture. Evidence: registry validation, syntactic checks and deterministic contract tests. Gate: review legacy Flow app vs new foundation, approve product owners and record-protection classification.

## F1 — Identity verification bridge (not yet authorized)
Owner: identity/security. Determine the actual Tourify production Auth authority; preserve Supabase Auth subjects; choose token verifier consistent with issuer signing algorithm and audience; include replay-resistant B2B identity; tenant permissions resolved server-side. No client-asserted capabilities. Gate: audited subject mapping, authorization matrix, revocation and MFA design.

## F2 — Public event publication Tourify → Heat (not yet implemented)
Owner: Tourify + Heat integration. Source transaction writes outbox; signed/versioned transport with idempotency, event revision and tombstones; Heat ingests sanitized public projection; no staff/PII/payment data. Gate: publication/unpublication, duplicate/out-of-order replay, authorization, security review, rollback.

## F3 — Independently owned app shells
Werk: hiring/progression; Bzar: commerce/ledger; DreamStream: media rights/streaming; 54: venue operational inventory; Prez: press outreach; Flow: universal shell; Flow Pro: gated cross-product facade. New repos/deploys only after owner approval, environment isolation, contracts and service-level runbooks.

## F4 — Production readiness
Per-product: threat model, tenant isolation tests, non-prod database and backups, CI checks, monitoring, budget alerts, rate limits, auditability, SLO/error budgets, restore drill and go/no-go review.

## Human approval gates
No credentials, domain/DNS moves, production deployments, schema migrations, user data transfers, financial writes, new paid infrastructure or service ownership cutovers without explicit approval. Nothing in this folder confers permission to provision or deploy.

## Starting backlog
1. F-001 approve repo strategy (hybrid, preserve Tourify and Heat).
2. F-002 approve ownership ledger; mark each contested domain and current writer.
3. F-003 inspect actual production Auth issuer; design identity bridge.
4. F-004 adopt JSON-schema validation across consumer languages.
5. F-005 implement Tourify public-event outbox in isolated staging PR.
6. F-006 implement Heat sanitized projection ingestion in its own PR.
7. F-007 design worker/marketplace/venue/media/press bounded data models.
8. F-008 provision nonprod-only infrastructure after security approval.
9. F-009 require CI security and contract compatibility checks.
10. F-010 review observability and scalability thresholds per product.
