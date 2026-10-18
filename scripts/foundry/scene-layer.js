/* The live atlas on a Foundry scene.
 *
 * A scene flagged `flags.wod-city-atlas.atlas = {entry, bb, realm, level, lock}` *is* an atlas. Foundry shows the
 * scene picture (the plain map of the scene's realm) as usual; on top of it every client draws, in an HTML layer
 * between the board and Foundry's interface, what *its* user may see: zones, routes, glows, labels and pins. Where
 * the layer draws nothing it is transparent, so tokens show through. When a user looks at another realm or level
 * than the scene picture, the layer draws that realm's whole map.
 *
 * Nothing here touches Foundry's PIXI scene graph: the layer only reads the stage transform, so it cannot break
 * Foundry's own drawing of this or any other scene.
 */
import {AtlasView} from '../core/view.js';
import {esc} from '../core/util.js';
import {JournalStore, MOD} from './journal-store.js';
import {makeAdapter, resolveUrl, AtlasApp, resetUiTheme} from './app.js';

const {ApplicationV2} = foundry.applications.api;
const HUD_KEY = 'wod-city-atlas:hud';
const loadHud = () => { try { return JSON.parse(localStorage.getItem(HUD_KEY) || '{}'); } catch (e) { return {}; } };
const saveHud = o => { try { localStorage.setItem(HUD_KEY, JSON.stringify(Object.assign(loadHud(), o))); } catch (e) {} };

/** The dossier window shown next to an atlas scene. */
class AtlasHud extends ApplicationV2 {
  static DEFAULT_OPTIONS = {id: 'wca-scene-hud', classes: ['wca-app', 'wca-hud-app'], window: {title: 'City Atlas', icon: 'fa-solid fa-map-location-dot', resizable: true, minimizable: true}, position: {width: 400, height: 720}};
  constructor(host, options = {}) {
    const p = loadHud().pos || {};
    const h = Math.min(p.height || 720, window.innerHeight - 120), w = Math.min(p.width || 400, window.innerWidth - 400);
    super(foundry.utils.mergeObject({position: {width: Math.max(320, w), height: Math.max(360, h), left: p.left ?? 110, top: p.top ?? 70}}, options));
    this.host = host;
  }
  get title() { return this.host.entry?.name || 'City Atlas'; }
  async _renderHTML() { return null; }
  _replaceHTML(result, content) { if (this.host.root.parentElement !== content) { content.innerHTML = ''; content.appendChild(this.host.root); } }
  _onRender() { try { this.host.view?.resize(); } catch (e) {} }
  _onClose(options) { super._onClose?.(options); try { const {left, top, width, height} = this.position || {}; saveHud({pos: {left, top, width, height}}); } catch (e) {} if (!this.host.dead) saveHud({open: false}); }
}

export class SceneAtlas {
  static current = null;

  /** Mount, refresh or remove the live atlas for the scene on the canvas. */
  static async sync() {
    const scene = canvas?.ready ? canvas.scene : null; const f = scene?.getFlag(MOD, 'atlas');
    const cur = this.current;
    if (cur && (cur.dead || !f || cur.scene !== scene || cur.entry.id !== f.entry)) { cur.destroy(); this.current = null; }
    if (!f) return null;
    if (this.current) { this.current.flagChanged(f); return this.current; }
    const entry = game.journal.get(f.entry);
    if (!entry) { if (game.user.isGM) ui.notifications.warn(`City Atlas: the atlas behind the scene “${scene.name}” no longer exists.`); return null; }
    if (!entry.testUserPermission(game.user, 'LIMITED')) return null; // this player only sees the plain map picture
    const sa = new SceneAtlas(scene, entry); this.current = sa;
    try { await sa.mount(); } catch (err) { console.error(`${MOD} | could not draw the atlas on the scene`, err); sa.destroy(); if (this.current === sa) this.current = null; ui.notifications.error(`City Atlas: could not draw the atlas on this scene (${err.message}).`); }
    return this.current;
  }
  static teardown() { this.current?.destroy(); this.current = null; resetUiTheme(); }

  constructor(scene, entry) { this.scene = scene; this.entry = entry; }
  flag() { return this.scene.getFlag(MOD, 'atlas') || {}; }
  get bb() { return this.flag().bb; }

