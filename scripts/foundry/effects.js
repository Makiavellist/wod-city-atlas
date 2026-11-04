/* Storyteller effects: full-screen moments (in Russian) sent to every player or to chosen ones: the Masquerade alarm,
 * the Beast, the mind, Malkavian, Lasombra and Tremere moments, most with their own synthesised sound (fx-sound.js).
 * They never block play: they fade by themselves. */
import {MOD} from './journal-store.js';
import {esc} from '../core/util.js';
import {playSound} from './fx-sound.js';

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
const WHISPERS = ['часы на башне лгут', 'пересчитай двери ещё раз', 'она знает, что ты сделал', 'луна подслушивает', 'их всегда было семь',
  'не пей с левой руки', 'сегодня они носят твоё лицо', 'рыбы всё помнят', 'за тобой — но вежливо', 'ты не выключил плиту в пятьдесят третьем',
  'карты крапили ещё до твоего рождения', 'спроси у голубя', 'красный — это дверь', 'улыбайся, они считают', 'Князь не умер, Князь ждёт',
  'сколько ступеней у лестницы, которой нет?', 'твоя тень пришла раньше тебя', 'не открывай третью дверь', 'озеро смотрит вверх',
  'кто-то переставил звёзды', 'ты уже читал эту фразу', 'молоко помнит корову', 'в зеркале на одного больше', 'не оборачивайся на своё имя',
  'они слышат, когда ты думаешь громко', 'город спит с открытыми глазами'];
const SIGILS = ['☉', '☽', '☿', '♀', '♂', '♃', '♄', '♁', '✶', '⚹'];

/** Every effect: what the Storyteller picks from. ms = how long it lasts; text = the default line under it. */
export const EFFECTS = {
  breach: {name: 'Нарушение Маскарада', icon: 'fa-solid fa-masks-theater', group: 'Тревога', ms: 9000, file: 'sounds/drums.wav', hint: 'Трескающаяся маска и красные буквы. Закрывается щелчком.', ph: 'В вечерних новостях показали запись.'},
  frenzy: {name: 'Бешенство', icon: 'fa-solid fa-heart-pulse', group: 'Зверь', ms: 8000, hint: 'Экран заливает красным, он трясётся под бешеный стук сердца и рык Зверя.', text: 'Зверь берёт верх.'},
  rotschreck: {name: 'Рётшрек', icon: 'fa-solid fa-fire', group: 'Зверь', ms: 8000, hint: 'Красный Страх: по экрану ползёт пламя, ревёт огонь.', text: 'Огонь. Беги.'},
  hunger: {name: 'Голод', icon: 'fa-solid fa-droplet', group: 'Зверь', ms: 9000, hint: 'Медленная красная пульсация по краям, тяжёлое сердце, долгий вдох.', text: 'Ты так голоден.'},
  lapse: {name: 'Минутное помутнение', icon: 'fa-solid fa-cloud', group: 'Разум', ms: 6500, hint: 'Едва заметно: мир на миг расплывается.', text: ''},
  confusion: {name: 'Замешательство', icon: 'fa-solid fa-shuffle', group: 'Разум', ms: 7000, hint: 'Комната качается, цвета плывут, ничто не стоит на месте.', text: ''},
  foreboding: {name: 'Дурное предчувствие', icon: 'fa-solid fa-cloud-moon', group: 'Разум', ms: 10000, hint: 'С краёв наползает тьма, цвет уходит из мира.', text: 'Что-то не так.'},
  watched: {name: 'Чужой взгляд', icon: 'fa-solid fa-eye', group: 'Разум', ms: 7500, hint: 'Во тьме открывается глаз, осматривается и закрывается.', text: ''},
  whispers: {name: 'Шёпот', icon: 'fa-solid fa-comment-dots', group: 'Малкавиане', ms: 18000, hint: 'Обрывки фраз мелькают по экрану, шепчут голоса. Свои строки — через |, они смешаются со случайными.', ph: 'часы лгут | пересчитай двери'},
  fracture: {name: 'Расколотое зрение', icon: 'fa-solid fa-bolt', group: 'Малкавиане', ms: 4200, hint: 'Картинка рассыпается на сдвинутые, перекрашенные полосы.', text: ''},
  mirror: {name: 'Зазеркалье', icon: 'fa-solid fa-left-right', group: 'Малкавиане', ms: 3800, hint: 'На несколько секунд весь экран становится зеркальным.', text: ''},
  abyss: {name: 'Покров Бездны', icon: 'fa-solid fa-circle-half-stroke', group: 'Ласомбра', ms: 11000, hint: 'Живая тьма смыкается со всех сторон, оставляя лишь узкий круг; холодный гул снизу.', text: 'Свет гаснет.'},
  tentacles: {name: 'Руки Бездны', icon: 'fa-solid fa-hand', group: 'Ласомбра', ms: 9000, hint: 'Из краёв экрана тянутся извивающиеся щупальца тьмы.', text: ''},
  shadow: {name: 'Живая тень', icon: 'fa-solid fa-person', group: 'Ласомбра', ms: 8000, hint: 'Чья-то тень проходит по экрану сама по себе. Шаги, которых нет.', text: ''},
  ritual: {name: 'Ритуальный круг', icon: 'fa-solid fa-circle-notch', group: 'Тремер', ms: 10000, hint: 'Вычерчивается и вращается герметический круг с надписями; хор и колокола.', text: ''},
  blood: {name: 'Кипящая кровь', icon: 'fa-solid fa-fire-flame-curved', group: 'Тремер', ms: 8000, hint: 'Капли крови поднимаются вверх, вспыхивают знаки, кровь шипит и бурлит.', text: ''},
  ward: {name: 'Охранный знак', icon: 'fa-solid fa-shield-halved', group: 'Тремер', ms: 6500, hint: 'Вспыхивает защитный знак, по краям загораются символы, звенит преграда.', text: ''}
};

