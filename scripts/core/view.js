/* AtlasView: the interactive map, its chrome and the dossier panel. Framework-free; Foundry glue lives elsewhere. */
import {esc, svg, clamp, sortBy, stripHtml, debounce, withAlpha} from './util.js';
import {AtlasModel, TYPE_NAMES, TIER} from './model.js';
import {Renderer} from './renderer.js';

const PREF_KEY = 'wod-city-atlas:prefs:';
const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The pin's body: a shape drawn in SVG, outlined in the pin colour (--c). */
const SHAPES = {
  circle: '<circle cx="16" cy="16" r="13"/>',
  square: '<rect x="3.5" y="3.5" width="25" height="25" rx="5"/>',
  diamond: '<path d="M16 2 30 16 16 30 2 16z"/>',
  hex: '<path d="M16 2.5l11.7 6.75v13.5L16 29.5 4.3 22.75V9.25z"/>',
  shield: '<path d="M16 2.5l12 4v8.5c0 7-5 12-12 14.5C9 27 4 22 4 15V6.5z"/>',
  octagon: '<path d="M10.6 3h10.8L29 10.6v10.8L21.4 29H10.6L3 21.4V10.6z"/>',
  marker: '<path d="M16 30C9 22 4.5 17 4.5 12a11.5 11.5 0 0 1 23 0c0 5-4.5 10-11.5 18z"/>',
  note: '<path d="M4 4h24v17l-7 7H4z"/><path d="M21 28v-7h7" fill="none"/>'
};
export const PIN_SHAPES = Object.keys(SHAPES).filter(k => k !== 'note');
function pinBody(shape, border = 'solid', width, bg) {
  const d = SHAPES[shape] || SHAPES.circle, w = width ? Math.max(1, +width) * 1.1 : 2.2;
  const dash = border === 'dashed' ? 'stroke-dasharray:4.5 3;' : border === 'dotted' ? 'stroke-dasharray:.1 3.6;stroke-linecap:round;' : '';
  const fill = Array.isArray(bg) && bg[1] ? bg[1] : 'var(--wca-pin-b)', hi = Array.isArray(bg) && bg[0] ? bg[0] : 'var(--wca-pin-a)';
  const dbl = border === 'double' ? `<g style="fill:none;stroke:${fill};stroke-width:1.2">${d}</g>` : '';
  return `<svg class="pbg" viewBox="0 0 32 32" aria-hidden="true"><g style="fill:${fill};stroke:var(--c);stroke-width:${border === 'double' ? w + 1.6 : w};${dash}">${d}</g><g style="fill:${hi};opacity:.55;stroke:none;transform:scale(.62);transform-origin:16px 13px">${d}</g>${dbl}</svg>`;
}

export class AtlasView {
  /**
   * @param {HTMLElement} root
   * @param {object} opts {store, adapter, isGM, atlasKey, editorFactory, animate}
   */
  constructor(root, opts) {
    this.root = root; this.opts = opts; this.store = opts.store; this.adapter = opts.adapter || {};
    this.isGM = !!opts.isGM;
    this.sc = opts.scene || null; // live Foundry scene host: the map is drawn on the scene, the dossier lives in a window
    this.model = new AtlasModel(this.store.atlas, this.store.basemap);
    this.renderer = new Renderer(this);
    this.cam = {cx: 0, cy: 0, z: 11, W: 0, H: 0, dpr: 1};
    this.T = 0; this.sel = null; this.hover = null; this.tab = 'places'; this.q = ''; this.detailId = null;
    this.editor = null; this.editMode = false;
    this.prefs = this.loadPrefs();
    const ini = opts.initial || {};
    const r0 = this.model.realm(this.prefs.realm || ini.realm);
    this.viewer = opts.viewer || {id: 'me', name: 'Me'};
    const va = this.isGM ? (this.prefs.viewAs || 'gm') : this.viewer.id;
    this.st = {realm: r0.id, level: this.model.level(r0.id, this.prefs.level || ini.level).id, storyteller: va === 'gm', gm: va === 'gm', as: va === 'gm' ? '*' : va,
      layerOn: id => this.layerOn(id), catOn: id => !this.catsOff.has(id)};
    this.ensureVisibleRealm();
    this.layerState = new Map(Object.entries(this.prefs.layers || {}));
    this.catsOff = new Set(this.prefs.catsOff || []);
    this.hiddenItems = new Set(this.prefs.hidden || []);
    this.showFaded = this.prefs.showFaded !== false;
    this.notesShared = this.prefs.notesShared !== false; this.notesPrivate = !!this.prefs.notesPrivate;
    this.build();
    this.unsub = this.store.onChange?.(info => this.onStoreChange(info));
    this.unsubNotes = this.adapter.onNotes?.(() => this.notesChanged());
    this.applyView(true);
    if (!this.sc) { this.home(true); if (this.prefs.view && this.prefs.view.z) { Object.assign(this.cam, this.prefs.view); this.clampView(); } }
    this.render();
  }

