/* Storyteller effects: full-screen moments sent to every player or to chosen ones — Masquerade violation, Frenzy,
 * Rötschreck, the Hunger, a lapse of judgement, confusion, an ominous foreboding, the feeling of being watched, and a
 * few Malkavian ones (whispers, fractured sight, the looking-glass). They never block play: they fade by themselves. */
import {MOD} from './journal-store.js';
import {esc} from '../core/util.js';

const MASK_L = 'M100 18C70 18 38 30 26 58c-10 24-6 58 10 84 14 22 36 38 58 42l6-30-12-14 16-18-10-22 14-20-8-24 10-18z';
const MASK_R = 'M100 18c30 0 62 12 74 40 10 24 6 58-10 84-14 22-36 38-58 42l-6-30 12-14-16-18 10-22-14-20 8-24-10-18z';
const MASK = `<svg class="brk-mask" viewBox="0 0 200 200" aria-hidden="true">
  <defs><linearGradient id="brk-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e9d6"/><stop offset="1" stop-color="#b9a98c"/></linearGradient></defs>
  <g class="half l"><path d="${MASK_L}" fill="url(#brk-g)" stroke="#2a0306" stroke-width="3"/><path d="M50 82c8-12 26-14 38-4-10 12-28 14-38 4z" fill="#120204"/><path d="M60 128c10 8 24 10 34 6" fill="none" stroke="#5a1a1a" stroke-width="3" stroke-linecap="round"/></g>
  <g class="half r"><path d="${MASK_R}" fill="url(#brk-g)" stroke="#2a0306" stroke-width="3"/><path d="M150 82c-8-12-26-14-38-4 10 12 28 14 38 4z" fill="#120204"/><path d="M140 128c-10 8-24 10-34 6" fill="none" stroke="#5a1a1a" stroke-width="3" stroke-linecap="round"/></g>
  <path class="drip" d="M106 150c0 10-3 18-3 26 0 4 2 7 4 7s4-3 4-7c0-8-3-16-5-26z" fill="#a00d16"/></svg>`;
const EYE = `<svg class="fx-eye" viewBox="0 0 200 100" aria-hidden="true"><defs><radialGradient id="fx-iris"><stop offset="0" stop-color="#000"/><stop offset=".28" stop-color="#000"/><stop offset=".32" stop-color="#7a1d14"/><stop offset=".8" stop-color="#3a0a08"/><stop offset="1" stop-color="#120303"/></radialGradient><clipPath id="fx-lid"><path d="M10 50Q100 -10 190 50Q100 110 10 50z"/></clipPath></defs>
  <g clip-path="url(#fx-lid)"><rect width="200" height="100" fill="#d9cfc0"/><path d="M10 50Q100 -10 190 50Q100 110 10 50z" fill="none" stroke="rgba(120,20,20,.35)" stroke-width="10"/><circle class="iris" cx="100" cy="50" r="26" fill="url(#fx-iris)"/></g>
  <path d="M10 50Q100 -10 190 50Q100 110 10 50z" fill="none" stroke="#120303" stroke-width="3"/></svg>`;
const WHISPERS = ['the clock in the tower is lying', 'count the doors again', 'she knows what you did', 'the moon is listening', 'it was always seven', 'don’t drink from the left hand', 'they are wearing your face tonight', 'the fish remember', 'behind you, but politely', 'you left the stove on in 1953', 'the cards were marked before you were born', 'ask the pigeon', 'red is a door', 'smile, they are counting'];

/** Every effect: what the Storyteller picks from. ms = how long it lasts; text = the default line under it. */
export const EFFECTS = {
  breach: {name: 'Masquerade violation', icon: 'fa-solid fa-masks-theater', group: 'Alarms', ms: 9000, sound: 'sounds/drums.wav', hint: 'A cracking mask and the words in red. Click to dismiss.', ph: 'The late news ran the tape.'},
  frenzy: {name: 'Frenzy', icon: 'fa-solid fa-heart-pulse', group: 'The Beast', ms: 8000, sound: 'sounds/drums.wav', hint: 'The screen floods red and shakes with a pounding heart.', text: 'The Beast takes the wheel.'},
  rotschreck: {name: 'Rötschreck', icon: 'fa-solid fa-fire', group: 'The Beast', ms: 8000, sound: 'sounds/drums.wav', hint: 'Flames climb the screen; the Red Fear.', text: 'Fire. Run.'},
  hunger: {name: 'The Hunger', icon: 'fa-solid fa-droplet', group: 'The Beast', ms: 9000, hint: 'A slow red pulse at the edges of sight.', text: 'You are so hungry.'},
  lapse: {name: 'A lapse of judgement', icon: 'fa-solid fa-cloud', group: 'The mind', ms: 6500, hint: 'Subtle: the world swims out of focus for a moment.', text: ''},
  confusion: {name: 'Confusion', icon: 'fa-solid fa-shuffle', group: 'The mind', ms: 7000, hint: 'The room sways, colours slide, nothing quite holds still.', text: ''},
  foreboding: {name: 'Ominous foreboding', icon: 'fa-solid fa-cloud-moon', group: 'The mind', ms: 10000, hint: 'Darkness creeps in from the edges; the colour drains away.', text: 'Something is wrong.'},
  watched: {name: 'Being watched', icon: 'fa-solid fa-eye', group: 'The mind', ms: 7500, hint: 'An eye opens in the dark, looks around, and closes.', text: ''},
  whispers: {name: 'Whispers', icon: 'fa-solid fa-comment-dots', group: 'Malkavian', ms: 9000, hint: 'Cryptic phrases flicker across the screen. Your own lines: separate them with |.', ph: 'the clock is lying | count the doors'},
  fracture: {name: 'Fractured sight', icon: 'fa-solid fa-bolt', group: 'Malkavian', ms: 4200, hint: 'The picture glitches into shifted, miscoloured slices.', text: ''},
  mirror: {name: 'The looking-glass', icon: 'fa-solid fa-left-right', group: 'Malkavian', ms: 3800, hint: 'For a few seconds the whole screen is the wrong way round.', text: ''}
};

