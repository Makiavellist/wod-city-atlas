# Changelog

## 1.16.0
- **Characters go inside places.** Drop a character's portrait onto a place's pin and they enter it: the portrait settles on the rim of the pin with a glow and a short entering animation, the place pulses to welcome them and keeps a ring in their colour while anyone is in. The tooltip and the dossier (*Сейчас здесь*) show who is inside, and the character list reads *внутри: …*. Drag the portrait off to leave.
- **The atlas speaks Russian.** Everything players see is in Russian: the window and its tabs, the map controls, search, notes, the character list, the dossiers, the clock (Russian weekdays and months, 24-hour time, «до рассвета») and the calendar. Cyrillic letters use matching faces (Old Standard TT, Cormorant SC, Ponomar) beside the IM Fell and Pirata lettering. *Configure Settings → Atlas language for players / Язык атласа* (Русский by default) switches it back to English; the Storyteller's editor stays in English. Foundry's own strings for the module have a Russian translation too.
- **The whole Milwaukee preset is translated**: every description, person, clan line, fact, callout, relation, chronicle page, timeline, hook, layer, category, faction, realm, level, legend and status, in the official World of Darkness Russian terms (Сородичи, Камарилья, Шабаш, Гару, Умбра, Преграда, Саван, Земли Теней, Грёза, Чары, Банальность…). Names stay “English (Русский)”, now for people and factions too, and the map lettering still shows only the English.
- **Linked pictures.** A pin, zone or route linked to a Scene shows the Scene's background, and a person or pin linked to an Actor shows the Actor's portrait, in the dossier, the tooltip and the picture-pin, before any picture of their own.
- Atlases made from the preset take the translation by themselves. What players have been shown stays shown: revealed secrets, facts and relations keep their state; only their words change.
- Fix: names whose English part has brackets of its own (“Merik’s penthouse (sealed) (Пентхаус Мерика (опечатан))”) lost their Russian part only partly on the map.

## 1.15.1
- **Easier to find**: right-click an atlas in the Journal tab for *Hide everything from players…* and *Link to Actors (players and people)…*. The editor's home page lists *Link to Actors* too.
- **Players' characters** can be set right in *Link to Actors* (the same as Foundry's User Configuration → Character): the player's portrait pin shows that Actor.
- **Scenes**: right-click a Scene in the Scenes tab for *Show in City Atlas* when a place, zone or route is linked to it; in the dossier the link reads *Go to the scene*.

## 1.15.0
- **Gothic lettering for the effects**, with a hand per effect: Old Church Slavonic uncial (Ponomar) for НАРУШЕНИЕ МАСКАРАДА and the dark moments (Чужой взгляд, Дурное предчувствие, Ласомбра), dripping letters for Бешенство, charred letters for Ротшрек, a spidery hand for Шёпот, glitched letters for Расколотое зрение and Зазеркалье, engraved small capitals for the Tremere, and Triodion for the other lines. All free fonts (SIL OFL), bundled with the module; Ruslan Display and Old Standard TT are gone.

## 1.14.2
- **Ротшрек** (spelled so now) has living fire: hundreds of glowing particles rising in shifting tongues, flowing instead of bobbing.
- Effects other than Шёпот stay gender-neutral again: Голод says «Голод сводит с ума.»

## 1.14.1
- **Шёпот is quieter and subtler**: fewer, softer voices.
- **315 phrases** to draw from, every one addressing the player in the feminine. As before 1.14 it shows 7 phrases (your own lines among them), but the effect still lasts 18 seconds, so each phrase stays long enough to read.
- **Чужой взгляд** says «Кто-то смотрит»; **Покров Бездны** has no text; **Голод** says «Ты так голодна.»

## 1.14.0
- **The effects are in Russian**: names, descriptions, the words on screen (НАРУШЕНИЕ МАСКАРАДА, БЕШЕНСТВО, РЁТШРЕК), the default lines and the picker itself. Two Cyrillic fonts are bundled for them (Ruslan Display, Old Standard TT).
- **Sounds of their own** for the Beast: Бешенство (a heart speeding up under a growl and a roar), Рётшрек (a whoosh of flame, roaring, crackling fire, a panicked heart), Голод (a slow heavy heart, a low ache, a long breath in). Synthesised in the browser, following Foundry's interface volume.
- **Шёпот** now has whispering voices from every side, Russian phrases, and lasts twice as long (18 s). Your own lines are mixed in among the random ones instead of replacing them.
- **Lasombra**: Покров Бездны, Руки Бездны, Живая тень. **Tremere**: Ритуальный круг, Кипящая кровь, Охранный знак. Each with its own picture and sound.

