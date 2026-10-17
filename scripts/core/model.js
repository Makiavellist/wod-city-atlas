/* The atlas data model: normalisation, projection, realm/level resolution, visibility and lookups. */
import {clone, isObj, sortBy, stripHtml, bbOf, inPoly, ringCenter, arcPts, ringArea} from './util.js';

export const COLLECTIONS = ['realms', 'layers', 'categories', 'factions', 'styles', 'places', 'zones', 'routes', 'labels', 'auras', 'people', 'pages'];
export const MAP_ITEMS = ['places', 'zones', 'routes', 'labels', 'auras'];
export const META_KEYS = ['schema', 'title', 'titleHtml', 'description', 'projection', 'bounds', 'home', 'zoom', 'closeBy', 'basemap', 'background', 'theme', 'statuses', 'precisions', 'fonts', 'scale', 'version'];
export const TYPE_NAMES = {places: 'Place', zones: 'Zone', routes: 'Route', labels: 'Label', auras: 'Glow', people: 'Person', pages: 'Page', realms: 'Realm', layers: 'Layer', categories: 'Category', factions: 'Faction', styles: 'Style'};

export const DEFAULT_THEME = {panel: '#141117', panel2: '#1c1820', line: '#2e2832', accent: '#b3202a', gold: '#d8b45a', muted: '#a39886', faint: '#6d6459', bone: '#ebe2d0', accentLine: 'rgba(179,32,42,.55)', accentSoft: '#e6a3a3', segOn: '#2a2230', segOnFg: '#ebe2d0', glow: 'rgba(179,32,42,.10)', chrome: 'rgba(20,17,23,.92)', pinBg: ['#231e27', '#0f0d12'], labelHalo: '#000'};

/** Ensure every collection exists and every realm has at least one level. Mutates and returns the atlas. */
export function normalize(a) {
  a = a || {};
  a.schema ??= 1;
  a.title ??= 'Untitled atlas';
  a.projection ??= 'plane';
  for (const c of COLLECTIONS) { if (Array.isArray(a[c])) a[c] = Object.fromEntries(a[c].map(o => [o.id, o])); a[c] = isObj(a[c]) ? a[c] : {}; for (const [k, v] of Object.entries(a[c])) { if (!isObj(v)) delete a[c][k]; else v.id = k; } }
  if (!Object.keys(a.realms).length) a.realms.waking = {id: 'waking', name: 'Waking', icon: 'sun', order: 0};
  for (const r of Object.values(a.realms)) { if (!Array.isArray(r.levels) || !r.levels.length) r.levels = [{id: 'main', name: r.name || 'Main', show: ['main']}]; r.levels.forEach(l => { l.show = Array.isArray(l.show) && l.show.length ? l.show : [l.id]; }); }
  a.zoom ??= a.projection === 'mercator' ? {min: 3, max: 18} : {min: -3, max: 4};
  a.statuses ??= {dead: {name: 'Destroyed', mark: '†', fade: true, hideable: true}, missing: {name: 'Missing'}, captured: {name: 'Captured'}, hiding: {name: 'In hiding'}};
  a.precisions ??= {};
  a.theme = Object.assign({}, DEFAULT_THEME, a.theme || {});
  return a;
}

/* ---------- projections ---------- */
const TILE = 256;
export function makeProjection(atlas) {
  if (atlas.projection === 'mercator') {
    const toWorld = ([lat, lng]) => { const s = Math.sin(lat * Math.PI / 180); return [(lng + 180) / 360 * TILE, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE]; };
    const toLL = ([x, y]) => { const n = Math.PI - 2 * Math.PI * y / TILE; return [180 / Math.PI * Math.atan(Math.sinh(n)), x / TILE * 360 - 180]; };
    // metres per world unit at a world y
    const mpu = y => 156543.03392 * TILE * Math.cos(toLL([0, y])[0] * Math.PI / 180) / TILE;
    return {kind: 'mercator', toWorld, toLL, mpu, round: v => Math.round(v * 1e5) / 1e5};
  }
  const k = (atlas.scale && atlas.scale.metersPerUnit) || 1;
  return {kind: 'plane', toWorld: p => [p[0], p[1]], toLL: p => [p[0], p[1]], mpu: () => k, round: v => Math.round(v * 10) / 10};
}

/* ---------- the model ---------- */
export class AtlasModel {
  constructor(atlas, basemap = null) {
    this.atlas = normalize(atlas);
    this.basemap = basemap;
    this.rev = 0;
    this._geo = new WeakMap();
    this.rebuild();
  }

