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
  "preset": "milwaukee", "looks": 8, // made from a bundled preset, and the version of its looks (a newer preset is applied by itself)
  "updates": [{"looks": 8, "realms": ["umbra"], "shapes": ["t-lupine"], "fields": {"places": ["brief", "alias"]}}], // presets only: what each looks version brings (fields are copied over, replacing)
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
  "bg": "#072321", "theme": {"panel": "#0a1f21", "accent": "#5ff0c4", …}, "crossFx": "umbra",
  "background": {"src": "…", "filter": "hue-rotate(140deg) brightness(.5)"},   // optional own picture / filter
  "effects": [{"type": "particles", "shape": "glow", "count": 90, "colors": ["126,224,143"], "speed": 0.012, "dir": "up"}],
  "styles": {"river": [{"stroke": "rgba(80,230,230,.2)", "width": 3, "add": 6}]},  // base-map class styles
  "legend": [{"label": "Weaver", "color": "#bfe2ff", "kind": "fill"}],
  "levels": [{"id": "near", "name": "Penumbra", "show": ["near"]}, {"id": "deep", "name": "Gateways", "show": ["near", "deep"], "effects": […]}]
}
```

A level shows every item whose `level` is in its `show` list. Levels may override `bg`, `theme`, `styles`, `effects`, `kicker`, `date`, `banner`, `credit`, `terms`, `crossLabel`, `background`, `legend` and `layerDefaults`. A level can copy another level's overrides with `inherit`.

Effect types: `gradient` (linear/radial), `fog`, `vignette`, `stars` and `waves` (both can be clipped to a base-map class such as `"clip": "lake"`), and `particles` (`dot`, `streak` or `glow`). Any effect can be tied to a layer with `"layer"`. Effects with `"under": true` are part of the plain map (and of a scene's picture); the others are drawn live on top.

## Map items

All map items take `realm`, `level` (or `levels: []`), `layer`, `gm` (Storyteller only), `name` (a translation can follow in brackets: “Pabst Theater (Театр Пабст)”; map lettering leaves a bracketed Cyrillic part out), `alias` and `aliasText` (name and text at Existence), `sub`, `kicker`, `brief` (the Basic description, html), `html`, `img`, `notes: [{title, html, kind: scene|law|secret|play, gm, secret, reveal}]`, `facts: [{k, v, secret, reveal}]`, `tags: [{text, color}]`, `people: [ids]`, `anchor` (twin in another realm), `links: [{id, label}]`, `uuid` (Foundry document; its picture, an Actor's portrait or a Scene's background, is used before `img`) and `src`.

- **place**: `at`, `roam: [placeIds]` / `ride: [[lat, lng]…]` / `wander: metres` with `period` (seconds) for places that move, `cat`, `faction`, `color`, `icon`, `precision`, `zone`, `hidden` (no pin), `zoom`, `pin: {border, glow, bg: [c1, c2], anim: "pulse"}`.
- **zone**: `rings: [[pt…], …]` (even-odd), `art` (ward|wolf|index|orchard|seat: a moving Dreaming picture instead of the outline), `style` (name or object), `owners`, `container`, `rating: {label, value, max, text}`, `label: {text, sub, at, minZoom, font, ls, color, halo, italic, subFont}`, `noLabel`, `fillImage: {src, minZoom, alpha}`, `ref` (clicking opens another entry), `order`.
- **route**: `parts: [[pt…], …]`, `style`, `curve`, `ends: [ids]`, `endGlow`.
- **label**: `text`, `at`, `size`, `font` (sc|head|body|title), `italic`, `ls`, `color`, `halo`, `glow`, `angle`, `minZoom`, `maxZoom`, `shield: {bg, fg}`, `cls` (area-big|area-small).
- **aura**: `at`, `radius` (metres on geographic maps, map units otherwise), `px` (minimum pixels), `color`, `mode` (glow|dark|desat|vortex|moon), `ring`, `shade` (moon), `swirl` (vortex), `pulse`, `flicker`.

## Styles

A style is one pass or an array of passes (a named style that is a list is stored as `{"passes": […]}`). Each pass can take these keys:

- Stroke: `stroke`, `width` (a number or zoom stops such as `[[10, 1], [15, 4]]`), `dash`, `flow` (animated dashes), `strokeAlpha`.
- Fill: `fill`, `fillAlpha`, `fill2` (gradient), `pattern: {kind: ne|nw|dot|h|v|grid|cross|glyph, color, bg, size, width, glyph}`.
- Outlines: `glow: {color, width, alpha}`, `casing: {color, width}`.
- Other: `broken`, `flicker`, `curve`, `nodes`, `minZoom`, `maxZoom`.

Colours may be `auto` or `auto:0.3`, meaning the item's own colour (from its faction or category) at that opacity.

## People and pages

- **person**: `name`, `kicker` (clan line; a part containing “generation” is never shown to players), `falseKicker` (false clan), `tag` (short clan), `sub`, `faction`, `group: {realmId: factionId}`, `status`, `icon`, `img`, `html`, `notes`, `facts`, `relations: {title, rows: [[who, attitude]]}`, `at: [ids]`, `realms: ["waking", "waking:underground", …]`, `uuid` (the linked Actor's portrait is used before `img`). A person's `name` reads “English (Русский)” like a place's; the clan line is Russian (“Вентру · 8-е поколение”, the part with «поколени» or “generation” is never shown to players).
- **page**: `title`, `realm`, `level`/`levels`, `tab` (pages|places|people|zones), `order`, `gm`, `html`. Inside `html`, `.gm-only` and `.player-only` hide text from players or from the Storyteller, `data-link="id"` makes a link to an entry, and the classes `tl`, `hook`, `lead`, `note` and `council` give the timeline, hook and table looks.

## Visibility

Anything a player can be shown carries `reveal: {all: tier, users: {userId: tier}}`, tiers 0 Hidden · 1 Existence · 2 Basic · 3 Full (`revealDefault` at the top level applies where nothing is set).

Pieces of an entry are decided one by one, with `1` shown, `0` hidden and no value meaning "follow the tier":
- facts, notes and relation rows: their own `reveal: {all, users}`; with `secret: true` they stay hidden until shown;
- links, on the item, in `reveals: {key: {all, users}}`: `faction` (allegiance), `clan` (on a person: 1 true clan, 2 false clan, 0 hidden; by default the false clan if there is one), `at:<placeId>` (on a person: seen at that place, whichever side lists the link), `owner:<personId>` (on a zone: that domain owner).

Without a decision, the allegiance shows from Basic, figures, owners, facts and relations from Full.

## Base map

`{"features": [{"k": "l"|"p"|"m", "c": "class", "p": coordinates, "n": "name", "w": widthFactor, "layer": "blocks"}]}`

Here `l` is a line, `p` is a polygon (a list of rings) and `m` is a multi-line. Each realm or level draws a class only if its `styles` define it. A pass with a `label` (`{minZoom, layer, spacing, color, halo}`) writes the feature's name along the line.

## Characters on scenes

Players' characters are not stored in the atlas. Each player's position is kept on their user, per atlas (`flags.wod-city-atlas.pos.<journal id>`), as `{at: [lat, lng], realm, level, hidden, place, entered, t}`: `place` is the id of the place the character has gone into (dropped onto its pin), `entered` the time they went in (the entering animation plays for twenty seconds after).

## Language

The world setting `uiLang` (`ru` or `en`, default `ru`) sets the language of the atlas window and the map for players; the Storyteller's editor stays in English. The Milwaukee preset's texts are in Russian, with English place and person names followed by the Russian in brackets.
