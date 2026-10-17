/* A small declarative form system for the editor. Fields render to HTML and read back into plain objects. */
import {esc, svg, GLYPH, toHex, clone} from './util.js';

export const getPath = (o, p) => p.split('.').reduce((a, k) => a == null ? undefined : a[k], o);
export function setPath(o, p, v) {
  const ks = p.split('.'), last = ks[ks.length - 1];
  const empty = v === undefined || v === '' || (Array.isArray(v) && !v.length);
  if (empty) {
    const chain = [o]; let cur = o;
    for (let i = 0; i < ks.length - 1; i++) { cur = cur && cur[ks[i]]; if (cur == null || typeof cur !== 'object') return; chain.push(cur); }
    delete cur[last];
    for (let i = chain.length - 1; i > 0; i--) { if (Object.keys(chain[i]).length) break; delete chain[i - 1][ks[i - 1]]; }
    return;
  }
  let cur = o;
  for (let i = 0; i < ks.length - 1; i++) { if (cur[ks[i]] == null || typeof cur[ks[i]] !== 'object') cur[ks[i]] = {}; cur = cur[ks[i]]; }
  cur[last] = v;
}
const ICONS = () => Object.keys(GLYPH).sort();

/**
 * Field spec: {k: 'path', t: type, label, help, opts: [[value,label]] | () => [...], ph, wide, rows, sub: [fields] (list), refs: () => [{id,label}], show: data => bool}
 * Types: text, textarea, html, number, check, select, multi, color, icon, image, refs, ref, list, json, stops, coords
 */
