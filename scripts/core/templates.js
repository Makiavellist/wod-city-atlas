/* Look presets for realms and starter content for new atlases. */
import {DEFAULT_THEME} from './model.js';

export const LOOKS = {
  waking: {label: 'Waking city (night)', icon: 'sun', bg: '#18151c', theme: {}, effects: [], filter: '',
    crossLabel: 'Return to the waking city'},
  dream: {label: 'Dreaming (violet, starlit)', icon: 'moon', bg: '#140f28', filter: 'sepia(.4) hue-rotate(205deg) saturate(1.3) brightness(.48) contrast(1.15)', crossLabel: 'Cross into the Dreaming',
    theme: {panel: '#140f25', panel2: '#1d1636', line: '#33295a', accent: '#a585ff', gold: '#ffd98a', muted: '#a59cc4', faint: '#6f6696', bone: '#efe9ff', accentLine: 'rgba(165,133,255,.55)', accentSoft: '#cdb9ff', segOn: '#3a2c6e', segOnFg: '#fff3d6', glow: 'rgba(165,133,255,.16)', chrome: 'rgba(22,15,44,.94)', pinBg: ['#2a2150', '#100b22'], pinGlow: true, labelHalo: '#120b26'},
    effects: [{type: 'particles', shape: 'glow', count: 50, colors: ['255,226,160', '206,188,255'], speed: 0.008, dir: 'up', drift: 20}, {type: 'vignette', color: 'rgba(10,6,24,.55)'}]},
  shadow: {label: 'Shadowlands (grey, ash)', icon: 'skull', bg: '#121614', filter: 'grayscale(.9) brightness(.42) contrast(1.2) sepia(.2) hue-rotate(100deg)', crossLabel: 'Cross the Shroud',
    theme: {panel: '#121614', panel2: '#1a1f1c', line: '#2c3430', accent: '#9fd0c4', gold: '#e6dcc4', muted: '#9aa59f', faint: '#69736e', bone: '#e6e8e2', accentLine: 'rgba(159,208,196,.45)', accentSoft: '#bfe0d8', segOn: '#2b3631', segOnFg: '#eef2ea', glow: 'rgba(160,200,190,.08)', chrome: 'rgba(16,20,18,.95)', pinBg: ['#232a27', '#0b0e0d'], labelHalo: '#0b0e0d'},
    effects: [{type: 'particles', shape: 'dot', count: 46, color: 'rgba(200,205,198,.22)', speed: 0.02, dir: 'down', drift: 30}, {type: 'vignette', color: 'rgba(8,10,9,.6)'}]},
  umbra: {label: 'Umbra (old woods)', icon: 'paw', bg: '#0a140c', filter: 'sepia(.55) hue-rotate(50deg) saturate(.9) brightness(.42) contrast(1.15)', crossLabel: 'Step sideways into the Umbra',
    theme: {"panel": "#0f190f", "panel2": "#152216", "line": "#2f3b22", "accent": "#b6a85a", "gold": "#e2b65e", "muted": "#9ca27e", "faint": "#616a4a", "bone": "#ece4c8", "accentLine": "rgba(182,168,90,.45)", "accentSoft": "#d8d09a", "segOn": "#2c3b1d", "segOnFg": "#f5eed2", "glow": "rgba(226,182,94,.12)", "chrome": "rgba(14,21,12,.95)", "pinBg": ["#2c2b17", "#0b1009"], "labelHalo": "#060b06"},
    effects: [{"type": "gradient", "kind": "radial", "at": [0.48, 0.5], "r": 0.9, "stops": [[0, "rgba(58,80,38,.30)"], [0.6, "rgba(24,38,20,.14)"], [1, "rgba(2,5,2,0)"]], "under": true}, {"type": "forest", "under": true, "count": 2600, "avoid": ["lake"], "clear": 0.3, "maxZoom": 15.6, "alpha": 0.96, "colors": [["#0b1b0e", "#173219", "#3f5a2b"], ["#0c1d15", "#183323", "#465e31"], ["#111e0c", "#223614", "#5a6630"]]}, {"type": "gradient", "kind": "radial", "at": [0.86, 0.1], "r": 0.55, "stops": [[0, "rgba(236,224,180,.07)"], [1, "rgba(0,0,0,0)"]], "under": true}, {"type": "waves", "clip": "lake", "count": 6, "color": "rgba(160,180,150,.028)", "width": 26}, {"type": "mist", "count": 5, "color": "rgba(170,190,160,.055)", "speed": 1}, {"type": "canopy", "count": 14, "color": "rgba(2,6,3,.38)"}, {"type": "particles", "shape": "glow", "count": 30, "colors": ["226,182,94", "200,214,128", "236,206,140"], "speed": 0.004, "dir": "up", "drift": 40, "layer": "motes"}, {"type": "particles", "shape": "leaf", "count": 18, "colors": ["rgba(184,152,64,.62)", "rgba(146,84,34,.58)", "rgba(102,128,54,.58)"], "speed": 0.009, "dir": "down", "drift": 70, "layer": "motes"}, {"type": "grain", "alpha": 0.08}, {"type": "vignette", "color": "rgba(2,5,2,.86)", "inner": 0.22}]},
  under: {label: 'Underground (sepia, dripping)', icon: 'door', bg: '#0e0c0a', filter: 'sepia(.8) brightness(.3) contrast(1.3)', crossLabel: 'Go down below',
    theme: {panel: '#141110', panel2: '#1c1815', line: '#3a322a', accent: '#e0a45c', gold: '#f0c47a', muted: '#ab9d8a', faint: '#6e6458', bone: '#f2e8da', accentLine: 'rgba(224,164,92,.45)', accentSoft: '#f6cf92', segOn: '#4e3b24', segOnFg: '#fff1dc', glow: 'rgba(224,164,92,.10)', chrome: 'rgba(22,18,14,.95)', pinBg: ['#3a2c1e', '#120d08'], labelHalo: '#0e0a06'},
    effects: [{type: 'particles', shape: 'streak', count: 60, color: 'rgba(160,190,210,.25)', speed: 0.05, dir: 'down'}, {type: 'vignette', color: 'rgba(0,0,0,.6)'}]},
  blood: {label: 'Blood-red (Sabbat / Gehenna)', icon: 'drop', bg: '#140708', filter: 'sepia(1) hue-rotate(-40deg) saturate(2.2) brightness(.5)', crossLabel: 'Descend',
    theme: {panel: '#160a0b', panel2: '#221012', line: '#3e1c1e', accent: '#e0303c', gold: '#ffb38a', muted: '#c49a98', faint: '#7a5554', bone: '#fbe9e6', accentLine: 'rgba(224,48,60,.55)', accentSoft: '#ff9aa0', segOn: '#5a1a1e', segOnFg: '#fff0ee', glow: 'rgba(224,48,60,.16)', chrome: 'rgba(26,10,12,.95)', pinBg: ['#3a1416', '#120607'], labelHalo: '#120607'},
    effects: [{type: 'particles', shape: 'dot', count: 30, color: 'rgba(255,90,90,.25)', speed: 0.015, dir: 'down', drift: 10}, {type: 'vignette', color: 'rgba(20,0,0,.6)'}]}
};

