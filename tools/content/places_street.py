from lib import E

# Tiers: 0 hidden, 1 existence (alias + rumour), 2 basic (brief), 3 full (brief + full + callouts).
# A neonate a few months after the Embrace knows the Elysia, the hunting grounds, the gangs' turf and the
# famous legends. Havens, deals and anything fae, spirit or ghost are unknown at the start.

# ---------------------------------------------------------------- the MECCA complex and the Elders' downtown
E('mecca', t=2, icon='crown', shape='hex',
  brief='''The Milwaukee Exposition & Convention Center and Arena: the Versailles of Kindred Milwaukee. Red carpet, crystal chandeliers, flowerbeds out front and extra police patrols to keep the poor away. The Council of Elders meets here, and several Elders keep havens in the complex.

Every neonate is brought here once to be presented. Anarchs who try to raid it never get far past the lobby.''',
  full='''A sky-walk of enclosed catwalks joins MECCA to the Hyatt Regency, the Arena, the Auditorium and the Reuss Federal Plaza, so that an Elder can cross the whole complex without touching the street or seeing it.

Security is the ghoul Raoul, a former karate champion, and his team of heavily armed mortal guards. Gracis feeds Raoul and calls him a wonderful deterrent against "undesirables". The Anarchs found ways past the ordinary guards years ago; they have not found a way past Raoul.''',
  calls=[('On your first visit', 'You are expected to be awed. The Elders want you to feel how much there is to lose, and slightly excited to be allowed near it.')],
  secrets=[('Below the carpet', 'The complex sits on the Council\'s steam tunnels. Somewhere down there is a boiler room that has been turned into a cell, and Raoul\'s people take turns guarding it.')])

E('hyatt', t=2, icon='building', shape='shield',
  brief='''A grand hotel at 333 W Kilbourn Avenue, joined to MECCA by the sky-walk. Elders keep rooms here: Lucina has a permanent suite on the 16th floor, as everyone knows.''',
  full='''Carna's favourite haven is here as well, so in Council terms the Toreador and Tremere seats sleep under one roof and can reach the Council chamber without going outside. The staff of the upper floors are well paid not to remember guests.''')

E('arena', t=2, icon='theatre',
  brief='''Part of the sky-walked MECCA complex, between the Auditorium and the Hyatt: hockey, concerts and conventions by night, crowds big enough to feed in.''',
  full='''The Arena is the busiest part of the complex and the easiest to enter. Raoul's guards concentrate on the corridors that lead from it to the Council's rooms.''')

E('auditorium', t=2, icon='music',
  brief='''Where the Symphony Orchestra plays. A concert here is a pleasure reserved for the most powerful Elders and the members of the Council; lesser Kindred are not welcome in the private boxes.''',
  full='''Concerts are the Council's favourite negotiating venue: the members can reach each other, and the music covers every word. Before a big vote you can see the Councillors whispering and passing notes between their boxes.

The Anarchs resent being shut out. The Elders misread that anger as hatred of music and art, which has led to a good deal of misunderstanding among the Undead.''')

E('reuss', t=1, icon='building', alias='A federal building on the sky-walk',
  rumour='The sky-walk ends at a federal office building. Elders use the corridor; you have not been invited to.',
  brief='''The H. Reuss Federal Plaza, the southern end of the sky-walk: federal offices by day, a sheltered corridor for Elders by night.''',
  full='''The federal guards keep the building quiet at night, which suits the Elders. The F.B.I. agents who have been poking around Milwaukee this year keep their files elsewhere, but nobody on the Council likes having federal offices at the end of their corridor.''')

E('journal', t=2, icon='book2',
  brief='''The Milwaukee Journal building, directly across the street from MECCA. Every Kindred in the city enjoys the joke: the greatest newspaper story of all time sleeps across the street, and the editors never notice.''',
  full='''The Elders' control of the press is easy from so close. Merik had an arrangement to read tomorrow's edition a day early, and the Council has quietly kept it. Whoever holds the editor will decide how the autumn's "Vampire Murderer" and "Milwaukee Dragon" stories are remembered.''',
  secrets=[('Under the presses', 'The Nosferatu keep their rumour archive in the old pneumatic-post vault beneath the building, and listen to the telephone lines from there.')])

E('police', t=2, icon='badge', shape='diamond',
  brief='''The Police Administration Building, two blocks from MECCA: one of the two great ironies of the city. The Elders are the city's worst criminals, and the police live next door.''',
  full='''With the Prince dead, the department is a prize. Lucina wants the administration for an anti-gang crusade; Jason means to keep it out of everyone's hands; Gracis is after the detectives who used to answer to Parovich. Lieutenant James Wilks of homicide works out of here.''',
  secrets=[('Masterless detectives', 'Parovich owned the detective bureau. Since his exposure his informants there have no master, and they are frightened people with badges.'),
           ('Wilks knows', 'Lieutenant Wilks knows what Kindred are. He has kept silent so far.')])

E('library', t=2, icon='book',
  brief='''The Milwaukee Public Library, three blocks from MECCA and across from the fire department headquarters: an Elder haunt. Messages are left inside books, and the recipient is told which title to borrow through a harmless remark: "I have been reading about ancient Norwegian tools lately. Fascinating."''',
  full='''The first-floor occult section is written by charlatans and checked out by the curious. In the second basement, among old unreadable books that nobody has borrowed for years, is a shelf that no longer appears in the card catalogue.''',
  secrets=[('The second basement', 'A careful search of several nights turns up genuine magical tomes more than six hundred years old. A Tremere would pay dearly for them, and so would the Chapel\'s archivist.')])

E('firehq', t=2, icon='flame',
  brief='''Fire Department headquarters, across the street from the Library. Kindred fear fire, so whoever owns the brigade matters. Everyone knows it belongs to Hrothulf.''',
  full='''Gracis used to control the department. When his men set fire to Hrothulf's haven, the trucks took two hours to arrive. Hrothulf took the brigade for himself and has kept it ever since.''',
  secrets=[('The last resort', 'If he were ever truly cornered, Hrothulf could make every hose in the city fail and let Milwaukee burn.')])

E('museum', t=2, icon='book2',
  brief='''The Milwaukee Public Museum by MacArthur Square. It used to be a Kindred favourite, until it put American Indian bones on display. Akawa's Blood Brothers have attacked it several times, and Lucina's Toreador have retaliated.''',
  full='''The Toreador value the achievements of mortals and do not understand Akawa's fury at all. The exhibit is still up, and the night guards have been doubled. The Brothers have not forgotten it.''')

E('cityhall', t=2, icon='building',
  brief='''City Hall, east of the river. Merik owned the mayor's office. Nobody has claimed it since he died.''',
  full='''Whoever holds the mayor can fire the police and fire chiefs, and so instantly makes enemies of everyone who owns them. Gracis is weighing it. A losing Elder might grab it as a last resort and turn the whole game over.''')

E('pabst', t=2, icon='theatre',
  brief='''The Pabst Theater on East Wells Street, beside City Hall: gilt, velvet and a good stage for the city's gilded diplomacy.''',
  full='''The Toreador treat it as part of Lucina's Theatre District. Opening nights are an unofficial Elysium.''')

E('pac', t=2, icon='theatre',
  brief='''The Performing Arts Center on the river. Kindred of every kind come to its functions. The Council holds diplomacy sessions during performances.''',
  full='''Late at night Anarchs break in to put on mocking shows of their own on the empty stage. The Toreador consider this the worst thing that happens in the city.''')

