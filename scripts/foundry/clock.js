/* The chronicle clock: an in-game date and time the Storyteller sets by hand, shown to everyone at the
 * top of the screen with the hours left until dawn (or until dusk, for the unlucky). */
import {MOD} from './journal-store.js';
import {esc} from '../core/util.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DEFAULT = {t: Date.UTC(1991, 9, 26, 23, 0)};

/* Time is kept as a "wall clock" value: the UTC fields of t are the local date and time in the chronicle city. */
const parts = t => { const d = new Date(t); return {y: d.getUTCFullYear(), mo: d.getUTCMonth(), d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), wd: d.getUTCDay()}; };
const nthSunday = (y, mo, n) => { const first = new Date(Date.UTC(y, mo, 1)).getUTCDay(); return 1 + ((7 - first) % 7) + (n - 1) * 7; };
const lastSunday = (y, mo) => { const last = new Date(Date.UTC(y, mo + 1, 0)); return last.getUTCDate() - last.getUTCDay(); };
/** US daylight saving time for the chronicle year (the rules changed in 1967, 1987 and 2007). */
function isDST(y, mo, d) {
  let start, end; // [month, day]
  if (y >= 2007) { start = [2, nthSunday(y, 2, 2)]; end = [10, nthSunday(y, 10, 1)]; }
  else if (y >= 1987) { start = [3, nthSunday(y, 3, 1)]; end = [9, lastSunday(y, 9)]; }
  else if (y >= 1967) { start = [3, lastSunday(y, 3)]; end = [9, lastSunday(y, 9)]; }
  else return false;
  const v = mo * 100 + d; return v >= start[0] * 100 + start[1] && v < end[0] * 100 + end[1];
}
/** Sunrise and sunset in local hours (NOAA's simplified algorithm). */
function sunHours(y, mo, d, lat, lon, std) {
  const rad = Math.PI / 180, N = Math.floor((Date.UTC(y, mo, d) - Date.UTC(y, 0, 0)) / 864e5), lngHour = lon / 15;
  const calc = rising => {
    const t = N + ((rising ? 6 : 18) - lngHour) / 24, M = 0.9856 * t - 3.289;
    let L = (M + 1.916 * Math.sin(M * rad) + 0.020 * Math.sin(2 * M * rad) + 282.634) % 360; if (L < 0) L += 360;
    let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad; RA = (RA + 360) % 360; RA += Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90; RA /= 15;
    const sinDec = 0.39782 * Math.sin(L * rad), cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
    if (cosH > 1 || cosH < -1) return null;
    const H = (rising ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad) / 15;
    const UT = ((H + RA - 0.06571 * t - 6.622 - lngHour) % 24 + 24) % 24;
    return (UT + std + (isDST(y, mo, d) ? 1 : 0) + 24) % 24;
  };
  return {rise: calc(true), set: calc(false)};
}
/** The chronicle city's place and time zone (0 is a real answer: the equator, Greenwich, UTC). */
function where() { const num = (k, d) => { const v = Number(game.settings.get(MOD, k)); return Number.isFinite(v) ? v : d; }; return {lat: num('clockLat', 43.04), lon: num('clockLon', -87.91), std: num('clockTz', -6)}; }
/** Wall-clock timestamps of the dawn and dusk around t. */
function sunAround(t) {
  const {lat, lon, std} = where(), p = parts(t);
  const at = (dayOffset, which) => { const dd = new Date(Date.UTC(p.y, p.mo, p.d + dayOffset)); const s = sunHours(dd.getUTCFullYear(), dd.getUTCMonth(), dd.getUTCDate(), lat, lon, std); const h = s[which]; return h == null ? null : dd.getTime() + h * 36e5; };
  const rise0 = at(0, 'rise'), set0 = at(0, 'set');
  const day = rise0 != null && set0 != null && t >= rise0 && t < set0;
  const nextDawn = t < rise0 ? rise0 : at(1, 'rise');
  const nextDusk = t < set0 ? set0 : at(1, 'set');
  return {day, nextDawn, nextDusk};
}
const fmtSpan = ms => { if (!Number.isFinite(ms)) return '—'; const m = Math.max(0, Math.round(ms / 6e4)); const h = Math.floor(m / 60); return h ? `${h}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`; };
const fmtTime = (t, h24) => { const p = parts(t); if (h24) return `${String(p.h).padStart(2, '0')}:${String(p.mi).padStart(2, '0')}`; const h = p.h % 12 || 12; return `${h}:${String(p.mi).padStart(2, '0')} ${p.h < 12 ? 'AM' : 'PM'}`; };

