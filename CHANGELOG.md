# Changelog

## 1.2.2
- **Atlas scenes rebuilt to stay out of Foundry's way.** The module no longer touches Foundry's own scene drawing at all, so it cannot affect this or any other scene. Foundry shows the scene picture (the plain map); each player's screen draws their own zones, routes, glows, labels and pins on a transparent layer on top. Tokens show through it. Looking at another realm than the scene picture, the layer draws that realm's whole map.
- The layer redraws on its own timer and whenever Foundry pans, instead of relying on Foundry's internal render loop.
- If an atlas scene still can't be drawn, the Storyteller gets a window with a short diagnosis to copy and send. `game.modules.get('wod-city-atlas').api.diagnose()` opens the same window.
- Removed the *Atlas scenes: how to draw the map* setting.

## 1.2.1
- **Fix: atlas scenes showed an empty dark canvas.** The map layer could end up with no size, after which the scene picture was replaced by an empty image and every pin was placed off-screen. The layer now always covers the window, and the scene picture is only replaced once the atlas has actually been drawn.
- If Foundry does not allow the scene picture to be swapped, the atlas is drawn as its own sprite just above it (still under tokens). If that also fails, it falls back to an overlay and tells the Storyteller.
- Clicks and hovers on the map are picked up more reliably.
- New: `game.modules.get('wod-city-atlas').api.diagnose()` prints what the scene drawing sees. The module also logs a `wod-city-atlas | scene check` line a few seconds after an atlas scene opens.

## 1.2.0
- **The scene is the atlas.** *Show as a Scene* now makes a live atlas scene. Every player's screen draws the map itself, as that player may see it: hidden realms, layers, places and people stay hidden, unknown entries show as "?", and reveals appear at once. Tokens, drawings and lighting sit on top of the map as usual.
- **The full dossier on the scene.** Clicking a pin, zone, route or glow on the scene opens its dossier in a window beside the map, with descriptions, bios, relations, domains, chronicle pages, layers, realm switching and search. Toggle the window with the book button in the Token controls, the map button in the Notes controls, or Alt+M.
- **Realm lock.** The lock button makes players follow your realm and level; unlocked, each player switches between the realms you have shown them.
- **People ↔ Actors.** Each person has a *Linked Actor* field (pick one or drop it from the Actors tab). Linked people show a *Character sheet* button to anyone allowed to open that Actor and use its portrait when they have none. *People → Link to Actors…* matches people to Actors by name in bulk, or creates Actors for everyone unlinked. *Show in City Atlas* is on the Actors tab's right-click menu.
- **Relations are links.** Names in a person's relations open that person (matched by name, or set explicitly in the editor), with a sheet button when they have an Actor.
- Scenes made with 1.1 can be updated from *Show as a Scene*; their old map notes are removed.
- New client setting *Atlas scenes: how to draw the map* (scene background, or an overlay if the map does not appear).

## 1.1.0
- **Per-player visibility.** Realms, levels, layers, categories and every entry can be hidden or revealed per player, in tiers (hidden, existence, basic, full, secrets). Each callout has its own tier. A *What players see* panel is on every dossier, and *Edit → Player visibility* has a table plus bulk reveals. *View as* previews any player's view, and players are notified when something is revealed to them.
- **Kindred domains.** Domains are listed in each Kindred's dossier with show/hide, *Draw a domain* and shape editing. A crown toggle in the Kindred list shows one Kindred's domain on its own, and domains have a status.
- **Show as a Scene.** Turns the current realm or level into a Foundry scene with map notes; double-clicking a note opens the atlas.
- **Glows are full entries.** Glamour wells, Banality sinks and the thin and thick Shroud have values (e.g. Glamour 4/10), descriptions, callouts and visibility. They are clickable and listed in the Zones tab. A handle in the editor resizes them.
- **Easier to find:** Alt+M, plus a button under Game Settings → Configure Settings.
- **Milwaukee preset:** Storyteller-only entries became "hidden from players", and secrets became tier-4 callouts. Glamour, Banality and Shroud have improvised values.
