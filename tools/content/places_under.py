from lib import E

# ---------------------------------------------------------------- under the city: places
E('gp-grand', t=1, icon='haven', alias='The heart of the Warrens',
  rumour='The Nosferatu have a hall somewhere under downtown where they decide what the city knows. You will not be invited.',
  brief='''The Well Hall: the huge round chamber of an old storm-water well under the west bank, turned into an assembly hall. Mother Agatha receives petitioners here.''',
  full='''The Nosferatu decide here what the rest of the city will be told, and what it will pay. A guest follows the guide and asks no questions about faces.''')

E('gp-archive', t=0, icon='book', alias='A vault under the Journal building',
  brief='''The Milwaukee Journal's old pneumatic-post vault: rows of drawers with a card on every resident of the city, by night and by day.''',
  full='''Cricket keeps the file and listens to the telephone lines from here. Mother Agatha decides who may read it.''')

E('gp-ratking', t=0, icon='raven', alias='Something that squeaks in the western tunnels',
  brief='''The Rat King: a thousand rats fed on Nosferatu blood, their tails knotted into a single creature.''',
  full='''It guards the western approaches to the Warrens and squeaks to Agatha about everyone who comes.''')

E('gp-market', t=2, icon='coin', shape='square',
  brief='''The Rat Market: the Nosferatu's neutral bazaar in the cellars of the old Commission Row warehouses under the Third Ward. Stalls of crates, lanterns on hooks, hooded traders: information, papers, weapons, bagged blood.''',
  full='''The only place underground where the Nosferatu are glad to see strangers. A neonate who wants a forged licence, a clean car or the name of whoever is following them comes here. Since the invasion trade has halved, because everyone is afraid of the tunnels.''',
  calls=[('The rule down here', 'Trade, don\'t fight. Troublemakers are handed to the Council.', 'law')])

E('gp-parovich', t=0, icon='lock', alias='Sealed rooms under a mansion',
  brief='''Parovich's den under his Concordia mansion. The Council searched and sealed it.''',
  full='''The Council's seals are intact. The bricks of the old passage to the Warrens have been broken out from inside.''',
  secrets=[('Who came back', 'The vozhd came here. The Parovich inside it wanted to see his home.')])

E('gp-pocketdoor', t=0, icon='lock', alias='An old harbour lock',
  brief='''An old lock at the edge of the harbour. A grate is held by a Nosferatu padlock and a second seal nobody else recognises. Brother Dust keeps watch.''',
  full='''A passage slopes down from here under the lake.''',
  secrets=[('Where it goes', 'The passage leads to the Michigan Pocket. The second seal is a sluagh\'s.')])

E('gp-akawa', t=0, icon='chain', shape='octagon', alias='A boiler room under MECCA',
  brief='''A concrete boiler room in the Council's steam tunnels under MECCA, turned into a cell. Gracis's ghouls guard it.''',
  full='''The Blood Brothers do not know where it is. The Nosferatu do.''',
  secrets=[('The prisoner', 'Akawa is held here under a Blood Bond.')])

E('gp-pocketdoor2', t=0, icon='door', alias='A vault door in a cave wall',
  brief='''A door from an old bank vault set into a cave wall. On this side hangs a sign in Gaelic: "Closed until forgiven."''',
  full='''Behind it is the Michigan Pocket.''')

for pid, nm, b in [
    ('gp-gas', 'A gas station under the lake', '''A gas station with a faded logo and working neon. The pumps still give fuel nobody ever delivered. Ivory took it from Highway 41 when the building was condemned. Jamie Robinson came here once, and left without a word.'''),
    ('gp-diner', 'A diner under the lake', '''A chrome 1940s dining car with a DINER sign. The sluagh gather here to whisper. There is always a pie in the fridge that nobody baked.'''),
    ('gp-gazebo', 'A bandstand under the lake', '''An octagonal bandstand from a demolished city park, where an orchestra played in the 1920s. Some nights there is music in it.'''),
    ('gp-houses', 'A street of old houses', '''Frame houses from the north side, torn down for the freeway and carried off by the sluagh with their wallpaper, the photographs on the walls and the smell of supper. The doors aren't locked.'''),
    ('gp-pens', 'Empty stock pens', '''Wooden pens from the valley's old stockyards. Empty. The sluagh brought them so the city wouldn't forget what was killed in the valley.'''),
    ('gp-boxcar', 'A boxcar without wheels', '''A rusted boxcar from an abandoned spur. Inside is a storeroom of signs, shop fronts, lamps and door handles: the small things that don't fit in buildings.'''),
    ('gp-truss', 'A bridge truss over a crack', '''A span of a demolished railroad bridge lies on the rocks over a black crack. They say that if you cross it you come out somewhere other than where you went in.'''),
    ('gp-angels', 'Stone angels', '''Stone angels from moved and demolished cemeteries stand along the road, facing the way out. The Nosferatu set them up; that was their share of the work.'''),
    ('gp-lion', 'A stone lion', '''A lion from the façade of a demolished bank, a nameless obelisk, an abstract sculpture the city council declared "ugly". The Pocket keeps even what nobody liked.'''),
    ('gp-spire', 'A fallen steeple', '''The white wooden steeple of a demolished church lies on a heap of brick. The bell inside sometimes rings by itself, at the death of another building above.'''),
    ('gp-ivory', 'A fire tower', '''A wooden fire tower from a hill outside town. Ivory sits at the top in her school uniform doing homework while the stolen city sleeps below her.''')]:
    E(pid, t=0, alias=nm, brief=b, full='')

