/* World of Darkness City Atlas — entry point for Foundry VTT v13. */
import {AtlasApp, AtlasLauncher, createAtlas, onSocket, resolveUrl, findPeopleByActor, openInAtlas} from './foundry/app.js';
import {SceneAtlas, showDiagnosis} from './foundry/scene-layer.js';
import {JournalStore, MOD, isAtlasEntry} from './foundry/journal-store.js';
import {rebasePaths} from './core/store.js';
import {blankAtlas} from './core/templates.js';
import {Clock, registerClockSettings} from './foundry/clock.js';
import {CalendarApp, Events, registerCalendarSettings} from './foundry/calendar.js';
import {broadcastBreach, showBreach} from './foundry/breach.js';

Hooks.once('init', () => {
  game.settings.register(MOD, 'animate', {name: 'WCA.SettingAnimate', hint: 'WCA.SettingAnimateHint', scope: 'client', config: true, type: Boolean, default: true});
  game.settings.register(MOD, 'openJournalAsAtlas', {name: 'WCA.SettingOpenJournal', hint: 'WCA.SettingOpenJournalHint', scope: 'world', config: true, type: Boolean, default: true});
  game.settings.register(MOD, 'defaultOwnership', {name: 'WCA.SettingOwnership', hint: 'WCA.SettingOwnershipHint', scope: 'world', config: true, type: String, default: 'OBSERVER',
    choices: {NONE: 'WCA.OwnNone', LIMITED: 'WCA.OwnLimited', OBSERVER: 'WCA.OwnObserver'}});
  game.settings.register(MOD, 'playerWindow', {name: 'WCA.SettingPlayerWindow', hint: 'WCA.SettingPlayerWindowHint', scope: 'world', config: true, type: Boolean, default: false});
  game.settings.register(MOD, 'partyVisible', {name: 'Players see each other on the atlas', hint: 'Each player’s character has a portrait pin on atlas scenes. Off: players only see their own (the Storyteller sees all).', scope: 'world', config: true, type: Boolean, default: true});
  game.settings.register(MOD, 'vtmTheme', {name: 'Masquerade look for Foundry', hint: 'Restyles Foundry’s own interface (sidebar, chat, windows, controls) in black, bone and blood. Character sheets are not touched.', scope: 'client', config: true, type: Boolean, default: true, onChange: v => document.body.classList.toggle('wca-vtm', !!v)});
  registerClockSettings();
  registerCalendarSettings();
  Hooks.on('wcaOpenCalendar', () => CalendarApp.show());
  game.settings.register(MOD, 'sceneControl', {name: 'WCA.SettingControl', hint: 'WCA.SettingControlHint', scope: 'world', config: true, type: Boolean, default: true, requiresReload: true});
});

Hooks.once('init', () => {
  // A second, always-available way in: Game Settings → Configure Settings → World of Darkness City Atlas → "Open the atlas launcher".
  game.settings.registerMenu(MOD, 'launcher', {name: 'WCA.Open', label: 'WCA.OpenLauncher', hint: 'WCA.OpenLauncherHint', icon: 'fa-solid fa-map-location-dot', type: AtlasLauncher, restricted: false});
  game.keybindings.register(MOD, 'open', {name: 'WCA.Open', hint: 'WCA.KeyHint', editable: [{key: 'KeyM', modifiers: ['Alt']}], onDown: () => { if (SceneAtlas.current) SceneAtlas.current.toggleHud(); else AtlasLauncher.show(); return true; }});
});

Hooks.once('setup', () => { try { document.body.classList.toggle('wca-vtm', !!game.settings.get(MOD, 'vtmTheme')); } catch (e) {} });