E('merikpent', t=1, icon='lock', alias='The Prince’s penthouse',
  rumour='The late Prince lived at the top of a downtown tower. The penthouse has been sealed since he died.',
  brief='''Terence Merik's private palace at the top of an East Town tower: plush rugs, spiced blood in crystal goblets and a herd of green-eyed vessels in the back rooms. Sealed by the Council since his death.''',
  full='''By the end it held dried blood, dead flowers stapled to the walls and a drained aquarium. The Council has not decided what to do with it, or with the vessels, who were moved somewhere quieter.''',
  secrets=[('The ambush', 'Merik\'s old Nosferatu servant Demetri hid an ambush of ghouls in the penthouse with Obfuscate, for guests the Prince did not want to leave.')])

E('stmary', t=2, icon='church', shape='diamond',
  brief='''Old St. Mary's Church, near the river on the east side. It looks like an ordinary church. In its basement the Society of Leopold keeps a secret base, and the Kindred know it.''',
  full='''The Inquisition meets here to make plans and share what it has learned about Vampires and Werewolves. Merik's standing order was to leave it alone, in the hope that the Inquisition would find nothing in Milwaukee and go away. Nobody has repealed the order, and nobody is sure it still holds.''',
  calls=[('Merik’s rule', 'Leave the Inquisition alone. Do not give them anything to find.', 'law')])

E('mac', t=2, icon='drop',
  brief='''The Milwaukee Athletic Club, in the middle of Union turf and a favourite hunting ground anyway.''',
  full='''The members are young, attractive and very fit. They can lose more blood without harm, and their strong hearts make it flow faster. Hunting here means crossing the Union's streets, which is part of the thrill.''')

E('artmuseum', t=2, icon='rose',
  brief='''The Milwaukee Art Museum and War Memorial beside Veterans Park. The Toreador visit often. Turk's Union keeps breaking in to deface the collection.''',
  full='''Elders who do not want to be overheard by the Blood Brothers meet here, and there have been several secret Elder meetings in the building about that gang. The museum now takes its best works down at night and posts guards, but guards can be Dominated.''')

E('unionboat', t=2, icon='anchor', shape='shield',
  brief='''A broken-down riverboat moored on the Veterans Park shore, its bright banners hanging limp and grey. It is the Union's base, and everyone knows Turk sleeps there.''',
  full='''Turk believes the water makes it safe from fire, which he fears beyond reason. The park's homeless are the Union's herd, so its members rarely go into a fight short of blood.''')

# ---------------------------------------------------------------- the Crucible
E('crucible-mp', t=2, icon='music',
  brief='''"Persons" to its regulars: several hundred people every night, top-40 hits and a crowd that never gets too wild. The easiest feeding in the Crucible.''',
  full='''You will never hear alternative music here. Kindred who hunt at Missing Persons blend in and feed unnoticed, and many of them think of the crowd as a bloated, senseless herd.''')

E('crucible-dp', t=2, icon='bolt',
  brief='''Neo-punk, avant-garde noise and the most outlandish drinks known to man. A Blood Brothers hangout; the police have been called more than once.''',
  full='''Akawa's boys own the back booth. Since his disappearance the mood here is ugly, and strangers who ask about him are asked to step outside.''')

E('crucible-an', t=2, icon='moon',
  brief='''Across the street from Deadman's Party and its opposite: desert murals, slow dance music and a quiet room. A place to take a date, or find one, if you have money.''',
  full='''Elders who find modern music offensive come here. It is very hard to find a bar that plays any older music, so they settle for something soft, simple, a little boring and, above all, not loud.''')

E('crucible-pc', t=2, icon='glass',
  brief='''A singles bar and a meat market for the young, bored and rich. One-night stands start here every night.''',
  full='''The constant sexual tension makes it the easiest hunting ground in the Crucible for anyone who feeds by seduction.''')

E('crucible-sb', t=2, icon='badge',
  brief='''A reservists' bar with camouflage netting on the walls and old war trophies hanging side by side: bayonets, rifle clips, dud grenades, Civil War cannonballs. The dance floor is tiny.''',
  full='''The regulars know one another, so it is a poor place to meet strangers. Some Kindred who were soldiers in life come only for the atmosphere.''')

E('crucible-hs', t=2, icon='star',
  brief='''Two high-class dance clubs with $10–20 covers and gorgeous floors of black steel and mirrors under coloured lights. Loud top-40; nobody comes for the music.''',
  full='''The bouncers are bribable and the bathrooms are large. Toreador neonates who want to be seen hunt here.''')

E('marqint', t=2, icon='swords', shape='diamond',
  brief='''Where I-94 meets I-794 and I-43, small concrete courtyards are trapped between the ramps. More Anarch battles are fought here than anywhere else in the city.''',
  full='''Union gangers hop onto I-794, slip past the Blood Brother lines and climb down into one of the courtyards; the Brothers arrive and battle is joined. The police never patrol it and the homeless cannot get in without a car, so nobody sees.''')

E('mafia', t=1, icon='coin', alias='The Third Ward restaurant',
  rumour='Elders say the old Italian Third Ward still belongs to "the family", and that one of the Council owns the family.',
  brief='''The Don of Milwaukee's organised crime keeps his table in a restaurant in the old Italian Third Ward. Everyone assumes an Elder holds his leash.''',
  full='''That Elder is Gracis. He uses Mafia money for bribes and for mortal hitmen whose job is to scare his rivals rather than kill them.''',
  secrets=[('Chicago’s captains', 'Capone of Chicago has quietly bought influence with some of the Don\'s captains.'),
           ('The pipeline', 'Whoever thinks to use the family\'s drug pipeline could leash every street gang in the city.')])

# ---------------------------------------------------------------- havens
E('h-gracis', t=1, icon='building', alias='A villa on the river',
  rumour='Gracis is said to live in a fine old house on the water north of downtown.',
  brief='''A fine 19th-century house on the riverbank north of downtown, the old north end of Kilbourntown. Gracis's haven since he ruled that town.''',
  full='''Quaint and respectable outside, gaudy modern plastic within. Mafia soldiers watch the street; the house has been attacked by Hrothulf's people more than once and has never fallen.''')

E('h-scott', t=2, icon='rose',
  brief='''Sir Edward Scott's small, elegant flat on the east side near the lake, in the thick of Union turf, where the Black Prince was always welcome. It stands empty now. Anarchs still leave empty bottles and flowers by the door.''',
  full='''It was his favourite of several homes. Nobody has dared claim it, and Jade Riley has not come to see it.''')

E('h-jason', t=0, icon='window', alias='A shabby tenement',
  brief='''A run-down little tenement in Walker's Point. Behind one drab door is a grand penthouse; guests are shocked when it opens. Jason's haven.''',
  full='''Petitioners who bring him questions about Council business are received here, one at a time, and always kept waiting until his watch says otherwise.''')

E('h-esau', t=0, icon='key', alias='An expensive condo',
  brief='''An expensive condominium just north of downtown, home of an old, hairy Malkavian called Esau.''',
  full='''From here Esau coaches Turk and the Union against the Blood Brothers. Turk calls him "the man".''',
  secrets=[('One mind', 'The condo and the Greendale mansion belong to the same Kindred. Esau is Jacob.')])

E('h-jacob', t=0, icon='building', alias='A mansion in Greendale',
  brief='''A distinguished mansion at the very edge of Kindred-controlled territory in Greendale, where a fatherly old Malkavian called Jacob receives anyone who has a grievance.''',
  full='''He gives very good advice. People who take it tend to end up fighting someone he says is his mad brother.''',
  secrets=[('One mind', 'Jacob and Esau are the same Kindred. Two homes, one mind, and a war that never ends.')])

