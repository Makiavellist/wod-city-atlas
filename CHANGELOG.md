# Changelog

## 1.7.0
- **Drag character portraits straight on the scene.** Press on a portrait and drag; no tool or mode needed. The press is taken by the atlas, so Foundry no longer starts a selection box or deselects tokens under a pin. A plain click still opens the character's sheet.
- **The Umbra, reworked as old woods.** Dark moss-green night, drifting canopy shadows, fireflies and falling leaves, paper grain and a deep vignette; streets and shores drawn like faded ink. Wild spirit zones are hand-inked (dashed borders, leaf, claw, paw and moon marks, rust hatching for the Wyrm); the Weaver's places stay crisp, blue and modern as a deliberate contrast. Pins, routes and the legend follow. The crossing into the Umbra is a slow fall of dark green mist and leaves with the city fading to sepia. The dossier and (with the Masquerade look) Foundry's own windows, sidebar, chat and clock turn to old paper in the Umbra.
- **Kindred taint is now readable.** The dark circles in the Umbra mark Kindred taint: the dead patches vampire havens and hunting grounds leave in the spirit world. They now look like rot, and each has a name and a short description on hover and click.
- **MASQUERADE VIOLATION.** A new Storyteller-only button (the red theatre masks) in the Token and Notes tool columns flashes a full-screen alert on every player's screen: a cracking, bleeding mask, the words in red, a drum roll. Shift-click to add a line of text underneath. It fades after a few seconds or on a click. Macro: `game.modules.get('wod-city-atlas').api.breach()`.
- Existing atlases: *Edit → Import / export → Refresh realm looks* now also brings in category colours and the Kindred taint.

## 1.6.0
- **Fix: pins and character portraits could not be clicked on an atlas scene; the zone behind them opened instead.** Pins now always win over the zones and domains behind them, and a click that selects a Foundry token no longer opens the zone under it.
- **Clicking a character's portrait** opens that character's sheet (for the Storyteller and the owner).
- **The whole interface follows the realm.** With the Masquerade look on, Foundry's sidebar, chat, controls, windows, clock and calendar take the colours of the realm shown on the atlas scene (violet and gold in the Dreaming, grey-green in the Shadowlands, jade in the Umbra, amber underground, blood in the waking city) and glide from one to the next.
- **Chronicle calendar.** A calendar button sits on the clock (with the number of tonight's events). It opens a month view of the in-game date where the Storyteller writes events for any night: for everyone, Storyteller only, or for particular players. Players see the events meant for them. *Set the clock to this day* jumps the clock there.
- **The Umbra, redone.** A deep night-blue Penumbra with dimmer streets and stars, softer motes and a heavier vignette; every kind of spirit zone has its own colour and texture (Weaver grids, Wyrm hatching, Wyld dots, clan glyphs). The crossing into the Umbra is slower and gentler, like mist lifting off water. Existing atlases: *Edit → Import / export → Refresh realm looks* copies the new look in without touching anything else.

## 1.5.0
Built on 1.3.0 / 1.4.1 (the 1.4.0 changes stay withdrawn).
- **Crossing animations.** Switching realms plays a short animation in the new realm's manner: golden and lilac sparks for the Dreaming, falling ash for the Shadowlands, Gauntlet ripples for the Umbra, blood seeping through for the waking city. Going down a level sinks into the dark; going up rises out of it. Works on atlas scenes and in the atlas window. Each realm can choose its animation (*Edit → Realms & levels → Crossing animation*); the *Animate the map* setting or the system's reduced-motion preference turns them off.
- **Chronicle clock.** The in-game date and time sit at the top of the screen for everyone, with the hours until dawn (or until dusk, in daylight) worked out for the chronicle city, US daylight saving included. The Storyteller hovers it for −1h, −10m, +10m, +1h, *Dusk*, *Dawn* and a pen to set any date and time. It never moves by itself. Settings: show/hide and 24-hour time per player; latitude, longitude and time zone for the world. Macros: `game.modules.get('wod-city-atlas').api.clock.advance(60)`.
- **Characters on the map.** Each player's character appears on atlas scenes as a round portrait pin (the Actor's picture, ringed in the player's colour, with a name plate). Players drag their own; the Storyteller drags anyone, and can place, find, hide from the others or take a character off the map from the new *Characters* list in the Map tab (or the people button on the scene toolbar). Positions are stored per atlas in each user's data. World setting *Players see each other on the atlas*.
- **A Masquerade look for Foundry.** Foundry's own interface (scene controls, sidebar and directories, chat, window title bars, dialogs, player list, macro bar, notifications, menus, the pause screen) is restyled in black, bone and blood with gothic type and a faint bloodshot vignette. Character sheets are not touched. Client setting *Masquerade look for Foundry* turns it off.
- The atlas dossier gets matching touches: a blood-red rule under the title, glowing tabs, drop capitals, diamond section marks.

## 1.4.1
- **Rolled back to 1.3.0.** This release is identical to 1.3.0; the 1.4.0 changes (rewritten Milwaukee texts, neonate start, update-from-preset) are withdrawn.

## 1.3.0
- **Players only use scenes.** Atlas journal entries are hidden from players, they can't open the atlas window or journal, and they can't change the Storyteller's map. The launcher shows players the atlas scenes they may visit. (World setting *Players may open atlases outside scenes* restores the old behaviour.)
- **Player notes.** Anyone can add notes to the map from the scene: title, text, icon and colour, visible to *Only me* or *Everyone*. Notes are stored with each user's account and never change the atlas. The Storyteller can delete any note and choose to see private ones.
- **Toolbar on the scene.** Realm and level switches, dossier, layers, search, *Add a note*, quick layer buttons and *Hide the atlas* now sit on the scene itself. The dossier has a new **Map** tab with every switch (realms, levels, layers, place categories, notes, legend, View as, realm lock) and a **Notes** tab.
- **Pictures on hover.** Pins, zones and domains show their picture (own, linked Actor's, or a person's there) in the hover tooltip.
- **Secrets revealed one by one.** Tiers stop at 0–3 (hidden, existence, basic, full). Each secret callout or relation is revealed separately, to everyone or to particular players, from the dossier. Older tier-4+ callouts become secrets automatically.
- **Relations for everyone.** Every character can have relations; the Storyteller adds and removes them in the dossier (optionally as secrets). Dossiers also show *How others see them*.
- **More varied pins.** Seven pin shapes, 35 new icons, optional picture pins. The Milwaukee preset gives each category its own shape and about 160 places their own icon.

## 1.2.3
- **Fix: scenes stopped drawing after visiting an atlas scene.** Atlas scenes raised Foundry's maximum zoom, but in Foundry 13.351 that setting does not exist, so the value became "not a number" and broke the camera of every scene for the rest of the session. The module now only adjusts the zoom limit when Foundry has a valid one, and repairs an invalid value if it finds one.

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
