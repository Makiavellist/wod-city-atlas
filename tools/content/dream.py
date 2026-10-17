from lib import E

# Everything fae is hidden from the players at the start (t=0). The tiers still matter once the
# Storyteller reveals the Dreaming: Existence shows the mortal cover, Basic what any visitor learns,
# Full what the community knows, and secrets are the things people hide from each other.

# ---------------------------------------------------------------- the nine
E('marta', t=0, alias='A seamstress near Mitchell Street',
  rumour='A woman who does alterations near Mitchell Street cooks a supper for anyone who turns up once a month.',
  brief='''Marta Kaczmarek, a boggan, keeps the Last Hearth: a rented alterations shop near Mitchell Street that becomes, in the Dreaming, a long brick bakehouse with a copper stove. Once a month she hosts the Spare Chair Supper, with an empty chair for anyone not yet found.''',
  full='''Her Glamour comes from people making something useful together and recognising each other's skill: the teenager who learns a difficult seam sustains her longer than a roomful of satisfied diners. She survived 1981 because she had gone back for a mortal kitchen helper. She remembers the old court kindly until anyone suggests restoring its privileges.

Her authority is only that people accept a room she keeps warm is hers to govern. She likes Celia and will defend her from mockery, and rejects every proposal for a standing council. Nina brings young performers to her suppers; Oren distrusts the strangers Nina invites.''',
  calls=[('Wants now', 'Enough rent money and helpers to keep the storefront through winter. The absentee landlord is weighing a better-paying tenant; he is an ordinary man.')],
  secrets=[('The weak fire', 'The Hearth\'s balefire falters when Marta tries to do every task herself, and she has been hiding how weak it is. She fears everyone will leave if refuge starts to sound conditional.'),
           ('What she wants', 'Her old guilt: she wants rest more than another heroic responsibility.')],
  st=[('Playing her', 'Interrupt an argument to put food in someone\'s hand, then return to it exactly where it stopped. "You may be right. You still have to dry the dishes."')])

E('leon', t=0, alias='A repairman in the Menomonee Valley',
  rumour='There is a repairman in the valley who can make anything run, including things that shouldn\'t.',
  brief='''Leon Mercer, a nocker, repairs audio gear and industrial controls in a rented bay in the Menomonee Valley. His Chrysalis came in 1988 while he was getting a "useless" machine to run. He is building a tram.''',
  full='''He finds Glamour in stubborn, inventive problem-solving; repetitive work exhausts him. He wants to restore a short, reliable stretch of the old chimerical street railway, so that a childling never has to beg an elder for permission to visit a friend across town. His workshop becomes the Third Shift in the Dreaming, a place of power only while people are inventing.

Celia sees public transport as a way to rebuild civic trust; Ruth insists one successful trip proves nothing. Both are right about different risks, which irritates him.''',
  calls=[('Wants now', 'A stable test route, Oren\'s permission to use the Counterweight as one terminus, and a patron who will not claim the finished line.')],
  secrets=[('The shard', 'His prototype works because it contains a shard of the Glass of the Second Door, the treasure the Ravnos used in 1981. He bought it as salvage without knowing what it was.'),
           ('Passengers he cannot see', 'The tram\'s bell sometimes rings for passengers nobody can see. He has stopped carrying passengers, but will not give up the machine before he understands it.')],
  st=[('Playing him', 'Relentless technical detail, then unexpected patience with beginners. "No, it isn\'t temperamental. It is doing exactly the wrong thing every time."')])

E('ruth', t=0, alias='A courier with a road atlas',
  rumour='There is a courier in Sherman Park who will drive anyone anywhere, as long as they can tell her why.',
  brief='''Ruth Bell, an eshu, works irregular courier and driving jobs from a kitchen table in Sherman Park. She knows more of the city's Dreaming roads than anyone, and gives map lessons to anyone willing to argue about the best route to a real destination.''',
  full='''She earns Glamour by helping people make journeys that matter to them: an audition, a reunion, a first trip alone. She cannot simply be wherever she is needed, and she does not guarantee happy endings. Her maps describe conditions, witnesses and dependable exits. The old road toward Chicago now ends at a station where every departing train carries the name of someone who abandoned Milwaukee.

Oren trusts her judgement on roads and resents her refusal to discuss the last retreat.''',
  calls=[('Wants now', 'To reopen one trustworthy outward trod, so that the city\'s fae can travel without choosing between total dependence and leaving their magical lives behind.')],
  secrets=[('The voices', 'In 1981 Ruth cut the Copper Hart\'s return route to stop a false-door incursion. There were voices calling beyond it. She believes everyone she heard died, and she has never told Marta.')],
  st=[('Playing her', 'Ask what someone plans to do on arrival before naming the fare. "Getting out is a direction. Where are you going?"')])

