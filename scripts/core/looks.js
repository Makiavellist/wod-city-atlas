/* Realm looks from a preset: colours, effects and map styles copied into an atlas made from it, without touching
 * texts, positions, visibility or anything the Storyteller wrote. Used by "Refresh realm looks" and by the automatic
 * update when a new version of the module brings a new look (atlas.looks < preset.looks). */
import {clone} from './util.js';

const REALM_KEYS = ['bg', 'theme', 'effects', 'styles', 'labelColors', 'legend', 'crossFx'];
const LEVEL_KEYS = ['effects', 'theme', 'styles', 'bg', 'labelColors'];
const ITEM_KEYS = {
  zones: ['color', 'style'],
  routes: ['color', 'style', 'endGlow', 'curve'],
  auras: ['color', 'ring', 'mode', 'shade', 'swirl', 'glow', 'pulse', 'flicker', 'decor'],
  labels: ['color', 'halo', 'glow', 'font', 'italic', 'ls'],
  categories: ['color', 'pin']
};
const LABEL_LOOK = ['font', 'ls', 'color', 'halo', 'italic', 'subFont', 'glow'];
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Was this atlas made from the bundled preset? (Older atlases have no `preset` key, but use its base map.) */
export function fromPreset(atlas, id = 'milwaukee') { return atlas.preset === id || new RegExp(`presets/${id}/`).test(atlas.basemap || ''); }

/**
 * The changes that bring an atlas's looks in line with the preset.
 * opts.realms limits it to the entries of those realms (named styles are always compared).
 * @returns {{items: Array<[coll, id, data]>, meta: object}}
 */
export function planLooks(atlas, pre, {realms = null} = {}) {
  const items = [], put = (coll, id, d) => items.push([coll, id, d]);
  const inScope = r => !realms || [].concat(r ?? []).some(x => realms.includes(x));
  // realms and their levels
  for (const [rid, pr] of Object.entries(pre.realms || {})) {
    const cur = atlas.realms[rid]; if (!cur || !inScope(rid)) continue; const d = clone(cur);
    for (const k of REALM_KEYS) if (pr[k] !== undefined) d[k] = clone(pr[k]);
    for (const pl of pr.levels || []) { const cl = (d.levels || []).find(l => l.id === pl.id); if (!cl) continue; for (const k of LEVEL_KEYS) { if (pl[k] !== undefined) cl[k] = clone(pl[k]); else delete cl[k]; } }
    if (!same(d, cur)) put('realms', rid, d);
  }
  // named styles: replaced, and the new ones added
  for (const [sid, ps] of Object.entries(pre.styles || {})) if (!same(atlas.styles[sid], ps)) put('styles', sid, clone(ps));
  // the look of each entry the atlas shares with the preset (same id, same realm)
  for (const [coll, keys] of Object.entries(ITEM_KEYS)) for (const [id, p] of Object.entries(pre[coll] || {})) {
    const it = atlas[coll][id]; if (!it || (coll !== 'categories' && !same(it.realm, p.realm)) || !inScope(p.realm)) continue;
    const d = clone(it);
    for (const k of keys) { if (p[k] !== undefined) d[k] = clone(p[k]); else if (coll !== 'categories') delete d[k]; }
    if (coll === 'zones' && (p.label || it.label)) { const L = Object.assign({}, it.label || {}); for (const k of LABEL_LOOK) { if (p.label && p.label[k] !== undefined) L[k] = p.label[k]; else delete L[k]; } if (Object.keys(L).length) d.label = L; else delete d.label; }
    // Kindred taint: give unnamed patches the preset's name and words
    if (coll === 'auras' && p.layer === 'taint' && !it.name) for (const k of ['name', 'kicker', 'html']) if (p[k] !== undefined) d[k] = p[k];
    if (!same(d, it)) put(coll, id, d);
  }
  return {items, meta: {looks: pre.looks || 0, preset: atlas.preset || pre.preset}};
}

/** Apply a plan to a store (one write per collection where the store can batch). */
export async function applyLooks(store, plan) {
  if (plan.items.length) await store.setItems(plan.items);
  await store.setMeta(plan.meta);
  return plan.items.length;
}