Hooks.once('ready', () => {
  try { document.body.classList.toggle('wca-vtm', !!game.settings.get(MOD, 'vtmTheme')); Clock.render(); } catch (e) { console.error(`${MOD} | clock`, e); }
  console.log(`${MOD} | ready — open the City Atlas from the Journal sidebar, the Journal Notes tools, Alt+M, or game.modules.get('${MOD}').api.open()`);
  game.socket.on(`module.${MOD}`, onSocket);
  const mod = game.modules.get(MOD);
  mod.api = {
    /** Open the launcher, or a specific atlas by JournalEntry, id or name. */
    open(target) {
      if (!target) return AtlasLauncher.show();
      const e = typeof target === 'string' ? (game.journal.get(target) || game.journal.getName(target)) : target;
      if (!isAtlasEntry(e)) return ui.notifications.warn(`${MOD} | “${target}” is not an atlas.`);
      return AtlasApp.open(e);
    },
    launcher: () => AtlasLauncher.show(),
    /** Create an atlas from a bundled preset ("milwaukee"). */
    async createFromPreset(id = 'milwaukee') {
      const list = await (await fetch(resolveUrl(`modules/${MOD}/presets/index.json`))).json();
      const p = list.find(x => x.id === id); if (!p) throw new Error(`Unknown preset ${id}`);
      const atlas = rebasePaths(await (await fetch(resolveUrl(`modules/${MOD}/${p.atlas}`))).json(), `modules/${MOD}/` + p.atlas.replace(/[^/]+$/, ''));
      return createAtlas(atlas);
    },
    createBlank: opts => createAtlas(blankAtlas(opts || {})),
    importAtlas: data => createAtlas(data),
    /** The live atlas drawn on the current scene, if any. */
    get scene() { return SceneAtlas.current; },
    /** Why does an atlas scene look wrong? Run in the console (F12) and send the result. */
    diagnose() { const d = SceneAtlas.current?.diagnose() ?? {mounted: false, version: game.modules.get(MOD)?.version, foundry: game.version, sceneFlag: canvas?.scene?.getFlag(MOD, 'atlas') ?? null}; console.log(`${MOD} | diagnose ${JSON.stringify(d)}`); showDiagnosis(d); return d; },
    /** The chronicle clock: api.clock.advance(60), api.clock.set(Date.UTC(1991, 9, 31, 22, 0)), api.clock.nextDusk(). */
    clock: Clock,
    /** The chronicle calendar: api.calendar.show(), api.events.visible(). */
    calendar: CalendarApp, events: Events,
    /** The red alert: api.breach() for everyone (GM), api.breach(true) to add a line of text. */
    breach: withText => broadcastBreach(withText), showBreach,
    JournalStore, isAtlasEntry
  };
});

/* Map tool in the scene controls (Journal Notes group). */
Hooks.on('getSceneControlButtons', controls => {
  if (!game.settings.get(MOD, 'sceneControl')) return;
  const group = controls.notes || controls.tokens; if (!group || !group.tools) return;
  group.tools.wcaAtlas = {name: 'wcaAtlas', title: 'WCA.Open', icon: 'fa-solid fa-map-location-dot', order: Object.keys(group.tools).length, button: true, visible: true,
    onChange: () => { if (SceneAtlas.current) SceneAtlas.current.toggleHud(); else AtlasLauncher.show(); }};
  // players mostly sit on the Token controls: give them the dossier there too
  const tok = controls.tokens;
  if (tok && tok.tools && tok !== group) tok.tools.wcaHud = {name: 'wcaHud', title: 'WCA.Dossier', icon: 'fa-solid fa-book-atlas', order: Object.keys(tok.tools).length, button: true, visible: true,
    onChange: () => { if (SceneAtlas.current) SceneAtlas.current.toggleHud(); else AtlasLauncher.show(); }};
});

/* The Storyteller's "MASQUERADE VIOLATION" alarm, on the Token and Notes tool columns (works with or without an atlas). */
Hooks.on('getSceneControlButtons', controls => {
  if (!game.user.isGM) return;
  for (const g of [controls.tokens, controls.notes]) {
    if (!g || !g.tools) continue;
    g.tools.wcaBreach = {name: 'wcaBreach', title: 'Masquerade violation! (shows on every screen; Shift-click to add a line)', icon: 'fa-solid fa-masks-theater wca-breach-tool', order: 900, button: true, visible: true,
      onChange: (event) => broadcastBreach(!!event?.shiftKey)};
  }
});

/* A "City Atlas" button at the top of the Journal sidebar. */
Hooks.on('renderJournalDirectory', (app, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0]; if (!root) return;
  if (!game.user.isGM) hideAtlasEntries(root);
  if (root.querySelector('.wca-dir-btn')) return;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'wca-dir-btn';
  btn.innerHTML = `<i class="fa-solid fa-map-location-dot"></i> ${game.i18n.localize('WCA.Button')}`;
  btn.addEventListener('click', ev => { ev.preventDefault(); AtlasLauncher.show(); });
  const host = root.querySelector('.header-actions') || root.querySelector('.directory-header') || root;
  host.appendChild(btn);
});

/* Opening an atlas journal entry opens the map instead of the data pages. */
Hooks.on('renderJournalEntrySheet', (app, html) => {
  const entry = app.document; if (!isAtlasEntry(entry)) return;
  if (!game.user.isGM && !game.settings.get(MOD, 'playerWindow')) {
    // players only reach an atlas through its scene
    if (app._wcaRedirected) return; app._wcaRedirected = true;
    setTimeout(() => app.close({animate: false}), 0);
    if (SceneAtlas.current?.entry?.id === entry.id) SceneAtlas.current.showHud(); else ui.notifications.info(game.i18n.localize('WCA.UseScene'));
    return;
  }
  if (!game.settings.get(MOD, 'openJournalAsAtlas')) return;
  if (app._wcaRedirected) return; app._wcaRedirected = true;
  AtlasApp.open(entry);
  setTimeout(() => app.close({animate: false}), 0);
});