E('h-parovich', t=2, icon='lock', shape='shield',
  brief='''The condemned 19th-century mansion of the Nosferatu traitor Parovich, among the decaying Highland Boulevard mansions of Concordia. After his exposure the Council searched it and boarded it up.''',
  full='''For years it was scheduled for demolition, and Parovich kept pulling strings to save it. Sabbat messengers came and went unnoticed. The search found letters to Guillem Velez, a map of the tunnels and an empty coffin. Raul, his last childe, still haunts the steps.''',
  secrets=[('Broken from inside', 'The passage that once linked the cellar to the Warrens was bricked up by the Council. The bricks have since been pushed out from the tunnel side.')])

E('h-anastasia', t=0, icon='raven', alias='A steam tunnel under a high school',
  brief='''A dry utility room in the steam tunnels under Washington High School, as far from the hissing electrical gear as possible. Anastasia lives here with a little zoo of stray cats.''',
  full='''She moves between empty cellars and storm drains. Kristian visits once a week and always brings her something nice.''')

E('h-kristian', t=0, icon='key', alias='A borrowed basement',
  brief='''The basement of a house in Lincoln Village owned by an elderly couple who can barely get around upstairs and never notice their guest. Kristian's haven.''',
  full='''From here he hid his brother and sisters from Parovich and plotted their sire's fall. Someone else got there first.''')

E('h-barth', t=1, icon='music', alias='Derik Dark’s apartment',
  rumour='Derik Dark lives somewhere in East Downtown. Half the Kindred in the city have his address; the other half have his frequency.',
  brief='''Barth's middle-class apartment in East Downtown. Every weeknight from 10 p.m. to 2 a.m. he broadcasts as "Derik Dark" on WBIT.''',
  full='''He fears the Union will try to diablerize him for his blood and has been asking around for bodyguards. Raul sleeps on his couch some days.''')

E('h-louis', t=1, icon='rose', alias='An elegant apartment by the cathedral',
  rumour='The Toreador sculptor lives near Cathedral Square. Neonates who are invited come back talking about the carpets.',
  brief='''Louis Detonas's spacious downtown apartment by Cathedral Square: rugs like grass, a chandelier like the stars, sculpture in every room.''',
  full='''He receives only those who dress properly. Toreador neonates come here to be noticed and leave feeling underdressed.''',
  secrets=[('He lied for Gracis', 'In the late Prince\'s last weeks, Louis told the Mask what Gracis wanted them to hear about Hrothulf.')])

E('h-victor', t=0, icon='lock', alias='A house among the Lake Drive mansions',
  brief='''One of Victor's hidden havens, among the Lake Drive mansions of Shorewood, just past the last Kindred patrol.''',
  full='''Victor kept several havens, all well hidden in very rich areas. After his death the Chapel cleaned out most of them, but not all.''',
  secrets=[('The safe', 'There are still Vienna papers in a safe here that the Chapel never found.')])

E('h-mortius', t=0, icon='candle', alias='A haunted house near Marquette',
  rumour='Mortals swear there is a haunted house near Marquette. Kindred who ask about it are told to stop asking.',
  brief='''A house near Marquette that mortals swear is haunted, and keep away from. Dr. Mortius, a Tremere scholar, lives here and does not like to be disturbed.''',
  full='''His ghoul retainers are skilled fighters and die often, defending him from the Lupine who prowl around the null zone.''',
  secrets=[('Haunted House', 'The haunting is a ritual the Tremere banned as a danger to the Masquerade. Mortius learned it before the ban.')])

E('h-hrothulf', t=1, icon='shield', alias='A house in the Outlands',
  rumour='Hrothulf lives alone somewhere past the Anubi line, and even the Lupine leave his house alone.',
  brief='''A modest two-storey suburban house solidly in the Outlands, in Elm Grove, its neighbours demolished for yard space. Hrothulf lives here alone.''',
  full='''The door is patched over bullet holes from Gracis's latest attack, and the basement vault is full of traps. The Lupine have learned to avoid it.''')

E('h-badr', t=1, icon='dagger', alias='A condo near UWM',
  rumour='Everyone knows someone who knows how to reach the Assamite. Nobody admits to knowing where she sleeps.',
  brief='''A small condominium near the University of Wisconsin–Milwaukee. Badr-al-Budur travels the Northwest on contracts but always returns here.''',
  full='''Anarchs hire her to kill Elders and Elders hire her to kill Anarchs. With the Prince dead, business is about to boom.''')

E('h-decker', t=1, icon='car', alias='A cheap motel near Good Hope',
  rumour='Decker keeps no haven. He sleeps wherever the patrol ends.',
  brief='''A cheap motel on 76th Street just below Good Hope Road, on the Anubi's own patrol line. Mark Decker sleeps in the windowless bathroom.''',
  full='''He keeps no regular haven, fearing the Lupine would find it. Julia Calvin sleeps beside him.''')

E('h-thomas', t=0, icon='window', alias='Borrowed bedrooms on the North Shore',
  brief='''Thomas Gerhieren sleeps in the homes of rich teenage girls from the Outlands high schools in Fox Point and River Hills, whenever their parents are travelling.''',
  full='''The girls think he is a runaway. He has never fed on any of them.''')

E('h-milo', t=1, icon='spiral', alias='The lakeshore drains',
  rumour='Milo says something woke in a drain down by the lake. Everyone has heard the story. Nobody has gone to look.',
  brief='''A storm outfall below the North Point bluff. Milo says this is where IT found him: something in a drain pipe that chased him and told him it would eat every Kindred in the city, one by one.''',
  full='''Milo never sleeps in the same place twice, but he keeps coming back here. On cold nights the pipe breathes.''',
  secrets=[('IT is real', 'Something really did follow Milo out of these drains. The dead would call it a Spectre.')])

# ---------------------------------------------------------------- the Barrens: neutral ground and hunting
E('parkcounty', t=2, icon='star',
  brief='''Milwaukee County Stadium, home of the Brewers. The crowds are big enough to hide enemies from one another, so fights here are rare. The Elders sit in the boxes; the Anarchs sit in the bleachers.''',
  full='''Lucina and Hrothulf both keep season box seats, and both pretend not to notice the other.''')

E('sprecher', t=2, icon='glass',
  brief='''Sprecher Brewery on West Oregon Street. After a good ball game the Blood Brothers party here until dawn, with their own music and sometimes their own lighting. The fermenting wort smells wonderful to the dead.''',
  full='''They know the night security guard, whom they have Dominated into submission, and practically walk in through the front gate.''')

E('zoo', t=2, icon='paw',
  brief='''The Milwaukee County Zoo at the I-45/I-94 interchange. Not officially Elysium, but the Kindred have agreed not to fight here. Even Elders come in the early hours, after the cleaning crews have gone, to see the animals and relax.''',
  full='''Anarchs dare each other to sample the blood of the most disgusting animals on offer (the water buffalo, for instance).''',
  calls=[('The custom', 'No fighting at the Zoo.', 'law')])

E('medical', t=2, icon='hospital',
  brief='''The Milwaukee Regional Medical Complex. Anarchs sneak into the refrigerated blood bank just after the nurses have drawn what the emergency room expects to need, and feast, giggling.''',
  full='''The danger that someone will come down to restock is half the fun.''',
  secrets=[('Upstairs', 'One of the Council keeps a haven in the upper office floors of the complex.')])

