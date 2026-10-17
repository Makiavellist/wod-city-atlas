/* World of Darkness City Atlas — entry point for Foundry VTT v13. */
import {AtlasApp, AtlasLauncher, createAtlas, onSocket, resolveUrl} from './foundry/app.js';
import {JournalStore, MOD, isAtlasEntry} from './foundry/journal-store.js';
import {rebasePaths} from './core/store.js';
import {blankAtlas} from './core/templates.js';

Hooks.once('init', () => {
  game.settings.register(MOD, 'animate', {name: 'WCA.SettingAnimate', hint: 'WCA.SettingAnimateHint', scope: 'client', config: true, type: Boolean, default: true});
  game.settings.register(MOD, 'openJournalAsAtlas', {name: 'WCA.SettingOpenJournal', hint: 'WCA.SettingOpenJournalHint', scope: 'world', config: true, type: Boolean, default: true});
  game.settings.register(MOD, 'defaultOwnership', {name: 'WCA.SettingOwnership', hint: 'WCA.SettingOwnershipHint', scope: 'world', config: true, type: String, default: 'OBSERVER',
    choices: {NONE: 'WCA.OwnNone', LIMITED: 'WCA.OwnLimited', OBSERVER: 'WCA.OwnObserver'}});
  game.settings.register(MOD, 'sceneControl', {name: 'WCA.SettingControl', hint: 'WCA.SettingControlHint', scope: 'world', config: true, type: Boolean, default: true, requiresReload: true});
});

Hooks.once('init', () => {
  // A second, always-available way in: Game Settings → Configure Settings → World of Darkness City Atlas → "Open the atlas launcher".
  game.settings.registerMenu(MOD, 'launcher', {name: 'WCA.Open', label: 'WCA.OpenLauncher', hint: 'WCA.OpenLauncherHint', icon: 'fa-solid fa-map-location-dot', type: AtlasLauncher, restricted: false});
  game.keybindings.register(MOD, 'open', {name: 'WCA.Open', hint: 'WCA.KeyHint', editable: [{key: 'KeyM', modifiers: ['Alt']}], onDown: () => { AtlasLauncher.show(); return true; }});
});

Hooks.once('ready', () => {
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
    JournalStore, isAtlasEntry
  };
});

/* Map tool in the scene controls (Journal Notes group). */
Hooks.on('getSceneControlButtons', controls => {
  if (!game.settings.get(MOD, 'sceneControl')) return;
  const group = controls.notes || controls.tokens; if (!group || !group.tools) return;
  group.tools.wcaAtlas = {name: 'wcaAtlas', title: 'WCA.Open', icon: 'fa-solid fa-map-location-dot', order: Object.keys(group.tools).length, button: true, visible: true,
    onChange: () => AtlasLauncher.show()};
});

/* A "City Atlas" button at the top of the Journal sidebar. */
Hooks.on('renderJournalDirectory', (app, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0]; if (!root || root.querySelector('.wca-dir-btn')) return;
  const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'wca-dir-btn';
  btn.innerHTML = `<i class="fa-solid fa-map-location-dot"></i> ${game.i18n.localize('WCA.Button')}`;
  btn.addEventListener('click', ev => { ev.preventDefault(); AtlasLauncher.show(); });
  const host = root.querySelector('.header-actions') || root.querySelector('.directory-header') || root;
  host.appendChild(btn);
});

/* Opening an atlas journal entry opens the map instead of the data pages. */
Hooks.on('renderJournalEntrySheet', (app, html) => {
  const entry = app.document; if (!isAtlasEntry(entry) || !game.settings.get(MOD, 'openJournalAsAtlas')) return;
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


/* Atlas scenes: double-clicking a map note opens the atlas at that place; notes are shown without toggling the Notes layer. */
Hooks.on('activateNote', (note) => {
  const f = note?.document?.flags?.[MOD]; if (!f || !f.item) return;
  const entry = game.journal.get(f.entry); if (!entry) return;
  AtlasApp.open(entry, {state: {sel: f.item}});
  return false;
});
Hooks.on('canvasReady', (cv) => {
  try { if (cv.scene?.getFlag(MOD, 'key') && !game.settings.get('core', 'notesDisplayToggle')) game.settings.set('core', 'notesDisplayToggle', true); } catch (e) { /* setting missing in this version */ }
});
