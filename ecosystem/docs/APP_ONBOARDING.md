# How to onboard an additional Flow application

1. Propose a new product manifest in `registry/products.json` with a unique id, code ownership, and defined scope.
2. Write an ADR recording whether it needs an independent repo, app runtime, database boundary, and deployment lifecycle.
3. Add data-ownership ledger entries; a datum must have one writer during a migration stage, and the old writer must remain until cutover proof.
4. Publish draft versioned API/JSON event contracts in `contracts/v1/`; add fixtures and tests. Contract IDs cannot be repurposed.
5. Security review: verified identity issuer and audience, tenant enforcement, scoped integration credentials, data minimization, storage permissions, consent.
6. Build app in a separate nonproduction code branch/repo. Protect `main`, require tests and reviewed CI.
7. Design nonproduction-only backing services (DB, storage, workers) and isolate credentials; obtain human approval before provisioning.
8. Implement test-only end-to-end scenarios, audit trails, metrics and rollbacks.
9. Deploy to isolated staging only after approval, validate SLO, perform synthetic load and recovery drill.
10. Request explicit promotion signoff and document actual deployment provenance.

## Product-specific responsibilities
- Flow: universal profile shell and aggregated feed, not a copy of legacy Tourify backend.
- Flow Pro: entitlements and orchestration facade, no competing records for paid product modules.
- Werk: roles, applications and progression; temporary read facade to Tourify hiring.
- Bzar: one financial ledger owner; preserve existing orders, payments and dispute lifecycle.
- DreamStream: rights, provenance, streaming pipeline; no implicit republishing.
- 54: venue inventory, resources, scheduling; Tourify remains interim authority.
- Prez: journalist consent, embargoes, media approvals and outreach audit.
- Heat: preserve current Fastify/PostGIS/SwiftUI stack; ingest public event revisions through a controlled adapter.
- Tourify: remain canonical for existing production/tour records until a change-of-ownership ADR.
