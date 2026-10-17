"""Rebuild presets/milwaukee/atlas.json from the v1.3.0 preset plus the hand-written content in this folder.

    python3 tools/content/build.py            # writes the preset
    python3 tools/content/build.py --check    # report only

The base is the preset as released in v1.3.0 (git 8ff6f71). Every entry registered with E() gets its
starting knowledge, texts, callouts, secrets and pin art from here. Entries in the Dreaming, the
Shadowlands and the Umbra that have no hand-written content are split automatically into a short
Basic text and the rest, and start hidden.
"""
import json, re, subprocess, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import lib
from lib import para, note
import people_waking, places_street, places_under, dream  # noqa: F401  (registration side effects)
import pages, extra

BASE_COMMIT = '8ff6f71'
base = json.loads(subprocess.check_output(['git', '-C', ROOT, 'show', f'{BASE_COMMIT}:presets/milwaukee/atlas.json']))
A = base
extra.pre(A)
COLLS = ['places', 'people', 'zones', 'routes', 'auras', 'labels', 'pages']
GLYPHS = set(re.findall(r"(?:^|[,{\s])([a-z0-9]+):'", open(os.path.join(ROOT, 'scripts/core/glyphs-data.js')).read()))
problems = []


def find(i):
    for c in COLLS:
        if i in A[c]:
            return c, A[c][i]
    return None, None


def realm_of(it):
    r = it.get('realm')
    if isinstance(r, list):
        return r[0] if r else None
    if r:
        return r
    rs = it.get('realms') or []
    return rs[0].split(':')[0] if rs else None


def strip(h):
    return re.sub(r'<[^>]+>', '', h or '')


def split_auto(h):
    """First sentence (or two short ones) for Basic; the rest for Full."""
    paras = re.findall(r'<p>(.*?)</p>', h or '', re.S) or ([h] if h else [])
    if not paras:
        return '', ''
    first = paras[0]
    sents = re.split(r'(?<=[.!?])\s+(?=[A-Z“"(])', first)
    take = sents[0]
    if len(take) < 90 and len(sents) > 1:
        take += ' ' + sents[1]
    rest_first = first[len(take):].strip()
    rest = ([rest_first] if rest_first else []) + paras[1:]
    return f'<p>{take}</p>', ''.join(f'<p>{p}</p>' for p in rest)


# ---------------------------------------------------------------- hand-written entries
covered = set()
for i, kw in lib.REG.items():
    c, it = find(i)
    if not it:
        problems.append(f'unknown id {i}')
        continue
    covered.add(i)
    if 't' in kw:
        it['reveal'] = {'all': kw['t']}
    for k in ('name', 'sub', 'kicker', 'title'):
        if kw.get(k):
            it[k] = kw[k]
    if 'alias' in kw:
        if kw['alias']:
            it['alias'] = kw['alias']
        else:
            it.pop('alias', None)
    if 'rumour' in kw:
        if kw['rumour']:
            it['aliasText'] = kw['rumour']
        else:
            it.pop('aliasText', None)
    if 'brief' in kw:
        it['brief'] = para(kw['brief'])
    if 'full' in kw:
        h = para(kw['full'])
        if h:
            it['html'] = h
        else:
            it.pop('html', None)
    if c == 'pages' and 'html' in kw:
        it['html'] = kw['html']
    if any(k in kw for k in ('calls', 'secrets', 'st')):
        ns = []
        for x in kw.get('calls') or []:
            ns.append(note(x[0], x[1], kind=x[2] if len(x) > 2 else 'scene'))
        for x in kw.get('secrets') or []:
            ns.append(note(x[0], x[1], secret=True))
        for x in kw.get('st') or []:
            ns.append(note(x[0], x[1], st=True))
        if ns:
            it['notes'] = ns
        else:
            it.pop('notes', None)
    elif 'brief' in kw and it.get('notes'):
        # keep only callouts that were not folded into the new texts: secrets survive, plain callouts too
        pass
    if kw.get('icon'):
        it['icon'] = kw['icon']
    if kw.get('shape'):
        it.setdefault('pin', {})['shape'] = kw['shape']
    if kw.get('photo'):
        it.setdefault('pin', {})['photo'] = True
    for k in ('icon',):
        if it.get(k) and it[k] not in GLYPHS:
            problems.append(f'{i}: unknown glyph {it[k]}')