const reduce = () => matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const R = (a, b) => a + Math.random() * (b - a);

/** Darkness reaching in: tapered, curling arms of shadow (SVG paths, base at 0,0 pointing up). */
function tentacle(len, w, k) {
  const L = [], Rt = [], n = 28;
  for (let i = 0; i <= n; i++) { const f = i / n, y = -len * f, x = Math.sin(f * Math.PI * k) * len * 0.12 * f, ww = w * (1 - f) ** 1.3 + 0.6; L.push([x - ww, y]); Rt.push([x + ww, y]); }
  const tip = L[n]; return 'M' + L.map(p => p.map(v => v.toFixed(1)).join(' ')).join('L') + `Q${tip[0] + w * 0.4} ${(tip[1] - w).toFixed(1)} ` + Rt.reverse().map(p => p.map(v => v.toFixed(1)).join(' ')).join('L') + 'Z';
}
function tentacles() {
  const arms = []; let i = 0;
  const add = (x, y, rot) => { const len = R(300, 620), w = R(30, 58); arms.push(`<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${rot.toFixed(0)})"><g class="tg" style="animation-delay:${(i++ * 260 + R(0, 300)).toFixed(0)}ms;--sw:${R(5, 12).toFixed(1)}deg"><path d="${tentacle(len, w, R(1.2, 2.6))}"/></g></g>`); };
  for (let k = 0; k < 8; k++) add(60 + k * 210 + R(-50, 50), 930, R(-28, 28));
  for (let k = 0; k < 2; k++) { add(-20, 300 + k * 330 + R(-40, 40), 70 + R(-15, 15)); add(1620, 300 + k * 330 + R(-40, 40), -70 + R(-15, 15)); }
  return `<svg class="fx-arms" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${arms.join('')}</svg>`;
}
const SHADE = `<svg class="fx-figure" viewBox="0 0 60 200" aria-hidden="true"><ellipse cx="30" cy="15" rx="9.5" ry="11.5"/><path d="M19 29Q30 23 41 29L47 62 52 118 45 120 42 82 44 196 34 196 30 128 26 196 16 196 18 82 15 120 8 118 13 62Z"/></svg>`;
function ritualCircle() {
  const words = 'SANGVIS · VINCVLVM · VOLVNTAS · ARCANVM · TREMERE · CIRCVLVS · CLAVSVS · ';
  const sig = SIGILS.map((g, i) => { const a = i / SIGILS.length * Math.PI * 2; return `<text x="${(200 + Math.cos(a) * 120).toFixed(1)}" y="${(200 + Math.sin(a) * 120 + 7).toFixed(1)}">${g}</text>`; }).join('');
  const star = Array.from({length: 7}, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI * 3 / 7; return `${(200 + Math.cos(a) * 92).toFixed(1)},${(200 + Math.sin(a) * 92).toFixed(1)}`; }).join(' ');
  return `<svg class="fx-circle" viewBox="0 0 400 400" aria-hidden="true"><defs><path id="fx-rp" d="M200 200m-163 0a163 163 0 1 1 326 0a163 163 0 1 1-326 0"/></defs>
    <g class="ring r1"><circle cx="200" cy="200" r="180"/><circle cx="200" cy="200" r="146"/><text class="words"><textPath href="#fx-rp">${words}${words}</textPath></text></g>
    <g class="ring r2"><circle cx="200" cy="200" r="134" stroke-dasharray="3 7"/>${sig}<circle cx="200" cy="200" r="104"/></g>
    <g class="ring r3"><polygon points="${star}"/><circle cx="200" cy="200" r="34"/><path d="M178 200q22-20 44 0q-22 20-44 0z"/><circle cx="200" cy="200" r="7" class="dot"/></g></svg>`;
}