## 1.13.1
- **Preset updates are applied without asking.** An atlas made from the Milwaukee preset takes a new version's changes the next time the Storyteller opens it; no more question on load. Full descriptions, positions and visibility are not touched.
- Old update steps are folded into one, and the support for 1.10-era alerts is removed.

## 1.13.0
- **Storyteller effects: the Send and *Try it on me* buttons are always on screen.** The picker was taller than the window on smaller screens and pushed its buttons out of sight; it now scrolls inside the dialog instead.
- **Translations live in the name.** No separate translation field any more: names read “Pabst Theater (Театр Пабст)”. Cards, lists, tooltips and search show the whole name; the map lettering leaves the bracketed Russian out to stay readable.
- **No Chronicle tab and no date line** under the title in the Milwaukee preset (a realm can switch the tab off with `terms.pages: false`).
- **Fix: hovering a zone seemed to light up its neighbour.** The highlight thickened the zone's outline, and where two zones share a border (the Blood Brothers and the Union) the neighbour looked lit. Hover and selection now light the inside of the zone only.
- **The Storyteller sees the Basic description** in the dossier, above the full text. Players see the same as before.
- **The whimsical Dreaming is back**, as in the original map: the Crownless Ward's towers with windows twinkling, the Unfinished Index's books drifting, the Wolf's Eye turning and opening, the Glass Orchard's three fruits with their seasons turning inside, the Far Guest's Seat bobbing on the starlit lake with its river of light. Chimera move about: Miss Tuesday trots between the Third Shift, the West Foundry and the Last Hearth, the Rent Collector makes his rounds, the Coat rides the last bus down Wisconsin Avenue, the swifts, the copper whale, the Encore and Mrs. Quire drift. All of it respects *reduce motion*.
- Atlases made from the preset are offered these changes once (names, the Dreaming pictures and wanderers, the header and tabs).

## 1.12.0
- **Generations are never shown to players**, wherever the clan line appears (cards, lists, tooltips, search).
- **True and false clans.** The clan is a piece of its own in *What players see*: true clan (✓), the false clan (🎭) or nothing (✗), for all or per player. Set *False clan* in the edit form; someone with a false clan keeps their true allegiance hidden by default too. Roles no longer name the clan (“Council (Ventrue)” → “Council”), and Maximus and Jesselin pass as Tremere.
- **Russian texts for the preset.** The Basic descriptions and the Existence-tier names and lines (“Церковь — Здесь церковь.”) are now in Russian, with World of Darkness terms as in the official translations (Сородичи, Князь, старейшины, анархи, каитиффы, люпины, Шабаш…). Every place, zone, route and glow has its Russian name in brackets, real places as they are called in Russian. The English Basic descriptions are gone. Atlases made from the preset are offered the new texts once; they replace the old short texts (full descriptions, positions and visibility are not touched).
- **Hide everything.** *Edit → Player visibility* has a button that hides every place, zone, route, glow and person from every player, resets every fact, secret, relation and connection to its default, and makes new entries start hidden.
- The edit form gained *False clan*, and *Text while unknown* for routes and glows.

## 1.11.0
- **Every fact, figure and connection can be shown to each player separately.** The *What players see* panel at the bottom of a dossier now lists the entry's pieces one by one, with a setting for All and for each player (follow the tier, shown or hidden): every fact and callout, the allegiance, every figure seen at a place, every owner of a domain, and on a character every relation, every place they can be found and every domain they hold. A piece you show is visible even when the player only knows the entry at Basic. Hiding an allegiance hides the faction's name and colour everywhere (the person is listed under *Allegiance unknown*). The edit form gained *Who knows it* for each fact.
- **Basic knowledge now comes with a vague description.** A player who knows an entry only at Basic reads a short *Basic description* (what a neonate might casually overhear) instead of nothing; the full text, facts, routes and neighbours wait for Full. All 651 entries of the Milwaukee preset have one, and search no longer finds Basic entries by words from their full text. Write your own in the edit form under *Basic description*.
- **Storyteller effects.** A new ghost button next to the Masquerade masks opens a picker of full-screen effects, sent to everyone or only to the players you choose, with an optional line of text: Frenzy, Rötschreck, the Hunger, a lapse of judgement, confusion, ominous foreboding, being watched, and for Malkavians whispers, fractured sight and the looking-glass. *Try it on me* previews one. They fade by themselves and respect *reduce motion*. Macros: `api.effect(kind, {users, text})`, `api.effects()`.
- **No more werewolf territory in the lake.** The Lupine lands, the Mouse pack's range and the Hedgerow Lands now stop at the shore.
- Existing atlases made from the preset are offered the new outlines and Basic descriptions once (descriptions are only added where an entry has none). *Refresh realm looks* now brings them too.

