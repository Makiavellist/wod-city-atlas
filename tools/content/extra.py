"""Pin art and other finishing touches."""
import copy

# Specific glyphs for pins that only had their category's icon.
ICONS = {
    # waking leftovers
    'hist-kilbourn': 'hour', 'hist-1900': 'wolf', 'f-hearth': 'cup', 'f-shop': 'wrench', 'f-hall': 'music',
    'f-celia': 'music', 'f-kit': 'coin', 'c-macy-house': 'house', 'c-rusty': 'music', 'c-711': 'coin',
    'c-breach1': 'bat', 'c-guillem-church': 'church', 'c-maximus-shop': 'needle', 'c-ethan': 'tower',
    'c-dominique': 'flame', 'c-soraya': 'candle', 'c-anchor-n': 'radio', 'c-ritual-core': 'target', 'f-ruth': 'map',
    'gp-grand': 'haven', 'gp-ratking': 'rat', 'gp-market': 'scales', 'gp-pocketdoor2': 'door', 'gp-houses': 'house',
    'gp-angels': 'grave', 'gp-lion': 'shield', 'gp-gallery': 'book2', 'gp-ivory': 'tower', 'gp-shaft-ji': 'grate',
    'gp-shaft-n': 'grate', 'gp-shaft-v': 'grate', 'gp-miller': 'glass', 'gp-ossuary': 'skull', 'gp-hounds': 'fang',
    'gp-choir': 'bell', 'gp-wall': 'heart', 'gp-stalker': 'mask', 'gp-shovel': 'grave', 'gp-vozd': 'serpent',
    'gp-drake': 'spiral', 'gp-cistern': 'waves', 'gp-maxcache': 'key', 'gp-gills': 'fish', 'gp-gas': 'car',
    'gp-diner': 'cup', 'gp-gazebo': 'music', 'gp-pens': 'chain', 'gp-boxcar': 'train', 'gp-truss': 'bridge',
    'gp-spire': 'bell', 'ps-house': 'flame', 'ps-roof': 'flame', 'mitchell': 'plane', 'timmerman': 'plane',
    'port': 'boat', 'hilton': 'building', 'zoo': 'cat', 'h-milo': 'spiral', 'c-mercer': 'radio', 'c-casino': 'dice',
    'c-guillem-boat': 'boat', 'c-uwm': 'book', 'c-isis': 'ankh', 'c-anchor-e': 'lighthouse', 'f-warren': 'door',
    'h-barth': 'radio', 'library': 'book', 'f-pabst': 'building', 'hist-1674': 'feather', 'lup-usla': 'waves',
    # the Dreaming
    'd-hearth': 'cup', 'd-counter': 'bridge', 'd-keep': 'tower', 'd-wards': 'lock', 'd-index': 'book', 'd-stacks': 'book2',
    'd-ward': 'building', 'd-ruins': 'building', 'd-seat': 'mountain', 'd-arrivals': 'gem', 'd-stair': 'stairs',
    'd-winter': 'tree', 'd-departure': 'star', 'd-orchard': 'tree', 'd-third': 'wrench', 'd-ovation': 'theatre',
    'd-wolfeye': 'eye', 'd-borrowed': 'music', 'd-foundry': 'factory', 'd-bedrooms': 'house', 'd-blueroom': 'window',
    'd-platform': 'tram', 'd-lanternthreshold': 'lantern', 'd-pabstecho': 'stairs', 'd-eastecho': 'flag',
    'c-quire': 'book2', 'c-rent': 'key', 'c-surveyor': 'scroll', 'c-tollman': 'scales', 'c-usher': 'flame',
    'c-tuesday': 'paw', 'c-encore': 'theatre', 'c-swifts': 'feather', 'c-whale': 'fish', 'c-knock': 'door',
    'c-coat': 'tram', 'c-lantern': 'lantern', 'c-staircase': 'stairs', 'w-ribbon': 'rosette', 't-bell': 'bell',
    't-glass': 'mirror', 't-key': 'key', 't-thimble': 'cup', 't-pennant': 'flag', 't-lamp': 'lantern', 't-fruit': 'leaf',
    # the Shadowlands
    's-bronzeville': 'house', 's-four': 'chain', 's-ashes': 'flame', 's-hollow': 'spiral', 's-drain': 'grate',
    's-tempest': 'waves',
    # the Umbra
    'u-clockwork': 'clock', 'u-inkwell': 'scroll', 'u-skyweb': 'web', 'u-eyewatch': 'eye', 'u-talonrake': 'claw',
    'u-mortiuswards': 'web', 'u-chromepack': 'car', 'u-tallow': 'candle', 'u-tannin': 'flask', 'u-sabbatpact': 'serpent',
    'u-foggate': 'cloud', 'u-kkspirit': 'chain', 'u-polishmoon': 'clock', 'u-bazaar': 'coin', 'u-treaty': 'scales',
    'u-greatwater': 'waves', 'u-usla': 'waves', 'u-alewives': 'fish', 'u-avoided': 'eye', 'u-icemother': 'mountain',
    'u-breeze': 'cloud', 'u-bonfire': 'flame', 'u-knot': 'web', 'u-tolls': 'gate', 'u-hush': 'lock', 'u-embassy': 'paw',
    'u-greyamb': 'wolf', 'u-hive': 'spider', 'u-marked': 'shield', 'u-coyotecaern': 'totem', 'u-coyotebawn': 'shield',
    'u-oldfalls': 'waves', 'u-grinavatar': 'wolf', 'u-quarrylake': 'eye', 'u-aerie': 'feather', 'u-woundedeagle': 'feather',
    'u-gnaw': 'fang', 'u-dotfarm': 'house', 'u-granary': 'totem', 'u-grandmouse': 'rat', 'u-commission': 'house',
    'u-ericasroom': 'candle', 'u-hedgelords': 'tree', 'u-mousecave': 'wolf', 'u-lapham': 'cloud', 'u-kettles': 'eye',
    'u-bog': 'leaf', 'u-unnamed': 'spiral', 'u-holyhill': 'church', 'u-domes': 'tree', 'u-northdam': 'waves',
    'u-estabrook': 'waves', 'u-soldiers': 'swords', 'u-crucible': 'drop', 'g-pangaea': 'tree', 'g-cyber': 'radio',
    'g-malfeas': 'serpent', 'g-aether': 'moon', 'g-battle': 'swords', 'g-legend': 'scroll', 'g-fork': 'crossroads',
    'u-banenest': 'spider', 'u-blackcreek': 'drop',
}
# A few category shapes refreshed for variety
CAT_SHAPES = {'waking:transit': 'octagon', 'waking:g-entry': 'square', 'dream:treasure': 'diamond', 'umbra:gate': 'octagon'}


