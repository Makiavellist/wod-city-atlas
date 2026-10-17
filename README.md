# World of Darkness City Atlas

An interactive, editable city map for Foundry VTT **v13** (verified on build 351) with the **World of Darkness 20th edition** system (`worldofdarkness`).

A city atlas has:

- **Realms.** Each realm is a separate view of the same city: Waking, Dreaming, Shadowlands, Umbra, or anything else you add. Each one has its own colours, effects and crossing button.
- **Levels** inside a realm, such as Street / Underground / Depths or Near / Deep.
- **Places.** Pins with categories, factions, rich descriptions, Storyteller-only notes, portraits and links to Foundry Actors, Journals or Scenes.
- **Zones.** Domains, territories and spirit zones, with hatched or patterned fills, ratings ("Danger 4/5"), owners and "lies within" lookups.
- **Routes.** Patrols, trods, byways, moon bridges and tunnels, which can be animated.
- **Labels** and **glows**, such as Glamour wells, a thin Shroud or a Kindred taint.
- **People.** The Kindred, Kithain, wraiths, Garou and spirits of the city, listed by faction, with domains, haunts, relations and secrets.
- **Chronicle pages.** Timelines, hooks and tables, shown in the dossier tab of each realm.

It ships with **Milwaukee by Night (1991)** as a ready-made atlas. That atlas has four realms, Underground and Depths levels, Kindred domains, 331 places, 150 people, 93 zones, 59 routes and 31 chronicle pages.

## Installing

1. Unzip `wod-city-atlas` into your Foundry `Data/modules/` folder, so you have `Data/modules/wod-city-atlas/module.json`.
2. Start a world that uses the *World of Darkness 20th ed* system and enable **World of Darkness City Atlas** under *Manage Modules*.

> The manifest lists `worldofdarkness` under `relationships.systems`, so Foundry only offers the module in WoD20 worlds. To use it with another system, delete that block from `module.json`. The atlas itself does not depend on any system.

## Opening an atlas

You can open an atlas in three ways:

- Use the **City Atlas** button at the top of the **Journal** sidebar.
- Use the **map tool** in the Journal Notes scene controls on the left.
- Click an atlas journal entry (in the *City Atlases* folder). You can turn this off in the module settings.

From a macro:

```js
const api = game.modules.get('wod-city-atlas').api;
api.open();                       // launcher
api.open('Milwaukee by Night');   // a specific atlas, by name or JournalEntry id
await api.createFromPreset('milwaukee');
```

### Creating atlases (Storyteller)

The launcher offers four ways to start an atlas:

- **Milwaukee by Night (1991):** the bundled preset.
- **From a map picture:** any city map image. Choose which realms you want (Umbra, Shadowlands, Dreaming, Underground). Each realm restyles the same picture with its own colour treatment, and you can give any realm or level its own picture later.
- **Blank canvas.**
- **Import an atlas file** exported from this module.

New atlases go into a *City Atlases* journal folder. Players can see an atlas if they have **Observer** permission on its journal entry. The default is set in the module settings. Use *Configure Ownership* on the entry to change it.

## Using the map

- Drag to pan. Use the mouse wheel or pinch to zoom. Double-click to zoom in.
- Switch realms and levels with the selectors at the top left. The `1`–`9` keys pick a realm and `[` / `]` change level.
- The dossier on the left has four tabs: **Places**, **People**, **Zones/Domains** and **Chronicle**. Click any entry to see it on the map. The crossing buttons, such as *Step sideways into the Umbra* or *Go down below*, jump to the same place in another realm or level.
- **Search** everything with `/` or Ctrl+K.
- **Layers** are on the right-hand bar, and layers with icons get their own button (in Milwaukee, the crown toggles Kindred domains, also on `D`).
- **Storyteller view** in the layer menu (GM only) lets you preview the map as the players see it.
- **Show to players** (the eye button, GM only) opens the atlas for every player who can see it, at your current realm, view and selected entry.