  /* ================= preferences ================= */
  get atlasKey() { return this.opts.atlasKey || this.store.key || 'default'; }
  loadPrefs() { try { return JSON.parse(localStorage.getItem(PREF_KEY + this.atlasKey) || '{}'); } catch (e) { return {}; } }
  savePrefs() {
    try { localStorage.setItem(PREF_KEY + this.atlasKey, JSON.stringify({realm: this.st.realm, level: this.st.level, layers: Object.fromEntries(this.layerState), catsOff: [...this.catsOff], hidden: [...this.hiddenItems], showFaded: this.showFaded, viewAs: this.isGM ? (this.st.storyteller ? 'gm' : this.st.as) : undefined, view: {cx: this.cam.cx, cy: this.cam.cy, z: this.cam.z}, side: this.root.classList.contains('side-min'), atlasHidden: !!this.atlasHidden, notesShared: this.notesShared !== false, notesPrivate: !!this.notesPrivate})); } catch (e) {}
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
          <button type="button" role="tab" data-tab="places"></button><button type="button" role="tab" data-tab="people"></button><button type="button" role="tab" data-tab="zones"></button><button type="button" role="tab" data-tab="pages"></button><button type="button" role="tab" data-tab="map"></button><button type="button" role="tab" data-tab="notes"></button>
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
          <button type="button" class="mbtn" data-act="note" title="Add a note to the map" hidden>${svg('note')}</button>
          <button type="button" class="mbtn" data-act="hideatlas" title="Hide or show the atlas on the scene" hidden>${svg('scene')}</button>
          <span class="hotlayers"></span>
          <span class="gmbtns"></span>
          <div class="wca-layers" hidden></div>
        </div>
        <div class="wca-legend"></div>
        <div class="wca-credit"></div>
        <div class="wca-scale"></div>
        <div class="wca-finder" hidden><div class="fbox">${svg('search')}<input type="search" placeholder="Search every layer: people, places, zones…" autocomplete="off" aria-label="Search every layer"><button type="button" class="fx" aria-label="Close">${svg('x', 2)}</button></div><div class="fres"></div></div>
        <div class="wca-edbar" hidden></div>
        <div class="wca-empty" hidden><b>Nothing here yet</b><span>The Storyteller hasn't revealed this map to you.</span></div>
      </div>`;
    const $ = s => R.querySelector(s);
    this.el = {side: $('.wca-side'), pane: $('.wca-pane'), map: $('.wca-map'), canvas: $('.wca-canvas'), fade: $('.wca-fade'), overlay: $('.wca-overlay'), tip: $('.wca-tip'),
      realms: $('.seg.realms'), levels: $('.seg.levels'), bar: $('.wca-bar'), layers: $('.wca-layers'), legend: $('.wca-legend'), credit: $('.wca-credit'), scale: $('.wca-scale'),
      finder: $('.wca-finder'), fq: $('.wca-finder input'), fres: $('.wca-finder .fres'), edbar: $('.wca-edbar'), empty: $('.wca-empty'), hot: $('.hotlayers'), gmb: $('.gmbtns'), mast: $('.wca-mast')};
    if (this.prefs.side && !this.sc) R.classList.add('side-min');
    if (this.sc) this.mountScene();
    this.ctx = this.el.canvas.getContext('2d');
    R.querySelectorAll('.wca-tabs button').forEach(b => b.addEventListener('click', () => { this.tab = b.dataset.tab; this.detailId = null; this.setSel(null); this.render(); }));
    this.el.bar.addEventListener('click', e => this.onBar(e));
    this.el.fq.addEventListener('input', () => this.runFinder());
    this.el.fq.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); this.closeFinder(); } else if (e.key === 'Enter') { const b = this.el.fres.querySelector('[data-id]'); if (b) b.click(); } else if (e.key === 'ArrowDown') { e.preventDefault(); const b = this.el.fres.querySelector('[data-id]'); if (b) b.focus(); } });
    this.el.finder.querySelector('.fx').addEventListener('click', () => this.closeFinder());
    this.el.fres.addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) { this.closeFinder(); this.open(b.dataset.id); } });
    this.el.pane.addEventListener('click', e => this.onPaneClick(e));
    this.el.pane.addEventListener('change', e => {
      const sel = e.target.closest('.reveal select[data-rv]'); if (sel) { const p = sel.closest('.reveal'); this.setReveal(p.dataset.revealId, sel.dataset.rv, sel.value); return; }
      const va = e.target.closest('.maptab select[data-viewas]'); if (va) { this.setViewAs(va.value); return; }
      const sw = e.target.closest('.secrow select[data-sw]'); if (sw) { const p = sw.closest('.reveal'); this.setSecret(p.dataset.revealId, sw.closest('.secrow').dataset.sec, sw.dataset.sw, sw.value); }
    });
    R.addEventListener('keydown', e => this.onKey(e));
    this.bindMap();
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this.el.map);
    this.resize();
  }
  /** Scene mode: the map surface goes onto the Foundry board; realm switches, map tools and search join the dossier. */
  mountScene() {
    const R = this.root, L = this.sc.layer;
    R.classList.add('scene-hud');
    // realm & level switches, layers, search and the note tool sit in a toolbar on the scene itself
    const bar = document.createElement('div'); bar.className = 'wca-scenebar';
    bar.append(R.querySelector('.wca-modebar'), this.el.bar, this.el.finder);
    this.el.map.appendChild(bar);
    this.el.legend.remove();
    L.classList.add('wca', 'scene-map'); L.appendChild(this.el.map);
    this.el.scenebar = bar; this.layerRoot = L;
    this.atlasHidden = !!this.prefs.atlasHidden; L.classList.toggle('atlas-off', this.atlasHidden);
    // the wheel over a pin still zooms the scene
    L.addEventListener('wheel', e => this.sc.forwardWheel?.(e), {passive: true});
  }
  /** Scene mode: the scene picture already shows this realm's plain map, so the layer stays transparent there. */
  get clearBase() { return !!(this.sc && this.sc.baseShown && this.sc.baseShown(this.st.realm, this.st.level)); }
  setAtlasHidden(on) {
    this.atlasHidden = !!on; this.layerRoot?.classList.toggle('atlas-off', this.atlasHidden);
    const b = this.el.bar.querySelector('[data-act="hideatlas"]'); if (b) { b.setAttribute('aria-pressed', String(this.atlasHidden)); b.innerHTML = svg(this.atlasHidden ? 'eyeoff' : 'scene'); }
    this.persist(); if (this.tab === 'map' && !this.detailId) this.render(true);
  }
  roots() { return this.layerRoot ? [this.root, this.layerRoot] : [this.root]; }
  destroy() {
    this.dead = true; this.ro?.disconnect(); this.unsub?.(); this.unsubNotes?.(); cancelAnimationFrame(this.raf); cancelAnimationFrame(this.loopRaf); this.savePrefs();
    this.editor?.destroy?.(); this.root.innerHTML = ''; if (this.layerRoot) this.layerRoot.innerHTML = '';
  }
  resolveUrl(src) { return this.adapter.resolveUrl ? this.adapter.resolveUrl(src) : src; }

  /* ================= store sync ================= */
  onStoreChange(info = {}) {
    if (info.basemap) this.model.setBasemap(this.store.basemap);
    this._nameIdx = null;
    this.model.setAtlas(this.store.atlas);
    if (!this.model.atlas.realms[this.st.realm]) this.st.realm = this.model.realmList[0].id;
    this.st.level = this.model.level(this.st.realm, this.st.level).id;
    this.ensureVisibleRealm();
    this.renderer.effectCache.clear();
    this.applyView();
    if (this.detailId && !this.canSee(this.detailId)) this.detailId = null;
    if (!(this.editor && this.editor.holdsPane())) this.render(true);
    this.dirty();
  }

  /* ================= realm / level ================= */
  applyView(first) {
    this.rv = this.model.view(this.st.realm, this.st.level);
    const t = this.rv.theme, R = this.root, RS = this.roots();
    const set = (k, v) => RS.forEach(r => r.style.setProperty('--wca-' + k, v));
    set('panel', t.panel); set('panel2', t.panel2); set('line', t.line); set('accent', t.accent); set('gold', t.gold); set('muted', t.muted); set('faint', t.faint); set('bone', t.bone);
    set('accent-line', t.accentLine); set('accent-soft', t.accentSoft); set('seg-on', t.segOn); set('seg-on-fg', t.segOnFg); set('glow', t.glow); set('chrome', t.chrome);
    set('pin-a', (t.pinBg || [])[0] || '#231e27'); set('pin-b', (t.pinBg || [])[1] || '#0f0d12'); set('label-halo', t.labelHalo || '#000');
    for (const r of RS) { r.classList.toggle('pin-glow', !!t.pinGlow); r.classList.toggle('is-gm', this.st.gm); r.classList.toggle('gm-user', this.isGM); r.dataset.realm = this.st.realm; r.dataset.level = this.st.level; }
    const a = this.model.atlas, v = this.rv, m = this.el.mast;
    m.querySelector('.kg').innerHTML = svg(v.icon || 'ankh', 1.4);
    m.querySelector('.kt').textContent = v.kicker || v.name || '';
    m.querySelector('.ttl').innerHTML = a.titleHtml || esc(a.title);
    m.querySelector('.date').textContent = v.date || '';
    const bn = m.querySelector('.banner'); bn.hidden = !v.banner; bn.querySelector('span').textContent = v.banner || '';
    this.root.querySelectorAll('.wca-tabs button').forEach(b => { b.textContent = ({map: 'Map', notes: 'Notes'})[b.dataset.tab] || v.terms[b.dataset.tab] || b.dataset.tab; b.setAttribute('aria-selected', String(b.dataset.tab === this.tab)); b.hidden = b.dataset.tab === 'notes' && !this.adapter.notes; });
    // realm & level switches
    const rl = this.st.storyteller ? this.model.realmList : this.model.visibleRealms(this.st);
    const locked = !this.isGM && !!this.sc?.locked?.();
    this.el.realms.hidden = rl.length < 2 || locked;
    this.el.realms.innerHTML = rl.map((r, i) => `<button type="button" role="radio" data-realm="${esc(r.id)}" aria-checked="${r.id === this.st.realm}" title="${esc(r.name)}${i < 9 ? ` (${i + 1})` : ''}" class="${this.isGM && !this.model.realmVisible(r.id, Object.assign({}, this.st, {storyteller: false})) ? 'veiled' : ''}">${svg(r.icon || 'sun')}<span>${esc(r.name)}</span></button>`).join('');
    const lv = this.st.storyteller ? this.model.realm(this.st.realm).levels : this.model.visibleLevels(this.st.realm, this.st);
    this.el.levels.hidden = lv.length < 2 || locked;
    let fl = this.el.realms.parentElement.querySelector('.follow');
    if (locked) { if (!fl) { fl = document.createElement('span'); fl.className = 'follow'; this.el.realms.parentElement.appendChild(fl); } fl.innerHTML = `${svg('lock')}<span>${esc(this.rv.name || '')}${lv.length > 1 ? ' · ' + esc((lv.find(l => l.id === this.st.level) || {}).name || '') : ''}</span>`; fl.title = 'The Storyteller chooses the realm on this scene'; }
    else if (fl) fl.remove();
    this.el.levels.innerHTML = lv.map(l => `<button type="button" role="radio" data-level="${esc(l.id)}" aria-checked="${l.id === this.st.level}">${esc(l.name || l.id)}</button>`).join('');
    this.el.realms.onclick = e => { const b = e.target.closest('[data-realm]'); if (b) this.setRealm(b.dataset.realm); };
    this.el.levels.onclick = e => { const b = e.target.closest('[data-level]'); if (b) this.setLevel(b.dataset.level); };
    // legend & credit
    this.el.legend.innerHTML = this.legendShown(v).map(l => `<span><i class="k-${esc(l.kind || 'fill')}" style="--c:${esc(l.color)}"></i>${esc(l.label)}</span>`).join('');
    this.el.legend.hidden = !this.legendShown(v).length;
    this.el.credit.textContent = v.credit || ''; this.el.credit.hidden = !v.credit;
    this.renderLayersPanel(); this.renderHotLayers(); this.renderGmButtons();
    this.el.empty.hidden = this.st.storyteller || this.model.realmVisible(this.st.realm, this.st);
    this.buildMarkers();
    this.setLoop();
    if (!first) this.dirty();
  }
  ensureVisibleRealm() {
    if (this.st.storyteller) return;
    if (!this.model.realmVisible(this.st.realm, this.st)) { const r = this.model.visibleRealms(this.st)[0]; if (r) { this.st.realm = r.id; this.st.level = r.levels[0].id; } }
    if (!this.model.levelVisible(this.st.realm, this.st.level, this.st)) { const l = this.model.visibleLevels(this.st.realm, this.st)[0]; if (l) this.st.level = l.id; }
  }
  setRealm(id, quiet) {
    if (id === this.st.realm || !this.model.atlas.realms[id]) return;
    if (!this.st.storyteller && !this.model.realmVisible(id, this.st)) return;
    this.snapshotFade();
    this.st.realm = id; const r = this.model.realm(id); this.st.level = (this.st.storyteller ? r.levels : this.model.visibleLevels(id, this.st))[0]?.id || r.levels[0].id;
    this.q = ''; this.hideTip(); this.hover = null;
    this.applyView(); this.persist(); this.sc?.onRealm?.(this.st.realm, this.st.level);
    if (!quiet) { this.detailId = null; this.setSel(null); this.render(); this.focusRealm(); }
  }
  setLevel(id, quiet) {
    if (id === this.st.level) return;
    if (!this.st.storyteller && !this.model.levelVisible(this.st.realm, id, this.st)) return;
    this.snapshotFade(250);
    this.st.level = this.model.level(this.st.realm, id).id;
    this.applyView(); this.persist(); this.sc?.onRealm?.(this.st.realm, this.st.level);
    if (!quiet) { if (!this.detailId) this.render(); this.focusRealm(); }
  }
  focusRealm() { const f = this.rv.focus; if (f && f.box && this.cam.z < (f.minZoom ?? 0)) this.fitLL(f.box, 40); }
  snapshotFade(ms = 650) {
    if (reduceMotion() || !this.cam.W || this.sc) return;
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
  /** Legend entries; entries marked Storyteller only are hidden from players. */
  legendShown(v) { return (v.legend || []).filter(l => this.st.storyteller || !l.gm); }
  /** Category chips: the Storyteller sees all; a player only sees categories with at least one place they know of here. */
  catsShown() {
    const st = this.st, cats = this.model.categoriesFor(st.realm, st.level);
    if (st.storyteller) return cats;
    const has = new Set(Object.values(this.model.atlas.places).filter(p => p.cat && this.tierOf(p, 'places') >= TIER.BASIC && this.model.visible(p, 'places', st, {ignoreLayer: true, ignoreCat: true})).map(p => p.cat));
    return cats.filter(c => this.tierOf(c, 'categories') >= 1 && has.has(c.id));
  }
  layersShown() { return this.model.layersFor(this.st.realm, this.st.level).filter(L => this.st.storyteller || this.model.layerVisible(L.id, this.st)); }
  renderLayersPanel() {
    const ls = this.layersShown();
    const v = this.rv, P = this.el.layers;
    const prec = Object.entries(this.model.atlas.precisions || {});
    P.innerHTML = `<h4>${esc(v.name)} layers</h4>` + (ls.length ? ls.map(L => `<label>${esc(L.name || L.id)}<input class="tog" type="checkbox" data-layer="${esc(L.id)}" ${this.layerOn(L.id) ? 'checked' : ''}></label>`).join('') : '<div class="empty-s">No layers yet.</div>') +
      (this.isGM ? `<label class="stl viewas">View as<select data-viewas>${this.viewAsOptions().map(([v, n]) => `<option value="${esc(v)}" ${v === (this.st.storyteller ? 'gm' : this.st.as) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>` : '') +
      (prec.length ? `<div class="key">${prec.map(([k, p]) => `<span><i style="border-style:${esc(p.border || 'solid')};border-color:${esc(p.color || 'var(--wca-gold)')}"></i>${esc(p.name)}</span>`).join('')}</div>` : '');
    P.onchange = e => { const t = e.target; if (t.dataset.layer) this.setLayer(t.dataset.layer, t.checked); else if ('viewas' in t.dataset) this.setViewAs(t.value); };
  }
  renderHotLayers() {
    const ls = this.layersShown().filter(L => L.icon);
    this.el.hot.innerHTML = ls.map(L => `<button type="button" class="mbtn" data-hot="${esc(L.id)}" aria-pressed="${this.layerOn(L.id)}" title="${esc(L.name)}${L.hotkey ? ` ( ${esc(L.hotkey.toUpperCase())} )` : ''}">${svg(L.icon)}</button>`).join('');
  }
  renderGmButtons() {
    const canEdit = this.opts.canEdit ?? this.isGM;
    const nb = this.el.bar.querySelector('[data-act="note"]'); if (nb) { nb.hidden = !this.adapter.notes; nb.setAttribute('aria-pressed', String(!!this.placing)); }
    const hb = this.el.bar.querySelector('[data-act="hideatlas"]'); if (hb) { hb.hidden = !this.sc; hb.setAttribute('aria-pressed', String(!!this.atlasHidden)); hb.innerHTML = svg(this.atlasHidden ? 'eyeoff' : 'scene'); }
    if (this.sc) {
      const lk = this.sc.locked?.();
      this.el.gmb.innerHTML = (this.adapter.openFull ? `<button type="button" class="mbtn" data-act="full" title="${canEdit ? 'Open the full atlas window (to edit)' : 'Open the atlas in a window'}">${svg(canEdit ? 'pen' : 'window')}</button>` : '') +
        (this.isGM && this.sc.setLocked ? `<button type="button" class="mbtn" data-act="lock" aria-pressed="${!!lk}" title="${lk ? 'Players follow your realm and level (click to let them switch freely)' : 'Players switch realms themselves (click to make them follow you)'}">${svg(lk ? 'lock' : 'unlock')}</button>` : '') +
        (this.adapter.share && this.isGM ? `<button type="button" class="mbtn" data-act="share" title="Show this view to the players">${svg('share')}</button>` : '');
      return;
    }
    if (!canEdit && !this.isGM) { this.el.gmb.innerHTML = ''; return; }
    this.el.gmb.innerHTML = (this.opts.editorFactory && canEdit ? `<button type="button" class="mbtn ${this.editMode ? 'on' : ''}" data-act="edit" aria-pressed="${this.editMode}" title="Edit the atlas">${svg('pen')}</button>` : '') +
      (this.adapter.share && this.isGM ? `<button type="button" class="mbtn" data-act="share" title="Show this view to the players">${svg('share')}</button>` : '');
  }
  players() { try { return (this.adapter.players && this.adapter.players()) || []; } catch (e) { return []; } }
  viewAsOptions() { return [['gm', 'Storyteller (everything)'], ['*', 'Every player (defaults)'], ...this.players().map(p => [p.id, p.name])]; }
  /** GM preview: 'gm' = full view, '*' = what a player with no personal reveals sees, or a user id. */
  setViewAs(v) {
    if (!this.isGM) return;
    this.st.storyteller = v === 'gm'; this.st.gm = this.st.storyteller; this.st.as = v === 'gm' ? '*' : v;
    this.ensureVisibleRealm(); this.persist(); this.applyView(); this.render(); this.dirty();
  }
  setGmView(on) { this.setViewAs(on ? 'gm' : '*'); }
  /* ----- what the current viewer may know ----- */
  tierOf(it, coll) { return this.model.tier(it, coll || this.model.collOf(it.id), this.st); }
  canSee(id) { const r = this.model.get(id); return !!r && this.model.known(r.item, r.coll, this.st); }
  nameOf(it, coll) { coll ||= this.model.collOf(it.id); if (this.tierOf(it, coll) >= TIER.BASIC) return it.name || it.title || it.text || ''; return it.alias || ({places: 'Unknown place', zones: 'Unknown area', routes: 'Unknown way', people: 'Unknown figure', auras: 'Something strange'}[coll] || 'Unknown'); }

  onBar(e) {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.hot) { this.setLayer(b.dataset.hot, !this.layerOn(b.dataset.hot)); return; }
    const a = b.dataset.act;
    if (a === 'layers') { this.el.layers.hidden = !this.el.layers.hidden; b.setAttribute('aria-expanded', String(!this.el.layers.hidden)); }
    else if (a === 'in') this.animateTo([this.cam.cx, this.cam.cy], this.cam.z + 1, 250);
    else if (a === 'out') this.animateTo([this.cam.cx, this.cam.cy], this.cam.z - 1, 250);
    else if (a === 'home') this.home();
    else if (a === 'find') this.openFinder();
    else if (a === 'side') { if (this.sc) this.sc.toggleHud?.(); else { this.root.classList.toggle('side-min'); this.persist(); } }
    else if (a === 'full') this.adapter.openFull?.(this.getState());
    else if (a === 'note') this.startNote(!this.placing);
    else if (a === 'hideatlas') this.setAtlasHidden(!this.atlasHidden);
    else if (a === 'maptab') { this.tab = 'map'; this.detailId = null; this.render(); this.sc?.showHud?.(); }
    else if (a === 'lock') { this.sc?.setLocked?.(!this.sc.locked()); }
    else if (a === 'edit') this.toggleEdit();
    else if (a === 'share') this.adapter.share?.(this.getState());
  }
  toggleEdit(on = !this.editMode, extra = {}) {
    if (this.sc) { if (on && (this.opts.canEdit ?? this.isGM)) this.adapter.openFull?.(Object.assign(this.getState(), {edit: true}, extra)); return; }
    if (!(this.opts.canEdit ?? this.isGM) || !this.opts.editorFactory) return;
    this.editMode = on;
    if (on) { this.editor = this.opts.editorFactory(this); this.editor.start(); }
    else { this.editor?.stop(); this.editor = null; this.el.edbar.hidden = true; this.root.classList.remove('editing'); this.render(); }
    this.renderGmButtons(); this.buildMarkers(); this.dirty();
  }