E('gp-gallery', t=0, icon='book2', alias='A wall of drawings',
  brief='''The Gallery of Two Peoples: a cave wall covered with drawings, names and dates. For generations the Nosferatu and the sluagh recorded here which building was saved, and by whom.''',
  full='''The last Nosferatu entry is from 1990. After it there is only Ivory's handwriting.''')

E('gp-wide', t=1, icon='warehouse', alias='The gate behind Warehouse No. 7',
  rumour='There is a grate in Cudahy that the Council guards with ghouls. Something has bent it from below.',
  brief='''The back wall of Warehouse No. 7 in Cudahy hides a gentle ramp a truck wide: the mouth of the Sabbat's wide tunnel. The Camarilla has put a grate and two ghouls here.''',
  full='''The grate has been bent from inside twice already.''')

E('gp-miller', t=1, icon='glass', alias='The old brewery caves',
  rumour='There are cold cellars in Miller Valley where the Nosferatu and the Gangrel meet. They give tours by day.',
  brief='''The Miller caves, 1850s lagering cellars dug into the hillside: a tour stop by day and a neutral waystation of the Nosferatu and the Gangrel by night.''',
  full='''Leave something cold for the cellars' keeper. Nobody remembers who started the custom.''',
  calls=[('The custom', 'Neutral ground. Leave something cold.', 'law')])

E('gp-chestnut', t=0, icon='door', alias='Cellars under the Pabst brewery hill',
  brief='''Vaulted cellars under the Pabst brewery where ice for the lager was stored.''',
  full='''From here you can reach the Spine, the trunk sewer under Wisconsin Avenue, without going up to the street.''')

E('gp-bridge', t=0, icon='door', alias='A passage under the bridge',
  brief='''The service door under the Wisconsin Avenue bridge, seen from inside: a short brick passage straight into the Spine.''',
  full='''Nobody forces it. That is the whole agreement.''')

E('gp-usla', t=0, icon='eye', shape='octagon', alias='A crack in the dolomite',
  brief='''A narrow crack in the dolomite directly under St. Joan of Arc Chapel. The stone is warm to the touch, and no spell works.''',
  full='''Haberman would give a year of his unlife to get in here.''',
  secrets=[('The totems', 'Here Usla hid the Talon of the Eagle and the Eye of the Coyote, reshaped as his own hand and eye.')])

E('gp-ossuary', t=0, icon='skull', alias='A tannery basement',
  brief='''A tannery basement under the Menomonee Valley: tables of fused bone, walls laced with sinew, jars of eyes on the shelves.''',
  full='''Dragos Dalca sculpted his creatures here. Castor lives here now and carries on his master's work.''')

E('gp-hounds', t=0, icon='fang', alias='Something that hunts the valley sewers',
  brief='''Six, or by now five, things the size of calves, with human hands for forepaws. They hunt as a pack in the valley sewers and can smell vampire blood.''',
  full='''Dragos made them from dogs and from the homeless. Castor feeds them.''')

E('gp-choir', t=0, icon='skull', alias='Singing in the tunnels',
  brief='''The Choir: prisoners from the viaduct camp, sewn into one crawling body with a dozen mouths. It sings the hymns its parts remember and weeps when it is fed.''',
  full='''The Black Water pack\'s priest gives the same name to something much larger.''')