def pre(A):
    """Jacob and Esau get separate entries: the players think they are two people."""
    P = A['people']
    if 'esau' not in P:
        j = P['jacob']
        e = copy.deepcopy(j)
        e['id'] = 'esau'
        e['name'] = 'Esau'
        e['at'] = ['h-esau']
        e['order'] = (j.get('order') or 0) + 0.5
        e.pop('relations', None)
        e.pop('img', None)
        e.pop('uuid', None)
        rows = (j.get('relations') or {}).get('rows', [])
        e['relations'] = {'title': j.get('relations', {}).get('title', 'Attitudes'), 'rows': [dict(r, b=r['b'].replace(' (Esau)', '')) for r in rows if '(Esau)' in r['b'] and '(Jacob)' not in r['b']] + [{'a': 'Jason', 'b': 'Untrustworthy'}]}
        j['relations']['rows'] = [dict(r, b=r['b'].replace(' (Jacob)', '').split(' / ')[0]) for r in rows if '(Jacob)' in r['b']]
        j['name'] = 'Jacob'
        j['at'] = ['h-jacob']
        P['esau'] = e
        h = A['places'].get('h-esau')
        if h and 'jacob' in (h.get('people') or []):
            h['people'] = ['esau' if x == 'jacob' else x for x in h['people']]


def apply(A):
    for pid, icon in ICONS.items():
        if pid in A['places']:
            A['places'][pid]['icon'] = icon
    for cid, shape in CAT_SHAPES.items():
        if cid in A['categories']:
            A['categories'][cid].setdefault('pin', {})['shape'] = shape