  setAtlas(atlas) { this.atlas = normalize(atlas); this.rebuild(); }
  setBasemap(bm) { this.basemap = bm; this._baseGeo = null; this.rev++; }

  rebuild() {
    this.proj = makeProjection(this.atlas);
    this.rev++;
    this._baseGeo = null;
    this.index = new Map();
    for (const c of COLLECTIONS) for (const it of Object.values(this.atlas[c])) if (!this.index.has(it.id) || MAP_ITEMS.includes(c) || c === 'people') this.index.set(it.id, {coll: c, item: it});
    this.realmList = sortBy(Object.values(this.atlas.realms), r => r.order ?? 0, 'name');
    // reverse lookups
    this.atPeople = new Map(); this.anchoredBy = new Map(); this.ownersOf = new Map();
    for (const p of Object.values(this.atlas.people)) for (const id of p.at || []) { if (!this.atPeople.has(id)) this.atPeople.set(id, []); this.atPeople.get(id).push(p.id); }
    for (const c of ['places', 'zones', 'routes']) for (const it of Object.values(this.atlas[c])) if (it.anchor) { if (!this.anchoredBy.has(it.anchor)) this.anchoredBy.set(it.anchor, []); this.anchoredBy.get(it.anchor).push(it.id); }
    for (const z of Object.values(this.atlas.zones)) for (const o of z.owners || []) { if (!this.ownersOf.has(o)) this.ownersOf.set(o, []); this.ownersOf.get(o).push(z.id); }
    this._searchIdx = null;
  }

  get(id) { return this.index.get(id) || null; }
  item(id) { const r = this.index.get(id); return r ? r.item : null; }
  collOf(id) { const r = this.index.get(id); return r ? r.coll : null; }
  get meta() { return this.atlas; }

  /* ---------- realms & levels ---------- */
  realm(id) { return this.atlas.realms[id] || this.realmList[0]; }
  level(realmId, levelId) { const r = this.realm(realmId); return r.levels.find(l => l.id === levelId) || r.levels[0]; }
  /** Realm merged with level overrides: everything the renderer and chrome need. */
  view(realmId, levelId) {
    const r = this.realm(realmId), l = this.level(r.id, levelId);
    const chain = []; let cur = l; const seen = new Set();
    while (cur && !seen.has(cur.id)) { seen.add(cur.id); chain.unshift(cur); cur = cur.inherit ? r.levels.find(x => x.id === cur.inherit) : null; }
    const out = Object.assign({}, r, {realm: r, level: l, levels: r.levels});
    out.theme = Object.assign({}, this.atlas.theme, r.theme || {});
    out.styles = Object.assign({}, r.styles || {});
    out.terms = Object.assign({places: 'Places', people: 'People', zones: 'Zones', pages: 'Chronicle'}, r.terms || {});
    out.labelColors = Object.assign({areaBig: '#a69a89', areaSmall: '#8f8578', halo: '#18151c'}, r.labelColors || {});
    out.layerDefaults = Object.assign({}, r.layerDefaults || {});
    for (const lv of chain) {
      for (const k of ['bg', 'effects', 'kicker', 'date', 'banner', 'credit', 'legend', 'crossLabel', 'crossIcon', 'focus', 'anchorThreads', 'echo']) if (lv[k] !== undefined) out[k] = lv[k];
      if (lv.background) out.background = Object.assign({}, out.background || {}, lv.background);
      if (lv.theme) Object.assign(out.theme, lv.theme);
      if (lv.styles) Object.assign(out.styles, lv.styles);
      if (lv.terms) Object.assign(out.terms, lv.terms);
      if (lv.labelColors) Object.assign(out.labelColors, lv.labelColors);
      if (lv.layerDefaults) Object.assign(out.layerDefaults, lv.layerDefaults);
    }
    out.background = (this.atlas.background || out.background) ? Object.assign({}, this.atlas.background || {}, out.background || {}) : null;
    if (out.background && !out.background.src) out.background = null;
    out.effects = out.effects || [];
    out.bg = out.bg || '#18151c';
    return out;
  }
  levelShows(realmId, levelId) { return this.level(realmId, levelId).show; }