E('oren', t=0, alias='A bridge maintenance man',
  rumour='One of the bridge maintenance men on the river works nights nobody scheduled.',
  brief='''Oren Voss, a troll, keeps the Counterweight: a small refuge beside the machinery of the Juneau Avenue bascule bridge, which in the Dreaming is a stone gatehouse hung on chains over a channel full of discarded destinations. He was the Copper Hart's dependable defender, never its commander.''',
  full='''In 1981 he held the retreat long enough for Ruth and Marta to get out. He draws Glamour from people keeping difficult commitments, especially commitments nobody is watching, and has no patience for spectacular vows that replace practical preparation. Kit is the one local who makes him laugh, and also keeps bringing uninvited passengers.''',
  calls=[('Wants now', 'To repair the dream-bridge\'s counterweight before the autumn storms turn a manageable defect into a closed route.')],
  secrets=[('His oath', 'His oath is to provide a return passage for anyone he personally admits. He has stretched it into a duty to save all Milwaukee, which is his own reading, and it makes him slow to welcome strangers.')],
  st=[('Playing him', 'Offer practical help before affection. "I cannot promise that" is an act of respect.')])

E('celia', t=0, alias='A cello teacher on the Lower East Side',
  brief='''Celia Ashdown, a sidhe of House Gwydion, teaches beginner cello lessons and patches her own secondhand coats. She arrived in 1989 with a credible but unenforceable claim to oversee the properties of the old Copper Hart, and found people exhausted by titles.''',
  full='''She draws Glamour from ensembles learning to listen to one another. She sincerely believes institutions can protect weak people from arbitrary favours, and finds it hard to see how her own inherited assumptions make them arbitrary. Marta likes her; Nina suspects her; Leon wants it in writing that no restored lord will own his tram, and Celia is beginning to think that is reasonable.''',
  calls=[('Wants now', 'To relight one chamber of the Crownless Ward, the Hall of Borrowed Voices, as a public rehearsal and meeting hall open to every kith and allegiance.')],
  secrets=[('The list', 'Her sponsor outside Milwaukee will advance resources only if she sends a list of the local residents and their sworn obligations. She keeps not sending it, and is paying rent with the last of her savings.'),
           ('The petition', 'She once drafted a private petition to the absent dragon of the Far Guest\'s Seat, asking it to take responsibility for the city. She never sent it. The mountain has it anyway.')],
  st=[('Playing her', 'Formal until someone asks a practical question she can answer. "Yes, I know the proper ceremony. We could also start by repairing the roof."')])

E('kit', t=0, alias='A bicycle courier with too many keys',
  brief='''Kit Navarro, a raccoon pooka, is a seventeen-year-old bicycle courier and flea-market regular with a patched jacket and an inexhaustible supply of useless keys. Chrysalis in 1990.''',
  full='''Kit collects the futures people abandon casually (an instrument sold after two bad lessons, an unfinished costume, a child's outdated map) and gains Glamour when someone unexpectedly uses one again. Nina finds them paid work; Oren quietly repairs their bicycle; Kit finds the cast-off parts Leon needs and always understates the trouble.''',
  calls=[('Wants now', 'To get a bag of mislaid objects back from the Unfinished Index before it is classified as a permanent acquisition. It holds a living chimerical mouse Kit promised to return to a child.')],
  secrets=[('Custodian, not owner', 'Kit\'s claim ticket for a blue-lit room in the Crownless Ward names them custodian, not owner. They pretend not to understand the difference, because ownership sounds like finally having a place nobody can take away.')],
  st=[('Playing them', 'Indirect truths and flamboyantly implausible denials. A bad lie is often a plea to be asked a kinder question.')])

E('nina', t=0, alias='A percussionist in Riverwest',
  brief='''Nina Salazar, a satyr, is a percussionist and part-time waitress who plays small Milwaukee venues and community events. Her Chrysalis came in 1987 during a disastrous show the audience saved by joining in.''',
  full='''Her Glamour comes from a crowd that stops being an audience and becomes collaborators. She is very good with shy amateurs, and believes the survivors sometimes confuse safety with giving up. She and Celia argue about whose name goes on the invitation, then spend hours arranging the same song.''',
  calls=[('Wants now', 'A public neighbourhood performance before winter, with Celia\'s musicians, Leon\'s repaired sound equipment and the people Marta has brought together.')],
  secrets=[('The Encore', 'A chimera called the Encore answers to her music and will not let a good night end. She dismissed the first warning as nerves and has now cancelled two rehearsals trying to understand it.')],
  st=[('Playing her', 'Generous attention, then sudden impatience when someone turns a person\'s desire into a moral lesson. "Let her be bad at it. She only started yesterday."')])