E('gp-gills', t=1, icon='anchor', alias='Things under the piers',
  rumour='Dockworkers say something climbs out onto the piers on foggy nights.',
  brief='''The Gills: what the Sabbat made of fish and people on the fish plant's conveyor. A few survived and went down into the harbour sewers.''',
  full='''Cold, slippery, and sometimes they climb out onto the piers.''')

E('gp-wall', t=0, icon='skull', alias='A wall that breathes',
  brief='''A partition of flesh grown across the wide tunnel to slow pursuit. It still breathes and grabs at anything that comes too close.''',
  full='')

E('gp-stalker', t=0, icon='mask', alias='A voice in the southern galleries',
  brief='''The Faceless: a tall thing without a face that repeats the voices it hears.''',
  full='''It lures hunters and the homeless with the voices of their families.''')

E('gp-shovel', t=0, icon='grave', alias='A side gallery',
  brief='''A side gallery where three Sabbat shovelheads, dug out of their graves too late to fight, have learned to live like animals.''',
  full='''Noemí Santana visits them with blood once a week and calls them "the reserves".''')

E('gp-cistern', t=0, icon='spiral', alias='A flooded cistern under Walker’s Point',
  brief='''The Black Water cistern: a flooded brick hall under Walker's Point with a single dry island in the middle.''',
  full='''The last Sabbat pack in the city, the Black Water, sleeps on the island in sleeping bags. Hieronymus performs the Vaulderie here.''',
  secrets=[('Velez', 'Guillem Velez comes here when the yacht is not safe.')])

E('gp-maxcache', t=0, icon='key', alias='A niche behind a sewer grate',
  brief='''A niche behind a sewer grate under Bay View: boxes of totem blanks, blood in ampoules, a list of buyers.''',
  full='''Maximus McKenzie comes back here once a week.''')

E('gp-shaft-ji', t=1, icon='door', alias='A Deep Tunnel shaft on Jones Island',
  rumour='The city is digging an enormous tunnel three hundred feet under the river. The night watchmen do not like it.',
  brief='''A vertical shaft of the Deep Tunnel, the storage tunnel under construction since 1986, beside the Jones Island treatment plant.''',
  full='''A single watchman is on duty at night. He has twice been found asleep at the bottom of the shaft, and does not remember going down.''')

E('gp-shaft-n', t=0, icon='door', alias='A shaft by the North Avenue dam',
  brief='''The northern shaft of the Deep Tunnel, by the North Avenue dam.''',
  full='''Gunther goes down here when he wants to cross the city unseen.''')

E('gp-shaft-v', t=0, icon='door', alias='An abandoned construction shaft',
  brief='''An abandoned Deep Tunnel construction shaft in the middle of the Menomonee Valley.''',
  full='''The workers left after a night shift did not come back up.''')

E('gp-vozd', t=0, icon='skull', alias='Something huge in a drift',
  brief='''A colossal thing of dozens of fused bodies fills an abandoned drift of the Deep Tunnel from wall to wall. It sleeps until disturbed.''',
  full='''It is a vozhd, a Tzimisce war-ghoul, the last great work of Dragos Dalca.''',
  secrets=[('His face', 'One of the faces in its flank is Parovich. He never sleeps.')])

E('gp-drake', t=0, icon='spiral', alias='A culvert scored with spirals',
  brief='''A storm culvert under the concrete Kinnickinnic, its walls scored with clawed spirals.''',
  full='''Drake, the Lupine who killed Victor, sleeps in a concrete pipe here and sometimes goes up into the spirit world.''')

# ---------------------------------------------------------------- waking zones
E('t-lupine', t=2,
  brief='''Everything past the Anubi patrol line belongs to the Werewolves. Roads, railways and the suburbs beyond are their hunting ground. Few Kindred cross them alive, and none do it by choice.''',
  full='''Even Shorewood, the North Shore and their lakefront parks fall outside any Kindred patrol. The highways are watched. Sensible Kindred who must leave arrange a sealed daylight truck or a night flight.''')

E('t-anubi', t=2,
  brief='''The Outlands: the no-man's-land of suburbs between the city and the wilds. Mark Decker's Anubi patrol its outer edge every night and ambush Lupine raiders before they reach the Barrens.''',
  full='''The border drawn here is their outermost patrol route; Good Hope Road marks its northern limit. If you want to talk to Decker, drive Good Hope Road after dark and wait.''')

E('t-bb', t=2,
  brief='''Blood Brothers territory: the largest slice of the Barrens, from West Downtown out to the Zoo Freeway. Most Anarch rumbles happen here, because downtown is too well watched by the Elders.''',
  full='''The Brothers used to leave quiet travellers alone. Since Akawa disappeared the gang is in turmoil, Wrecker and Ethan Stone are holding it together, and nobody can vouch for its streets.''')