  /* ---------- layers ---------- */
  layersFor(realmId, levelId) {
    return sortBy(Object.values(this.atlas.layers).filter(L => this.layerApplies(L, realmId, levelId)), l => l.order ?? 0, 'name');
  }
  layerApplies(L, realmId, levelId) {
    const rs = L.realm == null ? null : [].concat(L.realm);
    if (rs && !rs.includes(realmId)) return false;
    if (Array.isArray(L.levels) && L.levels.length && levelId && !L.levels.includes(levelId)) {
      // a layer that names levels of *another* realm still applies everywhere it is not excluded
      const r = this.realm(realmId); if (r.levels.some(l => L.levels.includes(l.id))) return false;
    }
    return true;
  }
  layerDefault(id, realmId, levelId) { const v = this.view(realmId, levelId); if (v.layerDefaults[id] !== undefined) return !!v.layerDefaults[id]; const L = this.atlas.layers[id]; return L ? L.on !== false : true; }

  /* ---------- visibility ---------- */
  /** state: {realm, level, gm, layerOn(id) => bool, catOn(id) => bool, showFaded} */
  inRealm(it, st) {
    if (it.realm == null) return true;
    return Array.isArray(it.realm) ? it.realm.includes(st.realm) : it.realm === st.realm;
  }
  inLevel(it, st) {
    if (Array.isArray(it.levels) && it.levels.length) return it.levels.includes(st.level);
    if (it.level == null) return true;
    return this.levelShows(st.realm, st.level).includes(it.level);
  }
  visible(it, coll, st, {ignoreLayer = false, ignoreCat = false} = {}) {
    if (!it) return false;
    if (it.gm && !st.gm) return false;
    if (coll === 'people') return this.personIn(it, st);
    if (coll === 'pages') return this.inRealm(it, st) && this.inLevel(it, st);
    if (!this.inRealm(it, st) || !this.inLevel(it, st)) return false;
    if (!ignoreLayer && it.layer && !st.layerOn(it.layer)) return false;
    if (!ignoreCat && coll === 'places' && it.cat && !st.catOn(it.cat)) return false;
    return true;
  }
  personIn(p, st) {
    const rs = p.realms; if (!rs || !rs.length) return true;
    return rs.some(k => k === st.realm || k === `${st.realm}:${st.level}`);
  }
  /** Where to show an item: its realm and a level that displays it. */
  homeOf(it) {
    const realmId = Array.isArray(it.realm) ? it.realm[0] : (it.realm || null);
    if (!realmId) return null;
    const r = this.realm(realmId); let level = r.levels[0].id;
    if (Array.isArray(it.levels) && it.levels.length) level = it.levels[0];
    else if (it.level) level = (r.levels.find(l => l.id === it.level) || r.levels.find(l => l.show.includes(it.level)) || r.levels[0]).id;
    return {realm: r.id, level};
  }

  /* ---------- appearance lookups ---------- */
  faction(id) { return this.atlas.factions[id] || null; }
  category(id) { return this.atlas.categories[id] || null; }
  colorOf(it) {
    if (it.color) return it.color;
    const f = it.faction && this.atlas.factions[it.faction]; if (f && f.color) return f.color;
    const c = it.cat && this.atlas.categories[it.cat]; if (c && c.color) return c.color;
    return '#d8cbb0';
  }
  iconOf(it, coll) {
    if (it.icon) return it.icon;
    if (coll === 'places') { const c = this.atlas.categories[it.cat]; return c ? c.icon : 'pin'; }
    if (coll === 'zones') return 'poly';
    if (coll === 'routes') return 'gate';
    if (coll === 'people') return 'user';
    return 'pin';
  }
  /** Resolve a style reference into an array of passes. */
  passes(style) {
    if (!style) return [];
    if (typeof style === 'string') return this.passes(this.atlas.styles[style]);
    if (Array.isArray(style)) return style.flatMap(s => this.passes(s));
    if (isObj(style) && style.passes) return this.passes(style.passes);
    return [style];
  }
  categoriesFor(realmId, levelId) {
    return sortBy(Object.values(this.atlas.categories).filter(c => (c.realm == null || c.realm === realmId) && (!Array.isArray(c.levels) || !c.levels.length || c.levels.includes(levelId))), c => c.order ?? 0, 'name');
  }
  factionOrder(id) { const f = this.atlas.factions[id]; return f ? (f.order ?? 50) : 999; }