/** Show an effect on this screen. */
export function showEffect(kind, {text, sound = true} = {}) {
  const E = EFFECTS[kind]; if (!E) return;
  document.getElementById('wca-fx-' + kind)?.remove();
  const line = text ?? E.text ?? '', ms = reduce() ? Math.min(E.ms, 3500) : E.ms;
  const el = document.createElement('div'); el.id = 'wca-fx-' + kind; el.className = `wca-fx fx-${kind}`; el.style.setProperty('--fx-ms', ms + 'ms'); el.setAttribute('aria-live', 'polite');
  const sub = line ? `<p class="fx-line">${esc(line)}</p>` : '';
  const body = {
    breach: `<div class="brk-bg"></div><div class="brk-crack"></div><div class="brk-inner">${MASK}<h1 class="brk-title"><span>Нарушение</span><span>Маскарада</span></h1>${line ? `<p class="brk-text">${esc(line)}</p>` : ''}<p class="brk-hint">щёлкните, чтобы закрыть</p></div>`,
    frenzy: `<i class="fx-veins"></i><i class="fx-pulse"></i><div class="fx-word"><h1>Бешенство</h1>${sub}</div>`,
    rotschreck: `<i class="fx-heat"></i>${Array.from({length: 14}, (_, i) => `<b style="left:${(i * 7.4 - 2).toFixed(1)}%;animation-delay:${(i * 137 % 900)}ms;--h:${32 + (i * 53 % 30)}vh"></b>`).join('')}<div class="fx-word"><h1>Рётшрек</h1>${sub}</div>`,
    hunger: `<i class="fx-pulse"></i>${sub}`,
    lapse: `<i class="fx-swim"></i>${sub}`,
    confusion: `<i class="fx-swim"></i><i class="fx-tint"></i>${sub}`,
    foreboding: `<i class="fx-dark"></i>${sub}`,
    watched: `<i class="fx-dark"></i>${EYE}${sub}`,
    whispers: (() => {
      // the Storyteller's own lines, mixed in among random ones
      const own = line ? line.split('|').map(s => s.trim()).filter(Boolean) : [], n = Math.max(14, own.length + 6);
      const list = shuffle([...own, ...shuffle(WHISPERS).slice(0, n - own.length)]), step = (ms - 4500) / list.length;
      return list.map((w, i) => `<span class="fx-whisper" style="left:${R(6, 72).toFixed(0)}%;top:${R(8, 84).toFixed(0)}%;animation-delay:${(i * step + R(0, step * 0.5)).toFixed(0)}ms;transform:rotate(${R(-6, 6).toFixed(1)}deg)">${esc(w)}</span>`).join('');
    })(),
    fracture: Array.from({length: 9}, (_, i) => `<i class="fx-slice" style="top:${(i * 11 + Math.random() * 4).toFixed(1)}%;height:${(3 + Math.random() * 8).toFixed(1)}%;animation-delay:${(Math.random() * 600).toFixed(0)}ms"></i>`).join('') + sub,
    mirror: sub,
    abyss: `<i class="fx-void"></i>${Array.from({length: 9}, (_, i) => `<b class="fx-wisp" style="--a:${(i * 40 + R(-12, 12)).toFixed(0)}deg;--d:${R(6, 11).toFixed(1)}s;animation-delay:${(-R(0, 6)).toFixed(1)}s"></b>`).join('')}${sub}`,
    tentacles: `<i class="fx-dark"></i>${tentacles()}${sub}`,
    shadow: `<i class="fx-dim"></i><div class="fx-walk">${SHADE}</div>${sub}`,
    ritual: `<i class="fx-glow"></i>${ritualCircle()}<i class="fx-flash"></i>${sub}`,
    blood: `<i class="fx-pulse"></i>${Array.from({length: 44}, () => `<b class="fx-drop" style="left:${R(2, 97).toFixed(1)}%;--s:${R(0.5, 1.4).toFixed(2)};animation-delay:${R(0, ms * 0.6).toFixed(0)}ms;animation-duration:${R(2.6, 4.6).toFixed(1)}s"></b>`).join('')}${Array.from({length: 7}, (_, i) => `<span class="fx-sigil" style="left:${R(8, 88).toFixed(0)}%;top:${R(10, 80).toFixed(0)}%;animation-delay:${(600 + i * 700).toFixed(0)}ms">${SIGILS[i % SIGILS.length]}</span>`).join('')}${sub}`,
    ward: `<i class="fx-frame"></i>${Array.from({length: 16}, (_, i) => { const side = i % 4, f = (Math.floor(i / 4) + 0.5) / 4; const pos = [`left:${f * 100}%;top:2.2%`, `left:97.8%;top:${f * 100}%`, `left:${f * 100}%;top:97.8%`, `left:2.2%;top:${f * 100}%`][side]; return `<span class="fx-rune" style="${pos};animation-delay:${(i * 90).toFixed(0)}ms">${SIGILS[i % SIGILS.length]}</span>`; }).join('')}<i class="fx-ripple"></i><span class="fx-bigsign">⚹</span>${sub}`
  }[kind];
  el.innerHTML = body;
  document.body.appendChild(el);
  // the whole screen moves with some of them
  const bodyFx = {frenzy: 'wca-shake', rotschreck: 'wca-shake', confusion: 'wca-sway', mirror: 'wca-mirror'}[kind];
  if (bodyFx && !reduce()) { document.body.classList.add(bodyFx); setTimeout(() => document.body.classList.remove(bodyFx), kind === 'mirror' ? ms : Math.min(ms, kind === 'confusion' ? ms : 1600)); }
  if (sound) {
    if (E.file) { try { foundry.audio.AudioHelper.play({src: E.file, volume: 0.7, loop: false}, false); } catch (e) {} }
    else playSound(kind, ms / 1000);
  }
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
  const who = users ? users.map(id => game.users.get(id)?.name || '?').join(', ') : 'все';
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
    <fieldset><legend>Кто это почувствует</legend><div class="fxwho"><label><input type="radio" name="to" value="all" checked> Все</label><label><input type="radio" name="to" value="some"> Только:</label>
      ${players.map(u => `<label class="fxu${u.active ? '' : ' off'}"><input type="checkbox" name="u" value="${u.id}"> <span style="color:${esc(u.color?.css ?? String(u.color || ''))}">${esc(u.name)}</span>${u.active ? '' : ' <small>(не в игре)</small>'}</label>`).join('') || '<small>Игроков пока нет.</small>'}</div></fieldset>
    <fieldset><legend>Строка текста (необязательно)</legend><input type="text" name="text" placeholder="Оставьте пустым — будет по умолчанию"><label class="fxself"><input type="checkbox" name="self"> Показать и на моём экране</label></fieldset></div>`;
  const res = await foundry.applications.api.DialogV2.wait({window: {title: 'Эффекты Рассказчика', icon: 'fa-solid fa-ghost', resizable: true}, position: {width: 640, height: 'auto'}, classes: ['wca-fxdialog'], content, rejectClose: false, modal: false,
    render: (ev, dlg) => { const root = dlg?.element ?? dlg; if (!root?.querySelectorAll) return;
      root.querySelectorAll('input[name=u]').forEach(c => c.addEventListener('change', () => { if (c.checked) root.querySelector('input[name=to][value=some]').checked = true; }));
      const ph = () => { const E = EFFECTS[root.querySelector('input[name=kind]:checked')?.value] || {}; root.querySelector('input[name=text]').placeholder = E.ph || (E.text ? `По умолчанию: «${E.text}»` : 'Можно оставить пустым'); };
      root.querySelectorAll('input[name=kind]').forEach(r => r.addEventListener('change', ph)); ph(); },
    buttons: [{action: 'send', label: 'Отправить', icon: 'fa-solid fa-paper-plane', default: true, callback: (e, button) => read(button.form)},
      {action: 'preview', label: 'Попробовать на себе', icon: 'fa-solid fa-eye', callback: (e, button) => Object.assign(read(button.form), {preview: true})},
      {action: 'cancel', label: 'Отмена'}]});
  if (!res || typeof res !== 'object') return;
  if (res.preview) { showEffect(res.kind, {text: res.text}); return effectsDialog(res.kind); }
  if (res.to === 'some' && !res.users.length) return ui.notifications.warn('Выберите хотя бы одного игрока или «Все».');
  sendEffect(res.kind, {users: res.to === 'some' ? res.users : null, text: res.text, self: res.self});
}
function read(form) {
  const f = form.elements, text = (f.namedItem('text')?.value || '').trim();
  return {kind: form.querySelector('input[name=kind]:checked')?.value || 'frenzy', to: form.querySelector('input[name=to]:checked')?.value || 'all', users: [...form.querySelectorAll('input[name=u]:checked')].map(i => i.value), text: text || undefined, self: !!f.namedItem('self')?.checked};
}
