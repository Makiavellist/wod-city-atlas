/* Stores an atlas inside a JournalEntry: meta on the entry's flags, one hidden page per collection.
 * Every item is saved as a JSON string under flags.<module>.items.<id>, so updates replace items whole
 * and only the changed item travels over the network. */
import {BaseStore} from '../core/store.js';
import {COLLECTIONS, META_KEYS, normalize} from '../core/model.js';
import {clone} from '../core/util.js';

export const MOD = 'wod-city-atlas';
const PAGE_TEXT = '<p><b>City Atlas data.</b> This page stores part of an interactive map for the <i>World of Darkness City Atlas</i> module. Open the map with the <b>City Atlas</b> button at the top of the Journal sidebar, or the map tool on the left. Please don’t edit or delete this page by hand.</p>';
const CHUNK = 120;
const SHARED = new Map();

export const isAtlasEntry = e => !!(e && e.getFlag && e.getFlag(MOD, 'atlas'));

export class JournalStore extends BaseStore {
  constructor(entry) {
    super();
    this.entry = entry; this.key = entry.id; this.canEdit = entry.isOwner;
    this.load();
    this._hooks = [
      ['updateJournalEntryPage', (page, changed, opts, userId) => this._onPage(page, userId, false)],
      ['createJournalEntryPage', (page, opts, userId) => this._onPage(page, userId, false)],
      ['deleteJournalEntryPage', (page, opts, userId) => this._onPage(page, userId, true)],
      ['updateJournalEntry', (e, changed, opts, userId) => { if (e.id !== this.entry.id) return; if (changed.flags?.[MOD] && userId !== game.user.id) { this.load(); this.emit({meta: true}); } }]
    ].map(([h, fn]) => [h, Hooks.on(h, fn)]);
  }
  detach() { for (const [h, id] of this._hooks || []) Hooks.off(h, id); this._hooks = []; this.listeners.clear(); }
  /** One shared store per atlas, so the atlas window and the live scene see each other's edits at once. */
  static acquire(entry) {
    let s = SHARED.get(entry.id);
    if (!s || s.entry !== entry) { s = new JournalStore(entry); SHARED.set(entry.id, s); s._refs = 0; }
    s._refs++; return s;
  }
  release() { this._refs = (this._refs || 1) - 1; if (this._refs <= 0) { SHARED.delete(this.entry.id); this.detach(); } }

  /** Someone else changed a collection: read just that page again (a deleted page, or one we don't know, reloads everything). */
  _onPage(page, userId, deleted) {
    if (page.parent?.id !== this.entry.id || this._replacing || userId === game.user.id) return; // our own changes are already applied
    const coll = page.getFlag(MOD, 'coll');
    if (deleted || !COLLECTIONS.includes(coll)) this.load(); else { this.atlas[coll] = readItems(page, coll); normalize(this.atlas); }
    this.emit({coll});
  }
  pageFor(coll) { return this.entry.pages.find(p => p.getFlag(MOD, 'coll') === coll) || null; }

  load() {
    let meta = {};
    try { meta = JSON.parse(this.entry.getFlag(MOD, 'meta') || '{}'); } catch (e) { console.error(`${MOD} | bad atlas meta`, e); }
    const a = Object.assign({}, meta);
    for (const c of COLLECTIONS) { const page = this.pageFor(c); a[c] = page ? readItems(page, c) : {}; }
    this.atlas = normalize(a);
  }
  async loadBasemap(resolve) {
    const p = this.atlas.basemap; if (!p) { this.basemap = null; return null; }
    if (this._bmPath === p && this.basemap) return this.basemap;
    this._bmPath = p;
    try { const r = await fetch(resolve(p)); this.basemap = r.ok ? await r.json() : null; } catch (e) { console.warn(`${MOD} | base map not found: ${p}`, e); this.basemap = null; }
    return this.basemap;
  }

