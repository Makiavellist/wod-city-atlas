/* Foundry VTT v13 application windows: the atlas itself and the launcher that lists, creates and imports atlases. */
import {AtlasView} from '../core/view.js';
import {AtlasEditor} from '../core/editor.js';
import {rebasePaths} from '../core/store.js';
import {normalize} from '../core/model.js';
import {blankAtlas, LOOKS} from '../core/templates.js';
import {esc, svg} from '../core/util.js';
import {renderSnapshot, lookSig} from '../core/snapshot.js';
import {planLooks, applyLooks, fromPreset} from '../core/looks.js';
import {JournalStore, MOD, isAtlasEntry} from './journal-store.js';
import {SceneAtlas} from './scene-layer.js';

const {ApplicationV2, DialogV2} = foundry.applications.api;
const L = (k, d) => { const s = game.i18n.localize(`WCA.${k}`); return s === `WCA.${k}` ? d : s; };

/* ================= Foundry adapter for the framework-free view ================= */
export function resolveUrl(src) {
  if (!src || /^(https?:|data:|blob:)/.test(src)) return src;
  try { return foundry.utils.getRoute(src.replace(/^\//, '')); } catch (e) { return src; }
}
export function makeAdapter(app) {
  return {
    resolveUrl,
    enrich: html => foundry.applications.ux.TextEditor.implementation.enrichHTML(html, {secrets: game.user.isGM}),
    openUuid: async uuid => { const d = await fromUuid(uuid); if (!d) return ui.notifications.warn(L('NoDoc', 'That linked document no longer exists.')); if (d.documentName === 'Scene') return d.view(); d.sheet?.render(true); },
    notify: (msg, type) => ui.notifications[type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'info'](msg),
    confirm: (title, text) => DialogV2.confirm({window: {title}, content: `<p>${esc(text)}</p>`, rejectClose: false, modal: true}),
    pickImage: (current, cb) => { const FP = foundry.applications.apps.FilePicker.implementation; new FP({type: 'image', current: current || '', callback: path => cb(path)}).render(true); },
    resolveDrop: async data => { const uuid = data.uuid || (data.type && data.id ? `${data.type}.${data.id}` : null); if (!uuid) return null; const d = await fromUuid(uuid); if (!d) return null; return {uuid: d.uuid, name: d.name, img: d.img || d.thumb || null, documentName: d.documentName}; },
    richEditor: (host, html) => {
      const PM = foundry.applications.elements?.HTMLProseMirrorElement; if (!PM) return false;
      const el = PM.create({name: 'html', value: html || '', toggled: false, height: 220});
      host.appendChild(el); host._getValue = () => el.value ?? html; return true;
    },
    share: game.user.isGM ? state => shareView(app.entry, state) : null,
    saveFile: (name, text) => foundry.utils.saveDataToFile(text, 'application/json', name),
    loadJSON: async path => (await fetch(resolveUrl(path))).json(),
    loadPreset: game.user.isGM ? id => presetAtlas(id) : null,
    pickActors: () => pickActors(),
    players: () => game.users.filter(u => !u.isGM).map(u => ({id: u.id, name: u.name, color: u.color?.css ?? String(u.color || '')})),
    notifyReveal: game.user.isGM ? ({ids, name}) => game.socket.emit(`module.${MOD}`, {action: 'reveal', entryId: app.entry.id, ids, name}) : null,
    exportScene: game.user.isGM ? opts => exportScene(app, opts) : null,
    atlasScenes: () => atlasScenes(app.entry),
    // Foundry Actors
    docInfo: uuid => docInfo(uuid),
    actors: () => game.actors.filter(a => game.user.isGM || a.testUserPermission(game.user, 'LIMITED')).map(a => ({uuid: a.uuid, name: a.name, img: a.img, folder: a.folder?.name || ''})).sort((a, b) => a.name.localeCompare(b.name)),
    actorTypes: () => actorTypes(),
    createActors: game.user.isGM ? (list, o) => createActors(list, o) : null,
    // personal notes on the map, kept in each user's own flags (players can write those, not the atlas)
    notes: notesApi(app),
    party: partyApi(app),
    uiTheme: (rv, kind) => { if (!app.scene && SceneAtlas.current) return; applyUiTheme(rv, kind); },
    onNotes: cb => { const id = Hooks.on('updateUser', (u, ch) => { if (ch?.flags?.[MOD] !== undefined || ch?.character !== undefined || ch?.avatar !== undefined) cb(); }); const id2 = Hooks.on('updateActor', (a, ch) => { if (ch?.img !== undefined || ch?.name !== undefined) cb(); }); return () => { Hooks.off('updateUser', id); Hooks.off('updateActor', id2); }; }
  };
}
/** Where each player's character is on this atlas, kept in that user's flags (the GM may move anyone). */
/** Foundry's whole interface follows the realm on screen (with the Masquerade look on). */
const UI_KEYS = ['panel', 'panel2', 'line', 'accent', 'gold', 'muted', 'bone'];
export function applyUiTheme(rv, kind) {
  const b = document.body, t = (rv && rv.theme) || {};
  for (const k of UI_KEYS) { if (t[k]) b.style.setProperty('--vtm-' + k, t[k]); else b.style.removeProperty('--vtm-' + k); }
  b.dataset.wcaRealm = kind || 'blood';
}
export function resetUiTheme() { const b = document.body; for (const k of UI_KEYS) b.style.removeProperty('--vtm-' + k); delete b.dataset.wcaRealm; }
function partyApi(app) {
  const eid = () => app.entry?.id;
  const img = u => { const a = u.character; const i = a && a.img && !DEFAULT_ICON.test(a.img) ? a.img : null; return i || (u.avatar && !DEFAULT_ICON.test(u.avatar) ? u.avatar : null); };
  return {
    list() {
      const seeAll = game.user.isGM, others = game.settings.get(MOD, 'partyVisible');
      const out = [];
      for (const u of game.users) {
        const pos = (u.getFlag?.(MOD, 'pos') || {})[eid()] || null; const mine = u.id === game.user.id;
        if (u.isGM && !pos) continue;
        if (!seeAll && !mine && (!others || !pos || pos.hidden)) continue;
        out.push({uid: u.id, uuid: u.character?.uuid || null, name: u.character?.name || u.name, player: u.character ? u.name : '', img: img(u), color: u.color?.css ?? (typeof u.color === 'string' ? u.color : undefined), mine, at: pos?.at || null, realm: pos?.realm, level: pos?.level, hidden: !!pos?.hidden});
      }
      return out;
    },
    async save(uid, pos) {
      const u = game.users.get(uid); if (!u || (u.id !== game.user.id && !game.user.isGM)) return;
      await u.update({[`flags.${MOD}.pos.${eid()}`]: {at: pos.at, realm: pos.realm, level: pos.level || null, hidden: !!pos.hidden, t: Date.now()}});
    },
    async remove(uid) {
      const u = game.users.get(uid); if (!u || (u.id !== game.user.id && !game.user.isGM)) return;
      await u.update({[`flags.${MOD}.pos.-=${eid()}`]: null});
    }
  };
}
function notesApi(app) {
  const eid = () => app.entry?.id;
  return {
    list() {
      const out = [];
      for (const u of game.users) {
        const all = u.getFlag?.(MOD, 'notes') || {}; const mine = all[eid()] || {};
        for (const [id, n] of Object.entries(mine)) { if (!n || typeof n !== 'object') continue; out.push(Object.assign({}, n, {id, author: u.id, authorName: u.name, authorColor: u.color?.css ?? (typeof u.color === 'string' ? u.color : undefined), mine: u.id === game.user.id})); }
      }
      return out;
    },
    async save(n) {
      const clean = {at: n.at, realm: n.realm, level: n.level, title: String(n.title || '').slice(0, 200), html: String(n.html || '').slice(0, 5000), icon: n.icon, color: n.color, shared: !!n.shared, t: n.t || Date.now()};
      await game.user.update({[`flags.${MOD}.notes.${eid()}.${n.id}`]: clean});
    },
    async remove(n) {
      const u = game.users.get(n.author) || game.user; if (u.id !== game.user.id && !game.user.isGM) return;
      await u.update({[`flags.${MOD}.notes.${eid()}.-=${n.id}`]: null});
    }
  };
}
const DEFAULT_ICON = /(^|\/)icons\/svg\/mystery-man\.svg$/;
/** What the current user may know about a linked document (synchronous, for the dossier). */
export function docInfo(uuid) {
  let d = null; try { d = fromUuidSync(uuid); } catch (e) { return null; }
  if (!d) return null;
  const isActor = d.documentName === 'Actor';
  const canOpen = game.user.isGM || (typeof d.testUserPermission === 'function' ? d.testUserPermission(game.user, 'LIMITED') : true);
  const owners = isActor && game.user.isGM && typeof d.testUserPermission === 'function' ? game.users.filter(u => !u.isGM && d.testUserPermission(u, 'OWNER')).map(u => u.name).join(', ') : '';
  return {documentName: d.documentName || '', name: d.name || uuid, img: d.img && !DEFAULT_ICON.test(d.img) ? d.img : null, canOpen, owners: owners ? `played by ${owners}` : ''};
}
export function actorTypes() {
  let types = [];
  try { types = game.documentTypes?.Actor || Object.keys(CONFIG.Actor.dataModels || {}) || []; } catch (e) {}
  if (!types.length) try { types = Object.keys(game.model?.Actor || {}); } catch (e) {}
  types = types.filter(t => t && t !== 'base' && t !== CONST.BASE_DOCUMENT_TYPE);
  const label = t => { const k = CONFIG.Actor?.typeLabels?.[t]; const l = k ? game.i18n.localize(k) : t; return l || t; };
  const rank = t => /vampire|kindred/i.test(t) ? 0 : /mortal|npc|character/i.test(t) ? 1 : 2;
  return types.slice().sort((a, b) => rank(a) - rank(b) || label(a).localeCompare(label(b))).map(t => [t, label(t)]);
}
/** Where a system keeps an actor's biography, if anywhere obvious. */
function bioPath(type) {
  const cands = ['biography', 'bio', 'details.biography', 'details.biography.value', 'description', 'description.value', 'notes', 'background', 'biography.value', 'bio.value'];
  try { const model = CONFIG.Actor.dataModels?.[type]; if (model?.schema?.getField) for (const c of cands) { const f = model.schema.getField(c); if (f && /String|HTML/.test(f.constructor?.name || '')) return 'system.' + c; } } catch (e) {}
  try { const tpl = game.model?.Actor?.[type] || game.system?.template?.Actor?.[type]; if (tpl) for (const c of cands) { if (typeof foundry.utils.getProperty(tpl, c) === 'string') return 'system.' + c; } } catch (e) {}
  return null;
}
async function createActors(list, {type, ownership = 0, bio = true} = {}) {
  if (!list.length) return {};
  const name = L('ActorFolder', 'City Atlas characters');
  const folder = game.folders.find(f => f.type === 'Actor' && f.name === name) || await Folder.create({name, type: 'Actor', color: '#5a1e24'});
  const path = bio ? bioPath(type) : null;
  const data = list.map(p => { const d = {name: p.name || 'Unnamed', type, folder: folder?.id ?? null, ownership: {default: ownership}, flags: {[MOD]: {person: p.id}}}; if (p.img) { d.img = p.img; d.prototypeToken = {texture: {src: p.img}}; } if (path && p.html) foundry.utils.setProperty(d, path, p.html); return d; });
  const out = {}; const Cls = Actor.implementation || Actor;
  for (let i = 0; i < data.length; i += 50) { const made = await Cls.createDocuments(data.slice(i, i + 50)); made.forEach((a, j) => { out[list[i + j].id] = a.uuid; }); }
  return out;
}

/* ================= finding people by Actor ================= */
export function findPeopleByActor(uuid) {
  const out = [];
  for (const e of game.journal) {
    if (!isAtlasEntry(e) || !e.testUserPermission(game.user, 'OBSERVER')) continue;
    const page = e.pages.find(p => p.getFlag(MOD, 'coll') === 'people'); const items = page?.getFlag(MOD, 'items') || {};
    for (const [id, raw] of Object.entries(items)) { if (typeof raw === 'string' && !raw.includes(uuid)) continue; try { const it = typeof raw === 'string' ? JSON.parse(raw) : raw; if (it && it.uuid === uuid) out.push({entry: e, id, name: it.name}); } catch (err) {} }
  }
  return out;
}
/** Open an entry of an atlas: on the live scene if it is showing that atlas, otherwise in the atlas window. */
export function openInAtlas(entry, id) {
  const sa = SceneAtlas.current;
  if (sa && sa.entry.id === entry.id && sa.view) { sa.showHud(); sa.view.open(id); return; }
  AtlasApp.open(entry, {state: {sel: id}});
}

/* ================= the atlas window ================= */
export class AtlasApp extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    classes: ['wca-app'],
    window: {title: 'City Atlas', icon: 'fa-solid fa-map-location-dot', resizable: true, minimizable: true},
    position: {width: 1320, height: 860}
  };
  constructor(entry, options = {}) {
    super(foundry.utils.mergeObject({id: `wca-atlas-${entry.id}`, window: {title: entry.name}}, options));
    this.entry = entry; this.pending = options.state || null;
  }
  get title() { return this.entry?.name || 'City Atlas'; }

  static open(entry, {state = null} = {}) {
    if (!game.user.isGM && !game.settings.get(MOD, 'playerWindow')) {
      // players use atlases only through their scenes
      const sa = SceneAtlas.current;
      if (sa && sa.entry.id === entry.id && sa.view) { sa.showHud(); if (state) sa.view.applyState(state); return null; }
      const sc = game.scenes.find(s => s.getFlag(MOD, 'atlas')?.entry === entry.id && s.visible !== false);
      ui.notifications.info(sc ? `${entry.name}: open the scene “${sc.name}” to use the atlas.` : L('UseScene', 'The atlas is used through its scene.'));
      return null;
    }
    const id = `wca-atlas-${entry.id}`; const existing = foundry.applications.instances.get(id);
    if (existing) { existing.bringToFront?.(); existing.maximize?.(); if (state && existing.view) existing.view.applyState(state); return existing; }
    const w = Math.min(1320, window.innerWidth - 80), h = Math.min(860, window.innerHeight - 60);
    const app = new AtlasApp(entry, {state, position: {width: w, height: h}});
    app.render({force: true}); return app;
  }

  async _renderHTML() { return null; }
  _replaceHTML(result, content) {
    if (this._mounted) return;
    this._mounted = true;
    content.innerHTML = `<div class="wca-boot">${L('Loading', 'Unrolling the map…')}</div>`;
    this._mount(content).catch(err => { console.error(`${MOD} |`, err); content.innerHTML = `<div class="wca-boot error">${esc(err.message)}</div>`; });
  }
  async _mount(content) {
    this.store = JournalStore.acquire(this.entry);
    await this.store.loadBasemap(resolveUrl);
    const root = document.createElement('div'); content.innerHTML = ''; content.appendChild(root);
    const canEdit = this.entry.isOwner;
    this.view = new AtlasView(root, {
      store: this.store, isGM: game.user.isGM, canEdit, viewer: {id: game.user.id, name: game.user.name}, atlasKey: `${game.world.id}:${this.entry.id}`,
      animate: game.settings.get(MOD, 'animate'), adapter: makeAdapter(this),
      editorFactory: canEdit ? v => new AtlasEditor(v, {}) : null
    });
    // Foundry content links inside the dossier
    root.addEventListener('click', async e => { const a = e.target.closest('a.content-link[data-uuid]'); if (!a) return; e.preventDefault(); e.stopPropagation(); const d = await fromUuid(a.dataset.uuid); if (d?.documentName === 'Scene') d.view(); else d?.sheet?.render(true); });
    // basemap path changes (e.g. after import) need a reload
    this._unsubBm = this.store.onChange(async info => { if ((info.all || info.meta) && this.store.atlas.basemap !== this._bm) { this._bm = this.store.atlas.basemap; await this.store.loadBasemap(resolveUrl); this.view.onStoreChange({basemap: true}); } });
    this._bm = this.store.atlas.basemap;
    if (this.pending) { this.view.applyState(this.pending); this.pending = null; }
    if (this.entry.isOwner) upgradeLooks(this.entry, this.store);
  }
  _onClose(options) { super._onClose?.(options); if (!SceneAtlas.current) resetUiTheme(); try { this._unsubBm?.(); this.view?.destroy(); } catch (e) {} this.store?.release(); this.store = null; this._mounted = false; }
}

/* ================= sharing a view with players ================= */
export function shareView(entry, state) {
  game.socket.emit(`module.${MOD}`, {action: 'show', entryId: entry.id, state, from: game.user.id});
  ui.notifications.info(L('Shared', 'Shown to the players who can see this atlas.'));
}
export function onSocket(msg) {
  if (msg && msg.action === 'breach') { import('./breach.js').then(m => m.showBreach({text: msg.text || ''})); return; }
  if (msg && msg.action === 'reveal') {
    if (game.user.isGM || (msg.ids && !msg.ids.includes(game.user.id))) return;
    const entry = game.journal.get(msg.entryId); if (!entry || !entry.testUserPermission(game.user, 'OBSERVER')) return;
    ui.notifications.info(`${entry.name}: ${msg.name ? `the Storyteller revealed “${msg.name}”.` : 'the Storyteller revealed something new.'}`);
    return;
  }
  if (!msg || msg.action !== 'show') return;
  const entry = game.journal.get(msg.entryId); if (!entry || !entry.testUserPermission(game.user, 'OBSERVER')) return;
  const sa = SceneAtlas.current;
  if (sa && sa.entry.id === entry.id && sa.view) { sa.showHud(); sa.view.applyState(msg.state); return; }
  if (!game.user.isGM && !game.settings.get(MOD, 'playerWindow')) { const sc = game.scenes.find(s => s.getFlag(MOD, 'atlas')?.entry === entry.id); if (sc) ui.notifications.info(`The Storyteller is showing something on “${sc.name}”.`); return; }
  AtlasApp.open(entry, {state: msg.state});
}

/* ================= launcher ================= */
export class AtlasLauncher extends ApplicationV2 {
  static DEFAULT_OPTIONS = {id: 'wca-launcher', classes: ['wca-launcher'], window: {title: 'City Atlas', icon: 'fa-solid fa-map-location-dot', resizable: true}, position: {width: 520, height: 'auto'}};
  static show() { const ex = foundry.applications.instances.get('wca-launcher'); if (ex) { ex.render(true); ex.bringToFront?.(); return ex; } const a = new AtlasLauncher(); a.render({force: true}); return a; }
  async _renderHTML() {
    if (!game.user.isGM && !game.settings.get(MOD, 'playerWindow')) {
      const scenes = game.scenes.filter(s => s.getFlag(MOD, 'atlas') && s.visible !== false);
      return `<div class="wcal">${scenes.length ? `<h3>${L('AtlasScenes', 'Atlas scenes')}</h3><ul class="wcal-list">${scenes.map(s => `<li><button type="button" data-scene="${s.id}"><i class="fa-solid fa-map"></i><span><b>${esc(s.name)}</b><small>${esc(game.journal.get(s.getFlag(MOD, 'atlas').entry)?.name || '')}</small></span></button></li>`).join('')}</ul>` : `<p class="hint">${L('NonePlayer', 'Your Storyteller hasn’t shared an atlas with you yet.')}</p>`}</div>`;
    }
    const list = game.journal.filter(e => isAtlasEntry(e) && e.visible);
    const presets = game.user.isGM ? await loadPresets() : [];
    const rows = list.map(e => `<li><button type="button" data-open="${e.id}"><i class="fa-solid fa-map"></i><span><b>${esc(e.name)}</b><small>${esc(metaDesc(e))}</small></span></button></li>`).join('');
    return `<div class="wcal">
      ${list.length ? `<h3>${L('Atlases', 'Atlases in this world')}</h3><ul class="wcal-list">${rows}</ul>` : `<p class="hint">${game.user.isGM ? L('NoneGM', 'No atlases yet. Start one below.') : L('NonePlayer', 'Your Storyteller hasn’t shared an atlas with you yet.')}</p>`}
      ${game.user.isGM ? `<h3>${L('New', 'New atlas')}</h3>
        <div class="wcal-new">
          ${presets.map(p => `<button type="button" data-preset="${esc(p.id)}"><i class="fa-solid fa-city"></i><span><b>${esc(p.title)}</b><small>${esc(p.description || '')}</small></span></button>`).join('')}
          <button type="button" data-new="image"><i class="fa-solid fa-image"></i><span><b>${L('FromImage', 'From a map picture')}</b><small>${L('FromImageHint', 'Use any city map image as the base, then add realms, pins and domains.')}</small></span></button>
          <button type="button" data-new="blank"><i class="fa-regular fa-file"></i><span><b>${L('Blank', 'Blank canvas')}</b><small>${L('BlankHint', 'An empty board to draw on.')}</small></span></button>
          <label class="wcal-import"><i class="fa-solid fa-file-import"></i><span><b>${L('Import', 'Import an atlas file')}</b><small>${L('ImportHint', 'A .json file exported from this module.')}</small></span><input type="file" accept=".json,application/json" hidden></label>
        </div>` : ''}
    </div>`;
  }
  _replaceHTML(result, content) { content.innerHTML = result; }
  _onRender() {
    const el = this.element;
    el.querySelectorAll('[data-scene]').forEach(b => b.addEventListener('click', () => { game.scenes.get(b.dataset.scene)?.view(); this.close(); }));
    el.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => { const e = game.journal.get(b.dataset.open); if (e) { AtlasApp.open(e); this.close(); } }));
    el.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => this.fromPreset(b.dataset.preset)));
    el.querySelectorAll('[data-new]').forEach(b => b.addEventListener('click', () => this.newAtlas(b.dataset.new)));
    el.querySelector('.wcal-import input')?.addEventListener('change', e => this.importFile(e.target.files[0]));
  }
  async fromPreset(id) {
    const p = (await loadPresets()).find(x => x.id === id); if (!p) return;
    const base = `modules/${MOD}/` + p.atlas.replace(/[^/]+$/, '');
    const atlas = rebasePaths(await (await fetch(resolveUrl(`modules/${MOD}/${p.atlas}`))).json(), base);
    await createAtlas(atlas); this.close();
  }
  async newAtlas(kind) {
    const content = `<div class="form-group"><label>${L('Name', 'Name')}</label><input type="text" name="title" value="${kind === 'image' ? 'Chicago by Night' : 'New city'}" autofocus></div>
      ${kind === 'image' ? `<div class="form-group"><label>${L('Picture', 'Map picture')}</label><div class="form-fields"><input type="text" name="src" placeholder="worlds/…/map.webp"><button type="button" class="wca-browse" data-tooltip="Browse"><i class="fa-solid fa-file-import"></i></button></div></div>` : ''}
      <div class="form-group stacked"><label>${L('Realms', 'Realms')}</label><div class="form-fields wca-realm-picks">${Object.entries(LOOKS).filter(([k]) => k !== 'blood').map(([k, v]) => `<label class="checkbox"><input type="checkbox" name="realm" value="${k}" ${k === 'waking' ? 'checked disabled' : ''}> ${esc(v.label)}</label>`).join('')}</div><p class="hint">${L('RealmsHint', 'Each realm is its own view of the same city. You can add, rename and restyle realms later.')}</p></div>`;
    const bind = root => { const b = root?.querySelector?.('.wca-browse'); if (!b || b._wca) return; b._wca = true; b.addEventListener('click', () => { const inp = root.querySelector('input[name=src]'); const FP = foundry.applications.apps.FilePicker.implementation; new FP({type: 'image', current: inp.value, callback: p => { inp.value = p; }}).render(true); }); };
    const hk = Hooks.once('renderDialogV2', (app, html) => bind(html instanceof HTMLElement ? html : app.element));
    const res = await DialogV2.wait({window: {title: L('New', 'New atlas')}, content, rejectClose: false, modal: true,
      render: (ev, dlg) => bind(dlg?.element ?? dlg),
      buttons: [{action: 'ok', label: L('Create', 'Create'), default: true, callback: (e, button) => { const f = button.form.elements; return {title: f.title.value.trim() || 'New city', src: f.src?.value?.trim(), realms: ['waking', ...[...button.form.querySelectorAll('input[name=realm]:checked:not(:disabled)')].map(i => i.value)]}; }}, {action: 'cancel', label: L('Cancel', 'Cancel')}]});
    Hooks.off('renderDialogV2', hk);
    if (!res || res === 'cancel') return;
    let image = null;
    if (kind === 'image') {
      if (!res.src) return ui.notifications.warn(L('NeedImage', 'Choose a map picture first.'));
      image = await new Promise(ok => { const im = new Image(); im.onload = () => ok({src: res.src, w: im.naturalWidth, h: im.naturalHeight}); im.onerror = () => ok(null); im.src = resolveUrl(res.src); });
      if (!image) return ui.notifications.error(L('BadImage', 'That picture could not be loaded.'));
    }
    const atlas = blankAtlas({title: res.title, image, realms: res.realms});
    await createAtlas(atlas); this.close();
  }
  async importFile(file) {
    if (!file) return; let data;
    try { data = JSON.parse(await file.text()); } catch (e) { return ui.notifications.error(L('BadJSON', 'That file is not valid JSON.')); }
    if (!data.realms && !data.places) return ui.notifications.error(L('NotAtlas', 'That file does not look like an atlas.'));
    await createAtlas(normalize(data)); this.close();
  }
}

