# Atlas file format (schema 1)

Exported atlases are plain JSON. Every collection is an object keyed by id. Ids must not contain dots.

```jsonc
{
  "schema": 1,
  "title": "Chicago by Night", "titleHtml": "Chicago <em>by</em> Night", "description": "…",
  "projection": "plane",            // "plane" (image/pixel coordinates [x, y]) or "mercator" ([lat, lng])
  "bounds": [[0, 0], [4000, 3000]], // world extent; for image maps the picture size
  "background": {"src": "worlds/x/map.webp", "w": 4000, "h": 3000},
  "zoom": {"min": -4, "max": 3},    // plane: 0 = one map pixel per screen pixel
  "home": {"box": [[0, 0], [4000, 3000]]},
  "basemap": "modules/…/basemap.json", // optional vector geography (see below)
  "closeBy": 60, "scale": {"metersPerUnit": 2, "unit": "mi"},
  "theme": {…}, "statuses": {"dead": {"name": "Destroyed", "mark": "†", "fade": true, "hideable": true}},
  "precisions": {"canon": {"name": "Exact", "border": "solid"}},
  "realms": {}, "layers": {}, "categories": {}, "factions": {}, "styles": {},
  "places": {}, "zones": {}, "routes": {}, "labels": {}, "auras": {}, "people": {}, "pages": {}
}
```

## Realms and levels

```jsonc
"umbra": {
  "name": "Umbra", "icon": "paw", "order": 3, "kicker": "The Near Umbra", "date": "…", "banner": "…", "credit": "…",
  "terms": {"places": "Places", "people": "Garou & spirits", "zones": "Zones", "pages": "Chronicle"},
  "crossLabel": "Step sideways into the Umbra", "crossIcon": "paw",
  "bg": "#072321", "theme": {"panel": "#0a1f21", "accent": "#5ff0c4", …},
  "background": {"src": "…", "filter": "hue-rotate(140deg) brightness(.5)"},   // optional own picture / filter
  "effects": [{"type": "particles", "shape": "glow", "count": 90, "colors": ["126,224,143"], "speed": 0.012, "dir": "up"}],
  "styles": {"river": [{"stroke": "rgba(80,230,230,.2)", "width": 3, "add": 6}]},  // base-map class styles
  "legend": [{"label": "Weaver", "color": "#bfe2ff", "kind": "fill"}],
  "levels": [{"id": "near", "name": "Penumbra", "show": ["near"]}, {"id": "deep", "name": "Gateways", "show": ["near", "deep"], "effects": […]}]
}
```

A level shows every item whose `level` is in its `show` list. Levels may override `bg`, `theme`, `styles`, `effects`, `kicker`, `date`, `banner`, `credit`, `terms`, `crossLabel`, `background`, `legend` and `layerDefaults`. A level can copy another level's overrides with `inherit`.

Effect types: `gradient` (linear/radial), `fog`, `vignette`, `stars` and `waves` (both can be clipped to a base-map class such as `"clip": "lake"`), and `particles` (`dot`, `streak` or `glow`). Any effect can be tied to a layer with `"layer"`.

## Map items

All map items take `realm`, `level` (or `levels: []`), `layer`, `gm` (Storyteller only), `name`, `sub`, `kicker`, `alias` and `aliasText` (name and rumour while players only know it exists), `brief` (common knowledge, shown from Basic), `html` (full description, shown with Full), `img`, `reveal: {all, users: {userId: tier}}`, `notes: [{title, html, kind: scene|law|secret|play|st, secret, reveal, st}]` (`secret` callouts are revealed one by one; `st` callouts are Storyteller only), `facts: [{k, v}]`, `tags: [{text, color}]`, `people: [ids]`, `anchor` (twin in another realm), `links: [{id, label}]`, `uuid` (Foundry document) and `src`.

- **place**: `at`, `cat`, `faction`, `color`, `icon`, `precision`, `zone`, `hidden` (no pin), `zoom`, `pin: {border, glow, bg: [c1, c2], anim: "pulse"}`.
- **zone**: `rings: [[pt…], …]` (even-odd), `style` (name or object), `owners`, `container`, `rating: {label, value, max, text}`, `label: {text, sub, at, minZoom}`, `noLabel`, `fillImage: {src, minZoom, alpha}`, `ref` (clicking opens another entry), `order`.
- **route**: `parts: [[pt…], …]`, `style`, `curve`, `ends: [ids]`, `endGlow`.
- **label**: `text`, `at`, `size`, `font` (sc|head|body|title), `italic`, `ls`, `color`, `halo`, `glow`, `angle`, `minZoom`, `maxZoom`, `shield: {bg, fg}`, `cls` (area-big|area-small).
- **aura**: `at`, `radius` (metres on geographic maps, map units otherwise), `px` (minimum pixels), `color`, `mode` (glow|dark|desat|vortex|moon), `pulse`, `flicker`.

## Styles

A style is one pass or an array of passes. Each pass can take these keys:

- Stroke: `stroke`, `width` (a number or zoom stops such as `[[10, 1], [15, 4]]`), `dash`, `flow` (animated dashes), `strokeAlpha`.
- Fill: `fill`, `fillAlpha`, `fill2` (gradient), `pattern: {kind: ne|nw|dot|h|v|grid|cross|glyph, color, bg, size, width, glyph}`.
- Outlines: `glow: {color, width, alpha}`, `casing: {color, width}`.
- Other: `broken`, `flicker`, `curve`, `nodes`, `minZoom`, `maxZoom`.

Colours may be `auto` or `auto:0.3`, meaning the item's own colour (from its faction or category) at that opacity.

## People and pages

- **person**: `name`, `kicker`, `sub`, `tag`, `faction`, `group: {realmId: factionId}`, `status`, `icon`, `img`, `alias`, `aliasText`, `brief`, `html`, `notes`, `facts`, `relations: {title, rows: [{a: who, b: attitude, ref: personId, secret, reveal}]}`, `at: [ids]`, `realms: ["waking", "waking:underground", …]`, `uuid`.
- **page**: `title`, `realm`, `level`/`levels`, `tab` (pages|places|people|zones), `order`, `gm`, `html`. Inside `html`, `.gm-only` and `.player-only` hide text from players or from the Storyteller, `data-link="id"` makes a link to an entry, and the classes `tl`, `hook`, `lead`, `note` and `council` give the timeline, hook and table looks.

## Base map

`{"features": [{"k": "l"|"p"|"m", "c": "class", "p": coordinates, "n": "name", "w": widthFactor, "layer": "blocks"}]}`

Here `l` is a line, `p` is a polygon (a list of rings) and `m` is a multi-line. Each realm or level draws a class only if its `styles` define it. A pass with a `label` (`{minZoom, layer, spacing, color, halo}`) writes the feature's name along the line.
