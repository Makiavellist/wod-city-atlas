/* "MASQUERADE VIOLATION": the Storyteller's red alert, shown across every player's whole screen. */
import {MOD} from './journal-store.js';

const MASK_L = 'M100 18C70 18 38 30 26 58c-10 24-6 58 10 84 14 22 36 38 58 42l6-30-12-14 16-18-10-22 14-20-8-24 10-18z';
const MASK_R = 'M100 18c30 0 62 12 74 40 10 24 6 58-10 84-14 22-36 38-58 42l-6-30 12-14-16-18 10-22-14-20 8-24-10-18z';
const EYE_L = 'M50 82c8-12 26-14 38-4-10 12-28 14-38 4z';
const EYE_R = 'M150 82c-8-12-26-14-38-4 10 12 28 14 38 4z';

function maskSvg() {
  return `<svg class="brk-mask" viewBox="0 0 200 200" aria-hidden="true">
    <defs><linearGradient id="brk-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e9d6"/><stop offset="1" stop-color="#b9a98c"/></linearGradient></defs>
    <g class="half l"><path d="${MASK_L}" fill="url(#brk-g)" stroke="#2a0306" stroke-width="3"/><path d="${EYE_L}" fill="#120204"/><path d="M60 128c10 8 24 10 34 6" fill="none" stroke="#5a1a1a" stroke-width="3" stroke-linecap="round"/></g>
    <g class="half r"><path d="${MASK_R}" fill="url(#brk-g)" stroke="#2a0306" stroke-width="3"/><path d="${EYE_R}" fill="#120204"/><path d="M140 128c-10 8-24 10-34 6" fill="none" stroke="#5a1a1a" stroke-width="3" stroke-linecap="round"/></g>
    <path class="drip" d="M106 150c0 10-3 18-3 26 0 4 2 7 4 7s4-3 4-7c0-8-3-16-5-26z" fill="#a00d16"/>
  </svg>`;
}

/** Show the alert on this screen. */
export function showBreach({text = '', sound = true} = {}) {
  document.getElementById('wca-breach')?.remove();
  const el = document.createElement('div'); el.id = 'wca-breach'; el.setAttribute('role', 'alert');
  el.innerHTML = `<div class="brk-bg"></div><div class="brk-crack"></div><div class="brk-inner">${maskSvg()}<h1 class="brk-title"><span>Masquerade</span><span>Violation</span></h1>${text ? `<p class="brk-text">${String(text).replace(/[&<>]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;'}[c]))}</p>` : ''}<p class="brk-hint">click to dismiss</p></div>`;
  document.body.appendChild(el);
  if (sound) { try { foundry.audio.AudioHelper.play({src: 'sounds/drums.wav', volume: 0.7, loop: false}, false); } catch (e) {} }
  const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 900); };
  el.addEventListener('click', close);
  setTimeout(close, 9000);
}

/** Storyteller: show it to everyone (shift-click to add a line of text). */
export async function broadcastBreach(withText = false) {
  if (!game.user.isGM) return;
  let text = '';
  if (withText) {
    text = await foundry.applications.api.DialogV2.prompt({window: {title: 'Masquerade violation'}, content: '<p>A line under the alert (optional):</p><input type="text" name="t" placeholder="The late news ran the tape." style="width:100%">', rejectClose: false, modal: true,
      ok: {label: 'Show everyone', callback: (ev, button) => button.form.elements.t.value}});
    if (text === null || text === undefined) return;
  }
  game.socket.emit(`module.${MOD}`, {action: 'breach', text});
  showBreach({text});
}