E('t-union', t=2,
  brief='''Union turf: the narrow lakeside strip east of the Milwaukee River, from the UWM end of the East Side down through the Lower East Side and the I-794 corridor into Bay View. The Union leaves Elders alone but mauls neonates who wander in alone.''',
  full='''Travel in groups. Turk has killed few Kindred, but many more have limped home much worse for meeting him. The gang is bleeding members and losing ground to the Blood Brothers.''',
  secrets=[('Why it is weak', 'The Union lost face, and members, because the late Prince had been Dominating and Blood Bonding its key figures for five years.')])

E('t-elders-dt', t=2,
  brief='''The glass-and-steel heart of Kindred Milwaukee, spanning the river around MECCA, the Hyatt and City Hall. The Council meets here, the oldest havens are here, and heavy police patrols keep the street-level riff-raff away.''',
  full='''The Anarchs fight elsewhere; the Elders watch from the penthouses. Since the Prince's death the downtown blocks are held by the Council as a body, which means by whoever can get three votes.''')

E('t-elders-air', t=2,
  brief='''General Mitchell Field: with every road and railway running through Lupine country, the airport is the city's real front door. The Council holds it tightly.''',
  full='''Gracis's spies log every arrival. Parovich's people used to do the same.''')

E('t-null', t=1, alias='The Marquette null zone',
  rumour='Magic does not work at Marquette. Tremere talk about it when they think you are not listening.',
  brief='''A "magic-dead" zone covering the Marquette campus: north past Mount Sinai Medical Center, west to the old Children's Hospital, south almost to the Menomonee. Thaumaturgy fails here.''',
  full='''Blood magic risks a painful backlash inside the zone, while Auspex and Protean grow stronger. The Tremere and several independent Kindred study it. So do the Lupine.''',
  secrets=[('The cause', 'The cause lies under St. Joan of Arc Chapel: Usla\'s buried totems.')])

E('t-crucible', t=2,
  brief='''The Crucible: Milwaukee's central hunting grounds, a West Downtown knot of bars and dance clubs. No faction has tried to claim it yet.''',
  full='''Many Kindred hunt here every night: Missing Persons, Arabian Nights, Deadman's Party, Peaches and Cream, Soldier Boy, Howler and Starscape. With the Prince dead, somebody will try to claim it soon.''')

E('t-coyote', t=0,
  brief='''The range of the Coyote, the principal Lupine pack: just under a dozen strong, every one a Red Talon, a born wolf. It is led by the coolly rational Horatio Sims.''',
  full='''This autumn his wolves are also helping the Eagle burn Banes out of the southern woods.''',
  secrets=[('What Horatio wants', 'The Kindred off balance long enough for him to hold Marquette and dig up the totems.')])

E('t-eagle', t=0,
  brief='''The range of the Eagle pack along the southern approaches, astride I-94: about eight Garou, almost all Wendigo, who raid the city roughly once a week regardless of the odds.''',
  full='''They blame the Coyote for the theft of their totem's Talon. This autumn the raids have mostly stopped.''',
  secrets=[('Why the raids stopped', 'House Goratrix poisoned their woods with Banes.'),
           ('Seven Fires', 'The pack secretly owns the Seven Fires casino.')])

E('t-mouse', t=0,
  brief='''The range of the Mouse pack: the northern woods and the North Shore lakefront. Once fifteen Garou, mostly Glass Walkers, who lived in the city in human form and hated Vampires even by Lupine standards.''',
  full='''Merik's Gangrel wife ran with them. This autumn they ambushed a group of Kindred on Route 43 north. Since then the pack has almost disappeared.''',
  secrets=[('What happened to them', 'The Sabbat and House Goratrix all but wiped out and corrupted the pack. Of the old Mouse only Mercer remains, and Drake belongs to the Wyrm.')])

E('t-dz-cudahy', t=2,
  brief='''Danger: the Cudahy warehouse yards. The Sabbat's creatures came up into the city here during the invasion. Stray dogs will not enter the yards, and night-shift workers have stopped taking the shortcut along the tracks.''',
  full='''A Camarilla grate and two ghouls now guard the wide ramp behind Warehouse No. 7. The grate has twice been bent from below.''')

