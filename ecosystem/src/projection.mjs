// Pure offline example for eventual public-event projections; does NOT authenticate transport.
// Only call after authenticating producer, authorizing publication, and verifying payload origin.
// No DB writes, network calls or secret access.
import { assertContract } from './contracts.mjs';
const PUBLIC_FIELDS = ['event_id','source_product','revision','status','updated_at','title','starts_at','ends_at','venue','public_url','description'];
const httpsOnly = (value) => {
  if (value !== undefined && (!value.startsWith('https://') || new URL(value).protocol !== 'https:')) throw new Error('Only HTTPS public_url allowed');
};
export function projectTrustedPublication(current, message) {
  assertContract('event-publication', message);
  httpsOnly(message.public_url);
  if (message.status === 'public') {
    for (const key of ['title','starts_at','ends_at','venue']) if (!Object.hasOwn(message, key)) throw new Error('Public event missing ' + key);
    if (Date.parse(message.starts_at) >= Date.parse(message.ends_at)) throw new Error('Invalid event schedule');
  }
  if (current !== null && current.event_id !== message.event_id) throw new Error('Mismatched event identities');
  if (current !== null && current.revision > message.revision) return { state: current, effect: 'stale-ignored' };
  // Same revision with different content is a source-of-truth conflict, not safe to overwrite.
  const allow = Object.fromEntries(PUBLIC_FIELDS.filter(k => Object.hasOwn(message,k)).map(k => [k,message[k]]));
  if (current !== null && current.revision === message.revision) {
    if (JSON.stringify(current.original) === JSON.stringify(allow)) return { state: current, effect: 'duplicate-ignored' };
    throw new Error('Conflicting event revision');
  }
  // Retain tombstone revision even if no longer displayed, preventing stale replay/resurrection.
  const state = { event_id: message.event_id, revision: message.revision, published: message.status === 'public', original: allow };
  return { state, effect: state.published ? 'published' : 'retracted' };
}
export function publicView(state) {
  return state?.published ? structuredClone(state.original) : null;
}
