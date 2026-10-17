/* AtlasView: the interactive map, its chrome and the dossier panel. Framework-free; Foundry glue lives elsewhere. */
import {esc, svg, clamp, sortBy, stripHtml, debounce, withAlpha} from './util.js';
import {AtlasModel, TYPE_NAMES} from './model.js';
import {Renderer} from './renderer.js';

const PREF_KEY = 'wod-city-atlas:prefs:';
const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export class AtlasView {
  /**
   * @param {HTMLElement} root
   * @param {object} opts {store, adapter, isGM, atlasKey, editorFactory, animate}
   */
  constructor(root, opts) {
    this.root = root; this.opts = opts; this.store = opts.store; this.adapter = opts.adapter || {};
    this.isGM = !!opts.isGM;
    this.model = new AtlasModel(this.store.atlas, this.store.basemap);
    this.renderer = new Renderer(this);
    this.cam = {cx: 0, cy: 0, z: 11, W: 0, H: 0, dpr: 1};
    this.T = 0; this.sel = null; this.hover = null; this.tab = 'places'; this.q = ''; this.detailId = null;
    this.editor = null; this.editMode = false;
    this.prefs = this.loadPrefs();
    const r0 = this.model.realm(this.prefs.realm);
    this.st = {realm: r0.id, level: this.model.level(r0.id, this.prefs.level).id, gm: this.isGM && this.prefs.preview !== true,
      layerOn: id => this.layerOn(id), catOn: id => !this.catsOff.has(id)};
    this.layerState = new Map(Object.entries(this.prefs.layers || {}));
    this.catsOff = new Set(this.prefs.catsOff || []);
    this.hiddenItems = new Set(this.prefs.hidden || []);
    this.showFaded = this.prefs.showFaded !== false;
    this.build();
    this.unsub = this.store.onChange?.(info => this.onStoreChange(info));
    this.applyView(true);
    this.home(true);
    if (this.prefs.view && this.prefs.view.z) { Object.assign(this.cam, this.prefs.view); this.clampView(); }
    this.render();
  }

  /* ================= preferences ================= */
  get atlasKey() { return this.opts.atlasKey || this.store.key || 'default'; }
  loadPrefs() { try { return JSON.parse(localStorage.getItem(PREF_KEY + this.atlasKey) || '{}'); } catch (e) { return {}; } }
  savePrefs() {
    try { localStorage.setItem(PREF_KEY + this.atlasKey, JSON.stringify({realm: this.st.realm, level: this.st.level, layers: Object.fromEntries(this.layerState), catsOff: [...this.catsOff], hidden: [...this.hiddenItems], showFaded: this.showFaded, preview: this.isGM && !this.st.gm, view: {cx: this.cam.cx, cy: this.cam.cy, z: this.cam.z}, side: this.root.classList.contains('side-min')})); } catch (e) {}
  }
  persist = debounce(() => this.savePrefs(), 400);

  /* ================= DOM ================= */
  build() {
    const R = this.root; R.classList.add('wca'); R.tabIndex = 0;
    R.innerHTML = `
      <aside class="wca-side" aria-label="Dossier">
        <header class="wca-mast">
          <div class="kicker"><span class="kg"></span><span class="kt"></span></div>
          <h1 class="ttl"></h1>
          <div class="date"></div>
          <div class="banner"><i></i><span></span></div>
        </header>
        <nav class="wca-tabs" role="tablist">
          <button type="button" role="tab" data-tab="places"></button><button type="button" role="tab" data-tab="people"></button><button type="button" role="tab" data-tab="zones"></button><button type="button" role="tab" data-tab="pages"></button>
        </nav>
        <div class="wca-pane"></div>
      </aside>
      <div class="wca-map" aria-label="Map">
        <canvas class="wca-canvas"></canvas>
        <canvas class="wca-fade" hidden></canvas>
        <div class="wca-overlay"></div>
        <div class="wca-tip" hidden></div>
        <div class="wca-modebar"><div class="seg realms" role="radiogroup" aria-label="Realm"></div><div class="seg levels" role="radiogroup" aria-label="Level"></div></div>
        <div class="wca-bar">
          <button type="button" class="mbtn" data-act="side" title="Show or hide the dossier">${svg('book')}</button>
          <button type="button" class="mbtn" data-act="layers" title="Map layers" aria-expanded="false">${svg('layers')}</button>
          <button type="button" class="mbtn" data-act="in" title="Zoom in">${svg('plus', 2)}</button>
          <button type="button" class="mbtn" data-act="out" title="Zoom out">${svg('minus', 2)}</button>
          <button type="button" class="mbtn" data-act="home" title="Show the whole map">${svg('home')}</button>
          <button type="button" class="mbtn" data-act="find" title="Search every layer ( / )">${svg('search')}</button>
          <span class="hotlayers"></span>
          <span class="gmbtns"></span>
          <div class="wca-layers" hidden></div>
        </div>
        <div class="wca-legend"></div>
        <div class="wca-credit"></div>
        <div class="wca-scale"></div>
        <div class="wca-finder" hidden><div class="fbox">${svg('search')}<input type="search" placeholder="Search every layer: people, places, zones…" autocomplete="off" aria-label="Search every layer"><button type="button" class="fx" aria-label="Close">${svg('x', 2)}</button></div><div class="fres"></div></div>
        <div class="wca-edbar" hidden></div>
      </div>`;
    const $ = s => R.querySelector(s);
    this.el = {side: $('.wca-side'), pane: $('.wca-pane'), map: $('.wca-map'), canvas: $('.wca-canvas'), fade: $('.wca-fade'), overlay: $('.wca-overlay'), tip: $('.wca-tip'),
      realms: $('.seg.realms'), levels: $('.seg.levels'), bar: $('.wca-bar'), layers: $('.wca-layers'), legend: $('.wca-legend'), credit: $('.wca-credit'), scale: $('.wca-scale'),
      finder: $('.wca-finder'), fq: $('.wca-finder input'), fres: $('.wca-finder .fres'), edbar: $('.wca-edbar'), hot: $('.hotlayers'), gmb: $('.gmbtns'), mast: $('.wca-mast')};
    if (this.prefs.side) R.classList.add('side-min');
    this.ctx = this.el.canvas.getContext('2d');
    R.querySelectorAll('.wca-tabs button').forEach(b => b.addEventListener('click', () => { this.tab = b.dataset.tab; this.detailId = null; this.setSel(null); this.render(); }));
    this.el.bar.addEventListener('click', e => this.onBar(e));
    this.el.fq.addEventListener('input', () => this.runFinder());
    this.el.fq.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); this.closeFinder(); } else if (e.key === 'Enter') { const b = this.el.fres.querySelector('[data-id]'); if (b) b.click(); } else if (e.key === 'ArrowDown') { e.preventDefault(); const b = this.el.fres.querySelector('[data-id]'); if (b) b.focus(); } });
    R.querySelector('.wca-finder .fx').addEventListener('click', () => this.closeFinder());
    this.el.fres.addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) { this.closeFinder(); this.open(b.dataset.id); } });
    this.el.pane.addEventListener('click', e => this.onPaneClick(e));
    R.addEventListener('keydown', e => this.onKey(e));
    this.bindMap();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.el.map);
    this.resize();
  }
  destroy() {
    this.dead = true; this.ro?.disconnect(); this.unsub?.(); cancelAnimationFrame(this.raf); cancelAnimationFrame(this.loopRaf); this.savePrefs();
    this.editor?.destroy?.(); this.root.innerHTML = '';
  }
  resolveUrl(src) { return this.adapter.resolveUrl ? this.adapter.resolveUrl(src) : src; }

  /* ================= store sync ================= */
  onStoreChange(info = {}) {
    if (info.basemap) this.model.setBasemap(this.store.basemap);
    this.model.setAtlas(this.store.atlas);
    if (!this.model.atlas.realms[this.st.realm]) this.st.realm = this.model.realmList[0].id;
    this.st.level = this.model.level(this.st.realm, this.st.level).id;
    this.renderer.effectCache.clear();
    this.applyView();
    if (this.detailId && !this.model.item(this.detailId)) this.detailId = null;
    if (!(this.editor && this.editor.holdsPane())) this.render(true);
    this.dirty();
  }

  /* ================= realm / level ================= */
  applyView(first) {
    this.rv = this.model.view(this.st.realm, this.st.level);
    const t = this.rv.theme, R = this.root;
    const set = (k, v) => R.style.setProperty('--wca-' + k, v);
    set('panel', t.panel); set('panel2', t.panel2); set('line', t.line); set('accent', t.accent); set('gold', t.gold); set('muted', t.muted); set('faint', t.faint); set('bone', t.bone);
    set('accent-line', t.accentLine); set('accent-soft', t.accentSoft); set('seg-on', t.segOn); set('seg-on-fg', t.segOnFg); set('glow', t.glow); set('chrome', t.chrome);
    set('pin-a', (t.pinBg || [])[0] || '#231e27'); set('pin-b', (t.pinBg || [])[1] || '#0f0d12'); set('label-halo', t.labelHalo || '#000');
    R.classList.toggle('pin-glow', !!t.pinGlow);
    R.classList.toggle('is-gm', this.st.gm); R.classList.toggle('gm-user', this.isGM);
    R.dataset.realm = this.st.realm; R.dataset.level = this.st.level;
    const a = this.model.atlas, v = this.rv, m = this.el.mast;
    m.querySelector('.kg').innerHTML = svg(v.icon || 'ankh', 1.4);
    m.querySelector('.kt').textContent = v.kicker || v.name || '';
    m.querySelector('.ttl').innerHTML = a.titleHtml || esc(a.title);
    m.querySelector('.date').textContent = v.date || '';
    const bn = m.querySelector('.banner'); bn.hidden = !v.banner; bn.querySelector('span').textContent = v.banner || '';
    this.root.querySelectorAll('.wca-tabs button').forEach(b => { b.textContent = v.terms[b.dataset.tab] || b.dataset.tab; b.setAttribute('aria-selected', String(b.dataset.tab === this.tab)); });
    // realm & level switches
    const rl = this.model.realmList;
    this.el.realms.hidden = rl.length < 2;
    this.el.realms.innerHTML = rl.map((r, i) => `<button type="button" role="radio" data-realm="${esc(r.id)}" aria-checked="${r.id === this.st.realm}" title="${esc(r.name)}${i < 9 ? ` (${i + 1})` : ''}">${svg(r.icon || 'sun')}<span>${esc(r.name)}</span></button>`).join('');
    const lv = this.model.realm(this.st.realm).levels;
    this.el.levels.hidden = lv.length < 2;
    this.el.levels.innerHTML = lv.map(l => `<button type="button" role="radio" data-level="${esc(l.id)}" aria-checked="${l.id === this.st.level}">${esc(l.name || l.id)}</button>`).join('');
    this.el.realms.onclick = e => { const b = e.target.closest('[data-realm]'); if (b) this.setRealm(b.dataset.realm); };
    this.el.levels.onclick = e => { const b = e.target.closest('[data-level]'); if (b) this.setLevel(b.dataset.level); };
    // legend & credit
    this.el.legend.innerHTML = (v.legend || []).map(l => `<span><i class="k-${esc(l.kind || 'fill')}" style="--c:${esc(l.color)}"></i>${esc(l.label)}</span>`).join('');
    this.el.legend.hidden = !(v.legend || []).length;
    this.el.credit.textContent = v.credit || ''; this.el.credit.hidden = !v.credit;
    this.renderLayersPanel(); this.renderHotLayers(); this.renderGmButtons();
    this.buildMarkers();
    this.setLoop();
    if (!first) this.dirty();
  }
  setRealm(id, quiet) {
    if (id === this.st.realm || !this.model.atlas.realms[id]) return;
    this.snapshotFade();
    this.st.realm = id; const r = this.model.realm(id); this.st.level = r.levels[0].id;
    this.q = ''; this.hideTip(); this.hover = null;
    this.applyView(); this.persist();
    if (!quiet) { this.detailId = null; this.setSel(null); this.render(); this.focusRealm(); }
  }
  setLevel(id, quiet) {
    if (id === this.st.level) return;
    this.snapshotFade(250);
    this.st.level = this.model.level(this.st.realm, id).id;
    this.applyView(); this.persist();
    if (!quiet) { if (!this.detailId) this.render(); this.focusRealm(); }
  }
  focusRealm() { const f = this.rv.focus; if (f && f.box && this.cam.z < (f.minZoom ?? 0)) this.fitLL(f.box, 40); }
  snapshotFade(ms = 650) {
    if (reduceMotion() || !this.cam.W) return;
    const f = this.el.fade; f.width = this.el.canvas.width; f.height = this.el.canvas.height; f.style.width = this.cam.W + 'px'; f.style.height = this.cam.H + 'px';
    f.getContext('2d').drawImage(this.el.canvas, 0, 0); f.hidden = false; f.style.transition = 'none'; f.style.opacity = '1';
    requestAnimationFrame(() => { f.style.transition = `opacity ${ms}ms ease`; f.style.opacity = '0'; });
    clearTimeout(this._fadeT); this._fadeT = setTimeout(() => { f.hidden = true; }, ms + 50);
  }

  /* ================= layers ================= */
  layerOn(id) {
    const k = this.st.realm + ':' + id;
    if (this.layerState.has(k)) return !!this.layerState.get(k);
    if (this.layerState.has('*:' + id)) return !!this.layerState.get('*:' + id);
    return this.model.layerDefault(id, this.st.realm, this.st.level);
  }
  setLayer(id, on) { const L = this.model.atlas.layers[id]; this.layerState.set((L && L.realm == null ? '*' : this.st.realm) + ':' + id, !!on); this.persist(); this.renderLayersPanel(); this.renderHotLayers(); this.buildMarkers(); this.dirty(); if (this.tab === 'zones' && !this.detailId) this.render(true); }
  isHiddenItem(id) { return this.hiddenItems.has(id); }
  renderLayersPanel() {
    const ls = this.model.layersFor(this.st.realm, this.st.level);
    const v = this.rv, P = this.el.layers;
    const prec = Object.entries(this.model.atlas.precisions || {});
    P.innerHTML = `<h4>${esc(v.name)} layers</h4>` + (ls.length ? ls.map(L => `<label>${esc(L.name || L.id)}<input class="tog" type="checkbox" data-layer="${esc(L.id)}" ${this.layerOn(L.id) ? 'checked' : ''}></label>`).join('') : '<div class="empty-s">No layers yet.</div>') +
      (this.isGM ? `<label class="stl">Storyteller view<input class="tog" type="checkbox" data-gm ${this.st.gm ? 'checked' : ''}></label>` : '') +
      (prec.length ? `<div class="key">${prec.map(([k, p]) => `<span><i style="border-style:${esc(p.border || 'solid')};border-color:${esc(p.color || 'var(--wca-gold)')}"></i>${esc(p.name)}</span>`).join('')}</div>` : '');
    P.onchange = e => { const t = e.target; if (t.dataset.layer) this.setLayer(t.dataset.layer, t.checked); else if ('gm' in t.dataset) this.setGmView(t.checked); };
  }
  renderHotLayers() {
    const ls = this.model.layersFor(this.st.realm, this.st.level).filter(L => L.icon);
    this.el.hot.innerHTML = ls.map(L => `<button type="button" class="mbtn" data-hot="${esc(L.id)}" aria-pressed="${this.layerOn(L.id)}" title="${esc(L.name)}${L.hotkey ? ` ( ${esc(L.hotkey.toUpperCase())} )` : ''}">${svg(L.icon)}</button>`).join('');
  }
  renderGmButtons() {
    const canEdit = this.opts.canEdit ?? this.isGM;
    if (!canEdit && !this.isGM) { this.el.gmb.innerHTML = ''; return; }
    this.el.gmb.innerHTML = (this.opts.editorFactory && canEdit ? `<button type="button" class="mbtn ${this.editMode ? 'on' : ''}" data-act="edit" aria-pressed="${this.editMode}" title="Edit the atlas">${svg('pen')}</button>` : '') +
      (this.adapter.share && this.isGM ? `<button type="button" class="mbtn" data-act="share" title="Show this view to the players">${svg('share')}</button>` : '');
  }
  setGmView(on) { this.st.gm = !!on && this.isGM; this.root.classList.toggle('is-gm', this.st.gm); this.persist(); this.model._searchIdx = null; this.buildMarkers(); this.dirty(); this.render(true); this.renderLayersPanel(); }

  onBar(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.hot) { this.setLayer(b.dataset.hot, !this.layerOn(b.dataset.hot)); return; }
    const a = b.dataset.act;
    if (a === 'layers') { this.el.layers.hidden = !this.el.layers.hidden; b.setAttribute('aria-expanded', String(!this.el.layers.hidden)); }
    else if (a === 'in') this.animateTo([this.cam.cx, this.cam.cy], this.cam.z + 1, 250);
    else if (a === 'out') this.animateTo([this.cam.cx, this.cam.cy], this.cam.z - 1, 250);
    else if (a === 'home') this.home();
    else if (a === 'find') this.openFinder();
    else if (a === 'side') { this.root.classList.toggle('side-min'); this.persist(); }
    else if (a === 'edit') this.toggleEdit();
    else if (a === 'share') this.adapter.share?.(this.getState());
  }
  toggleEdit(on = !this.editMode) {
    if (!(this.opts.canEdit ?? this.isGM) || !this.opts.editorFactory) return;
    this.editMode = on;
    if (on) { this.editor = this.opts.editorFactory(this); this.editor.start(); }
    else { this.editor?.stop(); this.editor = null; this.el.edbar.hidden = true; this.root.classList.remove('editing'); this.render(); }
    this.renderGmButtons(); this.buildMarkers(); this.dirty();
  }

  /* ================= camera ================= */
  resize() {
    const r = this.el.map.getBoundingClientRect(); if (!r.width || !r.height) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    const first = !this.cam.W;
    this.cam.W = r.width; this.cam.H = r.height;
    if (d !== this.cam.dpr) { this.cam.dpr = d; this.renderer.patterns.clear(); }
    this.el.canvas.width = Math.round(r.width * d); this.el.canvas.height = Math.round(r.height * d);
    this.el.canvas.style.width = r.width + 'px'; this.el.canvas.style.height = r.height + 'px';
    if (first) this.home(true);
    this.clampView(); this.dirty();
  }
  zr() { const z = this.model.atlas.zoom || {}; return [z.min ?? -3, z.max ?? 18]; }
  worldBB() {
    const a = this.model.atlas, W = this.model.proj.toWorld;
    let b = a.bounds;
    if (!b) { const bg = a.background; if (bg && (bg.w || bg.bounds)) b = bg.bounds || [[0, 0], [bg.w, bg.h]]; }
    if (!b) return null;
    const p = W(b[0]), q = W(b[1]); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])];
  }
  clampView() {
    const [mn, mx] = this.zr(); this.cam.z = clamp(this.cam.z, mn, mx);
    const bb = this.worldBB(); if (!bb) return;
    const s = Math.pow(2, this.cam.z), hw = this.cam.W / 2 / s, hh = this.cam.H / 2 / s;
    this.cam.cx = bb[2] - bb[0] < hw * 2 ? (bb[0] + bb[2]) / 2 : clamp(this.cam.cx, bb[0] + hw * 0.0 - hw * 0.6, bb[2] + hw * 0.6);
    this.cam.cy = bb[3] - bb[1] < hh * 2 ? (bb[1] + bb[3]) / 2 : clamp(this.cam.cy, bb[1] - hh * 0.6, bb[3] + hh * 0.6);
  }
  toWorld(sx, sy) { const s = Math.pow(2, this.cam.z); return [this.cam.cx + (sx - this.cam.W / 2) / s, this.cam.cy + (sy - this.cam.H / 2) / s]; }
  toScreen(w) { return this.renderer.ts(w); }
  fitWorld(bb, pad = 30, instant) {
    if (!bb || !this.cam.W) return; const p = typeof pad === 'number' ? {t: pad, l: pad, r: pad, b: pad} : pad;
    const W = Math.max(50, this.cam.W - p.l - p.r), H = Math.max(50, this.cam.H - p.t - p.b);
    const z = Math.log2(Math.min(W / Math.max(1e-9, bb[2] - bb[0]), H / Math.max(1e-9, bb[3] - bb[1])));
    const s = Math.pow(2, z); const cx = (bb[0] + bb[2]) / 2 - (p.l - p.r) / 2 / s, cy = (bb[1] + bb[3]) / 2 - (p.t - p.b) / 2 / s;
    if (instant) { this.cam.cx = cx; this.cam.cy = cy; this.cam.z = z; this.clampView(); this.dirty(); } else this.animateTo([cx, cy], z, 450);
  }
  fitLL(box, pad, instant) { const W = this.model.proj.toWorld, a = W(box[0]), b = W(box[1]); this.fitWorld([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], pad, instant); }
  home(instant) {
    const h = this.model.atlas.home;
    if (h && h.box) return this.fitLL(h.box, 20, instant);
    if (h && h.center) { const w = this.model.proj.toWorld(h.center); if (instant) { this.cam.cx = w[0]; this.cam.cy = w[1]; this.cam.z = h.zoom ?? this.cam.z; this.clampView(); this.dirty(); } else this.animateTo(w, h.zoom ?? this.cam.z, 450); return; }
    const bb = this.worldBB(); if (bb) return this.fitWorld(bb, 10, instant);
    const all = []; for (const p of Object.values(this.model.atlas.places)) if (p.at) all.push(this.model.proj.toWorld(p.at));
    if (all.length > 1) { const xs = all.map(p => p[0]), ys = all.map(p => p[1]); this.fitWorld([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], 60, instant); }
    else if (instant) { this.cam.cx = 500; this.cam.cy = 400; this.cam.z = 0; }
  }
  animateTo(w, z, ms = 400) {
    cancelAnimationFrame(this.animRaf); const [mn, mx] = this.zr(); z = clamp(z, mn, mx);
    const a = {cx: this.cam.cx, cy: this.cam.cy, z: this.cam.z}, t0 = performance.now(); if (reduceMotion()) ms = 0;
    const step = now => { const u = ms ? Math.min(1, (now - t0) / ms) : 1, e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      this.cam.z = a.z + (z - a.z) * e; const s0 = Math.pow(2, a.z), s1 = Math.pow(2, z), s = Math.pow(2, this.cam.z);
      // keep the motion visually straight across zoom changes
      const k = s0 === s1 ? e : (1 / s0 - 1 / s) / (1 / s0 - 1 / s1 || 1);
      this.cam.cx = a.cx + (w[0] - a.cx) * k; this.cam.cy = a.cy + (w[1] - a.cy) * k; this.clampView(); this.dirty();
      if (u < 1) this.animRaf = requestAnimationFrame(step); else this.persist(); };
    this.animRaf = requestAnimationFrame(step);
  }
  focusAt(at, z) { const w = this.model.proj.toWorld(at); this.animateTo(w, z != null ? z : Math.max(this.cam.z, this.zr()[1] - 2.5), 450); }
  zoomAround(sx, sy, nz) { const b = this.toWorld(sx, sy); this.cam.z = nz; this.clampView(); const a = this.toWorld(sx, sy); this.cam.cx += b[0] - a[0]; this.cam.cy += b[1] - a[1]; this.clampView(); this.dirty(); this.persist(); }

  /* ================= interaction ================= */
  bindMap() {
    const M = this.el.map, ptrs = new Map(); let drag = null, moved = 0, pinch = null;
    const isUI = e => e.target.closest('.wca-bar,.wca-modebar,.wca-legend,.wca-finder,.wca-pin,.wca-edbar,.wca-layers');
    M.addEventListener('pointerdown', e => {
      if (isUI(e) || e.button > 0 && e.pointerType === 'mouse' && e.button !== 1) return;
      this.root.focus({preventScroll: true});
      if (this.editor && this.editor.pointerDown(e)) return;
      M.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (ptrs.size === 1) { drag = {x: e.clientX, y: e.clientY, cx: this.cam.cx, cy: this.cam.cy}; moved = 0; }
      else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = {d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: this.cam.z}; drag = null; }
      cancelAnimationFrame(this.animRaf);
    });
    M.addEventListener('pointermove', e => {
      const r = M.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
      if (this.editor && this.editor.pointerMove(e, sx, sy)) return;
      if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, [e.clientX, e.clientY]);
      if (pinch && ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); const mx = (a[0] + b[0]) / 2 - r.left, my = (a[1] + b[1]) / 2 - r.top; this.zoomAround(mx, my, pinch.z + Math.log2(d / pinch.d)); return; }
      if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.hypot(dx, dy)); if (moved > 3) { M.classList.add('dragging'); const s = Math.pow(2, this.cam.z); this.cam.cx = drag.cx - dx / s; this.cam.cy = drag.cy - dy / s; this.clampView(); this.dirty(); this.hideTip(); } return; }
      if (e.pointerType === 'mouse' && !isUI(e)) this.hoverAt(sx, sy, e);
    });
    const end = e => {
      if (this.editor && this.editor.pointerUp(e)) { ptrs.delete(e.pointerId); return; }
      const was = ptrs.has(e.pointerId); ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null;
      M.classList.remove('dragging');
      if (was && drag && moved <= 3 && e.type === 'pointerup') { const r = M.getBoundingClientRect(); this.clickAt(e.clientX - r.left, e.clientY - r.top, e); }
      if (drag) this.persist();
      if (!ptrs.size) drag = null;
    };
    M.addEventListener('pointerup', end); M.addEventListener('pointercancel', end);
    M.addEventListener('pointerleave', () => { if (this.hover) { this.hover = null; this.dirty(); } this.hideTip(); });
    M.addEventListener('wheel', e => { if (isUI(e) && !e.target.closest('.wca-pin')) return; e.preventDefault(); const r = M.getBoundingClientRect(); const dz = -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.ctrlKey ? 0.01 : 0.0022); this.zoomAround(e.clientX - r.left, e.clientY - r.top, this.cam.z + clamp(dz, -1, 1)); }, {passive: false});
    M.addEventListener('dblclick', e => { if (isUI(e) || this.editor?.consumesDblClick?.()) return; const r = M.getBoundingClientRect(); const sx = e.clientX - r.left, sy = e.clientY - r.top; const w = this.toWorld(sx, sy); this.animateTo(w, this.cam.z + 1, 250); });
    M.addEventListener('dragover', e => { if (this.editor?.acceptsDrop?.(e)) { e.preventDefault(); } });
    M.addEventListener('drop', e => { if (this.editor?.acceptsDrop?.(e)) { e.preventDefault(); const r = M.getBoundingClientRect(); this.editor.onDrop(e, e.clientX - r.left, e.clientY - r.top); } });
  }
  hoverAt(sx, sy) {
    const h = this.renderer.hitTest(sx, sy); const id = h ? (h.zone || h.id) : null;
    if (id !== this.hover) { this.hover = id; this.dirty(); }
    if (h) { const it = this.model.item(h.id); const zn = h.zone ? this.model.item(h.zone) : it; this.showTip(`${esc(it.name || zn.name || '')}<small>${esc(this.kindLabel(h.coll, it))}${it.gm ? ' · Storyteller' : ''}</small>`, null, sx, sy); this.el.map.style.cursor = 'pointer'; }
    else { this.hideTip(); this.el.map.style.cursor = ''; }
  }
  clickAt(sx, sy, e) {
    if (this.editor && this.editor.click(sx, sy, e)) return;
    const h = this.renderer.hitTest(sx, sy);
    if (h) this.open(h.id, {fromMap: true}); else if (this.detailId) { /* keep */ }
    this.el.layers.hidden = true;
  }
  onKey(e) {
    if (e.target.closest('input,textarea,select,[contenteditable],prose-mirror')) return;
    const k = e.key;
    let done = true;
    if (k === '/' || (k === 'k' && (e.ctrlKey || e.metaKey))) this.openFinder();
    else if (k === 'Escape') { if (!this.el.finder.hidden) this.closeFinder(); else if (this.editor && this.editor.escape()) {} else if (this.detailId) { this.detailId = null; this.setSel(null); this.render(); } else done = false; }
    else if (/^[1-9]$/.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey) { const r = this.model.realmList[+k - 1]; if (r) this.setRealm(r.id); else done = false; }
    else if (k === '[' || k === ']') { const lv = this.model.realm(this.st.realm).levels; const i = lv.findIndex(l => l.id === this.st.level); const n = lv[clamp(i + (k === ']' ? 1 : -1), 0, lv.length - 1)]; if (n) this.setLevel(n.id); }
    else if (k === '+' || k === '=') this.animateTo([this.cam.cx, this.cam.cy], this.cam.z + 1, 200);
    else if (k === '-') this.animateTo([this.cam.cx, this.cam.cy], this.cam.z - 1, 200);
    else if (this.editor && this.editor.key(e)) {}
    else { const L = this.model.layersFor(this.st.realm, this.st.level).find(L => L.hotkey && L.hotkey.toLowerCase() === k.toLowerCase()); if (L && !e.ctrlKey && !e.metaKey) this.setLayer(L.id, !this.layerOn(L.id)); else done = false; }
    if (done) { e.preventDefault(); e.stopPropagation(); }
    else if (k !== 'Escape' && !e.ctrlKey && !e.metaKey) e.stopPropagation();
  }
  showTip(html, anchor, x, y) {
    const t = this.el.tip; t.innerHTML = html; t.hidden = false;
    let px = x, py = y; if (anchor) { const r = anchor.getBoundingClientRect(), m = this.el.map.getBoundingClientRect(); px = r.left - m.left + r.width / 2; py = r.top - m.top; }
    const w = t.offsetWidth; t.style.left = clamp(px - w / 2, 6, this.cam.W - w - 6) + 'px'; t.style.top = Math.max(6, py - t.offsetHeight - 14) + 'px';
  }
  hideTip() { this.el.tip.hidden = true; }

  /* ================= drawing loop ================= */
  dirty() { if (!this.needs && !this.dead) { this.needs = true; this.raf = requestAnimationFrame(() => this.frame()); } }
  frame() { this.needs = false; if (!this.cam.W || this.dead) return; this.renderer.draw(); this.placeMarkers(); this.drawScale(); }
  setLoop() {
    const want = this.opts.animate !== false && !reduceMotion() && this.renderer.animated(this.rv);
    if (want && !this.loopOn) { this.loopOn = true; let last = 0; const loop = now => { if (!this.loopOn || this.dead) return; if (now - last > 40 && !document.hidden) { last = now; this.T = now / 1000; this.dirty(); } this.loopRaf = requestAnimationFrame(loop); }; this.loopRaf = requestAnimationFrame(loop); }
    else if (!want) { this.loopOn = false; }
  }
  drawScale() {
    const P = this.model.proj, el = this.el.scale, a = this.model.atlas;
    if (P.kind === 'plane' && !(a.scale && a.scale.metersPerUnit)) { el.hidden = true; return; }
    el.hidden = false;
    const mpp = this.renderer.mpp(); const unit = (a.scale && a.scale.unit) || (P.kind === 'mercator' ? 'mi' : 'm');
    const U = unit === 'mi' ? 1609.344 : unit === 'km' ? 1000 : unit === 'ft' ? 0.3048 : 1;
    const val = mpp * 110 / U, nice = [0.05, 0.1, 0.25, 0.5, 1, 2, 3, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]; let m = nice[0]; nice.forEach(n => { if (n <= val) m = n; });
    el.style.width = (m * U / mpp) + 'px'; el.textContent = (this.rv.realm.order ? '≈ ' : '') + m + ' ' + ({mi: m === 1 ? 'mile' : 'miles', km: 'km', m: 'm', ft: 'ft'}[unit] || unit);
  }

  /* ================= markers ================= */
  buildMarkers() {
    const O = this.el.overlay; O.innerHTML = ''; this.markers = [];
    const st = this.st;
    for (const p of Object.values(this.model.atlas.places)) {
      if (!p.at || p.hidden || !this.model.visible(p, 'places', st)) continue;
      const cat = this.model.category(p.cat) || {}, color = this.model.colorOf(p), pin = Object.assign({}, cat.pin || {}, p.pin || {});
      const prec = this.model.atlas.precisions[p.precision];
      const el = document.createElement('button'); el.type = 'button'; el.className = 'wca-pin' + (pin.anim ? ' anim-' + pin.anim : '') + (p.gm ? ' gm' : '');
      el.style.setProperty('--c', color);
      if (pin.glow) el.style.setProperty('--g', pin.glow === true ? color : pin.glow);
      const border = pin.border || (prec && prec.border) || 'solid';
      const bg = pin.bg ? `radial-gradient(circle at 50% 40%,${pin.bg[0]},${pin.bg[1]})` : '';
      el.innerHTML = `<span class="pin${pin.glow ? ' glow' : ''}" style="border-style:${esc(border)};${pin.width ? `border-width:${+pin.width}px;` : ''}${bg ? `background:${bg};` : ''}">${svg(this.model.iconOf(p, 'places'), 1.7)}</span><span class="lbl">${esc(p.name)}</span>`;
      el.setAttribute('aria-label', `${p.name}, ${cat.name || ''}`); el.dataset.id = p.id;
      el.addEventListener('click', e => { e.stopPropagation(); if (this.editor && this.editor.markerClick(p.id, e)) return; this.open(p.id, {fromMap: true}); });
      el.addEventListener('pointerdown', e => { e.stopPropagation(); if (this.editor) this.editor.markerDown(p.id, e); });
      el.addEventListener('pointerenter', () => { this.showTip(`${esc(p.name)}<small>${esc(cat.name || '')}${p.gm ? ' · Storyteller' : ''}</small>`, el); });
      el.addEventListener('pointerleave', () => this.hideTip());
      O.appendChild(el);
      this.markers.push({p, el, w: this.model.proj.toWorld(p.at), sx: 0, sy: 0, vis: false, canon: !p.precision || p.precision === 'canon'});
    }
    this.markMatches(); this.dirty();
  }
  markerBoxes() { return (this.markers || []).filter(m => m.vis).map(m => [m.sx - 13, m.sy - 13, m.sx + 13, m.sy + 13]); }
  placeMarkers() {
    const [mn, mx] = this.zr(), z = this.cam.z, lo = z < mn + 2.5, hi = z >= mx - 2.5;
    this.el.map.classList.toggle('zl-lo', lo); this.el.map.classList.toggle('zl-hi', hi);
    const W = this.cam.W, H = this.cam.H;
    for (const m of this.markers || []) {
      if (m.drag) m.w = m.drag;
      const [sx, sy] = this.renderer.ts(m.w); m.sx = sx; m.sy = sy;
      const on = sx > -30 && sy > -30 && sx < W + 30 && sy < H + 30; m.vis = on;
      if (!on) { if (!m.el.hidden) m.el.hidden = true; continue; }
      if (m.el.hidden) m.el.hidden = false;
      m.el.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`;
      m.el.classList.toggle('sel', this.sel === m.p.id);
      m.el.classList.toggle('dim', this.tab === 'places' && !!this.q && !m.match);
    }
    if (hi) {
      const vis = (this.markers || []).filter(m => m.vis);
      const boxes = vis.map(m => [m.sx - 14, m.sy - 14, m.sx + 14, m.sy + 14]);
      vis.sort((a, b) => (b.p.id === this.sel) - (a.p.id === this.sel) || (b.canon - a.canon));
      for (const m of vis) { const w = m.p.name.length * 6.4 + 6, bx = [m.sx + 17, m.sy - 8, m.sx + 17 + w, m.sy + 8]; const hit = boxes.some(o => !(bx[2] < o[0] || bx[0] > o[2] || bx[3] < o[1] || bx[1] > o[3]) && !(o[0] === m.sx - 14 && o[1] === m.sy - 14)); m.el.classList.toggle('nolbl', hit && m.p.id !== this.sel); if (!hit || m.p.id === this.sel) boxes.push(bx); }
    }
  }
  markMatches() { const q = this.q.trim().toLowerCase(); for (const m of this.markers || []) m.match = !q || this.matches(m.p, q); }
  matches(it, q) { if (!q) return true; const cat = this.model.category(it.cat), f = this.model.faction(it.faction); return [it.name, it.sub, it.kicker, it.tag, stripHtml(it.html), cat && cat.name, f && f.name, ...(this.model.peopleAt(it).map(p => p.name))].filter(Boolean).join(' ').toLowerCase().includes(q); }

  /* ================= selection & navigation ================= */
  setSel(id) { this.sel = id; this.dirty(); }
  kindLabel(coll, it) {
    if (it.kicker) return it.kicker;
    if (coll === 'places') { const c = this.model.category(it.cat); return c ? c.name : 'Place'; }
    if (coll === 'people') return it.tag || 'Person';
    return TYPE_NAMES[coll] || '';
  }
  /** Open any item by id: switch realm/level as needed, focus the map and show its dossier. */
  open(id, o = {}) {
    const ref = this.model.get(id); if (!ref) return;
    const {coll, item: it} = ref;
    if (it.gm && !this.st.gm) return;
    if (coll === 'pages') { this.tab = 'pages'; this.detailId = null; this.render(); requestAnimationFrame(() => this.el.pane.querySelector(`[data-page="${CSS.escape(id)}"]`)?.scrollIntoView({block: 'start'})); return; }
    if (['places', 'zones', 'routes', 'labels'].includes(coll)) {
      const home = this.model.homeOf(it);
      if (home && (home.realm !== this.st.realm || !this.model.inLevel(it, this.st))) { if (home.realm !== this.st.realm) this.setRealm(home.realm, true); if (!this.model.inLevel(it, this.st)) this.setLevel(home.level, true); }
      if (it.layer && !this.layerOn(it.layer)) this.setLayer(it.layer, true);
      if (coll === 'places' && it.cat && this.catsOff.has(it.cat)) { this.catsOff.delete(it.cat); this.buildMarkers(); }
      this.hiddenItems.delete(id);
      this.setSel(id);
      if (!o.noFocus) this.focusItem(it, coll);
    } else if (coll === 'people') {
      // show the first visible place they frequent
      const first = (it.at || []).map(i => this.model.get(i)).find(r => r && !r.item.gm || r && this.st.gm);
      if (first && !o.noFocus) { const fi = first.item, home = this.model.homeOf(fi);
        if (home) { const keepRealm = this.model.personIn(it, this.st) && (it.at || []).some(i => { const x = this.model.item(i); return x && this.model.inRealm(x, this.st) && this.model.inLevel(x, this.st); });
          if (!keepRealm) { if (home.realm !== this.st.realm) this.setRealm(home.realm, true); if (!this.model.inLevel(fi, this.st)) this.setLevel(home.level, true); }
          const vis = (it.at || []).map(i => this.model.get(i)).find(r => r && this.model.inRealm(r.item, this.st) && this.model.inLevel(r.item, this.st) && (!r.item.gm || this.st.gm));
          if (vis) { if (vis.item.layer && !this.layerOn(vis.item.layer)) this.setLayer(vis.item.layer, true); this.setSel(vis.item.id); this.focusItem(vis.item, vis.coll); } }
      } else this.setSel(null);
    } else return;
    this.detailId = id;
    if (this.editor && this.editor.openItem(id)) return;
    this.renderDetail();
  }
  focusItem(it, coll) {
    if (coll === 'places' || coll === 'labels') { if (it.at) this.focusAt(it.at, it.zoom); return; }
    if (it.fit) { if (Array.isArray(it.fit)) return this.fitLL(it.fit, 40); }
    const g = this.model.geo(it, coll); let bb = g.bb; if (!bb) return;
    if (it.fit && it.fit.clip) { const W = this.model.proj.toWorld, a = W(it.fit.clip[0]), b = W(it.fit.clip[1]); bb = [Math.max(bb[0], Math.min(a[0], b[0])), Math.max(bb[1], Math.min(a[1], b[1])), Math.min(bb[2], Math.max(a[0], b[0])), Math.min(bb[3], Math.max(a[1], b[1]))]; }
    this.fitWorld(bb, {t: 60, l: 50, r: 70, b: 50});
  }
  getState() { return {realm: this.st.realm, level: this.st.level, sel: this.detailId, view: {cx: this.cam.cx, cy: this.cam.cy, z: this.cam.z}, layers: Object.fromEntries(this.model.layersFor(this.st.realm, this.st.level).map(L => [L.id, this.layerOn(L.id)]))}; }
  applyState(s) {
    if (!s) return;
    if (s.realm) this.setRealm(s.realm, true); if (s.level) this.setLevel(s.level, true);
    if (s.layers) for (const [k, v] of Object.entries(s.layers)) this.layerState.set(this.st.realm + ':' + k, v);
    this.applyView();
    if (s.view) { this.cam.cx = s.view.cx; this.cam.cy = s.view.cy; this.cam.z = s.view.z; this.clampView(); }
    if (s.sel && this.model.item(s.sel)) this.open(s.sel, {noFocus: !!s.view}); else { this.detailId = null; this.render(); }
    this.dirty();
  }

  /* ================= the dossier ================= */
  render(soft) {
    if (this.dead) return;
    if (this.editor && this.editor.holdsPane()) return this.editor.renderPane();
    this.root.querySelectorAll('.wca-tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === this.tab)));
    if (this.detailId) return this.renderDetail();
    if (soft && this.el.pane.querySelector('.wca-list') && this.tab === this._lastTab) { const q = this.el.pane.querySelector('.wca-q'); const focused = q && document.activeElement === q; this.renderTab(); if (focused) { const nq = this.el.pane.querySelector('.wca-q'); nq.focus(); nq.setSelectionRange(nq.value.length, nq.value.length); } return; }
    this.renderTab();
  }
  renderTab() {
    this._lastTab = this.tab;
    const fn = {places: () => this.renderPlaces(), people: () => this.renderPeople(), zones: () => this.renderZones(), pages: () => this.renderPages()}[this.tab] || (() => this.renderPlaces());
    const scroll = this.el.pane.scrollTop; this.el.pane.innerHTML = fn(); if (this._keepScroll) this.el.pane.scrollTop = scroll; this._keepScroll = false;
    const q = this.el.pane.querySelector('.wca-q');
    if (q) q.addEventListener('input', () => { this.q = q.value; this.markMatches(); this.placeMarkers(); this.renderListOnly(); });
    this.enrichIn(this.el.pane);
  }
  renderListOnly() {
    const list = this.el.pane.querySelector('.wca-list'); if (!list) return;
    const html = {places: () => this.placesBody(), people: () => this.peopleBody()}[this.tab]?.(); if (html != null) list.innerHTML = html;
  }
  searchBox(ph) { return `<div class="search">${svg('search')}<input class="wca-q" type="search" placeholder="${esc(ph)}" value="${esc(this.q)}" aria-label="${esc(ph)}"></div>`; }
  itemRow(o) {
    return `<button type="button" class="item${o.dead ? ' dead' : ''}${o.gm ? ' gm' : ''}" data-go="${esc(o.id)}" style="--c:${esc(o.c)}"><span class="ic${o.dash ? ' dash' : ''}">${svg(o.g, 1.7)}</span><span class="nm">${esc(o.n)}${o.s ? `<span class="sb">${esc(o.s)}</span>` : ''}</span>${o.tag ? `<span class="tag">${esc(o.tag)}</span>` : ''}</button>`;
  }
  refRow(id) {
    const r = this.model.get(id); if (!r) return ''; const it = r.item; if (it.gm && !this.st.gm) return '';
    if (r.coll === 'people') return this.personRow(it);
    const f = this.model.faction(it.faction), cat = this.model.category(it.cat);
    const realmName = it.realm && it.realm !== this.st.realm ? this.model.realm(it.realm).name : '';
    return this.itemRow({id, c: this.model.colorOf(it), g: this.model.iconOf(it, r.coll), n: it.name, s: it.sub || (cat && cat.name) || '', tag: realmName || (f && f.short) || (it.gm ? 'ST' : ''), dash: it.precision && it.precision !== 'canon', gm: it.gm});
  }
  personRow(p) {
    const st = p.status && this.model.atlas.statuses[p.status];
    return this.itemRow({id: p.id, c: this.model.colorOf(p), g: this.model.iconOf(p, 'people'), n: (st && st.mark ? st.mark + ' ' : '') + p.name, s: p.sub, tag: p.tag || (this.model.faction(p.faction) || {}).short, dead: st && st.fade, gm: p.gm});
  }
  pageNotes(tab) {
    return sortBy(Object.values(this.model.atlas.pages).filter(pg => pg.tab === tab && this.model.visible(pg, 'pages', this.st)), p => p.order ?? 0).map(pg => `<div class="wca-pagenote" data-page="${esc(pg.id)}">${pg.html || ''}</div>`).join('');
  }
  /* ----- places ----- */
  placesBody() {
    const q = this.q.trim().toLowerCase(), st = this.st;
    const cats = this.model.categoriesFor(st.realm, st.level);
    const list = Object.values(this.model.atlas.places).filter(p => this.model.visible(p, 'places', st, {ignoreLayer: true}) && this.matches(p, q));
    const groups = cats.map(c => [c, sortBy(list.filter(p => p.cat === c.id), p => p.order ?? 1e9, 'name')]).filter(([, a]) => a.length);
    const orphans = sortBy(list.filter(p => !cats.some(c => c.id === p.cat)), p => p.order ?? 1e9, 'name');
    if (orphans.length) groups.push([{name: 'Other', id: ''}, orphans]);
    if (!groups.length) return `<div class="empty">Nothing matches. Clear the search or switch a category back on.</div>`;
    return groups.map(([c, a]) => `<div class="grp">${esc(c.name)} <span class="n">${a.length}</span></div>` + a.map(p => { const f = this.model.faction(p.faction); return this.itemRow({id: p.id, c: this.model.colorOf(p), g: this.model.iconOf(p, 'places'), n: p.name, s: p.sub, tag: p.gm ? 'ST' : (f && f.short) || (p.level && this.model.realm(st.realm).levels.length > 1 && p.level !== st.level ? (this.model.realm(st.realm).levels.find(l => l.id === p.level) || {}).name : ''), dash: p.precision && p.precision !== 'canon', gm: p.gm}); }).join('')).join('');
  }
  renderPlaces() {
    const cats = this.model.categoriesFor(this.st.realm, this.st.level);
    return this.searchBox(`Search ${this.rv.terms.places.toLowerCase()}…`) +
      (cats.length ? `<div class="chips" role="group" aria-label="Categories">${cats.map(c => `<button type="button" class="chip" data-cat="${esc(c.id)}" aria-pressed="${!this.catsOff.has(c.id)}" style="--c:${esc(c.color || 'var(--wca-bone)')}">${svg(c.icon || 'pin', 1.7)}${esc(c.name)}</button>`).join('')}</div>` : '') +
      `<div class="wca-list">${this.placesBody()}</div>` + this.pageNotes('places');
  }
  /* ----- people ----- */
  peopleBody() {
    const q = this.q.trim().toLowerCase(), st = this.st, S = this.model.atlas.statuses;
    const list = Object.values(this.model.atlas.people).filter(p => this.model.visible(p, 'people', st) && (this.showFaded || !(S[p.status] && S[p.status].hideable)) && (!q || [p.name, p.kicker, p.sub, p.tag, stripHtml(p.html), (this.model.faction(p.faction) || {}).name].join(' ').toLowerCase().includes(q)));
    const grpOf = p => (p.group && p.group[st.realm]) || p.faction || '';
    const keys = [...new Set(list.map(grpOf))].sort((a, b) => this.model.factionOrder(a) - this.model.factionOrder(b));
    if (!keys.length) return `<div class="empty">No one by that name.</div>`;
    return keys.map(k => { const f = this.model.faction(k) || {name: k || 'Unaffiliated', color: '#bbb'}; const a = sortBy(list.filter(p => grpOf(p) === k), p => p.order ?? 1e9, 'name'); return `<div class="grp" style="color:${esc(f.color)}">${esc(f.name)} <span class="n">${a.length}</span></div>` + a.map(p => this.personRow(p)).join(''); }).join('');
  }
  renderPeople() {
    const hasHide = Object.values(this.model.atlas.statuses || {}).some(s => s.hideable);
    return this.pageNotes('people') + this.searchBox(`Search ${this.rv.terms.people.toLowerCase()}…`) +
      (hasHide ? `<label class="deadtog"><input type="checkbox" class="wca-faded" ${this.showFaded ? 'checked' : ''}> Show the ${esc(Object.values(this.model.atlas.statuses).find(s => s.hideable).name.toLowerCase())}</label>` : '') +
      `<div class="wca-list">${this.peopleBody()}</div>`;
  }
  /* ----- zones & routes ----- */
  renderZones() {
    const st = this.st, ls = this.model.layersFor(st.realm, st.level);
    const zones = Object.values(this.model.atlas.zones).filter(z => !z.decor && this.model.visible(z, 'zones', st, {ignoreLayer: true}));
    const routes = Object.values(this.model.atlas.routes).filter(r => !r.decor && this.model.visible(r, 'routes', st, {ignoreLayer: true}));
    const groups = [];
    const byLayer = (arr, L) => arr.filter(x => (x.layer || '') === (L ? L.id : ''));
    for (const L of [...ls, null]) {
      const zs = byLayer(zones, L), rs = byLayer(routes, L); if (!zs.length && !rs.length) continue;
      // sub-group by zone.group when present
      const sub = new Map(); for (const z of zs) { const g = z.group || ''; if (!sub.has(g)) sub.set(g, []); sub.get(g).push(z); }
      let html = `<div class="grp lay">${esc(L ? L.name : 'Other')} <span class="n">${zs.length + rs.length}</span>${L ? `<input class="tog" type="checkbox" data-layer="${esc(L.id)}" ${this.layerOn(L.id) ? 'checked' : ''} aria-label="Show ${esc(L.name)}">` : ''}</div>`;
      for (const [g, arr] of sub) {
        if (g) html += `<div class="subgrp">${esc(g)}</div>`;
        const sorted = arr.some(z => z.rating) ? arr.slice().sort((a, b) => (b.rating?.value ?? 0) - (a.rating?.value ?? 0)) : sortBy(arr.slice(), z => z.order ?? 10, 'name');
        html += sorted.map(z => `<div class="zrow">${this.itemRow({id: z.id, c: this.model.colorOf(z), g: this.model.iconOf(z, 'zones'), n: z.name, s: z.sub || (z.tags && z.tags[0] && z.tags[0].text) || '', tag: z.gm ? 'ST' : '', dash: z.precision && z.precision !== 'canon', gm: z.gm})}${z.rating ? this.ratingBar(z.rating) : ''}<button type="button" class="eye" data-hide="${esc(z.id)}" aria-pressed="${!this.hiddenItems.has(z.id)}" title="Show or hide on the map">${svg(this.hiddenItems.has(z.id) ? 'eyeoff' : 'share')}</button></div>`).join('');
      }
      html += sortBy(rs.slice(), r => r.order ?? 1e9, 'name').map(r => this.itemRow({id: r.id, c: this.model.colorOf(r), g: this.model.iconOf(r, 'routes'), n: r.name, s: r.sub || (r.tags && r.tags[0] && r.tags[0].text) || '', tag: r.gm ? 'ST' : '', gm: r.gm})).join('');
      groups.push(html);
    }
    return (groups.join('') || `<div class="empty">No zones or routes here yet.</div>`) + this.pageNotes('zones');
  }
  ratingBar(r) { const max = r.max || 5, v = r.value || 0; return `<span class="danger" title="${esc(r.label || '')} ${v}/${max}${r.text ? ' · ' + esc(r.text) : ''}">${Array.from({length: max}, (_, i) => `<i class="${i < v ? 'on' : ''}${v >= max - 1 && i < v ? ' red' : ''}"></i>`).join('')}</span>`; }
  /* ----- pages ----- */
  renderPages() {
    const pages = sortBy(Object.values(this.model.atlas.pages).filter(pg => (!pg.tab || pg.tab === 'pages') && this.model.visible(pg, 'pages', this.st)), p => p.order ?? 0);
    if (!pages.length) return `<div class="empty">No chronicle pages for this ${esc(this.rv.name.toLowerCase())} yet.</div>`;
    return pages.map(pg => `<section class="wca-page${pg.gm ? ' gm-only' : ''}" data-page="${esc(pg.id)}"><div class="grp">${esc(pg.title || '')}</div>${pg.html || ''}</section>`).join('');
  }

  /* ----- detail ----- */
  renderDetail() {
    const ref = this.model.get(this.detailId); if (!ref) { this.detailId = null; return this.renderTab(); }
    const {coll, item: it} = ref, m = this.model, st = this.st, A = m.atlas;
    const color = m.colorOf(it), f = m.faction(it.faction), cat = m.category(it.cat);
    const pills = [];
    if (f) pills.push(`<span class="pill" style="--c:${esc(f.color)}"><span class="sw"></span>${esc(f.name)}</span>`);
    else if (cat && coll === 'places') pills.push(`<span class="pill" style="--c:${esc(color)}"><span class="sw"></span>${esc(cat.name)}</span>`);
    if (it.precision && A.precisions[it.precision]) { const p = A.precisions[it.precision]; pills.push(`<span class="pill prec" style="border-style:${esc(p.border || 'solid')};color:${esc(p.color || 'inherit')};border-color:${esc(withAlpha(p.color || '#888', 0.55))}">${esc(p.name)}</span>`); }
    if (it.status && A.statuses[it.status]) { const s = A.statuses[it.status]; pills.push(`<span class="pill status s-${esc(it.status)}" ${s.color ? `style="color:${esc(s.color)};border-color:${esc(withAlpha(s.color, .5))}"` : ''}>${esc(s.name)}</span>`); }
    if (it.rating) pills.push(`<span class="pill" style="--c:${esc(color)}"><span class="sw"></span>${esc(it.rating.label || 'Rating')} ${it.rating.value}/${it.rating.max || 5}${it.rating.text ? ' · ' + esc(it.rating.text) : ''}</span>`);
    for (const t of it.tags || []) pills.push(`<span class="pill ${esc(t.cls || '')}" ${t.color ? `style="--c:${esc(t.color === true || t.color === 'auto' ? color : t.color)}"` : ''}>${t.color ? '<span class="sw"></span>' : ''}${esc(t.text)}</span>`);
    if (it.gm) pills.push(`<span class="pill st">Storyteller only</span>`);
    const lvl = coll !== 'people' && it.realm ? m.realm(it.realm).levels : null;
    const levelName = lvl && lvl.length > 1 && it.level && it.level !== lvl[0].id ? (lvl.find(l => l.id === it.level) || {}).name : '';
    const kick = [it.kicker || (coll === 'places' && cat ? cat.name : TYPE_NAMES[coll]), it.kicker ? '' : levelName].filter(Boolean).join(' · ');
    const H = [];
    H.push(`<div class="detbar"><button type="button" class="back" data-act="back">${svg('back', 2)} Back to ${esc((this.rv.terms[this.tab] || '').toLowerCase())}</button><span class="dbtns">${(this.opts.canEdit ?? this.isGM) && this.opts.editorFactory ? `<button type="button" class="lnk" data-act="edit-item" title="Edit">${svg('pen')} Edit</button>` : ''}${this.isGM && this.adapter.share ? `<button type="button" class="lnk" data-act="share-item" title="Show this entry to the players">${svg('share')} Show</button>` : ''}</span></div>`);
    H.push(`<div class="dsub">${esc(kick)}</div><h2>${esc(it.name || '')}</h2>${it.sub ? `<div class="dsub">${esc(it.sub)}</div>` : ''}`);
    H.push(`<div class="meta">${pills.join('')}</div>`);
    if (it.img) H.push(`<figure class="portrait${coll === 'people' ? '' : ' wide'}"><img src="${esc(this.resolveUrl(it.img))}" alt="${esc(it.name)}" loading="lazy"></figure>`);
    if (it.facts && it.facts.length && coll === 'people') H.push(`<div class="mien">${it.facts.map(f2 => `<div><b>${esc(f2.k)}</b>${f2.v || ''}</div>`).join('')}</div>`);
    const lawNotes = (it.notes || []).filter(n => n.kind === 'law' && (!n.gm || st.gm));
    lawNotes.forEach(n => H.push(this.noteHtml(n)));
    if (it.html) H.push(`<div class="body enrich">${it.html}</div>`);
    if (it.facts && it.facts.length && coll !== 'people') { const fs = it.facts.filter(f2 => !(it.tags || []).some(t => t.text === `${f2.k} ${stripHtml(f2.v)}`)); if (fs.length) H.push(`<dl class="facts">${fs.map(f2 => `<dt>${esc(f2.k)}</dt><dd>${f2.v || ''}</dd>`).join('')}</dl>`); }
    (it.notes || []).filter(n => n.kind !== 'law' && (!n.gm || st.gm)).forEach(n => H.push(this.noteHtml(n)));
    // crossing to other realms / levels
    H.push(this.crossHtml(it, coll));
    if (it.uuid && this.adapter.openUuid) H.push(`<button type="button" class="cross doc" data-uuid="${esc(it.uuid)}">${svg('book')}<span><b>Open linked document</b><small>${esc(it.uuidName || it.uuid)}</small></span></button>`);
    const section = (title, ids) => { const rows = [...new Set(ids)].map(i => this.refRow(i)).filter(Boolean); return rows.length ? `<h3>${esc(title)}${rows.length > 3 ? ` · ${rows.length}` : ''}</h3>${rows.join('')}` : ''; };
    if (coll === 'places') {
      const zs = m.containingZones(it, st).filter(z => z.id !== it.zone && !(z.gm && !st.gm)); if (it.zone) zs.unshift(m.item(it.zone));
      H.push(section('Lies within', zs.filter(Boolean).map(z => z.id)));
      H.push(section('Routes', [...m.routesAt(it.id), ...m.routesNear(it, st)].map(r => r.id)));
      H.push(section('Close by', m.nearby(it, st, A.closeBy || 250).slice(0, 8).map(p => p.id)));
      H.push(section('Figures here', m.peopleAt(it).filter(p => !p.gm || st.gm).map(p => p.id)));
    } else if (coll === 'zones') {
      if (it.owners) H.push(section('Claimed by', it.owners));
      H.push(section('Inside', m.placesInZone(it, st).filter(p => !p.hidden).map(p => p.id)));
      const inside = new Set(m.placesInZone(it, st).map(p => p.id)); H.push(section('Routes', Object.values(A.routes).filter(r => (r.ends || []).some(e => inside.has(e)) && m.inRealm(r, st)).map(r => r.id)));
      H.push(section('Figures here', m.peopleAt(it).map(p => p.id)));
    } else if (coll === 'routes') {
      H.push(section('Ends', it.ends || []));
      H.push(section('Figures here', m.peopleAt(it).map(p => p.id)));
    } else if (coll === 'people') {
      H.push(section('Where to find them', it.at || []));
      H.push(section('Domain', m.ownersOf.get(it.id) || []));
      if (it.relations && it.relations.rows && it.relations.rows.length) H.push(`<h3>${esc(it.relations.title || 'Connections')}</h3><div class="rel">${it.relations.rows.map(([w, a]) => `<span>${esc(w)}</span><span>${esc(a)}</span>`).join('')}</div>`);
    }
    if (it.links && it.links.length) H.push(section('See also', it.links.map(l => l.id).filter(i => !(it.anchor === i))));
    if (coll !== 'people' && coll !== 'pages') H.push(`<button type="button" class="btn" data-act="center">${svg('target')} Centre on map</button>`);
    if (it.src) H.push(`<div class="src">${/^(Improvised|From the|Domains)/.test(it.src) ? '' : 'Source: '}${it.src}</div>`);
    this.el.pane.innerHTML = `<div class="det" style="--c:${esc(color)}">${H.join('')}</div>`;
    this.el.pane.scrollTop = 0;
    this.enrichIn(this.el.pane);
    this.root.classList.remove('side-min');
  }
  noteHtml(n) { return `<div class="scene${n.kind ? ' ' + esc(n.kind) : ''}${n.gm ? ' secret' : ''}">${n.title ? `<b>${esc(n.title)}</b>` : ''}<div class="enrich">${n.html || ''}</div></div>`; }
  crossHtml(it, coll) {
    const m = this.model, out = [], seen = new Set();
    const btn = (target, label, icon, names) => { if (!target) return; out.push(`<button type="button" class="cross" data-go="${esc(target)}">${svg(icon || 'gate')}<span><b>${esc(label)}</b><small>${esc(names)}</small></span></button>`); };
    const viewOf = t => { const h = m.homeOf(t); return h ? m.view(h.realm, h.level) : null; };
    if (it.anchor) { const a = m.item(it.anchor); if (a && (!a.gm || this.st.gm)) { const v = viewOf(a); seen.add(a.id); btn(a.id, v ? (v.crossLabel || `Go to ${v.name}`) : 'Go to anchor', v && v.crossIcon, a.name); } }
    const twins = (m.anchoredBy.get(it.id) || []).map(i => m.item(i)).filter(t => t && (!t.gm || this.st.gm) && !seen.has(t.id));
    const groups = new Map();
    for (const t of twins) { const h = m.homeOf(t); if (!h) continue; if (h.realm === this.st.realm && m.inLevel(t, this.st)) continue; const k = h.realm + ':' + h.level; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(t); }
    for (const [k, arr] of groups) { const [r, l] = k.split(':'); const v = m.view(r, l); btn(arr[0].id, v.crossLabel || `Go to ${v.name}`, v.crossIcon, arr.map(t => t.name).join(' · ')); arr.forEach(t => seen.add(t.id)); }
    for (const l of it.links || []) { const t = m.item(l.id); if (!t || seen.has(t.id) || (t.gm && !this.st.gm)) continue; const h = m.homeOf(t); if (!h || (h.realm === this.st.realm && m.inLevel(t, this.st))) continue; const v = m.view(h.realm, h.level); seen.add(t.id); btn(t.id, l.label || v.crossLabel || `Go to ${v.name}`, v.crossIcon, t.name); }
    return out.join('');
  }
  async enrichIn(root) {
    if (!this.adapter.enrich) return;
    const els = [...root.querySelectorAll('.enrich, .wca-page, .wca-pagenote')].filter(e => /@\w+\[|\[\[/.test(e.innerHTML) && !e.dataset.enriched);
    for (const e of els) { try { e.dataset.enriched = '1'; e.innerHTML = await this.adapter.enrich(e.innerHTML); } catch (err) { console.warn('wod-city-atlas | enrich failed', err); } }
  }
  onPaneClick(e) {
    const t = e.target;
    const chip = t.closest('.chip[data-cat]');
    if (chip) { const k = chip.dataset.cat; if (e.shiftKey || e.altKey) { this.catsOff = new Set(this.model.categoriesFor(this.st.realm, this.st.level).map(c => c.id).filter(c => c !== k)); } else if (this.catsOff.has(k)) this.catsOff.delete(k); else this.catsOff.add(k); this.persist(); this.buildMarkers(); this._keepScroll = true; this.render(); return; }
    if (t.closest('.wca-faded')) { this.showFaded = t.closest('.wca-faded').checked; this.persist(); this.renderListOnly(); return; }
    const lay = t.closest('input[data-layer]'); if (lay) { this.setLayer(lay.dataset.layer, lay.checked); return; }
    const hide = t.closest('[data-hide]'); if (hide) { const id = hide.dataset.hide; if (this.hiddenItems.has(id)) this.hiddenItems.delete(id); else this.hiddenItems.add(id); this.persist(); this.dirty(); hide.setAttribute('aria-pressed', String(!this.hiddenItems.has(id))); hide.innerHTML = svg(this.hiddenItems.has(id) ? 'eyeoff' : 'share'); return; }
    const go = t.closest('[data-go]'); if (go) { this.open(go.dataset.go); return; }
    const link = t.closest('[data-link]'); if (link) { this.open(link.dataset.link); return; }
    const uu = t.closest('[data-uuid]'); if (uu) { this.adapter.openUuid?.(uu.dataset.uuid); return; }
    const act = t.closest('[data-act]'); if (!act) return;
    const a = act.dataset.act, it = this.model.item(this.detailId);
    if (a === 'back') { this.detailId = null; this.setSel(null); this.render(); }
    else if (a === 'center' && it) this.focusItem(it, this.model.collOf(it.id));
    else if (a === 'edit-item' && it) { if (!this.editMode) this.toggleEdit(true); this.editor?.edit(it.id); }
    else if (a === 'share-item' && it) this.adapter.share?.(this.getState());
  }

  /* ================= finder ================= */
  openFinder() { this.el.finder.hidden = false; this.el.fq.value = ''; this.runFinder(); setTimeout(() => this.el.fq.focus(), 20); }
  closeFinder() { this.el.finder.hidden = true; this.root.focus({preventScroll: true}); }
  runFinder() {
    const q = this.el.fq.value.trim().toLowerCase(), m = this.model;
    if (!q) { this.el.fres.innerHTML = `<div class="fhint">Type to search every realm and level: places, zones, routes and people.</div>`; return; }
    const words = q.split(/\s+/);
    const hits = m.searchIndex().filter(h => (!h.it.gm || this.st.gm) && words.every(w => h.text.includes(w)))
      .map(h => ({h, score: (h.name.toLowerCase().startsWith(q) ? 3 : 0) + (h.name.toLowerCase().includes(q) ? 2 : 0) + (h.it.realm === this.st.realm ? 0.5 : 0)}))
      .sort((a, b) => b.score - a.score || a.h.name.localeCompare(b.h.name)).slice(0, 40);
    this.el.fres.innerHTML = hits.length ? hits.map(({h}) => { const it = h.it; const realm = h.coll === 'people' ? 'Person' : it.realm ? (m.realm(Array.isArray(it.realm) ? it.realm[0] : it.realm).name + (it.level && m.realm(it.realm).levels.length > 1 && it.level !== m.realm(it.realm).levels[0].id ? ' · ' + ((m.realm(it.realm).levels.find(l => l.id === it.level) || {}).name || '') : '')) : TYPE_NAMES[h.coll];
      return `<button type="button" class="fitem" data-id="${esc(it.id)}"><span class="fl" style="--c:${esc(m.colorOf(it))}">${esc(realm)}</span><span class="fn">${esc(it.name)}<small>${esc(it.sub || this.kindLabel(h.coll, it))}</small></span></button>`; }).join('') : `<div class="fhint">Nothing found.</div>`;
  }
}
