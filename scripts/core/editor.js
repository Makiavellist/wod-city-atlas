/* The GM editor: drawing tools, item forms, collection managers, import/export and undo. */
import {esc, svg, clone, uid, safeId, sortBy, GLYPH, segDist, inPoly, clamp} from './util.js';
import {COLLECTIONS, TYPE_NAMES, normalize} from './model.js';
import {renderFields, readFields, bindFields} from './forms.js';
import {LOOKS, applyLook} from './templates.js';

const TOOLS = [['select', 'cursor', 'Select & move'], ['places', 'pin', 'Add a place'], ['zones', 'poly', 'Draw a zone'], ['routes', 'line', 'Draw a route'], ['labels', 'text', 'Add a label'], ['auras', 'glow', 'Add a glow']];
const HINTS = {select: 'Click anything to edit it. Drag pins, label handles and shape corners to move them. Shift-drag inside a selected shape moves it all; Alt-click a corner removes it; click a midpoint dot to add one.',
  places: 'Click the map to drop a new place.', zones: 'Click to add corners. Click the first corner, double-click or press Enter to finish. Backspace undoes a corner, Esc cancels.',
  routes: 'Click to add points. Double-click or press Enter to finish. Backspace undoes a point, Esc cancels.', labels: 'Click the map where the label should sit.', auras: 'Click the map to add a glow or shadow.'};
const NOTE_KINDS = [['scene', 'Callout'], ['law', 'Law / rule'], ['secret', 'Secret (pink)'], ['play', 'Quote']];
const TABS = [['pages', 'Chronicle tab'], ['places', 'Bottom of Places'], ['people', 'Top of People'], ['zones', 'Bottom of Zones']];

export class AtlasEditor {
  constructor(view, opts = {}) {
    this.v = view; this.opts = opts; this.tool = 'select'; this.panel = null; this.draw = null; this.drag = null; this.undoStack = [];
  }
  get m() { return this.v.model; }
  get store() { return this.v.store; }
  get A() { return this.v.adapter; }
  get proj() { return this.m.proj; }