/** A bundled preset's atlas, with its picture paths pointing into the module. */
async function presetAtlas(id) { const p = (await loadPresets()).find(x => x.id === id); if (!p) return null; return rebasePaths(await (await fetch(resolveUrl(`modules/${MOD}/${p.atlas}`))).json(), `modules/${MOD}/` + p.atlas.replace(/[^/]+$/, '')); }
const isLeadGM = () => game.user.isGM && (!game.users.activeGM || game.users.activeGM.isSelf);

/** A new version of the module brought a new look for an atlas made from the preset: offer it, once. */
const LOOKS_ASKED = new Set();
export async function upgradeLooks(entry, store) {
  try {
    if (!isLeadGM() || !store?.canEdit || LOOKS_ASKED.has(entry.id) || !fromPreset(store.atlas)) return false;
    LOOKS_ASKED.add(entry.id);
    const pre = normalize(await presetAtlas(store.atlas.preset || 'milwaukee') || {});
    if (!pre.looks || (store.atlas.looks || 0) >= pre.looks) return false;
    const plan = planLooks(store.atlas, pre, {realms: pre.looksRealms || null});
    if (!plan.items.length) { await store.setMeta(plan.meta); return false; }
    const names = (pre.looksRealms || Object.keys(pre.realms)).map(r => (store.atlas.realms[r] || pre.realms[r] || {}).name || r).join(', ');
    const ok = await DialogV2.confirm({window: {title: 'City Atlas: a new look'}, rejectClose: false, modal: true,
      content: `<p>This version of the City Atlas redraws <b>${esc(names)}</b>. Give <b>${esc(entry.name)}</b> the new look?</p><p class="hint">Only colours, effects and map styles change (${plan.items.length} entries). Texts, positions and what players can see stay as they are. You can do it later from <i>Edit → Import / export → Refresh realm looks</i>.</p>`,
      yes: {label: 'Use the new look'}, no: {label: 'Keep the old one'}});
    if (ok) { await applyLooks(store, plan); ui.notifications.info(`${entry.name}: ${names} now has its new look.`); return true; }
    await store.setMeta(plan.meta); return false;
  } catch (err) { console.warn(`${MOD} | could not update the atlas look`, err); return false; }
}