# ---------------------------------------------------------------- the rest of the Dreaming, Shadowlands and Umbra
auto = 0
for c in ('places', 'people', 'zones', 'routes', 'auras', 'labels'):
    for i, it in A[c].items():
        if i in covered:
            continue
        r = realm_of(it)
        if r in ('dream', 'shadow', 'umbra'):
            it['reveal'] = {'all': 0}
            if c != 'labels' and it.get('html') and not it.get('brief'):
                b, f = split_auto(it['html'])
                it['brief'] = b
                if f:
                    it['html'] = f
                else:
                    it.pop('html', None)
                auto += 1
            for n in it.get('notes') or []:
                if n.get('kind') == 'play' and not n.get('secret'):
                    n['st'] = True
        elif c in ('places', 'people', 'zones', 'routes', 'auras') and not it.get('decor'):
            problems.append(f'waking {c} without content: {i} {it.get("name")}')

# ---------------------------------------------------------------- realms, levels, layers, labels
for rid in ('dream', 'shadow', 'umbra'):
    A['realms'][rid]['reveal'] = {'all': 0}
for lv in A['realms']['waking']['levels']:
    if lv['id'] == 'depths':
        lv['reveal'] = {'all': 0}
for lid in ('packs',):
    A['layers'][lid]['reveal'] = {'all': 0}
for lid, L in A['layers'].items():
    rs = L.get('realm')
    rs = rs if isinstance(rs, list) else [rs]
    if rs and all(x in ('dream', 'shadow', 'umbra') for x in rs if x):
        L['reveal'] = {'all': 0}
for k, lb in A['labels'].items():
    if lb.get('layer') == 'packs' or (lb.get('text') or '').strip() in ('BLIGHTED WOODS',) or realm_of(lb) in ('dream', 'shadow', 'umbra'):
        lb['reveal'] = {'all': 0}
    elif (lb.get('text') or '').replace(' ', '') in ('THELAKEOVERHEAD',):
        lb['reveal'] = {'all': 0}
A['categories']['waking:story']['name'] = 'The Prince’s fall (1991)'
W = A['realms']['waking']
W['date'] = 'Autumn 1991, the nights after the Prince’s fall'
for l in W['legend']:
    if l['label'] in ('Kithain haunts', 'Ritual ring'):
        l['gm'] = True
for lv in W['levels']:
    if lv['id'] == 'underground':
        lv['banner'] = 'The Warrens · the Rat Market · things in the tunnels'
        for l in lv.get('legend', []):
            if l['label'] in ('The way under the lake', 'The Pocket'):
                l['gm'] = True
A['layers']['routes']['name'] = 'Patrols & routes'


def inside(pt, ring):
    x, y = pt[1], pt[0]; c = False
    for i in range(len(ring)):
        a, b2 = ring[i], ring[i - 1]
        if (a[0] > y) != (b2[0] > y) and x < (b2[1] - a[1]) * (y - a[0]) / ((b2[0] - a[0]) or 1e-12) + a[1]:
            c = not c
    return c


for k, lb in A['labels'].items():
    if not lb.get('layer') or not lb.get('at') or lb.get('reveal'):
        continue
    zs = [z for z in A['zones'].values() if z.get('layer') == lb['layer'] and z.get('rings') and inside(lb['at'], z['rings'][0])]
    if zs and all((z.get('reveal') or {}).get('all', 3) == 0 for z in zs):
        lb['reveal'] = {'all': 0}
        print('hid label', k, lb.get('text'))
# decorative lights underground stay visible (the view hides empty category chips by itself)
for k, au in A['auras'].items():
    if au.get('decor') and realm_of(au) == 'waking':
        au['reveal'] = {'all': 3}
# new entries the Storyteller makes later start hidden; labels stay visible
A['revealDefault'] = {'*': 0, 'labels': 3, 'pages': 3}

