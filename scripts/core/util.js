import {GLYPH} from './glyphs-data.js';
export {GLYPH};

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
export const clone = o => o === undefined ? undefined : JSON.parse(JSON.stringify(o));
export const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
export const sortBy = (arr, ...keys) => arr.sort((a, b) => { for (const k of keys) { const x = typeof k === 'function' ? k(a) : a[k], y = typeof k === 'function' ? k(b) : b[k]; if (x < y) return -1; if (x > y) return 1; } return 0; });
export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const safeId = s => String(s || '').trim().replace(/[.\s/\\[\]#?"']+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
export const stripHtml = h => String(h ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

/** Inline SVG for a glyph name, or a Font Awesome icon when the name starts with "fa". */
export function svg(name, w = 1.6) {
  if (name && /^fa[srlbd]?[\s-]/.test(name)) return `<i class="${esc(name)}" aria-hidden="true"></i>`;
  const g = GLYPH[name] || GLYPH.pin;
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${g}</svg>`;
}

/* ---------- glyphs as Path2D (for canvas patterns) ---------- */
const P2D = new Map();
export function glyphPath(name) {
  if (P2D.has(name)) return P2D.get(name);
  const src = GLYPH[name] || GLYPH.star; const p = new Path2D();
  const attr = (s, a) => { const m = new RegExp(`\\b${a}="([^"]*)"`).exec(s); return m ? m[1] : null; };
  for (const m of src.matchAll(/<(path|circle|ellipse|rect)\b([^>]*)\/?>/g)) {
    const [, tag, at] = m;
    if (tag === 'path') p.addPath(new Path2D(attr(at, 'd')));
    else if (tag === 'circle') { const cx = +attr(at, 'cx'), cy = +attr(at, 'cy'), r = +attr(at, 'r'); p.moveTo(cx + r, cy); p.arc(cx, cy, r, 0, Math.PI * 2); }
    else if (tag === 'ellipse') { const cx = +attr(at, 'cx'), cy = +attr(at, 'cy'), rx = +attr(at, 'rx'), ry = +attr(at, 'ry'); p.moveTo(cx + rx, cy); p.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); }
    else if (tag === 'rect') { p.rect(+attr(at, 'x'), +attr(at, 'y'), +attr(at, 'width'), +attr(at, 'height')); }
  }
  P2D.set(name, p); return p;
}

/* ---------- colours ---------- */
const CC = new Map();
let cctx = null;
/** Parse any CSS colour to [r,g,b,a]. */
export function rgba(c) {
  if (!c || typeof c !== 'string') return [0, 0, 0, 0];
  if (CC.has(c)) return CC.get(c);
  let out = [0, 0, 0, 1];
  const m = /^#([0-9a-f]{3,8})$/i.exec(c.trim());
  if (m) {
    let h = m[1]; if (h.length <= 4) h = [...h].map(x => x + x).join('');
    const n = parseInt(h.slice(0, 6), 16); out = [n >> 16 & 255, n >> 8 & 255, n & 255, h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1];
  } else {
    const r = /^rgba?\(([^)]+)\)$/i.exec(c.trim());
    if (r) { const p = r[1].split(/[\s,\/]+/).filter(Boolean).map(Number); out = [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
    else if (typeof document !== 'undefined') {
      cctx ??= document.createElement('canvas').getContext('2d'); cctx.fillStyle = '#000'; cctx.fillStyle = c; const v = cctx.fillStyle;
      if (v !== c) out = rgba(v);
    }
  }
  CC.set(c, out); return out;
}
export const withAlpha = (c, a) => { const [r, g, b, a0] = rgba(c); return `rgba(${r},${g},${b},${+(a0 * a).toFixed(3)})`; };
export const toHex = c => { const [r, g, b] = rgba(c); return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join(''); };

/** Width that may be a number or zoom stops [[z,w],...] (linear between stops). */
export function zw(w, z) {
  if (typeof w === 'number') return w;
  if (!Array.isArray(w) || !w.length) return 1;
  if (z <= w[0][0]) return w[0][1];
  for (let i = 0; i < w.length - 1; i++) { const [z0, w0] = w[i], [z1, w1] = w[i + 1]; if (z >= z0 && z <= z1) return w0 + (w1 - w0) * (z - z0) / (z1 - z0); }
  return w[w.length - 1][1];
}

/* ---------- geometry ---------- */
export function inRing(pt, ring) { let c = false; const [x, y] = pt; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; }
export const inPoly = (pt, rings) => rings.reduce((a, r) => inRing(pt, r) ? !a : a, false);
export function segDist(p, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1]; const l2 = dx * dx + dy * dy; let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0; t = clamp(t, 0, 1); return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy)); }
export const ringArea = r => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(a / 2); };
export function bbOf(lines) { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const l of lines) for (const [x, y] of l) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; } return [a, b, c, d]; }
/** Visual centre of a ring: the centroid if inside, else the inside point nearest to it (sampled). */
export function ringCenter(r) {
  let A = 0, cx = 0, cy = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const f = r[j][0] * r[i][1] - r[i][0] * r[j][1]; A += f; cx += (r[j][0] + r[i][0]) * f; cy += (r[j][1] + r[i][1]) * f; }
  if (Math.abs(A) < 1e-18) { const bb = bbOf([r]); return [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2]; }
  const c = [cx / (3 * A), cy / (3 * A)];
  if (inRing(c, r)) return c;
  const bb = bbOf([r]); let best = null, bd = Infinity;
  for (let i = 1; i < 12; i++) for (let j = 1; j < 12; j++) { const p = [bb[0] + (bb[2] - bb[0]) * i / 12, bb[1] + (bb[3] - bb[1]) * j / 12]; if (!inRing(p, r)) continue; const d = Math.hypot(p[0] - c[0], p[1] - c[1]); if (d < bd) { bd = d; best = p; } }
  return best || c;
}
/** Quadratic arc between two points (used for curved routes such as moon bridges). */
export function arcPts(a, b, k, n = 24) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len, ny = dx / len; if (ny > 0) { nx = -nx; ny = -ny; }
  const cx = mx + nx * len * k, cy = my + ny * len * k; const out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * cx + t * t * b[0], u * u * a[1] + 2 * u * t * cy + t * t * b[1]]); }
  return out;
}

/* ---------- seeded random ---------- */
export function rng(seed = 1991) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
