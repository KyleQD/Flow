import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const cap=read('../registry/capabilities.json');
const products=read('../registry/products.json').products;
test('each product has precisely one capability registry entry',()=>{
 const ids=cap.products.map(x=>x.app_id);
 assert.equal(new Set(ids).size,products.length);
 assert.deepEqual(new Set(ids),new Set(products.map(x=>x.id)));
});
test('registry is not authorization source, and defaults deny',()=>{
 assert.equal(cap.status,'DRAFT_NOT_AUTHORIZATION_SOURCE');
 assert.equal(cap.default_policy,'DENY');
 for (const x of cap.products) {
  assert.notEqual(x.status,'production');
  assert.ok(x.capabilities.length>0);
  assert.equal(new Set(x.capabilities).size,x.capabilities.length);
  for (const capability of x.capabilities) assert.match(capability,/^[a-z][a-z0-9_.:-]+$/);
 }
});
