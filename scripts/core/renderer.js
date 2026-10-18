/* Canvas renderer for an atlas view. Draws base geography, zones, glows, routes, effects and labels. */
import {zw, withAlpha, glyphPath, inPoly, segDist, rng, bbOf} from './util.js';

export const FONTS = {
  title: "'Pirata One', 'UnifrakturCook', Georgia, serif",
  head: "'IM Fell English', Georgia, 'Times New Roman', serif",
  sc: "'IM Fell English SC', 'IM Fell English', Georgia, serif",
  body: "'Alegreya Sans', 'Gill Sans', 'Trebuchet MS', system-ui, sans-serif"
};

/** A stable pseudo-random number in [-1, 1] for a point of the map. */
function hash2(x, y) { const v = Math.sin(x * 12.9898 * 1e3 + y * 78.233 * 1e3) * 43758.5453; return (v - Math.floor(v)) * 2 - 1; }

/** Tree crowns for the 'forest' effect: a few painted variants, drawn once and stamped many times. */
function treeSprites(cols) {
  const out = [];
  for (let v = 0; v < 8; v++) {
    const S = 128, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d'); const r = rng(311 + v * 97);
    const base = cols[v % cols.length], lobes = 6 + Math.floor(r() * 4), L = [];
    for (let i = 0; i < lobes; i++) { const a = r() * 6.283, d = r() * S * 0.17; L.push([S / 2 + Math.cos(a) * d, S / 2 + Math.sin(a) * d * 0.85, S * (0.12 + r() * 0.09)]); }
    L.sort((p, q) => p[1] - q[1]);
    // the shadow it throws, the dark edge of the crown, the lobes lit from the upper left, a few bright leaves
    x.fillStyle = 'rgba(0,0,0,.42)'; x.beginPath(); x.ellipse(S * 0.56, S * 0.6, S * 0.33, S * 0.27, 0, 0, 6.283); x.fill();
    x.fillStyle = withAlpha(base[0], 1); for (const [cx, cy, rr] of L) { x.beginPath(); x.arc(cx, cy, rr + 2.2, 0, 6.283); x.fill(); }
    for (const [cx, cy, rr] of L) { const g = x.createRadialGradient(cx - rr * 0.4, cy - rr * 0.45, rr * 0.05, cx, cy, rr); g.addColorStop(0, withAlpha(base[2], 0.95)); g.addColorStop(0.45, withAlpha(base[1], 1)); g.addColorStop(1, withAlpha(base[0], 1)); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rr, 0, 6.283); x.fill(); }
    for (let i = 0; i < 10; i++) { const a = -2.4 + r() * 1.6, d = S * (0.08 + r() * 0.18); x.fillStyle = withAlpha(base[2], 0.25 + r() * 0.35); x.beginPath(); x.ellipse(S / 2 + Math.cos(a) * d, S / 2 + Math.sin(a) * d, S * (0.012 + r() * 0.02), S * (0.008 + r() * 0.012), r() * 3, 0, 6.283); x.fill(); }
    out.push(cv);
  }
  return out;
}

export class Renderer {
  constructor(view) {
    this.v = view;
    this.patterns = new Map();
    this.effectCache = new Map();
    this.images = new Map();
    this.boxes = [];
  }
  get m() { return this.v.model; }
  get ctx() { return this.v.ctx; }
  get cam() { return this.v.cam; }

