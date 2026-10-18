# Flow ecosystem infrastructure — Phase F0 (isolated branch)

**Non-production foundation:** Draft contracts, ownership registries, and tests. No migrations, deployed services, domain assignments, credentials, or identity cutover.

The current `KyleQD/Flow` repository also contains older Tourify-like application code. This new directory is isolated intentionally; it is **not** evidence that the legacy app has become the shared platform.

## Product map
Flow (universal), Flow Pro (cross-product facade), Tourify (production/tours), Heat (map/event discovery), Werk (workforce), Bzar (commerce), DreamStream (media), 54 (venue), Prez (press).

## Run (Node 24 recommended)
```sh
cd ecosystem
npm test
npm run check
```

No dependencies, secrets, or credentials are required. `node --test` tests are offline and use synthetic fixtures.

## F0 gates
- Existing Tourify production and Heat code remain untouched.
- One product owns each record domain for any given migration stage.
- New integrations must verify callers server-side; shared IDs do not grant permissions.
- No cross-product service-role credentials or raw table reads.
- Contract schemas are **DRAFT** and must be approved through ADRs and security review before use.
- No new Vercel projects or Supabase projects are provisioned in this phase.

See `docs/IMPLEMENTATION_PLAN.md` and the v1.1 infrastructure handoff. The repo's root app is not part of this bootstrap package.
