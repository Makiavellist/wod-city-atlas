/* Stores hold the atlas data. The view never writes documents directly; it goes through a store. */
import {clone} from './util.js';
import {COLLECTIONS, META_KEYS, normalize} from './model.js';

export class BaseStore {
  constructor() { this.listeners = new Set(); this.atlas = normalize({}); this.basemap = null; this.key = 'default'; this.canEdit = false; }
  onChange(cb) { this.listeners.add(cb); return () => this.listeners.delete(cb); }
  emit(info = {}) { for (const cb of this.listeners) { try { cb(info); } catch (e) { console.error('wod-city-atlas | listener', e); } } }
  /** Apply a change locally (optimistic), then persist. */
  async setItem(coll, id, data) { if (!COLLECTIONS.includes(coll)) throw new Error('Unknown collection ' + coll); const d = clone(data); d.id = id; this.atlas[coll][id] = d; this.emit({coll, id}); await this._persistItem(coll, id, d); }
  /** Many items at once: [[coll, id, data], …]. Applied locally, announced once, written one collection at a time. */
  async setItems(list) {
    const by = new Map();
    for (const [coll, id, data] of list) { if (!COLLECTIONS.includes(coll)) throw new Error('Unknown collection ' + coll); const d = clone(data); d.id = id; this.atlas[coll][id] = d; if (!by.has(coll)) by.set(coll, {}); by.get(coll)[id] = d; }
    this.emit({many: true});
    for (const [coll, items] of by) await this._persistItems(coll, items);
  }
  async _persistItems(coll, items) { for (const [id, d] of Object.entries(items)) await this._persistItem(coll, id, d); }
  async deleteItem(coll, id) { delete this.atlas[coll][id]; this.emit({coll, id, deleted: true}); await this._persistDelete(coll, id); }
  async setMeta(patch) { for (const [k, v] of Object.entries(patch)) { if (!META_KEYS.includes(k)) continue; if (v === undefined || v === null) delete this.atlas[k]; else this.atlas[k] = clone(v); } normalize(this.atlas); this.emit({meta: true}); await this._persistMeta(); }
  async replaceAll(atlas, basemap) { this.atlas = normalize(clone(atlas)); if (basemap !== undefined) this.basemap = basemap; this.emit({all: true, basemap: basemap !== undefined}); await this._persistAll(); }
  /** Atlas as a portable JSON object (for export). */
  exportData() { const a = clone(this.atlas); return a; }
  async _persistItem() {} async _persistDelete() {} async _persistMeta() {} async _persistAll() {}
}

/** In-memory store, optionally mirrored to localStorage (used by the test harness). */
export class MemoryStore extends BaseStore {
  constructor(atlas, basemap = null, {key = 'memory', canEdit = true, persistKey = null} = {}) {
    super(); this.key = key; this.canEdit = canEdit; this.persistKey = persistKey;
    let a = atlas;
    if (persistKey) { try { const s = localStorage.getItem(persistKey); if (s) a = JSON.parse(s); } catch (e) {} }
    this.atlas = normalize(clone(a || {})); this.basemap = basemap;
  }
  _save() { if (!this.persistKey) return; try { localStorage.setItem(this.persistKey, JSON.stringify(this.atlas)); } catch (e) { console.warn('wod-city-atlas | could not save to localStorage', e); } }
  async _persistItem() { this._save(); } async _persistDelete() { this._save(); } async _persistMeta() { this._save(); } async _persistAll() { this._save(); }
}

/** Rewrite relative asset paths ("img/x.jpg") in a preset to live under `base` ("modules/wod-city-atlas/presets/milwaukee/"). */
export function rebasePaths(atlas, base) {
  const fix = s => (typeof s === 'string' && s && !/^(https?:|data:|\/|modules\/|systems\/|worlds\/|icons\/)/.test(s)) ? base + s : s;
  const fixHtml = h => typeof h === 'string' ? h.replace(/(<img[^>]*\ssrc=")([^"]+)"/g, (m, a, s) => a + fix(s) + '"') : h;
  if (atlas.basemap) atlas.basemap = fix(atlas.basemap);
  if (atlas.background && atlas.background.src) atlas.background.src = fix(atlas.background.src);
  for (const r of Object.values(atlas.realms || {})) { if (r.background?.src) r.background.src = fix(r.background.src); for (const l of r.levels || []) if (l.background?.src) l.background.src = fix(l.background.src); }
  for (const c of ['places', 'zones', 'routes', 'people', 'pages', 'labels', 'auras']) for (const it of Object.values(atlas[c] || {})) {
    if (it.img) it.img = fix(it.img);
    if (it.fillImage && it.fillImage.src) it.fillImage.src = fix(it.fillImage.src);
    if (it.html) it.html = fixHtml(it.html);
    for (const n of it.notes || []) n.html = fixHtml(n.html);
  }
  return atlas;
}
