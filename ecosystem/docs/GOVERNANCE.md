# Flow council, execution and authority

**Constitution**: protect user data and creators; make truthful capability claims; preserve existing production; maintain provenance and reversibility; enforce clear product ownership; require auditable reasoning and human approval for irreversible changes.

## Roles
- Flow architect: owns inter-product contracts and decision register.
- Identity/security reviewer: authority on authentication and tenant isolation.
- Product leads: Tourify, Heat, Werk, Bzar, DreamStream, 54, Prez, Flow/Pro each own domain code and acceptance.
- Data steward: migration safety, backups, canonical ownership.
- Release captain: CI provenance, runtime parity, staged releases, rollback drills.
- QA reviewer: cross-product personas and regression evidence.
- Human owner: final decisions for major architecture, identity changes, production credentials, release promotion, financial operations and resource spend.

## Agent task protocol
Task ID → lease → bounded files and base SHA → implementation plan → isolated branch → tests → diff review → specialist signoff → handoff log. No agent may merge, deploy, alter DNS, provision paid resources, or mutate production data without explicit approval. Update a task-specific progress and next-step document after each iteration.

## Change states
PROPOSED → APPROVED_FOR_NONPROD → IMPLEMENTED_IN_BRANCH → TESTED → REVIEWED → APPROVED_FOR_RELEASE → RELEASED_VERIFIED.
Unknown/blocked = not approved. Agents cannot self-certify production readiness.

## Early ADR queue
ADR-101 hybrid repo architecture, ADR-102 authoritative identity issuer and bridge, ADR-103 contract versioning, ADR-104 data ownership, ADR-105 releases, ADR-106 Heat stack preservation, ADR-107 entitlements, ADR-108 cutover/rollback.
