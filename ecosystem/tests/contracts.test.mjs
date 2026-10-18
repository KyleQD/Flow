import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContract, assertContract, schemaFor } from '../src/contracts.mjs';
import { projectTrustedPublication, publicView } from '../src/projection.mjs';

const id = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const third = '33333333-3333-4333-8333-333333333333';
const event = (revision=1,status='public') => ({
  event_id:id, source_product:'tourify', revision,status,
  updated_at:'2026-10-17T23:00:00Z',title:'Example show',
  starts_at:'2026-12-01T20:00:00Z',ends_at:'2026-12-01T22:00:00Z',
  venue:{venue_id:other,name:'Example venue',city:'Las Vegas',country:'US'},
  public_url:'https://example.org/shows/1'
});

test('schemas load and deny undeclared fields', () => {
  assert.equal(schemaFor('event-publication').additionalProperties,false);
  assert.equal(validateContract('event-publication',{...event(),service_role:'secret'}).ok,false);
  assert.throws(()=>schemaFor('../secrets'),/Unknown contract/);
});
test('public event validates', () => assert.equal(validateContract('event-publication',event()).ok,true));
test('wrong producer and untrusted nested private fields rejected', () => {
  assert.equal(validateContract('event-publication',{...event(),source_product:'bzar'}).ok,false);
  assert.equal(validateContract('event-publication',{...event(),venue:{...event().venue,staff_phone:'555'}}).ok,false);
});
test('invalid UUID, timestamp and revision rejected', () => {
  assert.equal(validateContract('event-publication',{...event(),event_id:'fake'}).ok,false);
  assert.equal(validateContract('event-publication',{...event(),revision:0}).ok,false);
  assert.equal(validateContract('event-publication',{...event(),updated_at:'yesterday'}).ok,false);
});
test('identity context cannot embed user-editable authority claims', () => {
  const context={principal_id:id,issuer:'https://issuer.example.test',audience:'ecosystem',source_auth_ref:other,verified_at:'2026-10-17T23:00:00Z'};
  assert.equal(validateContract('identity-context',context).ok,true);
  assert.equal(validateContract('identity-context',{...context,user_metadata:{admin:true}}).ok,false);
});
test('entitlement requires server-controlled product, capability and scoped grant', () => {
  const grant={principal_id:id,product_id:'werk',capability:'jobs.post',scope_type:'organization',scope_id:other,grant_id:third,status:'active',issued_at:'2026-10-17T23:00:00Z'};
  assert.equal(validateContract('entitlement',grant).ok,true);
  assert.equal(validateContract('entitlement',{...grant,product_id:'fake'}).ok,false);
});
test('publish duplicate ignores same version', () => {
 const first=projectTrustedPublication(null,event());
 assert.equal(first.effect,'published'); assert.equal(publicView(first.state).title,'Example show');
 const repeat=projectTrustedPublication(first.state,event());
 assert.equal(repeat.effect,'duplicate-ignored');
});
test('reject conflicting revision, keep newer', () => {
 const first=projectTrustedPublication(null,event());
 assert.throws(()=>projectTrustedPublication(first.state,{...event(),title:'Changed at same rev'}),/Conflicting/);
 const next=projectTrustedPublication(first.state,event(2));
 assert.equal(projectTrustedPublication(next.state,event(1)).effect,'stale-ignored');
});
test('unpublication creates durable tombstone and prevents stale resurrection', () => {
 const first=projectTrustedPublication(null,event(1));
 const removed=projectTrustedPublication(first.state,{event_id:id,source_product:'tourify',revision:2,status:'unpublished',updated_at:'2026-10-17T23:02:00Z'});
 assert.equal(removed.effect,'retracted');assert.equal(publicView(removed.state),null);
 assert.equal(projectTrustedPublication(removed.state,event(1)).effect,'stale-ignored');
});
test('unsafe public URL and schedule fail', () => {
 assert.throws(()=>projectTrustedPublication(null,{...event(),public_url:'http://example.org'}),/HTTPS/);
 assert.throws(()=>projectTrustedPublication(null,{...event(),ends_at:'2026-12-01T19:00:00Z'}),/schedule/);
});
test('unknown privileges or out of scope schema key fail closed', () => {
 assert.throws(()=>assertContract('entitlement',{bad:true}),/Invalid/);
 assert.equal(validateContract('listing-reference',{listing_id:id,source_product:'tourify',seller_id:other,revision:1,title:'Test',state:'published',seller_mode:'quote'}).ok,true);
});
