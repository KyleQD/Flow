# Provisioning policy and infrastructure isolation

The foundation code is currently an isolated GitHub PR. It does NOT establish additional Vercel, Supabase, object storage, mobile stores, queues, payments, or external services.

## Minimum provisioning request (per app)
- Owner and reviewed ADR identifying independent repository, runtime, region and data ownership.
- Non-production account/project and cost cap, named resource approver, deletion/retention plan.
- Authentication issuer mapping and server-side authorization with testable scope policies.
- Separate synthetic fixture data; no live Tourify user, employment, venue, creator or payment records in previews.
- Environment-specific signing/service credentials with rotation plan; none committed to GitHub, npm outputs or CI artifacts.
- Incident contact, logs with PII redaction, metrics, SLO, rate limits, quotas and trace correlation.
- Architecture and interface test results; approved branch/protected releases.
- Backups where persistent data exists; rollback route for API and schema compatibility.
- At least one working example of safe cross-product event retraction and replay.

## Environment ownership guidance
Tourify remains on its existing serving systems until reconciliation. Heat retains independent Fastify/PostGIS+native client. Proposed Werk, Bzar, DreamStream, 54 and Prez are not new Vercel projects or databases until product ADRs and risk assessments pass.

Reference: https://vercel.com/docs/monorepos and https://supabase.com/docs/guides/auth/architecture . Product code is not forced into a single framework; use versioned contracts rather than raw shared database connections.

## Deliverable for provisioning phase
Documented environment matrix with project IDs, domains, Git SHA, service limits, cost ceilings, secret ownership and data owners. Keep secrets **out** of the registry. Production DNS and domain changes require human signoff.
