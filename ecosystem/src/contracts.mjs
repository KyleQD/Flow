// Offline draft-contract validator for the schema keywords used in this foundation.
// NOT a general JSON Schema engine. Verify/authenticate at the service boundary.
import { readFileSync } from 'node:fs';
const known = new Set(['domain-event','event-publication','identity-context','entitlement','job-reference','listing-reference','venue-reference','asset-reference']);
const schemaCache = new Map();
export function schemaFor(name) {
  if (!known.has(name)) throw new Error('Unknown contract: ' + name);
  if (!schemaCache.has(name)) {
    const file = new URL('../contracts/v1/' + name + '.schema.json', import.meta.url);
    schemaCache.set(name, JSON.parse(readFileSync(file, 'utf8')));
  }
  return schemaCache.get(name);
}
const isObject = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_TIME = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/;
function check(schema, value, path, errors) {
  if (Object.hasOwn(schema, 'const') && value !== schema.const) errors.push(path + ': const mismatch');
  if (schema.enum && !schema.enum.includes(value)) errors.push(path + ': invalid enum');
  if (schema.type === 'object') {
    if (!isObject(value)) { errors.push(path + ': expected object'); return; }
    for (const key of schema.required || []) if (!Object.hasOwn(value, key)) errors.push(path + '.' + key + ': missing required field');
    if (schema.additionalProperties === false) for (const key of Object.keys(value)) if (!Object.hasOwn(schema.properties || {}, key)) errors.push(path + '.' + key + ': unexpected field');
    for (const [key, sub] of Object.entries(schema.properties || {})) if (Object.hasOwn(value, key)) check(sub, value[key], path + '.' + key, errors);
  } else if (schema.type === 'string') {
    if (typeof value !== 'string') { errors.push(path + ': expected string'); return; }
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(path + ': too short');
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(path + ': too long');
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(path + ': pattern mismatch');
    if (schema.format === 'uuid' && !UUID.test(value)) errors.push(path + ': invalid UUID');
    if (schema.format === 'date-time' && (!DATE_TIME.test(value) || !Number.isFinite(Date.parse(value)))) errors.push(path + ': invalid timestamp');
    if (schema.format === 'uri') { try { const url = new URL(value); if (!url.protocol) throw new Error(); } catch { errors.push(path + ': invalid URI'); } }
  } else if (schema.type === 'integer') {
    if (!Number.isSafeInteger(value)) { errors.push(path + ': expected safe integer'); return; }
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(path + ': too small');
  }
}
export function validateContract(name, value) {
  const errors = [];
  check(schemaFor(name), value, name, errors);
  return { ok: errors.length === 0, errors };
}
export function assertContract(name, value) {
  const result = validateContract(name, value);
  if (!result.ok) throw new TypeError('Invalid ' + name + ': ' + result.errors.join('; '));
  return value;
}
