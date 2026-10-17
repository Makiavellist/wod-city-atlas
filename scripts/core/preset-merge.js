/* Bring a newer version of a bundled preset into an existing atlas without touching the map geometry,
 * the players' notes or anything the preset does not know about. */
import {clone} from './util.js';

export const MERGE_PARTS = [
  ['texts', 'Texts', 'names, rumours, common knowledge, full descriptions, callouts and secrets, chronicle pages'],
  ['knowledge', 'Starting knowledge', 'what every player knows of each entry, realm, level and layer (personal reveals you made are kept)'],
  ['art', 'Pin art', 'icons and pin shapes of places and categories'],
  ['relations', 'Relations', 'attitudes between characters'],
  ['add', 'New entries', 'characters, places and pages the preset has and this atlas does not']
];
const TEXT_KEYS = ['name', 'sub', 'kicker', 'alias', 'aliasText', 'brief', 'html', 'src', 'facts', 'title'];
const ITEM_COLLS = ['places', 'people', 'zones', 'routes', 'auras', 'labels', 'pages'];

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const keyOf = n => String(n.title || n.html || '').trim().toLowerCase();

/** Keep the per-player reveal of a secret callout or relation that already existed with the same heading. */
function carryReveals(newRows, oldRows, key) {
  const old = new Map((oldRows || []).filter(n => n && n.reveal && n.reveal.users && Object.keys(n.reveal.users).length).map(n => [key(n), n.reveal]));
  return (newRows || []).map(n => { const r = old.get(key(n)); if (r && n.secret) { const o = clone(n); o.reveal = Object.assign({}, n.reveal || {}, {users: clone(r.users)}); return o; } return n; });
}

/** Returns {items: [{coll, id, data}], meta: {...}, counts: {...}} without changing anything. */
export function planPresetMerge(current, preset, parts) {
  const P = new Set(parts), items = [], counts = {updated: 0, added: 0, unchanged: 0};
  const push = (coll, id, data, isNew) => { items.push({coll, id, data}); counts[isNew ? 'added' : 'updated']++; };
  for (const coll of ITEM_COLLS) {
    for (const [id, src] of Object.entries(preset[coll] || {})) {
      const cur = current[coll] && current[coll][id];
      if (!cur) { if (P.has('add')) push(coll, id, clone(src), true); continue; }
      const d = clone(cur);
      if (P.has('texts')) {
        for (const k of TEXT_KEYS) { if (src[k] === undefined) { if (['brief', 'alias', 'aliasText'].includes(k)) delete d[k]; } else d[k] = clone(src[k]); }
        if (coll === 'pages' && src.html !== undefined) d.html = src.html;
        if (src.notes) d.notes = carryReveals(clone(src.notes), cur.notes, keyOf); else delete d.notes;
        if (coll === 'people' && src.at) d.at = clone(src.at);
        if (coll === 'places' && src.people) d.people = clone(src.people);
      }
      if (P.has('knowledge') && src.reveal) d.reveal = Object.assign({}, clone(src.reveal), cur.reveal && cur.reveal.users ? {users: clone(cur.reveal.users)} : {});
      if (P.has('art') && coll === 'places') { if (src.icon) d.icon = src.icon; if (src.pin) d.pin = Object.assign({}, cur.pin || {}, clone(src.pin)); }
      if (P.has('relations') && coll === 'people') {
        if (src.relations) { d.relations = clone(src.relations); d.relations.rows = carryReveals(d.relations.rows, cur.relations && cur.relations.rows, r => `${r.a}|${r.b}`.toLowerCase()); }
      }
      if (same(d, cur)) counts.unchanged++; else push(coll, id, d, false);
    }
  }
  for (const coll of ['categories', 'layers', 'realms', 'factions']) {
    for (const [id, src] of Object.entries(preset[coll] || {})) {
      const cur = current[coll] && current[coll][id];
      if (!cur) { if (P.has('add')) push(coll, id, clone(src), true); continue; }
      const d = clone(cur);
      if (P.has('knowledge')) {
        if (src.reveal) d.reveal = Object.assign({}, clone(src.reveal), cur.reveal && cur.reveal.users ? {users: clone(cur.reveal.users)} : {});
        if (coll === 'realms' && Array.isArray(src.levels)) for (const sl of src.levels) { const cl = (d.levels || []).find(l => l.id === sl.id); if (cl && sl.reveal) cl.reveal = Object.assign({}, clone(sl.reveal), cl.reveal && cl.reveal.users ? {users: clone(cl.reveal.users)} : {}); }
      }
      if (P.has('texts') && coll === 'realms') {
        for (const k of ['kicker', 'date', 'banner', 'credit', 'legend', 'crossLabel']) if (src[k] !== undefined) d[k] = clone(src[k]);
        for (const sl of src.levels || []) { const cl = (d.levels || []).find(l => l.id === sl.id); if (cl) for (const k of ['kicker', 'date', 'banner', 'credit', 'legend']) if (sl[k] !== undefined) cl[k] = clone(sl[k]); }
      }
      if (P.has('texts') && coll === 'categories' && src.name) d.name = src.name;
      if (P.has('art') && coll === 'categories') { if (src.icon) d.icon = src.icon; if (src.pin) d.pin = Object.assign({}, cur.pin || {}, clone(src.pin)); }
      if (same(d, cur)) counts.unchanged++; else push(coll, id, d, false);
    }
  }
  const meta = {};
  if (P.has('knowledge') && preset.revealDefault !== undefined && !same(preset.revealDefault, current.revealDefault)) meta.revealDefault = clone(preset.revealDefault);
  if (P.has('knowledge') && preset.tiers && !same(preset.tiers, current.tiers)) meta.tiers = clone(preset.tiers);
  return {items, meta, counts};
}