/** Apply a look preset to a realm (or level) object, mutating it. For image maps the same picture is restyled with a CSS filter. */
export function applyLook(target, key, {imageMap = false} = {}) {
  const L = LOOKS[key]; if (!L) return target;
  target.bg = L.bg; target.theme = Object.assign({}, L.theme); target.effects = JSON.parse(JSON.stringify(L.effects)); target.icon ||= L.icon; target.crossLabel ||= L.crossLabel;
  if (imageMap) { target.background = Object.assign({}, target.background || {}, {filter: L.filter || undefined}); if (!L.filter) delete target.background.filter; }
  return target;
}

export const WOD_CATEGORIES = [
  ['haven', 'Havens', 'haven', null], ['elysium', 'Elysium & neutral ground', 'ankh', '#e8dcc4'], ['court', 'Seats of power', 'crown', '#d8b45a'],
  ['hunt', 'Hunting grounds', 'drop', '#c43a3a'], ['occult', 'Occult sites', 'eye', '#9b7fd1'], ['threat', 'Hunters & mortal threats', 'cross', '#e86a3a'],
  ['garou', 'Garou & caerns', 'claw', '#8fa3b8'], ['battle', 'Battlegrounds', 'swords', '#c43a3a'], ['transit', 'Ways in & out', 'gate', '#b9b0a2'], ['story', 'Story & history', 'hour', '#b9b0a2']
];
export const WOD_FACTIONS = [
  ['camarilla', 'The Camarilla', 'Camarilla', '#d8b45a'], ['anarchs', 'The Anarchs', 'Anarchs', '#e07a2e'], ['sabbat', 'The Sabbat', 'Sabbat', '#6fb0a3'],
  ['independent', 'Independents', 'Independent', '#c98bb0'], ['garou', 'The Garou', 'Garou', '#8fa3b8'], ['mages', 'Mages & chantries', 'Mages', '#9b7fd1'],
  ['fae', 'The Kithain', 'Fae', '#7fe0c4'], ['wraiths', 'The Restless Dead', 'Wraiths', '#a9bccf'], ['hunters', 'Hunters', 'Hunters', '#e86a3a'], ['mortal', 'Mortal powers', 'Mortals', '#b9b0a2'], ['neutral', 'Unaligned', 'Neutral', '#e8dcc4']
];