E('bjorn', t=0, alias='A dock worker in a fisherman’s sweater',
  brief='''Bjorn Halvorsen, a redcap, does irregular dock work on the Inner Harbor. He arrived after the war. His private vocation is tasting dreams: the brass apple from a schoolboy's invented planet, the banquet nobody attends.''',
  full='''His dream travel uses learned magic and a dream-anchor called the Pillow Sail. Eating something in a dream may change that dream; it does not erase its real counterpart, steal knowledge or cure the dreamer. He asks consent for repeat visits, though his curiosity sometimes gets ahead of his manners. He carries the only working scale-light lantern anyone knows of.''',
  calls=[('Wants now', 'To taste the last fruit of the Far Guest\'s Winter Orchard, which ripens only for someone who has found a hunger they cannot name.')],
  secrets=[('The bell', 'He once bit through a bell in the mountain\'s vestibule. He now hears a faint note when someone promises what they have no right to give. It is imperfect, not infallible, and the mountain\'s keeper wants the bell restored.'),
           ('Other inhabitants', 'He has noticed signs that more people live in Ivory\'s Keep than she admits. He has not got past the wards.')],
  st=[('Playing him', 'Calm, literal, startlingly discriminating. "No. A nightmare can be excellent. That one was merely cruel."')])

E('ivory', t=0, alias='A grumpy schoolgirl',
  rumour='',
  brief='''Ivory looks like a grumpy north-side schoolgirl who dislikes school and attends it anyway. She is the last sluagh in Milwaukee.''',
  full='''She leans on the routines and Banality of school to stay steady. Exploring the Dreaming remains of the Pabst Building after her Chrysalis in 1986, she joined the broken Copper Hart to the unclaimed sluagh holdings and made the Gloaming Keep, whose approach lies inside the Nosferatu warrens. She also looks after the Michigan Pocket, the cave of rescued buildings under the lake, alone since the Nosferatu stopped coming.

She trains a few young mortal monster-hunters with chimera of her own invention: the Knock-under-the-Bridge, the Coat on the Last Bus, the Lantern in the Drain. Her contact with the Nosferatu is limited to individuals and to a door nobody forces.''',
  secrets=[('Patron of heroes', 'She remembers being a sidhe patron of heroes, and she knows the Secret of the sluagh.'),
           ('The patients', 'She secretly shelters eight changelings in Bedlam, survivors of the 1981 war, in the private wards of the Keep, and hopes to heal them. She will not accept death and reincarnation as a treatment.'),
           ('The hunters', 'She quietly helps Wolfgang, Rudeus Frost and Doctor Fire. Rudeus has faerie blood, and she sees kin in him.')])

# ---------------------------------------------------------------- outside the fae census
E('lola', t=0, alias='A retired printer with a lot of paper',
  brief='''Dolores "Lola" Wendt, a retired printing worker, keeps playbills, neighbourhood newsletters and the small publications nobody else thinks to preserve.''',
  full='''She is kinain: she knows that certain visitors see an extra Milwaukee, helps them selectively and expects consent before anything leaves its community. A basement leak threatens years of work, and she needs boxes and two people with a car.''',
  secrets=[('The invitation', 'She owns a duplicated 1980 supper invitation that puts two supposedly unrelated incidents of the War of False Doors on the same night.')])

E('arthur', t=0, alias='A gardener at the Domes',
  brief='''Arthur Saye tends plants at the Mitchell Park Domes and draws impossible gardens on the backs of discarded forms.''',
  full='''He has walked the Glass Orchard under temporary enchantment and understands it as a place visited under unusual conditions. He is weighing a better-paid job outside Milwaukee. His apprentice could carry on his work, differently, if anyone asked her.''')

E('hester', t=0, alias='A mature student at Mount Mary',
  brief='''Hester Ames, a mature student at Mount Mary College and a member of the Church of Isis: observant, politically stubborn, better at taking notes than at seeing who benefits from her curiosity.''',
  full='''She is interested in recurring dream geography and knows no fae by name. One of her research notebooks was lost at the edge of the Marquette zone.''',
  secrets=[('Her sponsor', 'Her distant sponsor is Dr. Mortius, and she does not know he is a vampire. She recently asked a reference librarian about a building that appears on no map but matches the Crownless Ward, and Mortius heard about it.')])

E('eddie', t=0, alias='A night-shift clerk who hunts ghosts',
  brief='''Eddie Rusk, a night-shift stock clerk, belongs to a small amateur club that investigates hauntings over pitchers of beer in a bowling alley.''',
  full='''He has learned to help frightened people, check an exit and stop a companion panicking, and now mistakes that for understanding every monster. Another member has started publishing names and addresses without consent.''',
  secrets=[('His teacher', 'Ivory has anonymously encouraged his better instincts.')])

# ---------------------------------------------------------------- chimera
E('quire', t=0, alias='An old librarian nobody remembers',
  brief='''Mrs. Quire keeps the Unfinished Index: an elderly librarian assembled from card-catalogue drawers, ink-dark lace and a face nobody remembers clearly. She speaks softly, because a shouted question rearranges whole wings.''',
  full='''She wants every unfinished work to have a fair chance to finish, and can find a deposited manuscript by the question that created it. She cannot tell honest postponement from cowardice without talking to the person.''',
  secrets=[('Overclassifying', 'She has begun filing unfinished lives as unfinished manuscripts. A neighbourhood carpenter dreams nightly of shelves being built around him. Releasing a dreamer means showing her that a life can stay worthwhile without finishing that work.')])

