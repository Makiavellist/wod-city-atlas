/* The chronicle calendar: a month view of the in-game date with events the Storyteller writes in.
 * Each event is shown to everyone, kept for the Storyteller, or shown to particular players. */
import {MOD} from './journal-store.js';
import {Clock} from './clock.js';
import {esc} from '../core/util.js';

const {ApplicationV2, DialogV2} = foundry.applications.api;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = n => String(n).padStart(2, '0');
const dayKey = t => { const d = new Date(t); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };

export const Events = {
  all() { const v = game.settings.get(MOD, 'events'); return Array.isArray(v) ? v : []; },
  /** What this user may see: everyone's events, the Storyteller's own, and those shared with them. */
  visible() { const me = game.user.id; return this.all().filter(e => game.user.isGM || e.vis === 'all' || (e.vis === 'some' && (e.users || []).includes(me))); },
  on(key) { return this.visible().filter(e => e.date === key).sort((a, b) => String(a.time || '').localeCompare(String(b.time || ''))); },
  async save(ev) { if (!game.user.isGM) return; const list = this.all().filter(e => e.id !== ev.id); list.push(ev); await game.settings.set(MOD, 'events', list); },
  async remove(id) { if (!game.user.isGM) return; await game.settings.set(MOD, 'events', this.all().filter(e => e.id !== id)); }
};