  /* ================= lifecycle ================= */
  start() { this.v.root.classList.add('editing'); this.renderBar(); this.v.el.edbar.hidden = false; this.panel = {type: 'home'}; this.renderPane(); }
  stop() { this.draw = null; this.drag = null; this.panel = null; this.v.root.classList.remove('editing'); }
  destroy() { this.stop(); }
  holdsPane() { return !!this.panel; }
  renderBar() {
    const B = this.v.el.edbar;
    B.innerHTML = `<div class="tools">${TOOLS.map(([k, ic, t]) => `<button type="button" class="tbtn" data-tool="${k}" aria-pressed="${this.tool === k}" title="${esc(t)}">${svg(ic)}</button>`).join('')}<span class="sep"></span>
      <button type="button" class="tbtn" data-ed="undo" title="Undo (Ctrl+Z)" ${this.undoStack.length ? '' : 'disabled'}>${svg('undo')}</button>
      <button type="button" class="tbtn" data-ed="home" title="Atlas settings">${svg('gear')}</button>
      <button type="button" class="tbtn done" data-ed="done" title="Finish editing">${svg('check', 2)}<span>Done</span></button></div>
      <div class="hint">${esc(HINTS[this.tool])}</div>`;
    B.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.tool) this.setTool(b.dataset.tool); else if (b.dataset.ed === 'undo') this.undo(); else if (b.dataset.ed === 'home') { this.panel = {type: 'home'}; this.renderPane(); } else if (b.dataset.ed === 'done') this.v.toggleEdit(false); };
  }
  setTool(t) { this.tool = t; this.draw = null; this.renderBar(); this.v.el.map.classList.toggle('drawing', t !== 'select'); this.v.dirty(); }
  notify(msg, type = 'info') { if (this.A.notify) this.A.notify(msg, type); else console.log(`[${type}] ${msg}`); }
  async confirm(title, text) { if (this.A.confirm) return this.A.confirm(title, text); return window.confirm(`${title}\n\n${text}`); }

  /* ================= persistence & undo ================= */
  async put(coll, item, {undo = true} = {}) {
    if (undo) this.pushUndo(coll, item.id);
    await this.store.setItem(coll, item.id, item);
  }
  async remove(coll, id) { this.pushUndo(coll, id); await this.store.deleteItem(coll, id); }
  pushUndo(coll, id) { const before = this.store.atlas[coll][id]; this.undoStack.push({coll, id, before: before ? clone(before) : null}); if (this.undoStack.length > 80) this.undoStack.shift(); this.renderBar(); }
  async undo() {
    const u = this.undoStack.pop(); if (!u) return; this.renderBar();
    if (u.before) await this.store.setItem(u.coll, u.id, u.before); else await this.store.deleteItem(u.coll, u.id);
    if (this.panel && this.panel.id === u.id) this.renderPane();
    this.notify(`Undid a change to ${TYPE_NAMES[u.coll] || u.coll} “${(u.before && (u.before.name || u.before.title || u.before.text)) || u.id}”.`);
  }
  newId(coll, name) {
    const base = safeId(name) || coll.slice(0, 2); let id = base, i = 2;
    while (this.m.atlas[coll][id] || this.m.get(id)) id = `${base}-${i++}`;
    return id.length > 2 ? id : uid(coll.slice(0, 1));
  }
  freshId(coll) { const pre = {places: 'p', zones: 'z', routes: 'r', labels: 'lb', auras: 'au', people: 'pp', pages: 'pg', styles: 'st', layers: 'ly', categories: 'cat', factions: 'f', realms: 'realm'}[coll] || 'x'; let id; do { id = uid(pre + '-'); } while (this.m.get(id) || this.m.atlas[coll][id]); return id; }
  ll(w) { const p = this.proj.toLL(w); return [this.proj.round(p[0]), this.proj.round(p[1])]; }

  /* ================= map interaction ================= */
  screenToWorld(sx, sy) { return this.v.toWorld(sx, sy); }
  sel() { return this.panel && this.panel.type === 'item' ? this.m.get(this.panel.id) : null; }
  handles() {
    const r = this.sel(); if (!r) return [];
    const {coll, item: it} = r, out = [];
    if (coll === 'zones' || coll === 'routes') {
      const g = this.m.geo(it, coll);
      const geo = coll === 'zones' ? it.rings || [] : it.parts || [];
      geo.forEach((ring, ri) => { const W = ring.map(p => this.proj.toWorld(p)); W.forEach((w, pi) => out.push({kind: 'v', ri, pi, w}));
        const n = coll === 'zones' ? W.length : W.length - 1; for (let i = 0; i < n; i++) { const a = W[i], b = W[(i + 1) % W.length]; out.push({kind: 'mid', ri, pi: i + 1, w: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]}); } });
      void g;
    } else if ((coll === 'labels' || coll === 'auras') && it.at) out.push({kind: 'pt', w: this.proj.toWorld(it.at)});
    return out;
  }
  handleAt(sx, sy) { let best = null, bd = 9; for (const h of this.handles()) { const [x, y] = this.v.toScreen(h.w); const d = Math.hypot(x - sx, y - sy); if (d < bd || (d === bd && h.kind === 'v')) { bd = d; best = h; } } return best; }
  pointerDown(e) {
    const r = this.v.el.map.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    if (this.tool !== 'select') return false;
    const h = this.handleAt(sx, sy);
    if (h) {
      const {coll, item} = this.sel();
      if (h.kind === 'v' && e.altKey) { this.removeVertex(coll, item, h); return true; }
      if (h.kind === 'mid') { this.insertVertex(coll, item, h); }
      this.drag = {type: 'handle', h: h.kind === 'mid' ? Object.assign({}, h, {kind: 'v'}) : h, coll, id: item.id, before: clone(item), work: clone(item), moved: false};
      this.v.el.map.setPointerCapture(e.pointerId); return true;
    }
    const s = this.sel();
    if (s && e.shiftKey && (s.coll === 'zones' || s.coll === 'routes')) {
      const w = this.screenToWorld(sx, sy), g = this.m.geo(s.item, s.coll);
      const inside = s.coll === 'zones' ? g.rings && inPoly(w, g.rings) : g.parts && g.parts.some(p => p.some((q, i) => i && segDist(w, p[i - 1], q) * Math.pow(2, this.v.cam.z) < 8));
      if (inside) { this.drag = {type: 'shape', coll: s.coll, id: s.item.id, start: w, before: clone(s.item), work: clone(s.item), moved: false}; this.v.el.map.setPointerCapture(e.pointerId); return true; }
    }
    return false;
  }
  pointerMove(e, sx, sy) {
    if (this.draw) { this.draw.cursor = this.screenToWorld(sx, sy); this.v.dirty(); }
    if (!this.drag) { if (this.tool === 'select') { const h = this.handleAt(sx, sy); this.v.el.map.style.cursor = h ? (h.kind === 'mid' ? 'copy' : 'move') : ''; if (h) return true; } return false; }
    const w = this.screenToWorld(sx, sy), d = this.drag; d.moved = true;
    if (d.type === 'handle') {
      if (d.h.kind === 'pt') d.work.at = this.ll(w);
      else { const key = d.coll === 'zones' ? 'rings' : 'parts'; d.work[key][d.h.ri][d.h.pi] = this.ll(w); }
    } else if (d.type === 'shape') {
      const key = d.coll === 'zones' ? 'rings' : 'parts'; const dx = w[0] - d.start[0], dy = w[1] - d.start[1];
      d.work[key] = d.before[key].map(ring => ring.map(p => { const q = this.proj.toWorld(p); return this.ll([q[0] + dx, q[1] + dy]); }));
    }
    this.store.atlas[d.coll][d.id] = d.work; this.m.setAtlas(this.store.atlas); this.v.dirty();
    d.work = clone(d.work);
    return true;
  }
  pointerUp(e) {
    const d = this.drag; if (!d) return false; this.drag = null;
    try { this.v.el.map.releasePointerCapture(e.pointerId); } catch (err) {}
    if (d.moved) { this.undoStack.push({coll: d.coll, id: d.id, before: d.before}); this.renderBar(); this.store.setItem(d.coll, d.id, this.store.atlas[d.coll][d.id]); this.refreshGeoFields(); }
    return true;
  }
  insertVertex(coll, item, h) { const key = coll === 'zones' ? 'rings' : 'parts'; const w = clone(item); w[key][h.ri].splice(h.pi, 0, this.ll(h.w)); this.store.atlas[coll][item.id] = w; this.m.setAtlas(this.store.atlas); }
  removeVertex(coll, item, h) {
    const key = coll === 'zones' ? 'rings' : 'parts', min = coll === 'zones' ? 3 : 2; const w = clone(item);
    if (w[key][h.ri].length <= min) { this.notify(`A ${coll === 'zones' ? 'zone needs three' : 'route needs two'} points at least.`, 'warn'); return; }
    w[key][h.ri].splice(h.pi, 1); this.put(coll, w);
  }
  markerDown(id, e) {
    if (this.tool !== 'select' || e.button !== 0) return;
    const m = (this.v.markers || []).find(x => x.p.id === id); if (!m) return;
    const r0 = this.v.el.map.getBoundingClientRect(); let moved = false; const start = [e.clientX, e.clientY];
    const mv = ev => { if (!moved && Math.hypot(ev.clientX - start[0], ev.clientY - start[1]) < 4) return; moved = true; m.drag = this.screenToWorld(ev.clientX - r0.left, ev.clientY - r0.top); this.v.dirty(); };
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
      if (moved && m.drag) { const it = clone(this.m.atlas.places[id]); it.at = this.ll(m.drag); m.drag = null; this._swallowClick = true; this.put('places', it).then(() => this.refreshGeoFields()); } };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  }
  markerClick(id) { if (this._swallowClick) { this._swallowClick = false; return true; } if (this.tool !== 'select') return true; this.edit(id); return true; }
  click(sx, sy, e) {
    const w = this.screenToWorld(sx, sy);
    if (this.tool === 'select') { const h = this.v.renderer.hitTest(sx, sy); if (h) { this.edit(h.zone || h.id); return true; } const lab = this.labelAt(sx, sy); if (lab) { this.edit(lab); return true; } return false; }
    if (this.tool === 'zones' || this.tool === 'routes') {
      if (!this.draw) this.draw = {kind: this.tool, pts: []};
      const d = this.draw;
      if (d.kind === 'zones' && d.pts.length >= 3) { const [fx, fy] = this.v.toScreen(d.pts[0]); if (Math.hypot(fx - sx, fy - sy) < 10) { this.finishDraw(); return true; } }
      if (e.detail >= 2) { this.finishDraw(); return true; }
      d.pts.push(w); this.v.dirty(); return true;
    }
    if (this.tool === 'places') { this.create('places', {at: this.ll(w)}); return true; }
    if (this.tool === 'labels') { this.create('labels', {at: this.ll(w), text: 'New label'}); return true; }
    if (this.tool === 'auras') { this.create('auras', {at: this.ll(w), radius: Math.round(this.v.renderer.mpp() * 60), color: 'rgba(255,205,120,.34)', mode: 'glow'}); return true; }
    return false;
  }
  labelAt(sx, sy) {
    const st = this.v.st; let best = null, bd = 16;
    for (const coll of ['labels', 'auras']) for (const l of Object.values(this.m.atlas[coll])) { if (!l.at || !this.m.visible(l, coll, st, {ignoreLayer: true})) continue; const [x, y] = this.v.toScreen(this.proj.toWorld(l.at)); const d = Math.hypot(x - sx, y - sy); if (d < bd) { bd = d; best = l.id; } }
    return best;
  }
  consumesDblClick() { return this.tool !== 'select' || !!this.draw; }
  finishDraw() {
    const d = this.draw; this.draw = null; this.v.dirty();
    if (!d) return;
    const pts = d.pts.filter((p, i, a) => !i || Math.hypot(p[0] - a[i - 1][0], p[1] - a[i - 1][1]) > 1e-12).map(w => this.ll(w));
    if (d.kind === 'zones') { if (pts.length < 3) return this.notify('A zone needs at least three corners.', 'warn'); this.create('zones', {rings: [pts]}); }
    else { if (pts.length < 2) return this.notify('A route needs at least two points.', 'warn'); this.create('routes', {parts: [pts]}); }
  }
  escape() { if (this.draw) { this.draw = null; this.v.dirty(); return true; } if (this.tool !== 'select') { this.setTool('select'); return true; } if (this.panel && this.panel.type !== 'home') { this.back(); return true; } return false; }
  key(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { this.undo(); return true; }
    if (this.draw && e.key === 'Enter') { this.finishDraw(); return true; }
    if (this.draw && e.key === 'Backspace') { this.draw.pts.pop(); this.v.dirty(); return true; }
    if (e.key === 'Delete' && this.panel && this.panel.type === 'item' && !e.target.closest('input,textarea')) { this.deleteCurrent(); return true; }
    const t = {v: 'select', p: 'places', z: 'zones', r: 'routes', t: 'labels', g: 'auras'}[e.key.toLowerCase()];
    if (t && !e.ctrlKey && !e.metaKey && !e.altKey) { this.setTool(t); return true; }
    return false;
  }
  acceptsDrop(e) { return !!this.A.resolveDrop && [...(e.dataTransfer?.types || [])].includes('text/plain'); }
  async onDrop(e, sx, sy) {
    let data; try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (err) { return; }
    const doc = await this.A.resolveDrop(data); if (!doc) return;
    const w = this.screenToWorld(sx, sy);
    if (doc.documentName === 'Actor' && e.shiftKey) return this.create('people', {name: doc.name, img: doc.img, uuid: doc.uuid, uuidName: doc.name, at: []});
    this.create('places', {at: this.ll(w), name: doc.name, uuid: doc.uuid, uuidName: `${doc.documentName}: ${doc.name}`, img: doc.documentName === 'Actor' ? doc.img : undefined});
  }

  drawOverlay(x) {
    const v = this.v;
    if (this.draw && this.draw.pts.length) {
      const pts = this.draw.pts.map(w => v.toScreen(w)); const cur = this.draw.cursor ? v.toScreen(this.draw.cursor) : null;
      x.save(); x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); if (cur) x.lineTo(cur[0], cur[1]); if (this.draw.kind === 'zones' && pts.length > 2) x.closePath();
      x.strokeStyle = '#ffd98a'; x.lineWidth = 2; x.setLineDash([6, 4]); x.stroke(); x.setLineDash([]);
      if (this.draw.kind === 'zones' && pts.length > 2) { x.fillStyle = 'rgba(255,217,138,.08)'; x.fill(); }
      pts.forEach(([a, b], i) => { x.beginPath(); x.arc(a, b, i ? 4 : 6, 0, 6.283); x.fillStyle = i ? '#ffd98a' : '#fff'; x.fill(); x.strokeStyle = '#1a1510'; x.lineWidth = 1.5; x.stroke(); });
      x.restore();
    }
    if (this.tool === 'select') for (const h of this.handles()) {
      const [a, b] = v.toScreen(h.w); x.beginPath();
      if (h.kind === 'mid') { x.arc(a, b, 3.5, 0, 6.283); x.fillStyle = 'rgba(255,217,138,.25)'; x.fill(); x.strokeStyle = '#ffd98a'; x.lineWidth = 1; x.stroke(); }
      else { x.arc(a, b, h.kind === 'pt' ? 7 : 5, 0, 6.283); x.fillStyle = '#ffd98a'; x.fill(); x.strokeStyle = '#1a1510'; x.lineWidth = 1.5; x.stroke(); }
    }
  }

  /* ================= items ================= */
  defaults(coll) {
    const st = this.v.st, r = this.m.realm(st.realm), lvl = r.levels.length > 1 ? st.level : undefined;
    const layers = this.m.layersFor(st.realm, st.level);
    const base = {realm: st.realm, level: lvl};
    switch (coll) {
      case 'places': { const cats = this.m.categoriesFor(st.realm, st.level); return Object.assign(base, {name: 'New place', cat: cats[0] && cats[0].id, precision: undefined}); }
      case 'zones': return Object.assign(base, {name: 'New zone', layer: (layers.find(l => /domain|terr|zone/i.test(l.id)) || layers[0] || {}).id, style: this.m.atlas.styles.hatched ? 'hatched' : undefined, color: '#d8b45a', container: true});
      case 'routes': return Object.assign(base, {name: 'New route', layer: (layers.find(l => /route|road|path|patrol|trod|byway/i.test(l.id)) || {}).id, color: '#b9b0a2', style: this.m.atlas.styles.patrol ? 'patrol' : undefined});
      case 'labels': return Object.assign(base, {size: 14, font: 'sc', ls: 3, color: '#d8cbb0', halo: 'rgba(10,8,12,.85)'});
      case 'auras': return base;
      case 'people': return {name: 'New person', realms: [st.realm]};
      case 'pages': return {title: 'New page', realm: st.realm, html: '<p></p>'};
      case 'categories': return {name: 'New category', icon: 'pin', realm: st.realm, order: Object.keys(this.m.atlas.categories).length};
      case 'factions': return {name: 'New faction', short: 'Faction', color: '#c9a46a', order: Object.keys(this.m.atlas.factions).length};
      case 'layers': return {name: 'New layer', on: true, realm: st.realm, order: Object.keys(this.m.atlas.layers).length};
      case 'realms': { const o = this.m.realmList.length; return {name: 'New realm', icon: 'star', order: o, levels: [{id: 'main', name: 'Main', show: ['main']}], terms: {places: 'Places', people: 'People', zones: 'Zones', pages: 'Chronicle'}}; }
      case 'styles': return {width: 2, fillAlpha: 0.12};
    }
    return {};
  }
  async create(coll, init = {}) {
    const it = Object.assign(this.defaults(coll), init);
    if (coll === 'pages' && !init.order) it.order = Object.keys(this.m.atlas.pages).length + 1;
    const nm = init.name || init.title || '';
    it.id = nm && !['labels', 'auras'].includes(coll) ? this.newId(coll, nm) : this.freshId(coll);
    for (const k of Object.keys(it)) if (it[k] === undefined) delete it[k];
    await this.put(coll, it);
    if (this.tool !== 'select') this.setTool('select');
    this.v.buildMarkers();
    this.edit(it.id, {isNew: true, coll});
  }
  edit(id, o = {}) {
    const r = this.m.get(id) || (o.coll && {coll: o.coll, item: this.store.atlas[o.coll][id]}); if (!r) return;
    const coll = o.coll || r.coll;
    this.panel = {type: 'item', coll, id, isNew: !!o.isNew, from: this.panel && this.panel.type !== 'item' ? this.panel : (this.panel && this.panel.from) || {type: 'home'}};
    if (['places', 'zones', 'routes', 'labels', 'auras'].includes(coll)) { const it = r.item; const home = this.m.homeOf(it); if (home && home.realm !== this.v.st.realm) this.v.setRealm(home.realm, true); if (home && !this.m.inLevel(it, this.v.st)) this.v.setLevel(home.level, true); if (it.layer && !this.v.layerOn(it.layer)) this.v.setLayer(it.layer, true); this.v.setSel(id); }
    this.renderPane(); this.v.dirty();
  }
  openItem(id) { this.edit(id); return true; }
  back() { const f = this.panel && this.panel.from; this.panel = f || {type: 'home'}; this.v.setSel(null); this.renderPane(); }

  /* ================= option helpers ================= */
  realmOpts() { return this.m.realmList.map(r => [r.id, r.name]); }
  levelOpts(realm) { const r = this.m.atlas.realms[realm]; return r ? r.levels.map(l => [l.id, l.name || l.id]) : []; }
  allLevelOpts() { const out = []; for (const r of this.m.realmList) for (const l of r.levels) if (!out.some(o => o[0] === l.id)) out.push([l.id, `${l.name || l.id}`]); return out; }
  catOpts(realm) { return sortBy(Object.values(this.m.atlas.categories).filter(c => !realm || c.realm == null || c.realm === realm), c => c.order ?? 0).map(c => [c.id, c.name + (c.realm && c.realm !== realm ? ` (${c.realm})` : '')]); }
  facOpts() { return sortBy(Object.values(this.m.atlas.factions), f => f.order ?? 0, 'name').map(f => [f.id, f.name]); }
  layerOpts(realm) { return sortBy(Object.values(this.m.atlas.layers).filter(L => L.realm == null || [].concat(L.realm).includes(realm)), l => l.order ?? 0).map(L => [L.id, L.name]); }
  styleOpts() { return Object.keys(this.m.atlas.styles).sort().map(k => [k, k]); }
  precOpts() { return Object.entries(this.m.atlas.precisions || {}).map(([k, p]) => [k, p.name]); }
  statusOpts() { return Object.entries(this.m.atlas.statuses || {}).map(([k, s]) => [k, s.name]); }
  refList(colls) {
    const out = [];
    for (const c of colls) for (const it of Object.values(this.m.atlas[c])) { if (it.decor) continue; const realm = it.realm && this.m.atlas.realms[it.realm]; out.push({id: it.id, label: `${it.name || it.title || it.id}${realm ? ` · ${realm.name}` : ''}${c === 'people' ? ' · person' : c === 'zones' ? ' · zone' : c === 'routes' ? ' · route' : ''}`}); }
    return sortBy(out, 'label');
  }
  realmKeyOpts() { const out = []; for (const r of this.m.realmList) { out.push([r.id, r.name + ' (all levels)']); if (r.levels.length > 1) for (const l of r.levels) out.push([`${r.id}:${l.id}`, `${r.name} · ${l.name || l.id}`]); } return out; }

  /* ================= field specs ================= */
  common(coll) {
    const self = this;
    return {
      realm: {k: 'realm', t: 'select', label: 'Realm', opts: () => self.realmOpts(), none: 'All realms'},
      level: {k: 'level', t: 'select', label: 'Level', opts: d => self.levelOpts(d.realm), none: 'All levels', show: d => d.realm && (self.m.atlas.realms[d.realm] || {levels: []}).levels.length > 1},
      layer: {k: 'layer', t: 'select', label: 'Layer', opts: d => self.layerOpts(d.realm), none: '(always shown)'},
      faction: {k: 'faction', t: 'select', label: 'Faction', opts: () => self.facOpts()},
      color: {k: 'color', t: 'color', label: 'Colour', help: 'overrides faction/category'},
      icon: {k: 'icon', t: 'icon', label: 'Icon'},
      gm: {k: 'gm', t: 'check', label: 'Storyteller only', help: 'hidden from players'},
      html: {k: 'html', t: 'html', label: 'Description', wide: true},
      img: {k: 'img', t: 'image', label: 'Picture', wide: true},
      notes: {k: 'notes', t: 'list', label: 'Callouts & secrets', wide: true, addLabel: 'Add callout', sub: [{k: 'title', t: 'text', label: 'Heading'}, {k: 'kind', t: 'select', label: 'Style', opts: NOTE_KINDS, none: 'Plain'}, {k: 'gm', t: 'check', label: 'Storyteller only'}, {k: 'html', t: 'textarea', label: 'Text', wide: true, rows: 3}]},
      facts: {k: 'facts', t: 'list', label: 'Facts', wide: true, addLabel: 'Add fact', sub: [{k: 'k', t: 'text', label: 'Label'}, {k: 'v', t: 'text', label: 'Value'}]},
      tags: {k: 'tags', t: 'list', label: 'Tags', wide: true, addLabel: 'Add tag', sub: [{k: 'text', t: 'text', label: 'Text'}, {k: 'color', t: 'color', label: 'Colour'}]},
      people: {k: 'people', t: 'refs', label: 'Figures here', wide: true, refs: () => self.refList(['people'])},
      links: {k: 'links', t: 'list', label: 'See also / crossings', wide: true, addLabel: 'Add link', sub: [{k: 'id', t: 'ref', label: 'Item', refs: () => self.refList(['places', 'zones', 'routes', 'people'])}, {k: 'label', t: 'text', label: 'Button text (optional)'}]},
      anchor: {k: 'anchor', t: 'ref', label: 'Anchor', help: 'its twin in another realm or level', wide: true, refs: () => self.refList(['places', 'zones'])},
      uuid: {k: 'uuid', t: 'text', label: 'Linked Foundry document', help: 'UUID: drop an Actor, Journal or Scene onto this box', wide: true, ph: 'Actor.xxxxxxxx'},
      src: {k: 'src', t: 'text', label: 'Source / credit', wide: true},
      order: {k: 'order', t: 'number', label: 'Sort order'},
      kicker: {k: 'kicker', t: 'text', label: 'Kicker', help: 'small line above the name'},
      sub: {k: 'sub', t: 'text', label: 'Subtitle', wide: true}
    };
  }
  styleFields() {
    const self = this;
    return [
      {k: '_styleName', t: 'select', label: 'Named style', opts: () => self.styleOpts(), none: '(simple style below)'},
      {k: '_s.width', t: 'number', label: 'Line width', show: d => !d._styleName},
      {k: '_s.dash', t: 'select', label: 'Line', opts: [['solid', 'Solid'], ['dashed', 'Dashed'], ['dotted', 'Dotted'], ['long', 'Long dashes']], none: false, show: d => !d._styleName},
      {k: '_s.fillAlpha', t: 'number', label: 'Fill opacity (0–1)', show: d => !d._styleName && d._coll === 'zones'},
      {k: '_s.pattern', t: 'select', label: 'Pattern', opts: [['ne', 'Hatched ／'], ['nw', 'Hatched ＼'], ['dot', 'Dots'], ['h', 'Lines'], ['grid', 'Grid'], ['cross', 'Crosses'], ['glyph', 'Icon tiles']], none: 'None', show: d => !d._styleName && d._coll === 'zones'},
      {k: '_s.glyph', t: 'icon', label: 'Tile icon', show: d => !d._styleName && d._s && d._s.pattern === 'glyph'},
      {k: '_s.glow', t: 'check', label: 'Glow', show: d => !d._styleName},
      {k: '_s.flow', t: 'check', label: 'Animated flow', show: d => !d._styleName},
      {k: '_styleJson', t: 'json', label: 'Custom style (advanced)', help: 'JSON; overrides the two options above', wide: true, rows: 4}
    ];
  }
  /** Convert between stored style and form-friendly fields. */
  styleIn(d, coll) {
    d._coll = coll; const s = d.style; delete d.style;
    if (typeof s === 'string') d._styleName = s;
    else if (s && (Array.isArray(s) || !this.isSimple(s))) d._styleJson = s;
    else if (s) d._s = {width: s.width, dash: !s.dash ? 'solid' : s.dash[0] <= 2 ? 'dotted' : s.dash[0] >= 10 ? 'long' : 'dashed', fillAlpha: s.fillAlpha, pattern: s.pattern && s.pattern.kind, glyph: s.pattern && s.pattern.glyph, glow: s.glow ? true : undefined, flow: s.flow ? true : undefined};
    else d._s = {width: coll === 'zones' ? 1.8 : 2.6, dash: coll === 'routes' ? 'dashed' : 'solid', fillAlpha: 0.12};
    return d;
  }
  isSimple(s) { return Object.keys(s).every(k => ['width', 'dash', 'fillAlpha', 'pattern', 'glow', 'flow'].includes(k)) && (!s.pattern || Object.keys(s.pattern).every(k => ['kind', 'glyph', 'color', 'bg', 'size', 'width'].includes(k))); }
  styleOut(d) {
    let style;
    if (d._styleJson) style = d._styleJson;
    else if (d._styleName) style = d._styleName;
    else if (d._s) { const s = d._s, o = {}; if (s.width != null) o.width = s.width; o.dash = {solid: undefined, dashed: [6, 4], dotted: [1.5, 4], long: [12, 6]}[s.dash || 'solid']; if (s.fillAlpha != null) o.fillAlpha = s.fillAlpha;
      if (s.pattern) o.pattern = {kind: s.pattern, glyph: s.pattern === 'glyph' ? (s.glyph || 'star') : undefined, color: 'auto:0.4', bg: 'auto:0.06', size: s.pattern === 'glyph' ? 22 : 8, width: 1.1};
      if (s.glow) o.glow = {width: 8, alpha: 0.2}; if (s.flow) o.flow = 1; for (const k of Object.keys(o)) if (o[k] === undefined) delete o[k]; if (o.pattern) for (const k of Object.keys(o.pattern)) if (o.pattern[k] === undefined) delete o.pattern[k]; style = o; }
    delete d._styleJson; delete d._styleName; delete d._s; delete d._coll;
    if (style !== undefined) d.style = style; else delete d.style;
    return d;
  }
  fields(coll) {
    const C = this.common(coll), self = this, posLabel = this.proj.kind === 'mercator' ? 'Position [lat, lng]' : 'Position [x, y]';
    switch (coll) {
      case 'places': return [{k: 'name', t: 'text', label: 'Name', wide: true}, C.sub, C.realm, C.level, {k: 'cat', t: 'select', label: 'Category', opts: d => self.catOpts(d.realm)}, C.faction, C.layer,
        {k: 'precision', t: 'select', label: 'Placement', opts: () => self.precOpts(), show: () => self.precOpts().length}, C.color, C.icon, C.gm, {k: 'hidden', t: 'check', label: 'No map pin', help: 'listed but not drawn'},
        C.html, C.img, C.notes, C.people, {k: 'zone', t: 'ref', label: 'Inside zone', wide: true, refs: () => self.refList(['zones'])}, C.anchor, C.links, C.facts, C.tags, C.uuid,
        {k: 'at', t: 'coords', label: posLabel}, {k: 'zoom', t: 'number', label: 'Focus zoom'}, C.kicker, C.order, C.src];
      case 'zones': return [{k: 'name', t: 'text', label: 'Name', wide: true}, C.sub, C.realm, C.level, C.layer, C.faction, C.color, ...this.styleFields(), C.gm,
        {k: 'container', t: 'check', label: 'Lists places inside it', help: '“Lies within”'}, {k: 'noLabel', t: 'check', label: 'No name on the map'},
        {k: 'label.text', t: 'text', label: 'Map label text'}, {k: 'label.sub', t: 'text', label: 'Map label second line'}, {k: 'label.minZoom', t: 'number', label: 'Label min zoom'},
        C.html, C.img, {k: 'fillImage.src', t: 'image', label: 'Picture inside the zone', wide: true}, C.notes,
        {k: 'owners', t: 'refs', label: 'Claimed by (domain owners)', wide: true, refs: () => self.refList(['people'])}, C.people,
        {k: 'rating.label', t: 'text', label: 'Rating name', ph: 'Danger'}, {k: 'rating.value', t: 'number', label: 'Rating'}, {k: 'rating.max', t: 'number', label: 'Rating max', ph: '5'}, {k: 'rating.text', t: 'text', label: 'Rating words'},
        {k: 'ref', t: 'ref', label: 'Clicking opens', help: 'show another entry instead', wide: true, refs: () => self.refList(['places'])}, C.anchor, C.links, C.facts, C.tags, C.uuid, C.kicker, {k: 'order', t: 'number', label: 'Draw order', help: 'higher is on top'}, C.src];
      case 'routes': return [{k: 'name', t: 'text', label: 'Name', wide: true}, C.sub, C.realm, C.level, C.layer, C.faction, C.color, ...this.styleFields(), {k: 'curve', t: 'number', label: 'Curve', help: '0.2 bends each segment'}, C.gm,
        C.html, C.notes, {k: 'ends', t: 'refs', label: 'Ends at', wide: true, refs: () => self.refList(['places', 'zones'])}, C.people, C.links, C.facts, C.tags, C.uuid, C.kicker, C.order, C.src];
      case 'labels': return [{k: 'text', t: 'text', label: 'Text', wide: true}, C.realm, C.level, C.layer, {k: 'size', t: 'number', label: 'Size (px)'}, {k: 'font', t: 'select', label: 'Font', opts: [['sc', 'Small caps'], ['head', 'Book serif'], ['body', 'Sans'], ['title', 'Blackletter']], none: 'Default'},
        {k: 'italic', t: 'check', label: 'Italic'}, {k: 'ls', t: 'number', label: 'Letter spacing'}, {k: 'color', t: 'color', label: 'Colour'}, {k: 'halo', t: 'color', label: 'Halo'}, {k: 'glow', t: 'color', label: 'Glow'},
        {k: 'angle', t: 'number', label: 'Angle (°)'}, {k: 'minZoom', t: 'number', label: 'Min zoom'}, {k: 'maxZoom', t: 'number', label: 'Max zoom'}, {k: 'noAvoid', t: 'check', label: 'Always draw (ignore collisions)'}, C.gm, {k: 'at', t: 'coords', label: posLabel}];
      case 'auras': return [{k: 'name', t: 'text', label: 'Name (tooltip)', wide: true}, C.realm, C.level, C.layer, {k: 'mode', t: 'select', label: 'Kind', opts: [['glow', 'Glow'], ['dark', 'Shadow'], ['desat', 'Grey-out (Banality)'], ['vortex', 'Vortex'], ['moon', 'Moon']], none: false},
        {k: 'color', t: 'color', label: 'Colour'}, {k: 'radius', t: 'number', label: this.proj.kind === 'mercator' ? 'Radius (m)' : 'Radius (map units)'}, {k: 'px', t: 'number', label: 'Minimum radius (px)'}, {k: 'pulse', t: 'check', label: 'Pulse'}, {k: 'flicker', t: 'check', label: 'Flicker'}, C.gm, {k: 'at', t: 'coords', label: posLabel}];
      case 'people': return [{k: 'name', t: 'text', label: 'Name', wide: true}, {k: 'kicker', t: 'text', label: 'Clan / kind line', wide: true, ph: 'Ventrue · 8th generation'}, {k: 'sub', t: 'text', label: 'Role', wide: true}, C.faction, {k: 'tag', t: 'text', label: 'Short tag', ph: 'Ventrue'},
        {k: 'status', t: 'select', label: 'Status', opts: () => self.statusOpts()}, C.icon, C.color, C.gm, {k: 'realms', t: 'multi', label: 'Listed under', help: 'which realms and levels show this person', wide: true, opts: () => self.realmKeyOpts()},
        C.img, C.html, C.notes, {k: 'at', t: 'refs', label: 'Where to find them', wide: true, refs: () => self.refList(['places', 'zones', 'routes'])},
        {k: 'relations.title', t: 'text', label: 'Relations heading', ph: 'Attitudes'}, {k: '_rel', t: 'list', label: 'Relations', wide: true, addLabel: 'Add relation', sub: [{k: 'a', t: 'text', label: 'Who'}, {k: 'b', t: 'text', label: 'Attitude'}]},
        C.facts, C.uuid, C.order, C.src];
      case 'pages': return [{k: 'title', t: 'text', label: 'Title', wide: true}, C.realm, {k: 'levels', t: 'multi', label: 'Only on levels', help: 'none ticked = every level', opts: d => self.levelOpts(d.realm), show: d => d.realm && self.levelOpts(d.realm).length > 1, wide: true},
        {k: 'tab', t: 'select', label: 'Shown in', opts: TABS, none: false}, {k: 'order', t: 'number', label: 'Order'}, C.gm,
        {k: '_gmhelp', t: 'info', html: '<p class="hint">Inside the text, <code>&lt;span class="gm-only"&gt;…&lt;/span&gt;</code> hides a passage from players; <code>&lt;button data-link="id"&gt;</code> opens an entry. Foundry links like <code>@UUID[…]</code> work too.</p>'},
        {k: 'html', t: 'html', label: 'Text', wide: true, rows: 12}];
      case 'categories': return [{k: 'name', t: 'text', label: 'Name', wide: true}, {k: 'realm', t: 'select', label: 'Realm', opts: () => self.realmOpts(), none: 'All realms'}, {k: 'levels', t: 'multi', label: 'Only on levels', opts: d => d.realm ? self.levelOpts(d.realm) : self.allLevelOpts(), wide: true},
        {k: 'icon', t: 'icon', label: 'Icon'}, {k: 'color', t: 'color', label: 'Colour', help: 'used when the place has no faction'}, {k: 'order', t: 'number', label: 'Order'},
        {k: 'pin.border', t: 'select', label: 'Pin ring', opts: [['solid', 'Solid'], ['dashed', 'Dashed'], ['dotted', 'Dotted'], ['double', 'Double']], none: 'Default'}, {k: 'pin.glow', t: 'check', label: 'Pin glows'}, {k: 'pin.anim', t: 'select', label: 'Pin animation', opts: [['pulse', 'Pulse']], none: 'None'}];
      case 'factions': return [{k: 'name', t: 'text', label: 'Name', wide: true}, {k: 'short', t: 'text', label: 'Short name'}, {k: 'color', t: 'color', label: 'Colour'}, {k: 'order', t: 'number', label: 'Order'}, {k: 'html', t: 'html', label: 'Notes', wide: true, rows: 4}];
      case 'layers': return [{k: 'name', t: 'text', label: 'Name', wide: true}, {k: 'realm', t: 'multi', label: 'Realms', help: 'none ticked = every realm', opts: () => self.realmOpts(), wide: true}, {k: 'levels', t: 'multi', label: 'Levels', help: 'none ticked = every level', opts: () => self.allLevelOpts(), wide: true},
        {k: 'on', t: 'check', label: 'On by default'}, {k: 'icon', t: 'icon', label: 'Map-bar button', none: 'none'}, {k: 'hotkey', t: 'text', label: 'Hotkey', ph: 'd'}, {k: 'order', t: 'number', label: 'Order'}];
      case 'realms': return [{k: 'name', t: 'text', label: 'Name'}, {k: 'icon', t: 'icon', label: 'Icon'}, {k: 'order', t: 'number', label: 'Order'},
        {k: '_look', t: 'select', label: 'Apply a look', help: 'replaces colours & effects', opts: Object.entries(LOOKS).map(([k, l]) => [k, l.label]), none: '(keep current)'},
        {k: 'kicker', t: 'text', label: 'Kicker', wide: true}, {k: 'date', t: 'text', label: 'Date line', wide: true}, {k: 'banner', t: 'text', label: 'Banner', wide: true}, {k: 'credit', t: 'text', label: 'Map credit', wide: true},
        {k: 'terms.places', t: 'text', label: 'Tab: places'}, {k: 'terms.people', t: 'text', label: 'Tab: people'}, {k: 'terms.zones', t: 'text', label: 'Tab: zones'}, {k: 'terms.pages', t: 'text', label: 'Tab: chronicle'},
        {k: 'crossLabel', t: 'text', label: 'Crossing button text', ph: 'Step sideways into the Umbra', wide: true}, {k: 'crossIcon', t: 'icon', label: 'Crossing icon'},
        {k: 'bg', t: 'color', label: 'Map background'}, {k: 'theme.panel', t: 'color', label: 'Panel'}, {k: 'theme.accent', t: 'color', label: 'Accent'}, {k: 'theme.gold', t: 'color', label: 'Highlight'}, {k: 'theme.bone', t: 'color', label: 'Text'}, {k: 'theme.muted', t: 'color', label: 'Muted text'}, {k: 'theme.line', t: 'color', label: 'Rules'},
        {k: 'background.src', t: 'image', label: 'Own map picture (optional)', wide: true}, {k: 'background.filter', t: 'text', label: 'Picture filter', help: 'CSS filter, e.g. hue-rotate(140deg) brightness(.6)', wide: true},
        {k: '_levels', t: 'list', label: 'Levels (e.g. Street / Underground, Near / Deep)', wide: true, addLabel: 'Add level', sub: [{k: 'id', t: 'text', label: 'Id'}, {k: 'name', t: 'text', label: 'Name'}, {k: 'show', t: 'text', label: 'Shows items of', help: 'comma-separated level ids'}, {k: 'bg', t: 'color', label: 'Background'}, {k: 'kicker', t: 'text', label: 'Kicker'}, {k: 'crossLabel', t: 'text', label: 'Crossing text'}, {k: 'background.src', t: 'image', label: 'Own picture', wide: true}, {k: 'background.filter', t: 'text', label: 'Picture filter', wide: true}, {k: 'effects', t: 'json', label: 'Effects (JSON)', wide: true, rows: 3}]},
        {k: 'legend', t: 'list', label: 'Legend', wide: true, addLabel: 'Add legend entry', sub: [{k: 'label', t: 'text', label: 'Label'}, {k: 'color', t: 'color', label: 'Colour'}, {k: 'kind', t: 'select', label: 'Swatch', opts: [['fill', 'Hatched box'], ['dash', 'Dashed box'], ['line', 'Line'], ['dot', 'Dot']], none: false}]},
        {k: 'effects', t: 'json', label: 'Effects (advanced)', help: 'stars, waves, particles, fog, vignette, gradient', wide: true, rows: 4},
        {k: 'styles', t: 'json', label: 'Base-map styles (advanced)', wide: true, rows: 4}, {k: 'echo', t: 'json', label: 'Echo another realm (advanced)', wide: true, rows: 2}];
      case 'styles': return [{k: '_name', t: 'text', label: 'Name', wide: true}, {k: '_body', t: 'json', label: 'Style (JSON: one pass or a list of passes)', wide: true, rows: 14},
        {k: '_help', t: 'info', html: '<p class="hint">Keys: <code>stroke</code>, <code>width</code> (number or [[zoom,width]…]), <code>dash</code>, <code>flow</code>, <code>strokeAlpha</code>, <code>fill</code>, <code>fillAlpha</code>, <code>pattern</code> {kind: ne|nw|dot|h|v|grid|cross|glyph, color, bg, size, width, glyph}, <code>glow</code> {color,width,alpha}, <code>casing</code> {color,width}, <code>minZoom</code>, <code>maxZoom</code>. Colours may be <code>auto:0.3</code> (item colour at 30%).</p>'}];
    }
    return [];
  }
  /** Prepare stored data for a form. */
  toForm(coll, it) {
    const d = clone(it) || {};
    if (coll === 'zones' || coll === 'routes') this.styleIn(d, coll);
    if (coll === 'people') d._rel = ((d.relations && d.relations.rows) || []).map(([a, b]) => ({a, b}));
    if (coll === 'realms') { d._levels = (d.levels || []).map(l => Object.assign({}, l, {show: (l.show || []).join(', ')})); }
    if (coll === 'layers' && d.realm != null) d.realm = [].concat(d.realm);
    if (coll === 'styles') { d._name = it.id; d._body = clone(it); delete d._body.id; }
    return d;
  }
  fromForm(coll, d, orig) {
    if (coll === 'zones' || coll === 'routes') this.styleOut(d);
    if (coll === 'people') { const rows = (d._rel || []).filter(r => r.a || r.b).map(r => [r.a || '', r.b || '']); delete d._rel; if (rows.length) d.relations = Object.assign({}, d.relations || {}, {rows}); else if (d.relations) delete d.relations.rows; if (d.relations && !d.relations.rows) delete d.relations; }
    if (coll === 'realms') {
      d.levels = (d._levels || []).filter(l => l.id).map(l => Object.assign({}, (orig.levels || []).find(o => o.id === l.id) || {}, l, {id: safeId(l.id), show: String(l.show || l.id).split(/[\s,]+/).filter(Boolean)}));
      if (!d.levels.length) d.levels = [{id: 'main', name: 'Main', show: ['main']}];
      delete d._levels;
      if (d._look) { applyLook(d, d._look, {imageMap: this.m.proj.kind === 'plane' && !!this.m.atlas.background}); } delete d._look;
    }
    if (coll === 'layers') { if (Array.isArray(d.realm) && !d.realm.length) delete d.realm; else if (Array.isArray(d.realm) && d.realm.length === 1) d.realm = d.realm[0]; if (!d.on) d.on = false; }
    for (const k of Object.keys(d)) if (k.startsWith('_') && k !== '_name' && k !== '_body') delete d[k];
    return d;
  }

  /* ================= pane ================= */
  ctx() {
    return {resolveUrl: s => this.v.resolveUrl(s), pickImage: this.A.pickImage ? (cur, cb) => this.A.pickImage(cur, cb) : (cur, cb) => { const p = window.prompt('Image path or URL', cur || ''); if (p != null) cb(p); }, richEditor: this.A.richEditor, data: this.panel && this.panel.data};
  }
  renderPane() {
    const P = this.panel || {type: 'home'}, pane = this.v.el.pane;
    this.v.root.querySelectorAll('.wca-tabs button').forEach(b => b.setAttribute('aria-selected', 'false'));
    if (P.type === 'item') return this.renderItemForm();
    if (P.type === 'coll') return this.renderCollection(P.coll);
    if (P.type === 'general') return this.renderGeneral();
    if (P.type === 'io') return this.renderIO();
    // home
    const a = this.m.atlas, count = c => Object.keys(a[c]).length;
    pane.innerHTML = `<div class="ed"><div class="ed-h"><h2>Edit atlas</h2><p class="hint">Pick a tool on the map (top centre) to add places, zones, routes, labels and glows, or click anything on the map to edit it. Everything is saved as you go; <b>Undo</b> steps back.</p></div>
      <div class="ed-grid">
        ${[['general', 'gear', 'Title, map & view', a.title], ['coll:realms', 'moon', 'Realms & levels', `${count('realms')} realms`], ['coll:layers', 'layers', 'Layers', count('layers')], ['coll:categories', 'pin', 'Place categories', count('categories')],
          ['coll:factions', 'crown', 'Factions & colours', count('factions')], ['coll:people', 'user', 'People', count('people')], ['coll:pages', 'book', 'Chronicle pages', count('pages')], ['coll:styles', 'poly', 'Zone & route styles', count('styles')],
          ['coll:places', 'pin', 'All places', count('places')], ['coll:zones', 'poly', 'All zones', count('zones')], ['coll:routes', 'line', 'All routes', count('routes')], ['coll:labels', 'text', 'Labels & glows', count('labels') + count('auras')], ['io', 'download', 'Import / export', '']]
          .map(([k, ic, t, n]) => `<button type="button" class="ed-card" data-open="${k}">${svg(ic)}<span><b>${esc(t)}</b><small>${esc(String(n))}</small></span></button>`).join('')}
      </div></div>`;
    pane.onclick = e => { const b = e.target.closest('[data-open]'); if (!b) return; const k = b.dataset.open; this.panel = k.startsWith('coll:') ? {type: 'coll', coll: k.slice(5), from: {type: 'home'}} : {type: k, from: {type: 'home'}}; this.renderPane(); };
  }
  renderCollection(coll) {
    const pane = this.v.el.pane, a = this.m.atlas; const q = (this.panel.q || '').toLowerCase();
    let items = Object.values(a[coll]);
    if (coll === 'labels') items = items.concat(Object.values(a.auras).map(x => Object.assign({_coll: 'auras'}, x)));
    items = items.filter(it => !q || JSON.stringify([it.name, it.title, it.text, it.id]).toLowerCase().includes(q));
    items = sortBy(items, it => it.realm || '', it => it.order ?? 0, it => it.name || it.title || it.text || it.id);
    const label = it => it.name || it.title || it.text || it.id;
    const sub = it => [it.realm && a.realms[it.realm] ? a.realms[it.realm].name : '', it.level || '', it._coll === 'auras' ? 'glow' : '', it.layer && a.layers[it.layer] ? a.layers[it.layer].name : '', coll === 'categories' || coll === 'layers' ? (it.realm ? [].concat(it.realm).join(', ') : 'all realms') : ''].filter(Boolean).join(' · ');
    const canAdd = !['places', 'zones', 'routes', 'labels'].includes(coll);
    pane.innerHTML = `<div class="ed"><div class="ed-top"><button type="button" class="back" data-ed="back">${svg('back', 2)} Back</button>${canAdd ? `<button type="button" class="lnk" data-ed="add">${svg('plus', 2)} New ${esc((TYPE_NAMES[coll] || coll).toLowerCase())}</button>` : ''}${coll === 'people' && this.A.pickActors ? `<button type="button" class="lnk" data-ed="actors">${svg('user')} From Actors…</button>` : ''}</div>
      <h2>${esc({realms: 'Realms & levels', layers: 'Layers', categories: 'Place categories', factions: 'Factions', people: 'People', pages: 'Chronicle pages', styles: 'Styles', places: 'Places', zones: 'Zones', routes: 'Routes', labels: 'Labels & glows'}[coll] || coll)} <span class="n">${items.length}</span></h2>
      ${['places', 'zones', 'routes', 'labels'].includes(coll) ? `<p class="hint">Add these with the tools on the map.</p>` : ''}
      <div class="search">${svg('search')}<input class="ed-q" type="search" placeholder="Filter…" value="${esc(this.panel.q || '')}"></div>
      <div class="ed-list">${items.map(it => `<div class="ed-row"><button type="button" class="item" data-edit="${esc(it.id)}" data-coll="${esc(it._coll || coll)}" style="--c:${esc(coll === 'styles' ? '#d8cbb0' : this.m.colorOf(it))}"><span class="ic">${svg(coll === 'realms' ? (it.icon || 'sun') : coll === 'styles' ? 'poly' : coll === 'pages' ? 'book' : coll === 'layers' ? 'layers' : this.m.iconOf(it, it._coll || coll), 1.7)}</span><span class="nm">${esc(label(it))}<span class="sb">${esc(sub(it))}</span></span>${it.gm ? '<span class="tag">ST</span>' : ''}</button></div>`).join('') || '<div class="empty">Nothing here yet.</div>'}</div></div>`;
    const qi = pane.querySelector('.ed-q'); qi.oninput = () => { this.panel.q = qi.value; const pos = qi.selectionStart; this.renderCollection(coll); const n = this.v.el.pane.querySelector('.ed-q'); n.focus(); n.setSelectionRange(pos, pos); };
    pane.onclick = async e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.ed === 'back') this.back();
      else if (b.dataset.ed === 'add') { const it = Object.assign(this.defaults(coll), {}); it.id = this.freshId(coll); await this.put(coll, it); this.edit(it.id, {isNew: true, coll}); }
      else if (b.dataset.ed === 'actors') { const list = await this.A.pickActors(); for (const ac of list || []) { if (Object.values(this.m.atlas.people).some(p => p.uuid === ac.uuid)) continue; await this.put('people', {id: this.newId('people', ac.name), name: ac.name, img: ac.img, uuid: ac.uuid, uuidName: `Actor: ${ac.name}`, realms: [this.v.st.realm], kicker: ac.kicker || undefined}); } this.renderCollection(coll); if (list && list.length) this.notify(`Added ${list.length} people from Actors.`); }
      else if (b.dataset.edit) this.edit(b.dataset.edit, {coll: b.dataset.coll});
    };
  }
  renderItemForm() {
    const P = this.panel, coll = P.coll, it = this.store.atlas[coll][P.id], pane = this.v.el.pane;
    if (!it) { this.panel = P.from || {type: 'home'}; return this.renderPane(); }
    const data = this.toForm(coll, it); P.data = data;
    const fields = this.fields(coll);
    const geo = coll === 'zones' ? `${(it.rings || []).reduce((n, r) => n + r.length, 0)} corners` : coll === 'routes' ? `${(it.parts || []).reduce((n, r) => n + r.length, 0)} points` : '';
    const mapItem = ['places', 'zones', 'routes', 'labels', 'auras'].includes(coll);
    pane.innerHTML = `<div class="ed"><div class="ed-top"><button type="button" class="back" data-ed="back">${svg('back', 2)} Back</button><span class="dbtns">
        ${mapItem ? `<button type="button" class="lnk" data-ed="focus" title="Show on map">${svg('target')}</button>` : ''}
        ${coll !== 'realms' || this.m.realmList.length > 1 ? `<button type="button" class="lnk" data-ed="dup" title="Duplicate">${svg('copy')}</button>` : ''}
        <button type="button" class="lnk danger" data-ed="del" title="Delete">${svg('trash')}</button></span></div>
      <div class="dsub">${esc(TYPE_NAMES[coll] || coll)}${P.isNew ? ' · new' : ''} <span class="idtag">${esc(it.id)}</span>${geo ? ` · ${geo}` : ''}</div>
      <form class="ed-form" autocomplete="off">${renderFields(fields, data, this.ctx())}
        <details class="raw"><summary>Raw data (advanced)</summary><textarea class="mono rawjson" rows="10" spellcheck="false">${esc(JSON.stringify(it, null, 1))}</textarea><button type="button" class="btn" data-ed="rawsave">${svg('save')} Save raw data</button></details>
        <div class="ed-actions"><button type="submit" class="btn primary">${svg('check', 2)} Save</button>${P.isNew ? `<button type="button" class="btn" data-ed="cancelnew">Discard</button>` : `<button type="button" class="btn" data-ed="view">View</button>`}</div>
      </form></div>`;
    const form = pane.querySelector('form'); const ctx = this.ctx(); ctx.data = data;
    bindFields(form, fields, ctx);
    // re-render dependent fields when realm or style choice changes
    form.addEventListener('change', e => { const ef = e.target.closest('.ef'); if (!ef) return; if (['realm', '_styleName', '_s.pattern', '_look'].includes(ef.dataset.k) && !ef.closest('.lrow')) { try { const cur = readFields(form, fields, data, ctx); P.data = cur; this.rerenderForm(cur); } catch (err) {} } });
    // drop Foundry documents on the UUID field
    const uu = form.querySelector('.ef[data-k="uuid"] input');
    if (uu && this.A.resolveDrop) { uu.addEventListener('dragover', e => e.preventDefault()); uu.addEventListener('drop', async e => { e.preventDefault(); let d; try { d = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (er) { return; } const doc = await this.A.resolveDrop(d); if (doc) { uu.value = doc.uuid; uu.dataset.name = `${doc.documentName}: ${doc.name}`; const im = form.querySelector('.ef[data-k="img"] input'); if (im && !im.value && doc.img && doc.documentName === 'Actor') im.value = doc.img; } }); }
    form.onsubmit = async e => { e.preventDefault(); await this.saveForm(form, fields, ctx); };
    pane.onclick = async e => {
      const b = e.target.closest('button[data-ed]'); if (!b) return;
      const a = b.dataset.ed;
      if (a === 'back') this.back();
      else if (a === 'focus') this.v.focusItem(this.store.atlas[coll][P.id], coll);
      else if (a === 'del') this.deleteCurrent();
      else if (a === 'dup') this.duplicate();
      else if (a === 'cancelnew') { await this.store.deleteItem(coll, P.id); this.undoStack.pop(); this.renderBar(); this.v.buildMarkers(); this.back(); }
      else if (a === 'view') { this.panel = null; this.v.detailId = P.id; this.v.renderDetail(); }
      else if (a === 'rawsave') { try { const raw = JSON.parse(pane.querySelector('.rawjson').value); raw.id = P.id; await this.put(coll, raw); this.notify('Saved.'); this.renderPane(); } catch (err) { this.notify('Invalid JSON: ' + err.message, 'error'); } }
    };
    if (P.focusName) { const n = form.querySelector('.ef input[type=text]'); if (n) { n.focus(); n.select(); } P.focusName = false; }
  }
  rerenderForm(data) {
    const P = this.panel, coll = P.coll, fields = this.fields(coll), form = this.v.el.pane.querySelector('form.ed-form'); if (!form) return;
    const raw = form.querySelector('details.raw'), act = form.querySelector('.ed-actions');
    const ctx = this.ctx(); ctx.data = data;
    const tmp = document.createElement('div'); tmp.innerHTML = renderFields(fields, data, ctx);
    form.querySelectorAll(':scope > .ef').forEach(e => e.remove());
    [...tmp.children].forEach(c => form.insertBefore(c, raw));
    void act;
    if (!form._bound) { form._bound = true; }
    // bind only new nodes: rebinding the form is idempotent enough for delegated listeners, but rich editors need setup
    if (ctx.richEditor) form.querySelectorAll('.ef-html').forEach(ef => { const host = ef.querySelector('[data-html-host]'), ta = ef.querySelector('textarea'); if (host && !host._getValue) { try { if (ctx.richEditor(host, ta.value, ta)) ta.hidden = true; } catch (e) {} } });
  }
  async saveForm(form, fields, ctx) {
    const P = this.panel, coll = P.coll, orig = this.store.atlas[coll][P.id];
    let d; try { d = readFields(form, fields, P.data, ctx); } catch (err) { return this.notify(err.message, 'error'); }
    d = this.fromForm(coll, d, orig);
    const uu = form.querySelector('.ef[data-k="uuid"] input'); if (uu && uu.dataset.name) d.uuidName = uu.dataset.name; if (!d.uuid) delete d.uuidName;
    if (coll === 'styles') {
      const name = safeId(d._name) || P.id; const body = d._body || {}; if (name !== P.id) { await this.remove('styles', P.id); P.id = name; }
      await this.put('styles', Object.assign({}, body, {id: name}));
    } else {
      d.id = P.id;
      // geometry may have changed while the form was open: keep the stored version
      for (const k of ['rings', 'parts']) if (orig && orig[k] && !fields.some(f => f.k === k)) d[k] = orig[k];
      await this.put(coll, d);
    }
    P.isNew = false;
    if (['places', 'categories', 'factions', 'realms', 'layers'].includes(coll)) { this.v.applyView(); }
    this.notify(`Saved ${(TYPE_NAMES[coll] || coll).toLowerCase()} “${d.name || d.title || d.text || d._name || P.id}”.`);
    this.renderPane();
  }
  refreshGeoFields() {
    const P = this.panel; if (!P || P.type !== 'item') return; const it = this.store.atlas[P.coll][P.id]; if (!it) return;
    const f = this.v.el.pane.querySelector('.ef[data-k="at"] input'); if (f && it.at) f.value = JSON.stringify(it.at);
    const raw = this.v.el.pane.querySelector('.rawjson'); if (raw) raw.value = JSON.stringify(it, null, 1);
  }
  async deleteCurrent() {
    const P = this.panel; if (!P || P.type !== 'item') return; const it = this.store.atlas[P.coll][P.id]; if (!it) return;
    if (P.coll === 'realms' && this.m.realmList.length < 2) return this.notify('An atlas needs at least one realm.', 'warn');
    const ok = await this.confirm(`Delete ${(TYPE_NAMES[P.coll] || '').toLowerCase()}?`, `“${it.name || it.title || it.text || it.id}” will be removed. You can undo this while the editor is open.`); if (!ok) return;
    await this.remove(P.coll, P.id); this.v.buildMarkers(); this.v.setSel(null); this.back();
  }
  async duplicate() {
    const P = this.panel; const it = clone(this.store.atlas[P.coll][P.id]); if (!it) return;
    it.id = this.newId(P.coll, (it.name || it.title || it.id) + ' copy'); if (it.name) it.name += ' (copy)'; if (it.title) it.title += ' (copy)';
    const dw = 30 / Math.pow(2, this.v.cam.z), W = this.proj.toWorld, mv = p => { const w = W(p); return this.ll([w[0] + dw, w[1] + dw]); };
    if (it.at) it.at = mv(it.at); if (it.rings) it.rings = it.rings.map(r => r.map(mv)); if (it.parts) it.parts = it.parts.map(r => r.map(mv));
    await this.put(P.coll, it); this.v.buildMarkers(); this.edit(it.id, {isNew: true, coll: P.coll});
  }

  /* ================= general settings ================= */
  renderGeneral() {
    const a = this.m.atlas, pane = this.v.el.pane, self = this;
    const fields = [{k: 'title', t: 'text', label: 'Title', wide: true}, {k: 'titleHtml', t: 'text', label: 'Title with styling (HTML)', help: 'e.g. Chicago <em>by</em> Night', wide: true}, {k: 'description', t: 'textarea', label: 'Description', wide: true},
      {k: 'background.src', t: 'image', label: 'Map picture', help: 'the base image of an image map', wide: true}, {k: 'background.w', t: 'number', label: 'Picture width (px)'}, {k: 'background.h', t: 'number', label: 'Picture height (px)'}, {k: 'background.alpha', t: 'number', label: 'Picture opacity'},
      {k: '_detect', t: 'info', html: () => `<button type="button" class="btn" data-ed="detect">${svg('image')} Read size from picture</button>`},
      {k: 'zoom.min', t: 'number', label: 'Min zoom'}, {k: 'zoom.max', t: 'number', label: 'Max zoom'}, {k: 'closeBy', t: 'number', label: '“Close by” distance', help: self.proj.kind === 'mercator' ? 'metres' : 'map units'},
      {k: 'scale.metersPerUnit', t: 'number', label: 'Metres per map unit', help: 'enables the scale bar on image maps', show: () => self.proj.kind !== 'mercator'}, {k: 'scale.unit', t: 'select', label: 'Scale unit', opts: [['mi', 'miles'], ['km', 'km'], ['m', 'metres'], ['ft', 'feet']]},
      {k: '_home', t: 'info', html: () => `<button type="button" class="btn" data-ed="sethome">${svg('home')} Use the current view as “home”</button>`},
      {k: 'basemap', t: 'text', label: 'Vector base map file (JSON)', help: 'advanced; usually set by a preset', wide: true},
      {k: 'statuses', t: 'json', label: 'People statuses (JSON)', wide: true, rows: 4}, {k: 'precisions', t: 'json', label: 'Placement kinds (JSON)', wide: true, rows: 4}, {k: 'theme', t: 'json', label: 'Default colours (JSON)', wide: true, rows: 4}];
    const data = clone({title: a.title, titleHtml: a.titleHtml, description: a.description, background: a.background, zoom: a.zoom, closeBy: a.closeBy, scale: a.scale, basemap: a.basemap, statuses: a.statuses, precisions: a.precisions, theme: a.theme});
    pane.innerHTML = `<div class="ed"><div class="ed-top"><button type="button" class="back" data-ed="back">${svg('back', 2)} Back</button></div><h2>Title, map & view</h2>
      <p class="hint">Projection: <b>${a.projection === 'mercator' ? 'geographic (lat/lng)' : 'image / flat map'}</b>.</p>
      <form class="ed-form">${renderFields(fields, data, this.ctx())}<div class="ed-actions"><button type="submit" class="btn primary">${svg('check', 2)} Save</button></div></form></div>`;
    const form = pane.querySelector('form'); bindFields(form, fields, this.ctx());
    form.onsubmit = async e => { e.preventDefault(); let d; try { d = readFields(form, fields, data, this.ctx()); } catch (err) { return this.notify(err.message, 'error'); } for (const k of Object.keys(d)) if (k.startsWith('_')) delete d[k];
      if (d.background && !d.background.src) d.background = null; if (d.background && d.background.w && d.background.h && a.projection !== 'mercator' && !a.bounds) d.bounds = [[0, 0], [d.background.w, d.background.h]];
      const patch = Object.assign({}, d); if (d.bounds) patch.bounds = d.bounds; for (const k of ['background', 'scale', 'titleHtml', 'description', 'closeBy', 'basemap']) if (!(k in d)) patch[k] = null;
      await this.store.setMeta(patch); this.notify('Atlas settings saved.'); this.v.applyView(); };
    pane.onclick = async e => { const b = e.target.closest('button[data-ed]'); if (!b) return;
      if (b.dataset.ed === 'back') this.back();
      else if (b.dataset.ed === 'sethome') { const c = this.v.cam, s = Math.pow(2, c.z); const p = this.proj; const box = [p.toLL([c.cx - c.W / 2 / s, c.cy + c.H / 2 / s]), p.toLL([c.cx + c.W / 2 / s, c.cy - c.H / 2 / s])].map(q => q.map(p.round)); await this.store.setMeta({home: {box}}); this.notify('Home view set.'); }
      else if (b.dataset.ed === 'detect') { const src = form.querySelector('.ef[data-k="background.src"] input').value; if (!src) return; const im = new Image(); im.onload = () => { form.querySelector('.ef[data-k="background.w"] input').value = im.naturalWidth; form.querySelector('.ef[data-k="background.h"] input').value = im.naturalHeight; }; im.src = this.v.resolveUrl(src); } };
  }

  /* ================= import / export ================= */
  renderIO() {
    const pane = this.v.el.pane;
    pane.innerHTML = `<div class="ed"><div class="ed-top"><button type="button" class="back" data-ed="back">${svg('back', 2)} Back</button></div><h2>Import / export</h2>
      <p class="hint">Export saves this atlas as a JSON file you can share or back up. Import replaces the whole atlas with a file exported from this module.</p>
      <button type="button" class="btn" data-ed="export">${svg('download')} Export atlas (JSON)</button>
      <button type="button" class="btn" data-ed="exportbm" ${this.store.basemap ? '' : 'disabled'}>${svg('download')} Export vector base map</button>
      <div class="ed-sep"></div>
      <label class="btn">${svg('upload')} Import atlas (replace)<input type="file" accept=".json,application/json" hidden data-ed="import"></label>
      <div class="ed-sep"></div>
      <h3>Merge from another atlas</h3><p class="hint">Adds the people, factions, categories and pages of another exported atlas without touching the map.</p>
      <label class="btn">${svg('upload')} Merge people & lore<input type="file" accept=".json,application/json" hidden data-ed="merge"></label></div>`;
    pane.onclick = e => { const b = e.target.closest('button[data-ed]'); if (!b) return; const a = b.dataset.ed;
      if (a === 'back') this.back();
      else if (a === 'export') this.download(`${safeId(this.m.atlas.title) || 'atlas'}.atlas.json`, JSON.stringify(this.store.exportData(), null, 1));
      else if (a === 'exportbm') this.download(`${safeId(this.m.atlas.title) || 'atlas'}.basemap.json`, JSON.stringify(this.store.basemap));
    };
    pane.onchange = async e => {
      const inp = e.target.closest('input[type=file]'); if (!inp || !inp.files[0]) return;
      let data; try { data = JSON.parse(await inp.files[0].text()); } catch (err) { return this.notify('That file is not valid JSON.', 'error'); }
      if (inp.dataset.ed === 'import') {
        if (!data.realms && !data.places) return this.notify('That file does not look like an atlas.', 'error');
        if (!await this.confirm('Replace the atlas?', 'Everything in this atlas will be replaced by the imported file.')) return;
        let bm; if (data.basemap && this.A.loadJSON) { try { bm = await this.A.loadJSON(data.basemap); } catch (err) { bm = null; } }
        await this.store.replaceAll(normalize(data), bm ?? null); this.undoStack = []; this.renderBar(); this.v.home(); this.notify('Atlas imported.');
      } else {
        let n = 0; for (const c of ['people', 'factions', 'categories', 'pages']) for (const it of Object.values(normalize(data)[c])) { if (this.m.atlas[c][it.id]) continue; await this.store.setItem(c, it.id, it); n++; }
        this.notify(`Merged ${n} entries.`);
      }
      inp.value = '';
    };
  }
  download(name, text) {
    if (this.A.saveFile) return this.A.saveFile(name, text);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type: 'application/json'})); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
}
void COLLECTIONS; void GLYPH; void clamp;