E('rent', t=0, alias='A porter with a key for a tongue',
  brief='''The Rent Collector, porter of the Crownless Ward: a lanky figure in a coat of old leases, with a key for a tongue and bells in its cuffs. It knocks before entering, even where a building has no wall left.''',
  full='''It wants rooms inhabited responsibly and can identify a valid custodial obligation on any door. It cannot create ownership or a deed. It accepts repairs, regular use or an orderly handover as payment, and turns threatening when someone hoards doors to keep others out. It carefully keeps tenants' hand-drawn nameplates long after their rooms are gone.''')

E('usher', t=0, alias='An attendant made of ash',
  brief='''The Ashen Usher attends the Far Guest's Seat: a tall figure of overlapping flakes like cooled ash, with empty sleeves and a bright coal for a mouth. Its shadow has wings its body never had.''',
  full='''It wants to discharge its duties without admitting that nobody receives them. It opens the public chambers and interprets the audience customs, but cannot summon the dragon or leave while a petition is pending. A cassette case interests it more than a sword. It asks who requested a visit, and becomes almost hopeful when told nobody did.''',
  secrets=[('The petitions', 'The mountain has begun accepting petitions in the absent dragon\'s name. Every unanswered petition adds a step to the Listening Stair and makes the road home longer.')])

E('tollman', t=0, alias='A figure under the bridge',
  brief='''The Tollman of Two Banks squats under the White Flag Crossing in two incompatible uniforms stitched down the middle. Each half insists it belongs to the lawful city.''',
  full='''It can delay a crossing, demand a hearing and remember bargains. Paying twice satisfies neither half. Introducing two people who really want to meet across the river can quiet it for weeks. Ruth thinks it is lonely; Oren thinks loneliness can still be extortion.''')

E('tuesday', t=0, alias='A brass dog',
  brief='''Miss Tuesday is a long-legged workshop hound made of gauges, rivets and a battered lunchbox, dreamed into being by workers looking forward to the part of the week when they might finish something of their own.''',
  full='''She follows the trail of any object genuinely missed by its maker, and refuses to fetch tools for anyone who blames them for his own cruelty. She follows Leon without belonging to him. Her lunchbox holds the last compliment she received, written on a napkin.''')

E('encore', t=0, alias='Applause in an empty hall',
  brief='''The Encore is a gorgeous absence on a stage: footlights with nobody between them, applause without hands.''',
  full='''It wants an exceptional night never to end, and makes an enchanted audience feel that leaving would destroy something precious. A satisfying ending freely accepted undoes it; a curtain call dedicated to someone else's next attempt could turn it into a useful stage-spirit. Nina has to take part in that choice.''')

E('surveyor', t=0, alias='A courteous man with plans',
  brief='''The Surveyor of Necessary Losses: a courteous figure with rolled plans under one arm and a face that becomes a familiar official's whenever someone wants reassurance. Its measuring chain is always slightly too short.''',
  full='''It wants to prove that every settlement requires someone else's permanent loss, and consolidates chimerical buildings by consuming others. It honours narrow terms faithfully and cannot seize a responsibly occupied room. It was born from ordinary civic rationalisations.''',
  secrets=[('Its offer', 'It has offered Celia a habitable rehearsal hall before Nina\'s concert. The price is three blue windows of the Crownless Ward, put out for ever.')])

# ---------------------------------------------------------------- the hidden survivors and the old enemy
E('alisande', t=0, alias='A lady in the private wards',
  brief='''Lady Alisande of the Copper Hart, a sidhe, hosted the seasonal assemblies of 1969–79 in the Hall of the Copper Hart. Most people believe she died in 1981.''',
  full='''Her court had beauty, useful hospitality and a habit of treating other people's labour as an inexhaustible resource. In 1981 she gathered the refugees at the Copper Hart; it seemed defensible, and it gave the attackers a predictable target.''',
  secrets=[('Alive', 'She survives in Bedlam in Ivory\'s private wards, rehearsing again and again an audience at which nobody has yet been hurt.')])

E('coil', t=0, alias='A nocker in the private wards',
  brief='''Peter Coil, a nocker, was presumed dead in 1981.''',
  full='',
  secrets=[('Alive', 'He survives in Bedlam in Ivory\'s wards, repairing a door that breaks whenever it opens.')])

E('june', t=0, alias='A satyr in the private wards',
  brief='''June-of-the-Many-Ribbons, a satyr, was presumed dead in 1981. Marta made her a ribbon before the war.''',
  full='',
  secrets=[('Alive', 'She survives in Bedlam in Ivory\'s wards, and greets every visitor as someone still expected at a long-cancelled celebration.')])

E('silas', t=0, alias='The War of False Doors',
  brief='''Silas Vane and Ada Vale, two Ravnos, made war on the city's fae in 1980–81 with a small mortal network in property clearance, theatrical equipment and architectural salvage.''',
  full='''They stole the Glass of the Second Door and used it to turn familiar escape routes into prepared ambushes. Twenty-five of the thirty-eight resident Kithain died, including every sluagh but Ivory, who came later. Silas died with the sunrise on the mortal side of a compromised refuge; the survivors hunted Ada down soon after. No Ravnos remain in Milwaukee. They were two particular predators, not representatives of their clan.''')