## 1.10.0
- **Faster map, especially in animated realms.** Between animation ticks the map is no longer redrawn from scratch: what stands still (the ground, zones, routes, glows, lettering, still fog and vignette) is kept in two cached layers, and each tick only draws what moves (flowing lines, pulsing glows, motes, water). An animation tick now costs a fraction of what it did (in tests about a tenth in the waking city and a fifth in the Umbra, Dreaming and Shadowlands), which matters on a busy Foundry scene. Also: pins are only re-placed when the camera or the selection changes; hovering checks the map at most once a frame; visible zones, routes, glows and labels are worked out once per change instead of every frame; style lookups, pattern keys and label widths are remembered; motes and stars are stamped from small sprites instead of drawn as paths and gradients one by one; a change made by someone else reloads only the part of the atlas that changed.
- **The 1.8 Umbra is gone from the module entirely**: the forest, mist, hand-drawn lines, rot stains and their supporting code. Atlases that kept the 1.8 look are offered the 1.4 look again when opened.
- Fixes and tidying: labels no longer dodge pins where they were a frame ago; label widths are measured again once the atlas fonts have loaded; a pending hover is cancelled when the map closes; unused code removed (old picture helpers, a dead tier button, leftover imports), and the escaping helper is shared by the clock, calendar and alert.

## 1.9.0
- **The Umbra looks as it did in 1.4 again**: the spirit-green night with glowing teal roads, cyan Weaver grids and starlit Greatwater. The forest, the vines over the interface and the bark-and-moss Foundry skin are gone; the crossing into the Umbra is the gentle Gauntlet mist again. The Kindred taint keeps its names and stays clickable. When you open your atlas you will be asked once whether to switch it back; atlas scenes then redraw their picture by themselves.
- **Show as a Scene is easier to find.** Right-click an atlas in the Journal sidebar → *Show as a Scene…*, or use the new scene button on the atlas window's toolbar (right-hand side, under the pen). Both open the panel straight away. It is still under *Edit → Show as a Scene* too.

## 1.8.0
- **The Umbra, rebuilt from the ground up as old woods.** The land is a forest seen from above: painted tree crowns that stay sharp as you zoom (larger trees from afar, smaller ones close up), groves where the parks are, clearings, a still black lake. Banks of mist drift across, fireflies rise, leaves tumble down. Paths, shores and rivers are drawn by hand; the freeways are thin blue Weaver threads. Wild spirit zones have ragged, inked borders gone over twice, with leaf, paw, claw, moon and tree marks; the Wyrm's places are rust and thorn hatching. The Weaver's places are the contrast: straight, crisp, blue and gridded, with their names in plain modern capitals. Kindred taint is a ragged rot stain, the gates are moonlit, Luna is bone-white.
- **Vines over the interface.** In the Umbra the toolbar on the scene is a bark plank with a vine hanging over the buttons, the buttons are moss pebbles, the realm switch is a branch with leaves at its ends, pins carry a leaf, and the dossier becomes a field journal with vines in its corners and down its edge. With the Masquerade look, Foundry's own controls, sidebar, window title bars, chat, player list, notifications and the clock turn to moss and bark, with leaves on the buttons.
- **A new crossing into the Umbra.** Vines grow in from the edges of the map and put out leaves while a green mist rises and the city fades to sepia.
- **Fix: the Umbra showed the old and the new look at once.** An atlas scene keeps a still picture of its plain map, so a scene made in the Umbra kept the old blue lake and glowing streets under the new zones. The Storyteller's client now redraws the scene picture by itself whenever the realm's look has changed. The realm's moving atmosphere (mist, leaves, motes, water) is now also drawn on the realm the scene picture shows.
- **New looks arrive by themselves.** When a module update redraws a realm of the Milwaukee preset, the Storyteller is asked once whether to give the atlas the new look. Only colours, effects and map styles change; texts, positions and what players can see do not. *Refresh realm looks* now also adds new styles and refreshes routes, glows, labels and categories (it used to skip those, so part of the old look stayed).
- Fixes: tooltips on pins on a scene no longer vanish as soon as they appear; while the atlas is hidden on a scene, its invisible pins and zones no longer react to clicks and hovers; the grab cursor no longer stays stuck after leaving the map; a chronicle clock set to latitude, longitude or time zone 0 (the equator, Greenwich, UTC) no longer jumps back to Milwaukee; event names with quotes or angle brackets no longer break the clock's tooltip; named styles made of several passes are no longer dropped when the atlas is saved; the atlas no longer tries to draw on a scene before it is ready.
- Release notes on GitHub now list only the changes of their own version.

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