  /* ----- persistence ----- */
  async _ensurePage(coll) {
    let page = this.pageFor(coll); if (page) return page;
    [page] = await this.entry.createEmbeddedDocuments('JournalEntryPage', [pageData(coll, {})]);
    return page;
  }
  async _persistItem(coll, id, d) { const page = await this._ensurePage(coll); await page.update({[`flags.${MOD}.items.${id}`]: JSON.stringify(d)}); }
  async _persistItems(coll, items) {
    const page = await this._ensurePage(coll), ids = Object.keys(items);
    for (let i = 0; i < ids.length; i += CHUNK) { const upd = {}; for (const id of ids.slice(i, i + CHUNK)) upd[`flags.${MOD}.items.${id}`] = JSON.stringify(items[id]); await page.update(upd); }
  }
  async _persistDelete(coll, id) { const page = this.pageFor(coll); if (page) await page.update({[`flags.${MOD}.items.-=${id}`]: null}); }
  async _persistMeta() {
    const meta = metaOf(this.atlas);
    const upd = {[`flags.${MOD}.meta`]: JSON.stringify(meta)}; if (meta.title && meta.title !== this.entry.name) upd.name = meta.title;
    await this.entry.update(upd);
  }
  async _persistAll() {
    this._replacing = true;
    try {
      const old = this.entry.pages.filter(p => p.getFlag(MOD, 'coll')).map(p => p.id);
      if (old.length) await this.entry.deleteEmbeddedDocuments('JournalEntryPage', old);
      await writeCollections(this.entry, this.atlas);
      await this._persistMeta();
    } finally { this._replacing = false; }
    this.load(); this.emit({all: true});
  }

  /* ----- creation ----- */
  /** Create a new atlas journal entry. Returns the JournalEntry. */
  static async create(atlas, {folder = null, ownership = null, onProgress = null} = {}) {
    atlas = normalize(clone(atlas));
    const data = {name: atlas.title || 'City Atlas', folder, flags: {[MOD]: {atlas: true, meta: JSON.stringify(metaOf(atlas))}}, pages: []};
    if (ownership != null) data.ownership = {default: ownership};
    const entry = await JournalEntry.create(data);
    await writeCollections(entry, atlas, onProgress);
    return entry;
  }
}

/** The items stored on one collection's page. */
function readItems(page, coll) {
  const out = {}, items = page.getFlag(MOD, 'items') || {};
  for (const [id, raw] of Object.entries(items)) { try { const it = typeof raw === 'string' ? JSON.parse(raw) : raw; if (it) { it.id = id; out[id] = it; } } catch (e) { console.warn(`${MOD} | could not read ${coll}.${id}`, e); } }
  return out;
}
function metaOf(a) { const m = {}; for (const k of META_KEYS) if (a[k] !== undefined) m[k] = a[k]; return m; }
function pageData(coll, items) { return {name: `Atlas data · ${coll}`, type: 'text', text: {content: PAGE_TEXT}, title: {show: true, level: 2}, flags: {[MOD]: {coll, items}}, sort: COLLECTIONS.indexOf(coll) * 1000}; }

/** Write every collection as a page; big collections are written in chunks to keep socket messages small. */
async function writeCollections(entry, atlas, onProgress) {
  const pages = await entry.createEmbeddedDocuments('JournalEntryPage', COLLECTIONS.map(c => pageData(c, {})));
  let done = 0; const total = COLLECTIONS.reduce((n, c) => n + Object.keys(atlas[c] || {}).length, 0);
  for (const page of pages) {
    const coll = page.getFlag(MOD, 'coll'); const ids = Object.keys(atlas[coll] || {});
    for (let i = 0; i < ids.length; i += CHUNK) {
      const upd = {}; for (const id of ids.slice(i, i + CHUNK)) upd[`flags.${MOD}.items.${id}`] = JSON.stringify(atlas[coll][id]);
      await page.update(upd); done += Math.min(CHUNK, ids.length - i); onProgress?.(done, total);
    }
  }
}
