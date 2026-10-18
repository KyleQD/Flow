// Server-side gate contract. Requires trusted adapters; NOT an authentication implementation.
// Never expose gate construction to browser code or treat user metadata as privileges.
import { assertContract } from './contracts.mjs';

const DENIED = Object.freeze({ allowed:false, reason:'forbidden' });
export function createAuthorizationGate({verifySession,loadGrants,expectedIssuer,expectedAudience,now=()=>new Date()}={}) {
  if (typeof verifySession !== 'function' || typeof loadGrants !== 'function') throw new TypeError('Trusted verifier and membership resolver required');
  if (!expectedIssuer || !expectedAudience) throw new TypeError('Issuer and audience are mandatory');
  return async function authorizeRequest({authorization,product_id,scope_type,scope_id,capability}={}) {
    if (typeof authorization !== 'string' || authorization.length > 8192) return DENIED;
    const token = /^Bearer ([^\s]+)$/.exec(authorization)?.[1];
    if (!token || !product_id || !scope_type || !scope_id || !capability) return DENIED;
    try {
      // Adapter MUST validate signature, expiry, issuer, audience, session status/revocation.
      const principal = await verifySession(token);
      if (!principal || typeof principal.principal_id !== 'string' || principal.issuer !== expectedIssuer ||
          principal.audience !== expectedAudience || typeof principal.expires_at !== 'string' ||
          !Number.isFinite(Date.parse(principal.expires_at)) || Date.parse(principal.expires_at) <= now().getTime()) return DENIED;
      const grants = await loadGrants(principal.principal_id);
      if (!Array.isArray(grants)) return DENIED;
      for (const grant of grants) {
        assertContract('entitlement',grant);
        if (grant.principal_id !== principal.principal_id || grant.status !== 'active') continue;
        if (grant.product_id !== product_id || grant.scope_type !== scope_type ||
            grant.scope_id !== scope_id || grant.capability !== capability) continue;
        if (grant.expires_at && Date.parse(grant.expires_at) <= now().getTime()) continue;
        return {allowed:true,principal_id:principal.principal_id,grant_id:grant.grant_id};
      }
      return DENIED;
    } catch {
      return DENIED; // Verifier/membership failures deny access; never grant on degraded backend.
    }
  };
}