## Editing (Storyteller)

Click the **pen** on the right-hand bar. A toolbar appears at the top of the map:

| Tool | Key | What it does |
|---|---|---|
| Select | `V` | Click anything to edit it. Drag pins, label handles and shape corners. Shift-drag inside a selected shape moves the whole shape. Alt-click a corner to remove it. Click a midpoint dot to add a corner. |
| Place | `P` | Click to drop a pin. |
| Zone | `Z` | Click corners. Click the first corner again, double-click or press Enter to close the shape. Backspace removes the last corner and Esc cancels. |
| Route | `R` | Click points, then double-click or press Enter to finish. |
| Label | `T` | Click to place a text label. |
| Glow | `G` | Click to place a glow, a shadow, a grey-out (Banality), a vortex or a moon. |

Everything saves as you go, and **Ctrl+Z** undoes. The gear opens **Atlas settings**:

- **Title, map & view:** the map picture and its size, zoom range, home view, scale bar, and statuses and placement kinds.
- **Realms & levels:** names, dossier tab names, banner lines, crossing button text, colours, a one-click *look* (Waking, Dreaming, Shadowlands, Umbra, Underground, Blood-red), a per-realm picture with a CSS filter, levels, legend and effects.
- **Layers, Place categories, Factions, Zone & route styles, People, Chronicle pages.**
- **Import / export:** the whole atlas as JSON, or merging people and lore from another atlas.

Tips:

- **Link Foundry documents.** Drag an Actor, Journal entry or Scene from the sidebar onto the map while editing. This creates a pin linked to that document. Shift-drop an Actor to create a person instead. You can also drop a document onto the *Linked Foundry document* box of any form. **People → From Actors…** imports characters in bulk, with portraits and, where the WoD20 sheet provides it, clan and generation.
- **Crossings.** Give a place in the Umbra an **Anchor** pointing at its waking twin. Both entries then get crossing buttons, and the Dreaming draws a dotted thread between them.
- **Secrets.** Tick **Storyteller only** on any entry or callout. In chronicle pages, wrap text in `<span class="gm-only">…</span>`.
- **Text.** Descriptions accept Foundry enrichers such as `@UUID[Actor.xxx]{Name}`. In chronicle pages, `<button data-link="some-id">` opens an entry.

## How the data is stored

Each atlas is a JournalEntry flagged by this module:

- The entry stores the atlas settings.
- Twelve pages named *Atlas data · …* store the collections (realms, places, zones and so on). Each item is saved separately, so editing one place sends only that place over the network.

Please don't edit those pages by hand. Use the editor, or export and import JSON. Atlas journals can be moved between worlds with Foundry's usual tools (compendiums or Export Data). The Milwaukee preset's base map and pictures live in the module folder, so the module must be installed wherever the atlas is used.

**About secrecy.** Storyteller-only entries are hidden from players in the interface. Like any journal content they can read, the data still reaches their browser. Don't put anything in an atlas that a determined player must never see. Keep that in a GM-only journal and link it with `@UUID`.

## Differences from the original web page

The original *Milwaukee by Night* page was hand-drawn for one city. This module draws the same data with a generic engine, so a few one-off flourishes are simplified:

- The Far Guest's mountain is a flat silhouette rather than an animated drawing.
- The Crownless Ward's towers and the Glass Orchard's bubbles are patterned zones.
- Roaming chimera stand still.
- Relic buildings are pale outlined footprints.

Everything else is carried over: every place, person, zone, route, timeline, hook, table, portrait and the Michigan Pocket picture.

## Licence and credits

- Fonts are bundled from Google Fonts under the SIL Open Font License: IM Fell English (Igino Marini), Pirata One and Alegreya Sans.
- *Milwaukee by Night* and *World of Darkness* are trademarks of Paradox Interactive. The chronicle material in the preset is fan content for private play.