E('t-dz-valley', t=1, alias='Danger: the valley tanneries',
  rumour='Blood Brothers cross the Menomonee Valley in pairs now, and never on foot after three in the morning.',
  brief='''Danger: Tannery Row, the old tanneries and packing houses of the Menomonee Valley. At night things come up through the drains to hunt.''',
  full='''Dragos's hounds, and worse. The Blood Brothers cross the valley in pairs now.''')

E('t-dz-harbor', t=2,
  brief='''Danger: the fish-plant cordon. Police tape, a security trailer and the smell of burnt ammonia around the plant where Jade Riley killed Dragos.''',
  full='''Under the piers live the Gills, things made of fish and men on the plant's conveyors. They climb out onto the docks on foggy nights.''')

E('t-dz-blight', t=0,
  brief='''Danger: the blighted Root River woods. The forest is dying, and things pour out of the poisoned groves every night.''',
  full='''The Eagle pack of Lupines fights them every night. Anyone else who wanders in is either a target or a meal.''',
  secrets=[('Who did it', 'House Goratrix poisoned the forest to keep the Garou busy while the Sabbat moved in.')])

E('gz-grand', t=1, alias='The Grand Warrens',
  rumour='Most of the city\'s Nosferatu live in tunnels under the west bank. You go in only with a guide.',
  brief='''The Grand Warrens: old storm drains, the cellars of demolished buildings and abandoned pneumatic-post channels under the river's west bank. Most of the city's Nosferatu live here.''',
  full='''Clean, dry halls, maps on the walls, a market in rumours. Outsiders come in only with a guide.''',
  calls=[('The rule down here', 'A guest follows the guide and asks no questions about faces.', 'law')])

E('gz-market', t=2,
  brief='''The Rat Market: knocked-through cellars of the old Commission Row warehouses under the Third Ward, where the Nosferatu keep a neutral market.''',
  full='''Information, papers, weapons, bagged blood. Since the invasion trade has halved.''',
  calls=[('The rule down here', 'Trade, don\'t fight. Troublemakers are handed to the Council.', 'law')])

E('gz-steam', t=1, alias='Service tunnels under downtown',
  rumour='The Elders move between MECCA and the Hyatt without ever going outside.',
  brief='''The steam tunnels: hot, cramped passages lined with district-heating pipes, joining the basements of MECCA, the Hyatt and the government buildings. The Elders use them to move between Elysia unseen.''',
  full='''Gracis's ghouls meet strangers down here.''',
  calls=[('The rule down here', 'The tunnels belong to the Council.', 'law')],
  secrets=[('The cell', 'The cell where Akawa is held is down here.')])

E('gz-null', t=0, alias='Quiet sewers under Marquette',
  brief='''The Hush: under the Marquette campus magic fails below ground as well as above. The sewers are strangely quiet; the rats do not squeak and the water runs without a sound.''',
  full='''At the very bottom is the place where Usla buried the halves of two totems.''',
  calls=[('The rule down here', 'Spells fall silent. You will have to rely on your hands.', 'law')])

E('gz-brew', t=1, alias='The Miller caves',
  brief='''The Miller caves: cold 1850s lagering cellars dug into the hillside of Miller Valley. A tour stop by day and a neutral meeting place by night.''',
  full='''The Nosferatu and the Gangrel use them as a waystation.''',
  calls=[('The rule down here', 'Leave something cold for the cellars\' keeper.', 'law')])

E('gz-flesh', t=0, alias='Tunnels under the valley',
  brief='''The flesh tunnels under the old tanneries and slaughterhouses of the Menomonee Valley. In places the walls are alive: meat and bone grown into the brick.''',
  full='''Dragos set up his workshops here. Most of his army died, but the surviving creatures came back here as to a nest, and Castor feeds them. The Nosferatu give these tunnels a wide berth.''',
  calls=[('The rule down here', 'Here, you are what is hunted.', 'law')])

E('gz-southnest', t=0, alias='The southern tunnels',
  brief='''The southern nests along the wide tunnel that runs north from the Cudahy warehouses.''',
  full='''The Sabbat's creatures marched to the city along it. Loners and small packs that nobody finished off live in its side galleries.''',
  calls=[('The rule down here', 'Move fast and don\'t answer the voices.', 'law')])

E('gz-sabbat', t=0, alias='A cistern under Walker’s Point',
  brief='''The Black Water cistern: a flooded old cistern under Walker's Point, the last Sabbat lair in the city.''',
  full='''Guillem Velez comes here when his yacht is not safe. In the cistern's dark a Lasombra is at his strongest.''',
  calls=[('The rule down here', 'The shadows here look back.', 'law')])