  async mount() {
    const f = this.flag(); this._flag = f;
    if (!Array.isArray(f.bb) || f.bb.length !== 4) throw new Error('the scene has no atlas area');
    this.store = JournalStore.acquire(this.entry);
    await this.store.loadBasemap(resolveUrl);
    if (this.dead) return;
    // the drawing layer sits right after the board: above the scene, below Foundry's interface
    this.board = findBoard();
    document.getElementById('wca-scene-layer')?.remove();
    const L = document.createElement('div'); L.id = 'wca-scene-layer'; this.layer = L;
    if (this.board && this.board.isConnected) this.board.insertAdjacentElement('afterend', L); else document.body.appendChild(L);
    this.placeLayer();
    this._onWin = () => this.placeLayer(); window.addEventListener('resize', this._onWin);
    this.root = document.createElement('div');
    const adapter = makeAdapter(this);
    adapter.openFull = game.user.isGM || game.settings.get(MOD, 'playerWindow') ? state => AtlasApp.open(this.entry, {state}) : null;
    this.view = new AtlasView(this.root, {
      store: this.store, isGM: game.user.isGM, canEdit: this.entry.isOwner, viewer: {id: game.user.id, name: game.user.name},
      atlasKey: `${game.world.id}:${this.entry.id}:scene:${this.scene.id}`, animate: game.settings.get(MOD, 'animate'), adapter, editorFactory: null,
      scene: this.hostApi(), initial: {realm: f.realm, level: f.level}
    });
    if (f.lock && !game.user.isGM) this.followFlag(f);
    // Foundry content links inside the dossier
    this.root.addEventListener('click', async e => { const a = e.target.closest('a.content-link[data-uuid]'); if (!a) return; e.preventDefault(); e.stopPropagation(); const d = await fromUuid(a.dataset.uuid); if (d?.documentName === 'Scene') d.view(); else d?.sheet?.render(true); });
    this._unsubBm = this.store.onChange(async info => { if ((info.all || info.meta) && this.store.atlas.basemap !== this._bm) { this._bm = this.store.atlas.basemap; await this.store.loadBasemap(resolveUrl); this.view?.onStoreChange({basemap: true}); } });
    this._bm = this.store.atlas.basemap;
    this.bindBoard();
    this.startLoop();
    this.hud = new AtlasHud(this);
    if (loadHud().open !== false) this.hud.render({force: true});
    console.log(`${MOD} | atlas “${this.entry.name}” mounted on scene “${this.scene.name}”`);
    this._check = setTimeout(() => this.selfCheck(), 3000);
  }
  /** Everything useful for finding out why a scene shows nothing. */
  diagnose() {
    const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
    const st = canvas.stage, d = canvas.dimensions, v = this.view;
    let cam = null; try { cam = this.camera(); } catch (e) { cam = 'error: ' + e.message; }
    const cv = v?.el?.canvas;
    return {version: game.modules.get(MOD)?.version, foundry: game.version, system: game.system?.id, scene: this.scene?.name, board: this.board ? `${this.board.tagName}#${this.board.id}` : null,
      boardRect: r(this.board), boardZ: this.board ? getComputedStyle(this.board).zIndex : null, layerRect: r(this.layer), layerZ: this.layer ? getComputedStyle(this.layer).zIndex : null,
      layerInDom: !!this.layer?.isConnected, canvasEl: cv ? [cv.width, cv.height, getComputedStyle(cv).display, getComputedStyle(cv).visibility] : null,
      viewSize: v ? [v.cam.W, v.cam.H] : null, cam, frames: this._frames || 0, draws: v?.sceneDraws || 0, ok: v?.sceneOK ?? null, clearBase: v ? !!v.clearBase : null, realm: v ? [v.st.realm, v.st.level] : null,
      stage: st ? {scale: st.scale?.x, pivot: [st.pivot?.x, st.pivot?.y], position: [st.position?.x, st.position?.y]} : null,
      dims: d ? {sceneX: d.sceneX, sceneY: d.sceneY, sceneWidth: d.sceneWidth, sceneHeight: d.sceneHeight} : null, bb: this.bb,
      loopError: this._loopErr || null, pins: this.layer ? this.layer.querySelectorAll('.wca-pin').length : 0, pinsShown: this.layer ? this.layer.querySelectorAll('.wca-pin:not([hidden])').length : 0};
  }
  selfCheck() {
    if (this.dead || !this.view) return;
    const d = this.diagnose();
    console.log(`${MOD} | scene check ${JSON.stringify(d)}`);
    if (d.draws > 0 && !d.loopError) return;
    if (game.user.isGM) showDiagnosis(d);
  }