E('wmpark', t=2, icon='ankh',
  brief='''West Milwaukee Park: neutral ground. Kindred throw parties here and meet enemies here safely. On the rare nights the Elders must parley with the Anarchs, they do it here.''',
  full='''Several failed peace talks between Lucina and Akawa took place here, with Akawa hidden and speaking through one of the Blood Brothers. Ken Elliot's, Country Gardens and Grenadier's are close by, and Kindred sometimes sit in them for the sake of the view of the park.''',
  calls=[('The custom', 'Enemies may meet here safely.', 'law')])

E('southgate', t=2, icon='coin',
  brief='''The Southgate Shopping Mall, open until midnight on weekends and patrolled by a great deal of security. Elders shop here rather than rob closed shops; the Anarchs stay away.''',
  full='''The security is the result of strings the Elders have pulled to keep the mall free of riff-raff and Anarchs. Several very expensive shops survive almost entirely on Elder custom, and some Elders hold business meetings in the corridors.''')

E('hilton', t=2, icon='building',
  brief='''The Hilton by Mitchell airport. Visiting Kindred dignitaries and Camarilla officials are lodged here, supposedly because it has the finest rooms in town and makes departure easy.''',
  full='''Both reasons are lies. The Council knows the Anarchs might risk an attack on a visiting official downtown, and a guest out here is easier to watch. Nothing the Milwaukee Kindred want hidden is anywhere near the Hilton.''')

E('mitchell', t=2, icon='gate', shape='square',
  brief='''General Mitchell International: the city's real front door. Every road and railway passes through Lupine country, so most Kindred arrive by a short night flight. Council members meet visiting dignitaries here.''',
  full='''Gracis's spies log every arrival. Parovich's network did the same until his exposure; it is being checked and purged, and not all of its people have been found.''')

E('timmerman', t=2, icon='gate',
  brief='''Lawrence J. Timmerman Airport, on the far side of the city and dangerously close to the Outlands. Few Kindred use it, which means few watch it.''',
  full='''The Anarchs know it well and pick up friends and new allies here. Quietly, some Elders do the same.''')

E('amtrak', t=1, icon='train', alias='The railway depot',
  rumour='The trains run through Lupine country. Kindred who take them arrange something special first.',
  brief='''The Milwaukee Road depot. The railways are largely run by the Kindred of Chicago.''',
  full='''For money or a large favour, a sealed car will carry a Vampire through Lupine country unseen and unsmelled.''')

E('port', t=1, icon='anchor', alias='The harbour',
  rumour='Some Kindred come by ship. It is slow, but no wolf swims that far.',
  brief='''The Port of Milwaukee on Jones Island. Sea travel is safe from the Lupine but slow, and a Vampire must stay out of the sun for days.''',
  full='''Few use it, which makes it the cleverest way in. If Decker ever sealed the city, somebody else would have to watch the ports.''')

E('fair', t=2, icon='swords',
  brief='''State Fair Park, deep in Blood Brother country. Its empty grounds and barns make a quiet off-season rumble site.''',
  full='''The Brothers use the grandstand for initiations: a new member runs the track while the gang throws whatever comes to hand.''')

E('graceland', t=2, icon='grave',
  brief='''Graceland Cemetery, just south of Good Hope Road: one of the famous dueling grounds. In the early 1900s the Elders settled their quarrels here. Now the Anarchs fight their own duels here instead.''',
  full='''The Elders no longer dare come this far from downtown: the Anarchs might interfere. The Anarchs have taken the custom over and spend hours learning every headstone, so they will know the ground when their turn comes.''')

E('army', t=2, icon='badge', shape='diamond',
  brief='''The U.S. Army Reserve Center. Merik declared it off limits, and whoever rules next will probably keep it that way: the F.B.I. has run an operation from here for months.''',
  full='''Nobody knows whether the F.B.I. knows about Vampires, and nobody wants to help them find out. The base is not heavily secured, but it is a military base: fences, barbed wire and guards.''',
  calls=[('The Prince’s rule', 'Off limits. Stay away from the Reserve Center.', 'law')])

E('jungleman', t=2, icon='dagger', shape='diamond',
  brief='''A small dance bar on West Townsend Street beside Wanderers Rest Cemetery, owned by the ghoul Vrasks. Everyone knows what he sells: he will kill anybody, or so he says, for enough Kindred blood to keep himself immortal.''',
  full='''He also buys blood from Anarchs who are short of money. Where he came from and what he is doing in Milwaukee remain a mystery.''',
  secrets=[('His master', 'Vrasks\'s original master is still in the city and secretly backs him.')])

E('mountmary', t=1, icon='moon', alias='A small college in the north-west',
  rumour='Kindred avoid Mount Mary College. Nobody explains why.',
  brief='''Mount Mary College, a small college that does creditable work in the humanities. The Kindred avoid it: it is the source of a women's occult society called the Church of Isis.''',
  full='''The Church is a feminist order that wants to take the world back to the days before a patriarchal God. Its members worship nature, and seven or eight of them have real talent for witchcraft.''',
  secrets=[('Mortius’s dowsers', 'Dr. Mortius uses the Church\'s witches to search the city for the magical disturbance without risking himself. The other Tremere would be appalled.'),
           ('The Lupine connection', 'The order makes frequent trips into the wilds. Rumour ties it to the Lupine, and Mortius would very much like to know whether that is true.')])

E('brynwood', t=2, icon='claw',
  brief='''One of the largest country clubs along Good Hope Road. Its fairways and tree lines are perfect ambush cover for the Lupine.''',
  full='''The Anubi sweep the eleventh hole every night. They have still lost Kindred here.''')

E('tripoli', t=2, icon='claw',
  brief='''The other great country club on Good Hope Road. Anarchs "doing Good Hope" floor it past here.''',
  full='''Its clubhouse has been closed early every night since the summer; the members have been told it is about bears.''')

E('joanarc', t=1, icon='church', shape='octagon', alias='A small stone chapel at Marquette',
  rumour='There is a medieval chapel in the middle of Marquette. Thaumaturgists talk about it in the same breath as the null zone.',
  brief='''St. Joan of Arc Chapel, a 15th-century French chapel moved stone by stone to the Marquette campus in the 1960s. It stands at the heart of the null zone.''',
  full='''A mage had it moved to the centre of the zone so that he could study the anomaly. The Lupine killed him.''',
  secrets=[('Usla’s totems', 'Under the chapel lie the Talon of the Eagle and the Eye of the Coyote, the halves of two Lupine totems, stolen by the outcast Usla three centuries ago and reshaped as his own hand and left eye. Whoever recovers them becomes nearly unbeatable and is hunted by every Lupine alive.'),
           ('The Chapel’s ritual', 'The Tremere have placed four anchors around the city whose diagonals cross exactly over this chapel.')])

E('marquette', t=1, icon='eye', shape='hex', alias='Marquette University',
  rumour='Magic does not work at Marquette. Every Tremere in the city knows it, and some of them say so.',
  brief='''Marquette University, a few harmless cults and a "dead" zone for magic that covers nearly the whole campus and peaks around the central plaza. Thaumaturgy simply fails here.''',
  full='''It is not truly dead: there is too much magic here, and it drowns out spells. Several independent Kindred have discovered it as well as the Tremere, and most Kindred with an interest in Thaumaturgy know about it. Tremere, Lupine and Anarchs all prowl the campus.''',
  secrets=[('An Inquisitor on the faculty', 'A member of the Society of Leopold teaches here.')])

