/* Sounds for the Storyteller effects, synthesised in the browser (Web Audio): no files to ship, and every effect has
 * its own voice. Loudness follows Foundry's interface volume. Each function takes the effect's length in seconds. */

let AC = null; const BUF = {};
function ac() {
  if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); }
  if (AC.state === 'suspended') AC.resume().catch(() => {});
  return AC;
}
function volume() { try { const v = game.settings.get('core', 'globalInterfaceVolume'); return Number.isFinite(v) ? v : 0.6; } catch (e) { return 0.6; } }
/** A gain node into the speakers, scaled by the interface volume. */
function bus(a, g = 1) { const n = a.createGain(); n.gain.value = g * volume(); const comp = a.createDynamicsCompressor(); comp.threshold.value = -10; n.connect(comp); comp.connect(a.destination); n.done = () => { n.disconnect(); comp.disconnect(); }; return n; }
function buffer(a, kind) {
  if (BUF[kind]) return BUF[kind];
  const len = a.sampleRate * 4, b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0); let last = 0;
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
  return (BUF[kind] = b);
}
function noise(a, kind, t0, t1) { const s = a.createBufferSource(); s.buffer = buffer(a, kind); s.loop = true; s.start(t0, Math.random() * 3); s.stop(t1); return s; }
function filter(a, type, f, q = 1) { const n = a.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; return n; }
function osc(a, type, f, t0, t1) { const o = a.createOscillator(); o.type = type; o.frequency.value = f; o.start(t0); o.stop(t1); return o; }
/** Gain with an envelope: pts = [[time, value], …] (linear ramps). */
function env(a, pts) { const g = a.createGain(); g.gain.setValueAtTime(0, pts[0][0]); for (const [t, v] of pts) g.gain.linearRampToValueAtTime(v, t); return g; }
function chain(...n) { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; }
function shaper(a, k = 20) { const s = a.createWaveShaper(), c = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); } s.curve = c; return s; }
function pan(a, p) { if (!a.createStereoPanner) return a.createGain(); const n = a.createStereoPanner(); n.pan.value = p; return n; }
const rnd = (a, b) => a + Math.random() * (b - a);

/** One heartbeat: lub, then dub. */
function beat(a, out, t, s = 1) {
  for (const [dt, f0, k] of [[0, 62, 1], [0.17, 52, 0.7]]) {
    const o = osc(a, 'sine', f0, t + dt, t + dt + 0.3); o.frequency.setValueAtTime(f0, t + dt); o.frequency.exponentialRampToValueAtTime(34, t + dt + 0.18);
    const g = a.createGain(); g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(0.9 * s * k, t + dt + 0.012); g.gain.exponentialRampToValueAtTime(0.001, t + dt + 0.26);
    chain(o, g, out);
    const n = noise(a, 'brown', t + dt, t + dt + 0.1), ng = env(a, [[t + dt, 0], [t + dt + 0.006, 0.5 * s * k], [t + dt + 0.08, 0]]); chain(n, filter(a, 'lowpass', 140), ng, out);
  }
}
/** A struck bell: inharmonic partials that ring and fade. */
function bell(a, out, t, f, s = 1, decay = 3.5) {
  [[1, 1], [2.76, 0.45], [5.4, 0.25], [8.93, 0.12], [0.5, 0.35]].forEach(([m, k]) => {
    const o = osc(a, 'sine', f * m, t, t + decay + 0.2), g = a.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.3 * s * k, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0008, t + decay * (1.2 - m / 12));
    chain(o, g, out);
  });
}
/** A swell that sucks in and cuts off, like a sound played backwards. */
function reverseSwell(a, out, t, len, s = 1, f = 1200) {
  const n = noise(a, 'white', t, t + len + 0.05), g = a.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5 * s, t + len); g.gain.linearRampToValueAtTime(0, t + len + 0.03);
  const lp = filter(a, 'lowpass', 300); lp.frequency.setValueAtTime(300, t); lp.frequency.exponentialRampToValueAtTime(f, t + len); chain(n, lp, g, out);
}

