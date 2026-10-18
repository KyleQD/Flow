import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const data = path => JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const productRegistry=data('../registry/products.json');
const contracts=data('../registry/contracts.json');
const ownership=data('../registry/data-ownership.json');
test('every application has a nonproduction bootstrap manifest and documented integrations', () => {
 const ids = new Set(productRegistry.products.map(x=>x.id));
 const declared = new Set(contracts.contracts.map(x=>x.id));
 for (const id of ids) {
   if (id === 'tourify') continue; // Tourify is an independently managed existing product; no bootstrap duplicate.
   const m=data('../apps/'+id+'/manifest.json');
   assert.equal(m.app_id,id);
   assert.equal(m.production_ready,false);
   assert.equal(m.database,'NOT_PROVISIONED');
   assert.equal(m.authentication,'NOT_IMPLEMENTED_PENDING_IDENTITY_ADR');
   for (const contract of m.required_draft_contracts) assert.ok(declared.has(contract),id+': unknown '+contract);
 }
});
test('each domain has exactly one temporary authority and no unauthorized writers', () => {
 const domains = ownership.owners.map(x=>x.domain);
 assert.equal(new Set(domains).size,domains.length);
 for (const owner of ownership.owners) {
   assert.ok(productRegistry.products.some(x=>x.id===owner.owner));
   assert.match(owner.writerPolicy, /.+/);
 }
});
test('Heat stays independently owned; Tourify existing production is not re-provisioned', () => {
 const heat = data('../apps/heat/manifest.json');
 assert.equal(heat.canonical_codebase,'KyleQD/heat');
 assert.match(heat.proposed_runtime,/PostGIS/);
 assert.equal(productRegistry.products.find(x=>x.id==='tourify').repo,'KyleQD/Tourify');
});
