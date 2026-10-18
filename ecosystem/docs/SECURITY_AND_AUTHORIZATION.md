# Security boundary — F0 (NON-PRODUCTION)
*Authentication is NOT implemented by this scaffold.* Parsing a valid JSON payload is not proof of trusted origin, tenant authorization or rights to publish.

## Rules
1. Verify caller identity and issuer-side token signature/expiration/audience using current documented platform APIs. Never trust client-supplied `principal_id`, `capabilities`, admin flags or `user_metadata`.
2. Resolve roles and entitlements server-side from verified memberships and audited grants; enforce per-tenant isolation and least privilege in APIs and database policies.
3. Do not put Supabase `service_role`/secret keys or unrestricted SQL on client devices or in another product's integration adapter. Cross-product access must use a limited authenticated API.
4. Every public projection must explicitly whitelist approved fields. No crew lists, private email, home addresses, unpublished times, payment ledger, privileged functions or storage tokens.
5. Contract `event-publication` must be used **only after** trusted service transport verification, source authorization and user publication consent. Pure projection tests are a simulation, not an ingest endpoint.
6. Production source and Auth DB are currently unresolved. Do not centralize identity, migrate users, copy data or create SSO endpoints before mapping the true production issuer and user IDs.
7. No uncontrolled CI secret scope. No production Vercel projects, endpoints, webhook listeners, or Supabase resources should be attached to this branch.
8. Before integrating: threat model + replay protection + idempotency + dead-letter + data deletion propagation + drift audit + scoped service keys + audit trail + revocation.
9. Never enable public RLS changes by copying generic policies; review per-operation ownership and tenant constraints.
10. User approval required for all irreversible changes, migrations, deployments, billing, credentials, domain changes and identity ownership transfers.

## Source guidance
See https://supabase.com/docs/guides/auth/jwts and https://supabase.com/docs/guides/auth/architecture; inspect issuer signing algorithm before choosing JWKS or Auth verification path. See also v1.1 handoff security threat model.
