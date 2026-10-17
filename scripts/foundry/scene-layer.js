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
    this.board = findBoard();
    document.getElementById('wca-scene-layer')?.remove();
    const L = document.createElement('div'); L.id = 'wca-scene-layer'; this.layer = L;
    if (this.board && this.board.isConnected) this.board.insertAdjacentElement('afterend', L); else document.body.prepend(L);
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
    console.log(`${MOD} | atlas “${this.entry.name}” mounted on scene “${this.scene.name}” (${this.mode === 'under' ? 'as the scene background' : 'as an overlay'})`);
    // self-check: if nothing could be drawn, fall back to the overlay and say why
    this._check = setTimeout(() => this.selfCheck(), 2500);
  }
  /** Everything useful for finding out why a scene shows nothing. */
  diagnose() {
    const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
    const st = canvas.stage, d = canvas.dimensions, v = this.view, mesh = canvas.primary?.background;
    let cam = null; try { cam = this.camera(); } catch (e) { cam = 'error: ' + e.message; }
    return {version: game.modules.get(MOD)?.version, mode: this.mode, board: this.board ? `${this.board.tagName}#${this.board.id}` : null, boardRect: r(this.board), boardZ: this.board ? getComputedStyle(this.board).zIndex : null,
      layerRect: r(this.layer), layerZ: this.layer ? getComputedStyle(this.layer).zIndex : null, viewSize: v ? [v.cam.W, v.cam.H] : null, cam, draws: v?.sceneDraws || 0, ok: v?.sceneOK ?? null,
      stage: st ? {scale: st.scale.x, pivot: [st.pivot.x, st.pivot.y], position: [st.position.x, st.position.y]} : null,
      dims: d ? {sceneX: d.sceneX, sceneY: d.sceneY, sceneWidth: d.sceneWidth, sceneHeight: d.sceneHeight} : null, bb: this.bb,
      resolution: canvas.app?.renderer?.resolution, ticker: !!this._ticker, tickError: this._tickErr ? String(this._tickErr) : null,
      background: mesh ? {texture: mesh.texture === this.tex ? 'atlas' : 'scene picture', anchor: mesh.anchor ? [mesh.anchor.x, mesh.anchor.y] : null} : null, ownSprite: !!this.ownMesh,
      pins: this.layer ? this.layer.querySelectorAll('.wca-pin').length : 0, pinsShown: this.layer ? this.layer.querySelectorAll('.wca-pin:not([hidden])').length : 0};
  }
  selfCheck() {
    if (this.dead || !this.view) return;
    const d = this.diagnose();
    console.log(`${MOD} | scene check ${JSON.stringify(d)}`);
    if (d.draws > 0 && !d.tickError) return;
    if (this.mode === 'under') { this.restoreMesh(); this.setMode('over'); this._check = setTimeout(() => this.selfCheck(), 2500); }
    if (game.user.isGM) ui.notifications.warn(`City Atlas could not draw the map on this scene${d.tickError ? ` (${d.tickError})` : ''}. Please send the “wod-city-atlas | scene check” line from the console (F12) to the module author.`, {permanent: true});
  }
  setMode(m) { this.mode = m; this.layer.classList.remove('mode-under', 'mode-over'); this.layer.classList.add('mode-' + m); this.view?.dirty(); }

  pickMode() {
    let want = 'under'; try { want = game.settings.get(MOD, 'sceneMode') || 'under'; } catch (e) {}
    if (want === 'under' && globalThis.PIXI && canvas.primary?.background && canvas.app?.ticker) return 'under';
    return 'over';
  }
  /** The layer always covers the whole window; the board's own offset (normally 0, 0) is applied in the camera maths. */
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
  /** Scene rectangle inside the canvas (with fallbacks for older or unusual dimension objects). */
  rect() {
    const d = canvas.dimensions || {}, r = d.sceneRect;
    const x = d.sceneX ?? r?.x, y = d.sceneY ?? r?.y, w = d.sceneWidth ?? r?.width ?? this.scene.width, h = d.sceneHeight ?? r?.height ?? this.scene.height;
    return {x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0, w, h};
  }
  k() { const bb = this.bb; return this.rect().w / (bb[2] - bb[0]); }
  /** Stage transform as layer (= window) pixels: client = scene × s + (ox, oy). */
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
    // world w → scene px: R.x + (w - bb0) k → client: that × s + ox. Solve for the world point at the layer centre.
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

  hostApi() {
    return {
      layer: this.layer,
      size: () => this.size(),
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
    this._tick = () => { try { this.tick(); } catch (err) { if (!this._tickErr) { this._tickErr = err.message || String(err); console.error(`${MOD} | scene drawing failed`, err); } } };
    const T = canvas.app?.ticker;
    // run before Foundry updates the primary group (objects may only be moved before that)
    const P = globalThis.PIXI?.UPDATE_PRIORITY || {};
    const prio = Math.max(P.HIGH ?? 25, (P.OBJECTS ?? 0) + 1, (P.PRIMARY ?? 0) + 1);
    if (T && globalThis.PIXI) { T.add(this._tick, this, prio); this._ticker = T; }
    else { const loop = () => { if (this.dead) return; this._tick(); this._raf = requestAnimationFrame(loop); }; this._raf = requestAnimationFrame(loop); }
  }
  tick() {
    if (this.dead || !this.view) return;
    const drew = this.view.sceneTick();
    if (this.mode !== 'under') return;
    // never hide the scene picture unless the atlas has really been drawn
    if (!this.view.sceneOK || !this.view.sceneDraws) { if (this.orig) this.restoreMesh(); return; }
    this.placeMesh(drew);
  }
  placeMesh(drew) {
    const bg = canvas.primary?.background;
    const cv = this.view.el.canvas, c = this.view.cam; if (!cv.width || !cv.height || !c.W || !c.H) return;
    if (!this.tex || this.tex.baseTexture?.destroyed) { this.tex = PIXI.Texture.from(cv); drew = true; }
    let mesh = this.ownMesh && !this.ownMesh.destroyed ? this.ownMesh : bg;
    if (!mesh || mesh.destroyed) return;
    if (mesh === bg && mesh.texture !== this.tex) {
      // preferred: show the atlas in place of the scene picture
      const orig = {texture: mesh.texture, x: mesh.position.x, y: mesh.position.y, sx: mesh.scale.x, sy: mesh.scale.y, visible: mesh.visible};
      try { mesh.texture = this.tex; if (mesh.texture !== this.tex) throw new Error('texture is read-only'); this.orig ||= orig; drew = true; }
      catch (err) { mesh = this.makeOwnMesh(bg); drew = true; }
    }
    if (drew) this.tex.baseTexture.update();
    const t = this.xf(); const x0 = -t.ox / t.s, y0 = -t.oy / t.s, w = c.W / t.s, h = c.H / t.s;
    if (![x0, y0, w, h].every(Number.isFinite)) return;
    const ax = mesh.anchor?.x ?? 0, ay = mesh.anchor?.y ?? 0;
    mesh.position.set(x0 + ax * w, y0 + ay * h); mesh.scale.set(w / (this.tex.width || cv.width), h / (this.tex.height || cv.height));
    if (!mesh.visible) mesh.visible = true;
    if (mesh.renderable === false) mesh.renderable = true;
    if (canvas.primary && 'renderDirty' in canvas.primary) canvas.primary.renderDirty = true;
  }
  /** Fallback: our own primary sprite just above the scene picture (when the picture's texture can't be swapped). */
  makeOwnMesh(bg) {
    const PSM = foundry.canvas?.primary?.PrimarySpriteMesh;
    if (!PSM) throw new Error('no PrimarySpriteMesh class');
    let m; try { m = new PSM({name: 'wca-atlas', texture: this.tex}); } catch (e) { m = new PSM(this.tex); }
    if (m.texture !== this.tex) { try { m.texture = this.tex; } catch (e) {} }
    const G = canvas.primary.constructor;
    m.elevation = bg?.elevation ?? G.BACKGROUND_ELEVATION ?? 0;
    m.sortLayer = bg?.sortLayer ?? G.SORT_LAYERS?.SCENE ?? 0;
    m.sort = (bg?.sort ?? 0) + 1;
    canvas.primary.addChild(m);
    this.ownMesh = m; console.log(`${MOD} | drawing the atlas with its own sprite above the scene picture`);
    return m;
  }
  restoreMesh() {
    if (this.ownMesh) { try { this.ownMesh.parent?.removeChild(this.ownMesh); this.ownMesh.destroy({texture: false}); } catch (e) {} this.ownMesh = null; }
    const mesh = canvas?.primary?.background, o = this.orig; this.orig = null;
    if (!mesh || mesh.destroyed || !o) return;
    try { mesh.texture = o.texture; mesh.position.set(o.x, o.y); mesh.scale.set(o.sx, o.sy); mesh.visible = o.visible; if (canvas.primary && 'renderDirty' in canvas.primary) canvas.primary.renderDirty = true; } catch (e) {}
  }

  /* ---------- pointer input from the board ---------- */
  /** Pointer input arrives on Foundry's board canvas; listen on the document so nothing Foundry does can hide it. */
  bindBoard() {
    let down = null;
    const onBoard = e => { const t = e.target; return t === this.board || (t && t.tagName === 'CANVAS' && t.id === 'board'); };
    this._pd = e => { down = onBoard(e) && e.button === 0 ? {x: e.clientX, y: e.clientY, t: performance.now()} : null; };
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
    try { this._ticker?.remove(this._tick, this); } catch (e) {} cancelAnimationFrame(this._raf); clearTimeout(this._check);
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

/** Foundry's board canvas: the #board element, or the PIXI view as a fallback. */
function findBoard() {
  const byId = document.getElementById('board');
  const v = canvas.app?.view || canvas.app?.canvas || null;
  if (v && v.isConnected) return v;
  return byId || v;
}