  placeLayer() {
    const L = this.layer, b = this.board;
    Object.assign(L.style, {position: 'fixed', left: '0px', top: '0px', width: '100vw', height: '100vh'});
    const r = b && b.isConnected ? b.getBoundingClientRect() : null;
    this.boardOff = r && r.width && r.height ? {x: r.left, y: r.top} : {x: 0, y: 0};
    const z = b ? getComputedStyle(b).zIndex : ''; L.style.zIndex = z && z !== 'auto' ? z : '';
    this.view?.resize();
  }
  size() { return {width: window.innerWidth, height: window.innerHeight}; }

  /* ---------- camera: Foundry's stage ↔ atlas world ---------- */
  /** Scene rectangle inside the canvas (with fallbacks for unusual dimension objects). */
  rect() {
    const d = canvas.dimensions || {}, r = d.sceneRect;
    const x = d.sceneX ?? r?.x, y = d.sceneY ?? r?.y, w = d.sceneWidth ?? r?.width ?? this.scene.width, h = d.sceneHeight ?? r?.height ?? this.scene.height;
    return {x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0, w, h};
  }
  k() { const bb = this.bb; return this.rect().w / (bb[2] - bb[0]); }
  /** Stage transform as window pixels: client = scene × s + (ox, oy). */
  xf() {
    const st = canvas.stage; if (!st) return null;
    const s = st.scale.x, o = this.boardOff || {x: 0, y: 0};
    let t = {s, ox: o.x + st.position.x - st.pivot.x * s, oy: o.y + st.position.y - st.pivot.y * s};
    if (!Number.isFinite(t.s) || !Number.isFinite(t.ox) || !Number.isFinite(t.oy) || !t.s) { const m = st.worldTransform; if (m) t = {s: m.a, ox: o.x + m.tx, oy: o.y + m.ty}; }
    return t;
  }
  camera() {
    const bb = this.bb, t = this.xf(); if (!t || !bb || !this.view) return null;
    const R = this.rect(), k = this.k(), kk = t.s * k, c = this.view.cam;
    return {z: Math.log2(kk), cx: bb[0] + ((c.W / 2 - t.ox) / t.s - R.x) / k, cy: bb[1] + ((c.H / 2 - t.oy) / t.s - R.y) / k};
  }
  panTo(w, z, ms) {
    const R = this.rect(), bb = this.bb, k = this.k();
    const o = {x: R.x + (w[0] - bb[0]) * k, y: R.y + (w[1] - bb[1]) * k, scale: Math.pow(2, z) / k};
    if (![o.x, o.y, o.scale].every(Number.isFinite)) return;
    try { if (ms) canvas.animatePan(Object.assign(o, {duration: ms})); else canvas.pan(o); } catch (e) { console.warn(`${MOD} | pan failed`, e); }
  }
  /** Layer pixel → scene pixel. */
  toScene(sx, sy) { const t = this.xf(); return {x: (sx - t.ox) / t.s, y: (sy - t.oy) / t.s}; }
  /** The scene picture shows the plain map of the realm and level the scene was made for. */
  baseShown(realm, level) { const f = this.flag(); return realm === (f.bgRealm ?? f.realm) && level === (f.bgLevel ?? f.level); }

  hostApi() {
    return {
      layer: this.layer,
      size: () => this.size(),
      camera: () => this.camera(),
      panTo: (w, z, ms) => this.panTo(w, z, ms),
      baseShown: (r, l) => this.baseShown(r, l),
      forwardWheel: e => this.forwardWheel(e),
      showHud: () => this.showHud(),
      toggleHud: () => this.toggleHud(),
      locked: () => !!this.flag().lock,
      setLocked: game.user.isGM ? on => this.setLocked(on) : null,
      onRealm: (r, l) => this.onRealm(r, l)
    };
  }

  /* ---------- drawing: our own frame loop, plus an immediate redraw whenever Foundry pans ---------- */
  startLoop() {
    const step = () => {
      if (this.dead) return;
      this._frames = (this._frames || 0) + 1;
      try { this.view?.sceneTick(); } catch (err) { if (!this._loopErr) { this._loopErr = err.message || String(err); console.error(`${MOD} | scene drawing failed`, err); } }
      this._raf = requestAnimationFrame(step);
    };
    this._raf = requestAnimationFrame(step);
    this._panHook = Hooks.on('canvasPan', () => { try { this.view?.sceneTick(); } catch (e) {} });
  }