export function renderFields(fields, data, ctx) {
  return fields.filter(f => !f.show || f.show(data)).map(f => renderField(f, data, ctx)).join('');
}
let seq = 0;
export function renderField(f, data, ctx) {
  const v = getPath(data, f.k), id = 'wf' + (++seq), lab = f.label ? `<label for="${id}">${esc(f.label)}${f.help ? `<small>${esc(f.help)}</small>` : ''}</label>` : '';
  const wrap = (inner, cls = '') => `<div class="ef ef-${f.t}${f.wide ? ' wide' : ''} ${cls}" data-k="${esc(f.k)}" data-t="${f.t}">${lab}${inner}</div>`;
  const opts = typeof f.opts === 'function' ? f.opts(data) : (f.opts || []);
  switch (f.t) {
    case 'text': return wrap(`<input id="${id}" type="text" value="${esc(v ?? '')}" placeholder="${esc(f.ph || '')}">`);
    case 'number': return wrap(`<input id="${id}" type="number" step="${f.step ?? 'any'}" value="${v ?? ''}" placeholder="${esc(f.ph || '')}">`);
    case 'textarea': return wrap(`<textarea id="${id}" rows="${f.rows || 3}" placeholder="${esc(f.ph || '')}">${esc(v ?? '')}</textarea>`);
    case 'html': return wrap(`<div class="html-host" data-html-host></div><textarea id="${id}" rows="${f.rows || 7}" class="html-src" placeholder="${esc(f.ph || 'HTML or plain text')}">${esc(v ?? '')}</textarea>`, 'is-html');
    case 'json': return wrap(`<textarea id="${id}" rows="${f.rows || 6}" class="mono" spellcheck="false">${esc(v === undefined ? '' : JSON.stringify(v, null, 1))}</textarea>`);
    case 'check': return `<div class="ef ef-check${f.wide ? ' wide' : ''}" data-k="${esc(f.k)}" data-t="check"><label><input type="checkbox" ${v ? 'checked' : ''}> ${esc(f.label)}${f.help ? `<small>${esc(f.help)}</small>` : ''}</label></div>`;
    case 'select': return wrap(`<select id="${id}">${f.none !== false ? `<option value="">${esc(f.none || '—')}</option>` : ''}${opts.map(([val, l]) => `<option value="${esc(val)}" ${String(v ?? '') === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}${v != null && v !== '' && !opts.some(([val]) => String(val) === String(v)) ? `<option value="${esc(v)}" selected>${esc(v)} (?)</option>` : ''}</select>`);
    case 'multi': { const set = new Set([].concat(v || [])); return wrap(`<div class="multi">${opts.map(([val, l]) => `<label><input type="checkbox" value="${esc(val)}" ${set.has(val) ? 'checked' : ''}> ${esc(l)}</label>`).join('') || '<span class="muted">None available</span>'}</div>`); }
    case 'color': { const hex = typeof v === 'string' && v && v !== 'auto' ? toHex(v) : '#888888'; return wrap(`<div class="colorrow"><input type="color" value="${hex}" ${v ? '' : 'data-unset'}><input type="text" value="${esc(v ?? '')}" placeholder="${esc(f.ph || 'inherit')}"><button type="button" class="mini" data-clear title="Clear">${svg('x', 2)}</button></div>`);
    }
    case 'icon': return wrap(`<div class="iconrow"><span class="iprev">${svg(v || 'pin')}</span><select>${`<option value="">${esc(f.none || 'default')}</option>`}${ICONS().map(n => `<option value="${n}" ${v === n ? 'selected' : ''}>${n}</option>`).join('')}${v && !GLYPH[v] ? `<option value="${esc(v)}" selected>${esc(v)}</option>` : ''}</select><input type="text" value="${esc(v && !GLYPH[v] ? v : '')}" placeholder="or Font Awesome: fa-solid fa-skull"></div>`);
    case 'image': return wrap(`<div class="imgrow"><input type="text" value="${esc(v ?? '')}" placeholder="path or URL"><button type="button" class="mini" data-browse title="Browse">${svg('image')}</button></div>${v ? `<img class="imgprev" src="${esc(ctx && ctx.resolveUrl ? ctx.resolveUrl(v) : v)}" alt="">` : ''}`);
    case 'refs': case 'ref': {
      const ids = f.t === 'ref' ? (v ? [v] : []) : [].concat(v || []);
      const all = f.refs ? f.refs(data) : []; const by = new Map(all.map(o => [o.id, o]));
      const listId = 'wl' + seq;
      return wrap(`<div class="refs" data-single="${f.t === 'ref'}">${ids.map(i => `<span class="chipref" data-id="${esc(i)}">${esc((by.get(i) || {}).label || i)}<button type="button" data-unref title="Remove">${svg('x', 2)}</button></span>`).join('')}<input type="text" list="${listId}" placeholder="${esc(f.ph || 'Type a name…')}"><datalist id="${listId}">${all.map(o => `<option value="${esc(o.label)}"></option>`).join('')}</datalist></div>`);
    }
    case 'list': {
      const rows = Array.isArray(v) ? v : [];
      const row = (r, i) => `<div class="lrow" data-row="${i}">${renderFields(f.sub, r || {}, ctx)}<button type="button" class="mini rm" data-rmrow title="Remove">${svg('trash')}</button></div>`;
      return wrap(`<div class="lrows">${rows.map(row).join('')}</div><template>${row({}, 'new')}</template><button type="button" class="mini add" data-addrow>${svg('plus', 2)} ${esc(f.addLabel || 'Add')}</button>`);
    }
    case 'reveal': {
      const r = v || {}, tiers = (ctx && ctx.tiers) || ['Hidden', 'Existence', 'Basic', 'Full', 'Secret'], ps = (ctx && ctx.players) || [];
      const opt = (sel, inherit, defLabel) => (inherit ? `<option value="" ${sel === '' || sel == null ? 'selected' : ''}>${esc(defLabel)}</option>` : '') + tiers.map((n, i) => `<option value="${i}" ${sel !== '' && sel != null && +sel === i ? 'selected' : ''}>${i} · ${esc(n)}</option>`).join('');
      return wrap(`<div class="revealf"><label><span>Everyone</span><select data-who="*">${opt(r.all, true, f.defLabel || 'default')}</select></label>${ps.map(p => `<label><span>${esc(p.name)}</span><select data-who="${esc(p.id)}">${opt((r.users || {})[p.id], true, 'as everyone')}</select></label>`).join('')}</div>`);
    }
    case 'stops': return wrap(`<input id="${id}" type="text" value="${esc(v === undefined ? '' : JSON.stringify(v))}" placeholder="2 or [[10,1],[15,4]]">`);
    case 'coords': return wrap(`<input id="${id}" type="text" value="${esc(v ? JSON.stringify(v) : '')}" placeholder="[a, b]">`);
    case 'info': return `<div class="ef ef-info wide">${f.html ? (typeof f.html === 'function' ? f.html(data) : f.html) : ''}</div>`;
  }
  return '';
}

/** Read the fields under root back into `base` (a clone is returned). */
export function readFields(root, fields, base, ctx) {
  const out = clone(base) || {};
  for (const f of fields) {
    const el = [...root.querySelectorAll(`.ef[data-k="${CSS.escape(f.k)}"]`)].find(x => { const lr = x.closest('.lrow'); return root.matches('.lrow') ? lr === root : !lr; });
    if (!el) continue;
    let v;
    switch (f.t) {
      case 'text': case 'textarea': v = el.querySelector('input,textarea').value.trim(); break;
      case 'html': { const host = el.querySelector('[data-html-host]'); v = host && host._getValue ? host._getValue() : el.querySelector('textarea').value; v = (v || '').trim(); if (v && !/[<]/.test(v)) v = v.split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join(''); break; }
      case 'number': { const s = el.querySelector('input').value; v = s === '' ? undefined : +s; break; }
      case 'check': { const was = getPath(base, f.k); v = el.querySelector('input').checked ? (was ? was : true) : undefined; break; }
      case 'select': v = el.querySelector('select').value; if (f.num && v !== '') v = +v; break;
      case 'multi': v = [...el.querySelectorAll('input:checked')].map(i => i.value); break;
      case 'color': v = el.querySelector('input[type=text]').value.trim(); break;
      case 'icon': { const t = el.querySelector('input').value.trim(); v = t || el.querySelector('select').value; break; }
      case 'image': v = el.querySelector('input').value.trim(); break;
      case 'refs': v = [...el.querySelectorAll('.chipref')].map(c => c.dataset.id); break;
      case 'ref': v = (el.querySelector('.chipref') || {}).dataset?.id; break;
      case 'json': { const s = el.querySelector('textarea').value.trim(); if (!s) v = undefined; else { try { v = JSON.parse(s); } catch (e) { throw new Error(`${f.label || f.k}: invalid JSON (${e.message})`); } } break; }
      case 'reveal': { const o = {}; el.querySelectorAll('select[data-who]').forEach(sel => { if (sel.value === '') return; if (sel.dataset.who === '*') o.all = +sel.value; else (o.users ||= {})[sel.dataset.who] = +sel.value; }); v = Object.keys(o).length ? o : undefined; break; }
      case 'stops': { const s = el.querySelector('input').value.trim(); if (!s) v = undefined; else if (/^-?[\d.]+$/.test(s)) v = +s; else { try { v = JSON.parse(s); } catch (e) { throw new Error(`${f.label || f.k}: use a number or [[zoom,width],…]`); } } break; }
      case 'coords': { const s = el.querySelector('input').value.trim(); if (!s) v = undefined; else { try { v = JSON.parse(s); } catch (e) { throw new Error(`${f.label || f.k}: use [a, b]`); } } break; }
      case 'list': { const orig = getPath(base, f.k) || []; v = [...el.querySelectorAll(':scope > .lrows > .lrow')].map(r => readFields(r, f.sub, r.dataset.row !== 'new' && orig[+r.dataset.row] ? orig[+r.dataset.row] : {}, ctx)).filter(o => Object.keys(o).length); break; }
      case 'info': continue;
    }
    setPath(out, f.k, v);
  }
  return out;
}

/** Wire interactive bits (colour pickers, icon previews, ref chips, list rows, image browse). */
export function bindFields(root, fields, ctx) {
  const findField = k => { const walk = fs => { for (const f of fs) { if (f.k === k) return f; if (f.sub) { const r = walk(f.sub); if (r) return r; } } return null; }; return walk(fields); };
  root.addEventListener('input', e => {
    const c = e.target.closest('.ef-color'); if (c) { const [pick, txt] = c.querySelectorAll('input'); if (e.target === pick) txt.value = pick.value; else if (/^#[0-9a-f]{6}$/i.test(txt.value)) pick.value = txt.value; }
  });
  root.addEventListener('change', e => {
    const ic = e.target.closest('.ef-icon'); if (ic) { const sel = ic.querySelector('select'), t = ic.querySelector('input'); if (e.target === sel) t.value = ''; ic.querySelector('.iprev').innerHTML = svg(t.value.trim() || sel.value || 'pin'); }
    const rf = e.target.closest('.refs'); if (rf && e.target.matches('input[list]')) addRef(rf, e.target);
    const im = e.target.closest('.ef-image'); if (im && e.target.matches('input')) { let p = im.querySelector('.imgprev'); if (!p) { p = document.createElement('img'); p.className = 'imgprev'; im.appendChild(p); } p.src = ctx.resolveUrl ? ctx.resolveUrl(e.target.value) : e.target.value; }
  });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.refs input[list]')) { e.preventDefault(); addRef(e.target.closest('.refs'), e.target); } });
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.matches('[data-clear]')) { const c = b.closest('.ef-color'); c.querySelector('input[type=text]').value = ''; }
    else if (b.matches('[data-unref]')) b.closest('.chipref').remove();
    else if (b.matches('[data-rmrow]')) b.closest('.lrow').remove();
    else if (b.matches('[data-addrow]')) { const ef = b.closest('.ef'); const tpl = ef.querySelector(':scope > template'); const rows = ef.querySelector(':scope > .lrows'); rows.appendChild(tpl.content.cloneNode(true)); }
    else if (b.matches('[data-browse]')) { const inp = b.closest('.imgrow').querySelector('input'); ctx.pickImage?.(inp.value, path => { inp.value = path; inp.dispatchEvent(new Event('change', {bubbles: true})); }); }
  });
  function addRef(rf, inp) {
    const ef = rf.closest('.ef'); const f = findField(ef.dataset.k); if (!f) return;
    const all = f.refs ? f.refs(ctx.data || {}) : []; const val = inp.value.trim(); if (!val) return;
    const hit = all.find(o => o.label === val) || all.find(o => o.id === val) || all.find(o => o.label.toLowerCase().startsWith(val.toLowerCase()));
    if (!hit) return;
    if (rf.dataset.single === 'true') rf.querySelectorAll('.chipref').forEach(c => c.remove());
    if (!rf.querySelector(`.chipref[data-id="${CSS.escape(hit.id)}"]`)) { const s = document.createElement('span'); s.className = 'chipref'; s.dataset.id = hit.id; s.innerHTML = `${esc(hit.label)}<button type="button" data-unref title="Remove">${svg('x', 2)}</button>`; rf.insertBefore(s, inp); }
    inp.value = '';
  }
  // rich text editors
  if (ctx.richEditor) root.querySelectorAll('.ef-html').forEach(ef => { const host = ef.querySelector('[data-html-host]'), ta = ef.querySelector('textarea'); try { const ok = ctx.richEditor(host, ta.value, ta); if (ok) ta.hidden = true; } catch (e) { console.warn('wod-city-atlas | rich editor unavailable', e); } });
}