/** Upload a rendered map picture into the world's folder. */
export async function uploadPicture(entry, blob) {
  const dir = `worlds/${game.world.id}/wod-city-atlas`;
  await ensureDir(dir);
  return uploadFile(dir, new File([blob], `${entry.id}-base-${Date.now().toString(36)}.webp`, {type: 'image/webp'}));
}
export {isLeadGM};

async function loadPresets() { try { return await (await fetch(resolveUrl(`modules/${MOD}/presets/index.json`))).json(); } catch (e) { return []; } }
function metaDesc(e) { try { const m = JSON.parse(e.getFlag(MOD, 'meta') || '{}'); return m.description ? m.description.slice(0, 110) + (m.description.length > 110 ? '…' : '') : (m.projection === 'mercator' ? 'Geographic map' : 'Image map'); } catch (err) { return ''; } }

export async function createAtlas(atlas) {
  const folder = await atlasFolder();
  const own = game.settings.get(MOD, 'defaultOwnership');
  const levels = CONST.DOCUMENT_OWNERSHIP_LEVELS;
  const note = ui.notifications.info(L('Creating', 'Creating the atlas…'), {permanent: true});
  try {
    const entry = await JournalStore.create(atlas, {folder: folder?.id ?? null, ownership: levels[own] ?? levels.OBSERVER});
    ui.notifications.info(game.i18n.format?.('WCA.Created', {name: entry.name}) || `Created ${entry.name}.`);
    AtlasApp.open(entry); return entry;
  } finally { try { ui.notifications.remove?.(note); note?.remove?.(); } catch (e) {} }
}
async function atlasFolder() {
  const name = L('FolderName', 'City Atlases');
  return game.folders.find(f => f.type === 'JournalEntry' && f.name === name) || Folder.create({name, type: 'JournalEntry', color: '#5a1e24'});
}

