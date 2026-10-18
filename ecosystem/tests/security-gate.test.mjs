import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthorizationGate } from '../src/security-gate.mjs';

const principal_id='11111111-1111-4111-8111-111111111111';
const scope_id='22222222-2222-4222-8222-222222222222';
const grant_id='33333333-3333-4333-8333-333333333333';
const now=()=>new Date('2026-10-17T12:00:00Z');
const expectedIssuer='https://auth.example.test', expectedAudience='flow-services';
const session={principal_id,issuer:expectedIssuer,audience:expectedAudience,expires_at:'2026-10-18T12:00:00Z'};
const grant={principal_id,product_id:'werk',capability:'jobs.post',scope_type:'organization',scope_id,grant_id,status:'active',issued_at:'2026-10-01T00:00:00Z'};
const request={authorization:'Bearer test.valid.mock',product_id:'werk',scope_type:'organization',scope_id,capability:'jobs.post'};
const gate=(override={})=>createAuthorizationGate({
 verifySession:async()=>session,loadGrants:async()=>[grant],expectedIssuer,expectedAudience,now,...override
});

test('requires explicit trusted verification adapters',()=>{
 assert.throws(()=>createAuthorizationGate({}),/Trusted verifier/);
 assert.throws(()=>createAuthorizationGate({verifySession:async()=>session,loadGrants:async()=>[grant]}),/Issuer/);
});
test('valid mock session with scoped grant is admitted (mock test only)',async()=>{
 assert.deepEqual(await gate()(request),{allowed:true,principal_id,grant_id});
});
test('missing or malformed token denied',async()=>{
 assert.equal((await gate()({...request,authorization:''})).allowed,false);
 assert.equal((await gate()({...request,authorization:'Basic abc'})).allowed,false);
});
test('wrong issuer, audience or expired session denied',async()=>{
 for (const s of [{...session,issuer:'https://attacker.invalid'},{...session,audience:'wrong'},{...session,expires_at:'2026-10-16T12:00:00Z'}]) {
  assert.equal((await gate({verifySession:async()=>s})(request)).allowed,false);
 }
});
test('client metadata and role fields do not grant privileges',async()=>{
 const forged={...request,user_metadata:{admin:true},role:'admin',capability:'payments.refund'};
 assert.equal((await gate()(forged)).allowed,false);
});
test('wrong tenant or product denied',async()=>{
 assert.equal((await gate()({...request,scope_id:'44444444-4444-4444-8444-444444444444'})).allowed,false);
 assert.equal((await gate()({...request,product_id:'bzar'})).allowed,false);
});
test('revoked or expired grants denied',async()=>{
 assert.equal((await gate({loadGrants:async()=>[{...grant,status:'revoked'}]})(request)).allowed,false);
 assert.equal((await gate({loadGrants:async()=>[{...grant,expires_at:'2026-10-16T12:00:00Z'}]})(request)).allowed,false);
});
test('resolver failure is fail-closed',async()=>{
 assert.equal((await gate({verifySession:async()=>{throw Error('Auth unavailable')}})(request)).allowed,false);
 assert.equal((await gate({loadGrants:async()=>{throw Error('DB unavailable')}})(request)).allowed,false);
});
test('missing critical grant data fails closed',async()=>{
 assert.equal((await gate({loadGrants:async()=>[{...grant,grant_id:null}]})(request)).allowed,false);
});