E('gz-drake', t=0, alias='The Kinnickinnic culverts',
  brief='''A forgotten stretch of the storm culverts under the concrete-lined Kinnickinnic. The walls are scratched with spirals.''',
  full='''Drake hides here: once a go-between for the late Prince's killers, now a creature of the Wyrm.''',
  calls=[('The rule down here', 'Never walk in a spiral.', 'law')])

E('gz-vozd', t=0, alias='A drift of the Deep Tunnel',
  brief='''An abandoned side drift of the Deep Tunnel, three hundred feet underground.''',
  full='''The vozhd sleeps here.''',
  calls=[('The rule down here', 'Say nothing. It listens with voices.', 'law')],
  secrets=[('Parovich', 'Parovich\'s face is in its flank.')])

E('gz-flood', t=0, alias='The drowned galleries',
  brief='''Old brick sewers under the East Side, flooded when the new ones came into service. The water stands chest-deep, and something swims in it.''',
  full='''The Nosferatu go through only on rafts.''',
  calls=[('The rule down here', 'Never put your hands in the water.', 'law')])

E('gz-pocket', t=0, alias='A cave under the lake',
  brief='''The Michigan Pocket: a cave that cannot exist, a vast vault of dark stone under the bed of Lake Michigan, full of buildings the city decided to forget.''',
  full='''For generations the local sluagh carried condemned buildings and the debris of crumbling architecture here: a diner, a gas station, houses, a gazebo, a boxcar, a bridge truss, a church spire, cemetery angels. The Pocket was once a place shared by the sluagh and the Nosferatu. Since Parovich went over to the Sabbat the door has been shut. Ivory is the last changeling who looks after it.''',
  calls=[('The rule down here', 'Take nothing away. The Pocket takes, and does not give back.', 'law')])

# ---------------------------------------------------------------- Kindred domains
E('kd-gracis', t=2,
  brief='''Kilbourntown: the old west-bank town Gracis ruled before the cities merged, and still treats as his.''',
  full='''His villa, the north-side Mafia contacts and the right to feed in the Avenue bars are his by long custom.''')
E('kd-lucina', t=2,
  brief='''The Theatre District: the Performing Arts Center, the Pabst Theater, the Auditorium and the Hyatt. Lucina's domain; feed here only with her leave.''',
  full='''Hers by right of taste and by Gracis's indulgence. Louis Detonas has the run of the galleries on her sufferance.''')
E('kd-louis', t=2,
  brief='''East Town galleries: a few blocks of galleries, studios and expensive apartments around Louis Detonas's own. Toreador neonates come here to be noticed.''',
  full='')
E('kd-jason', t=2,
  brief='''Walker's Point: Jason's quiet domain.''',
  full='''Embarrassingly for the Council's swing vote, the Sabbat ran its invasion from a church in his streets.''',
  secrets=[('Still here', 'The last Sabbat pack still hides in a cistern beneath his streets.')])
E('kd-hrothulf', t=1, alias='An acre in the Outlands',
  brief='''Hrothulf's house and the cleared yards around it, deep in the Outlands.''',
  full='''Nobody has ever contested it, and the Lupine avoid it for reasons of their own.''')
E('kd-chapel', t=2,
  brief='''The Highland Boulevard blocks around the Chapel, the Tremere chantry. Do not hunt here.''',
  full='''Since Victor's death Newman has extended the wards a block in every direction, and the neighbours have started sleeping badly.''')
E('kd-mortius', t=0, alias='A haunted block',
  brief='''Dr. Mortius's own house at the edge of the null zone, which mortals swear is haunted.''',
  full='''Its wards fail on the eastern side, where the null zone begins.''')
E('kd-jade', t=2,
  brief='''The Brujah Primogen's official domain: her tower on East Michigan Street and the blocks around it, granted by the Council with a show of reluctance.''',
  full='''She has not hunted here once.''')
E('kd-jade2', t=0, alias='A street in Wauwatosa',
  brief='''Macy Carver's street in Wauwatosa, technically inside the Anubi patrol zone.''',
  full='''Decker has let it stand. He has not said why.''',
  secrets=[('Jade’s real haven', 'The Brujah Primogen sleeps here.')])
E('kd-scott', t=2,
  brief='''The Black Prince's lakeshore: Sir Edward Scott's domain on the Lower East Side, vacant since his death.''',
  full='''Jade could claim it as Brujah Primogen; she has not. Turk's Union is quietly moving in.''')