export const Clock = {
  get() { const v = game.settings.get(MOD, 'clock'); return v && Number.isFinite(v.t) ? v : DEFAULT; },
  async set(t) { if (!game.user.isGM) return; await game.settings.set(MOD, 'clock', {t: Math.round(t / 6e4) * 6e4}); },
  async advance(minutes) { return this.set(this.get().t + minutes * 6e4); },
  async nextDusk() { const s = sunAround(this.get().t); if (s.nextDusk) return this.set(s.nextDusk); },
  async nextDawn() { const s = sunAround(this.get().t); if (s.nextDawn) return this.set(s.nextDawn); },
  describe(t = this.get().t) {
    const p = parts(t), s = sunAround(t);
    return {date: `${DAYS[p.wd]}, ${p.d} ${MONTHS[p.mo]} ${p.y}`, time: fmtTime(t, game.settings.get(MOD, 'clock24')), day: s.day,
      sun: s.day ? `Daylight · dusk in ${fmtSpan(s.nextDusk - t)}` : `Night · dawn in ${fmtSpan(s.nextDawn - t)}`, dawnMs: s.nextDawn - t};
  },
  render() {
    let el = document.getElementById('wca-clock');
    const show = !!game.settings.get(MOD, 'clockShow'); document.body.classList.toggle('wca-clock-on', show);
    if (!show) { el?.remove(); return; }
    if (!el) {
      el = document.createElement('aside'); el.id = 'wca-clock'; el.className = 'wca-clock';
      (document.getElementById('interface') || document.body).appendChild(el);
      el.addEventListener('click', e => { const b = e.target.closest('[data-clk]'); if (!b) return; const a = b.dataset.clk;
        if (a === 'cal') return Hooks.callAll('wcaOpenCalendar'); if (a === 'edit') return this.dialog(); if (a === 'dusk') return this.nextDusk(); if (a === 'dawn') return this.nextDawn(); this.advance(Number(a)); });
    }
    const d = this.describe(), gm = game.user.isGM, soon = !d.day && d.dawnMs < 36e5;
    const p = parts(this.get().t), key = `${p.y}-${String(p.mo + 1).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
    let evs = []; try { evs = (game.settings.get(MOD, 'events') || []).filter(e => e.date === key && (gm || e.vis === 'all' || (e.vis === 'some' && (e.users || []).includes(game.user.id)))); } catch (e) {}
    el.classList.toggle('day', d.day); el.classList.toggle('soon', soon); el.classList.toggle('gm', gm);
    el.innerHTML = `<div class="clk-face"><span class="clk-ic" aria-hidden="true">${d.day ? '☀' : '☾'}</span><div class="clk-txt"><b class="clk-time">${d.time}</b><span class="clk-date">${d.date}</span><span class="clk-sun">${d.sun}</span></div><button type="button" class="clk-cal" data-clk="cal" title="Calendar${evs.length ? ` · tonight: ${esc(evs.map(e => e.title).join(', '))}` : ''}"><i class="fa-solid fa-calendar-days"></i>${evs.length ? `<b>${evs.length}</b>` : ''}</button></div>` +
      (gm ? `<div class="clk-ctl"><button type="button" data-clk="-60" title="Back one hour">−1h</button><button type="button" data-clk="-10" title="Back ten minutes">−10m</button><button type="button" data-clk="10" title="Forward ten minutes">+10m</button><button type="button" data-clk="60" title="Forward one hour">+1h</button><button type="button" data-clk="dusk" title="Skip to the next dusk">Dusk</button><button type="button" data-clk="dawn" title="Skip to the next dawn">Dawn</button><button type="button" data-clk="edit" title="Set the date and time"><i class="fa-solid fa-pen"></i></button></div>` : '');
  },
  async dialog() {
    const p = parts(this.get().t), pad = n => String(n).padStart(2, '0');
    const content = `<div class="wca-clockform"><label>Date <input type="date" name="date" value="${p.y}-${pad(p.mo + 1)}-${pad(p.d)}"></label><label>Time <input type="time" name="time" value="${pad(p.h)}:${pad(p.mi)}"></label><p class="hint">The clock only moves when you move it. Players see it at the top of the screen.</p></div>`;
    const res = await foundry.applications.api.DialogV2.prompt({window: {title: 'Chronicle date and time'}, content, rejectClose: false, modal: true,
      ok: {label: 'Set', callback: (ev, button) => { const f = button.form; return {date: f.elements.date.value, time: f.elements.time.value}; }}});
    if (!res || !res.date) return;
    const [y, mo, d] = res.date.split('-').map(Number), [h, mi] = (res.time || '00:00').split(':').map(Number);
    await this.set(Date.UTC(y, mo - 1, d, h || 0, mi || 0));
  }
};

export function registerClockSettings() {
  game.settings.register(MOD, 'clock', {scope: 'world', config: false, type: Object, default: DEFAULT, onChange: () => { Clock.render(); Hooks.callAll('wcaClock', Clock.get()); }});
  game.settings.register(MOD, 'clockShow', {name: 'Show the chronicle clock', hint: 'The in-game date and time at the top of the screen, with the hours until dawn.', scope: 'client', config: true, type: Boolean, default: true, onChange: () => Clock.render()});
  game.settings.register(MOD, 'clock24', {name: 'Chronicle clock: 24-hour time', scope: 'client', config: true, type: Boolean, default: false, onChange: () => Clock.render()});
  game.settings.register(MOD, 'clockLat', {name: 'Chronicle clock: latitude', hint: 'For sunrise and sunset. Milwaukee is 43.04.', scope: 'world', config: true, type: Number, default: 43.04, onChange: () => Clock.render()});
  game.settings.register(MOD, 'clockLon', {name: 'Chronicle clock: longitude', hint: 'West is negative. Milwaukee is -87.91.', scope: 'world', config: true, type: Number, default: -87.91, onChange: () => Clock.render()});
  game.settings.register(MOD, 'clockTz', {name: 'Chronicle clock: standard time zone (hours from UTC)', hint: 'US Central is -6; daylight saving is applied by the US rules of the chronicle year.', scope: 'world', config: true, type: Number, default: -6, onChange: () => Clock.render()});
}
