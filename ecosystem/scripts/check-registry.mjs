import { readFileSync, existsSync } from 'node:fs';
const base = new URL('../', import.meta.url);
const get = path => JSON.parse(readFileSync(new URL(path,base),'utf8'));
const products = get('registry/products.json').products;
const contracts = get('registry/contracts.json').contracts;
const owners = get('registry/data-ownership.json').owners;
const ids = new Set(products.map(p=>p.id));
const fail = msg => { throw new Error('Registry invalid: ' + msg); };
if (ids.size !== 9 || products.length !== 9) fail('all nine unique applications required');
for (const id of ['flow','flow-pro','tourify','heat','werk','bzar','dreamstream','54','prez']) if (!ids.has(id)) fail('missing ' + id);
if (new Set(contracts.map(c=>c.id)).size !== contracts.length) fail('contract identifier collision');
for (const c of contracts) {
  if (!existsSync(new URL(c.path,base))) fail('missing contract ' + c.path);
  const schema = get(c.path);
  if (!schema.$schema?.includes('2020-12') || schema.additionalProperties !== false) fail('invalid schema envelope '+c.id);
  for (const product of c.consumers) if (product !== 'all' && !ids.has(product)) fail('unknown consumer ' + product);
  if (!['all','identity-bridge'].includes(c.publisher) && !ids.has(c.publisher)) fail('unknown publisher');
}
if (new Set(owners.map(x=>x.domain)).size !== owners.length) fail('ownership collision');
for (const o of owners) {
 if (!ids.has(o.owner)) fail('owner not found '+o.owner);
 if (o.transferTo !== null && !ids.has(o.transferTo)) fail('invalid target '+o.transferTo);
 if (!o.writerPolicy || !o.phase) fail('incomplete ownership');
}
for (const p of products) if (!p.role || !p.state || !p.authority || !Array.isArray(p.owns)) fail('incomplete product '+p.id);
console.log('OK: nine products; '+contracts.length+' draft contracts; '+owners.length+' provisional data ownership entries.');
