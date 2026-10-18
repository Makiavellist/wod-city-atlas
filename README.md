# World of Darkness City Atlas

An interactive, editable city map for Foundry VTT **v13** (verified on build 351) with the **World of Darkness 20th edition** system (`worldofdarkness`).

A city atlas has:

- **Realms.** Each realm is a separate view of the same city: Waking, Dreaming, Shadowlands, Umbra, or anything else you add. Each one has its own colours, effects and crossing button.
- **Levels** inside a realm, such as Street / Underground / Depths or Near / Deep.
- **Places.** Pins with categories, factions, rich descriptions, Storyteller-only notes, portraits and links to Foundry Actors, Journals or Scenes.
- **Live scenes.** The atlas can be a Foundry scene that each player sees with their own access, with the full dossier beside it.
- **Zones.** Domains, territories and spirit zones, with hatched or patterned fills, ratings ("Danger 4/5"), owners and "lies within" lookups.
- **Routes.** Patrols, trods, byways, moon bridges and tunnels, which can be animated.
- **Labels** and **glows**, such as Glamour wells, a thin Shroud or a Kindred taint.
- **People.** The Kindred, Kithain, wraiths, Garou and spirits of the city, listed by faction, with domains, haunts, relations, secrets and linked Actors.
- **Chronicle pages.** Timelines, hooks and tables, shown in the dossier tab of each realm.

It ships with **Milwaukee by Night (1991)** as a ready-made atlas. That atlas has four realms, Underground and Depths levels, Kindred domains, 331 places, 150 people, 93 zones, 59 routes and 31 chronicle pages.

## Installing

1. Unzip `wod-city-atlas` into your Foundry `Data/modules/` folder, so you have `Data/modules/wod-city-atlas/module.json`.
2. Start a world that uses the *World of Darkness 20th ed* system and enable **World of Darkness City Atlas** under *Manage Modules*.

> The manifest lists `worldofdarkness` under `relationships.systems`, so Foundry only offers the module in WoD20 worlds. To use it with another system, delete that block from `module.json`. The atlas itself does not depend on any system.

## Opening an atlas

You can open an atlas in these ways:

- Use the **City Atlas** button at the top of the **Journal** sidebar.
- Use the **map tool** in the Journal Notes scene controls on the left.
- Click an atlas journal entry (in the *City Atlases* folder). You can turn this off in the module settings.
- Press **Alt+M** (you can change the key in *Configure Controls*).
- Go to *Game Settings → Configure Settings → World of Darkness City Atlas → Open the atlas launcher*.

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

## What players see (Storyteller)

Every realm, level, layer, place category, place, zone, route, glow, person and chronicle page can be shown to each player at its own **tier**:

| Tier | The player sees |
|---|---|
| 0 · Hidden | nothing |
| 1 · Existence | a grey "?" pin or outline called *Unknown place* (or a name you choose) |
| 2 · Basic | name, subtitle, category, faction, picture |
| 3 · Full | the description, facts, links, people, relations, routes and ordinary callouts |

**Secrets** are revealed one by one. Mark a callout or a relation as *secret* (in the edit form, or add a secret relation straight from the dossier); it stays hidden until you reveal it. The *What players see* panel at the bottom of an entry's dossier lists its secrets: reveal each to everyone, or say for each player whether they know it. A player who knows a secret sees it even if they only know the entry exists.

- **One entry:** open it in Storyteller view. At the bottom of its dossier, the *What players see* panel sets the tier for **Everyone** and, if you like, a different tier for each player. The same panel is in its edit form.
- **Many at once:** *Edit → Player visibility* has a table for realms, levels, layers and categories (shown/hidden per player), the default tier for everything you haven't configured, tier names, and a bulk tool ("all Havens in the Waking realm → Basic for Anna").
- **Check a view:** *Layers menu (or the Map tab) → View as* shows the map exactly as a given player (or "every player") sees it.
- Players get a short notification when you reveal something to them.

## Crossings, the clock and the characters

- **Crossing animations.** Every realm switch plays a short animation in the new realm's manner (Dreaming sparks, Shadowlands ash, vines growing in over the map for the Umbra, waking blood); levels sink or rise. Pick one per realm in *Edit → Realms & levels*.
- **Chronicle clock.** The in-game date and time, with the hours until dawn, at the top of everyone's screen. The Storyteller hovers it to move it (−1h, −10m, +10m, +1h, Dusk, Dawn) or presses the pen to set any date and time. It only moves when you move it. From a macro: `game.modules.get('wod-city-atlas').api.clock.advance(60)`, `.set(Date.UTC(1991, 9, 31, 22, 0))`, `.nextDusk()`.
- **Characters on the map.** Every player's character appears on atlas scenes as a portrait pin taken from their Actor. Players drag their own; the Storyteller drags anyone and manages them in *Map tab → Characters* (place, find, hide from the others, remove). The people button on the scene toolbar jumps there.
- **Masquerade violation.** The red theatre-masks button (Storyteller only, in the Token and Notes tool columns) flashes a full-screen MASQUERADE VIOLATION alert on every screen. Shift-click adds a line of text.
- **Chronicle calendar.** The calendar button on the clock opens a month view where the Storyteller writes events for any night, for everyone, for the Storyteller only, or for particular players.
- **Masquerade look.** Foundry's own interface is restyled in black, bone and blood, and takes on the colours of the realm shown on the atlas scene. In the Umbra it turns to moss, bark and old paper, with vines and leaves over the controls. Each player can turn it off in the module settings.
- **The Umbra as old woods.** The Milwaukee Umbra is a dark forest seen from above: tree crowns over the land, mist, fireflies and falling leaves, hand-inked spirit zones and roads. The Weaver's places stay straight, blue and gridded, the city showing through the woods.
- **New looks arrive by themselves.** When a new version of the module redraws a realm of the Milwaukee preset, the Storyteller is asked once whether to give their atlas the new look (only colours, effects and map styles change). Atlas scenes then redraw their picture to match. *Edit → Import / export → Refresh realm looks* does the same by hand, for every realm.