const SOUNDS = {
  /* Frenzy: a heart that speeds up until it hammers, and the Beast growling up through it. */
  frenzy(a, out, t, L) {
    let tt = t + 0.05, iv = 0.85; while (tt < t + L - 0.6) { beat(a, out, tt, 0.7 + 0.3 * (tt - t) / L); tt += iv; iv = Math.max(0.3, iv * 0.88); }
    // the growl: rough, throaty, swelling
    const g = env(a, [[t, 0], [t + 1.2, 0.05], [t + L * 0.55, 0.55], [t + L - 0.8, 0.6], [t + L, 0]]);
    const saw = osc(a, 'sawtooth', 58, t, t + L), vib = osc(a, 'sine', 5.5, t, t + L), vg = a.createGain(); vg.gain.value = 4; chain(vib, vg, saw.frequency);
    saw.frequency.setValueAtTime(52, t); saw.frequency.linearRampToValueAtTime(74, t + L);
    const rough = a.createGain(), am = osc(a, 'square', 27, t, t + L), amg = a.createGain(); amg.gain.value = 0.45; rough.gain.value = 0.55; chain(am, amg, rough.gain);
    chain(saw, shaper(a, 6), filter(a, 'lowpass', 520, 3), rough, g, out);
    const n = noise(a, 'brown', t, t + L), nb = filter(a, 'bandpass', 180, 1.6); chain(n, nb, rough);
    // a roar breaking through at the peak
    const r = noise(a, 'white', t + L * 0.45, t + L * 0.45 + 1.8), rb = filter(a, 'bandpass', 400, 2.5), rg = env(a, [[t + L * 0.45, 0], [t + L * 0.45 + 0.25, 0.35], [t + L * 0.45 + 1.8, 0]]);
    rb.frequency.setValueAtTime(350, t + L * 0.45); rb.frequency.linearRampToValueAtTime(900, t + L * 0.45 + 0.5); rb.frequency.linearRampToValueAtTime(420, t + L * 0.45 + 1.8); chain(r, rb, shaper(a, 4), rg, out);
  },
  /* Rötschreck: a whoosh of flame, roaring fire full of crackles, and a panicked heart. */
  rotschreck(a, out, t, L) {
    const w = noise(a, 'white', t, t + 1.6), wb = filter(a, 'bandpass', 200, 0.9); wb.frequency.setValueAtTime(180, t); wb.frequency.exponentialRampToValueAtTime(2600, t + 1.1);
    chain(w, wb, env(a, [[t, 0], [t + 0.6, 0.6], [t + 1.6, 0]]), out);
    const f = noise(a, 'brown', t, t + L), fl = filter(a, 'lowpass', 700, 0.7), fg = env(a, [[t, 0], [t + 0.8, 0.7], [t + L - 1, 0.6], [t + L, 0]]);
    const flick = osc(a, 'sine', 7.3, t, t + L), fk = a.createGain(); fk.gain.value = 250; chain(flick, fk, fl.frequency); chain(f, fl, fg, out);
    const hiss = noise(a, 'white', t, t + L); chain(hiss, filter(a, 'highpass', 3000), env(a, [[t, 0], [t + 1, 0.05], [t + L, 0]]), out);
    for (let i = 0; i < 160; i++) { const c = t + 0.3 + Math.random() * (L - 0.5), d = rnd(0.004, 0.025), n = noise(a, 'white', c, c + d + 0.01);
      chain(n, filter(a, 'highpass', rnd(1200, 4000)), env(a, [[c, 0], [c + 0.001, rnd(0.15, 0.6)], [c + d, 0]]), pan(a, rnd(-0.7, 0.7)), out); }
    let tt = t + 0.4; while (tt < t + L - 0.4) { beat(a, out, tt, 0.45); tt += 0.36; }
  },
  /* The Hunger: a slow heavy heart, a low ache under it, and a long breath in. */
  hunger(a, out, t, L) {
    let tt = t + 0.1; while (tt < t + L - 0.5) { beat(a, out, tt, 1); tt += 1.15; }
    const d1 = osc(a, 'sine', 41, t, t + L), d2 = osc(a, 'sine', 43.6, t, t + L), dg = env(a, [[t, 0], [t + 2, 0.35], [t + L - 1, 0.35], [t + L, 0]]); d1.connect(dg); d2.connect(dg); dg.connect(out);
    for (let b = t + 1.2; b < t + L - 2; b += 3.6) { const n = noise(a, 'white', b, b + 2.4), bp = filter(a, 'bandpass', 800, 3); bp.frequency.setValueAtTime(700, b); bp.frequency.linearRampToValueAtTime(1500, b + 2.2); chain(n, bp, env(a, [[b, 0], [b + 1.8, 0.16], [b + 2.3, 0]]), out); }
    const s = osc(a, 'sawtooth', 70, t + L * 0.4, t + L * 0.4 + 1.4), sl = filter(a, 'lowpass', 180, 6), wob = osc(a, 'sine', 3, t + L * 0.4, t + L * 0.4 + 1.4), wg = a.createGain(); wg.gain.value = 60; chain(wob, wg, sl.frequency);
    chain(s, sl, env(a, [[t + L * 0.4, 0], [t + L * 0.4 + 0.4, 0.22], [t + L * 0.4 + 1.4, 0]]), out);
  },
  /* Whispers: breathy voices at the edge of hearing, from every side. */
  whispers(a, out, t, L) {
    const bed = noise(a, 'white', t, t + L); chain(bed, filter(a, 'bandpass', 1400, 0.6), env(a, [[t, 0], [t + 3, 0.015], [t + L - 3, 0.015], [t + L, 0]]), out);
    for (let i = 0; i < Math.round(L * 1.1); i++) {
      const s = t + 0.3 + Math.random() * (L - 2), len = rnd(0.6, 1.8), n = noise(a, 'white', s, s + len + 0.05);
      const f1 = filter(a, 'bandpass', rnd(450, 900), 5), f2 = filter(a, 'bandpass', rnd(1300, 2700), 7), hp = filter(a, 'highpass', 350), g = a.createGain(); g.gain.setValueAtTime(0, s);
      let k = s; const peak = rnd(0.12, 0.38); while (k < s + len) { const syl = rnd(0.07, 0.19); g.gain.linearRampToValueAtTime(peak * rnd(0.4, 1), k + syl * 0.35); g.gain.linearRampToValueAtTime(peak * 0.08, k + syl); k += syl + rnd(0, 0.06); }
      g.gain.linearRampToValueAtTime(0, s + len + 0.04);
      const p = pan(a, rnd(-0.9, 0.9)); n.connect(f1); n.connect(f2); f1.connect(hp); f2.connect(hp); chain(hp, g, p, out);
    }
  },
  /* The Abyss: the bottom drops out of the world, a cold wind from below, and the silence closing over. */
  abyss(a, out, t, L) {
    const s1 = osc(a, 'triangle', 31, t, t + L), s2 = osc(a, 'triangle', 46.5, t, t + L), sg = env(a, [[t, 0], [t + 2.5, 0.6], [t + L - 1.5, 0.6], [t + L, 0]]); s1.connect(sg); s2.connect(sg); sg.connect(out);
    s1.frequency.linearRampToValueAtTime(26, t + L); s2.frequency.linearRampToValueAtTime(39, t + L);
    const w = noise(a, 'brown', t, t + L), wl = filter(a, 'bandpass', 320, 2.2), lfo = osc(a, 'sine', 0.13, t, t + L), lg = a.createGain(); lg.gain.value = 180; chain(lfo, lg, wl.frequency);
    chain(w, wl, env(a, [[t, 0], [t + 3, 0.35], [t + L - 1, 0.3], [t + L, 0]]), out);
    reverseSwell(a, out, t + 0.1, 2.4, 0.6, 900);
    const th = osc(a, 'sine', 55, t + 2.5, t + 3.4); th.frequency.setValueAtTime(55, t + 2.5); th.frequency.exponentialRampToValueAtTime(25, t + 3.3); chain(th, env(a, [[t + 2.5, 0], [t + 2.52, 0.9], [t + 3.4, 0]]), out);
  },
  /* Arms of the Abyss: wet, slithering things rising, and a creak like something huge stretching. */
  tentacles(a, out, t, L) {
    for (let i = 0; i < 7; i++) {
      const s = t + rnd(0, L * 0.5), len = rnd(1.5, 3.5), n = noise(a, 'white', s, s + len), bp = filter(a, 'bandpass', 400, 4), g = a.createGain(); g.gain.setValueAtTime(0, s);
      for (let k = s; k < s + len; k += rnd(0.04, 0.12)) { bp.frequency.setValueAtTime(rnd(180, 900), k); g.gain.linearRampToValueAtTime(rnd(0.05, 0.4), k); }
      g.gain.linearRampToValueAtTime(0, s + len); chain(n, bp, g, pan(a, rnd(-0.8, 0.8)), out);
    }
    const c = osc(a, 'sawtooth', 85, t + 0.5, t + L), cb = filter(a, 'bandpass', 300, 8); c.frequency.setValueAtTime(95, t + 0.5); c.frequency.linearRampToValueAtTime(62, t + L);
    const am = osc(a, 'square', 14, t + 0.5, t + L), ag = a.createGain(), cg = env(a, [[t + 0.5, 0], [t + 2, 0.18], [t + L - 1, 0.12], [t + L, 0]]); ag.gain.value = 0.5; chain(am, ag, cg.gain); chain(c, cb, cg, out);
    for (let k = t + 1; k < t + L - 1; k += rnd(1.2, 2.2)) { const o = osc(a, 'sine', 48, k, k + 0.5); o.frequency.exponentialRampToValueAtTime(28, k + 0.4); chain(o, env(a, [[k, 0], [k + 0.02, 0.6], [k + 0.5, 0]]), out); }
    const d = osc(a, 'sine', 33, t, t + L); chain(d, env(a, [[t, 0], [t + 2, 0.4], [t + L, 0]]), out);
  },
  /* The living shadow: a breath drawn in behind you and a footfall that isn't yours. */
  shadow(a, out, t, L) {
    reverseSwell(a, out, t + 0.3, 1.8, 0.35, 700);
    const d = osc(a, 'sine', 70, t + 1.8, t + L), dg = env(a, [[t + 1.8, 0], [t + 3, 0.25], [t + L, 0]]); d.frequency.setValueAtTime(70, t + 1.8); d.frequency.exponentialRampToValueAtTime(38, t + L); chain(d, dg, out);
    for (let k = t + 1.5, i = 0; k < t + L - 0.5; k += 0.95, i++) { const n = noise(a, 'brown', k, k + 0.2); chain(n, filter(a, 'lowpass', 260), env(a, [[k, 0], [k + 0.01, 0.4], [k + 0.18, 0]]), pan(a, -0.8 + i * 0.25), out); }
  },
  /* A Tremere ritual: a low chanted chord, and bells that strike the circle closed. */
  ritual(a, out, t, L) {
    const cg = env(a, [[t, 0], [t + 2, 0.22], [t + L - 1.2, 0.22], [t + L, 0]]);
    for (const [f, dt] of [[98, 0], [146.8, 3], [196, 1.5], [233, -4]]) {
      const o = osc(a, 'sawtooth', f, t, t + L); o.detune.value = dt;
      const v = filter(a, 'bandpass', 700, 4), v2 = filter(a, 'bandpass', 1150, 6), m = a.createGain(); m.gain.value = 0.5; o.connect(v); o.connect(v2); v.connect(m); v2.connect(m); m.connect(cg);
    }
    cg.connect(out);
    [0.4, 1.7, 3.0, 4.3].forEach((dt, i) => bell(a, out, t + dt, [392, 466, 523, 349][i], 0.5));
    bell(a, out, t + L - 2.2, 196, 1.1, 4);
  },
  /* Boiling blood: a heart, bubbling, and a hiss rising. */
  blood(a, out, t, L) {
    let tt = t + 0.1; while (tt < t + L - 0.4) { beat(a, out, tt, 0.6); tt += 0.7; }
    for (let i = 0; i < Math.round(L * 14); i++) { const s = t + 0.5 + Math.random() * (L - 1), f = rnd(250, 700), o = osc(a, 'sine', f, s, s + 0.06); o.frequency.exponentialRampToValueAtTime(f * rnd(1.8, 3), s + 0.05);
      chain(o, env(a, [[s, 0], [s + 0.005, rnd(0.05, 0.18)], [s + 0.055, 0]]), pan(a, rnd(-0.6, 0.6)), out); }
    const h = noise(a, 'white', t, t + L); chain(h, filter(a, 'highpass', 2500), env(a, [[t, 0], [t + L * 0.8, 0.12], [t + L, 0]]), out);
    const r = osc(a, 'triangle', 110, t, t + L); r.frequency.exponentialRampToValueAtTime(330, t + L); chain(r, env(a, [[t, 0], [t + L * 0.7, 0.08], [t + L, 0]]), out);
  },
  /* A ward flaring: a deep impact, then a ringing shimmer that climbs. */
  ward(a, out, t, L) {
    const o = osc(a, 'sine', 90, t, t + 1.2); o.frequency.exponentialRampToValueAtTime(36, t + 1); chain(o, env(a, [[t, 0], [t + 0.01, 1], [t + 1.2, 0]]), out);
    chain(noise(a, 'brown', t, t + 0.6), filter(a, 'lowpass', 300), env(a, [[t, 0], [t + 0.01, 0.6], [t + 0.6, 0]]), out);
    [1760, 2217, 2637, 3520, 4186].forEach((f, i) => { const s = t + 0.15 + i * 0.12, x = osc(a, 'sine', f, s, t + L), tr = osc(a, 'sine', 9 + i, s, t + L), tg = a.createGain(), g = env(a, [[s, 0], [s + 0.4, 0.06], [t + L - 0.8, 0.04], [t + L, 0]]);
      x.frequency.linearRampToValueAtTime(f * 1.06, t + L); tg.gain.value = 0.03; chain(tr, tg, g.gain); chain(x, g, pan(a, (i - 2) * 0.35), out); });
    bell(a, out, t + 0.05, 659, 0.6, 3);
  }
};

/** Rough loudness matching between the effects. */
const LEVEL = {whispers: 1.6, abyss: 0.6, ritual: 1.7, shadow: 1.6, blood: 1.3, rotschreck: 1.2};
/** Play an effect's sound (if it has one). */
export function playSound(kind, seconds) {
  const f = SOUNDS[kind]; if (!f) return false;
  try { const a = ac(); if (!a) return false; const out = bus(a, 0.9 * (LEVEL[kind] ?? 1)); f(a, out, a.currentTime + 0.03, Math.max(2, seconds)); setTimeout(() => out.done(), (seconds + 6) * 1000); return true; }
  catch (e) { console.warn('wod-city-atlas | effect sound', e); return false; }
}
export const HAS_SOUND = new Set(Object.keys(SOUNDS));