E('sinai', t=1, icon='hospital', alias='A hospital north of Marquette',
  brief='''Mount Sinai Medical Center. The null zone reaches north past the hospital.''',
  full='''Kindred who feed here at night find their Thaumaturgy failing on the south side of the building and working again on the north.''')

E('childrens', t=1, icon='hospital', alias='An old hospital on Wisconsin Avenue',
  brief='''The old Children's Hospital on Wisconsin Avenue, the western edge of the null zone.''',
  full='''The Tremere have mapped the zone's edge here street by street.''')

E('foresthome', t=2, icon='grave',
  brief='''Forest Home Cemetery, the grandest Victorian cemetery in the city: one of the dueling grounds of the Elder war of 1901–06, isolated enough that friends cannot hide nearby. The Graves, a minor Caitiff gang, haunt it.''',
  full='''The dueling grounds are scattered across the city, usually cemeteries where the police can be steered away. The Graves charge a toll to anyone who wants to use this one.''')

E('calvary', t=2, icon='grave',
  brief='''Calvary Cemetery on the hill above Bluemound Road, another dueling ground. Sir Edward Scott and Akawa nearly killed each other here more than once; Kindred laid bets on every bout.''',
  full='''Nobody ever collected. The Brothers hold a wake here for Scott on the first Friday of every month, and do not say whether it is for him or against him.''')

# ---------------------------------------------------------------- gangs
E('g-scorpions', t=2, icon='skull',
  brief='''Turf of the Scorpions, a dangerous and violent mortal gang next to Blood Brother territory. They jeer at strangers at red lights but will not attack unless provoked.''',
  full='''The Brothers feed on them now and then, and the Scorpions have started to notice that their missing members come home pale.''')

E('g-disp', t=1, icon='skull', alias='A Caitiff gang in the rail yards',
  brief='''The Dispossessed: two Caitiff and six mortals in the Menomonee Valley rail yards.''',
  full='''One of the minor Caitiff gangs that Gracis and Lucina, and Parovich before them, courted as a counterweight to Akawa. They took the money and did nothing.''')

E('g-dark', t=1, icon='skull', alias='A Caitiff crew on the south side',
  brief='''The Darkboys: one Caitiff, two ghouls and four mortals around Clarke Square on the near south side.''',
  full='''No threat to anyone yet. With Akawa gone, they have started talking as if they might become one.''')

E('g-war', t=1, icon='skull', alias='A Caitiff gang on Teutonia Avenue',
  brief='''The Warlords: one Vampire and four ghouls along Teutonia Avenue on the north side.''',
  full='''Their leader bought a charm from the tattoo parlour in Bay View before the invasion and has not taken it off since.''')

# ---------------------------------------------------------------- the Lupine seen from the city
E('lup-cave', t=0, icon='wolf', alias='A cave off Route 43',
  brief='''A cave with a three-foot entrance in the Milwaukee River ravines near Mequon, off a dark stretch of Route 43 north. The Mouse pack used it as a den.''',
  full='''This autumn the Mouse pack riddled a Kindred car with machine-gun fire on Route 43 and threw the survivors into this cave. Horatio's Coyote broke the Mouse pack's hold and let them go.''',
  secrets=[('The Justicar', 'At the back of the cave lay the fresh remains of the Justicar who should have come to investigate the Vampire Murders.')])

E('lup-coyote', t=0, icon='wolf', alias='Quarry country past Menomonee Falls',
  brief='''The quarry country past Menomonee Falls, where the Coyote pack gathers. Horatio Sims, its leader, takes human shape only to negotiate.''',
  full='''The pack is Red Talons, wolves to the bone, with exactly as much humanity as the job requires. Horatio plans even when he seems to be talking.''',
  secrets=[('What Horatio wants', 'All he needs is the Kindred distracted long enough to hold Marquette and dig.')])

E('lup-eagle', t=0, icon='wolf', alias='The Root River woods',
  brief='''The Root River woods of Franklin, where the Eagle pack stages its raids on the city, roughly once a week.''',
  full='''The pack is almost entirely Wendigo. If the Anubi falter even once, the Eagle will push into the inner city; three or four would get through and die there, but Kindred losses would be severe. This autumn the blighted woods keep them home.''',
  secrets=[('Seven Fires', 'The pack has kin among the city\'s Native Americans and secretly owns the Seven Fires casino.')])

E('lup-usla', t=0, icon='wolf', alias='A spot on the lakeshore',
  brief='''The lakeshore where, the Lupine say, the dying Usla crawled into Lake Michigan three centuries ago and was never seen again.''',
  full='''Lupines have converged on the area ever since without knowing why.''')

# ---------------------------------------------------------------- history
E('hist-1674', t=1, icon='hour', alias='Where the rivers meet (1674)',
  rumour='Kindred history in Milwaukee is older than the city. Elders say it began with the Jesuits.',
  brief='''Manhanawaukee-Seepe, the tribal gathering place where the rivers meet. In 1674 Père Marquette's party camped here.''',
  full='''Among them was a scout called Petre Dubois, who vanished every dawn and married into the Chippewa.''',
  secrets=[('Petre Dubois', 'Petre Dubois was Hrothulf. He later Embraced his Chippewa wife, Chiclena, and her war against the Menominee brought the outcast Lupine Usla here.')])

E('hist-juneau', t=2, icon='hour',
  brief='''Juneautown, Solomon Juneau's settlement east of the river, founded in 1818. Hrothulf moved in early, dominated its leaders and became its Prince.''',
  full='''He drew French Kindred down from Canada, and for a decade or two Juneautown was the most civilised Kindred settlement west of Detroit.''')

E('hist-kilbourn', t=2, icon='hour',
  brief='''Kilbourntown, Byron Kilbourn's town west of the river, founded in 1834, already had a Prince: Gracis Nostinus, Hrothulf's blood-brother and sworn enemy.''',
  full='''Their war of assassins left almost every other Kindred in the area dead by 1840. Kilbourntown once aimed a loaded cannon across the river at Juneautown, though it never fired. In 1845 Gracis staged the riot that brought the bridges down, and a Nosferatu Justicar finally forced a truce.''')

E('hist-1900', t=2, icon='hour',
  brief='''New Year's Eve, 1900: the night the Lupine got into the city. Prince Erik Pointene died defending his palace, and Terence Merik led the counter-attack that saved Kindred Milwaukee and made his name.''',
  full='''How the border watch failed has never been explained. Mark Decker had warned the Council beforehand. The palace site has been lost; this marker is symbolic.''',
  secrets=[('Who opened the border', 'Some of the old Anubi believe someone inside the city let the watch fail on purpose. They have never been able to prove whom it served.')])

# ---------------------------------------------------------------- Psychomachia (1991): the Prince's fall
E('ps-house', t=1, icon='flame', alias='A burned house above the Menomonee',
  rumour='The Prince died when his house on a hill above the river burned. The fire trucks took their time.',
  brief='''The ruins of Terence Merik's hilltop house on the bluffs above the Menomonee River Parkway, at the very edge of the Outlands. The Prince met his Final Death here when it burned this October.''',
  full='''The house had a basement dungeon. A police lieutenant was held there and walked out of the fire alive.''',
  secrets=[('The dungeon', 'Merik drugged and chained the Mask in the dungeon here, and held Lieutenant Wilks as well. The Mask destroyed him in the burning house, and Wilks ran to meet the fire trucks and kept his silence.')])

E('ps-roof', t=0, icon='flame', alias='A burnt-out hotel on the lake',
  brief='''An abandoned lakeside hotel on the Bay View shore, gutted by fire years ago: fish wallpaper and carved dolphins.''',
  full='''This autumn the Inquisitor Lisa Urgen trapped a group of Kindred on its roof with a flamethrower and ten minutes until sunrise. They got away.''')