export class CalendarApp extends ApplicationV2 {
  static DEFAULT_OPTIONS = {id: 'wca-calendar', classes: ['wca-calendar-app'], tag: 'section', window: {title: 'Chronicle calendar', icon: 'fa-solid fa-calendar-days', resizable: true}, position: {width: 560, height: 'auto'}};
  static show() { const a = foundry.applications.instances.get('wca-calendar') || new CalendarApp(); a.render({force: true}); return a; }
  constructor(o) { super(o); const d = new Date(Clock.get().t); this.y = d.getUTCFullYear(); this.m = d.getUTCMonth(); this.sel = dayKey(Clock.get().t); }
  async _renderHTML() {
    const today = dayKey(Clock.get().t), gm = game.user.isGM;
    const first = new Date(Date.UTC(this.y, this.m, 1)), start = (first.getUTCDay() + 6) % 7, days = new Date(Date.UTC(this.y, this.m + 1, 0)).getUTCDate();
    const vis = Events.visible();
    let cells = '';
    for (let i = 0; i < start; i++) cells += '<span class="cal-day out"></span>';
    for (let d = 1; d <= days; d++) {
      const k = `${this.y}-${pad(this.m + 1)}-${pad(d)}`, evs = vis.filter(e => e.date === k);
      const dots = evs.slice(0, 4).map(e => `<i class="v-${e.vis}"></i>`).join('');
      cells += `<button type="button" class="cal-day${k === today ? ' today' : ''}${k === this.sel ? ' sel' : ''}${evs.length ? ' has' : ''}" data-day="${k}"><b>${d}</b><span class="dots">${dots}</span></button>`;
    }
    const list = Events.on(this.sel);
    const [sy, sm, sd] = this.sel.split('-').map(Number);
    const players = game.users.filter(u => !u.isGM);
    const who = e => e.vis === 'all' ? 'Everyone' : e.vis === 'gm' ? 'Storyteller only' : (e.users || []).map(id => game.users.get(id)?.name || '?').join(', ') || 'nobody';
    const evHtml = list.length ? list.map(e => `<div class="cal-ev v-${e.vis}"><div class="cal-evh"><b>${e.time ? `<span class="t">${esc(e.time)}</span> ` : ''}${esc(e.title)}</b>${gm ? `<small>${esc(who(e))}</small><span class="cal-evb"><button type="button" data-edit="${e.id}" title="Edit"><i class="fa-solid fa-pen"></i></button><button type="button" data-del="${e.id}" title="Delete"><i class="fa-solid fa-trash"></i></button></span>` : ''}</div>${e.text ? `<div class="cal-evt">${esc(e.text).replace(/\n/g, '<br>')}</div>` : ''}</div>`).join('') : '<p class="cal-none">Nothing written for this night.</p>';
    const el = document.createElement('div'); el.className = 'wca-cal';
    el.innerHTML = `<header class="cal-head"><button type="button" data-nav="-1" title="Previous month"><i class="fa-solid fa-chevron-left"></i></button><h2>${MONTHS[this.m]} ${this.y}</h2><button type="button" data-nav="1" title="Next month"><i class="fa-solid fa-chevron-right"></i></button><button type="button" class="cal-now" data-nav="0" title="Back to the current night">Tonight</button></header>
      <div class="cal-grid">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<span class="cal-wd">${d}</span>`).join('')}${cells}</div>
      <section class="cal-daypane"><h3>${sd} ${MONTHS[sm - 1]} ${sy}${this.sel === today ? ' · tonight' : ''}</h3>${evHtml}
      ${gm ? `<form class="cal-form" autocomplete="off"><input type="hidden" name="id" value=""><div class="row"><input type="text" name="title" placeholder="New event: Elysium at the Pabst, a debt comes due…" required><input type="time" name="time"></div><textarea name="text" rows="2" placeholder="Details (optional)"></textarea>
        <div class="row vis"><label><input type="radio" name="vis" value="all" checked> Everyone</label><label><input type="radio" name="vis" value="gm"> Storyteller only</label>${players.length ? `<label><input type="radio" name="vis" value="some"> Only:</label><span class="cal-users">${players.map(u => `<label><input type="checkbox" name="u" value="${u.id}"> ${esc(u.name)}</label>`).join('')}</span>` : ''}</div>
        <div class="row act"><button type="submit"><i class="fa-solid fa-feather"></i> <span class="lbl">Add to ${sd} ${MONTHS[sm - 1]}</span></button><button type="button" data-clockday title="Move the clock to this day, keeping the time"><i class="fa-solid fa-clock"></i> Set the clock to this day</button></div></form>` : ''}</section>`;
    return el;
  }
  _replaceHTML(result, content) { content.replaceChildren(result); }
  _onRender() {
    const R = this.element;
    R.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', () => { const n = +b.dataset.nav; if (!n) { const d = new Date(Clock.get().t); this.y = d.getUTCFullYear(); this.m = d.getUTCMonth(); this.sel = dayKey(Clock.get().t); } else { this.m += n; if (this.m < 0) { this.m = 11; this.y--; } if (this.m > 11) { this.m = 0; this.y++; } } this.render(); }));
    R.querySelectorAll('[data-day]').forEach(b => b.addEventListener('click', () => { this.sel = b.dataset.day; this.render(); }));
    R.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => { const e = Events.all().find(x => x.id === b.dataset.del); if (!e) return; const ok = await DialogV2.confirm({window: {title: 'Delete event'}, content: `<p>Delete “${esc(e.title)}”?</p>`, rejectClose: false}); if (ok) await Events.remove(e.id); }));
    R.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
      const e = Events.all().find(x => x.id === b.dataset.edit); const f = R.querySelector('.cal-form'); if (!e || !f) return;
      f.elements.id.value = e.id; f.elements.title.value = e.title || ''; f.elements.time.value = e.time || ''; f.elements.text.value = e.text || '';
      f.querySelectorAll('[name=vis]').forEach(r => { r.checked = r.value === e.vis; }); f.querySelectorAll('[name=u]').forEach(c => { c.checked = (e.users || []).includes(c.value); });
      f.querySelector('.lbl').textContent = 'Save changes'; f.elements.title.focus();
    }));
    const f = R.querySelector('.cal-form');
    if (f) {
      f.addEventListener('submit', async ev => {
        ev.preventDefault();
        const vis = f.querySelector('[name=vis]:checked')?.value || 'all';
        const e = {id: f.elements.id.value || foundry.utils.randomID(), date: this.sel, time: f.elements.time.value || '', title: f.elements.title.value.trim().slice(0, 200), text: f.elements.text.value.slice(0, 4000), vis, users: vis === 'some' ? [...f.querySelectorAll('[name=u]:checked')].map(c => c.value) : []};
        if (!e.title) return;
        await Events.save(e);
      });
      R.querySelector('[data-clockday]')?.addEventListener('click', () => { const t = new Date(Clock.get().t); const [y, m, d] = this.sel.split('-').map(Number); Clock.set(Date.UTC(y, m - 1, d, t.getUTCHours(), t.getUTCMinutes())); });
    }
  }
}

export function registerCalendarSettings() {
  game.settings.register(MOD, 'events', {scope: 'world', config: false, type: Array, default: [], onChange: () => { foundry.applications.instances.get('wca-calendar')?.render(); Clock.render(); }});
  Hooks.on('wcaClock', () => foundry.applications.instances.get('wca-calendar')?.render());
}