# ---------------------------------------------------------------- freeholds and realms
E('d-hearth', t=0, alias='The back kitchen of an alterations shop',
  brief='''The Last Hearth: a long brick bakehouse with a copper stove, a communal table and cupboards labelled in handwriting accumulated over generations. A modest working freehold.''',
  full='''Its balefire lives in a shallow coal pan inside the stove, and its strength depends on freely shared practical work: teaching, repair, cooking, cleaning. Paying Marta to do everything does not sustain it. A guest who takes a real share of the work can ask for one honest hearing before being refused shelter. It supports a small circle, not all seventeen of the city's Kithain, and ordinary food still has to be bought.''',
  calls=[('The custom', 'Never draw cold iron inside an offered refuge.', 'law')],
  secrets=[('The kettle', 'The landlord is due on the night a chimerical kettle is shouting the name of someone who needs help. Marta needs three people; everyone assumes she can do all three things herself.')])

E('d-counter', t=0, alias='A room beside the bridge machinery',
  brief='''The Counterweight: a stone gatehouse hung by chains over a channel full of discarded destinations. Its balefire hangs in a bronze cage on the great weight that raises the dream-bridge, and sinks close to the dark water whenever the bridge opens.''',
  full='''Three pallets, an ironless tool cupboard and a shelf of thermoses. It welcomes travellers for a night; it cannot become a dormitory without changing what sustains it. Oren's door is valuable because it gives a dependable return from two otherwise unreliable routes.''',
  secrets=[('Broken promises', 'The damaged weight contains broken promises. They can be removed only after the current obligations they match are honestly settled or renegotiated.'),
           ('A token', 'A stranded chimera has presented a valid old admission token. Admitting it is possible; protecting it from what pursues it will make tomorrow\'s crossing uncertain.')])

E('d-keep', t=0, alias='A door at the end of the warrens',
  brief='''The Gloaming Keep: Ivory's secluded holding, made from the broken architecture of the Copper Hart joined to the old sluagh chambers. Its approach lies inside the Nosferatu warrens; the final threshold is hers.''',
  full='''The public story is that she found an unclaimed ruin and made it habitable. The Keep keeps a deeper reserve of Glamour than either public refuge, almost all of it committed to the private wards, and an edible chimerical garden.''')

E('d-wards', t=0, alias='Rooms behind wards',
  brief='''The private wards of the Gloaming Keep.''',
  full='''The patients' care involves observation, safe periods of ordinary routine, personal anchors and carefully chosen contact. None of the city's treasures replaces that work.''',
  secrets=[('Eight survivors', 'Eight changelings presumed dead in 1981 live here in Bedlam. Their refuge drifted out of step with earthly time: they lived months of disordered confinement across five mortal years before Ivory found them.')])

E('d-index', t=0, alias='A shelf in the library’s second basement',
  brief='''The Unfinished Index: bookshelves drifting through a great vaulted gulf beneath the Central Library, desks hanging at different angles, lamps on chains attached to nothing. Half-written letters nest under the desks like swallows.''',
  full='''To enter, return an unfinished work of your own to a shelf where it belongs in the dreaming reflection of the basement stacks, and state the question that stopped you; a ladder descends from above. To travel upward, ask a harder question rather than climbing harder. It holds interrupted investigations, unpublished local writing, rejected municipal schemes and forgotten annotations. It is not omniscient. A reader must honestly advance one abandoned task before borrowing another.''',
  secrets=[('Useful discoveries', 'Somewhere in the stacks are the original words of Oren\'s oath, a repair diagram that could make Leon\'s tram work without the Glass, and Alisande\'s unfinished speech proposing reforms to her own court.')])

E('d-stacks', t=0, alias='Deep shelving',
  brief='''The inner stacks of the Unfinished Index: unstable, shifting shelving drawn toward related questions.''',
  full='''Following a shelf because it holds the answer you want, rather than the work you borrowed, separates companions into different lines of inquiry. Agree on a meeting question before splitting up.''')

E('d-ward', t=0, alias='Towers in late afternoon',
  brief='''The Crownless Ward: great towers in perpetual late afternoon, vines over carved walls, birds wheeling between them and blue light in windows above streets that remember feet better than names. A composite realm made of demolished buildings and ambitions whose inhabitants never arrived.''',
  full='''Each blue window holds a place someone might still make: a workshop, a schoolroom, a rehearsal hall, a home. A window goes dark when its room is stripped for parts or declared worthless, and brightens when people start something equivalent in the mortal city. Three buildings are worth saving: the Hall of Borrowed Voices, the West Foundry and the House with Enough Bedrooms. None is a freehold yet. Saving every tower is beyond nine people.''')