E('ps-lot', t=0, icon='swords', alias='An abandoned factory lot',
  brief='''A lot behind an abandoned factory in the Menomonee Valley, where the Union ambushed the Blood Brothers this autumn: motorcycle jousts among broken glass.''',
  full='''The Union struck on the Prince's orders, though none of them could tell you so.''',
  secrets=[('Dominated', 'The Union had been under Merik\'s Domination and Blood Bond for years.')])

E('ps-scene', t=2, icon='drop',
  brief='''Near Brady Street, where one of the "Vampire Murderer" victims was found this autumn. The Journal put four drained bodies on its front page, and the Masquerade has not recovered.''',
  full='''The killings stopped when the Prince died. The Council's story is that a rogue Kindred was responsible and that the matter has been settled.''',
  secrets=[('The killer', 'The Vampire Murderer was Prince Merik himself.'),
           ('A watcher', 'At one of the scenes a Lupine was seen slipping away to report to the Union.')])

# ---------------------------------------------------------------- fae in the waking city (hidden at the start)
E('f-hearth', t=0, icon='cup', alias='An alterations shop near Mitchell Street',
  brief='''A rented storefront near Mitchell Street where Marta takes in alterations and cooks community suppers: a cluttered tailoring counter with a back kitchen.''',
  full='''Most months the Spare Chair Supper is held here. The absentee landlord is weighing a better-paying tenant; he is an ordinary man, not anyone's pawn.''',
  secrets=[('The Last Hearth', 'This is the waking face of the Last Hearth, the changeling freehold of the city.')])

E('f-counter', t=0, icon='bridge', alias='The Juneau Avenue bridge',
  brief='''The Juneau Avenue bascule bridge, on the old Chestnut Street site where the bridges came down in 1845. City bridge tenders do their ordinary work here.''',
  full='''A troll called Oren Voss keeps a small private refuge beside the machinery.''',
  secrets=[('The Counterweight', 'Oren\'s refuge is the Counterweight, a changeling freehold whose road still demands a white flag.')])

E('f-shop', t=0, icon='gear', alias='A repair shop in the Menomonee Valley',
  brief='''A rented repair bay in the Menomonee Valley: audio gear and industrial controls on the benches, a tram prototype under a tarp, and a brass dog that is not his. Leon Mercer works here.''',
  full='''It counts as a place of power only while people are inventing in it. It is not a freehold.''')

E('f-hall', t=0, icon='music', alias='A practice hall in Riverwest',
  brief='''A neighbourhood hall in Riverwest with folding chairs, a piano missing two keys and the best acoustics Nina Salazar can afford.''',
  full='''She has cancelled two rehearsals here since the applause started continuing after the room emptied.''')

E('f-pabst', t=0, icon='building', alias='100 East Wisconsin',
  brief='''A new office tower, finished in 1989, where the Pabst Building rose over the old city from 1891 to 1981. There are no ruins here.''',
  full='''Everything that survived of the Hall of the Copper Hart survives only in the Dreaming, where the Unbuilt Stair still begins.''')

E('f-domes', t=1, icon='tree', alias='The Mitchell Park Domes',
  rumour='The three glass domes in Mitchell Park hold a jungle, a desert and a garden. Kindred like them in winter.',
  brief='''The Mitchell Park Domes: three glass domes holding a rain forest, a desert and a seasonal show garden through the Wisconsin winter.''',
  full='''One of the gardeners, Arthur Saye, draws impossible gardens on the backs of discarded forms.''',
  secrets=[('The Glass Orchard', 'The Domes anchor the Glass Orchard, a realm of the Dreaming.')])

E('f-celia', t=0, icon='music', alias='A rented room on the Lower East Side',
  brief='''A second-floor room on the Lower East Side with a music stand, a patched coat on the door and a letter to a sponsor that never gets posted. Celia Ashdown gives beginner cello lessons here.''',
  full='''The rent comes out of the last of her savings.''')

E('f-ruth', t=0, icon='map', alias='A kitchen table in Sherman Park',
  brief='''Ruth Bell's kitchen in Sherman Park: bus schedules under a glass tabletop, a road atlas worn soft, coffee for anyone who wants to argue about the best way to a real destination.''',
  full='''She runs courier and driving jobs from the phone on the wall.''')

E('f-kit', t=0, icon='coin', alias='Junk shops on Kinnickinnic Avenue',
  brief='''Secondhand stores and Saturday tables on Kinnickinnic Avenue, where abandoned futures are sold cheap: an instrument after two bad lessons, a half-sewn costume, a child's outdated map.''',
  full='''Kit Navarro's bicycle is usually chained outside, freshly repaired by Oren.''')

E('f-bjorn', t=0, icon='anchor', alias='The Inner Harbor docks',
  brief='''Irregular dock work and repairs on the Inner Harbor. Bjorn Halvorsen keeps a locker here.''',
  full='''In the locker, wrapped in a fisherman's sweater, is the only working scale-light lantern anyone in the city knows of.''')

E('f-ivory', t=0, icon='book', alias='A north-side high school',
  brief='''A north-side public high school: bells, hall passes and assignments with a comprehensible end. A grumpy girl called Ivory sits in the back row.''',
  full='''She dislikes the place and leans on its routine to stay steady.''',
  secrets=[('The last overseer', 'None of her classmates suspects that the girl in the back row is the last overseer of the Michigan Pocket.')])

E('f-lola', t=0, icon='book2', alias='An apartment full of playbills',
  brief='''Lola Wendt's apartment: playbills, newsletters and a leaking basement. Right now she mostly needs boxes and two people with a car.''',
  full='''She holds a duplicated 1980 supper invitation that puts two supposedly unrelated incidents on the same night.''')

E('f-eddie', t=0, icon='candle', alias='The back room of a bowling alley',
  brief='''The back room of a south-side bowling alley, where Eddie Rusk's amateur ghost club investigates hauntings over pitchers of beer.''',
  full='''A newer member has started publishing names and addresses without consent, and Eddie has to choose between the club and the people it says it protects.''')

E('f-warren', t=0, icon='door', alias='A service door under the Wisconsin Avenue bridge',
  brief='''A service door under the Wisconsin Avenue bridge that leads into the old Nosferatu warrens. Nobody forces it.''',
  full='''Being seen here exposes someone's movements. It does not give the observer a road anywhere else.''',
  secrets=[('The arrangement', 'The sluagh and the Nosferatu once shared the work of the Michigan Pocket. That ended when Parovich went over to the Sabbat; Ivory\'s arrangement with individual Nosferatu may now be no bigger than this door staying unforced.')])

# ---------------------------------------------------------------- the chronicle's own places
E('c-jade-floor', t=2, icon='building', shape='shield',
  brief='''The new Brujah Primogen's official haven: the entire twentieth floor of a glass tower on East Michigan Street. Everyone knows the address; that is the point.''',
  full='''It was bought through a shell company of her grandsire's. A library, a gym and a reception hall where nobody has yet been received. The lights go on and off every evening.''',
  secrets=[('Timers', 'The floor is empty. The lights run on timers. Jade Riley has not slept here since the fight at the fish plant.')])

E('c-macy-house', t=0, icon='key', alias='A blue house in Wauwatosa',
  brief='''A small suburban house in Wauwatosa with peeling blue paint, bought with Macy Carver's trust fund: protest posters, stacks of zines, a windowless basement behind a reinforced door.''',
  full='''The house is inside the Anubi patrol zone.''',
  secrets=[('Jade sleeps here', 'This is where the Brujah Primogen really sleeps. Decker knows exactly who is staying here.')])