const reduce = () => matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Show an effect on this screen. */
export function showEffect(kind, {text, sound = true} = {}) {
  const E = EFFECTS[kind]; if (!E) return;
  document.getElementById('wca-fx-' + kind)?.remove();
  const line = text ?? E.text ?? '', ms = reduce() ? Math.min(E.ms, 3500) : E.ms;
  const el = document.createElement('div'); el.id = 'wca-fx-' + kind; el.className = `wca-fx fx-${kind}`; el.style.setProperty('--fx-ms', ms + 'ms'); el.setAttribute('aria-live', 'polite');
  const sub = line ? `<p class="fx-line">${esc(line)}</p>` : '';
  const body = {
    breach: `<div class="brk-bg"></div><div class="brk-crack"></div><div class="brk-inner">${MASK}<h1 class="brk-title"><span>Masquerade</span><span>Violation</span></h1>${line ? `<p class="brk-text">${esc(line)}</p>` : ''}<p class="brk-hint">click to dismiss</p></div>`,
    frenzy: `<i class="fx-veins"></i><i class="fx-pulse"></i><div class="fx-word"><h1>Frenzy</h1>${sub}</div>`,
    rotschreck: `<i class="fx-heat"></i>${Array.from({length: 14}, (_, i) => `<b style="left:${(i * 7.4 - 2).toFixed(1)}%;animation-delay:${(i * 137 % 900)}ms;--h:${32 + (i * 53 % 30)}vh"></b>`).join('')}<div class="fx-word"><h1>Rötschreck</h1>${sub}</div>`,
    hunger: `<i class="fx-pulse"></i>${sub}`,
    lapse: `<i class="fx-swim"></i>${sub}`,
    confusion: `<i class="fx-swim"></i><i class="fx-tint"></i>${sub}`,
    foreboding: `<i class="fx-dark"></i>${sub}`,
    watched: `<i class="fx-dark"></i>${EYE}${sub}`,
    whispers: (line ? line.split('|').map(s => s.trim()).filter(Boolean) : shuffle(WHISPERS).slice(0, 7)).map((w, i) => `<span class="fx-whisper" style="left:${(8 + Math.random() * 70).toFixed(0)}%;top:${(10 + Math.random() * 75).toFixed(0)}%;animation-delay:${i * 700}ms;transform:rotate(${(Math.random() * 10 - 5).toFixed(1)}deg)">${esc(w)}</span>`).join(''),
    fracture: Array.from({length: 9}, (_, i) => `<i class="fx-slice" style="top:${(i * 11 + Math.random() * 4).toFixed(1)}%;height:${(3 + Math.random() * 8).toFixed(1)}%;animation-delay:${(Math.random() * 600).toFixed(0)}ms"></i>`).join('') + sub,
    mirror: sub
  }[kind];
  el.innerHTML = body;
  document.body.appendChild(el);
  // the whole screen moves with some of them
  const bodyFx = {frenzy: 'wca-shake', rotschreck: 'wca-shake', confusion: 'wca-sway', mirror: 'wca-mirror'}[kind];
  if (bodyFx && !reduce()) { document.body.classList.add(bodyFx); setTimeout(() => document.body.classList.remove(bodyFx), kind === 'mirror' ? ms : Math.min(ms, kind === 'confusion' ? ms : 1600)); }
  if (sound && E.sound) { try { foundry.audio.AudioHelper.play({src: E.sound, volume: 0.7, loop: false}, false); } catch (e) {} }
  const close = () => { if (!el.isConnected || el.classList.contains('out')) return; el.classList.add('out'); setTimeout(() => el.remove(), 900); };
  if (kind === 'breach') el.addEventListener('click', close);
  setTimeout(close, ms);
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/** Storyteller: send an effect to everyone (users = null) or to some players. */
export function sendEffect(kind, {users = null, text, self = false} = {}) {
  if (!game.user.isGM || !EFFECTS[kind]) return;
  game.socket.emit(`module.${MOD}`, {action: 'effect', kind, text, users});
  if (self || (!users && kind === 'breach')) showEffect(kind, {text});
  const who = users ? users.map(id => game.users.get(id)?.name || '?').join(', ') : 'everyone';
  ui.notifications.info(`${EFFECTS[kind].name} → ${who}.`);
}
/** On every client: an effect arrived over the socket. */
export function receiveEffect(msg) {
  if (msg.users && !msg.users.includes(game.user.id)) return;
  if (game.user.isGM && !msg.users && msg.kind !== 'breach') return; // the Storyteller already knows
  showEffect(msg.kind, {text: msg.text});
}

/** Storyteller: the picker — which effect, for whom, with what line. */
export async function effectsDialog(preset) {
  if (!game.user.isGM) return;
  const players = game.users.filter(u => !u.isGM);
  const groups = [...new Set(Object.values(EFFECTS).map(e => e.group))];
  const content = `<div class="wca-fxpick">
    ${groups.map(g => `<fieldset><legend>${esc(g)}</legend><div class="fxgrid">${Object.entries(EFFECTS).filter(([, e]) => e.group === g).map(([k, e]) => `<label class="fxcard" title="${esc(e.hint)}"><input type="radio" name="kind" value="${k}" ${k === (preset || 'frenzy') ? 'checked' : ''}><i class="${e.icon}"></i><b>${esc(e.name)}</b><small>${esc(e.hint)}</small></label>`).join('')}</div></fieldset>`).join('')}
    <fieldset><legend>Who feels it</legend><div class="fxwho"><label><input type="radio" name="to" value="all" checked> Everyone</label><label><input type="radio" name="to" value="some"> Only:</label>
      ${players.map(u => `<label class="fxu${u.active ? '' : ' off'}"><input type="checkbox" name="u" value="${u.id}"> <span style="color:${esc(u.color?.css ?? String(u.color || ''))}">${esc(u.name)}</span>${u.active ? '' : ' <small>(away)</small>'}</label>`).join('') || '<small>No players yet.</small>'}</div></fieldset>
    <fieldset><legend>A line of text (optional)</legend><input type="text" name="text" placeholder="Leave empty for the default"><label class="fxself"><input type="checkbox" name="self"> Show it on my screen too</label></fieldset></div>`;
  const res = await foundry.applications.api.DialogV2.wait({window: {title: 'Storyteller effects', icon: 'fa-solid fa-ghost', resizable: true}, position: {width: 640, height: 'auto'}, classes: ['wca-fxdialog'], content, rejectClose: false, modal: false,
    render: (ev, dlg) => { const root = dlg?.element ?? dlg; if (!root?.querySelectorAll) return;
      root.querySelectorAll('input[name=u]').forEach(c => c.addEventListener('change', () => { if (c.checked) root.querySelector('input[name=to][value=some]').checked = true; }));
      const ph = () => { const E = EFFECTS[root.querySelector('input[name=kind]:checked')?.value] || {}; root.querySelector('input[name=text]').placeholder = E.ph || (E.text ? `Default: “${E.text}”` : 'Leave empty for none'); };
      root.querySelectorAll('input[name=kind]').forEach(r => r.addEventListener('change', ph)); ph(); },
    buttons: [{action: 'send', label: 'Send', icon: 'fa-solid fa-paper-plane', default: true, callback: (e, button) => read(button.form)},
      {action: 'preview', label: 'Try it on me', icon: 'fa-solid fa-eye', callback: (e, button) => Object.assign(read(button.form), {preview: true})},
      {action: 'cancel', label: 'Cancel'}]});
  if (!res || typeof res !== 'object') return;
  if (res.preview) { showEffect(res.kind, {text: res.text}); return effectsDialog(res.kind); }
  if (res.to === 'some' && !res.users.length) return ui.notifications.warn('Choose at least one player, or Everyone.');
  sendEffect(res.kind, {users: res.to === 'some' ? res.users : null, text: res.text, self: res.self});
}
function read(form) {
  const f = form.elements, text = (f.namedItem('text')?.value || '').trim();
  return {kind: form.querySelector('input[name=kind]:checked')?.value || 'frenzy', to: form.querySelector('input[name=to]:checked')?.value || 'all', users: [...form.querySelectorAll('input[name=u]:checked')].map(i => i.value), text: text || undefined, self: !!f.namedItem('self')?.checked};
}