  /* ---------- geometry (world coordinates, cached per item object) ---------- */
  geo(it, coll) {
    let g = this._geo.get(it); if (g && g.rev === this.proj && g.src === (it.at || it.rings || it.parts)) return g;
    const W = this.proj.toWorld;
    g = {rev: this.proj, src: it.at || it.rings || it.parts};
    if (coll === 'places' || coll === 'labels' || coll === 'auras') { if (it.at) g.w = W(it.at); }
    else if (coll === 'zones') { g.rings = (it.rings || []).filter(r => r && r.length > 2).map(r => r.map(W)); if (g.rings.length) { g.bb = bbOf(g.rings); g.area = ringArea(g.rings[0]); g.c = it.label && it.label.at ? W(it.label.at) : ringCenter(g.rings[0]); } }
    else if (coll === 'routes') {
      const curve = it.curve ?? (this.passes(it.style)[0] || {}).curve;
      g.parts = (it.parts || []).filter(p => p && p.length > 1).map(p => { const w = p.map(W); if (!curve) return w; let out = []; for (let i = 0; i < w.length - 1; i++) out = out.concat(arcPts(w[i], w[i + 1], curve).slice(i ? 1 : 0)); return out; });
      if (g.parts.length) g.bb = bbOf(g.parts);
    }
    this._geo.set(it, g); return g;
  }
  baseGeo() {
    if (this._baseGeo && this._baseGeo.proj === this.proj) return this._baseGeo.list;
    const W = this.proj.toWorld, list = [];
    const feats = [].concat((this.basemap && this.basemap.features) || [], Object.values(this.atlas.features || {}));
    for (const f of feats) {
      const o = {f, c: f.c, k: f.k, n: f.n, w: f.w, layer: f.layer, realm: f.realm, level: f.level};
      if (f.k === 'p') o.rings = f.p.map(r => r.map(W));
      else if (f.k === 'm') o.lines = f.p.map(l => l.map(W));
      else o.lines = [f.p.map(W)];
      o.bb = bbOf(o.rings || o.lines);
      list.push(o);
    }
    this._baseGeo = {proj: this.proj, list}; return list;
  }

  /* ---------- relations ---------- */
  containingZones(it, st) {
    const at = it.at; if (!at) return [];
    const w = this.proj.toWorld(at);
    return Object.values(this.atlas.zones).filter(z => z.container && z.id !== it.id && this.visible(z, 'zones', st, {ignoreLayer: true}) && (() => { const g = this.geo(z, 'zones'); return g.rings && g.rings.length && w[0] >= g.bb[0] && w[0] <= g.bb[2] && w[1] >= g.bb[1] && w[1] <= g.bb[3] && inPoly(w, g.rings); })());
  }
  placesInZone(z, st) {
    const g = this.geo(z, 'zones'); if (!g.rings || !g.rings.length) return [];
    return Object.values(this.atlas.places).filter(p => p.at && (p.zone === z.id || (this.visible(p, 'places', st, {ignoreLayer: true, ignoreCat: true}) && (() => { const w = this.proj.toWorld(p.at); return w[0] >= g.bb[0] && w[0] <= g.bb[2] && w[1] >= g.bb[1] && w[1] <= g.bb[3] && inPoly(w, g.rings); })())));
  }
  nearby(it, st, meters) {
    if (!it.at) return [];
    const w = this.proj.toWorld(it.at), lim = meters / this.proj.mpu(w[1]);
    return Object.values(this.atlas.places).filter(p => p.id !== it.id && p.at && this.visible(p, 'places', st, {ignoreLayer: true, ignoreCat: true}) && (() => { const q = this.proj.toWorld(p.at); return Math.hypot(q[0] - w[0], q[1] - w[1]) < lim; })());
  }
  routesNear(it, st, meters = 130) {
    if (!it.at) return [];
    const w = this.proj.toWorld(it.at), lim = meters / this.proj.mpu(w[1]);
    return Object.values(this.atlas.routes).filter(r => !r.decor && this.visible(r, 'routes', st, {ignoreLayer: true}) && this.geo(r, 'routes').parts?.some(p => p.some(q => Math.hypot(q[0] - w[0], q[1] - w[1]) < lim)));
  }
  routesAt(id) { return Object.values(this.atlas.routes).filter(r => (r.ends || []).includes(id)); }
  peopleAt(it) { return [...new Set([...(it.people || []), ...(this.atPeople.get(it.id) || [])])].map(i => this.atlas.people[i]).filter(Boolean); }

  /* ---------- search ---------- */
  searchIndex() {
    if (this._searchIdx) return this._searchIdx;
    const out = [];
    for (const c of ['places', 'zones', 'routes', 'people']) for (const it of Object.values(this.atlas[c])) {
      if (it.decor || it.hidden) continue;
      const cat = c === 'places' ? this.atlas.categories[it.cat] : null, f = this.atlas.factions[it.faction];
      out.push({id: it.id, coll: c, it, name: it.name || '', text: [it.name, it.sub, it.kicker, it.tag, cat && cat.name, f && f.name, stripHtml(it.html)].filter(Boolean).join(' ').toLowerCase()});
    }
    return (this._searchIdx = out);
  }
}