/** A new, empty atlas. `image` = {src, w, h} makes an image-based (plane) map. */
export function blankAtlas({title = 'New city', image = null, realms = ['waking'], wod = true} = {}) {
  const a = {schema: 1, title, projection: 'plane', theme: Object.assign({}, DEFAULT_THEME), zoom: {min: -4, max: 3}, closeBy: 60,
    realms: {}, layers: {}, categories: {}, factions: {}, styles: {}, places: {}, zones: {}, routes: {}, labels: {}, auras: {}, people: {}, pages: {}};
  if (image) { a.background = {src: image.src, w: image.w, h: image.h}; a.bounds = [[0, 0], [image.w, image.h]]; a.zoom = {min: Math.floor(Math.log2(400 / Math.max(image.w, image.h))) - 1, max: 3}; }
  else { a.bounds = [[0, 0], [2000, 1400]]; a.zoom = {min: -2, max: 3}; }
  realms.forEach((k, i) => {
    const r = {id: k, name: (LOOKS[k] || {label: k}).label.split(' (')[0], order: i, kicker: '', date: '', levels: [{id: 'main', name: 'Surface', show: ['main']}], terms: {places: 'Places', people: 'People', zones: 'Domains', pages: 'Chronicle'}};
    applyLook(r, k, {imageMap: !!image}); a.realms[k] = r;
  });
  if (wod) {
    a.realms[realms[0]].terms.people = 'Kindred';
    WOD_CATEGORIES.forEach(([id, name, icon, color], i) => a.categories[id] = {id, name, icon, color: color || undefined, order: i});
    WOD_FACTIONS.forEach(([id, name, short, color], i) => a.factions[id] = {id, name, short, color, order: i});
    a.layers.domains = {id: 'domains', name: 'Domains & territories', on: true, order: 0};
    a.layers.routes = {id: 'routes', name: 'Routes & patrols', on: true, order: 1};
    a.layers.labels = {id: 'labels', name: 'Names', on: true, order: 2};
    a.styles['hatched'] = {width: 2, pattern: {kind: 'ne', color: 'auto:0.35', bg: 'auto:0.07', size: 8, width: 1.1}};
    a.styles['dotted-zone'] = {width: 1.6, dash: [3, 4], pattern: {kind: 'dot', color: 'auto:0.45', bg: 'auto:0.06', size: 8, width: 1}};
    a.styles['danger'] = {stroke: '#ff5a5a', width: 1.8, dash: [5, 3], pattern: {kind: 'nw', color: 'rgba(255,90,90,.42)', bg: 'rgba(255,60,60,.07)', size: 6, width: 1}};
    a.styles['glow-zone'] = {width: 1.4, fillAlpha: 0.12, glow: {width: 8, alpha: 0.2}};
    a.styles['patrol'] = {width: 3, dash: [2, 7]};
    a.styles['road'] = {width: 4, dash: [8, 8], strokeAlpha: 0.6};
    for (const [k, o] of Object.entries({held: {}, reserve: {width: 1.4}, contested: {stroke: '#f0a050', dash: [7, 4]}, vacant: {stroke: '#a0a0a8', dash: [2, 4], fillAlpha: 0.07}, hidden: {stroke: '#c8b4ff', dash: [1, 4]}, hostile: {stroke: '#ff4a4a', dash: [6, 3], flow: 0.6}}))
      a.styles['domain-' + k] = Object.assign({width: 2, casing: {color: 'rgba(8,6,10,.75)', width: 3}, fillAlpha: 0.14}, o);
    a.domainLayer = 'domains'; a.revealDefault = 3;
    a.styles['spirit-road'] = {width: 2.4, dash: [8, 7], flow: 1, glow: {width: 8, alpha: 0.2}};
    a.statuses = {dead: {name: 'Destroyed', mark: '†', fade: true, hideable: true}, torpor: {name: 'In torpor', color: '#cfcfe0'}, missing: {name: 'Missing', color: '#cfcfe0'}, captured: {name: 'Captured', color: '#f6dc9a'}, hiding: {name: 'In hiding', color: '#f6dc9a'}};
    a.precisions = {canon: {name: 'Exact location', border: 'solid', color: '#d8b45a'}, approx: {name: 'Approximate location', border: 'dashed', color: '#cdbfe6'}, placed: {name: 'Storyteller placement', border: 'dotted', color: '#e6a3a3'}};
  }
  a.pages.welcome = {id: 'welcome', title: 'About this atlas', order: 0, html: '<p class="lead">A fresh atlas. Turn on <b>Edit</b> (the pen on the right) to add places, draw domains and routes, write chronicle pages, and set up realms such as the Umbra or the Shadowlands.</p>'};
  return a;
}