E('kd-parovich', t=2,
  brief='''Concordia: the decaying mansion blocks of the Nosferatu traitor Parovich, vacant since his exposure. Mother Agatha claims the streets for the Warrens and nobody argues, because nobody wants to go there.''',
  full='')
E('kd-merik', t=2,
  brief='''The late Prince's block, sealed. Nobody holds the Prince's domain, which used to be the whole city.''',
  full='''Every Council member pretends not to want it.''')
E('kd-gunther', t=1, alias='The river above the dam',
  brief='''The banks and the pond above the North Avenue dam: Gunther's domain since the 1930s, by Merik's grant.''',
  full='''Nobody has had the nerve to ask whether the grant died with Merik.''')
E('kd-soraya', t=0, alias='A few strange blocks on Yankee Hill',
  brief='''A few blocks on Yankee Hill that are slightly further away than they should be.''',
  full='''The Council has never formally granted them, because the Council has never formally noticed them.''')
E('kd-ethan', t=1, alias='Valley rooftops',
  brief='''The valley rooftops Ethan Stone can cover from his grain elevator, inside Blood Brother turf.''',
  full='''The Brothers treat them as his.''')
E('kd-decker', t=2,
  brief='''The Good Hope motel strip: the motels and diners along Good Hope Road are Anubi ground by any measure.''',
  full='''Decker keeps no real haven. His people eat at the all-night diners and listen to the police scanner.''')
E('kd-turk', t=2,
  brief='''The Veterans Park shore and the Art Museum steps: the heart of Union turf and Turk's own ground.''',
  full='')
E('kd-agatha', t=2,
  brief='''The Warrens: everything from the Grand Warrens to the harbour lock is Nosferatu ground, by a right older than the Council. Mother Agatha governs it.''',
  full='')
E('kd-steam', t=1, alias='The Council’s tunnels',
  brief='''The service tunnels between MECCA, the Hyatt and the government buildings, held for the Council. Gracis's ghouls guard them.''',
  full='',
  secrets=[('The prisoner', 'Akawa is held somewhere inside.')])
E('kd-castor', t=0, alias='Tunnels nobody walks',
  brief='''Castor's flesh tunnels. The Tzimisce claim nothing on paper. In practice nobody else walks here.''',
  full='')
E('kd-blackwater', t=0, alias='A cistern under Walker’s Point',
  brief='''The Black Water cistern, the last Sabbat lair in the city, right under Jason's domain.''',
  full='')

# ---------------------------------------------------------------- waking routes
E('l-goodhope', t=2,
  brief='''Good Hope Road: the northern edge of Kindred territory and a favourite Anubi patrol route. Country clubs along it make perfect Lupine ambush cover.''',
  full='''Anarchs dare each other to drive its length. "Done Good Hope" five times and you are an Ace.''')
E('l-harbor', t=1, alias='A new Anubi patrol on the lakefront',
  brief='''North Harbor Drive. Decker has recently stretched his patrols down to the lakefront here.''',
  full='''He suspects Lupines are swimming the lake and slipping through the shore parks.''',
  secrets=[('Why', 'Lupines have been using the lakefront to meet the Union.')])
E('l-lakeN', t=1, alias='The northern lakefront parks',
  brief='''The chain of lakeshore parks runs far to the north. The Werewolves have used it as cover to reach the heart of the city, sometimes swimming the lake first.''',
  full='')
E('l-lakeS', t=1, alias='The southern lakefront parks',
  brief='''South Shore, Sheridan and Grant parks give the Lupine a wooded corridor from the southern Outlands nearly to Bay View.''',
  full='')
E('l-i94s', t=2,
  brief='''I-94 to Chicago: one of three highways into town, and all are said to be watched by the Lupine. Only the desperate drive them at night.''',
  full='''Sensible Kindred arrange a sealed daylight truck, or fly.''')
E('l-i43n', t=2,
  brief='''I-43 north and Route 43: the northern highway out of town, watched by the Lupine.''',
  full='''This autumn a Kindred car was shot to pieces on Route 43 by the Mouse pack.''',
  secrets=[('On whose orders', 'Merik told the Mouse pack which car to expect.')])
E('l-i894', t=2,
  brief='''The I-894 bypass, the third major road out of town. Its south-western run crosses deep into Lupine country.''',
  full='')
E('l-skywalk', t=2,
  brief='''The sky-walk: catwalks linking the Hyatt Regency, MECCA, the Arena, the Auditorium and the Reuss Federal Plaza. An Elder can cross the whole complex without touching the street or seeing it.''',
  full='')