/* ================= pick Actors to add as people ================= */
async function pickActors() {
  const actors = game.actors.filter(a => a.isOwner || game.user.isGM);
  if (!actors.length) { ui.notifications.warn(L('NoActors', 'There are no Actors in this world.')); return []; }
  const byFolder = new Map(); for (const a of actors) { const k = a.folder?.name || L('NoFolder', '(no folder)'); if (!byFolder.has(k)) byFolder.set(k, []); byFolder.get(k).push(a); }
  const content = `<div class="wca-actorpick">${[...byFolder].map(([f, arr]) => `<fieldset><legend><label><input type="checkbox" data-all> ${esc(f)}</label></legend>${arr.map(a => `<label class="checkbox"><input type="checkbox" name="a" value="${a.uuid}"><img src="${esc(a.img)}" alt=""> ${esc(a.name)}</label>`).join('')}</fieldset>`).join('')}</div>`;
  const res = await DialogV2.wait({window: {title: L('PickActors', 'Add people from Actors')}, content, rejectClose: false, position: {width: 460, height: 560},
    render: (ev, dlg) => { const root = dlg?.element ?? dlg; root?.querySelectorAll?.('[data-all]').forEach(c => c.addEventListener('change', () => c.closest('fieldset').querySelectorAll('input[name=a]').forEach(i => { i.checked = c.checked; }))); },
    buttons: [{action: 'ok', label: L('Add', 'Add'), default: true, callback: (e, button) => [...button.form.querySelectorAll('input[name=a]:checked')].map(i => i.value)}, {action: 'cancel', label: L('Cancel', 'Cancel')}]});
  if (!Array.isArray(res)) return [];
  return res.map(u => fromUuidSync(u)).filter(Boolean).map(a => ({uuid: a.uuid, name: a.name, img: a.img, kicker: actorKicker(a)}));
}
/** Best-effort clan/generation line for World of Darkness 20th edition actors; harmless for other systems. */
function actorKicker(a) {
  const s = a.system || {}; const pick = (...ks) => { for (const k of ks) { const v = foundry.utils.getProperty(s, k); if (v && typeof v !== 'object') return String(v); if (v && typeof v === 'object' && typeof v.value !== 'object' && v.value) return String(v.value); } return ''; };
  const clan = pick('clan', 'settings.clan', 'bio.clan', 'tribe', 'tradition', 'kith', 'guild');
  const gen = pick('generation', 'bio.generation');
  const ord = n => n + ((n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({1: 'st', 2: 'nd', 3: 'rd'}[n % 10] || 'th'));
  return [clan, gen && /^\d+$/.test(gen) ? `${ord(+gen)} generation` : gen].filter(Boolean).join(' · ') || undefined;
}
void svg;


/* ================= atlas → Foundry scene ================= */
async function ensureDir(path) {
  const FP = foundry.applications.apps.FilePicker.implementation; let cur = '';
  for (const part of path.split('/')) { cur = cur ? `${cur}/${part}` : part; try { await FP.createDirectory('data', cur, {}); } catch (e) { /* exists */ } }
}
async function uploadFile(dir, file) {
  const FP = foundry.applications.apps.FilePicker.implementation;
  const res = await FP.upload('data', dir, file, {}, {notify: false});
  if (!res || !res.path) throw new Error('Upload failed (check that you may upload files to the world folder).');
  return res.path;
}
function atlasScenes(entry) {
  if (!entry) return [];
  return game.scenes.filter(sc => sc.getFlag(MOD, 'atlas')?.entry === entry.id || String(sc.getFlag(MOD, 'key') || '').startsWith(entry.id + '|')).map(sc => ({id: sc.id, name: sc.name}));
}
/**
 * Create or update a live atlas scene. The scene stores only the atlas, the area it covers and the starting realm;
 * every client draws the atlas itself, for its own user. The background picture is just the plain map, used where
 * the module cannot draw (or for players who may not open the atlas).
 */
export async function exportScene(app, o) {
  const view = app.view, entry = app.entry; const prog = o.progress || (() => {});
  const c = view.cam, s0 = Math.pow(2, c.z), viewBB = [c.cx - c.W / 2 / s0, c.cy - c.H / 2 / s0, c.cx + c.W / 2 / s0, c.cy + c.H / 2 / s0];
  let bb = null;
  if (o.area === 'home') { const h = view.model.atlas.home; if (h && h.box) { const W = view.model.proj.toWorld, p = W(h.box[0]), q = W(h.box[1]); bb = [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; } }
  else if (o.area === 'all') bb = view.worldBB();
  if (!bb) bb = viewBB;
  // scale: Foundry's normal closest zoom (3×) should reach the atlas's closest zoom; keep the scene a sensible size
  const zmax = view.zr()[1], w0 = bb[2] - bb[0], h0 = bb[3] - bb[1], big = Math.max(w0, h0);
  let k = Math.pow(2, zmax) / 3; k = Math.min(k, 12000 / big); k = Math.max(k, 3000 / big);
  const W = Math.round(w0 * k), H = Math.round(h0 * k);
  const maxZoom = Math.min(16, Math.max(3, Math.pow(2, zmax) / k));
  prog('Rendering the plain map…');
  const snap = await renderSnapshot(view, {bb, size: Math.min(4096, Math.max(W, H)), bare: true, as: 'gm', labels: false});
  prog('Uploading…');
  const path = await uploadPicture(entry, snap.blob);
  prog('Building the scene…');
  let scene = o.sceneId ? game.scenes.get(o.sceneId) : null;
  const flag = {entry: entry.id, bb, realm: view.st.realm, level: view.st.level, bgRealm: view.st.realm, bgLevel: view.st.level, lock: !!o.lock, maxZoom, v: 3, sig: lookSig(view.model, view.st.realm, view.st.level)};
  const data = {name: o.name || entry.name, width: W, height: H, padding: 0.1, background: {src: path}, backgroundColor: view.rv.bg || '#000000',
    grid: {type: 0}, tokenVision: false, fog: {exploration: false}, environment: {darknessLevel: 0, globalLight: {enabled: true}}, flags: {[MOD]: {atlas: flag}}};
  if (scene) {
    const upd = Object.assign({}, data); if (scene.getFlag(MOD, 'key')) upd[`flags.${MOD}.-=key`] = null;
    await scene.update(upd);
    const old = scene.notes.filter(n => n.getFlag(MOD, 'item')).map(n => n.id); // map notes from version 1.1
    if (old.length) await scene.deleteEmbeddedDocuments('Note', old);
  } else scene = await Scene.create(Object.assign({navigation: true}, data));
  if (o.activate) await scene.activate(); else await scene.view();
  ui.notifications.info(`Scene “${scene.name}” is ready. Each player sees it with their own access.`);
  return scene;
}