  /* ---------- camera helpers ---------- */
  s() { return Math.pow(2, this.cam.z); }
  ts(w) { const c = this.cam, s = this.s(); return [(w[0] - c.cx) * s + c.W / 2, (w[1] - c.cy) * s + c.H / 2]; }
  vis(bb, pad = 40) { if (!bb) return false; const c = this.cam, s = this.s(); const x0 = (bb[0] - c.cx) * s + c.W / 2, x1 = (bb[2] - c.cx) * s + c.W / 2, y0 = (bb[1] - c.cy) * s + c.H / 2, y1 = (bb[3] - c.cy) * s + c.H / 2; return !(x1 < -pad || x0 > c.W + pad || y1 < -pad || y0 > c.H + pad); }
  mpp() { return this.m.proj.mpu(this.cam.cy) / this.s(); }
  /** Add a polyline (world coordinates) to the current path. rough > 0 draws it by hand: each segment bows a little,
   *  by an amount fixed to the map (it does not crawl while panning); seed varies the hand between strokes. */
  path(w, close, rough = 0, seed = 0) {
    const c = this.cam, s = this.s(), ox = c.W / 2 - c.cx * s, oy = c.H / 2 - c.cy * s, x = this.ctx;
    if (!rough) { x.moveTo(w[0][0] * s + ox, w[0][1] * s + oy); for (let i = 1; i < w.length; i++) x.lineTo(w[i][0] * s + ox, w[i][1] * s + oy); if (close) x.closePath(); return; }
    // long sides are split into short pieces (counted at whole zoom steps, so the line does not shimmer while zooming)
    const n = w.length, last = close ? n : n - 1, zq = Math.pow(2, Math.floor(c.z));
    let px = w[0][0] * s + ox, py = w[0][1] * s + oy; x.moveTo(px, py);
    for (let i = 0; i < last; i++) {
      const a = w[i], b = w[(i + 1) % n], qx = b[0] * s + ox, qy = b[1] * s + oy, dx = qx - px, dy = qy - py, len = Math.hypot(dx, dy);
      if (len < 3) { x.lineTo(qx, qy); px = qx; py = qy; continue; }
      const m = Math.max(1, Math.min(28, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) * zq / 30))), nx = -dy / len, ny = dx / len, amp = Math.min(rough, len / m * 0.3);
      let ex0 = px, ey0 = py;
      for (let j = 0; j < m; j++) {
        const t1 = (j + 1) / m, hj = hash2(a[0] + b[0] * 0.37 + j * 0.0131 + seed * 0.731, a[1] + b[1] * 0.37 - j * 0.0177 - seed * 0.419);
        const jt = j < m - 1 ? 0.45 * amp * hash2(a[1] + j * 0.0213 + seed, b[0] - j * 0.0119) : 0;
        const ex = px + dx * t1 + nx * jt, ey = py + dy * t1 + ny * jt, k = amp * hj;
        x.quadraticCurveTo((ex0 + ex) / 2 + nx * k, (ey0 + ey) / 2 + ny * k, ex, ey); ex0 = ex; ey0 = ey;
      }
      px = qx; py = qy;
    }
    if (close) x.closePath();
  }
  font(key) { const f = this.m.atlas.fonts || {}; return f[key] || FONTS[key] || FONTS.body; }
  image(src) {
    if (!src) return null;
    let im = this.images.get(src);
    if (!im) { im = new Image(); im.decoding = 'async'; im.onload = () => this.v.dirty(); im.onerror = () => { im._bad = true; }; im.src = this.v.resolveUrl(src); this.images.set(src, im); }
    return im.complete && im.naturalWidth && !im._bad ? im : null;
  }

  /* ---------- patterns ---------- */
  pattern(p) {
    const d = this.cam.dpr, key = JSON.stringify(p) + '@' + d;
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
    const r = c => { const m = /^auto(?::([\d.]+))?$/.exec(c || ''); return m ? withAlpha(col, m[1] ? +m[1] : 0.35) : c; };
    return Object.assign({}, p, {color: r(p.color), bg: r(p.bg)});
  }

  /* ---------- frame ---------- */
  draw() {
    const v = this.v, x = this.ctx, c = this.cam, view = v.rv;
    x.setTransform(c.dpr, 0, 0, c.dpr, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.lineCap = 'round'; x.lineJoin = 'round'; x.setLineDash([]);
    // clearBase: the plain map is already underneath (a Foundry scene picture), so only draw what is on top of it.
    // The realm's moving atmosphere (mist, leaves, motes, water) is never in the picture, so it is always drawn here.
    if (v.clearBase) x.clearRect(0, 0, c.W, c.H);
    else {
      x.fillStyle = view.bg; x.fillRect(0, 0, c.W, c.H);
      for (const e of view.effects) if (e.under && this.effectOn(e)) this.effect(e);
      this.drawBackground(view);
      this.drawBase(view);
    }
    if (v.bare) return; // just the map itself (a neutral scene background)
    for (const e of view.effects) if (!e.under && e.clip && this.effectOn(e)) this.effect(e);
    this.drawEcho(view);
    this.drawZones();
    this.drawAuras();
    this.drawRoutes();
    this.drawThreads(view);
    for (const e of view.effects) if (!e.under && !e.clip && this.effectOn(e)) this.effect(e);
    // labels collide with markers first
    this.boxes = v.markerBoxes();
    if (!v.noLabels) { this.drawZoneLabels(); this.drawLabels(view); this.drawFeatureLabels(view); }
    if (v.editor) v.editor.drawOverlay(x);
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
    const x = this.ctx, z = this.cam.z, st = this.v.st;
    for (const f of this.m.baseGeo()) {
      const style = view.styles[f.c]; if (!style) continue;
      if (f.layer && !this.v.layerOn(f.layer)) continue;
      if (f.realm && f.realm !== st.realm) continue;
      if (f.level && !this.m.levelShows(st.realm, st.level).includes(f.level)) continue;
      if (!this.vis(f.bb, 60)) continue;
      for (const p of this.m.passes(style)) {
        if (p.minZoom && z < p.minZoom || p.maxZoom && z > p.maxZoom) continue;
        if (p.layer && !this.v.layerOn(p.layer)) continue;
        x.beginPath();
        if (f.rings) f.rings.forEach(r => this.path(r, true, p.rough)); else f.lines.forEach(l => { if (l.length > 1) this.path(l, false, p.rough); });
        x.globalAlpha = p.alpha ?? 1;
        if (f.rings && (p.fill || p.pattern)) { x.fillStyle = p.pattern ? this.pattern(p.pattern) : p.fill; x.fill('evenodd'); if (p.pattern && p.fill) { x.fillStyle = p.fill; x.fill('evenodd'); } }
        if (p.stroke) { x.strokeStyle = p.stroke; x.lineWidth = zw(p.width ?? 1, z) * (p.add !== undefined && p.mul === false ? 1 : (f.w || 1)) + (p.add || 0); x.setLineDash(p.dash || []); x.lineDashOffset = p.flow ? -this.v.T * 14 * p.flow : 0; x.stroke(); x.setLineDash([]); x.lineDashOffset = 0; }
        x.globalAlpha = 1;
      }
    }
  }

  /* ---------- zones ---------- */
  zoneList() {
    const st = this.v.st;
    return Object.values(this.m.atlas.zones).filter(z => this.m.visible(z, 'zones', st) && !this.v.isHiddenItem(z.id)).sort((a, b) => (a.order ?? 10) - (b.order ?? 10));
  }
  drawZones() { for (const z of this.zoneList()) this.drawZone(z); }
  drawZone(zn, opts = {}) {
    const g = this.m.geo(zn, 'zones'); if (!g.rings || !g.rings.length || !this.vis(g.bb, 200)) return;
    const x = this.ctx, z = this.cam.z, on = !opts.echo && (this.v.sel === zn.id || this.v.hover === zn.id || this.v.sel === zn.ref || this.v.hover === zn.ref);
    const unknown = !opts.echo && this.m.tier(zn, 'zones', this.v.st) < 2;
    const col = unknown ? '#9a9aa4' : (opts.color || this.m.colorOf(zn));
    const st0 = zn.style || (zn.domainStatus && this.m.atlas.styles['domain-' + zn.domainStatus] ? 'domain-' + zn.domainStatus : null);
    const passes = opts.echo ? [opts.echo] : unknown ? [{stroke: 'rgba(200,200,210,.55)', width: 1.3, dash: [3, 5], fill: '#9a9aa4', fillAlpha: 0.05}] : this.m.passes(st0 || {stroke: col, width: 1.6, fill: col, fillAlpha: 0.12});
    let rough = 0;
    const mk = (sd = 0) => { x.beginPath(); g.rings.forEach(r => this.path(r, true, rough, sd)); };
    const base = opts.alpha ?? 1;
    for (const p of passes) {
      if (p.minZoom && z < p.minZoom || p.maxZoom && z > p.maxZoom) continue;
      rough = p.rough || 0;
      mk();
      const fa = p.fillAlpha ?? (p.fill ? 1 : 0);
      if (fa > 0 || p.fill) {
        x.globalAlpha = base * (on ? Math.min(1, fa * 1.9 + 0.04) : fa) || 0;
        if (p.fill2) { const [x0, y0] = this.ts([g.bb[0], g.bb[1]]), [x1, y1] = this.ts([g.bb[2], g.bb[3]]); const gr = x.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, p.fill || col); gr.addColorStop(1, p.fill2); x.fillStyle = gr; }
        else x.fillStyle = (p.fill && p.fill !== 'auto') ? p.fill : col;
        if (x.globalAlpha > 0) x.fill('evenodd');
      }
      if (p.pattern) { x.globalAlpha = base * (on ? 1 : 0.85); x.fillStyle = this.pattern(this.autoPat(p.pattern, col)); x.fill('evenodd'); }
      if (zn.fillImage && !opts.echo && p === passes[0]) this.zoneImage(zn, g);
      if (p.glow) { mk(); x.globalAlpha = base * (p.glow.alpha ?? 0.15) * (on ? 2.4 : 1); x.strokeStyle = p.glow.color || col; x.lineWidth = (p.glow.width || 6) + (on ? 4 : 0); x.stroke(); }
      if (p.casing) { x.globalAlpha = base; x.strokeStyle = p.casing.color; x.lineWidth = zw(p.width ?? 1.6, z) + (p.casing.width || 3); x.setLineDash([]); x.stroke(); }
      if (p.stroke !== null && (p.width ?? 1) > 0.02) {
        x.globalAlpha = base * (p.strokeAlpha ?? 1) * (on && p.strokeAlpha ? 1 / p.strokeAlpha : 1);
        x.strokeStyle = p.stroke || col; x.lineWidth = zw(p.width ?? 1.6, z) + (on ? 2 : 0); x.setLineDash(p.dash || []); x.lineDashOffset = p.flow ? -this.v.T * 8 * p.flow : 0; x.stroke();
        // sketched: the same line gone over again by hand, a little off
        if (p.sketch && rough) for (let j = 1; j <= p.sketch; j++) { mk(j); x.globalAlpha *= 0.55; x.lineWidth = Math.max(0.6, x.lineWidth * 0.6); x.stroke(); }
        x.setLineDash([]); x.lineDashOffset = 0;
      } else if (on && p.hoverStroke) { x.globalAlpha = base; x.strokeStyle = col; x.lineWidth = 2; x.setLineDash([3, 6]); x.stroke(); x.setLineDash([]); }
    }
    if (this.v.sel === zn.id && !opts.echo) { mk(); x.globalAlpha = 1; x.strokeStyle = 'rgba(255,240,210,.35)'; x.lineWidth = 1; x.stroke(); }
    x.globalAlpha = 1;
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
      this.drawZone(zn, {echo: {width: 1.2, dash: [2, 5], stroke: this.m.colorOf(zn), fillAlpha: 0, strokeAlpha: e.alpha ?? 0.28}, color: this.m.colorOf(zn)});
    }
  }

  /* ---------- routes ---------- */
  routeList() { const st = this.v.st; return Object.values(this.m.atlas.routes).filter(r => this.m.visible(r, 'routes', st) && !this.v.isHiddenItem(r.id)); }
  drawRoutes() {
    const x = this.ctx, z = this.cam.z, T = this.v.T;
    for (const r of this.routeList()) {
      const g = this.m.geo(r, 'routes'); if (!g.parts || !g.parts.length || !this.vis(g.bb, 60)) continue;
      const on = this.v.sel === r.id || this.v.hover === r.id, unknown = this.m.tier(r, 'routes', this.v.st) < 2, col = unknown ? '#9a9aa4' : this.m.colorOf(r);
      const passes = unknown ? [{stroke: 'rgba(200,200,210,.5)', width: 1.6, dash: [2, 6]}] : this.m.passes(r.style || {stroke: col, width: 2.4, dash: [6, 4]});
      for (const p of passes) {
        if (p.minZoom && z < p.minZoom || p.maxZoom && z > p.maxZoom) continue;
        let parts = g.parts;
        if (p.broken) parts = parts.flatMap(w => [w.slice(0, Math.max(2, Math.floor(w.length * 0.42))), w.slice(Math.ceil(w.length * 0.58))]).filter(w => w.length > 1);
        const fl = p.flicker ? 0.55 + 0.45 * Math.abs(Math.sin(T * 2.6 + r.id.length)) : 1;
        const mk = (sd = 0) => { x.beginPath(); parts.forEach(w => this.path(w, false, p.rough || 0, sd)); };
        if (p.glow) { mk(); x.globalAlpha = (p.glow.alpha ?? 0.16) * fl * (on ? 2 : 1); x.strokeStyle = p.glow.color || p.stroke || col; x.lineWidth = zw(p.width ?? 2, z) + (p.glow.width || 7) + (on ? 4 : 0); x.stroke(); }
        if (p.casing) { mk(); x.globalAlpha = 1; x.strokeStyle = p.casing.color; x.lineWidth = zw(p.width ?? 2, z) + (p.casing.width || 4) + (on ? 2 : 0); x.stroke(); }
        mk(); x.globalAlpha = (p.strokeAlpha ?? 1) * fl; x.strokeStyle = p.stroke || col; x.lineWidth = zw(p.width ?? 2, z) + (on ? 1.8 : 0); x.setLineDash(p.dash || []); x.lineDashOffset = p.flow ? -T * 14 * p.flow : 0; x.stroke();
        if (p.sketch && p.rough) for (let j = 1; j <= p.sketch; j++) { mk(j); x.globalAlpha *= 0.55; x.lineWidth = Math.max(0.6, x.lineWidth * 0.6); x.stroke(); }
        x.setLineDash([]); x.lineDashOffset = 0;
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
    const x = this.ctx, st = this.v.st, T = this.v.T, mpp = this.mpp();
    for (const a of Object.values(this.m.atlas.auras)) {
      if (!a.at || !this.m.visible(a, 'auras', st)) continue;
      const [sx, sy] = this.ts(this.m.proj.toWorld(a.at));
      let R = a.radius ? a.radius / mpp : 0; R = Math.max(a.px || 24, R);
      if (a.mode === 'moon') R = Math.max(14, Math.min(64, R));
      if (sx < -R * 1.2 || sy < -R * 1.2 || sx > this.cam.W + R * 1.2 || sy > this.cam.H + R * 1.2) continue;
      const f = a.flicker ? 0.85 + 0.1 * Math.sin(T * 7.1 + sx) + 0.06 * Math.sin(T * 13.3 + sy) : a.pulse ? 0.85 + 0.15 * Math.sin(T * 1.3 + sx * 0.01) : 1;
      const r0 = R * (a.flicker ? f : 1);
      if (a.mode === 'blot') { this.blot(a, sx, sy, R); continue; }
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

  /** A patch of rot: an uneven stain with a ragged rim and a few spots around it, the same shape every time. */
  blot(a, sx, sy, R) {
    const x = this.ctx; let sd = 0; for (const ch of String(a.id)) sd = (sd * 31 + ch.charCodeAt(0)) % 9973; const r = rng(sd + 7);
    const n = 15, pts = []; for (let i = 0; i < n; i++) { const t = i / n * 6.283, k = 0.68 + r() * 0.42; pts.push([sx + Math.cos(t) * R * k, sy + Math.sin(t) * R * k * 0.9]); }
    const shape = (sc = 1) => { x.beginPath(); const m = (i) => { const p = pts[i % n], q = pts[(i + 1) % n]; return [sx + ((p[0] + q[0]) / 2 - sx) * sc, sy + ((p[1] + q[1]) / 2 - sy) * sc]; }; let s0 = m(n - 1); x.moveTo(s0[0], s0[1]); for (let i = 0; i < n; i++) { const p = pts[i], e = m(i); x.quadraticCurveTo(sx + (p[0] - sx) * sc, sy + (p[1] - sy) * sc, e[0], e[1]); } x.closePath(); };
    const col = a.color || 'rgba(30,14,6,.7)';
    const g = x.createRadialGradient(sx, sy, 0, sx, sy, R); g.addColorStop(0, col); g.addColorStop(0.65, withAlpha(col, 0.8)); g.addColorStop(1, withAlpha(col, 0.25));
    shape(); x.fillStyle = g; x.fill();
    if (a.ring) { x.strokeStyle = a.ring; x.lineWidth = 1.2; x.setLineDash([3, 2, 1, 2]); x.stroke(); x.setLineDash([]); shape(0.55); x.globalAlpha = 0.5; x.lineWidth = 0.8; x.stroke(); x.globalAlpha = 1; }
    x.fillStyle = withAlpha(col, 0.9); for (let i = 0; i < 4; i++) { const t = r() * 6.283, d = R * (1.05 + r() * 0.35), rr = R * (0.06 + r() * 0.08); x.beginPath(); x.arc(sx + Math.cos(t) * d, sy + Math.sin(t) * d, rr, 0, 6.283); x.fill(); }
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
      case 'grain': {
        // paper and ink grain: a small noise tile repeated over the map (hand-drawn, rustic realms)
        let pat = this.effectCache.get('grain:' + (e.tone || 'dark'));
        if (!pat) { const cv = document.createElement('canvas'); cv.width = cv.height = 180; const g = cv.getContext('2d'); const r = rng(4242); const img = g.createImageData(180, 180); for (let i = 0; i < img.data.length; i += 4) { const v = r(); const on = v > 0.5; img.data[i] = img.data[i + 1] = img.data[i + 2] = on ? 235 : 0; img.data[i + 3] = Math.floor(Math.pow(Math.abs(v - 0.5) * 2, 3) * 255); } g.putImageData(img, 0, 0); pat = x.createPattern(cv, 'repeat'); this.effectCache.set('grain:' + (e.tone || 'dark'), pat); }
        x.globalAlpha = e.alpha ?? 0.06; x.fillStyle = pat; x.fillRect(0, 0, W, H); x.globalAlpha = 1; break;
      }
      case 'canopy': {
        // slow shadows of leaves and branches drifting over the map
        const key = 'canopy:' + (e.count || 14); let bl = this.effectCache.get(key);
        if (!bl) { const r = rng(1313); bl = Array.from({length: e.count || 14}, () => ({x: r(), y: r(), s: 0.12 + r() * 0.22, ph: r() * 6.28, k: r()})); this.effectCache.set(key, bl); }
        const col = e.color || 'rgba(4,10,5,.38)', M = Math.max(W, H);
        for (const b of bl) { const px = b.x * W + Math.sin(T * 0.05 + b.ph) * M * 0.02, py = b.y * H + Math.cos(T * 0.04 + b.ph) * M * 0.015, rr = b.s * M; const g = x.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, col); g.addColorStop(0.6, withAlpha(col, 0.45)); g.addColorStop(1, withAlpha(col, 0)); x.fillStyle = g; x.fillRect(px - rr, py - rr, rr * 2, rr * 2); }
        break;
      }
      case 'forest': { const F = this.forestLayer(e); if (F) { const s = this.s(), d = c.dpr, dx = (F.cam.cx - c.cx) * s - F.pad, dy = (F.cam.cy - c.cy) * s - F.pad; x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = e.alpha ?? 1; x.drawImage(F.cv, Math.round(dx * d), Math.round(dy * d)); x.restore(); } break; }
      case 'mist': {
        // slow banks of mist drifting across the map
        const n = e.count || 5, col = e.color || 'rgba(150,170,140,.06)', sp = e.speed ?? 1;
        for (let i = 0; i < n; i++) {
          const dir = i % 2 ? 1 : -1, w = W * (0.55 + 0.25 * ((i * 37) % 10) / 10), h = H * (0.10 + 0.05 * (i % 3));
          const px = ((((i * 0.31 + dir * T * 0.006 * sp) % 1.6) + 1.6) % 1.6 - 0.3) * W, py = H * (i + 0.5) / n + Math.sin(T * 0.05 * sp + i * 1.9) * H * 0.04;
          x.save(); x.translate(px, py); x.scale(1, h / w); const g = x.createRadialGradient(0, 0, 0, 0, 0, w / 2); g.addColorStop(0, col); g.addColorStop(1, withAlpha(col, 0)); x.fillStyle = g; x.fillRect(-w / 2, -w / 2, w, w); x.restore();
        }
        break;
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
        for (const st of pts) { const [sx, sy] = this.ts(st.w); if (sx < -4 || sy < -4 || sx > W + 4 || sy > H + 4) continue; const tw = e.twinkle ? 0.65 + 0.35 * Math.sin(T * st.sp + st.ph) : 1; x.globalAlpha = st.a * tw; x.fillStyle = cols[st.c % cols.length]; if (e.shape === 'square') x.fillRect(sx, sy, st.r * 1.2, st.r * 1.2); else { x.beginPath(); x.arc(sx, sy, st.r, 0, 6.283); x.fill(); } }
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
          else if (e.shape === 'leaf') {
            // a pointed leaf with its midrib, tumbling as it falls
            const cols = e.colors || ['rgba(140,160,80,.5)'], L = p.r * 3.2 * (e.size || 1), w = L * 0.42;
            x.save(); x.translate(px, py); x.rotate(T * 0.5 * (p.k ? 1 : -1) + p.ph); x.scale(1, 0.35 + 0.65 * Math.abs(Math.cos(T * 0.9 + p.ph)));
            x.fillStyle = cols[p.k % cols.length]; x.beginPath(); x.moveTo(-L, 0); x.quadraticCurveTo(-L * 0.1, -w * 1.5, L, 0); x.quadraticCurveTo(-L * 0.1, w * 1.5, -L, 0); x.fill();
            x.strokeStyle = 'rgba(20,14,6,.35)'; x.lineWidth = 0.6; x.beginPath(); x.moveTo(-L * 1.25, 0); x.lineTo(L * 0.85, 0); x.stroke(); x.restore();
          }
          else if (e.shape === 'glow') { const cc = (e.colors || ['255,255,255'])[p.k % (e.colors || [1]).length]; const f = 0.4 + 0.6 * Math.abs(Math.sin(T * 1.1 + p.ph)); const rr = p.r * 3; const g = x.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, `rgba(${cc},${0.55 * f})`); g.addColorStop(1, `rgba(${cc},0)`); x.fillStyle = g; x.fillRect(px - rr, py - rr, 2 * rr, 2 * rr); }
          else { x.fillStyle = e.color || 'rgba(200,205,198,.22)'; x.beginPath(); x.arc(px, py, p.r, 0, 6.283); x.fill(); }
        }
        x.globalCompositeOperation = 'source-over'; break;
      }
    }
    if (e.clip) x.restore();
  }
  /** The 'forest' effect: tree crowns over the land, fixed to the map, painted once per camera position. */
  forestLayer(e) {
    const z = this.cam.z;
    const key = 'forest:' + this.m.rev + ':' + JSON.stringify([e.count, e.avoid, e.dense, e.colors, e.clear, e.shore, e.water]);
    let F = this.effectCache.get(key);
    if (!F) {
      const a = this.m.atlas, P = this.m.proj; if (!a.bounds) return null;
      const p0 = P.toWorld(a.bounds[0]), p1 = P.toWorld(a.bounds[1]), bb = [Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), Math.max(p0[1], p1[1])];
      const polys = cls => this.m.baseGeo().filter(f => cls.includes(f.c) && f.rings);
      const avoid = polys(e.avoid || ['lake']), dense = polys(e.dense || []);
      const inside = (q, fs) => fs.some(f => q[0] >= f.bb[0] && q[0] <= f.bb[2] && q[1] >= f.bb[1] && q[1] <= f.bb[3] && inPoly(q, f.rings));
      // e.shore: a coastline (base-map line class) with water to its east, carried on past its ends
      const coast = e.shore ? this.m.baseGeo().filter(f => f.c === e.shore && f.lines).flatMap(f => f.lines).flat().sort((A, B) => A[1] - B[1]) : [];
      const wet = q => { if (!coast.length) return false; if (q[1] <= coast[0][1]) return q[0] > coast[0][0]; if (q[1] >= coast[coast.length - 1][1]) return q[0] > coast[coast.length - 1][0];
        let i = 1; while (i < coast.length - 1 && coast[i][1] < q[1]) i++; const A = coast[i - 1], B = coast[i], t = (q[1] - A[1]) / ((B[1] - A[1]) || 1); return q[0] > A[0] + (B[0] - A[0]) * t; };
      const N0 = e.count || 9000, S0 = Math.sqrt((bb[2] - bb[0]) * (bb[3] - bb[1]) / N0), f1 = 6.283 / (S0 * 23), f2 = 6.283 / (S0 * 31), f3 = 6.283 / (S0 * 13), clear = e.clear ?? 0.3;
      const tier = (S, seed, under) => {
        const r = rng(seed), out = [];
        for (let y = bb[1]; y < bb[3]; y += S) for (let xx = bb[0]; xx < bb[2]; xx += S) {
          const q = [xx + (r() - 0.5) * S * 0.95, y + (r() - 0.5) * S * 0.95], k = r(), v = Math.floor(r() * 8), rr = 0.55 + r() * 0.55;
          if (inside(q, avoid) || wet(q)) continue;
          const thick = inside(q, dense), n = (Math.sin(q[0] * f1 + 1.7) * Math.sin(q[1] * f2 + 0.4) + 0.6 * Math.sin((q[0] - q[1]) * f3)) / 1.6; // -1..1, low = clearing
          if (!thick && n < -clear + (k - 0.5) * 0.5 + (under ? 0.08 : 0)) continue;
          out.push({w: q, r: S * rr * (thick ? 1.15 : 1), v});
        }
        return out.sort((A, B) => A.w[1] - B.w[1]);
      };
      // three sizes of tree: the large ones read at a distance, the smaller ones take over as the map is zoomed in
      // the water beyond the coast, out to the edge of the map (the base map's lake may stop short of it)
      const sea = e.water && coast.length ? [[coast[0][0], bb[1] - 1], ...coast, [coast[coast.length - 1][0], bb[3] + 1], [bb[2] + 1, bb[3] + 1], [bb[2] + 1, bb[1] - 1]] : null;
      F = {sea, tiers: [{S: S0, seed: 2027, list: null}, {S: S0 / 2.2, seed: 4049, list: null}, {S: S0 / 4.8, seed: 6067, list: null}], tier, cv: null, at: '',
        sprites: treeSprites(e.colors || [['#0c1e10', '#1b3a1e', '#4d6c34'], ['#0e2018', '#1d3c29', '#56713c'], ['#121f0c', '#283f18', '#6e7c3a']])};
      this.effectCache.set(key, F);
    }
    // painted with a margin around the view, so panning only slides the picture; zooming paints it again
    const c = this.cam, s0 = this.s(), pad = c.W * c.H > 5e6 ? 0 : Math.round(Math.max(c.W, c.H) * 0.25), view = [c.z, c.W, c.H, c.dpr].join(',');
    if (!F.cv) F.cv = document.createElement('canvas');
    const slid = F.cam && F.at === view && Math.abs((F.cam.cx - c.cx) * s0) < pad * 0.9 && Math.abs((F.cam.cy - c.cy) * s0) < pad * 0.9;
    if (!slid) {
      const cv = F.cv, Wp = Math.round((c.W + pad * 2) * c.dpr), Hp = Math.round((c.H + pad * 2) * c.dpr); if (cv.width !== Wp || cv.height !== Hp) { cv.width = Wp; cv.height = Hp; }
      const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(c.dpr, 0, 0, c.dpr, c.dpr * pad, c.dpr * pad);
      const s = this.s(), sc = e.scale || 1, top = e.maxZoom ? Math.max(0.45, Math.min(1, e.maxZoom + 1 - z)) : 1;
      const stamp = (T, alpha) => { if (alpha <= 0.01) return; T.list ||= F.tier(T.S, T.seed, T !== F.tiers[0]); g.globalAlpha = alpha; const o = this.ts([0, 0]);
        for (const t of T.list) { const R = t.r * s * sc; if (R < 0.7) continue; const sx = o[0] + t.w[0] * s, sy = o[1] + t.w[1] * s; if (sx < -R * 1.4 - pad || sy < -R * 1.4 - pad || sx > c.W + R * 1.4 + pad || sy > c.H + R * 1.4 + pad) continue; g.drawImage(F.sprites[t.v], sx - R * 1.3, sy - R * 1.3, R * 2.6, R * 2.6); } };
      // each finer tier fades in over the coarser one, which goes only once it is fully covered: never two see-through layers
      const z1 = e.underZoom ?? 12.4, ramp = (a, b) => Math.max(0, Math.min(1, (z - a) / (b - a)));
      const a0 = 1 - ramp(z1 + 1.6, z1 + 2.6), a1 = ramp(z1, z1 + 1) * (1 - ramp(z1 + 3, z1 + 4)), a2 = ramp(z1 + 1.4, z1 + 2.4);
      if (F.sea) { const o = this.ts([0, 0]); g.globalAlpha = 1; g.beginPath(); F.sea.forEach(([wx, wy], i) => { const px = o[0] + wx * s, py = o[1] + wy * s; if (i) g.lineTo(px, py); else g.moveTo(px, py); }); g.closePath(); g.fillStyle = e.water; g.fill(); }
      stamp(F.tiers[0], a0 * top); stamp(F.tiers[1], a1 * top); stamp(F.tiers[2], a2 * top);
      F.at = view; F.cam = {cx: c.cx, cy: c.cy}; F.pad = pad;
    }
    return F;
  }
  animated(view) {
    if (view.effects.some(e => ['stars', 'waves', 'particles', 'canopy', 'mist'].includes(e.type) && (e.twinkle !== false))) return true;
    const st = this.v.st;
    if (Object.values(this.m.atlas.auras).some(a => (a.pulse || a.flicker || a.mode === 'vortex') && this.m.inRealm(a, st) && this.m.inLevel(a, st))) return true;
    if (Object.values(this.m.atlas.routes).some(r => this.m.inRealm(r, st) && this.m.inLevel(r, st) && this.m.passes(r.style).some(p => p.flow || p.flicker))) return true;
    if (Object.values(this.m.atlas.zones).some(z => this.m.inRealm(z, st) && this.m.inLevel(z, st) && this.m.passes(z.style).some(p => p.flow))) return true;
    if (Object.values(view.styles).some(s => this.m.passes(s).some(p => p && p.flow))) return true;
    return false;
  }

  /* ---------- labels ---------- */
  collide(b) { return this.boxes.some(o => !(b[2] < o[0] || b[0] > o[2] || b[3] < o[1] || b[1] > o[3])); }
  text(txt, sx, sy, o) {
    const x = this.ctx; x.save(); x.translate(sx, sy); if (o.ang) x.rotate(o.ang);
    x.font = o.font; if ('letterSpacing' in x) x.letterSpacing = (o.ls || 0) + 'px';
    const w = x.measureText(txt).width, h = o.h || 12, c = Math.abs(Math.cos(o.ang || 0)), s = Math.abs(Math.sin(o.ang || 0));
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
    const list = Object.values(this.m.atlas.labels).filter(l => l.at && this.m.visible(l, 'labels', st) && !(l.minZoom && z < l.minZoom) && !(l.maxZoom && z > l.maxZoom));
    // big rotated / non-avoiding labels first so smaller ones dodge them
    list.sort((a, b) => (b.noAvoid ? 1 : 0) - (a.noAvoid ? 1 : 0));
    for (const l of list) {
      const [sx, sy] = this.ts(this.m.proj.toWorld(l.at)); if (sx < -200 || sy < -60 || sx > W + 200 || sy > H + 60) continue;
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
      const col = this.m.colorOf(zn), on = this.v.sel === zn.id || this.v.hover === zn.id, fs = L.size || (sz > 340 ? 14 : 12);
      const text = (L.text || zn.name || '').toUpperCase(); if (!text) continue;
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
    for (const a of Object.values(this.m.atlas.auras)) {
      if (a.decor || !a.at || !this.m.visible(a, 'auras', this.v.st)) continue;
      const [ax, ay] = this.ts(this.m.proj.toWorld(a.at)); const R = Math.max(a.px || 24, a.radius ? a.radius / mpp : 0);
      if (Math.hypot(ax - sx, ay - sy) < Math.max(12, R * 0.35)) return {coll: 'auras', id: a.id};
    }
    const zs = this.zoneList().reverse();
    for (const zn of zs) { if (zn.noHit) continue; const g = this.m.geo(zn, 'zones'); if (!g.rings || !g.rings.length) continue; if (w[0] < g.bb[0] || w[0] > g.bb[2] || w[1] < g.bb[1] || w[1] > g.bb[3]) continue; if (inPoly(w, g.rings)) return {coll: 'zones', id: zn.ref && this.m.item(zn.ref) ? zn.ref : zn.id, zone: zn.id}; }
    return null;
  }
}
