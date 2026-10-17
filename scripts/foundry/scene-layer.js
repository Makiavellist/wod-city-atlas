/* The live atlas on a Foundry scene.
 *
 * A scene flagged `flags.wod-city-atlas.atlas = {entry, bb, realm, level, lock}` *is* an atlas: on every client the
 * atlas is drawn on top of the scene for that user (their own tiers, realms and layers), and the dossier opens in a
 * window beside it. Nothing per-player is stored on the scene, so each player sees the scene differently.
 *
 * Drawing: by default the atlas replaces the scene's background picture (so tokens, drawings and lighting stay on
 * top of it). The 2D canvas is redrawn at screen resolution whenever the view moves, and handed to PIXI as the
 * background texture positioned over the visible part of the scene. If that is not possible, the atlas is drawn in
 * an HTML layer just above the board instead ("overlay" mode).
 */
import {AtlasView} from '../core/view.js';
import {esc} from '../core/util.js';
import {JournalStore, MOD} from './journal-store.js';
import {makeAdapter, resolveUrl, AtlasApp} from './app.js';

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
    if (!entry.testUserPermission(game.user, 'OBSERVER')) return null; // this player only sees the plain map picture
    const sa = new SceneAtlas(scene, entry); this.current = sa;
    try { await sa.mount(); } catch (err) { console.error(`${MOD} | could not draw the atlas on the scene`, err); sa.destroy(); if (this.current === sa) this.current = null; ui.notifications.error(`City Atlas: could not draw the atlas on this scene (${err.message}).`); }
    return this.current;
  }
  static teardown() { this.current?.destroy(); this.current = null; }

  constructor(scene, entry) { this.scene = scene; this.entry = entry; }
  flag() { return this.scene.getFlag(MOD, 'atlas') || {}; }
  get bb() { return this.flag().bb; }

  async mount() {
    const f = this.flag(); this._flag = f;
    if (!Array.isArray(f.bb) || f.bb.length !== 4) throw new Error('the scene has no atlas area');
    this.store = JournalStore.acquire(this.entry);
    await this.store.loadBasemap(resolveUrl);
    if (this.dead) return;
    // the map surface sits right above the board and below Foundry's interface
    this.board = canvas.app.view;
    const L = document.createElement('div'); L.id = 'wca-scene-layer'; this.layer = L;
    this.board.insertAdjacentElement('afterend', L);
    this.placeLayer();
    this._onWin = () => this.placeLayer(); window.addEventListener('resize', this._onWin);
    this.mode = this.pickMode();
    L.classList.add('mode-' + this.mode);
    this.root = document.createElement('div');
    const adapter = makeAdapter(this);
    adapter.openFull = state => AtlasApp.open(this.entry, {state});
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
    this.startTicker();
    this.hud = new AtlasHud(this);
    if (loadHud().open !== false) this.hud.render({force: true});
    console.log(`${MOD} | atlas “${this.entry.name}” drawn on scene “${this.scene.name}” (${this.mode === 'under' ? 'as the scene background' : 'as an overlay'})`);
  }

  pickMode() {
    let want = 'under'; try { want = game.settings.get(MOD, 'sceneMode') || 'under'; } catch (e) {}
    if (want === 'under' && globalThis.PIXI && canvas.primary?.background && canvas.app?.ticker) return 'under';
    return 'over';
  }
  placeLayer() {
    const r = this.board.getBoundingClientRect(), L = this.layer;
    Object.assign(L.style, {left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px'});
    const z = getComputedStyle(this.board).zIndex; L.style.zIndex = z && z !== 'auto' ? z : '';
  }

  /* ---------- camera: Foundry's stage ↔ atlas world ---------- */
  k() { const d = canvas.dimensions, bb = this.bb; return d.sceneWidth / (bb[2] - bb[0]); }
  camera() {
    const st = canvas.stage, d = canvas.dimensions, bb = this.bb; if (!st || !d || !bb || !this.view) return null;
    const s = st.scale.x, k = this.k(), kk = s * k, c = this.view.cam;
    return {z: Math.log2(kk), cx: bb[0] + (c.W / 2 - st.position.x) / kk + (st.pivot.x - d.sceneX) / k, cy: bb[1] + (c.H / 2 - st.position.y) / kk + (st.pivot.y - d.sceneY) / k};
  }
  panTo(w, z, ms) {
    const d = canvas.dimensions, bb = this.bb, k = this.k();
    const o = {x: d.sceneX + (w[0] - bb[0]) * k, y: d.sceneY + (w[1] - bb[1]) * k, scale: Math.pow(2, z) / k};
    try { if (ms) canvas.animatePan(Object.assign(o, {duration: ms})); else canvas.pan(o); } catch (e) { console.warn(`${MOD} | pan failed`, e); }
  }
  /** Layer pixel → scene pixel. */
  toScene(sx, sy) { const st = canvas.stage, s = st.scale.x; return {x: (sx - st.position.x) / s + st.pivot.x, y: (sy - st.position.y) / s + st.pivot.y}; }

  hostApi() {
    return {
      layer: this.layer,
      camera: () => this.camera(),
      panTo: (w, z, ms) => this.panTo(w, z, ms),
      forwardWheel: e => this.forwardWheel(e),
      showHud: () => this.showHud(),
      toggleHud: () => this.toggleHud(),
      locked: () => !!this.flag().lock,
      setLocked: game.user.isGM ? on => this.setLocked(on) : null,
      onRealm: (r, l) => this.onRealm(r, l)
    };
  }

  /* ---------- drawing ---------- */
  startTicker() {
    this._tick = () => { try { this.tick(); } catch (err) { if (!this._tickErr) { this._tickErr = true; console.error(`${MOD} | scene drawing failed`, err); } } };
    const T = canvas.app?.ticker;
    if (T && globalThis.PIXI) { T.add(this._tick, this, PIXI.UPDATE_PRIORITY?.HIGH ?? 25); this._ticker = T; }
    else { const loop = () => { if (this.dead) return; this._tick(); this._raf = requestAnimationFrame(loop); }; this._raf = requestAnimationFrame(loop); }
  }
  tick() {
    if (this.dead || !this.view) return;
    const drew = this.view.sceneTick();
    if (this.mode === 'under') this.placeMesh(drew);
  }
  placeMesh(drew) {
    const mesh = canvas.primary?.background;
    if (!mesh || mesh.destroyed) return;
    const cv = this.view.el.canvas; if (!cv.width || !cv.height) return;
    if (!this.tex || this.tex.baseTexture?.destroyed) { this.tex = PIXI.Texture.from(cv); drew = true; }
    if (!this.orig) this.orig = {texture: mesh.texture, x: mesh.position.x, y: mesh.position.y, sx: mesh.scale.x, sy: mesh.scale.y, visible: mesh.visible};
    if (mesh.texture !== this.tex) { mesh.texture = this.tex; drew = true; }
    if (drew) this.tex.baseTexture.update();
    const st = canvas.stage, s = st.scale.x, c = this.view.cam;
    const x0 = -st.position.x / s + st.pivot.x, y0 = -st.position.y / s + st.pivot.y, w = c.W / s, h = c.H / s;
    const ax = mesh.anchor?.x ?? 0, ay = mesh.anchor?.y ?? 0;
    mesh.position.set(x0 + ax * w, y0 + ay * h); mesh.scale.set(w / (this.tex.width || cv.width), h / (this.tex.height || cv.height));
    if (!mesh.visible) mesh.visible = true;
    if (mesh.renderable === false) mesh.renderable = true;
  }
  restoreMesh() {
    const mesh = canvas?.primary?.background, o = this.orig; this.orig = null;
    if (!mesh || mesh.destroyed || !o) return;
    try { mesh.texture = o.texture; mesh.position.set(o.x, o.y); mesh.scale.set(o.sx, o.sy); mesh.visible = o.visible; } catch (e) {}
  }

  /* ---------- pointer input from the board ---------- */
  bindBoard() {
    const B = this.board; let down = null;
    this._pd = e => { down = e.button === 0 ? {x: e.clientX, y: e.clientY, t: performance.now()} : null; };
    this._pu = e => { const d = down; down = null; if (!d || e.button !== 0) return; if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5 || performance.now() - d.t > 700) return; this.clickAt(e); };
    this._pm = e => { this._last = e; if (!this._hoverRaf) this._hoverRaf = requestAnimationFrame(() => { this._hoverRaf = 0; this.hoverAt(this._last); }); };
    this._pl = () => { if (!this.view) return; if (this.view.hover) { this.view.hover = null; this.view.dirty(); } this.view.hideTip(); };
    B.addEventListener('pointerdown', this._pd); B.addEventListener('pointerup', this._pu); B.addEventListener('pointermove', this._pm); B.addEventListener('pointerleave', this._pl);
  }
  unbindBoard() { const B = this.board; if (!B) return; B.removeEventListener('pointerdown', this._pd); B.removeEventListener('pointerup', this._pu); B.removeEventListener('pointermove', this._pm); B.removeEventListener('pointerleave', this._pl); }
  local(e) { const r = this.layer.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  /** Clicks open the atlas only with the plain select tool of the Token or Notes controls, and never on a token. */
  clicksAllowed() {
    const ctl = ui.controls?.control?.name ?? ui.controls?.activeControl; const tool = ui.controls?.tool?.name ?? ui.controls?.activeTool;
    if (ctl && !['tokens', 'token', 'notes'].includes(ctl)) return false;
    return !tool || ['select', 'wcaAtlas', 'wcaHud'].includes(tool);
  }
  tokenAt(sx, sy) {
    try { const p = this.toScene(sx, sy); return (canvas.tokens?.placeables || []).some(t => t.visible && t.bounds?.contains?.(p.x, p.y)); } catch (e) { return false; }
  }
  clickAt(e) { if (!this.view || !this.clicksAllowed()) return; const [sx, sy] = this.local(e); if (this.tokenAt(sx, sy)) return; this.view.clickAt(sx, sy, e); }
  hoverAt(e) {
    if (!this.view || !e || e.buttons) return; const [sx, sy] = this.local(e);
    if (!this.clicksAllowed() || this.tokenAt(sx, sy)) { this._pl(); return; }
    this.view.hoverAt(sx, sy);
  }
  forwardWheel(e) {
    if (!e.target.closest?.('.wca-pin')) return;
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
    try { this._ticker?.remove(this._tick, this); } catch (e) {} cancelAnimationFrame(this._raf);
    this.unbindBoard(); window.removeEventListener('resize', this._onWin);
    this.restoreMesh();
    try { this.tex?.destroy(true); } catch (e) {} this.tex = null;
    try { this.hud?.close({animate: false}); } catch (e) {}
    try { this._unsubBm?.(); this.view?.destroy(); } catch (e) {}
    this.layer?.remove(); this.store?.release();
    this.view = null;
  }
}
void esc;
