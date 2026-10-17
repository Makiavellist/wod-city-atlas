/* Render an atlas view to a still picture (for Foundry scenes), as a given viewer would see it. */
import {Renderer} from './renderer.js';
import {GLYPH} from './util.js';
import {TIER} from './model.js';

/**
 * @param {AtlasView} view  the live view (realm, level, layer toggles are taken from it)
 * @param {object} o {area: 'view'|'all', size: max pixels, as: userId|'*'|'gm', labels: bool}
 * @returns {Promise<{blob, width, height, places: Array}>}
 */
export async function renderSnapshot(view, o = {}) {
  const m = view.model, c = view.cam;
  let bb = o.bb || null;
  if (!bb && o.area === 'all') bb = view.worldBB();
  if (!bb) { const s = Math.pow(2, c.z); bb = [c.cx - c.W / 2 / s, c.cy - c.H / 2 / s, c.cx + c.W / 2 / s, c.cy + c.H / 2 / s]; }
  const w0 = bb[2] - bb[0], h0 = bb[3] - bb[1], size = o.size || 4096;
  const k = size / Math.max(w0, h0);
  const W = Math.max(64, Math.round(w0 * k)), H = Math.max(64, Math.round(h0 * k));
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  const st = Object.assign({}, view.st, o.as === 'gm' ? {storyteller: true, gm: true, as: '*'} : {storyteller: false, gm: false, as: o.as || '*'});
  const places = [];
  const fake = {
    model: m, ctx: canvas.getContext('2d'), cam: {cx: (bb[0] + bb[2]) / 2, cy: (bb[1] + bb[3]) / 2, z: Math.log2(k), W, H, dpr: 1},
    st, T: 0, sel: null, hover: null, rv: view.rv, editor: null, noLabels: o.labels === false, bare: !!o.bare,
    layerOn: id => view.layerOn(id), isHiddenItem: id => view.isHiddenItem(id), resolveUrl: s => view.resolveUrl(s), dirty() {},
    markerBoxes: () => places.map(p => [p.x - 13, p.y - 13, p.x + 13, p.y + 13])
  };
  // places first, so labels avoid the note icons
  for (const p of o.bare ? [] : Object.values(m.atlas.places)) {
    if (!p.at || p.hidden || !m.visible(p, 'places', st, {ignoreCat: true})) continue;
    const w = m.proj.toWorld(p.at); const x = (w[0] - bb[0]) * k, y = (w[1] - bb[1]) * k;
    if (x < 0 || y < 0 || x > W || y > H) continue;
    const t = m.tier(p, 'places', st), known = t >= TIER.BASIC;
    places.push({id: p.id, x, y, tier: t, name: known ? p.name : (p.alias || 'Unknown place'), color: known ? m.colorOf(p) : '#9a9aa4', icon: known ? m.iconOf(p, 'places') : 'unknown'});
  }
  const r = new Renderer(fake);
  // make sure pictures are loaded before drawing
  const srcs = new Set(); const bg = view.rv.background; if (bg && bg.src) srcs.add(bg.src);
  for (const z of Object.values(m.atlas.zones)) if (z.fillImage && z.fillImage.src) srcs.add(z.fillImage.src);
  await Promise.all([...srcs].map(src => new Promise(ok => { r.image(src); const im = r.images.get(src); if (!im || im.complete) return ok(); im.addEventListener('load', ok, {once: true}); im.addEventListener('error', ok, {once: true}); setTimeout(ok, 15000); })));
  try { await document.fonts.ready; } catch (e) {}
  r.draw();
  const blob = await new Promise(ok => canvas.toBlob(ok, 'image/webp', 0.88));
  return {blob, width: W, height: H, places, bb};
}

/** A round pin icon for map notes: white glyph on a dark disc, meant to be tinted. */
export function pinSvg(glyph) {
  const g = GLYPH[glyph] || GLYPH.pin;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="128" height="128"><circle cx="32" cy="32" r="29" fill="#15121a" stroke="#ffffff" stroke-width="3.5"/><g transform="translate(16 16) scale(2)" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${g}</g></svg>`;
}