E('c-rusty', t=2, icon='music',
  brief='''A cramped Riverwest basement club: sticky floor, a home-built stage and the best sound in town. Jamie Robinson's band, the Rust Saints, plays here.''',
  full='''Union Anarchs and Blood Brothers come to the same shows and pretend not to see each other. Macy Carver finds half her counterculture contacts in the crowd.''',
  calls=[('The custom', 'Nobody starts anything during the set.', 'law')])

E('c-gas-lot', t=0, icon='car', alias='An empty lot on Highway 41',
  brief='''An empty pad on Highway 41 where the Robinson family's gas station stood for thirty years, until it was condemned for a widening. One morning the demolition crew found no foundations, no pumps and no fuel stains.''',
  full='''Jamie Robinson grew up here.''',
  secrets=[('Where it went', 'Ivory carried the station off to the Michigan Pocket. Jamie knows where it went and does not know how he feels about it.')])

E('c-chapel', t=2, icon='tower', shape='hex',
  brief='''The Chapel: the Tremere chantry in an old beer baron's mansion on Highland Boulevard ("Sauerkraut Boulevard"), a few blocks west of the edge of the null zone. No Tremere comes to Milwaukee without Vienna's leave.''',
  full='''The chantry's researchers work and sleep here. Since Victor's death this autumn the link to Vienna is a formality, and the Chapel draws on unorthodox resources more freely every week. Luke Newman runs its security for now and keeps a visitors' log.''',
  secrets=[('Who really runs it', 'Carna heads the Tremere on paper. In practice Dr. Mortius sets the Chapel\'s work.')])

E('c-victor-death', t=1, icon='skull', alias='The Chapel’s sealed wing',
  rumour='Somebody died inside the Chapel this autumn. The Tremere are not discussing it.',
  brief='''The east wing of the Chapel, sealed since Victor, Vienna's watchdog in Milwaukee, was killed in his own laboratory this autumn.''',
  full='''A Lupine of the Mouse pack, already twisted by the Wyrm, walked through the wards as if they were not there. Newman has rebuilt the defences and will not say what let the creature in.''',
  secrets=[('From inside', 'The wards were weakened from inside. Jesselin found a way in through Haberman\'s social correspondence and slipped Drake the "key".')])

E('c-isis', t=0, icon='ankh', alias='An incense shop on Brady Street',
  brief='''Above an incense shop on Brady Street: a room with blue walls, sistrums and a copy of Isis nursing Horus. To its congregation it is a neo-Egyptian fellowship with Thursday meditations.''',
  full='''This is the city temple of the Church of Isis. Its inner circle drinks blood and keeps the Chapel's secrets.''',
  secrets=[('Ghouls', 'Two of the inner circle, Kayla and Arianna, are ghouls. Kayla serves Jade Riley and Dr. Mortius at once.')])

E('c-uwm', t=2, icon='book',
  brief='''The University of Wisconsin–Milwaukee campus in the city's north-east corner. Students, late lectures and a lot of easy vessels.''',
  full='''An Egyptology student called Arianna runs between lectures and somewhere she does not discuss. One floor down, in the archaeology department, teaches a professor with burn scars on his hands.''',
  secrets=[('Doctor Fire', 'The archaeology professor is "Doctor Fire", the brains of a small group of vampire hunters.')])

E('c-711', t=0, icon='coin', alias='A weedy corner lot',
  brief='''A weedy lot at Wisconsin Avenue and 25th Street that looks untouched for decades. There was a 7-Eleven here. Probably.''',
  full='''A former night clerk comes back here every night without knowing why, a couple of cab drivers have an address in their logs that does not exist, and a soda distributor keeps billing a customer nobody can find.''',
  secrets=[('What happened', 'Annalena stopped here while fleeing the Gloaming Keep, and that was the last thing that ever happened to the store. The Mists wiped it from nearly everyone\'s memory.')])

E('c-warehouses', t=1, icon='warehouse', alias='Railside warehouses in Cudahy',
  rumour='The Sabbat came up through Cudahy. Nobody goes into the railside warehouses now.',
  brief='''Rusting sheds between the railway and the meatpacking plant in Cudahy. During the invasion the Sabbat's creatures came out of here, and the Camarilla has guarded the place ever since.''',
  full='''Dragos Dalca kept his workshops here. Behind Warehouse No. 7 a ramp wide enough for a truck leads down into the underground, hidden by little more than a wall. The Council has put a grate and two ghouls on it.''')

E('c-breach1', t=2, icon='bat', shape='marker',
  brief='''Masquerade breach No. 1. A late-news crew filming a car crash on Kinnickinnic Avenue caught something huge, winged and scaled chasing three running figures over the rooftops. The tape aired once.''',
  full='''The Nosferatu and Gracis's people are still hunting down copies. "The Milwaukee Dragon" has become an urban legend and a talk-radio staple. The thing on the tape was Dragos Dalca, the Sabbat's Tzimisce elder.''')

E('c-breach2', t=2, icon='flame', shape='marker',
  brief='''Masquerade breach No. 2: Lakeside Fish Processing. In front of hundreds of witnesses on the neighbouring piers, the Camarilla fought the Sabbat's creatures here, and Jade Riley killed the Sabbat's dragon, Dragos Dalca, with her bare hands. Officially, an ammonia explosion.''',
  full='''Dragos took his raw material here: off the conveyors, and from the homeless his servants trucked in from under the viaducts. The plant is closed and still cordoned off. Pieces of things that were neither fish nor human were found in the wreckage.''')

E('c-viaduct', t=1, icon='bridge', alias='A camp under the viaduct',
  rumour='The homeless under the viaduct say people were taken all autumn. Nobody listened.',
  brief='''Tents and barrel fires under the freeway viaduct. All autumn people vanished from here, two or three at a time, and nobody cared except the homeless themselves.''',
  full='''They were taken to the fish plant. Some came back in a form nobody here talks about.''')

E('c-guillem-church', t=1, icon='church', alias='A closed church in Walker’s Point',
  rumour='The Camarilla raided a church in Walker\'s Point during the invasion and found it empty.',
  brief='''St. Jude's, a boarded-up church in Walker's Point. The Sabbat commander Guillem Velez ran the infiltration from here: city maps on the sacristy walls, the stains of a Vaulderie on the altar.''',
  full='''The Camarilla found it empty. Velez left a day before the raid.''',
  secrets=[('Someone warned him', 'Velez was warned of the raid. The warning came from someone on the Camarilla side.')])

E('c-guillem-boat', t=0, icon='anchor', alias='A yacht in the McKinley marina',
  brief='''A decommissioned yacht under a borrowed name, the Santa Eulàlia, at the McKinley moorings. The hold is blacked out and the portholes painted over from inside.''',
  full='''Guillem Velez sleeps here some days. He never spends more than two days running anywhere.''')

E('c-maximus-shop', t=1, icon='bolt', alias='A tattoo parlour in Bay View',
  rumour='Half the Caitiff in the city wore a charm from a Bay View tattoo shop before the invasion. The shop is shut and the tattooist is gone.',
  brief='''Charms & Needles, Maximus McKenzie's tattoo parlour in Bay View, with a shelf of amulets in the window. Through the back door he sold Union Caitiff and Anarchs cheap blood-magic charms: wards, silencers, "luck in a fight".''',
  full='''The shop is shut and the sign is gone. Maximus vanished when the Sabbat invasion failed, and the Council would like a word. Some of his charms are still around their owners' necks.''',
  secrets=[('Sabbat blood', 'Every piece was made with Sabbat blood and tied its owner to Maximus a little. He was a Tremere of House Goratrix.')])