/* Context menu entry for atlases in the Journal directory. */
Hooks.on('getJournalEntryContextOptions', (app, options) => {
  options.unshift({name: 'WCA.OpenMap', icon: '<i class="fa-solid fa-map-location-dot"></i>',
    condition: li => { const id = (li instanceof HTMLElement ? li : li[0])?.dataset?.entryId; return isAtlasEntry(game.journal.get(id)); },
    callback: li => { const id = (li instanceof HTMLElement ? li : li[0])?.dataset?.entryId; const e = game.journal.get(id); if (e) AtlasApp.open(e); }});
});


/* Atlas scenes: the atlas is drawn live on the scene for each user. */
let ORIG_MAX_ZOOM = null;
Hooks.on('canvasInit', cv => {
  // Let atlas scenes zoom in further, but only where Foundry has a numeric CONFIG.Canvas.maxZoom to adjust.
  // (Never write anything that is not a finite number: an invalid value breaks the camera of every scene.)
  try {
    const C = CONFIG.Canvas; if (!C) return;
    if ('maxZoom' in C && !Number.isFinite(C.maxZoom)) { if (Number.isFinite(ORIG_MAX_ZOOM)) C.maxZoom = ORIG_MAX_ZOOM; else delete C.maxZoom; }
    if (ORIG_MAX_ZOOM === null && Number.isFinite(C.maxZoom)) ORIG_MAX_ZOOM = C.maxZoom;
    if (!Number.isFinite(ORIG_MAX_ZOOM)) return;
    const f = cv?.scene?.getFlag(MOD, 'atlas'), want = f && Number(f.maxZoom);
    C.maxZoom = Number.isFinite(want) && want > ORIG_MAX_ZOOM ? want : ORIG_MAX_ZOOM;
  } catch (e) {}
});
Hooks.on('canvasReady', () => { SceneAtlas.sync(); });
Hooks.on('canvasTearDown', () => { SceneAtlas.teardown(); });
Hooks.on('updateScene', (scene, changed) => { if (scene === canvas?.scene && changed?.flags?.[MOD] !== undefined) SceneAtlas.sync(); });
Hooks.on('updateJournalEntry', (entry, changed) => { if (changed?.ownership && SceneAtlas.current?.entry?.id !== entry.id && canvas?.scene?.getFlag(MOD, 'atlas')?.entry === entry.id) SceneAtlas.sync(); });

/* Map notes left from version 1.1 scenes still open the atlas. */
Hooks.on('activateNote', (note) => {
  const f = note?.document?.flags?.[MOD]; if (!f || !f.item) return;
  const entry = game.journal.get(f.entry); if (!entry) return;
  openInAtlas(entry, f.item);
  return false;
});

/* Actors tab: "Show in City Atlas" for Actors linked to a person in an atlas. */
const liId = li => (li instanceof HTMLElement ? li : li?.[0])?.dataset?.entryId;
const actorContext = (app, options) => {
  options.push({name: 'WCA.ShowInAtlas', icon: '<i class="fa-solid fa-map-location-dot"></i>',
    condition: li => { const a = game.actors.get(liId(li)); return !!a && findPeopleByActor(a.uuid).length > 0; },
    callback: li => { const a = game.actors.get(liId(li)); const hit = a && findPeopleByActor(a.uuid)[0]; if (hit) openInAtlas(hit.entry, hit.id); }});
};
Hooks.on('getActorContextOptions', actorContext);
Hooks.on('getActorDirectoryEntryContext', actorContext);
/* Older-style (Application v1) actor sheets get a header button too. */
Hooks.on('getActorSheetHeaderButtons', (sheet, buttons) => {
  const a = sheet.actor || sheet.document; if (!a) return; const hit = findPeopleByActor(a.uuid)[0]; if (!hit) return;
  buttons.unshift({label: game.i18n.localize('WCA.AtlasShort'), class: 'wca-atlas', icon: 'fa-solid fa-map-location-dot', onclick: () => openInAtlas(hit.entry, hit.id)});
});

/** Players never see atlas journal entries in the Journal tab (nor a folder that holds only atlases). */
function hideAtlasEntries(root) {
  if (game.settings.get(MOD, 'playerWindow')) return;
  for (const li of root.querySelectorAll('[data-entry-id]')) { if (isAtlasEntry(game.journal.get(li.dataset.entryId))) li.remove(); }
  for (const f of [...root.querySelectorAll('.folder[data-folder-id], [data-folder-id].directory-item')].reverse()) {
    const sub = f.querySelector('.subdirectory, ol, ul'); const folder = game.folders.get?.(f.dataset.folderId) ?? game.folders.find?.(x => x.id === f.dataset.folderId);
    const hasAtlas = folder ? game.journal.filter(e => e.folder?.id === folder.id).some(isAtlasEntry) : false;
    if (hasAtlas && !(sub || f).querySelector('[data-entry-id]')) f.remove();
  }
}