E('d-ruins', t=0, alias='Further ruins',
  brief='''The distant ruins, where the Crownless Ward forgets its address.''',
  full='''Old stairs still lead to floors that no longer exist. The Waiting Platform is out here.''')

E('d-seat', t=0, alias='A mountain on the lake',
  brief='''The Far Guest's Seat: a black mountain rising like a blade out of Lake Michigan, under constellations that look like departure routes. There is no such island on the mortal lake.''',
  full='''A great dragon lived here long before the current fae's records; it came from elsewhere and eventually left the Earth. Its lair was a place of audience as well as a hoard, and it still rewards ventures freely undertaken and resists commands imposed on someone else's journey. The dragon's absence is real: there is no dragon under the floor. Most of the gold and the great weapons left with it.''',
  secrets=[('The petitions', 'The mountain has begun accepting petitions in the dragon\'s name. It cannot grant them, and each one adds a step to the Listening Stair.')])

E('d-arrivals', t=0, alias='A hall of niches',
  brief='''The Hall of Arrivals: stone niches sized for gifts, some of them offered by beings much larger than people.''',
  full='''What remains of the hoard is here: an empty bell frame, small navigation tools, containers of unfamiliar seeds and gifts whose meanings have been lost.''')
E('d-stair', t=0, alias='A long stair',
  brief='''The Listening Stair repeats a visitor's declared purpose until they can tell it apart from someone else's expectation.''',
  full='''It is getting longer.''')
E('d-winter', t=0, alias='An orchard in warm snow',
  brief='''The Winter Orchard grows pale fruit in warm snow.''',
  full='''The last fruit ripens only for someone who has found a hunger they cannot name.''')
E('d-departure', t=0, alias='A room overlooking a road',
  brief='''The Departure Room overlooks the road the dragon used to leave.''',
  full='''The road is severed and cannot be followed.''')

E('d-orchard', t=0, alias='Three glass domes',
  brief='''The Glass Orchard: three vast glass fruits enclosing a rain forest, a desert and a garden where the seasons turn around a single path. A seasonal glade anchored in the Mitchell Park Domes, sustained by human curiosity.''',
  full='''A guide must respect each environment's rhythm; forcing every plant to bloom at once produces brilliant colour and then an exhausted silence. Arthur Saye and a flock of glasshouse swifts look after it. Bjorn comes for the flavours; Nina brings exhausted collaborators who need to want something again.''',
  secrets=[('Mountain seeds', 'Seeds carried from the Far Guest\'s mountain are germinating among ordinary ambitions. People sketch houses that could only stand underwater, or rehearse music that needs a voice they do not have.')])

E('d-third', t=0, alias='A factory after hours',
  brief='''The Third Shift: a factory after the foreman has left, when every worker can try the improvement management would never approve. Lathes sing counterpoint, chalk equations move between benches and small brass creatures carry scraps to projects that might need them.''',
  full='''Its productive hours are limited. If nobody rests, the benches lengthen, the exit moves away and a whole night disappears into "one more adjustment". A brewery worker once dreamed a copper whale into it.''',
  secrets=[('COMPLETION', 'Leon\'s line has acquired an immaculate timetable that nobody wrote. Its last stop is called COMPLETION, and Ruth says no working transport system has such a destination.')])

E('d-ovation', t=0, alias='A small stage',
  brief='''The Standing Ovation: a shallow wooden stage facing seats filled by audiences who nearly came. Some are absent parents, some future admirers, some borrowed from the performer's assumptions.''',
  full='''The stage grants the pleasure of being heard. Repeating a familiar success makes the exit curtains heavier; new, awkward work opens them. Nobody in the seats can tell you anything reliable about the real people whose faces they wear.''',
  secrets=[('The Encore', 'The Encore wants Nina\'s neighbourhood performance to happen here for ever.')])

E('d-wolfeye', t=0, alias='Strange shadows over Marquette',
  brief='''The Country of the Wolf's Eye: over the Marquette null zone the Dreaming is not empty but overfull. Shadows choose different directions, carved animals seem alert and a small cantrip can gain an unintended audience.''',
  full='''Ruth travels around it. Leon thinks the interference could teach him something about the tram; Oren thinks his proposed test is not nearly far enough away. A changeling who enters may see a warning in familiar imagery, which is an interpretation at the border and not proof of anything.''',
  secrets=[('A lost notebook', 'One of Hester Ames\'s research notebooks has been lost at the edge of the zone.')])

E('d-borrowed', t=0, alias='A hall of voices',
  brief='''The Hall of Borrowed Voices, a chamber of the Crownless Ward that Celia wants to relight as a public rehearsal and meeting hall.''', full='')
E('d-foundry', t=0, alias='An old foundry',
  brief='''The West Foundry in the Crownless Ward, where Leon can recover dream-machinery.''',
  full='''Miss Tuesday has found the component Leon is missing here.''')
E('d-bedrooms', t=0, alias='A very tall house',
  brief='''The House with Enough Bedrooms: a many-storeyed house in the Crownless Ward whose occupants must share decisions about hospitality.''', full='')