  /* ================= camera ================= */
  resize() {
    let r = this.el.map.getBoundingClientRect();
    if (this.sc && this.sc.size) { const z = this.sc.size(); if (z && z.width && z.height) r = z; }
    if (!r.width || !r.height) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    const first = !this.cam.W;
    this.cam.W = r.width; this.cam.H = r.height;
    if (d !== this.cam.dpr) { this.cam.dpr = d; this.renderer.patterns.clear(); }
    this.el.canvas.width = Math.round(r.width * d); this.el.canvas.height = Math.round(r.height * d);
    this.el.canvas.style.width = r.width + 'px'; this.el.canvas.style.height = r.height + 'px';
    if (first && !this.sc) this.home(true);
    this.clampView(); this.dirty(); if (this.sc) this.sceneTick(true);
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
    if (this.sc) return; // Foundry keeps the scene in bounds
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
    if (this.sc) { const [mn, mx] = this.zr(); return this.sc.panTo(w, clamp(z, mn, mx), ms); }
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
  zoomAround(sx, sy, nz) { if (this.sc) return; const b = this.toWorld(sx, sy); this.cam.z = nz; this.clampView(); const a = this.toWorld(sx, sy); this.cam.cx += b[0] - a[0]; this.cam.cy += b[1] - a[1]; this.clampView(); this.dirty(); this.persist(); }

  /* ================= interaction ================= */
  bindMap() {
    if (this.sc) return; // pointer input comes from the Foundry board (see scene-layer.js)
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
    if (h) { const it = this.model.item(h.id); const coll = this.model.collOf(h.id); this.showTip(this.tipHtml(it, coll), null, sx, sy); this.el.map.style.cursor = 'pointer'; }
    else { this.hideTip(); this.el.map.style.cursor = ''; }
  }
  clickAt(sx, sy, e) {
    if (this.placing) { this.placeNote(this.toWorld(sx, sy)); return; }
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
    else if (k === 'Escape') { if (this.placing) this.startNote(false); else if (!this.el.finder.hidden) this.closeFinder(); else if (this.editor && this.editor.escape()) {} else if (this.detailId) { this.detailId = null; this.setSel(null); this.render(); } else done = false; }
    else if (/^[1-9]$/.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey) { const r = (this.st.storyteller ? this.model.realmList : this.model.visibleRealms(this.st))[+k - 1]; if (r) this.setRealm(r.id); else done = false; }
    else if (k === '[' || k === ']') { const lv = this.st.storyteller ? this.model.realm(this.st.realm).levels : this.model.visibleLevels(this.st.realm, this.st); const i = lv.findIndex(l => l.id === this.st.level); const n = lv[clamp(i + (k === ']' ? 1 : -1), 0, lv.length - 1)]; if (n) this.setLevel(n.id); }
    else if (k === '+' || k === '=') this.animateTo([this.cam.cx, this.cam.cy], this.cam.z + 1, 200);
    else if (k === '-') this.animateTo([this.cam.cx, this.cam.cy], this.cam.z - 1, 200);
    else if (this.editor && this.editor.key(e)) {}
    else { const L = this.layersShown().find(L => L.hotkey && L.hotkey.toLowerCase() === k.toLowerCase()); if (L && !e.ctrlKey && !e.metaKey) this.setLayer(L.id, !this.layerOn(L.id)); else done = false; }
    if (done) { e.preventDefault(); e.stopPropagation(); }
    else if (k !== 'Escape' && !e.ctrlKey && !e.metaKey) e.stopPropagation();
  }
  showTip(html, anchor, x, y) {
    const t = this.el.tip; t.innerHTML = html; t.hidden = false;
    let px = x, py = y; if (anchor) { const r = anchor.getBoundingClientRect(), m = this.el.map.getBoundingClientRect(); px = r.left - m.left + r.width / 2; py = r.top - m.top; }
    t.classList.toggle('pic', !!t.querySelector('.tipimg'));
    const w = t.offsetWidth; t.style.left = clamp(px - w / 2, 6, this.cam.W - w - 6) + 'px'; t.style.top = Math.max(6, py - t.offsetHeight - 14) + 'px';
  }
  hideTip() { this.el.tip.hidden = true; }
  /** The picture for an entry: its own, its linked Actor's or Scene's, or (places, domains) a known person's there. */
  pictureOf(it, coll) {
    if (!it || this.tierOf(it, coll) < TIER.BASIC) return null;
    const own = it.img || this.docInfo(it.uuid)?.img; if (own) return own;
    const ppl = coll === 'zones' ? (it.owners || []).map(i => this.model.item(i)).filter(Boolean) : coll === 'places' ? this.model.peopleAt(it) : [];
    for (const q of ppl) { if (this.tierOf(q, 'people') < TIER.BASIC) continue; const pic = q.img || this.docInfo(q.uuid)?.img; if (pic) return pic; }
    return null;
  }
  tipHtml(it, coll) {
    const t = this.tierOf(it, coll), pic = this.pictureOf(it, coll);
    const sub = t >= TIER.BASIC ? this.kindLabel(coll, it) : '?';
    return `${pic ? `<img class="tipimg" src="${esc(this.resolveUrl(pic))}" alt="">` : ''}<span class="tiptx">${esc(this.nameOf(it, coll))}<small>${esc(sub)}${this.st.storyteller ? esc(this.revealBadgeText(it, coll)) : ''}</small></span>`;
  }

  /* ================= drawing loop ================= */
  dirty() { if (this.sc) { this.needs = true; return; } if (!this.needs && !this.dead) { this.needs = true; this.raf = requestAnimationFrame(() => this.frame()); } }
  frame() { this.needs = false; if (!this.cam.W || this.dead) return; this.renderer.draw(); this.placeMarkers(); this.drawScale(); }
  /** Scene mode: called by the host on every Foundry frame. Follows the scene camera and redraws when needed. */
  sceneTick(force) {
    if (this.dead || !this.cam.W) return false;
    const c = this.sc.camera(); if (!c || !Number.isFinite(c.cx) || !Number.isFinite(c.cy) || !Number.isFinite(c.z)) { this.sceneOK = false; return false; }
    const moved = c.cx !== this.cam.cx || c.cy !== this.cam.cy || c.z !== this.cam.z;
    if (!moved && !this.needs && !force) return false;
    if (moved) { this.cam.cx = c.cx; this.cam.cy = c.cy; this.cam.z = c.z; this.hideTip(); }
    this.needs = false; this.renderer.draw(); this.placeMarkers(); this.drawScale();
    this.sceneOK = true; this.sceneDraws = (this.sceneDraws || 0) + 1;
    return true;
  }
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
      const tier = this.tierOf(p, 'places'), known = tier >= TIER.BASIC;
      const cat = known ? (this.model.category(p.cat) || {}) : {name: '?'}, color = known ? this.model.colorOf(p) : '#9a9aa4', pin = known ? Object.assign({}, cat.pin || {}, p.pin || {}) : {border: 'dashed'};
      const prec = known && this.model.atlas.precisions[p.precision];
      const veiled = this.isGM && this.st.storyteller && this.model.rawTier(p, 'places', '*') < 1;
      const el = document.createElement('button'); el.type = 'button'; el.className = 'wca-pin' + (pin.anim ? ' anim-' + pin.anim : '') + (veiled ? ' gm' : '') + (known ? '' : ' unknown');
      el.style.setProperty('--c', color);
      if (pin.glow) el.style.setProperty('--g', pin.glow === true ? color : pin.glow);
      const border = pin.border || (prec && prec.border) || 'solid';
      const nm = this.nameOf(p, 'places');
      const photo = known && pin.photo ? this.pictureOf(p, 'places') : null;
      const shape = photo ? 'circle' : (known ? pin.shape : 'circle') || 'circle';
      el.classList.add('s-' + shape);
      el.innerHTML = `<span class="pin${pin.glow ? ' glow' : ''}${photo ? ' photo' : ''}">${pinBody(shape, border, pin.width, pin.bg)}${photo ? `<img class="pphoto" src="${esc(this.resolveUrl(photo))}" alt="">` : svg(known ? this.model.iconOf(p, 'places') : 'unknown', 1.7)}</span><span class="lbl">${esc(nm)}</span>`;
      el.setAttribute('aria-label', `${nm}, ${cat.name || ''}`); el.dataset.id = p.id;
      el.addEventListener('click', e => { e.stopPropagation(); if (this.editor && this.editor.markerClick(p.id, e)) return; this.open(p.id, {fromMap: true}); });
      el.addEventListener('pointerdown', e => { e.stopPropagation(); if (this.editor) this.editor.markerDown(p.id, e); });
      el.addEventListener('pointerenter', () => { this.showTip(this.tipHtml(p, 'places'), el); });
      el.addEventListener('pointerleave', () => this.hideTip());
      O.appendChild(el);
      this.markers.push({p, el, nm, w: this.model.proj.toWorld(p.at), sx: 0, sy: 0, vis: false, canon: !p.precision || p.precision === 'canon'});
    }
    for (const n of this.visibleNotes()) {
      if (!n.at || n.realm !== st.realm || (n.level && n.level !== st.level)) continue;
      const el = document.createElement('button'); el.type = 'button'; el.className = 'wca-pin pnote s-note' + (n.shared ? ' shared' : ' private'); el.dataset.id = 'note:' + n.id;
      el.style.setProperty('--c', n.color || n.authorColor || '#e8d27a');
      el.innerHTML = `<span class="pin">${pinBody('note', 'solid')}${svg(n.icon || 'note', 1.7)}</span><span class="lbl">${esc(n.title || 'Note')}</span>`;
      el.addEventListener('click', e => { e.stopPropagation(); this.openNote(n.id); });
      el.addEventListener('pointerdown', e => e.stopPropagation());
      el.addEventListener('pointerenter', () => this.showTip(`<span class="tiptx">${esc(n.title || 'Note')}<small>${esc(n.mine ? (n.shared ? 'Your note · everyone sees it' : 'Your note · only you') : `${n.authorName || 'Someone'}'s note${n.shared ? '' : ' (private)'}`)}</small></span>`, el));
      el.addEventListener('pointerleave', () => this.hideTip());
      O.appendChild(el);
      this.markers.push({p: {id: 'note:' + n.id}, note: n, el, nm: n.title || 'Note', w: this.model.proj.toWorld(n.at), sx: 0, sy: 0, vis: false, canon: true});
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
      for (const m of vis) { const w = (m.nm || '').length * 6.4 + 6, bx = [m.sx + 17, m.sy - 8, m.sx + 17 + w, m.sy + 8]; const hit = boxes.some(o => !(bx[2] < o[0] || bx[0] > o[2] || bx[3] < o[1] || bx[1] > o[3]) && !(o[0] === m.sx - 14 && o[1] === m.sy - 14)); m.el.classList.toggle('nolbl', hit && m.p.id !== this.sel); if (!hit || m.p.id === this.sel) boxes.push(bx); }
    }
  }
  markMatches() { const q = this.q.trim().toLowerCase(); for (const m of this.markers || []) m.match = !q || !!m.note || this.matches(m.p, q); }
  matches(it, q) { if (!q) return true; if (this.tierOf(it) < TIER.BASIC) return this.nameOf(it).toLowerCase().includes(q); if (this.tierOf(it) < TIER.FULL) return [it.name, it.sub, it.kicker, it.tag, stripHtml(it.brief)].filter(Boolean).join(' ').toLowerCase().includes(q); const cat = this.model.category(it.cat), f = this.model.faction(it.faction); return [it.name, it.sub, it.kicker, it.tag, stripHtml(it.brief), stripHtml(it.html), cat && cat.name, f && f.name, ...(this.model.peopleAt(it).map(p => p.name))].filter(Boolean).join(' ').toLowerCase().includes(q); }

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
    if (String(id).startsWith('note:')) return this.openNote(id.slice(5));
    const ref = this.model.get(id); if (!ref) return;
    const {coll, item: it} = ref;
    if (!this.model.known(it, coll, this.st)) return;
    if (coll === 'pages') { this.tab = 'pages'; this.detailId = null; this.render(); requestAnimationFrame(() => this.el.pane.querySelector(`[data-page="${CSS.escape(id)}"]`)?.scrollIntoView({block: 'start'})); return; }
    if (['places', 'zones', 'routes', 'labels', 'auras'].includes(coll)) {
      const home = this.model.homeOf(it);
      if (home && (home.realm !== this.st.realm || !this.model.inLevel(it, this.st))) { if (home.realm !== this.st.realm) this.setRealm(home.realm, true); if (!this.model.inLevel(it, this.st)) this.setLevel(home.level, true); }
      if (it.layer && !this.layerOn(it.layer)) this.setLayer(it.layer, true);
      if (coll === 'places' && it.cat && this.catsOff.has(it.cat)) { this.catsOff.delete(it.cat); this.buildMarkers(); }
      this.hiddenItems.delete(id);
      this.setSel(id);
      if (!o.noFocus) this.focusItem(it, coll);
    } else if (coll === 'people') {
      // show the first visible place they frequent
      const seeAt = this.tierOf(it, 'people') >= TIER.FULL;
      const first = seeAt ? (it.at || []).map(i => this.model.get(i)).find(r => r && this.model.known(r.item, r.coll, this.st)) : null;
      if (first && !o.noFocus) { const fi = first.item, home = this.model.homeOf(fi);
        if (home) { const keepRealm = this.model.personIn(it, this.st) && (it.at || []).some(i => { const x = this.model.item(i); return x && this.model.inRealm(x, this.st) && this.model.inLevel(x, this.st); });
          if (!keepRealm) { if (home.realm !== this.st.realm) this.setRealm(home.realm, true); if (!this.model.inLevel(fi, this.st)) this.setLevel(home.level, true); }
          const vis = (it.at || []).map(i => this.model.get(i)).find(r => r && this.model.inRealm(r.item, this.st) && this.model.inLevel(r.item, this.st) && this.model.known(r.item, r.coll, this.st));
          if (vis) { if (vis.item.layer && !this.layerOn(vis.item.layer)) this.setLayer(vis.item.layer, true); this.setSel(vis.item.id); this.focusItem(vis.item, vis.coll); } }
      } else this.setSel(null);
    } else return;
    this.detailId = id;
    if (this.editor && this.editor.openItem(id)) return;
    this.renderDetail();
    this.sc?.showHud?.();
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
    if (s.view) { if (this.sc) this.sc.panTo([s.view.cx, s.view.cy], s.view.z, 0); else { this.cam.cx = s.view.cx; this.cam.cy = s.view.cy; this.cam.z = s.view.z; this.clampView(); } }
    if (s.sel && this.model.item(s.sel)) this.open(s.sel, {noFocus: !!s.view}); else { this.detailId = null; this.render(); }
    this.dirty();
    if (s.edit && !this.sc && this.opts.editorFactory) {
      if (!this.editMode) this.toggleEdit(true);
      if (s.editItem && this.model.item(s.editItem)) this.editor?.edit(s.editItem);
      else if (s.newDomain) this.editor?.startDomain(s.newDomain);
    }
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
    const fn = {places: () => this.renderPlaces(), people: () => this.renderPeople(), zones: () => this.renderZones(), pages: () => this.renderPages(), map: () => this.renderMapTab(), notes: () => this.renderNotesTab()}[this.tab] || (() => this.renderPlaces());
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
  /* ----- rows ----- */
  veiled(it, coll) { return this.isGM && this.st.storyteller && this.model.rawTier(it, coll, '*') < 1 && !Object.values((it.reveal && it.reveal.users) || {}).some(v => +v > 0); }
  revealBadgeText(it, coll) { const r = it.reveal || {}; const n = Object.keys(r.users || {}).length; return ` · players: ${this.model.tierName(this.model.rawTier(it, coll, '*'))}${n ? ` (+${n} personal)` : ''}`; }
  refRow(id) {
    const r = this.model.get(id); if (!r) return ''; const it = r.item; if (!this.model.known(it, r.coll, this.st)) return '';
    if (r.coll === 'people') return this.personRow(it);
    const t = this.tierOf(it, r.coll);
    if (t < TIER.BASIC) return this.itemRow({id, c: '#9a9aa4', g: 'unknown', n: this.nameOf(it, r.coll), s: '', dash: true});
    const f = this.model.faction(it.faction), cat = this.model.category(it.cat);
    const realmName = it.realm && it.realm !== this.st.realm ? this.model.realm(it.realm).name : '';
    return this.itemRow({id, c: this.model.colorOf(it), g: this.model.iconOf(it, r.coll), n: it.name, s: it.sub || (cat && cat.name) || '', tag: realmName || (f && f.short) || (this.veiled(it, r.coll) ? 'ST' : ''), dash: it.precision && it.precision !== 'canon', gm: this.veiled(it, r.coll)});
  }
  personRow(p, opts = {}) {
    const t = this.tierOf(p, 'people');
    if (t < TIER.BASIC) return this.itemRow({id: p.id, c: '#9a9aa4', g: 'unknown', n: this.nameOf(p, 'people'), s: '', dash: true});
    const st = p.status && this.model.atlas.statuses[p.status];
    let row = this.itemRow({id: p.id, c: this.model.colorOf(p), g: this.model.iconOf(p, 'people'), n: (st && st.mark ? st.mark + ' ' : '') + p.name, s: p.sub, tag: p.tag || (this.model.faction(p.faction) || {}).short, dead: st && st.fade, gm: this.veiled(p, 'people')});
    if (opts.domainToggle && t >= TIER.FULL) {
      const ds = this.model.domainsOf(p.id).filter(z => this.model.known(z, 'zones', this.st));
      if (ds.length) { const on = ds.some(z => !this.hiddenItems.has(z.id)) && this.layerOn(this.model.domainLayer()); row = `<div class="zrow">${row}<button type="button" class="eye dom" data-dom="${esc(p.id)}" aria-pressed="${on}" title="Show or hide ${esc(p.name)}'s domain">${svg('crown')}</button></div>`; }
    }
    return row;
  }
  pageNotes(tab) {
    return sortBy(Object.values(this.model.atlas.pages).filter(pg => pg.tab === tab && this.model.visible(pg, 'pages', this.st)), p => p.order ?? 0).map(pg => `<div class="wca-pagenote" data-page="${esc(pg.id)}">${pg.html || ''}</div>`).join('');
  }
  /* ----- places ----- */
  placesBody() {
    const q = this.q.trim().toLowerCase(), st = this.st;
    const cats = this.model.categoriesFor(st.realm, st.level);
    const all = Object.values(this.model.atlas.places).filter(p => this.model.visible(p, 'places', st, {ignoreLayer: true}) && this.matches(p, q));
    const unknown = all.filter(p => this.tierOf(p, 'places') < TIER.BASIC), list = all.filter(p => this.tierOf(p, 'places') >= TIER.BASIC);
    const groups = cats.map(c => [c, sortBy(list.filter(p => p.cat === c.id), p => p.order ?? 1e9, 'name')]).filter(([, a]) => a.length);
    const orphans = sortBy(list.filter(p => !cats.some(c => c.id === p.cat)), p => p.order ?? 1e9, 'name');
    if (orphans.length) groups.push([{name: 'Other', id: ''}, orphans]);
    if (!groups.length && !unknown.length) return `<div class="empty">Nothing matches. Clear the search or switch a category back on.</div>`;
    const lv = this.model.realm(st.realm).levels;
    return groups.map(([c, a]) => `<div class="grp">${esc(c.name)} <span class="n">${a.length}</span></div>` + a.map(p => { const f = this.model.faction(p.faction); const v = this.veiled(p, 'places'); return this.itemRow({id: p.id, c: this.model.colorOf(p), g: this.model.iconOf(p, 'places'), n: p.name, s: p.sub, tag: v ? 'ST' : (f && f.short) || (p.level && lv.length > 1 && p.level !== st.level ? (lv.find(l => l.id === p.level) || {}).name : ''), dash: p.precision && p.precision !== 'canon', gm: v}); }).join('')).join('') +
      (unknown.length ? `<div class="grp">Unknown <span class="n">${unknown.length}</span></div>` + unknown.map(p => this.refRow(p.id)).join('') : '');
  }
  renderPlaces() {
    const cats = this.catsShown();
    return this.searchBox(`Search ${this.rv.terms.places.toLowerCase()}…`) +
      (cats.length ? `<div class="chips" role="group" aria-label="Categories">${cats.map(c => `<button type="button" class="chip" data-cat="${esc(c.id)}" aria-pressed="${!this.catsOff.has(c.id)}" style="--c:${esc(c.color || 'var(--wca-bone)')}">${svg(c.icon || 'pin', 1.7)}${esc(c.name)}</button>`).join('')}</div>` : '') +
      `<div class="wca-list">${this.placesBody()}</div>` + this.pageNotes('places');
  }
  /* ----- people ----- */
  peopleBody() {
    const q = this.q.trim().toLowerCase(), st = this.st, S = this.model.atlas.statuses;
    const all = Object.values(this.model.atlas.people).filter(p => this.model.visible(p, 'people', st) && this.matches(p, q));
    const unknown = all.filter(p => this.tierOf(p, 'people') < TIER.BASIC);
    const list = all.filter(p => this.tierOf(p, 'people') >= TIER.BASIC && (this.showFaded || !(S[p.status] && S[p.status].hideable)));
    const grpOf = p => (p.group && p.group[st.realm]) || p.faction || '';
    const keys = [...new Set(list.map(grpOf))].sort((a, b) => this.model.factionOrder(a) - this.model.factionOrder(b));
    if (!keys.length && !unknown.length) return `<div class="empty">No one by that name.</div>`;
    const dt = !!this.model.domainLayer();
    return keys.map(k => { const f = this.model.faction(k) || {name: k || 'Unaffiliated', color: '#bbb'}; const a = sortBy(list.filter(p => grpOf(p) === k), p => p.order ?? 1e9, 'name'); return `<div class="grp" style="color:${esc(f.color)}">${esc(f.name)} <span class="n">${a.length}</span></div>` + a.map(p => this.personRow(p, {domainToggle: dt})).join(''); }).join('') +
      (unknown.length ? `<div class="grp">Unknown <span class="n">${unknown.length}</span></div>` + unknown.map(p => this.personRow(p)).join('') : '');
  }
  renderPeople() {
    const hasHide = Object.values(this.model.atlas.statuses || {}).some(s => s.hideable);
    return this.pageNotes('people') + this.searchBox(`Search ${this.rv.terms.people.toLowerCase()}…`) +
      (hasHide ? `<label class="deadtog"><input type="checkbox" class="wca-faded" ${this.showFaded ? 'checked' : ''}> Show the ${esc(Object.values(this.model.atlas.statuses).find(s => s.hideable).name.toLowerCase())}</label>` : '') +
      `<div class="wca-list">${this.peopleBody()}</div>`;
  }
  /** Show or hide every domain of one person (a per-viewer choice). */
  toggleDomains(pid, on) {
    const ds = this.model.domainsOf(pid);
    for (const z of ds) { if (on) this.hiddenItems.delete(z.id); else this.hiddenItems.add(z.id); }
    const L = this.model.domainLayer();
    if (on && L && !this.layerOn(L)) {
      // the overlay was off: show only this Kindred's domain
      for (const z of Object.values(this.model.atlas.zones)) if (z.layer === L && !(z.owners || []).includes(pid)) this.hiddenItems.add(z.id);
      this.setLayer(L, true);
    }
    this.persist(); this.dirty(); if (this.tab === 'people' && !this.detailId) this.renderListOnly();
  }
  /* ----- zones, routes & glows ----- */
  renderZones() {
    const st = this.st, ls = this.layersShown();
    const zones = Object.values(this.model.atlas.zones).filter(z => !z.decor && this.model.visible(z, 'zones', st, {ignoreLayer: true}));
    const routes = Object.values(this.model.atlas.routes).filter(r => !r.decor && this.model.visible(r, 'routes', st, {ignoreLayer: true}));
    const auras = Object.values(this.model.atlas.auras).filter(a => !a.decor && (a.name || a.rating) && this.model.visible(a, 'auras', st, {ignoreLayer: true}));
    const groups = [];
    const byLayer = (arr, L) => arr.filter(x => (x.layer || '') === (L ? L.id : ''));
    const eye = id => `<button type="button" class="eye" data-hide="${esc(id)}" aria-pressed="${!this.hiddenItems.has(id)}" title="Show or hide on the map">${svg(this.hiddenItems.has(id) ? 'eyeoff' : 'share')}</button>`;
    for (const L of [...ls, null]) {
      const zs = byLayer(zones, L), rs = byLayer(routes, L), as = byLayer(auras, L); if (!zs.length && !rs.length && !as.length) continue;
      const sub = new Map(); for (const z of zs) { const g = this.tierOf(z, 'zones') >= TIER.BASIC ? (z.group || '') : 'Unknown'; if (!sub.has(g)) sub.set(g, []); sub.get(g).push(z); }
      let html = `<div class="grp lay">${esc(L ? L.name : 'Other')} <span class="n">${zs.length + rs.length + as.length}</span>${L ? `<input class="tog" type="checkbox" data-layer="${esc(L.id)}" ${this.layerOn(L.id) ? 'checked' : ''} aria-label="Show ${esc(L.name)}">` : ''}</div>`;
      for (const [g, arr] of sub) {
        if (g) html += `<div class="subgrp">${esc(g)}</div>`;
        const sorted = arr.some(z => z.rating) ? arr.slice().sort((a, b) => (b.rating?.value ?? 0) - (a.rating?.value ?? 0)) : sortBy(arr.slice(), z => z.order ?? 10, 'name');
        html += sorted.map(z => `<div class="zrow">${this.refRow(z.id)}${z.rating && this.tierOf(z, 'zones') >= TIER.FULL ? this.ratingBar(z.rating) : ''}${eye(z.id)}</div>`).join('');
      }
      html += sortBy(rs.slice(), r => r.order ?? 1e9, 'name').map(r => this.refRow(r.id)).join('');
      html += sortBy(as.slice(), a => -(a.rating?.value ?? 0), 'name').map(a => `<div class="zrow">${this.refRow(a.id)}${a.rating && this.tierOf(a, 'auras') >= TIER.FULL ? this.ratingBar(a.rating) : ''}</div>`).join('');
      groups.push(html);
    }
    return (groups.join('') || `<div class="empty">No zones or routes here yet.</div>`) + this.pageNotes('zones');
  }
  ratingBar(r) { const max = Math.min(10, r.max || 5), v = r.value || 0; return `<span class="danger" title="${esc(r.label || '')} ${v}/${max}${r.text ? ' · ' + esc(r.text) : ''}">${Array.from({length: max}, (_, i) => `<i class="${i < v ? 'on' : ''}${r.warn !== false && v >= max - 1 && i < v ? ' red' : ''}"></i>`).join('')}</span>`; }
  /* ----- pages ----- */
  renderPages() {
    const pages = sortBy(Object.values(this.model.atlas.pages).filter(pg => (!pg.tab || pg.tab === 'pages') && this.model.visible(pg, 'pages', this.st)), p => p.order ?? 0);
    if (!pages.length) return `<div class="empty">No chronicle pages for this ${esc(this.rv.name.toLowerCase())} yet.</div>`;
    return pages.map(pg => `<section class="wca-page${this.veiled(pg, 'pages') ? ' gm-only' : ''}" data-page="${esc(pg.id)}"><div class="grp">${esc(pg.title || '')}${this.isGM && this.st.storyteller ? `<button type="button" class="eye" data-reveal-page="${esc(pg.id)}" title="Who can read this page">${svg('share')}</button>` : ''}</div>${pg.html || ''}</section>`).join('');
  }

  /* ----- the Map tab: every switch for the map in one place ----- */
  renderMapTab() {
    const st = this.st, m = this.model, v = this.rv;
    const locked = !this.isGM && !!this.sc?.locked?.();
    const rl = st.storyteller ? m.realmList : m.visibleRealms(st), lv = st.storyteller ? m.realm(st.realm).levels : m.visibleLevels(st.realm, st);
    const ls = this.layersShown();
    const cats = this.catsShown();
    let h = '';
    if (rl.length > 1 || lv.length > 1) {
      h += `<div class="grp">Realm${lv.length > 1 ? ' & level' : ''}</div>`;
      if (locked) h += `<p class="hint">${svg('lock')} The Storyteller chooses the realm on this scene: ${esc(v.name)}${lv.length > 1 ? ' · ' + esc((lv.find(l => l.id === st.level) || {}).name || '') : ''}.</p>`;
      else {
        if (rl.length > 1) h += `<div class="mt-seg">${rl.map(r => `<button type="button" class="chip" data-mt-realm="${esc(r.id)}" aria-pressed="${r.id === st.realm}">${svg(r.icon || 'sun', 1.7)}${esc(r.name)}</button>`).join('')}</div>`;
        if (lv.length > 1) h += `<div class="mt-seg">${lv.map(l => `<button type="button" class="chip" data-mt-level="${esc(l.id)}" aria-pressed="${l.id === st.level}">${esc(l.name || l.id)}</button>`).join('')}</div>`;
      }
    }
    h += `<div class="grp">Layers <span class="n">${ls.length}</span></div>` + (ls.length ? `<div class="mt-list">${ls.map(L => `<label>${L.icon ? svg(L.icon, 1.7) : '<i></i>'}<span>${esc(L.name || L.id)}</span><input class="tog" type="checkbox" data-layer="${esc(L.id)}" ${this.layerOn(L.id) ? 'checked' : ''}></label>`).join('')}</div>` : '<p class="hint">No layers here.</p>');
    if (cats.length) h += `<div class="grp">Places shown</div><div class="chips" role="group">${cats.map(c => `<button type="button" class="chip" data-cat="${esc(c.id)}" aria-pressed="${!this.catsOff.has(c.id)}" style="--c:${esc(c.color || 'var(--wca-bone)')}">${svg(c.icon || 'pin', 1.7)}${esc(c.name)}</button>`).join('')}</div>`;
    if (this.adapter.notes) h += `<div class="grp">Notes</div><div class="mt-list"><label>${svg('note', 1.7)}<span>Notes others share</span><input class="tog" type="checkbox" data-notes="shared" ${this.notesShared ? 'checked' : ''}></label>${this.isGM ? `<label>${svg('eyeoff', 1.7)}<span>Players' private notes</span><input class="tog" type="checkbox" data-notes="private" ${this.notesPrivate ? 'checked' : ''}></label>` : ''}</div><button type="button" class="btn small" data-act="note-new">${svg('note')} Add a note to the map</button>`;
    h += `<div class="grp">View</div><div class="mt-btns"><button type="button" class="btn small" data-act="mt-home">${svg('home')} Whole map</button><button type="button" class="btn small" data-act="mt-find">${svg('search')} Search</button>${this.sc ? `<button type="button" class="btn small" data-act="mt-hide" aria-pressed="${!!this.atlasHidden}">${svg(this.atlasHidden ? 'eyeoff' : 'scene')} ${this.atlasHidden ? 'Show the atlas' : 'Hide the atlas'}</button>` : ''}</div>`;
    if (this.isGM) h += `<div class="grp">Storyteller</div><label class="mt-row">View as<select data-viewas>${this.viewAsOptions().map(([val, n]) => `<option value="${esc(val)}" ${val === (st.storyteller ? 'gm' : st.as) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>` + (this.sc?.setLocked ? `<label class="mt-row">Players follow my realm<input class="tog" type="checkbox" data-mt-lock ${this.sc.locked() ? 'checked' : ''}></label>` : '');
    if (this.legendShown(v).length) h += `<div class="grp">Legend</div><div class="mt-legend">${this.legendShown(v).map(l => `<span><i class="k-${esc(l.kind || 'fill')}" style="--c:${esc(l.color)}"></i>${esc(l.label)}</span>`).join('')}</div>`;
    return `<div class="maptab">${h}</div>`;
  }
  /* ----- notes made by players (and the Storyteller) on the map ----- */
  visibleNotes() {
    const N = this.adapter.notes; if (!N) return [];
    let list = []; try { list = N.list() || []; } catch (e) { return []; }
    return list.filter(n => n.mine || (n.shared ? this.notesShared : (this.isGM && this.notesPrivate)));
  }
  notesChanged() { this.buildMarkers(); if (this.tab === 'notes' && !this.detailId) this.render(true); else if (String(this.detailId || '').startsWith('note:') && !this._noteDraft) this.renderDetail(); }
  startNote(on) {
    this.placing = !!on; this.root.classList.toggle('placing', this.placing); this.layerRoot?.classList.toggle('placing', this.placing);
    this.renderGmButtons();
    if (this.placing) { this.adapter.notify?.('Click on the map where the note goes (Esc to cancel).'); this.sc?.showHud?.(); }
  }
  placeNote(w) {
    this.startNote(false);
    const at = this.model.proj.toLL(w).map(this.model.proj.round);
    const id = Math.random().toString(36).slice(2, 10);
    this._noteDraft = {id, at, realm: this.st.realm, level: this.st.level, title: '', html: '', icon: 'note', shared: false, mine: true, isNew: true};
    this.detailId = 'note:' + id; this.renderNote(id); this.sc?.showHud?.();
  }
  openNote(id) {
    const n = this.visibleNotes().find(x => x.id === id); if (!n) return;
    if (n.realm && n.realm !== this.st.realm) this.setRealm(n.realm, true); if (n.level && n.level !== this.st.level) this.setLevel(n.level, true);
    this._noteDraft = null; this.detailId = 'note:' + id; this.setSel('note:' + id); this.renderNote(id); this.sc?.showHud?.();
  }
  renderNote(id) {
    const n = this._noteDraft && this._noteDraft.id === id ? this._noteDraft : this.visibleNotes().find(x => x.id === id);
    if (!n) { this.detailId = null; return this.renderTab(); }
    const edit = n.mine, icons = ['note', 'pin', 'star', 'eye', 'skull', 'drop', 'crown', 'key', 'swords', 'haven', 'flame', 'raven', 'church', 'glass', 'coin', 'grave'];
    const back = `<div class="detbar"><button type="button" class="back" data-act="back">${svg('back', 2)} Back</button></div>`;
    if (!edit) {
      this.el.pane.innerHTML = `<div class="det" style="--c:${esc(n.color || n.authorColor || '#e8d27a')}">${back}<div class="dsub">Note by ${esc(n.authorName || 'someone')}${n.shared ? '' : ' · private'}</div><h2>${esc(n.title || 'Note')}</h2><div class="body notebody">${esc(n.html || '').replace(/\n/g, '<br>')}</div><button type="button" class="btn" data-act="center">${svg('target')} Centre on map</button>${this.isGM ? `<button type="button" class="btn" data-act="note-del">${svg('trash')} Delete this note</button>` : ''}</div>`;
      return;
    }
    this.el.pane.innerHTML = `<div class="det notef" style="--c:${esc(n.color || '#e8d27a')}">${back}<div class="dsub">${n.isNew ? 'New note' : 'Your note'}</div>
      <form class="ed-form" autocomplete="off"><div class="ef wide"><label>Title</label><input type="text" name="title" value="${esc(n.title || '')}" placeholder="What is here?"></div>
      <div class="ef wide"><label>Text</label><textarea name="html" rows="5" placeholder="Your notes…">${esc(n.html || '')}</textarea></div>
      <div class="ef"><label>Icon</label><select name="icon">${icons.map(i => `<option value="${i}" ${i === (n.icon || 'note') ? 'selected' : ''}>${i}</option>`).join('')}</select></div>
      <div class="ef"><label>Colour</label><input type="color" name="color" value="${esc(n.color || '#e8d27a')}"></div>
      <div class="ef wide notevis"><label><input type="radio" name="shared" value="0" ${n.shared ? '' : 'checked'}> Only me</label><label><input type="radio" name="shared" value="1" ${n.shared ? 'checked' : ''}> Everyone</label></div>
      <div class="ed-actions"><button type="submit" class="btn primary">${svg('check', 2)} Save</button>${n.isNew ? '' : `<button type="button" class="btn" data-act="note-del">${svg('trash')} Delete</button>`}<button type="button" class="btn" data-act="center">${svg('target')}</button></div></form></div>`;
    const form = this.el.pane.querySelector('form');
    form.querySelector('[name=title]').focus();
    form.onsubmit = async e => {
      e.preventDefault(); const f = form.elements;
      const out = {id: n.id, at: n.at, realm: n.realm, level: n.level, title: f.title.value.trim() || 'Note', html: f.html.value, icon: f.icon.value, color: f.color.value, shared: f.shared.value === '1', t: Date.now()};
      try { await this.adapter.notes.save(out); } catch (err) { this.adapter.notify?.('Could not save the note: ' + err.message, 'error'); return; }
      this._noteDraft = null; this.detailId = null; this.tab = 'notes'; this.render(); this.buildMarkers();
    };
  }
  renderNotesTab() {
    const N = this.adapter.notes; if (!N) return '<div class="empty">Notes are not available here.</div>';
    const all = this.visibleNotes(), mine = all.filter(n => n.mine), others = all.filter(n => !n.mine);
    const realmName = n => { const r = this.model.atlas.realms[n.realm]; return r ? r.name : ''; };
    const row = n => this.itemRow({id: 'note:' + n.id, c: n.color || n.authorColor || '#e8d27a', g: n.icon || 'note', n: n.title || 'Note', s: (n.mine ? (n.shared ? 'shared with everyone' : 'only you') : `${n.authorName || ''}${n.shared ? '' : ' · private'}`) + (n.realm !== this.st.realm ? ' · ' + realmName(n) : ''), tag: ''});
    return `<button type="button" class="btn" data-act="note-new">${svg('note')} Add a note to the map</button><p class="hint">Notes are yours: the Storyteller's map stays as it is. Choose “Everyone” to share a note with the group.</p>` +
      `<div class="grp">My notes <span class="n">${mine.length}</span></div>${mine.map(row).join('') || '<div class="empty-s">None yet.</div>'}` +
      `<div class="grp">Shared by others <span class="n">${others.length}</span></div>${others.map(row).join('') || `<div class="empty-s">${this.notesShared ? 'None yet.' : 'Hidden (see the Map tab).'}</div>`}`;
  }

  /* ----- detail ----- */
  renderDetail() {
    if (String(this.detailId || '').startsWith('note:')) return this.renderNote(this.detailId.slice(5));
    const ref = this.model.get(this.detailId); if (!ref) { this.detailId = null; return this.renderTab(); }
    const {coll, item: it} = ref, m = this.model, st = this.st, A = m.atlas;
    if (!m.known(it, coll, st)) { this.detailId = null; return this.renderTab(); }
    const t = this.tierOf(it, coll), known = t >= TIER.BASIC, full = t >= TIER.FULL;
    const color = known ? m.colorOf(it) : '#9a9aa4', f = m.faction(it.faction), cat = m.category(it.cat);
    const H = [];
    H.push(`<div class="detbar"><button type="button" class="back" data-act="back">${svg('back', 2)} Back to ${esc((this.rv.terms[this.tab] || '').toLowerCase())}</button><span class="dbtns">${(this.opts.canEdit ?? this.isGM) && (this.opts.editorFactory || this.sc) ? `<button type="button" class="lnk" data-act="edit-item" title="Edit">${svg('pen')} Edit</button>` : ''}${this.isGM && this.adapter.share ? `<button type="button" class="lnk" data-act="share-item" title="Show this entry to the players">${svg('share')} Show</button>` : ''}</span></div>`);
    if (!known) {
      H.push(`<div class="dsub">Unknown</div><h2>${esc(this.nameOf(it, coll))}</h2><p class="lead unknown-note">${esc(it.aliasText || (coll === 'people' ? 'You have heard of them, but know nothing more.' : 'You know something is here, but nothing more.'))}</p>`);
    } else {
      const pills = [];
      if (f) pills.push(`<span class="pill" style="--c:${esc(f.color)}"><span class="sw"></span>${esc(f.name)}</span>`);
      else if (cat && coll === 'places') pills.push(`<span class="pill" style="--c:${esc(color)}"><span class="sw"></span>${esc(cat.name)}</span>`);
      if (it.precision && A.precisions[it.precision]) { const p = A.precisions[it.precision]; pills.push(`<span class="pill prec" style="border-style:${esc(p.border || 'solid')};color:${esc(p.color || 'inherit')};border-color:${esc(withAlpha(p.color || '#888', 0.55))}">${esc(p.name)}</span>`); }
      if (it.status && A.statuses[it.status]) { const s = A.statuses[it.status]; pills.push(`<span class="pill status s-${esc(it.status)}" ${s.color ? `style="color:${esc(s.color)};border-color:${esc(withAlpha(s.color, .5))}"` : ''}>${esc(s.name)}</span>`); }
      if (it.domainStatus && m.domainStatuses()[it.domainStatus]) { const s = m.domainStatuses()[it.domainStatus]; pills.push(`<span class="pill" style="--c:${esc(s.color || color)}"><span class="sw"></span>${esc(s.name)}</span>`); }
      if (it.rating && full) pills.push(`<span class="pill rating" style="--c:${esc(color)}"><span class="sw"></span>${esc(it.rating.label || 'Rating')} ${it.rating.value}/${it.rating.max || 5}${it.rating.text ? ' · ' + esc(it.rating.text) : ''}</span>`);
      for (const tg of it.tags || []) pills.push(`<span class="pill ${esc(tg.cls || '')}" ${tg.color ? `style="--c:${esc(tg.color === true || tg.color === 'auto' ? color : tg.color)}"` : ''}>${tg.color ? '<span class="sw"></span>' : ''}${esc(tg.text)}</span>`);
      if (this.veiled(it, coll)) pills.push(`<span class="pill st">Hidden from players</span>`);
      const lvl = coll !== 'people' && it.realm && m.atlas.realms[it.realm] ? m.realm(it.realm).levels : null;
      const levelName = lvl && lvl.length > 1 && it.level && it.level !== lvl[0].id ? (lvl.find(l => l.id === it.level) || {}).name : '';
      const kick = [it.kicker || (coll === 'places' && cat ? cat.name : coll === 'auras' ? (it.rating && it.rating.label) || 'Phenomenon' : TYPE_NAMES[coll]), it.kicker ? '' : levelName].filter(Boolean).join(' · ');
      H.push(`<div class="dsub">${esc(kick)}</div><h2>${esc(it.name || '')}</h2>${it.sub ? `<div class="dsub">${esc(it.sub)}</div>` : ''}`);
      H.push(`<div class="meta">${pills.join('')}</div>`);
      const pic = it.img || (coll === 'people' ? this.docInfo(it.uuid)?.img : null);
      if (pic) H.push(`<figure class="portrait${coll === 'people' ? '' : ' wide'}"><img src="${esc(this.resolveUrl(pic))}" alt="${esc(it.name)}" loading="lazy"></figure>`);
      if (coll === 'people') H.push(this.sheetButton(it));
      if (coll === 'auras' && it.rating && full) H.push(`<div class="bigrating"><b>${esc(it.rating.label || 'Rating')}</b><span>${it.rating.value}</span><small>of ${it.rating.max || 10}</small>${this.ratingBar(Object.assign({warn: false}, it.rating))}</div>`);
      const notes = (it.notes || []).filter(n => m.noteVisible(n, it, coll, st));
      const tierTag = n => this.secretTag(n);
      if (full) {
        if (it.facts && it.facts.length && coll === 'people') H.push(`<div class="mien">${it.facts.map(f2 => `<div><b>${esc(f2.k)}</b>${f2.v || ''}</div>`).join('')}</div>`);
        if (it.brief) H.push(`<div class="body brief enrich">${it.brief}</div>`);
        notes.filter(n => n.kind === 'law').forEach(n => H.push(this.noteHtml(n, tierTag(n))));
        if (it.html) H.push(`<div class="body enrich">${it.html}</div>`);
        if (it.facts && it.facts.length && coll !== 'people') { const fs = it.facts.filter(f2 => !(it.tags || []).some(tg => tg.text === `${f2.k} ${stripHtml(f2.v)}`)); if (fs.length) H.push(`<dl class="facts">${fs.map(f2 => `<dt>${esc(f2.k)}</dt><dd>${f2.v || ''}</dd>`).join('')}</dl>`); }
        notes.filter(n => n.kind !== 'law').forEach(n => H.push(this.noteHtml(n, tierTag(n))));
        H.push(this.crossHtml(it, coll));
        if (it.uuid && this.adapter.openUuid && coll !== 'people') { const di = this.docInfo(it.uuid); if (!di || di.canOpen) H.push(`<button type="button" class="cross doc" data-uuid="${esc(it.uuid)}">${svg(di && di.documentName === 'Actor' ? 'sheet' : 'book')}<span><b>${di && di.documentName === 'Actor' ? 'Character sheet' : 'Open linked document'}</b><small>${esc(di ? di.name : (it.uuidName || it.uuid))}</small></span></button>`); }
        const section = (title, ids) => { const rows = [...new Set(ids)].map(i => this.refRow(i)).filter(Boolean); return rows.length ? `<h3>${esc(title)}${rows.length > 3 ? ` · ${rows.length}` : ''}</h3>${rows.join('')}` : ''; };
        if (coll === 'places') {
          const zs = m.containingZones(it, st).filter(z => z.id !== it.zone); if (it.zone) zs.unshift(m.item(it.zone));
          H.push(section('Lies within', zs.filter(Boolean).map(z => z.id)));
          H.push(section('Routes', [...m.routesAt(it.id), ...m.routesNear(it, st)].map(r => r.id)));
          H.push(section('Close by', m.nearby(it, st, A.closeBy || 250).slice(0, 8).map(p => p.id)));
          H.push(section('Figures here', m.peopleAt(it).map(p => p.id)));
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
          H.push(this.domainHtml(it));
          H.push(this.relationsHtml(it));
        }
        if (it.links && it.links.length) H.push(section('See also', it.links.map(l => l.id).filter(i => !(it.anchor === i))));
      } else {
        if (it.brief) H.push(`<div class="body brief enrich">${it.brief}</div>`);
        notes.filter(n => m.isSecret(n)).forEach(n => H.push(this.noteHtml(n, tierTag(n))));
        // with Basic knowledge only links to entries the viewer also knows at Basic: a rumour does not tie two things together
        const section = (title, ids) => { const rows = [...new Set(ids)].filter(i => { const r = m.get(i); return r && this.tierOf(r.item, r.coll) >= TIER.BASIC; }).map(i => this.refRow(i)).filter(Boolean); return rows.length ? `<h3>${esc(title)}</h3>${rows.join('')}` : ''; };
        if (coll === 'people') H.push(section('Where to find them', it.at || []));
        else if (coll === 'places') H.push(section('Figures here', m.peopleAt(it).map(p => p.id)));
        H.push(`<p class="lead unknown-note">${it.brief ? 'That is all you know for now.' : 'Nothing more is known yet.'}</p>`);
      }
    }
    if (!known) (it.notes || []).filter(n => m.isSecret(n) && m.noteVisible(n, it, coll, st)).forEach(n => H.push(this.noteHtml(n, this.secretTag(n))));
    if (coll !== 'people' && coll !== 'pages') H.push(`<button type="button" class="btn" data-act="center">${svg('target')} Centre on map</button>`);
    if (this.isGM && st.storyteller) H.push(this.revealPanel(it, coll));
    if (it.src && full) H.push(`<div class="src">${/^(Improvised|From the|Domains)/.test(it.src) ? '' : 'Source: '}${it.src}</div>`);
    this.el.pane.innerHTML = `<div class="det" style="--c:${esc(color)}">${H.join('')}</div>`;
    this.el.pane.scrollTop = 0;
    this.enrichIn(this.el.pane);
    this.root.classList.remove('side-min');
  }
  /* ----- Foundry Actors ----- */
  docInfo(uuid) { if (!uuid || !this.adapter.docInfo) return null; try { return this.adapter.docInfo(uuid); } catch (e) { return null; } }
  /** "Character sheet" button for a person linked to an Actor the viewer may open. */
  sheetButton(p) {
    const di = this.docInfo(p.uuid);
    if (!di) return p.uuid && this.isGM && this.st.storyteller && this.adapter.docInfo ? `<p class="hint">The linked Actor no longer exists.</p>` : '';
    if (!di.canOpen) return '';
    return `<button type="button" class="cross doc" data-uuid="${esc(p.uuid)}">${svg('sheet')}<span><b>${di.documentName === 'Actor' ? 'Character sheet' : 'Open linked document'}</b><small>${esc(di.name)}${this.isGM && this.st.storyteller && di.documentName === 'Actor' ? ` · ${di.owners ? esc(di.owners) : 'GM only'}` : ''}</small></span></button>`;
  }
  /** A person found by a short name ("Scott", "Gracis") in relation rows; only unambiguous matches. */
  personByName(name) {
    const q = String(name || '').trim().toLowerCase(); if (!q) return null;
    if (!this._nameIdx) {
      const exact = new Map(), word = new Map();
      for (const p of Object.values(this.model.atlas.people)) {
        const n = (p.name || '').toLowerCase(); if (!n) continue;
        if (!exact.has(n)) exact.set(n, p.id); else exact.set(n, null);
        for (const w of new Set(n.replace(/[“”"()«»,]/g, ' ').split(/\s+/).filter(x => x.length > 2 && !['the', 'sir', 'von', 'van', 'lady', 'lord', 'mr.', 'mrs.', 'dr.'].includes(x)))) word.set(w, word.has(w) ? null : p.id);
      }
      this._nameIdx = {exact, word};
    }
    const id = this._nameIdx.exact.get(q) ?? this._nameIdx.word.get(q);
    return id ? this.model.item(id) : null;
  }
  /** "Secret" tag on callouts and relations; the Storyteller also sees who knows it. */
  secretTag(n) { if (n && n.st) return 'Storyteller only'; if (!this.model.isSecret(n)) return ''; return this.isGM && this.st.storyteller ? `Secret · known to ${this.model.secretAudience(n, this.players())}` : 'Secret'; }
  /** Relations: this person's view of others, others' view of them, and (Storyteller) inline editing. */
  relationsHtml(p) {
    const m = this.model, st = this.st, gm = this.isGM && st.storyteller && (this.opts.canEdit ?? this.isGM);
    const own = m.relRows(p).filter(r => m.noteVisible(r, p, 'people', st));
    const theirs = [];
    for (const q of Object.values(m.atlas.people)) {
      if (q.id === p.id || !m.known(q, 'people', st)) continue;
      for (const r of m.relRows(q)) { const tid = r.ref && !/^Actor\./.test(r.ref) ? r.ref : this.personByName(r.a)?.id; if (tid === p.id && m.noteVisible(r, q, 'people', st)) theirs.push({q, r}); }
    }
    if (!own.length && !theirs.length && !gm) return '';
    let h = `<h3>${esc(p.relations?.title || 'Relations')}</h3>`;
    h += own.length ? `<div class="rel">${own.map(r => this.relationRow(r, p, gm)).join('')}</div>` : (gm ? '<p class="hint">No relations yet.</p>' : '');
    if (gm) {
      const ppl = sortBy(Object.values(m.atlas.people).filter(q => q.id !== p.id), q => q.name || '');
      h += `<div class="reladd" data-person="${esc(p.id)}"><select data-rel="ref"><option value="">Who…</option>${ppl.map(q => `<option value="${esc(q.id)}">${esc(q.name || q.id)}</option>`).join('')}</select><input data-rel="b" type="text" placeholder="Attitude (e.g. Hatred, Ally)"><label title="Hidden from players until you reveal it"><input data-rel="secret" type="checkbox"> Secret</label><button type="button" class="mini" data-act="rel-add">${svg('plus', 2)} Add</button></div>`;
    }
    if (theirs.length) h += `<h3>How others see them</h3><div class="rel">${theirs.map(({q, r}) => `<span><button type="button" class="rlink" data-go="${esc(q.id)}">${esc(this.nameOf(q, 'people'))}</button></span><span>${esc(r.b || '')}${m.isSecret(r) ? `<span class="tiertag">${esc(this.secretTag(r))}</span>` : ''}</span>`).join('')}</div>`;
    return h;
  }
  async addRelation(pid, ref, b, secret) {
    const p = this.store.atlas.people[pid]; if (!p || !ref) return;
    const d = JSON.parse(JSON.stringify(p)); const t = this.model.item(ref);
    const rows = this.model.relRows(d).map(({i, ...r}) => r);
    rows.push(Object.assign({a: (t && t.name) || '', b: b || '', ref}, secret ? {secret: true, reveal: {all: 0}} : {}));
    d.relations = Object.assign({}, d.relations || {}, {rows}); await this.store.setItem('people', pid, d);
  }
  async removeRelation(pid, idx) {
    const p = this.store.atlas.people[pid]; if (!p) return;
    const d = JSON.parse(JSON.stringify(p)); const rows = this.model.relRows(d).map(({i, ...r}) => r); rows.splice(idx, 1);
    if (rows.length) d.relations.rows = rows; else if (d.relations) { delete d.relations.rows; if (!Object.keys(d.relations).length) delete d.relations; }
    await this.store.setItem('people', pid, d);
  }
  relationRow(r, owner, gm) {
    const [w, a, ref] = Array.isArray(r) ? r : [r.a, r.b, r.ref];
    let target = null, actor = null;
    if (ref && /^Actor\./.test(ref)) actor = ref; else if (ref) target = this.model.item(ref); else target = this.personByName(w);
    if (target && (target.id === owner.id || !this.model.known(target, 'people', this.st))) target = null;
    if (target && target.uuid) actor = target.uuid;
    const ai = actor ? this.docInfo(actor) : null;
    const nm = target ? `<button type="button" class="rlink" data-go="${esc(target.id)}" title="Open ${esc(this.nameOf(target, 'people'))}">${esc(w || this.nameOf(target, 'people'))}</button>` : esc(w);
    const sheet = ai && ai.canOpen ? `<button type="button" class="rsheet" data-uuid="${esc(actor)}" title="Character sheet: ${esc(ai.name)}">${svg('sheet')}</button>` : '';
    const tag = !Array.isArray(r) && this.model.isSecret(r) ? `<span class="tiertag">${esc(this.secretTag(r))}</span>` : '';
    const del = gm && !Array.isArray(r) ? `<button type="button" class="rdel" data-act="rel-del" data-person="${esc(owner.id)}" data-idx="${r.i}" title="Remove this relation">${svg('x', 2)}</button>` : '';
    return `<span>${nm}${sheet}</span><span>${esc(a)}${tag}${del}</span>`;
  }
  noteHtml(n, tierTag) { return `<div class="scene${n.kind ? ' ' + esc(n.kind) : ''}${this.model.isSecret(n) ? ' secret' : ''}${n.st ? ' stnote' : ''}">${n.title || tierTag ? `<b>${esc(n.title || '')}${tierTag ? `<span class="tiertag">${esc(tierTag)}</span>` : ''}</b>` : ''}<div class="enrich">${n.html || ''}</div></div>`; }
  domainHtml(p) {
    const m = this.model, L = m.domainLayer();
    const ds = m.domainsOf(p.id).filter(z => m.known(z, 'zones', this.st));
    const gmEdit = this.isGM && this.st.storyteller && (this.opts.editorFactory || this.sc) && L;
    if (!ds.length && !gmEdit) return '';
    return `<h3>Domain</h3>` + ds.map(z => `<div class="zrow">${this.refRow(z.id)}<button type="button" class="eye" data-hide="${esc(z.id)}" aria-pressed="${!this.hiddenItems.has(z.id)}" title="Show or hide this domain on the map">${svg(this.hiddenItems.has(z.id) ? 'eyeoff' : 'share')}</button>${gmEdit ? `<button type="button" class="eye" data-act="edit-domain" data-zone="${esc(z.id)}" title="Edit the shape and details">${svg('pen')}</button>` : ''}</div>`).join('') +
      (gmEdit ? `<button type="button" class="btn small" data-act="new-domain" data-person="${esc(p.id)}">${svg('poly')} ${ds.length ? 'Draw another domain' : 'Draw a domain'}</button>` : '');
  }
  /** Storyteller panel: who sees this entry, and how much. */
  revealPanel(it, coll) {
    const m = this.model, tiers = m.tiers(), r = it.reveal || {}, ps = this.players();
    const opt = (sel, includeInherit) => (includeInherit ? `<option value="" ${sel === '' ? 'selected' : ''}>as everyone</option>` : '') + tiers.map((n, i) => `<option value="${i}" ${String(sel) === String(i) ? 'selected' : ''}>${i} · ${esc(n)}</option>`).join('');
    const allVal = r.all ?? (it.gm ? 0 : '');
    const def = m.defaultTier(coll);
    return `<div class="reveal" data-reveal-id="${esc(it.id)}" data-reveal-coll="${esc(coll)}"><h3>${svg('share')} What players see</h3>
      <label><span>Everyone</span><select data-rv="*"><option value="" ${allVal === '' ? 'selected' : ''}>default (${esc(m.tierName(def))})</option>${opt(allVal, false)}</select></label>
      ${ps.map(p => `<label><span style="color:${esc(p.color || 'inherit')}">${esc(p.name)}</span><select data-rv="${esc(p.id)}">${opt((r.users || {})[p.id] ?? '', true)}</select></label>`).join('') || '<p class="hint">No player accounts yet.</p>'}
      <div class="rv-quick"><button type="button" class="mini" data-rvq="0">Hide from all</button><button type="button" class="mini" data-rvq="1">Existence</button><button type="button" class="mini" data-rvq="2">Basic</button><button type="button" class="mini" data-rvq="3">Full</button></div>
      <p class="hint">0 hidden · 1 only that it exists · 2 name &amp; picture · 3 full description and ordinary callouts. Secrets below are revealed one by one.</p>${this.secretsPanel(it, coll)}</div>`;
  }
  /** Storyteller: reveal each secret (callout or relation) to everyone or to particular players. */
  secretsPanel(it, coll) {
    const m = this.model, ps = this.players(), list = [];
    (it.notes || []).forEach((n, i) => { if (m.isSecret(n)) list.push({key: `notes:${i}`, n, label: n.title || stripHtml(n.html || '').slice(0, 60) || 'Callout'}); });
    if (coll === 'people') m.relRows(it).forEach(r => { if (m.isSecret(r)) list.push({key: `rel:${r.i}`, n: r, label: `Relation: ${r.a || '?'} — ${r.b || ''}`}); });
    if (!list.length) return '';
    const known = (n, who) => { const rv = n.reveal || {}; if (who === '*') return rv.all != null && rv.all !== '' ? String(+rv.all) : (n.secret === undefined ? '' : '0'); const u = (rv.users || {})[who]; return u == null || u === '' ? '' : String(+u); };
    return `<h3>${svg('eye')} Secrets</h3>` + list.map(({key, n, label}) => `<div class="secrow" data-sec="${esc(key)}"><b>${esc(label)}</b>
      <label><span>Everyone</span><select data-sw="*"><option value="0" ${known(n, '*') !== '1' ? 'selected' : ''}>hidden</option><option value="1" ${known(n, '*') === '1' ? 'selected' : ''}>revealed to all</option></select></label>
      ${ps.map(p => `<label><span style="color:${esc(p.color || 'inherit')}">${esc(p.name)}</span><select data-sw="${esc(p.id)}"><option value="" ${known(n, p.id) === '' ? 'selected' : ''}>as everyone</option><option value="1" ${known(n, p.id) === '1' ? 'selected' : ''}>knows it</option><option value="0" ${known(n, p.id) === '0' ? 'selected' : ''}>doesn't know</option></select></label>`).join('')}</div>`).join('');
  }
  async setSecret(id, key, who, val) {
    const r = this.model.get(id); if (!r) return;
    const it = JSON.parse(JSON.stringify(this.store.atlas[r.coll][id]));
    const [kind, idxs] = key.split(':'), idx = +idxs; let n;
    if (kind === 'notes') n = (it.notes || [])[idx];
    else { const rows = this.model.relRows(it).map(({i, ...x}) => x); it.relations.rows = rows; n = rows[idx]; }
    if (!n) return;
    n.secret = true; delete n.tier; delete n.gm; const rv = n.reveal || {}; rv.users ||= {};
    if (who === '*') rv.all = +val || 0; else if (val === '' || val == null) delete rv.users[who]; else rv.users[who] = +val;
    if (!Object.keys(rv.users).length) delete rv.users; n.reveal = rv;
    await this.store.setItem(r.coll, id, it);
    if (+val === 1) this.adapter.notifyReveal?.({ids: who === '*' ? null : [who], name: `${it.name || it.title || ''}: ${n.title || n.a || 'a secret'}`});
  }
  async setReveal(id, who, val) {
    const r = this.model.get(id); if (!r) return;
    const it = JSON.parse(JSON.stringify(this.store.atlas[r.coll][id]));
    const rv = it.reveal || {}; rv.users ||= {};
    if (who === '*') { if (val === '' || val == null) delete rv.all; else rv.all = +val; if (it.gm && val !== '') delete it.gm; }
    else { if (val === '' || val == null) delete rv.users[who]; else rv.users[who] = +val; }
    if (!Object.keys(rv.users).length) delete rv.users;
    if (Object.keys(rv).length) it.reveal = rv; else delete it.reveal;
    await this.store.setItem(r.coll, id, it);
    if (val !== '' && +val > 0) this.adapter.notifyReveal?.({ids: who === '*' ? null : [who], name: it.name || it.title || ''});
  }
  crossHtml(it, coll) {
    const m = this.model, out = [], seen = new Set();
    const ok = t => t && m.known(t, m.collOf(t.id), this.st);
    const btn = (target, label, icon, names) => { if (!target) return; out.push(`<button type="button" class="cross" data-go="${esc(target)}">${svg(icon || 'gate')}<span><b>${esc(label)}</b><small>${esc(names)}</small></span></button>`); };
    const viewOf = t => { const h = m.homeOf(t); return h ? m.view(h.realm, h.level) : null; };
    if (it.anchor) { const a = m.item(it.anchor); if (ok(a)) { const v = viewOf(a); seen.add(a.id); btn(a.id, v ? (v.crossLabel || `Go to ${v.name}`) : 'Go to anchor', v && v.crossIcon, this.nameOf(a)); } }
    const twins = (m.anchoredBy.get(it.id) || []).map(i => m.item(i)).filter(t => ok(t) && !seen.has(t.id));
    const groups = new Map();
    for (const t of twins) { const h = m.homeOf(t); if (!h) continue; if (h.realm === this.st.realm && m.inLevel(t, this.st)) continue; const k = h.realm + ':' + h.level; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(t); }
    for (const [k, arr] of groups) { const [r, l] = k.split(':'); const v = m.view(r, l); btn(arr[0].id, v.crossLabel || `Go to ${v.name}`, v.crossIcon, arr.map(t => this.nameOf(t)).join(' · ')); arr.forEach(t => seen.add(t.id)); }
    for (const l of it.links || []) { const t = m.item(l.id); if (!ok(t) || seen.has(t.id)) continue; const h = m.homeOf(t); if (!h || (h.realm === this.st.realm && m.inLevel(t, this.st))) continue; const v = m.view(h.realm, h.level); seen.add(t.id); btn(t.id, l.label || v.crossLabel || `Go to ${v.name}`, v.crossIcon, this.nameOf(t)); }
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
    if (t.closest('.reveal select')) return;
    const rq = t.closest('[data-rvq]'); if (rq) { const p = rq.closest('.reveal'); this.setReveal(p.dataset.revealId, '*', rq.dataset.rvq).then(() => this.renderDetail()); return; }
    const lay = t.closest('input[data-layer]'); if (lay) { this.setLayer(lay.dataset.layer, lay.checked); return; }
    const dom = t.closest('[data-dom]'); if (dom) { const on = dom.getAttribute('aria-pressed') !== 'true'; this.toggleDomains(dom.dataset.dom, on); dom.setAttribute('aria-pressed', String(on)); return; }
    const hide = t.closest('[data-hide]'); if (hide) { const id = hide.dataset.hide; if (this.hiddenItems.has(id)) this.hiddenItems.delete(id); else { this.hiddenItems.add(id); } const z = this.model.item(id); if (!this.hiddenItems.has(id) && z && z.layer && !this.layerOn(z.layer)) this.setLayer(z.layer, true); this.persist(); this.dirty(); hide.setAttribute('aria-pressed', String(!this.hiddenItems.has(id))); hide.innerHTML = svg(this.hiddenItems.has(id) ? 'eyeoff' : 'share'); return; }
    const rp = t.closest('[data-reveal-page]'); if (rp) { this.detailId = rp.dataset.revealPage; this.renderDetail(); return; }
    const act0 = t.closest('[data-act]');
    if (act0 && act0.dataset.act === 'note-new') { this.startNote(true); return; }
    if (act0 && act0.dataset.act === 'note-del') { const id = String(this.detailId || '').slice(5); const n = this.visibleNotes().find(x => x.id === id); if (n) Promise.resolve(this.adapter.confirm ? this.adapter.confirm('Delete note', `Delete “${n.title || 'Note'}”?`) : true).then(ok => { if (ok) this.adapter.notes.remove(n).then(() => { this.detailId = null; this.render(); this.buildMarkers(); }); }); return; }
    if (act0 && act0.dataset.act === 'mt-home') { this.home(); return; }
    if (act0 && act0.dataset.act === 'mt-find') { this.openFinder(); return; }
    if (act0 && act0.dataset.act === 'mt-hide') { this.setAtlasHidden(!this.atlasHidden); return; }
    const mr = t.closest('[data-mt-realm]'); if (mr) { this.setRealm(mr.dataset.mtRealm, true); this.applyView(); this.render(true); this.focusRealm(); return; }
    const ml = t.closest('[data-mt-level]'); if (ml) { this.setLevel(ml.dataset.mtLevel, true); this.render(true); return; }
    const nt = t.closest('input[data-notes]'); if (nt) { if (nt.dataset.notes === 'shared') this.notesShared = nt.checked; else this.notesPrivate = nt.checked; this.persist(); this.buildMarkers(); return; }
    const lk = t.closest('input[data-mt-lock]'); if (lk) { this.sc?.setLocked?.(lk.checked); return; }
    if (act0 && act0.dataset.act === 'rel-add') { const box = act0.closest('.reladd'); const ref = box.querySelector('[data-rel="ref"]').value; if (!ref) return; this.addRelation(box.dataset.person, ref, box.querySelector('[data-rel="b"]').value.trim(), box.querySelector('[data-rel="secret"]').checked); return; }
    if (act0 && act0.dataset.act === 'rel-del') { this.removeRelation(act0.dataset.person, +act0.dataset.idx); return; }
    if (act0 && act0.dataset.act === 'new-domain') { if (this.sc) return this.toggleEdit(true, {newDomain: act0.dataset.person}); if (!this.editMode) this.toggleEdit(true); this.editor?.startDomain(act0.dataset.person); return; }
    if (act0 && act0.dataset.act === 'edit-domain') { if (this.sc) return this.toggleEdit(true, {editItem: act0.dataset.zone}); if (!this.editMode) this.toggleEdit(true); this.editor?.edit(act0.dataset.zone); return; }
    const go = t.closest('[data-go]'); if (go) { this.open(go.dataset.go); return; }
    const link = t.closest('[data-link]'); if (link) { this.open(link.dataset.link); return; }
    const uu = t.closest('[data-uuid]'); if (uu) { this.adapter.openUuid?.(uu.dataset.uuid); return; }
    const act = act0; if (!act) return;
    const a = act.dataset.act, it = this.model.item(this.detailId);
    if (a === 'back') { this.detailId = null; this._noteDraft = null; this.setSel(null); this.render(); }
    else if (a === 'center' && String(this.detailId || '').startsWith('note:')) { const id = this.detailId.slice(5); const n = (this._noteDraft && this._noteDraft.id === id) ? this._noteDraft : this.visibleNotes().find(x => x.id === id); if (n) this.focusAt(n.at); }
    else if (a === 'center' && it) this.focusItem(it, this.model.collOf(it.id));
    else if (a === 'edit-item' && it) { if (this.sc) return this.toggleEdit(true, {editItem: it.id}); if (!this.editMode) this.toggleEdit(true); this.editor?.edit(it.id); }
    else if (a === 'share-item' && it) this.adapter.share?.(this.getState());
  }

  /* ================= finder ================= */
  openFinder() { this.el.finder.hidden = false; this.el.fq.value = ''; this.runFinder(); setTimeout(() => this.el.fq.focus(), 20); }
  closeFinder() { this.el.finder.hidden = true; this.root.focus({preventScroll: true}); }
  runFinder() {
    const q = this.el.fq.value.trim().toLowerCase(), m = this.model;
    if (!q) { this.el.fres.innerHTML = `<div class="fhint">Type to search every realm and level: places, zones, routes and people.</div>`; return; }
    const words = q.split(/\s+/);
    const hits = m.searchIndex().filter(h => m.known(h.it, h.coll, this.st)).map(h => { const t = this.tierOf(h.it, h.coll); const name = this.nameOf(h.it, h.coll); const text = t >= TIER.FULL ? h.text : t >= TIER.BASIC ? [h.it.name, h.it.sub, h.it.kicker, h.it.tag, stripHtml(h.it.brief)].filter(Boolean).join(' ').toLowerCase() : name.toLowerCase(); return {h, name, text}; })
      .filter(x => words.every(w => x.text.includes(w)))
      .map(x => Object.assign(x, {score: (x.name.toLowerCase().startsWith(q) ? 3 : 0) + (x.name.toLowerCase().includes(q) ? 2 : 0) + (x.h.it.realm === this.st.realm ? 0.5 : 0)}))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, 40);
    this.el.fres.innerHTML = hits.length ? hits.map(({h, name}) => { const it = h.it; const known = this.tierOf(it, h.coll) >= TIER.BASIC; const rr = it.realm && m.atlas.realms[Array.isArray(it.realm) ? it.realm[0] : it.realm]; const realm = h.coll === 'people' ? 'Person' : rr ? (rr.name + (it.level && rr.levels.length > 1 && it.level !== rr.levels[0].id ? ' · ' + ((rr.levels.find(l => l.id === it.level) || {}).name || '') : '')) : TYPE_NAMES[h.coll];
      return `<button type="button" class="fitem" data-id="${esc(it.id)}"><span class="fl" style="--c:${esc(known ? m.colorOf(it) : '#9a9aa4')}">${esc(realm)}</span><span class="fn">${esc(name)}<small>${esc(known ? (it.sub || this.kindLabel(h.coll, it)) : '?')}</small></span></button>`; }).join('') : `<div class="fhint">Nothing found.</div>`;
  }
}