E('c-jesselin', t=1, icon='key', alias='The Pfister Hotel',
  rumour='The Pfister is the city\'s oldest grand hotel. Its top floor has a new long-term guest.',
  brief='''The Pfister, the city's oldest grand hotel. A new patroness of the opera, "Miss Lascelles", keeps a suite on the top floor and lunches with a city councilman's wife.''',
  full='''She is never seen at lunch itself, only at the coffee afterwards.''',
  secrets=[('Jesselin', '"Miss Lascelles" is Jesselin, a sorceress of House Goratrix, the Sabbat\'s Tremere. A copper scrying bowl stands in her bathroom and a mirror draped in black velvet in her wardrobe.')])

E('c-ethan', t=0, icon='tower', alias='A grain elevator in the valley',
  brief='''A concrete grain elevator above the Menomonee Valley. From the roof there is a clear shot over half of Blood Brother turf.''',
  full='''Ethan Stone keeps his bows and bundles of arrows here and sleeps in an empty grain bin.''')

E('c-dominique', t=1, icon='flame', alias='A flat in Riverwest',
  rumour='A Kindred who went to check on a Blood Brothers errand-boy in Riverwest did not come back.',
  brief='''The fourth floor of a shabby public housing block in Riverwest. A Camarilla vampire died in this kitchen, burned down by a kid called Dominique with a lighter and a can of air freshener.''',
  full='''There is still a black scorch on the kitchen ceiling. The neighbours think a frying pan exploded.''')

E('c-gunther', t=1, icon='anchor', alias='A boathouse above the dam',
  rumour='An old Gangrel lives on the river above the North Avenue dam. He was here before the city had a name.',
  brief='''An old boathouse on the pond above the North Avenue dam: upturned boats, nets and the smell of pipe smoke and wet fur. Gunther has lived on this water since the city was Kilbourntown.''',
  full='''Merik granted him the river in the 1930s. Nobody has had the nerve to ask whether the grant died with the Prince.''',
  secrets=[('A visitor', 'Sometimes Mercer comes here: the last Garou of the Mouse pack.')])

E('c-soraya', t=0, icon='candle', alias='A house that isn’t there',
  brief='''A large old manor of chimneys, gables and ivy on Yankee Hill, a few blocks from downtown, on a spot no city map shows. Passers-by turn aside before they reach the wall and do not remember turning.''',
  full='''There is no electricity, gas or water; at night the windows burn with candles. The Kiasyd Soraya lives here with her mad sire.''',
  secrets=[('Sideways', 'A rare marriage of Dominate and Umbral mysticism folds the house a few blocks "sideways" from the street.')])

E('c-hunters', t=0, icon='gun', shape='diamond', alias='A garage in West Allis',
  brief='''A two-bay garage in West Allis: Wolfgang's auto repair. Oil, invoices, a radio playing polka.''',
  full='''Under a false floor in the inspection pit: stakes, jugs of gasoline, a crossbow, two Scandinavian-forged swords and a crate of Doctor Fire's books. Pinned over the invoices is a map of the city's havens, wrong in places and right in the worst ones.''',
  secrets=[('A well-wisher', 'Sometimes someone leaves a dried flower on a car hood, or a child\'s drawing with a hint in it. The hunters think they have a secret well-wisher. They are right: Ivory helps them.')])

E('c-casino', t=0, icon='coin', alias='A bingo hall on the south side',
  brief='''Seven Fires Bingo & Casino: a loud hall of bingo and slot machines on the south side. The owners of record are Native American families of the city.''',
  full='''The casino pays for lawyers and land and buys influence with community councils.''',
  secrets=[('The real owner', 'The Eagle pack of Lupines owns it. It gives the Wendigo a place to meet people without leaving their own.')])

E('c-mercer', t=0, icon='bolt', alias='A telephone exchange',
  brief='''A brick telephone-company building full of switching frames. A night technician called Mercer works here.''',
  full='''He listens to the city down the wires.''',
  secrets=[('The last Mouse', 'Mercer is the last Garou of the Mouse pack.')])

E('c-blight', t=0, icon='skull', alias='Dying groves in the Root River woods',
  brief='''Old groves in the Root River woods where the undergrowth is dying and the creeks smell of copper.''',
  full='''Things crawl up out of the ground here at night. The Eagle pack of Lupines fights them every night, which is why it was not watching the city when the Sabbat came in.''',
  secrets=[('Who poisoned them', 'Maximus McKenzie and Jesselin of House Goratrix poisoned these places of power with blood magic, so that Banes would keep the Lupine busy.')])

E('c-anchor-e', t=0, icon='tower', alias='The North Point Water Tower',
  brief='''The Gothic North Point Water Tower of 1873 on the Lake Park bluff.''',
  full='''Inside the shaft, ringed around the standpipe under the lamp-room, someone has mounted a coil of copper antennae.''',
  secrets=[('Anchor East', 'It is one of the four anchors of the Chapel\'s ritual. The tower holds water, water holds reflections, and the lake is the biggest mirror in the city: this anchor "looks" at the null zone through water.'),
           ('Truce ground', 'The tower stands on the ground of the Lake Park Truce. The Lupine would call this a provocation.')])

E('c-anchor-s', t=0, icon='tower', alias='The Hotel Warszawa',
  brief='''A tired old hotel on Lincoln Avenue in the Polish district, with a neon crown on its roof and a new TV aerial beside it.''',
  full='''From the roof you can see the dome of St. Josaphat's, built from another city's stones, and the Allen-Bradley clock the neighbourhood calls the Polish Moon.''',
  secrets=[('Anchor South', 'The "TV aerial" is one of the four anchors of the Chapel\'s ritual. It draws on the "reassembled" holiness of the basilica and on a clock that tells its own time.')])

E('c-anchor-w', t=0, icon='tree', alias='A mound in the Root River woods',
  brief='''A slumped mound in a clearing among old oaks deep in the Root River parkway, on no survey.''',
  full='''A tripod wrapped in willow withies stands on top of it.''',
  secrets=[('Anchor West', 'One of the four anchors of the Chapel\'s ritual. The Lupine would call it a sacrilege, and they fight Banes a few miles south of it every night. The mound remembers the people who lived here before the city, and perhaps it remembers Usla.')])

E('c-anchor-n', t=0, icon='bolt', alias='A relay mast above Lincoln Creek',
  brief='''An abandoned radio relay mast over the Lincoln Creek parkway on the north side.''',
  full='''Someone has hung a new copper-wound antenna at the top.''',
  secrets=[('Anchor North', 'One of the four anchors of the Chapel\'s ritual. The creek has refused to die, buried in culverts and resurfacing again and again, and the anchor borrows that stubbornness to keep the ring from collapsing.')])

E('c-ritual-core', t=0, icon='target', shape='octagon', alias='Over the Marquette campus',
  brief='''The point over the Marquette campus where the diagonals of four distant antennae cross: St. Joan of Arc Chapel.''',
  full='''When all four anchors are tuned, the Chapel's ritual should "turn the null zone inside out" and show what keeps it dead. The Tremere think they will find a source.''',
  secrets=[('Two totems', 'The Tremere do not know that halves of two Lupine totems lie under the chapel. The ritual will wake the Coyote and the Eagle at the same moment.')])