## Pins

Pins come in shapes (circle, square, diamond, hexagon, octagon, shield, map marker) with dozens of icons. A category sets the shape for its places and a place can override it. *Use the picture as the pin* shows a place's picture (its own, its linked Actor's or a person's there) inside the pin. In Milwaukee every category has its own shape and about half the places have their own icon (churches, bars, docks, factories, parks, police…).

## Kindred domains

Every person can own one or more domains (zones on the domain layer). In a Kindred's dossier, the **Domain** section lists their domains with a show/hide eye. In the Storyteller view it also has *Draw a domain* and an edit button for the shape. In the Kindred list, the crown next to a name shows or hides just that Kindred's domain. Domains have a status: held, reserve, contested, vacant, hidden or hostile.

## The atlas as a Scene

*Edit → Show as a Scene* makes a Foundry scene that **is** the atlas. **Players use atlases only through their scenes:** atlas journal entries are hidden from them, and they can't open the atlas window or change anything you made (a world setting, *Players may open atlases outside scenes*, turns this off).

- **The toolbar on the scene** (top centre) has the realm and level switches, the dossier button, layers, search, *Add a note*, quick layer buttons (the crown for Kindred domains) and a button to hide the atlas and see the plain scene.
- **The dossier** beside the map has the Places, People, Zones and Chronicle tabs, plus:
  - **Map:** every switch in one place: realms, levels, layers, place categories, notes, *Whole map*, *Search*, *Hide the atlas*, the legend, and (Storyteller) *View as* and *Players follow my realm*.
  - **Notes:** your notes and the ones others share.
- **Notes.** Anyone can add their own notes to the map (title, text, icon, colour), visible to *Only me* or *Everyone*. Notes never change the Storyteller's map. They are kept with each user's account. The Storyteller can delete any note and, from the Map tab, choose to see players' private notes.
- **Pictures on hover.** Pointing at a pin, zone or domain shows its picture: its own, its linked Actor's, or the portrait of someone known to be there.

- **Each player sees their own map.** Every screen draws the atlas live with that player's access: realms, layers, places, zones, people and secrets you haven't revealed to them stay hidden, and things they only know exist show as "?". When you reveal something, it appears on their scene at once.
- **The whole dossier is on the scene.** Click a pin, zone, route or glow to open its dossier in a window beside the map: descriptions, portraits, relations, domains, chronicle pages, layers, realm and level switches, and search. Toggle the window with the book button in the Token controls, the map button in the Notes controls, or **Alt+M**.
- **Tokens work as usual.** Foundry shows the plain map as the scene picture; the per-player layer (zones, routes, glows, labels, pins) is drawn on top of it and is transparent elsewhere, so tokens show through. Clicks on tokens go to the token, not the atlas.
- **Realm lock.** The lock button in the dossier makes players follow your realm and level (step the whole party into the Umbra). Unlocked, each player switches between the realms you have shown them.
- **Show to players** (the eye) moves every player's scene to your view and opens the entry you're looking at.
- **Editing** opens the full atlas window; changes show on the scene immediately.

Choose the area (the whole atlas, the home view or what you see now) and whether to create a new scene or update an existing one. Players who can't open the atlas journal see only the plain map picture. If an atlas scene shows nothing, run `game.modules.get('wod-city-atlas').api.diagnose()` in the console (F12) and send the text it shows.

## Characters and Actors

- **Link a person to an Actor:** in their edit form, pick the *Linked Actor* or drop one from the Actors tab onto it.
- **Many at once:** *Edit → People → Link to Actors…* matches people to Actors by exact name, lets you pick the rest, and can create Actors for everyone unlinked (in a *City Atlas characters* folder, with their portrait and, where the system has one, their description as biography).
- A linked person's dossier shows a **Character sheet** button to anyone allowed to open that Actor (so players see their own and the ones you share), and uses the Actor's portrait when the person has none.
- **Relations** work for every character. Each person's dossier lists how they see others and *How others see them*. As Storyteller you add a relation right in the dossier (who, attitude, secret or not) and remove one with its ✕; the edit form has the full list. Names link to the people they name (matched by name, or set *Links to*), with a sheet button for linked Actors.
- Right-click an Actor in the Actors tab → **Show in City Atlas**.

## Editing (Storyteller)

Click the **pen** on the right-hand bar. A toolbar appears at the top of the map:

| Tool | Key | What it does |
|---|---|---|
| Select | `V` | Click anything to edit it. Drag pins, label handles and shape corners. Shift-drag inside a selected shape moves the whole shape. Alt-click a corner to remove it. Click a midpoint dot to add a corner. |
| Place | `P` | Click to drop a pin. |
| Zone | `Z` | Click corners. Click the first corner again, double-click or press Enter to close the shape. Backspace removes the last corner and Esc cancels. |
| Route | `R` | Click points, then double-click or press Enter to finish. |
| Label | `T` | Click to place a text label. |
| Glow | `G` | Click to place a glow, a shadow, a grey-out (Banality), a vortex or a moon. Drag the square handle to resize it. Glows can carry a value (Glamour 4/10, Banality 7/10, Shroud 3/10…) and a description, and are clickable. |

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
