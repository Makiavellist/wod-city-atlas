/* Foundry VTT v13 application windows: the atlas itself and the launcher that lists, creates and imports atlases. */
import {AtlasView} from '../core/view.js';
import {AtlasEditor} from '../core/editor.js';
import {rebasePaths} from '../core/store.js';
import {normalize} from '../core/model.js';
import {blankAtlas, LOOKS} from '../core/templates.js';
import {esc, svg} from '../core/util.js';
import {renderSnapshot, pinSvg} from '../core/snapshot.js';
import {JournalStore, MOD, isAtlasEntry} from './journal-store.js';

const {ApplicationV2, DialogV2} = foundry.applications.api;
const L = (k, d) => { const s = game.i18n.localize(`WCA.${k}`); return s === `WCA.${k}` ? d : s; };

/* ================= Foundry adapter for the framework-free view ================= */
export function resolveUrl(src) {
  if (!src || /^(https?:|data:|blob:)/.test(src)) return src;
  try { return foundry.utils.getRoute(src.replace(/^\//, '')); } catch (e) { return src; }
}
function makeAdapter(app) {
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
    pickActors: () => pickActors(),
    players: () => game.users.filter(u => !u.isGM).map(u => ({id: u.id, name: u.name, color: u.color?.css ?? String(u.color || '')})),
    notifyReveal: game.user.isGM ? ({ids, name}) => game.socket.emit(`module.${MOD}`, {action: 'reveal', entryId: app.entry.id, ids, name}) : null,
    exportScene: game.user.isGM ? opts => exportScene(app, opts) : null
  };
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
    this.store = new JournalStore(this.entry);
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
    this.store.onChange(async info => { if ((info.all || info.meta) && this.store.atlas.basemap !== this._bm) { this._bm = this.store.atlas.basemap; await this.store.loadBasemap(resolveUrl); this.view.onStoreChange({basemap: true}); } });
    this._bm = this.store.atlas.basemap;
    if (this.pending) { this.view.applyState(this.pending); this.pending = null; }
  }
  _onClose(options) { super._onClose?.(options); try { this.view?.destroy(); } catch (e) {} this.store?.detach(); }
}

/* ================= sharing a view with players ================= */
export function shareView(entry, state) {
  game.socket.emit(`module.${MOD}`, {action: 'show', entryId: entry.id, state, from: game.user.id});
  ui.notifications.info(L('Shared', 'Shown to the players who can see this atlas.'));
}
export function onSocket(msg) {
  if (msg && msg.action === 'reveal') {
    if (game.user.isGM || (msg.ids && !msg.ids.includes(game.user.id))) return;
    const entry = game.journal.get(msg.entryId); if (!entry || !entry.testUserPermission(game.user, 'OBSERVER')) return;
    ui.notifications.info(`${entry.name}: ${msg.name ? `the Storyteller revealed “${msg.name}”.` : 'the Storyteller revealed something new.'}`);
    return;
  }
  if (!msg || msg.action !== 'show') return;
  const entry = game.journal.get(msg.entryId); if (!entry || !entry.testUserPermission(game.user, 'OBSERVER')) return;
  AtlasApp.open(entry, {state: msg.state});
}

/* ================= launcher ================= */
export class AtlasLauncher extends ApplicationV2 {
  static DEFAULT_OPTIONS = {id: 'wca-launcher', classes: ['wca-launcher'], window: {title: 'City Atlas', icon: 'fa-solid fa-map-location-dot', resizable: true}, position: {width: 520, height: 'auto'}};
  static show() { const ex = foundry.applications.instances.get('wca-launcher'); if (ex) { ex.render(true); ex.bringToFront?.(); return ex; } const a = new AtlasLauncher(); a.render({force: true}); return a; }
  async _renderHTML() {
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
/** Render the current realm/level of an open atlas to a picture and create or refresh a Scene with map notes. */
export async function exportScene(app, o) {
  const view = app.view, entry = app.entry; const prog = o.progress || (() => {});
  prog('Rendering the picture…');
  const snap = await renderSnapshot(view, o);
  const dir = `worlds/${game.world.id}/wod-city-atlas`;
  await ensureDir(dir); await ensureDir(`${dir}/icons`);
  prog('Uploading…');
  const key = `${entry.id}|${view.st.realm}|${view.st.level}|${o.as}`;
  const fname = `${entry.id}-${view.st.realm}-${view.st.level}-${(o.as && o.as !== '*' ? o.as : 'all').replace(/\W/g, '')}-${Date.now().toString(36)}.webp`;
  const path = await uploadFile(dir, new File([snap.blob], fname, {type: 'image/webp'}));
  const icons = {};
  for (const g of new Set(snap.places.map(p => p.icon))) icons[g] = await uploadFile(`${dir}/icons`, new File([pinSvg(g)], `pin-${g}.svg`, {type: 'image/svg+xml'}));
  prog('Building the scene…');
  let scene = game.scenes.find(sc => sc.getFlag(MOD, 'key') === key);
  const data = {name: o.name || entry.name, width: snap.width, height: snap.height, padding: 0, background: {src: path}, backgroundColor: view.rv.bg || '#000000',
    grid: {type: 0}, tokenVision: false, fog: {exploration: false}, flags: {[MOD]: {key, entry: entry.id, realm: view.st.realm, level: view.st.level, as: o.as}}};
  if (scene) await scene.update(data); else scene = await Scene.create(Object.assign({navigation: true}, data));
  const old = scene.notes.filter(n => n.getFlag(MOD, 'item')).map(n => n.id);
  if (old.length) await scene.deleteEmbeddedDocuments('Note', old);
  if (o.notes !== false && snap.places.length) {
    const size = Math.max(32, Math.round(Math.max(snap.width, snap.height) / 110));
    const notes = snap.places.map(p => ({x: Math.round(p.x), y: Math.round(p.y), text: p.name, texture: {src: icons[p.icon], tint: p.color}, iconSize: size, fontSize: Math.round(size * 0.55),
      textAnchor: CONST.TEXT_ANCHOR_POINTS?.BOTTOM ?? 1, global: true, flags: {[MOD]: {entry: entry.id, item: p.id}}}));
    for (let i = 0; i < notes.length; i += 100) await scene.createEmbeddedDocuments('Note', notes.slice(i, i + 100));
  }
  if (o.activate) await scene.activate(); else await scene.view();
  ui.notifications.info(`Scene “${scene.name}” is ready.`);
  return scene;
}