pages.apply(A)
extra.apply(A)
for c in ('places', 'people', 'categories'):
    for i, it in A[c].items():
        if it.get('icon') and it['icon'] not in GLYPHS:
            problems.append(f'{i}: unknown glyph {it["icon"]}')

# ---------------------------------------------------------------- relations
def rel(pid, rows):
    p = A['people'][pid]
    p.setdefault('relations', {'title': 'Attitudes'})
    have = p['relations'].setdefault('rows', [])
    for r in rows:
        if isinstance(r, tuple):
            r = {'a': r[0], 'b': r[1], **({'ref': r[2]} if len(r) > 2 and r[2] else {}), **({'secret': True, 'reveal': {'all': 0}} if len(r) > 3 and r[3] else {})}
        have.append(r)


def secret_rel(pid, who):
    for r in A['people'][pid].get('relations', {}).get('rows', []):
        if r['a'] == who:
            r['secret'] = True
            r['reveal'] = {'all': 0}


for pid in A['people']:
    rows = A['people'][pid].get('relations', {}).get('rows')
    if rows:
        A['people'][pid]['relations']['rows'] = [r if isinstance(r, dict) else {'a': r[0], 'b': r[1]} for r in rows]
secret_rel('scott', 'Lucina'); secret_rel('parovich', 'Lucina'); secret_rel('carna', 'Victor'); secret_rel('carna', 'Mortius')
secret_rel('jason', 'Jacob'); secret_rel('jason', 'Esau'); secret_rel('turk', 'Esau'); secret_rel('mortius', 'Victor'); secret_rel('victor', 'Mortius')
for r in A['people']['jacob'].get('relations', {}).get('rows', []):
    if '(Esau)' in r['b']:
        r['secret'] = True; r['reveal'] = {'all': 0}
rel('gracis', [('Hrothulf', 'Blood feud', 'hrothulf'), ('Jade Riley', 'Upstart', 'jade')])
rel('hrothulf', [('Gracis', 'Blood feud', 'gracis'), ('Carna', 'Protector', 'carna', True)])
rel('jade', [('Macy Carver', 'Oldest friend', 'macy'), ('Jamie Robinson', 'Childe', 'jamie'), ('Gracis', 'Contempt', 'gracis'), ('Kayla', 'Trusts her', 'kayla', True), ('Decker', 'Wary', 'decker')])
rel('agatha', [('Parovich', 'Shame', 'parovich'), ('Cricket', 'Her eyes', 'cricket'), ('Brother Dust', 'Old friend', 'dust')])
rel('decker', [('Jade Riley', 'Watching her', 'jade'), ('Julia Calvin', 'Childe', 'julia', True), ('Thomas', 'Right hand', 'thomas')])
rel('kristian', [('Anastasia', 'Protective', 'anastasia'), ('Parovich', 'Doubts his death', 'parovich', True)])
rel('ethan', [('Wrecker', 'Brother in arms', 'wrecker'), ('Maximus', 'Still has his totem', 'maximus', True)])
rel('wrecker', [('Ethan Stone', 'Brother in arms', 'ethan')])
rel('guillem', [('Noemí Santana', 'Bodyguard', 'noemi'), ('Parovich', 'Spent tool', 'parovich')])
rel('haberman', [('Jesselin', 'Correspondent', 'jesselin', True), ('Newman', 'Colleague', 'newman')])
rel('newman', [('Haberman', 'Suspects the leak', 'haberman', True)])
rel('gunther', [('Mercer', 'Old friend', 'mercer', True), ('Merik', 'Suspects him', 'merik', True)])
rel('raoul', [('Gracis', 'Master', 'gracis')])
rel('jamie', [('Jade Riley', 'Sire', 'jade')])
rel('macy', [('Jade Riley', 'Devoted', 'jade')])

# ---------------------------------------------------------------- report and write
print(f'hand-written: {len(covered)}; auto-split: {auto}')
for p in problems:
    print('!', p)
if '--check' not in sys.argv:
    out = os.path.join(ROOT, 'presets/milwaukee/atlas.json')
    with open(out, 'w') as f:
        json.dump(A, f, ensure_ascii=False, separators=(',', ':'))
    print('wrote', out, os.path.getsize(out))