E('d-blueroom', t=0, alias='A blue-lit window',
  brief='''A blue-lit room in the Crownless Ward, claimed on a ticket Kit carries.''',
  full='',
  secrets=[('Custodian', 'The ticket names Kit custodian, not owner.')])
E('d-platform', t=0, alias='A station platform',
  brief='''The Waiting Platform: an abandoned intercity dream-station, the echo of the demolished Everett Street depot. The timetable shows emotionally persuasive departures that cannot carry a living traveller home.''',
  full='''Reaching it needs an actual invitation from a named destination outside Milwaukee. Ruth wants to secure a real host at the other end and test a short outward stretch.''')
E('d-lanternthreshold', t=0, alias='A sheltered spot on the lakefront',
  brief='''The Lantern Wake landing: a sheltered lakefront threshold where crossings to the Far Guest's Seat begin.''', full='')
E('d-pabstecho', t=0, alias='The foot of a stair downtown',
  brief='''The dream-reflection of the old Pabst site, where the Unbuilt Stair begins.''',
  full='''The Hall of the Copper Hart stood above the old city here, with an antlered weathercock of a stag climbing above the smoke. The building was demolished in 1981, in the same spring as the war's last night.''')
E('d-eastecho', t=0, alias='The east bank, sideways',
  brief='''Eastern downtown echoes: the far bank of the White Flag Crossing.''', full='')

E('c-quire', t=0, alias='A librarian', brief='''Mrs. Quire at her desk in the Unfinished Index.''', full='')
E('c-rent', t=0, alias='A porter', brief='''The Rent Collector on its rounds of the Crownless Ward.''', full='')
E('c-surveyor', t=0, alias='A man with plans', brief='''The Surveyor of Necessary Losses, measuring something in the Ward.''', full='')
E('c-tollman', t=0, alias='Under the bridge', brief='''The Tollman of Two Banks, under the White Flag Crossing.''', full='')
E('c-usher', t=0, alias='An attendant', brief='''The Ashen Usher in the Hall of Arrivals.''', full='')
E('c-tuesday', t=0, alias='A brass dog', brief='''Miss Tuesday, the brass hound, who wanders wherever a tool is missed.''', full='')
E('c-encore', t=0, alias='Footlights', brief='''The Encore, on the stage of the Standing Ovation.''', full='')
E('c-swifts', t=0, alias='Birds in the glasshouse',
  brief='''A flock of glasshouse swifts that helps keep the Glass Orchard.''', full='')
E('c-whale', t=0, alias='A copper whale',
  brief='''A small copper whale dreamed into the Third Shift by a brewery worker. It feeds on steam and is furious when called a fish.''', full='')
E('c-knock', t=0, alias='A knock under a bridge',
  brief='''The Knock-under-the-Bridge, one of Ivory's training chimera.''',
  full='''She enchants her trainees so they can meet it on controlled ground, with escape routes and an abort signal she enforces. The danger is a hunter assuming that an unrelated encounter follows the same rules.''')
E('c-coat', t=0, alias='A coat on the last bus',
  brief='''The Coat on the Last Bus, one of Ivory's training chimera. It rides the route.''', full='')
E('c-lantern', t=0, alias='A light in a drain',
  brief='''The Lantern in the Drain, one of Ivory's training chimera.''', full='')
E('c-staircase', t=0, alias='A staircase of people',
  brief='''On a good night at County Stadium the crowd briefly makes a chimerical staircase of people giving a stranger a better view.''',
  full='''It has nothing to do with who owns the boxes.''')
E('w-ribbon', t=0, alias='A ribbon',
  brief='''A mended ribbon, found outside the outer approach of the Keep.''',
  full='''Marta recognises it: she made it for June before the war.''',
  secrets=[('How it got out', 'It was carried out with discarded fabric. It proves an old object survived; it does not reveal eight living people.')])

# ---------------------------------------------------------------- treasures
E('t-bell', t=0, alias='A tram bell',
  brief='''The Bell of the Last Transfer: a brass tram bell on Leon's test vehicle.''',
  full='''Properly repaired, it could call a stranded passenger with a valid punched ticket back to the last legitimate stop on its one restored route. It cannot recover the dead or overrule a closed freehold.''',
  secrets=[('Before repair', 'Wired to the Glass shard, it recognises wartime stops, and is a hazard rather than a rescue.')])
E('t-glass', t=0, alias='A piece of glass',
  brief='''A shard of the Glass of the Second Door, broken in 1981.''',
  full='''The Glass could alter a limited set of prepared thresholds so that a convincing false escape replaced a real destination. One shard is in Leon's prototype; the other pieces are unaccounted for. Destroying it does not harm Ivory's patients or any freehold.''')
E('t-key', t=0, alias='A tarnished key',
  brief='''The Key of a Borrowed Room: a small tarnished key on Kit's claim ticket. It opens one unoccupied, unclaimed room in the Crownless Ward for a night of shelter.''',
  full='''The guest must leave a practical improvement: a repaired latch, swept stairs, an honest inventory. Using it again without improvement brings the Rent Collector.''')