  /* ---------- pointer input from the board ---------- */
  /** Pointer input arrives on Foundry's board canvas; listen on the document so nothing Foundry does can hide it. */
  bindBoard() {
    let down = null;
    const onBoard = e => { const t = e.target; return t === this.board || (t && t.tagName === 'CANVAS' && t.id === 'board'); };
    this._pd = e => {
      down = null; if (!onBoard(e) || e.button !== 0 || !this.view) return;
      // pins sit above the zones: a press on a pin is the atlas's, not Foundry's (no drag-select box, no token deselect)
      const [sx, sy] = this.local(e), mk = this.view.markerAt(sx, sy);
      if (mk && !this.tokenAt(sx, sy, e)) {
        e.stopPropagation(); e.preventDefault();
        if (mk.party && this.view.canMoveParty(mk.party)) { this.view.partyDrag(e, mk.party, mk.el, true); return; }
      }
      down = {x: e.clientX, y: e.clientY, t: performance.now()};
    };
    this._pu = e => { const d = down; down = null; if (!d || e.button !== 0 || !onBoard(e)) return; if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5 || performance.now() - d.t > 700) return; this.clickAt(e); };
    this._pm = e => { if (!onBoard(e)) { if (this._overBoard) { this._overBoard = false; this._pl(); } return; } this._overBoard = true; this._last = e; if (!this._hoverRaf) this._hoverRaf = requestAnimationFrame(() => { this._hoverRaf = 0; this.hoverAt(this._last); }); };
    this._pl = () => { if (!this.view) return; if (this.view.hover) { this.view.hover = null; this.view.dirty(); } this.view.hideTip(); };
    document.addEventListener('pointerdown', this._pd, true); document.addEventListener('pointerup', this._pu, true); document.addEventListener('pointermove', this._pm, true);
  }
  unbindBoard() { document.removeEventListener('pointerdown', this._pd, true); document.removeEventListener('pointerup', this._pu, true); document.removeEventListener('pointermove', this._pm, true); }
  local(e) { return [e.clientX, e.clientY]; }
  /** Clicks open the atlas only with the plain select tool of the Token or Notes controls, and never on a token. */
  clicksAllowed() {
    const ctl = ui.controls?.control?.name ?? ui.controls?.activeControl; const tool = ui.controls?.tool?.name ?? ui.controls?.activeTool;
    if (ctl && !['tokens', 'token', 'notes'].includes(ctl)) return false;
    return !tool || ['select', 'wcaAtlas', 'wcaHud'].includes(tool);
  }
  /** Is a Foundry token (or another placeable) under this screen point? Then the click belongs to Foundry, not the atlas. */
  tokenAt(sx, sy, e) {
    try {
      if (canvas.tokens?.hover) return true;
      let p = null;
      if (e && typeof canvas.canvasCoordinatesFromClient === 'function') p = canvas.canvasCoordinatesFromClient({x: e.clientX, y: e.clientY});
      if (!p) p = this.toScene(sx, sy);
      const hit = t => { if (!t || t.visible === false) return false; const b = t.bounds; if (b && b.contains && b.contains(p.x, p.y)) return true; const d = t.document; if (d && Number.isFinite(d.x) && Number.isFinite(d.y)) { const g = canvas.grid?.size || canvas.dimensions?.size || 100; return p.x >= d.x && p.y >= d.y && p.x <= d.x + (d.width || 1) * g && p.y <= d.y + (d.height || 1) * g; } return false; };
      return (canvas.tokens?.placeables || []).some(hit);
    } catch (e2) { return false; }
  }
  clickAt(e) {
    if (!this.view) return; const [sx, sy] = this.local(e);
    // pins come first, whatever tool is active
    const mk = this.view.markerAt(sx, sy); if (mk && !this.tokenAt(sx, sy, e)) { this.view.openMarker(mk); return; }
    if (!this.clicksAllowed() || this.tokenAt(sx, sy, e)) return;
    const before = canvas.tokens?.controlled?.length ?? 0;
    // let Foundry handle the click first: if it selected a token, the zone behind stays closed
    setTimeout(() => { if ((canvas.tokens?.controlled?.length ?? 0) !== before || canvas.tokens?.hover) return; this.view?.clickAt(sx, sy, e); }, 30);
  }
  hoverAt(e) {
    if (!this.view || !e || e.buttons) return; const [sx, sy] = this.local(e);
    if (this.view.markerAt(sx, sy)) { this.view.hoverAt(sx, sy); return; }
    if (!this.clicksAllowed() || this.tokenAt(sx, sy, e)) { this._pl(); return; }
    this.view.hoverAt(sx, sy);
  }
  forwardWheel(e) {
    if (!e.target.closest?.('.wca-pin') || !this.board) return;
    this.board.dispatchEvent(new WheelEvent('wheel', {deltaX: e.deltaX, deltaY: e.deltaY, deltaMode: e.deltaMode, clientX: e.clientX, clientY: e.clientY, screenX: e.screenX, screenY: e.screenY, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey, bubbles: true, cancelable: true}));
  }

  /* ---------- dossier window ---------- */
  showHud() { if (!this.hud) return; if (!this.hud.rendered) { this.hud.render({force: true}); saveHud({open: true}); } else { if (this.hud.minimized) this.hud.maximize?.(); this.hud.bringToFront?.(); } }
  toggleHud() { if (!this.hud) return; if (this.hud.rendered && !this.hud.minimized) this.hud.close(); else this.showHud(); }

  /* ---------- realm lock: players follow the Storyteller ---------- */
  async setLocked(on) {
    if (!game.user.isGM) return;
    await this.scene.setFlag(MOD, 'atlas', Object.assign({}, this.flag(), {lock: !!on, realm: this.view.st.realm, level: this.view.st.level}));
    ui.notifications.info(on ? 'Players on this scene now follow your realm and level.' : 'Players on this scene may switch realms themselves.');
  }
  onRealm(realm, level) {
    if (!game.user.isGM) return; const f = this.flag();
    if (!f.lock || (f.realm === realm && f.level === level)) return;
    clearTimeout(this._rt); this._rt = setTimeout(() => this.scene.setFlag(MOD, 'atlas', Object.assign({}, this.flag(), {realm, level})), 150);
  }
  followFlag(f) { const v = this.view; if (!v) return; if (f.realm && f.realm !== v.st.realm) v.setRealm(f.realm, true); if (f.level && f.level !== v.st.level) v.setLevel(f.level, true); v.applyView(); v.render(); }
  flagChanged(f) {
    if (!this.view) return;
    const prev = this._flag || {}; this._flag = f;
    if (JSON.stringify(prev.bb) !== JSON.stringify(f.bb) && prev.bb) { SceneAtlas.teardown(); SceneAtlas.sync(); return; }
    if (!game.user.isGM && f.lock) this.followFlag(f);
    this.view.applyView(); this.view.dirty();
  }

  destroy() {
    if (this.dead) return; this.dead = true;
    cancelAnimationFrame(this._raf); clearTimeout(this._check); if (this._panHook != null) Hooks.off('canvasPan', this._panHook);
    this.unbindBoard(); window.removeEventListener('resize', this._onWin);
    try { this.hud?.close({animate: false}); } catch (e) {}
    try { this._unsubBm?.(); this.view?.destroy(); } catch (e) {}
    this.layer?.remove(); this.store?.release();
    this.view = null;
  }
}
void esc;

/** Foundry's board canvas: the #board element, or the PIXI view as a fallback. */
function findBoard() {
  const byId = document.getElementById('board');
  const v = canvas.app?.view || canvas.app?.canvas || null;
  if (v && v.isConnected) return v;
  return byId || v;
}

/** A dialog with the diagnosis as copyable text. */
function showDiagnosis(d) {
  const txt = JSON.stringify(d);
  const content = `<p>City Atlas could not draw the map on this scene. Please copy the text below and send it to the module author.</p><textarea readonly rows="8" style="width:100%;font:12px monospace" onclick="this.select()">${esc(txt)}</textarea>`;
  try { foundry.applications.api.DialogV2.prompt({window: {title: 'City Atlas: scene check'}, content, ok: {label: 'Close'}, rejectClose: false}); }
  catch (e) { ui.notifications.warn('City Atlas could not draw the map on this scene. Run game.modules.get("wod-city-atlas").api.diagnose() in the console (F12) and send the result.'); }
}
export {showDiagnosis};