E('l-bridgewar', t=2,
  brief='''The Bridge War line at the Chestnut Street crossing. In the 1840s Gracis and Hrothulf fought their war through mortal pawns, who thought the quarrel was about who paid for the river bridges.''',
  full='''In 1845 Gracis staged a riot and the bridges were destroyed.''')
E('l-ritual', t=0, alias='A line across the city',
  brief='''The ring of the four anchors: four antennae on the city's edges, aimed at the null zone. Their diagonals cross over St. Joan of Arc Chapel.''',
  full='''The far anchors, west and north, stand about twice as far out as their partners, the proportion the Chapel's geometry calls a "lever". When all four are tuned, their fields close over Marquette.''')
E('l-ritual2', t=0, alias='A line across the city',
  brief='''The second diagonal of the Chapel's ritual, from the Hotel Warszawa through the chapel to the Lincoln Creek mast.''',
  full='')
E('l-chase', t=2,
  brief='''The dragon's chase: the path of the "Milwaukee Dragon" over Bay View, where the news cameras caught it, to the fish plant where Jade Riley killed it.''',
  full='''The chase began at the Cudahy warehouses.''')
E('gt-deep-mke', t=1, alias='The Deep Tunnel',
  brief='''The Deep Tunnel, Milwaukee branch: an enormous storage tunnel under the river bed, under construction since 1986, three hundred feet down in the dolomite.''',
  full='''Workers have seen tracks that were "too big" and abandoned one of the side drifts.''')
E('gt-deep-men', t=0, alias='The Deep Tunnel, western branch',
  brief='''The western branch of the Deep Tunnel under the Menomonee Valley.''',
  full='''Halfway along is the abandoned drift where the vozhd sleeps.''')
E('gt-deep-kk', t=0, alias='The Deep Tunnel, southern branch',
  brief='''The southern branch of the Deep Tunnel under the concrete Kinnickinnic.''',
  full='''Its end breaks into the culverts where Drake hides.''')
E('gt-wis', t=1, alias='The Spine',
  brief='''The Wisconsin Avenue trunk sewer: the main brick artery under the avenue. The Nosferatu call it the Spine.''',
  full='')
E('gt-river', t=1, alias='A sewer along the river',
  brief='''The riverbank interceptor along the west bank, from the North Avenue dam through the Grand Warrens to the Third Ward.''',
  full='')
E('gt-valley', t=0, alias='The valley sewer',
  brief='''The valley interceptor under the Menomonee Valley.''',
  full='''The eastern half is still passable; the western half belongs to the creatures.''')
E('gt-north', t=0, alias='An old northern sewer',
  brief='''The old North Avenue sewer. Quiet, and nearly empty.''',
  full='')
E('gt-kk', t=0, alias='The Bay View sewer',
  brief='''The Kinnickinnic Avenue sewer, south under Bay View.''',
  full='''Maximus kept his stores along here.''')
E('gt-steam1', t=1, alias='A passage under MECCA',
  brief='''The Elders' steam passage between MECCA and the Hyatt.''',
  full='')
E('gt-steam2', t=0, alias='A passage to City Hall',
  brief='''A service passage to the basements of City Hall and the Pfister.''',
  full='')
E('gt-chestnut', t=0, alias='Brewery cellars',
  brief='''The Chestnut Street cellars under the Pabst brewery hill.''',
  full='')
E('gt-parovich', t=0, alias='A bricked-up passage',
  brief='''Parovich's private passage from the Warrens to his mansion, bricked up at both ends.''',
  full='''At the western end the bricks have been broken out from inside.''')
E('gt-harbor', t=0, alias='A Nosferatu passage',
  brief='''A Nosferatu passage from the Grand Warrens to the old lock on the harbour shore.''',
  full='')
E('gt-pocket', t=0, alias='A passage under the lake',
  brief='''A stone passage on no engineer's drawings, sloping from the harbour lock down under the lake bed.''',
  full='''It ends at the Michigan Pocket's Undersea Door. Closed since Parovich went over to the Sabbat.''')
E('gt-wide', t=1, alias='The Sabbat’s tunnel',
  rumour='The Sabbat dug a tunnel big enough for a truck from Cudahy to somewhere under the valley.',
  brief='''Dragos's wide tunnel: a tunnel a truck wide, dug (or grown) by the Sabbat's creatures from the Cudahy warehouses to the workshops under the valley.''',
  full='''Its southern mouth is hidden only by a warehouse wall.''')
