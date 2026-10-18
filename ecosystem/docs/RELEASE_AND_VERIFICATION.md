# Foundation release gates

## This branch
- No Vercel project, Supabase project, domain, credential, auth secret or production migration is created.
- This package contains offline schemas, validators, local synthetic tests and product manifests.
- Root-level Flow legacy app remains unchanged; no automatic deployment is configured for this folder.

## Prior to PR approval
1. `cd ecosystem && npm run check && npm test` under Node 24.
2. Review project ownership ledger and any cross-app role/tenant boundary.
3. Review JSON Schema standard compatibility: current bundled validator supports only subset of keywords; use standards-compliant validator before exposing wire API.
4. Verify CI runs successfully without credentials and without deploying.
5. Review branch diff; ensure no production configuration or private data is present.

## Before any future integration release
- Authoritative production Auth and DB mapping positively established.
- Zero unapproved elevated database grants and client-readable secrets.
- Each producing service uses transactional outbox and scoped keys; no direct cross-database writes.
- Consumer verifies signed request/JWT using approved issuer, audience, expiry and key rotation.
- Replay, duplicate, out-of-order, publish/unpublish, tenant isolation and malicious fields tested.
- Staging release verified against synthetic data; rollback and backup restoration rehearsed.
- Named human approves prod release.

## Accepted F0 deliverables
- Nine-product registry and eight bootstrap manifests (Tourify remains external).
- Eight draft contract schemas and an offline validator.
- Idempotent event projection demonstration with tombstone retention.
- Data ownership ledger and governance/onboarding runbooks.
- Contract and registry tests and a restricted-scope CI proposal.
