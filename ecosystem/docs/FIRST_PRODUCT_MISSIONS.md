# First product engineering missions — after F0 review

**These missions are NOT automatically authorized for database, domain, billing or production writes.** Use bounded branches, tests and human review.

| Mission | Lead | Work scope | Evidence required | Blocks |
|---|---|---|---|---|
| FLOW-101 | Flow architect | Audit legacy `KyleQD/Flow`; map reusable UI vs forked Tourify logic | file-level source map, preserve/rewrite ADR | new Flow production app |
| FLOW-102 | Identity/security | Identify production Supabase Auth issuer, subject namespace, signing mode, memberships | verified infrastructure mapping, threat model, auth tests | shared login |
| PRO-101 | Flow Pro | Define subscription entitlement facade without duplicate product records | capability mapping, role/tenant security matrix | paid cross-product access |
| HEAT-101 | Heat+Tourify | Source-to-Heat event-publication adapter design and synthetic replay | schema tests, retraction, idempotency, out-of-order handling | live event syncing |
| WERK-101 | Workforce | Define job/role/credential aggregate ownership and read compatibility facade | data ownership map, request/response contracts, worker privacy tests | Werk API + database |
| BZAR-101 | Commerce | Define listing/order/payment ledger authority, idempotency and refund boundaries | payments threat model, ledger policy, integration tests | Bzar checkout |
| DREAM-101 | Media | Audit existing DreamStream Vercel prototype and source; define rights/asset boundaries | repo provenance, license/creator consent matrix, storage policy | media publishing |
| VEN54-101 | Venue | Inventory Tourify venue resources and identify extraction candidate | compatibility plan, entity mapping, scheduling conflict test | 54 operations |
| PREZ-101 | Press | Design journalist relationships, embargoes and approved asset publication | consent/embargo tests, data retention policy | Prez outreach |
| FLOW-OPS-101 | Release/SRE | Create nonprod infrastructure and CI/CD standards per product (proposal only) | environment matrix, spend estimates, rollback/restore checklist | deployment |

## Mandatory work-order handoff
For each mission record: scope and paths, current SHA, decisions needed, data sensitivity, automated tests, measured pass/fail, reviewer, next steps and links. Deliver a specific PR/ADR or evidence report, not an unverified completion statement.

## Cross-app decisions that must be approved before F1
1. Is the foundation retained in `KyleQD/Flow` or extracted to dedicated repository? Legacy code is significant.
2. Authoritative production Auth issuer and current profile/general-account mapping.
3. Financial ledger and legal ownership for Bzar before transferring any commerce writes.
4. Which Tourify workforce/venue records are owned temporarily vs extracted to Werk and 54.
5. Whether DreamStream should retain its current Vercel prototype, be rebuilt, or be archived.
6. Whether each service needs separate Postgres schemas, databases, regions, or merely logical boundaries.
7. Single delivery trigger for each future deployment; no duplicate Vercel workflows.