E('t-thimble', t=0, alias='A copper thimble',
  brief='''Marta's Mending Thimble, copper, polished almost smooth.''',
  full='''A garment mended patiently for a particular willing person can carry one vivid comforting memory into an enchanted experience. It does not compel calm or cure Bedlam. Marta lends it to competent learners and refuses commissions made without the wearer's knowledge.''')
E('t-pennant', t=0, alias='A strip of sailcloth',
  brief='''The White Pennant, an old strip of sailcloth kept by Oren.''',
  full='''It guarantees that the Tollman will hear the bearer out before refusing the White Flag Crossing, if they declare their peaceful purpose honestly. A hearing, not agreement. Using it to set up ambushes destroys it.''')
E('t-lamp', t=0, alias='A lamp with a scale shutter',
  brief='''The Scale-Light Lantern: a lamp with a translucent dragon-scale shutter, carried by Bjorn.''',
  full='''It reveals the Lantern Wake and a small circle of reliable water around the boat, if the pilot follows the agreed chart. It is charged by completing a journey freely promised to someone else. One charge, one passage.''',
  secrets=[('A loan', 'The Ashen Usher recognises it as a loan from an older visitor, and wants the terms renewed.')])
E('t-fruit', t=0, alias='A pale fruit',
  brief='''The Fruit That Has No Name: a single pale fruit in the Winter Orchard, visible only when ripe.''',
  full='''Shared willingly by two people, it lets each convey one sensation the other has never known. The mountain grows no second fruit until both act on what they learned.''')

# ---------------------------------------------------------------- realms as zones, and the trods
E('r-ward', t=0, alias='Towers', brief='''The Crownless Ward.''', full='')
E('r-ruins', t=0, alias='Ruins', brief='''The distant ruins of the Crownless Ward.''', full='')
E('r-wolf', t=0, alias='Overfull ground', brief='''The Country of the Wolf's Eye, over the Marquette zone.''', full='')
E('r-index', t=0, alias='A library', brief='''The Unfinished Index, under the Central Library.''', full='')
E('r-orchard', t=0, alias='Glass domes', brief='''The Glass Orchard, over the Mitchell Park Domes.''', full='')
E('r-seat', t=0, alias='A mountain', brief='''The Far Guest's Seat, far out on the lake.''', full='')
E('tr-white', t=0, alias='A crossing of the river',
  brief='''The White Flag Crossing: from the Counterweight to the eastern downtown echoes, about twenty minutes. Cross with a small white cloth openly displayed and name someone on the far bank you mean to meet peacefully.''',
  full='''A remnant of the Bridge War and the most reliable cross-river trod. It lets an armed traveller pass who has declared a peaceful purpose, and turns back anyone hiding a planned attack. A failed crossing returns you to the bank you started from.''')
E('tr-borrow', t=0, alias='A stair in the library',
  brief='''The Borrower's Stair: from the Central Library's dreaming vestibule to the Unfinished Index. Offer unfinished work and its honest question. Ten minutes to the reception desk; unpredictable beyond.''', full='')
E('tr-unbuilt', t=0, alias='A stair downtown',
  brief='''The Unbuilt Stair: from the old Pabst site to the Crownless Ward, about half an hour. Climb while describing something specific you intend to build, teach or repair.''',
  full='''Declaring grander plans than you mean attracts doors to much larger responsibilities. The safe return is by the same stair, carrying a record of a small step already completed, which is why Kit carries so many receipts.''')
E('tr-lantern', t=0, alias='A crossing of the lake',
  brief='''The Lantern Wake: one long night across the lake to the Far Guest's Seat, in an enchanted boat carrying a kindled scale-light lantern, with a chart from Ruth or the Ashen Usher.''',
  full='''Follow the lantern's reflection, not the star you most want to reach. If the wind blows the wake ahead of the bow, turn back. Keep one full charge for the way home.''')
E('tr-line', t=0, alias='A tram line',
  brief='''The Third Shift Line: Leon's surviving section of dream-rail from his workshop, eventually to the Counterweight. Planned at fifteen minutes; currently unsafe for passengers.''', full='')
E('tr-candle', t=0, alias='A way under the city',
  brief='''The Low Candle Way: the old sluagh approach beneath the city to the outer court of the Gloaming Keep. Short, when Ivory opens it.''',
  full='''Being seen at its mortal entrance can expose someone's movements to the Nosferatu. It does not give anyone a way into the Keep.''')
E('tr-platform', t=0, alias='A road to a station',
  brief='''From the outer Crownless Ward to the Waiting Platform.''', full='')
E('tr-chicago', t=0, alias='The old road south',
  brief='''The old Chicago road. It now ends at a station where every departing train carries the name of someone who abandoned Milwaukee.''', full='')
E('tr-depart', t=0, alias='A severed road',
  brief='''The Far Guest's road, the way the dragon left. Severed.''', full='')
