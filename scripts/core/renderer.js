/* Canvas renderer for an atlas view. Draws base geography, zones, glows, routes, effects and labels. */
import {zw, withAlpha, glyphPath, inPoly, segDist, rng, bbOf, shortName} from './util.js';

export const FONTS = {
  title: "'Pirata One', 'UnifrakturCook', Georgia, serif",
  head: "'IM Fell English', Georgia, 'Times New Roman', serif",
  sc: "'IM Fell English SC', 'IM Fell English', Georgia, serif",
  body: "'Alegreya Sans', 'Gill Sans', 'Trebuchet MS', system-ui, sans-serif"
};

/* ---------- Dreaming art: realms drawn as living pictures rather than outlines (zone.art) ----------
 * ward: towers of unbuilt projects with twinkling windows · wolf: slowly turning rings · index: drifting books
 * orchard: three glass fruits · seat: the black mountain on the starlit lake, bobbing, with its river of light. */
const still = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOWERS = new WeakMap();
const ART = {
  ward(zn, g, on) {
    const x = this.ctx, T = still() ? 0 : this.v.T, s = this.s(), deep = zn.level === 'deep';
    const [x0, y0] = this.ts([g.bb[0], g.bb[1]]), [x1, y1] = this.ts([g.bb[2], g.bb[3]]);
    x.beginPath(); g.rings.forEach(r => this.path(r, true));
    const gr = x.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(255,190,120,.20)'); gr.addColorStop(1, 'rgba(90,150,255,.20)'); x.fillStyle = gr; x.fill('evenodd');
    x.strokeStyle = on ? 'rgba(170,215,255,.95)' : 'rgba(150,200,255,.5)'; x.lineWidth = on ? 2.4 : 1.4; x.setLineDash([5, 5]); x.lineDashOffset = -T * 3; x.stroke(); x.setLineDash([]); x.lineDashOffset = 0;
    if (this.cam.z < 12.2) return;
    let tw = TOWERS.get(g);
    if (!tw) {
      const R = rng(1991 + zn.id.length * 7), [a, b, c, d] = g.bb, ring = g.rings[0]; tw = [];
      for (let n = 0, tries = 0; n < (deep ? 26 : 70) && tries < 4000; tries++) { const pt = [a + R() * (c - a), b + R() * (d - b)]; if (!inPoly(pt, [ring])) continue; tw.push({w: pt, hgt: 1.6 + R() * 3.2, wid: 0.75 + R() * 0.6, win: Array.from({length: 6}, () => R()), ph: R() * 6.28}); n++; }
      tw.sort((p, q) => p.w[1] - q.w[1]); TOWERS.set(g, tw);
    }
    const unit = Math.max(3, 70 / this.mpp());
    for (const t of tw) {
      const [px, py] = this.ts(t.w); if (px < -40 || py < -80 || px > this.cam.W + 40 || py > this.cam.H + 20) continue;
      const w = unit * t.wid, h = unit * t.hgt * 1.6, sway = still() ? 0 : Math.sin(T * 0.3 + t.ph) * w * 0.04;
      x.fillStyle = '#1c1738'; x.fillRect(px - w / 2 + sway, py - h, w, h); x.strokeStyle = 'rgba(160,200,255,.35)'; x.lineWidth = 0.8; x.strokeRect(px - w / 2 + sway, py - h, w, h);
      x.fillStyle = 'rgba(60,110,70,.55)'; x.fillRect(px - w / 2 + sway, py - h * 0.45, w * 0.25, h * 0.45);
      if (w > 5) t.win.forEach((v, i) => { if (v < 0.45) return; const lit = 0.6 + 0.4 * Math.sin(T * 0.9 + t.ph + i); x.fillStyle = `rgba(120,190,255,${0.55 * lit})`; x.fillRect(px - w / 2 + sway + w * 0.2 + (i % 2) * w * 0.42, py - h + h * 0.12 + Math.floor(i / 2) * h * 0.27, Math.max(1.2, w * 0.18), Math.max(1.2, h * 0.1)); });
    }
  },
  wolf(zn, g, on) {
    const x = this.ctx, T = still() ? 0 : this.v.T;
    x.beginPath(); g.rings.forEach(r => this.path(r, true)); x.fillStyle = 'rgba(150,200,170,.10)'; x.fill('evenodd');
    x.strokeStyle = on ? 'rgba(190,240,210,.9)' : 'rgba(170,220,190,.55)'; x.lineWidth = on ? 2.2 : 1.3; x.setLineDash([1, 5]); x.stroke(); x.setLineDash([]);
    const [cx, cy] = this.ts([(g.bb[0] + g.bb[2]) / 2, (g.bb[1] + g.bb[3]) / 2]), R = Math.max(18, 380 / this.mpp());
    for (let i = 0; i < 3; i++) { x.beginPath(); x.ellipse(cx, cy, R * (0.35 + i * 0.22), R * (0.2 + i * 0.13), T * 0.15 * (i % 2 ? 1 : -1) + i, 0, 6.283); x.strokeStyle = `rgba(190,235,205,${0.35 - i * 0.08})`; x.lineWidth = 1; x.setLineDash([3, 7]); x.lineDashOffset = -T * 6; x.stroke(); }
    x.setLineDash([]); x.lineDashOffset = 0;
    // the eye: it opens slowly, looks about, and half-closes again
    const open = 0.55 + 0.45 * Math.sin(T * 0.21), look = Math.sin(T * 0.37) * R * 0.05;
    x.beginPath(); x.ellipse(cx, cy, R * 0.16, R * 0.08 * open, 0, 0, 6.283); x.fillStyle = 'rgba(220,255,225,.18)'; x.fill();
    x.beginPath(); x.arc(cx + look, cy, R * 0.035 * open + 0.6, 0, 6.283); x.fillStyle = 'rgba(230,255,235,.5)'; x.fill();
  },
  index(zn, g, on) {
    const x = this.ctx, T = still() ? 0 : this.v.T;
    const [cx, cy] = this.ts([(g.bb[0] + g.bb[2]) / 2, (g.bb[1] + g.bb[3]) / 2]), R = Math.max(16, (g.bb[2] - g.bb[0]) / 2 * this.s());
    const gr = x.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, 'rgba(240,210,150,.22)'); gr.addColorStop(1, 'rgba(240,210,150,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
    if (on) { x.strokeStyle = 'rgba(240,215,160,.7)'; x.lineWidth = 1.5; x.setLineDash([4, 4]); x.stroke(); x.setLineDash([]); }
    for (let i = 0; i < 16; i++) {
      const a = i * 0.393 + T * 0.05 * (i % 3 ? 1 : -1), rr = R * (0.3 + (i % 5) * 0.14), px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * 0.6 + Math.sin(T * 0.8 + i) * 2, L = Math.max(6, R * 0.18);
      x.save(); x.translate(px, py); x.rotate(a * 0.7 + i); x.fillStyle = 'rgba(60,40,30,.85)'; x.fillRect(-L / 2, -L * 0.18, L, L * 0.36);
      x.strokeStyle = 'rgba(240,205,140,.75)'; x.lineWidth = 0.8; x.strokeRect(-L / 2, -L * 0.18, L, L * 0.36);
      for (let k = 1; k < 5; k++) { x.beginPath(); x.moveTo(-L / 2 + k * L / 5, -L * 0.18); x.lineTo(-L / 2 + k * L / 5, L * 0.18); x.stroke(); }
      x.restore();
    }
  },
  orchard(zn, g, on) {
    const x = this.ctx, T = still() ? 0 : this.v.T;
    const [cx, cy] = this.ts([(g.bb[0] + g.bb[2]) / 2, (g.bb[1] + g.bb[3]) / 2]), R = Math.max(14, (g.bb[2] - g.bb[0]) / 2 * this.s());
    [[-0.55, 0.15, '120,230,150'], [0.55, 0.15, '240,205,130'], [0, -0.45, '250,160,200']].forEach(([dx, dy, c], i) => {
      const b = Math.sin(T * 0.6 + i * 2.1) * R * 0.03, fx = cx + dx * R, fy = cy + dy * R + b, rr = R * 0.48;
      const gr = x.createRadialGradient(fx - rr * 0.3, fy - rr * 0.35, rr * 0.1, fx, fy, rr); gr.addColorStop(0, `rgba(${c},.55)`); gr.addColorStop(0.7, `rgba(${c},.18)`); gr.addColorStop(1, `rgba(${c},.05)`);
      x.fillStyle = gr; x.beginPath(); x.arc(fx, fy, rr, 0, 6.283); x.fill(); x.strokeStyle = `rgba(${c},${on ? 0.95 : 0.6})`; x.lineWidth = 1.2; x.stroke();
      x.beginPath(); x.arc(fx - rr * 0.35, fy - rr * 0.35, rr * 0.18, 0, 6.283); x.fillStyle = 'rgba(255,255,255,.25)'; x.fill();
      // a season turning inside each fruit
      const a = T * 0.4 + i * 2; x.beginPath(); x.arc(fx + Math.cos(a) * rr * 0.45, fy + Math.sin(a) * rr * 0.45, Math.max(1, rr * 0.07), 0, 6.283); x.fillStyle = `rgba(${c},.85)`; x.fill();
    });
  },
  seat(zn, g, on) {
    const x = this.ctx, T = still() ? 0 : this.v.T, mpp = this.mpp();
    const home = zn.ref && this.m.atlas.places[zn.ref] && this.m.atlas.places[zn.ref].at;
    const [sx, yb] = this.ts(home ? this.m.proj.toWorld(home) : [(g.bb[0] + g.bb[2]) / 2, (g.bb[1] + g.bb[3]) / 2]);
    // the pale river of light across the lake
    const [ex, ey] = this.ts(this.m.proj.toWorld([43.30, -87.40]));
    x.lineCap = 'round';
    [[90, 0.05], [44, 0.07], [14, 0.12], [3, 0.25]].forEach(([w, a]) => { x.beginPath(); x.moveTo(sx, yb); x.bezierCurveTo(sx + (ex - sx) * 0.35, yb - 40, sx + (ex - sx) * 0.7, ey + (yb - ey) * 0.3, ex, ey); x.strokeStyle = `rgba(214,222,255,${a * (0.85 + 0.15 * Math.sin(T * 0.5 + w))})`; x.lineWidth = w; x.stroke(); });
    const y = yb + Math.sin(T * 0.4) * 2.5, H = Math.max(60, Math.min(330, 2600 / mpp)), Wd = H * 0.42;
    if (sx < -Wd * 2 || sx > this.cam.W + Wd * 2 || y < -H * 2 || y > this.cam.H + H * 2) return;
    const halo = x.createRadialGradient(sx, y - H * 0.5, 0, sx, y - H * 0.5, H * 1.1); halo.addColorStop(0, on ? 'rgba(170,180,255,.30)' : 'rgba(150,160,255,.18)'); halo.addColorStop(1, 'rgba(150,160,255,0)');
    x.fillStyle = halo; x.fillRect(sx - H * 1.2, y - H * 1.6, H * 2.4, H * 2.4);
    const blade = [[-0.5, 0], [-0.34, -0.22], [-0.28, -0.18], [-0.16, -0.55], [-0.06, -0.62], [0.02, -1], [0.09, -0.7], [0.2, -0.58], [0.27, -0.3], [0.36, -0.26], [0.5, 0]];
    x.beginPath(); blade.forEach(([px, py], i) => { const X = sx + px * Wd * 2, Y = y - py * H * 0.85; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.closePath();
    const rg = x.createLinearGradient(0, y, 0, y + H * 0.85); rg.addColorStop(0, 'rgba(60,70,140,.45)'); rg.addColorStop(1, 'rgba(60,70,140,0)'); x.fillStyle = rg; x.fill();
    x.beginPath(); x.ellipse(sx, y - H * 0.5, Wd * 1.25, H * 0.05, 0, 0, 6.283); x.strokeStyle = 'rgba(190,200,255,.25)'; x.lineWidth = 1; x.setLineDash([2, 4]); x.lineDashOffset = -T * 4; x.stroke(); x.setLineDash([]); x.lineDashOffset = 0;
    x.beginPath(); blade.forEach(([px, py], i) => { const X = sx + px * Wd * 2, Y = y + py * H; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.closePath();
    const mg = x.createLinearGradient(sx - Wd, y - H, sx + Wd, y); mg.addColorStop(0, '#1a1830'); mg.addColorStop(1, '#05040b'); x.fillStyle = mg; x.fill();
    x.strokeStyle = on ? 'rgba(200,210,255,.95)' : 'rgba(170,185,255,.7)'; x.lineWidth = 1.4; x.stroke();
    [[-0.05, -0.18], [0.12, -0.34], [0.03, -0.52]].forEach(([px, py], i) => { const t = 0.7 + 0.3 * Math.sin(T * 1.7 + i * 2); x.fillStyle = `rgba(255,214,150,${0.8 * t})`; x.fillRect(sx + px * Wd * 2 - 1.5, y + py * H - 3, 3, 5); });
    const ps = 0.75 + 0.25 * Math.sin(T * 2.3), tx = sx + 0.04 * Wd, ty = y - H - 4;
    x.fillStyle = `rgba(255,248,220,${ps})`; x.beginPath(); x.arc(tx, ty, 2.4, 0, 6.283); x.fill();
    x.strokeStyle = `rgba(255,248,220,${0.5 * ps})`; x.lineWidth = 1; x.beginPath(); x.moveTo(tx - 9, ty); x.lineTo(tx + 9, ty); x.moveTo(tx, ty - 9); x.lineTo(tx, ty + 9); x.stroke();
  }
};

export class Renderer {
  constructor(view) {
    this.v = view;
    this.patterns = new Map(); this._patKeys = new WeakMap(); this._autoPats = new WeakMap();
    this.effectCache = new Map(); this.widths = new Map();
    // web fonts arriving change the width of every label
    try { document.fonts?.addEventListener?.('loadingdone', () => { this.widths.clear(); this._key = null; this.v.dirty?.(); }); } catch (e) {}
    this.images = new Map();
    this.boxes = [];
  }
  get m() { return this.v.model; }
  get ctx() { return this._ctx || this.v.ctx; }
  get cam() { return this.v.cam; }

  /* ---------- camera helpers ---------- */
  s() { return Math.pow(2, this.cam.z); }
  ts(w) { const c = this.cam, s = this.s(); return [(w[0] - c.cx) * s + c.W / 2, (w[1] - c.cy) * s + c.H / 2]; }
  vis(bb, pad = 40) { if (!bb) return false; const c = this.cam, s = this.s(); const x0 = (bb[0] - c.cx) * s + c.W / 2, x1 = (bb[2] - c.cx) * s + c.W / 2, y0 = (bb[1] - c.cy) * s + c.H / 2, y1 = (bb[3] - c.cy) * s + c.H / 2; return !(x1 < -pad || x0 > c.W + pad || y1 < -pad || y0 > c.H + pad); }
  mpp() { return this.m.proj.mpu(this.cam.cy) / this.s(); }
  /** Add a polyline (world coordinates) to the current path. */
  path(w, close) { const c = this.cam, s = this.s(), ox = c.W / 2 - c.cx * s, oy = c.H / 2 - c.cy * s, x = this.ctx; x.moveTo(w[0][0] * s + ox, w[0][1] * s + oy); for (let i = 1; i < w.length; i++) x.lineTo(w[i][0] * s + ox, w[i][1] * s + oy); if (close) x.closePath(); }
  font(key) { const f = this.m.atlas.fonts || {}; return f[key] || FONTS[key] || FONTS.body; }
  image(src) {
    if (!src) return null;
    let im = this.images.get(src);
    if (!im) { im = new Image(); im.decoding = 'async'; im.onload = () => { this.loaded = (this.loaded || 0) + 1; this.v.dirty(); }; im.onerror = () => { im._bad = true; }; im.src = this.v.resolveUrl(src); this.images.set(src, im); }
    return im.complete && im.naturalWidth && !im._bad ? im : null;
  }

  /** A small round sprite of one colour (soft = a glow fading out), drawn once and stamped: cheaper than a path or gradient per dot. */
  sprite(col, soft) {
    const key = col + (soft ? ':soft' : ':dot'); let cv = this.patterns.get(key); if (cv) return cv;
    cv = document.createElement('canvas'); cv.width = cv.height = soft ? 48 : 16; const g = cv.getContext('2d'), r = cv.width / 2;
    if (soft) { const gr = g.createRadialGradient(r, r, 0, r, r, r); gr.addColorStop(0, withAlpha(col, 1)); gr.addColorStop(1, withAlpha(col, 0)); g.fillStyle = gr; g.fillRect(0, 0, 2 * r, 2 * r); }
    else { g.fillStyle = col; g.beginPath(); g.arc(r, r, r - 0.5, 0, 6.283); g.fill(); }
    this.patterns.set(key, cv); return cv;
  }

  /* ---------- patterns ---------- */
  pattern(p) {
    const d = this.cam.dpr; let k0 = this._patKeys.get(p); if (!k0) { k0 = JSON.stringify(p); this._patKeys.set(p, k0); } const key = k0 + '@' + d;
    let pat = this.patterns.get(key);
    if (!pat) {
      const g = p.size || 8, cv = document.createElement('canvas'); cv.width = cv.height = Math.max(2, Math.round(g * d));
      const x = cv.getContext('2d'); x.scale(d, d);
      if (p.bg) { x.fillStyle = p.bg; x.fillRect(0, 0, g, g); }
      x.strokeStyle = x.fillStyle = p.color || 'rgba(255,255,255,.3)'; x.lineWidth = p.width || 1; x.lineCap = 'round'; x.lineJoin = 'round';
      const L = (a, b, c, e) => { x.beginPath(); x.moveTo(a, b); x.lineTo(c, e); x.stroke(); };
      switch (p.kind) {
        case 'dot': x.beginPath(); x.arc(g / 2, g / 2, p.width || 1, 0, Math.PI * 2); x.fill(); break;
        case 'h': L(0, g / 2, g, g / 2); break;
        case 'v': L(g / 2, 0, g / 2, g); break;
        case 'grid': L(0, 0.5, g, 0.5); L(0.5, 0, 0.5, g); break;
        case 'cross': L(g / 2, g / 2 - 3, g / 2, g / 2 + 3); L(g / 2 - 2, g / 2 - 1, g / 2 + 2, g / 2 - 1); break;
        case 'glyph': { const s = g * 0.55 / 16; x.save(); x.translate(g * 0.22, g * 0.22); x.scale(s, s); x.lineWidth = (p.width || 1) / s; x.stroke(glyphPath(p.glyph || 'star')); x.restore(); break; }
        case 'nw': x.beginPath(); for (let o = -g; o <= g * 2; o += g) { x.moveTo(o, 0); x.lineTo(o + g, g); } x.stroke(); break;
        default: x.beginPath(); for (let o = -g; o <= g * 2; o += g) { x.moveTo(o, g); x.lineTo(o + g, 0); } x.stroke(); // ne
      }
      pat = this.ctx.createPattern(cv, 'repeat'); this.patterns.set(key, pat);
    }
    const s = this.s(), c = this.cam; if (pat.setTransform) pat.setTransform(new DOMMatrix([1 / d, 0, 0, 1 / d, c.W / 2 - c.cx * s, c.H / 2 - c.cy * s]));
    return pat;
  }

  /** Pattern colours may be 'auto' or 'auto:0.3' = the item's colour at that opacity. */
  autoPat(p, col) {
    if (!/^auto/.test(p.color || '') && !/^auto/.test(p.bg || '')) return p;
    let by = this._autoPats.get(p); if (!by) this._autoPats.set(p, by = new Map()); let out = by.get(col); if (out) return out;
    const r = c => { const m = /^auto(?::([\d.]+))?$/.exec(c || ''); return m ? withAlpha(col, m[1] ? +m[1] : 0.35) : c; };
    out = Object.assign({}, p, {color: r(p.color), bg: r(p.bg)}); by.set(col, out); return out;
  }

  /* ---------- frame ----------
   * Between animation ticks almost nothing changes, so a view that can (a live AtlasView, not a still picture or the
   * editor) keeps what is still in two cached layers: the map under the moving parts, and the lettering on top.
   * A tick then only blits them and draws what moves (flowing lines, pulsing glows, motes, water). */
  draw() {
    const v = this.v;
    if (v.stateRev === undefined || v.bare || v.editor) { this.phase = null; return this.drawAll(); }
    const c = this.cam, x = v.ctx, cv = x.canvas;
    const key = [c.cx, c.cy, c.z, cv.width, cv.height, this.m.rev, v.stateRev, v.hover, v.sel, v.clearBase, v.tab, v.q, this.loaded].join('|');
    if (key !== this._key || v.rv !== this._rv) {
      this._key = key; this._rv = v.rv;
      for (const k of ['under', 'over']) { const L = this[k] ||= document.createElement('canvas'); if (L.width !== cv.width || L.height !== cv.height) { L.width = cv.width; L.height = cv.height; } }
      const [pre, , post] = this.atmosphere();
      this._ctx = this.under.getContext('2d'); this.reset(true); this.phase = 'static'; this.drawMap(); pre.forEach(e => this.effect(e));
      this._ctx = this.over.getContext('2d'); this.reset(true); post.forEach(e => this.effect(e)); this.drawLettering();
      this._ctx = null;
    }
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, cv.width, cv.height); x.drawImage(this.under, 0, 0);
    this.reset(false); this.phase = 'moving'; this.drawMap(); this.atmosphere()[1].forEach(e => this.effect(e));
    x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(this.over, 0, 0); this.phase = null;
  }
  /** Everything in one go (still pictures, the editor). */
  drawAll() { this.reset(true); this.drawMap(); if (this.v.bare) return; this.drawAtmosphere(); this.drawLettering(); if (this.v.editor) this.v.editor.drawOverlay(this.ctx); }
  reset(clear) {
    const x = this.ctx, c = this.cam;
    x.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.lineCap = 'round'; x.lineJoin = 'round'; x.setLineDash([]);
    if (clear) x.clearRect(0, 0, c.W, c.H);
  }
  /** Does this part move with time? In the 'static' phase it is left out, in the 'moving' phase it is all that is drawn. */
  skip(moving) { return this.phase === 'static' ? moving : this.phase === 'moving' ? !moving : false; }
  drawMap() {
    const v = this.v, x = this.ctx, c = this.cam, view = v.rv, still = this.phase !== 'moving';
    // clearBase: the plain map is already underneath (a Foundry scene picture), so only draw what is on top of it.
    if (!v.clearBase && still) {
      x.fillStyle = view.bg; x.fillRect(0, 0, c.W, c.H);
      for (const e of view.effects) if (e.under && this.effectOn(e)) this.effect(e);
      this.drawBackground(view);
    }
    if (!v.clearBase) this.drawBase(view);
    if (v.bare) return; // just the map itself (a neutral scene background)
    if (!this.skip(true)) for (const e of view.effects) if (!e.under && e.clip && this.effectOn(e)) this.effect(e);
    if (still) this.drawEcho(view);
    this.drawZones();
    this.drawAuras();
    this.drawRoutes();
    if (still) this.drawThreads(view);
  }
  /** Fog, motes, vignette: over the map, under the lettering. Split into the still ones below the first moving one,
   *  the stretch that has to be drawn every tick, and the still ones above the last moving one (cached with the lettering). */
  atmosphere() {
    const list = this.v.rv.effects.filter(e => !e.under && !e.clip && this.effectOn(e)), moving = e => ['stars', 'waves', 'particles'].includes(e.type) && e.twinkle !== false;
    const a = list.findIndex(moving); if (a < 0) return [list, [], []];
    let b = list.length - 1; while (!moving(list[b])) b--;
    return [list.slice(0, a), list.slice(a, b + 1), list.slice(b + 1)];
  }
  drawAtmosphere() { for (const e of this.v.rv.effects) if (!e.under && !e.clip && this.effectOn(e)) this.effect(e); }
  drawLettering() {
    const v = this.v; this.boxes = v.markerBoxes();
    if (!v.noLabels) { this.drawZoneLabels(); this.drawLabels(v.rv); this.drawFeatureLabels(v.rv); }
  }
  effectOn(e) { return (!e.layer || this.v.layerOn(e.layer)) && (!e.minZoom || this.cam.z >= e.minZoom); }

  drawBackground(view) {
    const bgi = view.background; if (!bgi || !bgi.src) return;
    const im = this.image(bgi.src); if (!im) return;
    const W = this.m.proj.toWorld;
    const a = W(bgi.bounds ? bgi.bounds[0] : [0, 0]), b = W(bgi.bounds ? bgi.bounds[1] : [bgi.w || im.naturalWidth, bgi.h || im.naturalHeight]);
    const p = this.ts([Math.min(a[0], b[0]), Math.min(a[1], b[1])]), q = this.ts([Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
    const x = this.ctx; x.save(); x.globalAlpha = bgi.alpha ?? 1; if (bgi.filter) x.filter = bgi.filter; x.imageSmoothingQuality = 'high'; x.drawImage(im, p[0], p[1], q[0] - p[0], q[1] - p[1]); x.restore();
  }

  /* ---------- base geography ---------- */
  drawBase(view) {
    const x = this.ctx, z = this.cam.z, st = this.v.st, shows = this.m.levelShows(st.realm, st.level);
    for (const f of this.m.baseGeo()) {
      const style = view.styles[f.c]; if (!style) continue;
      if (f.layer && !this.v.layerOn(f.layer)) continue;
      if (f.realm && f.realm !== st.realm) continue;
      if (f.level && !shows.includes(f.level)) continue;
      if (!this.vis(f.bb, 60)) continue;
      for (const p of this.m.passes(style)) {
        if (p.minZoom && z < p.minZoom || p.maxZoom && z > p.maxZoom) continue;
        if (p.layer && !this.v.layerOn(p.layer)) continue;
        if (this.skip(!!(p.flow && p.stroke))) continue;
        x.beginPath();
        if (f.rings) f.rings.forEach(r => this.path(r, true)); else f.lines.forEach(l => { if (l.length > 1) this.path(l); });
        x.globalAlpha = p.alpha ?? 1;
        if (f.rings && (p.fill || p.pattern)) { x.fillStyle = p.pattern ? this.pattern(p.pattern) : p.fill; x.fill('evenodd'); if (p.pattern && p.fill) { x.fillStyle = p.fill; x.fill('evenodd'); } }
        if (p.stroke) { x.strokeStyle = p.stroke; x.lineWidth = zw(p.width ?? 1, z) * (p.add !== undefined && p.mul === false ? 1 : (f.w || 1)) + (p.add || 0); x.setLineDash(p.dash || []); x.lineDashOffset = p.flow ? -this.v.T * 14 * p.flow : 0; x.stroke(); x.setLineDash([]); x.lineDashOffset = 0; }
        x.globalAlpha = 1;
      }
    }
  }

  /* ---------- zones ---------- */
  /** What the viewer may see of a collection right now, worked out once per change of atlas or view state. */
  listOf(coll, make) {
    const v = this.v, st = v.st, key = v.stateRev === undefined ? null : [this.m.rev, v.stateRev, st.realm, st.level, st.as, st.storyteller].join('|');
    if (key === null) return make();
    const c = (this._lists ||= {})[coll]; if (c && c.key === key) return c.list;
    const list = make(); this._lists[coll] = {key, list}; return list;
  }
  zoneList() {
    const st = this.v.st;
    return this.listOf('zones', () => Object.values(this.m.atlas.zones).filter(z => this.m.visible(z, 'zones', st) && !this.v.isHiddenItem(z.id)).sort((a, b) => (a.order ?? 10) - (b.order ?? 10)));
  }
  auraList() { const st = this.v.st; return this.listOf('auras', () => Object.values(this.m.atlas.auras).filter(a => a.at && this.m.visible(a, 'auras', st))); }
  drawZones() { for (const z of this.zoneList()) if (!this.skip(this.m.moves(z.style) || !!z.art)) this.drawZone(z); }
  drawZone(zn, opts = {}) {
    const g = this.m.geo(zn, 'zones'); if (!g.rings || !g.rings.length || !this.vis(g.bb, 200)) return;
    const x = this.ctx, z = this.cam.z, on = !opts.echo && (this.v.sel === zn.id || this.v.hover === zn.id || this.v.sel === zn.ref || this.v.hover === zn.ref);
    const unknown = !opts.echo && this.m.tier(zn, 'zones', this.v.st) < 2;
    const col = unknown ? '#9a9aa4' : (opts.color || this.m.colorOf(zn, this.v.st));
    const st0 = zn.style || (zn.domainStatus && this.m.atlas.styles['domain-' + zn.domainStatus] ? 'domain-' + zn.domainStatus : null);
    const passes = opts.echo ? [opts.echo] : unknown ? [{stroke: 'rgba(200,200,210,.55)', width: 1.3, dash: [3, 5], fill: '#9a9aa4', fillAlpha: 0.05}] : this.m.passes(st0 || {stroke: col, width: 1.6, fill: col, fillAlpha: 0.12});
    const mk = () => { x.beginPath(); g.rings.forEach(r => this.path(r, true)); };
    const base = opts.alpha ?? 1;
    if (zn.art && !opts.echo && !unknown && ART[zn.art]) { ART[zn.art].call(this, zn, g, on); x.globalAlpha = 1; if (on) this.hoverInside(mk, col); return; }
    for (const p of passes) {
      if (p.minZoom && z < p.minZoom || p.maxZoom && z > p.maxZoom) continue;
      mk();
      const fa = p.fillAlpha ?? (p.fill ? 1 : 0);
      if (fa > 0 || p.fill) {
        x.globalAlpha = base * (on ? Math.min(1, fa * 1.9 + 0.04) : fa) || 0;
        if (p.fill2) { const [x0, y0] = this.ts([g.bb[0], g.bb[1]]), [x1, y1] = this.ts([g.bb[2], g.bb[3]]); const gr = x.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, p.fill || col); gr.addColorStop(1, p.fill2); x.fillStyle = gr; }
        else x.fillStyle = (p.fill && p.fill !== 'auto') ? p.fill : col;
        if (x.globalAlpha > 0) x.fill('evenodd');
      }
      if (p.pattern) { x.globalAlpha = base * 0.85; x.fillStyle = this.pattern(this.autoPat(p.pattern, col)); x.fill('evenodd'); }
      if (zn.fillImage && !opts.echo && p === passes[0]) this.zoneImage(zn, g);
      if (p.glow) { mk(); x.globalAlpha = base * (p.glow.alpha ?? 0.15); x.strokeStyle = p.glow.color || col; x.lineWidth = p.glow.width || 6; x.stroke(); }
      if (p.casing) { x.globalAlpha = base; x.strokeStyle = p.casing.color; x.lineWidth = zw(p.width ?? 1.6, z) + (p.casing.width || 3); x.setLineDash([]); x.stroke(); }
      if (p.stroke !== null && (p.width ?? 1) > 0.02) {
        x.globalAlpha = base * (p.strokeAlpha ?? 1) * (on && p.strokeAlpha ? 1 / p.strokeAlpha : 1);
        x.strokeStyle = p.stroke || col; x.lineWidth = zw(p.width ?? 1.6, z); x.setLineDash(p.dash || []); x.lineDashOffset = p.flow ? -this.v.T * 8 * p.flow : 0; x.stroke(); x.setLineDash([]); x.lineDashOffset = 0;
      }
    }
    if (on && !opts.echo) this.hoverInside(mk, col);
    if (this.v.sel === zn.id && !opts.echo) { mk(); x.globalAlpha = 1; x.strokeStyle = 'rgba(255,240,210,.35)'; x.lineWidth = 1; x.stroke(); }
    x.globalAlpha = 1;
  }
  /** Hover and selection light the inside of the zone (a soft wash and an inner glow along its edge), never the far side
   *  of a border it shares with a neighbour. */
  hoverInside(mk, col) {
    const x = this.ctx; x.save(); mk(); x.clip('evenodd');
    x.globalAlpha = 0.14; x.fillStyle = col; x.fill('evenodd');
    mk(); x.globalAlpha = 0.55; x.strokeStyle = col; x.lineWidth = 7; x.setLineDash([]); x.stroke();
    mk(); x.globalAlpha = 0.95; x.lineWidth = 2.4; x.stroke();
    x.restore(); x.globalAlpha = 1;
  }
  zoneImage(zn, g) {
    const fi = zn.fillImage; if (fi.minZoom && this.cam.z < fi.minZoom) return; const im = this.image(fi.src); if (!im) return;
    const x = this.ctx; x.save(); x.beginPath(); g.rings.forEach(r => this.path(r, true)); x.clip();
    const [x0, y0] = this.ts([g.bb[0], g.bb[1]]), [x1, y1] = this.ts([g.bb[2], g.bb[3]]);
    x.globalAlpha = Math.min(fi.alpha ?? 1, fi.minZoom ? (this.cam.z - fi.minZoom) * 0.5 : 1); x.drawImage(im, x0, y0, x1 - x0, y1 - y0); x.restore();
  }
  drawEcho(view) {
    const e = view.echo; if (!e || (e.layer && !this.v.layerOn(e.layer))) return;
    const st = Object.assign({}, this.v.st, {realm: e.realm, level: e.level || this.m.realm(e.realm).levels[0].id, layerOn: () => true, catOn: () => true});
    for (const zn of Object.values(this.m.atlas.zones)) {
      if (!this.m.visible(zn, 'zones', st) || (e.layers && !e.layers.includes(zn.layer))) continue;
      this.drawZone(zn, {echo: {width: 1.2, dash: [2, 5], stroke: this.m.colorOf(zn, this.v.st), fillAlpha: 0, strokeAlpha: e.alpha ?? 0.28}, color: this.m.colorOf(zn, this.v.st)});
    }
  }

  /* ---------- routes ---------- */
  routeList() { const st = this.v.st; return this.listOf('routes', () => Object.values(this.m.atlas.routes).filter(r => this.m.visible(r, 'routes', st) && !this.v.isHiddenItem(r.id))); }
  drawRoutes() {
    const x = this.ctx, z = this.cam.z, T = this.v.T;
    for (const r of this.routeList()) {
      if (this.skip(this.m.moves(r.style))) continue;
      const g = this.m.geo(r, 'routes'); if (!g.parts || !g.parts.length || !this.vis(g.bb, 60)) continue;
      const on = this.v.sel === r.id || this.v.hover === r.id, unknown = this.m.tier(r, 'routes', this.v.st) < 2, col = unknown ? '#9a9aa4' : this.m.colorOf(r, this.v.st);
      const passes = unknown ? [{stroke: 'rgba(200,200,210,.5)', width: 1.6, dash: [2, 6]}] : this.m.passes(r.style || {stroke: col, width: 2.4, dash: [6, 4]});
      for (const p of passes) {
        if (p.minZoom && z < p.minZoom || p.maxZoom && z > p.maxZoom) continue;
        let parts = g.parts;
        if (p.broken) parts = parts.flatMap(w => [w.slice(0, Math.max(2, Math.floor(w.length * 0.42))), w.slice(Math.ceil(w.length * 0.58))]).filter(w => w.length > 1);
        const fl = p.flicker ? 0.55 + 0.45 * Math.abs(Math.sin(T * 2.6 + r.id.length)) : 1;
        const mk = () => { x.beginPath(); parts.forEach(w => this.path(w)); };
        if (p.glow) { mk(); x.globalAlpha = (p.glow.alpha ?? 0.16) * fl * (on ? 2 : 1); x.strokeStyle = p.glow.color || p.stroke || col; x.lineWidth = zw(p.width ?? 2, z) + (p.glow.width || 7) + (on ? 4 : 0); x.stroke(); }
        if (p.casing) { mk(); x.globalAlpha = 1; x.strokeStyle = p.casing.color; x.lineWidth = zw(p.width ?? 2, z) + (p.casing.width || 4) + (on ? 2 : 0); x.stroke(); }
        mk(); x.globalAlpha = (p.strokeAlpha ?? 1) * fl; x.strokeStyle = p.stroke || col; x.lineWidth = zw(p.width ?? 2, z) + (on ? 1.8 : 0); x.setLineDash(p.dash || []); x.lineDashOffset = p.flow ? -T * 14 * p.flow : 0; x.stroke(); x.setLineDash([]); x.lineDashOffset = 0;
        if (p.nodes) { x.fillStyle = p.nodes.color || col; x.globalAlpha = 1; parts.forEach(w => w.forEach(q => { const [sx, sy] = this.ts(q); x.beginPath(); x.arc(sx, sy, p.nodes.r || 2, 0, 6.283); x.fill(); })); }
        x.globalAlpha = 1;
      }
      if (r.endGlow) for (const w of g.parts) for (const e of [w[0], w[w.length - 1]]) { const [sx, sy] = this.ts(e), R = 14; const gg = x.createRadialGradient(sx, sy, 0, sx, sy, R); gg.addColorStop(0, r.endGlow); gg.addColorStop(1, withAlpha(r.endGlow, 0)); x.fillStyle = gg; x.fillRect(sx - R, sy - R, 2 * R, 2 * R); }
    }
  }
  drawThreads(view) {
    const t = view.anchorThreads; if (!t) return;
    const x = this.ctx, st = this.v.st;
    for (const p of Object.values(this.m.atlas.places)) {
      if (!p.anchor || !p.at || !this.m.visible(p, 'places', st)) continue;
      const a = this.m.item(p.anchor); if (!a || !a.at) continue;
      const [x1, y1] = this.ts(this.m.proj.toWorld(a.at)), [x2, y2] = this.ts(this.m.proj.toWorld(p.at)); if (Math.hypot(x2 - x1, y2 - y1) < 18) continue;
      if (Math.max(x1, x2) < -20 || Math.min(x1, x2) > this.cam.W + 20 || Math.max(y1, y2) < -20 || Math.min(y1, y2) > this.cam.H + 20) continue;
      x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.strokeStyle = t.color || 'rgba(206,188,255,.38)'; x.lineWidth = 1; x.setLineDash([2, 4]); x.stroke(); x.setLineDash([]);
      x.beginPath(); x.arc(x1, y1, 3, 0, 6.283); x.strokeStyle = withAlpha(t.color || 'rgba(206,188,255,.6)', 1.6); x.stroke();
    }
  }

  /* ---------- glows ---------- */
  drawAuras() {
    const x = this.ctx, T = this.v.T, mpp = this.mpp();
    for (const a of this.auraList()) {
      if (this.skip(!!(a.pulse || a.flicker || a.mode === 'vortex'))) continue;
      const [sx, sy] = this.ts(this.m.geo(a, 'auras').w);
      let R = a.radius ? a.radius / mpp : 0; R = Math.max(a.px || 24, R);
      if (a.mode === 'moon') R = Math.max(14, Math.min(64, R));
      if (sx < -R * 1.2 || sy < -R * 1.2 || sx > this.cam.W + R * 1.2 || sy > this.cam.H + R * 1.2) continue;
      const f = a.flicker ? 0.85 + 0.1 * Math.sin(T * 7.1 + sx) + 0.06 * Math.sin(T * 13.3 + sy) : a.pulse ? 0.85 + 0.15 * Math.sin(T * 1.3 + sx * 0.01) : 1;
      const r0 = R * (a.flicker ? f : 1);
      if (a.mode === 'moon') {
        x.save(); x.beginPath(); x.arc(sx, sy, R, 0, 6.283); x.fillStyle = a.color || '#f4f1ff'; x.fill(); x.clip(); x.beginPath(); x.arc(sx + R * 0.62, sy - R * 0.18, R * 0.92, 0, 6.283); x.fillStyle = a.shade || 'rgba(6,40,62,.88)'; x.fill(); x.restore(); continue;
      }
      const g = x.createRadialGradient(sx, sy, 0, sx, sy, r0);
      if (a.mode === 'desat') {
        g.addColorStop(0, 'rgba(128,128,136,1)'); g.addColorStop(0.55, 'rgba(128,128,136,.75)'); g.addColorStop(1, 'rgba(128,128,136,0)');
        x.globalCompositeOperation = 'saturation'; x.fillStyle = g; x.fillRect(sx - r0, sy - r0, 2 * r0, 2 * r0);
        x.globalCompositeOperation = 'source-over'; const g2 = x.createRadialGradient(sx, sy, 0, sx, sy, r0); g2.addColorStop(0, 'rgba(120,120,128,.30)'); g2.addColorStop(1, 'rgba(120,120,128,0)'); x.fillStyle = g2; x.fillRect(sx - r0, sy - r0, 2 * r0, 2 * r0);
        continue;
      }
      const c = a.color || 'rgba(255,220,150,.4)';
      if (a.mode === 'dark' || a.mode === 'vortex') { g.addColorStop(0, c); g.addColorStop(0.55, withAlpha(c, a.mode === 'vortex' ? 0.5 : 0.5)); g.addColorStop(1, withAlpha(c, 0)); }
      else { g.addColorStop(0, withAlpha(c, f)); g.addColorStop(0.5, withAlpha(c, 0.35 * f)); g.addColorStop(1, withAlpha(c, 0)); x.globalCompositeOperation = 'lighter'; }
      if (a.mode === 'vortex' && a.glow) x.globalCompositeOperation = 'lighter';
      x.fillStyle = g; x.fillRect(sx - r0, sy - r0, 2 * r0, 2 * r0); x.globalCompositeOperation = 'source-over';
      if (a.ring) { x.beginPath(); x.arc(sx, sy, r0 * 0.62, 0, 6.283); x.strokeStyle = a.ring; x.lineWidth = 1; x.setLineDash([2, 3]); x.stroke(); x.setLineDash([]); }
      if (a.mode === 'vortex') for (let j = 0; j < 3; j++) { x.beginPath(); const rot = T * 0.6 * (j % 2 ? 1 : -1) + j * 2.09; for (let t = 0; t < 7; t += 0.2) { const rr = R * (1 - t / 7 * 0.9); const X = sx + Math.cos(t + rot) * rr, Y = sy + Math.sin(t + rot) * rr; t ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.strokeStyle = a.swirl || 'rgba(200,95,125,.45)'; x.lineWidth = 1.1; x.stroke(); }
    }
  }

  /* ---------- effects ---------- */
  clipPath(cls) {
    const x = this.ctx; x.beginPath(); let any = false;
    for (const f of this.m.baseGeo()) if (f.c === cls && f.rings) { f.rings.forEach(r => this.path(r, true)); any = true; }
    for (const zn of Object.values(this.m.atlas.zones)) if (zn.clipClass === cls) { this.m.geo(zn, 'zones').rings?.forEach(r => this.path(r, true)); any = true; }
    return any;
  }
  effect(e) {
    const x = this.ctx, c = this.cam, T = this.v.T, W = c.W, H = c.H;
    if (e.clip) { x.save(); if (!this.clipPath(e.clip)) { x.restore(); return; } x.clip('evenodd'); }
    switch (e.type) {
      case 'gradient': {
        let g;
        if (e.kind === 'radial') { const [fx, fy] = e.at || [0.5, 0.5]; g = x.createRadialGradient(W * fx, H * fy, 0, W * fx, H * fy, Math.max(W, H) * (e.r || 0.8)); }
        else g = x.createLinearGradient(0, 0, 0, H);
        (e.stops || [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.4)']]).forEach(([o, col]) => g.addColorStop(o, col)); x.fillStyle = g; x.fillRect(0, 0, W, H); break;
      }
      case 'fog': x.fillStyle = e.color || 'rgba(0,0,0,.3)'; x.fillRect(0, 0, W, H); break;
      case 'vignette': { const g = x.createRadialGradient(W / 2, H / 2, Math.min(W, H) * (e.inner ?? 0.33), W / 2, H / 2, Math.max(W, H) * (e.outer ?? 0.76)); g.addColorStop(0, withAlpha(e.color || '#000', 0)); g.addColorStop(1, e.color || 'rgba(0,0,0,.5)'); x.fillStyle = g; x.fillRect(0, 0, W, H); break; }
      case 'waves': {
        const n = e.count || 7; for (let i = 0; i < n; i++) { const yy = H * (i + 0.5) / n + Math.sin(T * 0.13 + i * 1.5) * 25; x.beginPath(); x.moveTo(-50, yy); for (let xx = 0; xx <= W + 50; xx += 55) x.lineTo(xx, yy + Math.sin(xx * 0.007 + i * 0.85 + T * 0.28) * 13); x.strokeStyle = e.color || 'rgba(175,195,190,.05)'; x.lineWidth = (e.width || 20) + (i % 3) * 9; x.stroke(); } break;
      }
      case 'stars': {
        const key = 'stars:' + (e.clip || '') + ':' + (e.count || 800) + ':' + this.m.rev; let pts = this.effectCache.get(key);
        if (!pts) {
          pts = []; const r = rng(1991 + (e.count || 0)); const polys = this.m.baseGeo().filter(f => f.c === e.clip && f.rings);
          const bb = polys.length ? bbOf(polys.flatMap(f => f.rings)) : (() => { const a = this.m.proj.toWorld(this.m.atlas.bounds?.[0] || [0, 0]), b = this.m.proj.toWorld(this.m.atlas.bounds?.[1] || [1000, 1000]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; })();
          let tries = 0; while (pts.length < (e.count || 800) && tries++ < (e.count || 800) * 8) { const p = [bb[0] + r() * (bb[2] - bb[0]), bb[1] + r() * (bb[3] - bb[1])]; if (polys.length && !polys.some(f => inPoly(p, f.rings))) continue; pts.push({w: p, r: 0.4 + r() * r() * 1.7, a: 0.25 + r() * 0.75, ph: r() * 6.28, sp: 0.6 + r() * 2, c: r() < 0.14 ? 1 : 0}); }
          this.effectCache.set(key, pts);
        }
        const cols = e.colors || ['#cfd8ff', '#fff4d6'];
        for (const st of pts) { const [sx, sy] = this.ts(st.w); if (sx < -4 || sy < -4 || sx > W + 4 || sy > H + 4) continue; const tw = e.twinkle ? 0.65 + 0.35 * Math.sin(T * st.sp + st.ph) : 1; x.globalAlpha = st.a * tw; const col = cols[st.c % cols.length]; if (e.shape === 'square' || st.r < 0.9) { x.fillStyle = col; x.fillRect(sx - st.r, sy - st.r, st.r * (e.shape === 'square' ? 1.2 : 2), st.r * (e.shape === 'square' ? 1.2 : 2)); } else x.drawImage(this.sprite(col, false), sx - st.r, sy - st.r, st.r * 2, st.r * 2); }
        x.globalAlpha = 1; break;
      }
      case 'particles': {
        const key = 'pt:' + (e.count || 50) + ':' + (e.shape || ''); let ps = this.effectCache.get(key);
        if (!ps) { const r = rng(77 + (e.count || 0)); ps = Array.from({length: e.count || 50}, () => ({x: r(), y: r(), s: 0.3 + r() * 0.9, r: 0.6 + r() * 1.6, ph: r() * 6.28, k: Math.floor(r() * 3)})); this.effectCache.set(key, ps); }
        const sp = e.speed || 0.02, dir = e.dir === 'up' ? -1 : 1, drift = e.drift || 0;
        if (e.shape === 'glow') x.globalCompositeOperation = 'lighter';
        for (const p of ps) {
          const px = ((p.x * W + Math.sin(T * 0.35 + p.ph) * drift) % W + W) % W, py = ((((p.y + dir * T * sp * p.s) % 1) + 1) % 1) * H;
          if (e.shape === 'streak') { x.fillStyle = e.color || 'rgba(160,190,210,.25)'; x.fillRect(px, py, 1, 4 + p.s * 4); }
          else if (e.shape === 'glow') { const cc = (e.colors || ['255,255,255'])[p.k % (e.colors || [1]).length], rr = p.r * 3; x.globalAlpha = 0.55 * (0.4 + 0.6 * Math.abs(Math.sin(T * 1.1 + p.ph))); x.drawImage(this.sprite(`rgb(${cc})`, true), px - rr, py - rr, 2 * rr, 2 * rr); }
          else { x.fillStyle = e.color || 'rgba(200,205,198,.22)'; x.beginPath(); x.arc(px, py, p.r, 0, 6.283); x.fill(); }
        }
        x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; break;
      }
    }
    if (e.clip) x.restore();
  }
  animated(view) {
    if (view.effects.some(e => ['stars', 'waves', 'particles'].includes(e.type) && (e.twinkle !== false))) return true;
    const st = this.v.st;
    if (Object.values(this.m.atlas.auras).some(a => (a.pulse || a.flicker || a.mode === 'vortex') && this.m.inRealm(a, st) && this.m.inLevel(a, st))) return true;
    if (Object.values(this.m.atlas.routes).some(r => this.m.inRealm(r, st) && this.m.inLevel(r, st) && this.m.moves(r.style))) return true;
    if (Object.values(this.m.atlas.zones).some(z => this.m.inRealm(z, st) && this.m.inLevel(z, st) && (z.art || this.m.moves(z.style)))) return true;
    if (Object.values(this.m.atlas.places).some(p => (p.roam || p.ride || p.wander) && this.m.inRealm(p, st) && this.m.inLevel(p, st))) return true;
    if (Object.values(view.styles).some(s => this.m.passes(s).some(p => p && p.flow))) return true;
    return false;
  }

  /* ---------- labels ---------- */
  collide(b) { return this.boxes.some(o => !(b[2] < o[0] || b[0] > o[2] || b[3] < o[1] || b[1] > o[3])); }
  text(txt, sx, sy, o) {
    const x = this.ctx; x.save(); x.translate(sx, sy); if (o.ang) x.rotate(o.ang);
    x.font = o.font; if ('letterSpacing' in x) x.letterSpacing = (o.ls || 0) + 'px';
    const wk = o.font + '|' + (o.ls || 0) + '|' + txt; let w = this.widths.get(wk); if (w === undefined) { if (this.widths.size > 4000) this.widths.clear(); w = x.measureText(txt).width; this.widths.set(wk, w); }
    const h = o.h || 12, c = Math.abs(Math.cos(o.ang || 0)), s = Math.abs(Math.sin(o.ang || 0));
    const bw = w * c + h * s, bh = w * s + h * c, box = [sx - bw / 2 - 2, sy - bh / 2 - 2, sx + bw / 2 + 2, sy + bh / 2 + 2];
    if (o.avoid && this.collide(box)) { x.restore(); return false; }
    this.boxes.push(box);
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
    if (o.glow) { x.shadowColor = o.glow; x.shadowBlur = 10; }
    if (o.halo) { x.strokeStyle = o.halo; x.lineWidth = o.hw || 3.5; x.strokeText(txt, 0, 0); }
    x.fillStyle = o.color; x.fillText(txt, 0, 0); x.restore(); return true;
  }
  labelFont(l) { return `${l.italic ? 'italic ' : ''}${l.weight ? l.weight + ' ' : ''}${l.size || 13}px ${this.font(l.font || 'head')}`; }
  drawLabels(view) {
    const z = this.cam.z, st = this.v.st, lc = view.labelColors, W = this.cam.W, H = this.cam.H, x = this.ctx;
    // big rotated / non-avoiding labels first so smaller ones dodge them
    const list = this.listOf('labels', () => Object.values(this.m.atlas.labels).filter(l => l.at && this.m.visible(l, 'labels', st)).sort((a, b) => (b.noAvoid ? 1 : 0) - (a.noAvoid ? 1 : 0))).filter(l => !(l.minZoom && z < l.minZoom) && !(l.maxZoom && z > l.maxZoom));
    for (const l of list) {
      const [sx, sy] = this.ts(this.m.geo(l, 'labels').w); if (sx < -200 || sy < -60 || sx > W + 200 || sy > H + 60) continue;
      if (l.shield) {
        x.font = `700 10.5px ${this.font('body')}`; if ('letterSpacing' in x) x.letterSpacing = '0px'; const w = x.measureText(l.text).width + 10; const box = [sx - w / 2, sy - 8, sx + w / 2, sy + 8]; if (this.collide(box)) continue; this.boxes.push(box);
        x.fillStyle = '#0f0d12'; this.roundRect(sx - w / 2 - 1.5, sy - 9.5, w + 3, 19, 4); x.fill(); x.fillStyle = l.shield.bg || '#a88f66'; this.roundRect(sx - w / 2, sy - 8, w, 16, 3); x.fill();
        x.fillStyle = l.shield.fg || '#1a1510'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(l.text, sx, sy + 0.5); continue;
      }
      let color = l.color, halo = l.halo, font = this.labelFont(l), ls = l.ls || 0;
      if (l.cls === 'area-big') { color ||= lc.areaBig; halo ||= lc.halo; font = `13px ${this.font('sc')}`; ls = 2; }
      else if (l.cls === 'area-small') { color ||= lc.areaSmall; halo ||= lc.halo; font = `italic 13px ${this.font('head')}`; }
      const size = l.angle && l.size > 18 && z < 11 ? l.size * 0.75 : l.size;
      if (size !== l.size) font = this.labelFont(Object.assign({}, l, {size}));
      this.text(l.text, sx, sy, {font, ls, color: color || '#d8cbb0', halo, hw: l.halo ? 4 : 3.5, glow: l.glow, ang: (l.angle || 0) * Math.PI / 180, avoid: !l.noAvoid, h: size || 13});
    }
  }
  drawZoneLabels() {
    const z = this.cam.z, s = this.s(), W = this.cam.W, H = this.cam.H;
    const list = this.zoneList().filter(zn => !zn.noLabel && this.m.tier(zn, 'zones', this.v.st) >= 2).reverse();
    for (const zn of list) {
      const g = this.m.geo(zn, 'zones'); if (!g.rings || !g.rings.length) continue;
      const L = zn.label || {}; if (L.minZoom && z < L.minZoom || L.maxZoom && z > L.maxZoom) continue;
      const sz = Math.max(g.bb[2] - g.bb[0], g.bb[3] - g.bb[1]) * s; if (sz < (L.minPx ?? 50) || sz > W * 4.5) continue;
      let [x, y] = this.ts(g.c); if (L.top) y = this.ts([0, g.bb[1]])[1] + 22;
      if (x < -100 || y < -30 || x > W + 100 || y > H + 30) continue;
      const col = this.m.colorOf(zn, this.v.st), on = this.v.sel === zn.id || this.v.hover === zn.id, fs = L.size || (sz > 340 ? 14 : 12);
      const text = (L.text || shortName(zn.name) || '').toUpperCase(); if (!text) continue;
      const opt = {font: `${L.italic ? 'italic ' : ''}${fs}px ${this.font(L.font || 'sc')}`, ls: L.ls ?? 3, color: L.color || col, halo: L.halo || 'rgba(8,8,10,.9)', hw: 4, avoid: true, h: fs + (L.sub ? 22 : 6), glow: on ? col : (L.glow || null)};
      let ok = false;
      for (const dy of [0, 24, -24, 48]) { if (this.text(text, x, y + dy, opt)) { ok = true; y += dy; break; } }
      if (ok && L.sub && !(L.subMinZoom && z < L.subMinZoom)) this.text(L.sub, x, y + fs + 2, {font: `italic 12px ${this.font(L.subFont || 'head')}`, color: L.subColor || 'rgba(235,225,205,.75)', halo: L.halo || 'rgba(8,8,10,.9)', hw: 3, h: 11});
    }
  }
  drawFeatureLabels(view) {
    const z = this.cam.z, W = this.cam.W, H = this.cam.H;
    for (const f of this.m.baseGeo()) {
      if (!f.n || !f.lines) continue;
      const style = view.styles[f.c]; if (!style) continue;
      const lab = this.m.passes(style).find(p => p.label); if (!lab) continue; const L = lab.label;
      if (L.minZoom && z < L.minZoom || (L.layer && !this.v.layerOn(L.layer)) || (lab.layer && !this.v.layerOn(lab.layer)) || !this.vis(f.bb, 0)) continue;
      const font = `${z >= 15.5 ? (L.size || 11) + 1 : (L.size || 11)}px ${this.font(L.font || 'body')}`, spacing = L.spacing || 240;
      for (const w of f.lines) for (let i = 0; i < w.length - 1; i++) {
        const a = this.ts(w[i]), b = this.ts(w[i + 1]); const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy); if (len < 80) continue;
        let ang = Math.atan2(dy, dx); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
        const n = Math.max(1, Math.floor(len / spacing));
        for (let j = 0; j < n; j++) { const t = (j + 0.5) / n, sx = a[0] + dx * t, sy = a[1] + dy * t; if (sx < -60 || sy < -20 || sx > W + 60 || sy > H + 20) continue; this.text(f.n, sx, sy, {font, ls: 0.5, color: L.color || '#a19582', halo: L.halo || view.labelColors.halo, hw: 3.5, ang, avoid: true, h: 11}); }
      }
    }
  }
  roundRect(x0, y0, w, h, r) { const x = this.ctx; x.beginPath(); x.moveTo(x0 + r, y0); x.arcTo(x0 + w, y0, x0 + w, y0 + h, r); x.arcTo(x0 + w, y0 + h, x0, y0 + h, r); x.arcTo(x0, y0 + h, x0, y0, r); x.arcTo(x0, y0, x0 + w, y0, r); x.closePath(); }

  /* ---------- hit testing ---------- */
  hitTest(sx, sy) {
    const s = this.s(), c = this.cam, w = [c.cx + (sx - c.W / 2) / s, c.cy + (sy - c.H / 2) / s];
    let best = null, bd = 7;
    for (const r of this.routeList()) { if (r.decor) continue; const g = this.m.geo(r, 'routes'); if (!g.parts || !this.vis(g.bb, 20)) continue; for (const p of g.parts) for (let i = 0; i < p.length - 1; i++) { const d = segDist(w, p[i], p[i + 1]) * s; if (d < bd) { bd = d; best = {coll: 'routes', id: r.id}; } } }
    if (best) return best;
    const mpp = this.mpp();
    for (const a of this.auraList()) {
      if (a.decor) continue;
      const [ax, ay] = this.ts(this.m.geo(a, 'auras').w); const R = Math.max(a.px || 24, a.radius ? a.radius / mpp : 0);
      if (Math.hypot(ax - sx, ay - sy) < Math.max(12, R * 0.35)) return {coll: 'auras', id: a.id};
    }
    const zs = this.zoneList().reverse();
    for (const zn of zs) { if (zn.noHit) continue; const g = this.m.geo(zn, 'zones'); if (!g.rings || !g.rings.length) continue; if (w[0] < g.bb[0] || w[0] > g.bb[2] || w[1] < g.bb[1] || w[1] > g.bb[3]) continue; if (inPoly(w, g.rings)) return {coll: 'zones', id: zn.ref && this.m.item(zn.ref) ? zn.ref : zn.id, zone: zn.id}; }
    return null;
  }
}
