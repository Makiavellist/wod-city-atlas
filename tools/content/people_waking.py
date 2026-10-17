from lib import E

# ---------------------------------------------------------------- the Council and the Elders
E('merik', t=2, alias='The late Prince',
  rumour='The Prince is dead. Everyone says so, and no two people tell you how in the same way.',
  brief='''Terence Merik, Ventrue, ruled Milwaukee from 1930 until this October. He took the city from Lyle Rickson on Canadian liquor money and Mafia muscle, and under him the Lupine raids grew fewer and weaker. People credit his Gangrel wife for that: she knew the packs.

He died this autumn, when his house on the hill above the Menomonee burned. The Council says a rogue Kindred had been leaving drained bodies for the newspapers and that the Prince fell while the matter was being settled. The throne is empty and the city is choosing a successor.''',
  full='''Born in Kent in 1645, an earl Embraced by a nameless countess at Christmas 1683, he "died" in 1750 when the county began to wonder why he never aged. In the Civil War he met Erica, a Gangrel nursing Union soldiers on his plantation, Blood Bound her and brought her north. Her friends among the Lupine let him run liquor in the 1920s; liquor brought the Mafia, and the Mafia brought the throne.

He kept the peace by keeping the Anarchs leaderless: the dangerous ones always left town. He owned the mayor's office, the police commissioner and several precinct captains, and he read the Milwaukee Journal a day early. In his last weeks he appointed a handful of neonates as "the Mask" to protect the Masquerade and hunt the killer. The Mask destroyed him in his burning house, and they say he was the killer they had been sent to find.''',
  secrets=[('Erica', '''A month before the end he waited too long to feed, frenzied on his way home from a film, drained a couple on a park bench in Juneau Park and then killed Erica when she tried to stop him. He could not confess without inviting revolt, so he hid her body, and his mind split: one half ordered the hunt, the other kept killing.'''),
           ('The Union was his', '''For five years he had been bringing the East Side Anarchs Union under Domination and Blood Bonding its key figures. He sent them to kill the Mask with the Blood Brothers.'''),
           ('He sold the Mask to the Lupine', '''He told the Mouse pack exactly which car the Mask would be driving out on Route 43. The Justicar who should have come to judge the murders had already died in that same Lupine cave.''')])

E('gracis', t=2, alias='Milwaukee’s Caesar', kicker='Ventrue · 8th generation',
  rumour='There is a little Roman on the Council who counts the votes before anyone else has finished speaking.',
  brief='''Gracis Nostinus, Ventrue, is the most powerful voice on the Council of Elders and the nearest thing it has to a chairman. He is soft, pink and barely five feet tall, dresses in stylish clothes a size too large, speaks through his nose and wipes his hands after every handshake.

He feeds Raoul and the armed guards who keep Anarchs out of MECCA, and he lives in a fine old house on the river north of downtown. Everyone knows two things about him: he wants the throne, and he hates Hrothulf.''',
  full='''A Roman Embraced by the general Marius in 412, he has hunted his blood-brother Hrothulf for fifteen hundred years to avenge their sire and, in his own mind, Rome. He was Prince of Kilbourntown in the 1830s and started the 1845 riot that brought the bridges down.

In Council he can usually count on Lucina and Carna, enough to force a three-to-three stalemate on anything. Mafia money pays for his bribes and for mortal hitmen whose job is to frighten rivals rather than kill them; his spies log every arrival at Mitchell Field. The other clans respect him and will not crown him: they know his interest is not the city but his vendetta.''',
  secrets=[('The seventh seat', '''He backed Parovich's proposal to restore the Council's seventh seat for a second Ventrue and never saw that it was the Sabbat's plan to break the Council. Since Parovich's exposure he has been asking himself who else on the Council had the same idea.'''),
           ('The detectives', '''He meant to take the police detectives away from Parovich once the seat was won. With Parovich gone the detective bureau's Kindred leash is lying loose, and he is reaching for it before Lucina notices.'''),
           ('He is afraid of Decker', '''Of everyone in the city, the one he fears is Mark Decker. Decker's Anubi could seal the roads or walk into MECCA, and nothing Gracis owns could stop them.''')],
  st=[('Playing him', 'Hunch your shoulders, talk through your nose, keep a handkerchief to wipe your fingers. Fussy, precise, a little foolish on the surface.')])

E('hrothulf', t=2, alias='The old Dane', kicker='Ventrue · 7th generation',
  rumour='They say the oldest Kindred in the city lives in a plain house out past the patrols, and that even the Lupine leave it alone.',
  brief='''Hrothulf is the oldest Ventrue in Milwaukee and has twice been its Prince. He is a huge man who looks barely twenty-five, with long unkempt blond hair, a deep scar from a Roman blade, poor grammar and a habit of mumbling in a language nobody else speaks. He rarely raises his voice; he rarely needs to.

He keeps out of Ventrue politics and lives alone in a suburban house beyond the Anubi line. He holds a season box at County Stadium. He and Gracis have been at war for longer than the city has existed.''',
  full='''A Dane from 5th-century Britain, Embraced by Marius in 380 and kept as a Blood Bound slave for half a century. He came to the New World early, was Prince of Juneautown when Solomon Juneau founded it, and fought Gracis through the Bridge War until a Nosferatu Justicar forced a truce. As Prince again from 1906 he created the Council of Elders; he resigned in 1923, after a European assassin nearly killed him, rather than give Gracis a throne to aim at.

He controls the city's fire department. Years ago Gracis's men set his haven alight and the trucks took two hours to arrive; he has owned the brigade ever since. He does not want the throne, but if Gracis attacks him openly he will take it for as long as it takes to restore order. The Anarchs have no quarrel with him.''',
  secrets=[('He drank his sire', 'When he killed Marius he did not stop at killing. Hrothulf is a diablerist, and Gracis has never stopped saying so.'),
           ('Petre Dubois', '''In 1674 he came through as a scout called Petre Dubois with Père Marquette's party, married into the Chippewa and Embraced his wife Chiclena. Her war against the Menominee brought the outcast Lupine Usla here. The siege of Milwaukee began with Hrothulf's marriage, and he knows it.'''),
           ('The last resort', '''If he is ever truly cornered he could make every hose in the city fail and let Milwaukee burn. He would probably not do it. Probably.'''),
           ('Carna protects him', 'The Tremere seat secretly favours him and has shielded him more than once.')],
  st=[('Playing him', 'Speak quietly, as if shy. Bad grammar, the odd foreign word. Never get angry at insults: your size does the talking.')])

E('lucina', t=2, alias='The Toreador girl', kicker='Toreador · 8th generation',
  rumour='The Toreador on the Council looks sixteen. People who treated her as sixteen are not on the Council.',
  brief='''Lucina leads the city's Toreador and sits on the Council. She looks like a girl of sixteen, red hair to her shoulders, dark brown eyes, always in the finest gown she can find. She is sweet and demure until someone argues with her on a point that matters, and then she is not.

She keeps a permanent suite on the 16th floor of the Hyatt Regency. Her ghouls guard the museums and concert halls against the Anarchs, whom she hates as a matter of principle. In Council she usually votes with Gracis.''',
  full='''A Missouri farmer's daughter born in 1863 who danced at St. Louis socials. At sixteen a beautiful boy took her for six months, then left a note on the pillow: she would never be great, and he left her to her mediocrity for eternity. Her family drove her off with a shotgun. She still dances, and she has spent a century trying to prove him wrong.

She believes art can tame the Beast and wants to make the Toreador worthy of what they claim to love, which makes her a kill-joy and earns her respect. She fought Sir Edward Scott in Council on reflex, and she is working to take over the police administration so she can crush the street gangs. Several peace talks with Akawa at West Milwaukee Park came to nothing.''',
  secrets=[('Scott loved her', 'The Black Prince was in love with her, or something close to it, and an old Malkavian kept feeding the feeling. She never knew, or never let herself know.'),
           ('A kindly old gentleman', 'A fatherly old Kindred has been advising her not to tolerate insults. She does not know that he is mad, or what else he is.'),
           ('Parovich’s friend', 'She was Parovich’s ally in Council and supported his seventh seat. Since his exposure she has been very quiet about that.')])

E('scott', t=2, alias='The Black Prince', kicker='Brujah · 7th generation',
  rumour='The Anarchs still drink to a dead Elder they called “the Prince”, just to annoy the living ones.',
  brief='''Sir Edward Scott, "the Black Prince of Cornwall", was the Brujah Elder on the Council and the Anarchs' voice in it. He came to sessions in a bathrobe, a leather jacket or a bikini, mocked everyone including himself, and challenged Councillors to duels that none of them ever accepted.

He was destroyed in the chaos of the Sabbat invasion this autumn. Accounts of how differ, and no two agree. His seat now belongs to Jade Riley.''',
  full='''A Cornish knight born in 1399 and Embraced in 1432 by Sir Lorence, who killed his wife and son before his eyes. He spent five centuries protecting the young from the old. He saved Akawa from a blood hunt more than once and brawled with him in the dueling grounds just as often; Kindred laid bets on their bouts, and nobody ever collected. Decker was his friend.

He opposed giving the empty seventh seat to anyone but the Gangrel it was made for, and he would have preferred Hrothulf back on the throne. He kept a small, elegant flat on the east side near the lake, in the middle of Union turf, where the Anarchs still leave bottles and flowers by the door.''',
  secrets=[('He was Akawa’s sire', '''In 1770, fleeing settlers who had caught him feeding, he Embraced a young Plains warrior and left him the next night. He never remembered. Akawa did.''')])

E('jason', t=2, alias='The quiet Malkavian', kicker='Malkavian · 7th generation',
  rumour='One of the Councillors is so forgettable that people forget he is on the Council.',
  brief='''Jason holds the Malkavian seat on the Council. He is a short, quiet man in clothes twenty years out of date who keeps checking a pocket watch as if he were late for something. He rarely speaks; when he does, it tends to be the wisest thing said all night.

Any Kindred may bring him a question or a request about Council business, and he listens to all of them. He lives in a luxurious penthouse hidden inside a shabby tenement in Walker's Point.''',
  full='''He was hanged in 1903 for killing a woman for the five dollars in her purse because a man called Talbot told him to, and was Embraced in his cell the night before. He is on the Council because he is the only Malkavian who would sit on it.

He holds the balance of power between Gracis and the Brujah, and both sides court him. He always voted against Parovich because he disliked the colour of his aura, and he was the only Elder who said so before the invasion. He feels responsible for the city's other Malkavians. He is trying to keep the police out of every Kindred's hands, his own included, and he is watching Jade Riley closely.''',
  secrets=[('His sire', 'His sire is Jacob. Jason serves both Jacob and Esau, and both of them tell him what to do.'),
           ('The frame', 'The Sabbat meant to kill Parovich once he had broken the Council and make it look like Jason had done it.')])

E('parovich', t=2, alias='The traitor', kicker='Nosferatu · 7th generation',
  rumour='The old Nosferatu on the Council turned out to be working for the Sabbat. Nobody on the Council likes to talk about how long it took them to notice.',
  brief='''Parovich sat on the Council for the Nosferatu for most of a century: enormous, kindly, drenched in a sickly sweet perfume to hide the stench, with a forked tongue. During the Sabbat invasion this autumn he was exposed as the Sabbat's agent inside the Council and destroyed.

His mansion in the Barrens has been searched and boarded up. Mother Agatha now speaks for the Nosferatu.''',
  full='''A Russian Embraced in 1467, in the city for ninety years. He was in New York when the Sabbat took it, decided they would win everywhere eventually, and joined the Black Hand. In Milwaukee he owned the police detectives, set Elders and Anarchs at each other's throats, pushed for a seventh Council seat so that Hrothulf and Gracis would sit at the same table and tear it apart, and searched the Anubi for someone weak enough to betray Decker.

He told the Council his runaway childer were dangerous psychotics to be killed on sight. He had already killed two of them himself.''',
  secrets=[('He is not gone', '''Parovich was not destroyed. Dragos melted him into a Tzimisce war-ghoul, a vozhd, as punishment and as a spare brain. It hides in the Deep Tunnel drifts under the city, and one of the faces in its flank is his. He remembers every secret of the Warrens.'''),
           ('The clan was watching', 'The Nosferatu elders outside Milwaukee had already grown suspicious of him and sent spies to watch him before the invasion.')])

E('carna', t=2, alias='The Princess Witch', kicker='Tremere · 8th generation',
  rumour='The Tremere on the Council flirts like a debutante. People who know her avoid being flirted with.',
  brief='''Carna represents the Tremere on the Council. She looks eighteen, with straight blond hair that hides half her face, and wears long dresses from eras nobody can place. She is flirtatious and seems perpetually tired, and those who know her treat her as a shark.

Her favourite haven is at the Hyatt. The Tremere keep a chantry, the Chapel, in an old brewer's mansion on Highland Boulevard, and no Tremere comes to Milwaukee without Vienna's leave.''',
  full='''A peasant girl Embraced in 1435 by a prince who made her as revenge on his own masters: the first woman in the Tremere tanks. She was once Prince of Marseille. Since 1903 only trusted elders and ancillae of her clan have been allowed in Milwaukee, and they are here for the Marquette anomaly, not politics.

She openly supports Gracis but votes for and against him to keep everything exactly as it is: if he wins he will leave her behind, and if he loses he cannot protect her. Officially she heads the city's Tremere. In practice she took her orders from Victor, who relayed what Dr. Mortius needed. Since Victor's death this autumn the Chapel works without Vienna's direct oversight.''',
  secrets=[('Her lovers', 'She clings to her lovers until they want to leave, and then she kills them with a ritual of her own invention, the Curse of Clytaemnestra. She is coming unhinged.'),
           ('Hrothulf', 'She secretly favours Hrothulf and has protected him more than once. When Hrothulf dies, Gracis will leave the city, and her power base goes with him.'),
           ('Doubts', 'She has begun to question what the Tremere have done over the centuries. In her clan that is not a healthy thought.')],
  st=[('Playing her', 'Very flirtatious with men, while planning how to dominate them. When it comes to a real confrontation, be as cold as you were sweet.')])

E('jade', t=2, alias='The new Brujah Primogen', kicker='Brujah · 9th generation',
  rumour='The Brujah seat went to an outsider nobody voted for.',
  brief='''Jade Riley took the Brujah seat on the Council after Sir Edward Scott's death, appointed over the heads of the local Brujah through the influence of her grandsire. She is educated, sharp-tongued and terrifying in a fight. During the invasion she killed the Sabbat's dragon, Dragos Dalca, with her bare hands at the fish plant.

Nobody takes her seriously anyway. To the Elders she is an upstart; to the Blood Brothers she was "sent from above". Her official haven is a whole floor of a glass tower on East Michigan Street. Her childe Jamie Robinson sings with the Rust Saints.''',
  full='''Her grandsire is an old Methuselah who wants to steer the clan back to its philosopher-king roots, and her appointment is his work. She knows exactly how that looks and resents it. She wants to be reckoned with for what she has done, not for who sent her.

Her ghoul and oldest friend, Macy Carver, brings her everything the city's protest scene knows. Kayla, a sister of the Church of Isis, works for her as well.''',
  secrets=[('Where she sleeps', 'The tower floor is a decoy with its lights on timers. She sleeps in Macy Carver’s house in Wauwatosa, inside the Anubi patrol zone, and Decker knows exactly who is staying there.'),
           ('What her grandsire wants', 'He does not want victories from her. He wants her to found a school in Milwaukee and lecture. Jade does not want to be anyone’s project.'),
           ('Kayla', 'Kayla also reports to Dr. Mortius, and tells each of them different things.')])

E('agatha', t=2, alias='The Nosferatu matriarch', kicker='Nosferatu · 8th generation',
  rumour='The Nosferatu have a new voice on the Council, and she is not interested in being liked.',
  brief='''Mother Agatha has spoken for the Nosferatu on the Council since Parovich's fall. She is hunched and enormous, with a shawl over her hump. She ruled the Warrens under the city while Parovich sat at the table, and she rules them again.

She is ashamed of his treachery and makes sure the Council remembers it: as far as she is concerned the Nosferatu owe nobody anything now.''',
  full='''She wants the creatures Dragos left in the tunnels rooted out, and she wants the Warrens' old understanding with the people who lived under the lake restored. The Nosferatu archive under the Journal building and the Rat Market both answer to her.''',
  secrets=[('The smell', 'Some nights she smells something in the deep tunnels that reminds her of Parovich. She tells herself it is memory.'),
           ('The Pocket', 'For decades the Nosferatu shared an impossible place under Lake Michigan with the city’s last sluagh changelings. Parovich’s treachery closed that door, and she wants it open again.')])

E('louis', t=2, alias='The Toreador sculptor', kicker='Toreador · 9th generation',
  rumour='There is an Elder who makes everyone feel underdressed, including people in the middle of a fight.',
  brief='''Louis Detonas is a Toreador Elder and sculptor: an extremely cultured gentleman with impeccably combed black hair and a hint of make-up on a pale face. He has a way of making everyone around him feel underdressed.

He lives in a spacious downtown apartment by Cathedral Square and stands at Lucina's side against the Anarchs.''',
  full='''The son of French nobles who supported the Revolution and died by it, he was rescued from the guillotine in 1793 by Natasha, who wanted more of his sculpture. He came to America hoping for a land without war, fled the Civil War north, and has been in Milwaukee longer than almost any other Kindred. He knows much of what goes on and has gone on in the city.

He has never forgiven the lower classes for his parents' deaths. He thinks of Gracis and Lucina as nearly friends.''',
  secrets=[('He lied for Gracis', 'When the Mask came asking about Hrothulf during the Prince’s last weeks, Louis told them what Gracis wanted them to hear.')])

E('barth', t=2, alias='Derik Dark', name='Barth (“Derik Dark”)', kicker='Toreador · 10th generation',
  rumour='“Derik Dark, only after sundown and not for the faint of heart.” Half the Kindred in the city listen to him; the other half pretend not to.',
  brief='''Every weeknight from 10 p.m. to 2 a.m. on WBIT, "Derik Dark" plays music and slips notices to listening Kindred: parties, rumbles, news dressed up as something else. The Elders keep telling him to be less obvious.

Off the air he is Barth, a skinny, geeky Toreador with a greasy mop of black hair and a voice far bigger than he is. He calls himself the only neutral in the Jyhad. He lives in a middle-class apartment in East Downtown.''',
  full='''A Louisiana storyteller Embraced in 1934 by Sondra, who promised he could tell stories forever. He has friends among the Blood Brothers and fears the Union, whose Caitiff could use an older generation's blood. He is looking for bodyguards.

He has taken Raul, Parovich's last childe, under his wing.''',
  secrets=[('Not quite neutral', 'He keeps Lucina warned about the Anarchs’ most destructive plans.')])

E('victor', t=1, alias='The scarred Tremere', kicker='Tremere · 9th generation', sub='Tremere (destroyed)',
  rumour='A Tremere with a scar who never smiled died inside the Chapel this autumn. The Tremere are not discussing it.',
  brief='''Victor was a Tremere with a deep scar across his right cheek who wore loose black clothes like a karate gi and moved like a tiger. He never smiled and always seemed about to kill somebody. He was destroyed this autumn inside the Chapel, the Tremere chantry on Highland Boulevard.''',
  full='''A CIA assassin who was sent in 1950 to kill a Greek noble and was Embraced by him instead. Vienna sent him to Milwaukee to watch its own people: Carna took her orders from him, and he passed on what Dr. Mortius needed.

He was killed in his own laboratory by Drake, a Lupine of the Mouse pack corrupted by the Wyrm, who walked through the Chapel's wards as if they were not there. His havens were hidden in the city's richest districts; the Chapel cleaned out most of them.''',
  secrets=[('His real orders', 'Vienna feared that whatever lies under the null zone might be strong enough to break a Blood Bond. Victor was to kill any Kindred who tried to control it, or perhaps take it himself.'),
           ('Who opened the door', 'The wards were weakened from inside. Jesselin of House Goratrix found a way in through Haberman’s correspondence and gave Drake the key.')])

E('mortius', t=0, alias='The recluse near Marquette', kicker='Tremere · 7th generation',
  rumour='There is a house near Marquette that mortals swear is haunted. Kindred who ask about it are told to stop asking.',
  brief='''Dr. Mortius is a Tremere scholar: a stooped, bearded old man with a hunchback and mottled skin, Embraced in his twilight years. He avoids other Kindred and their eyes, seems to drift off while you talk, and loves to show visitors magical gadgets that technology overtook long ago.

He lives in a house near Marquette that mortals believe is haunted, and he does not like to be disturbed.''',
  full='''A 16th-century sorcerer whose rediscovery of magic as a mortal earned him the Embrace in 1566. His mentor is a clan Elder, and Carna is under orders to accommodate him. He studies the null zone at Marquette; his ghoul retainers are skilled fighters who die often defending him from the Lupine.

Very few Kindred know he is in the city at all. Before the invasion only Decker and Parovich did.''',
  secrets=[('His dowsers', 'He uses the witches of the Church of Isis to search the city for him without risking himself. The rest of the Tremere would be appalled. Kayla is his eyes inside the Brujah.'),
           ('The ritual', 'The four antenna anchors around the city are his. With Victor dead nobody in Vienna checks his work.'),
           ('A forbidden ritual', 'His house is protected by Haunted House, a ritual the Tremere banned as a danger to the Masquerade. He learned it before the ban.')])

# ---------------------------------------------------------------- Anarchs
E('akawa', t=2, alias='The Blood Brothers’ chief', kicker='Brujah · 8th generation', sub='Leader of the Blood Brothers (missing)',
  rumour='The Blood Brothers have a chief nobody ever sees, and a wolf that rides on the back of their lead bike.',
  brief='''Akawa leads the Blood Brothers, the strongest Anarch gang in the city. He is a big Plains warrior with ritual scars across his chest and black hair to the middle of his back. He speaks in a stiff, old style of "sunrises" and "the final sleep", keeps no haven and rides with his gang, often in the shape of a wolf.

During the Sabbat invasion he disappeared. The Brothers say he was taken, and they do not know by whom. The gang is in turmoil.''',
  full='''Embraced in 1770 in Missouri by a stranger fleeing white settlers, he stayed with his tribe until it was driven away, and learned to love the city as a harsher wilderness. His plan was to unite every gang, mortal and Kindred, control the city's vessels and starve the Elders until they crowned him Prince.

He attacked the Public Museum over its exhibit of Native American bones, and Lucina's Toreador retaliated without understanding why. Several peace talks with Lucina at West Milwaukee Park failed; he never showed his face and spoke through a Blood Brother.''',
  secrets=[('His sire', 'His sire was Sir Edward Scott, who never remembered him. Akawa did, and meant it to be Scott’s undoing.'),
           ('Where he is', 'The Council holds him, in a cell in the steam tunnels under MECCA. Raoul’s people guard it.')],
  st=[('Playing him', 'Calm, observant, in control. You consider yourself a leader, and your plotting is worthy of an Elder.')])

E('wrecker', t=2, alias='A loud Blood Brother', name='Wrecker', kicker='Brujah · 9th generation',
  rumour='If a Blood Brother on a flame-painted hog challenges you to chicken, say yes and lose gracefully.',
  brief='''Wrecker is the Blood Brothers' muscle: black leather biker jacket, tight jeans, slicked-back hair, a lean cruel face and a cigarette even on the bike, a black hog with flames painted on the tank and a tire iron tied to it. He talks out of the corner of his mouth like a movie gangster and challenges strangers to games of chicken.

Since Akawa disappeared he and Ethan Stone are holding the gang together.''',
  full='''His name is Lewis, and only really stupid, soon-to-be-dead people use it. A Milwaukee ganger with no plan and no future, he was Embraced by Akawa in 1968 because Akawa needed muscle, and Akawa has looked out for him ever since. Cocky, violent and not bright. He respects anyone who loses to him in good spirit, frenzies if he is humiliated, and wants Turk dead.''',
  secrets=[],
  st=[('Playing him', 'Snide comments, mobster mumbling, a nuisance. You know you are cool.')])

E('ethan', t=1, alias='The archer', kicker='Gangrel · 10th generation',
  rumour='Somebody on the Blood Brothers’ rooftops puts wooden arrows through hearts at forty metres.',
  brief='''Ethan Stone is a Blood Brother: quiet, lean, with bowstring calluses. He specialises in rooftop and alley fighting and is a remarkably gifted archer; a wooden shaft through the heart at forty metres is his signature. Since Akawa's capture he and Wrecker have kept the Brothers from splitting.''',
  full='''A Gangrel among Brujah, he roosts on the roof of a grain elevator above the Menomonee Valley with a clear shot over half the gang's turf, and sleeps in an empty grain bin. He bought "charmed" arrowheads from Maximus McKenzie before the invasion.''',
  secrets=[('He kept one', 'He still has one of Maximus’s blood-magic totems, and he has not thrown it away.')])

E('dominique', t=0, alias='A kid who runs errands for the Brothers', kicker='Ghoul',
  rumour='A Camarilla Kindred went to check on a Blood Brothers errand-boy in Riverwest and never came back.',
  brief='''Dominique is an ordinary kid from the block who ran errands for the Blood Brothers. When a Camarilla vampire came to his flat, Dominique burned him down with a lighter and a can of air freshener.''',
  full='''He was made a ghoul and seriously discussed for the Embrace, but Akawa's capture and the political turmoil put everything on hold. He does not like waiting.''',
  secrets=[])

E('turk', t=2, alias='The Union’s warlord', kicker='Caitiff · 12th generation',
  rumour='Neonates crossing East Downtown travel in groups. The reason has a name.',
  brief='''Turk leads the East Side Anarchs Union, the second Anarch gang. He is very strong and very fit and likes to intimidate with it: denim jacket, loose blue sweatpants, curly black hair sticking up after a ride. Sombre and bitter.

The Union holds East Downtown and the lakeshore from an old riverboat at Veterans Park. It rarely attacks Elders, but neonates on its turf are at risk. It has been losing to the Blood Brothers, and it lost face for its ties to the late Prince.''',
  full='''He has lived on the streets since 1967, when he was nine, and joined Zulu Nation the day it reached Milwaukee in 1972. When the gang was broken he was Embraced by one of the victors, the Chicago Anarch Gengis, who left him a Caitiff. He has killed few Kindred and crippled many. The park's homeless are the Union's herd, so it rarely fights short of blood. He fears fire beyond reason, and sleeps on the water because of it.

His lieutenant Lars runs most of the dangerous raids; Turk hopes they will kill him. The Prince forbade Turk to make the childer he needed.''',
  secrets=[('Diablerist', 'Turk is 12th generation because he drank the leader of a rival Anarch gang.'),
           ('The Prince’s pawn', 'For five years Merik was bringing the Union under Domination and Blood Bonding its key figures. It was the Union that ambushed the Mask and the Blood Brothers.'),
           ('Esau', 'A hairy old Malkavian called Esau has been whispering to him that every Kindred in the city is out to get him. Turk believes it, and calls him “the man”.'),
           ('Gengis', 'His sire once came back for a single night, on the run from Chicago, and shared blood with him. If anything happened to Turk, Gengis would be here in an instant.'),
           ('New friends', 'The Union has grown weak enough to find allies where it can. Lupines have swum the lake and used the lakefront parks to reach it.')])

E('milo', t=2, alias='The man who talks about IT', kicker='Malkavian · 11th generation',
  rumour='Sooner or later every neonate meets the vagrant who says something in the lakeshore drains will eat us all.',
  brief='''Milo is a Malkavian of Japanese descent who looks like a vagrant, in torn and dirty clothes, with an almost handsome voice. He never sleeps in the same place twice. He insists that something woke in a drain pipe by the lake and will eat every Kindred in the city, one by one. He tells the story differently every time.

Some nights he is perfectly normal, friendly and talks about ordinary things. It never lasts.''',
  full='''His sire fed on him in a Chicago asylum the night he had taken angel dust and purple microdots, and drank his nightmare. The Prince of Chicago spared Milo as an innocent victim, destroyed his sire and banished him. He came to Milwaukee for safety and slept in old drains and burned-out buildings until IT found him.

He distrusts Akawa and holds Kristian in contempt.''',
  secrets=[('IT is real', 'Something really did follow him out of the lakeshore drains. The dead would call it a Spectre.')])

# ---------------------------------------------------------------- Anubi
E('decker', t=2, alias='The Anubi commander', kicker='Gangrel · 9th generation',
  rumour='If you want to talk to the man who keeps the wolves out, drive Good Hope Road after dark and wait.',
  brief='''Mark Decker commands the Anubi, the Gangrel-led guard that patrols the Outlands and fights the Lupine so that the rest of the city does not have to. He is tall and very pale, with jet-black hair, always in black or camouflage, and he seems the most honest vampire in Milwaukee. Whatever topic you raise, he will bring it back to the Lupine.

He never took his seat on the Council, and the Council thinks he is a madman. Good Hope Road is his patrol route.''',
  full='''A Revolutionary militiaman Embraced in 1777 by Lucian, who took him in his tent. He became a rich man in Alabama, fled north after the Civil War, and held off a Lupine siege of his country house for thirteen days. He warned the Council before the New Year's Eve attack of 1900 and has warned it ever since; his last report was so scathing that the Council decided the threat was imaginary.

He commands six to nine Kindred who would follow him into the noonday sun, and suburban police who think he runs a neighbourhood crime watch. He carries a shotgun loaded with silver buckshot. He could seal every road out of the city if he chose. The Sabbat meant to kill him first; it failed. Jade Riley now sleeps inside his patrol zone, and he has not decided what that means.''',
  secrets=[('Werewolf vitae', 'He loves the taste of Lupine blood. It is his secret and his alone.'),
           ('Julia', 'Julia Calvin is his childe, Blood Bound and in love with him. He keeps it hidden so that no one can use her against him.'),
           ('Riding the Winds of Decay', 'Some of his Gangrel run with Lupine packs under the full moon, in wolf form, and a few have been accepted. Hrothulf knows and calls it a necessary evil.'),
           ('Mortius', 'He knows Dr. Mortius is in the city and suspects he is looking for the same thing the Lupine are.')],
  st=[('Playing him', 'Be open and honest with the players. They will be shocked. Wander back to the Lupine whatever the subject.')])

E('thomas', t=1, alias='A boy-faced Anubi', kicker='Gangrel · 11th generation',
  rumour='One of Decker’s Anubi looks sixteen and has eyes that look straight through you.',
  brief='''Thomas Gerhieren is an Anubi veteran: boyish, rumpled blond hair, soft pastel-blue eyes, wrinkled clothes. Look at his face and you see age that should not be there. He talks only when he must and is always busy with something, a knife or a magazine of silver rounds. After twenty years he would lead the Anubi if Decker fell.''',
  full='''Embraced in 1971 at sixteen by Wendy, the girl he loved, who was carried off by Werewolves soon after. Despair drove him into a frenzy that killed four people and then out into Lupine country, where Decker's ambush saved him. He joined the next night.

He sleeps in the homes of rich teenage girls from the Outlands high schools when their parents are travelling.''',
  secrets=[('What Wendy wanted', 'Wendy told him she knew where to find items of great power. The Werewolves came for her the same week.')])

E('julia', t=1, alias='The Anubi assassin', kicker='Gangrel · 10th generation',
  rumour='Decker’s guard has a woman who corrects your mistakes very loudly. Do not make any.',
  brief='''Julia Calvin rides with the Anubi: thin, gaunt and beautiful, dark hair tied up for a fight, moving with a cat's grace that some find attractive and many find frightening. She is rude, loud about other people's mistakes and respected as a warrior despite her few Disciplines.''',
  full='''Born on the street, raised by a homeless Korean War veteran, she begged, stole, sold herself and finally killed for money. In 1989 she took a contract on a pale man who appeared only at night. He caught her, kept her chained in his basement for a week, and Embraced her. Her contacts are criminals and prostitutes all over the city.''',
  secrets=[('Bound', 'She is Blood Bound to Decker and loves him with all her heart. If he dies she will understand what was done to her, and may be the only one who can stop the Anubi from going after his killer.')])

# ---------------------------------------------------------------- Malkavians
E('jacob', t=0, alias='A kindly old gentleman', name='Jacob', kicker='Malkavian · 5th generation', sub='A gentleman in Greendale',
  rumour='A fatherly old Kindred seems to know everyone’s grievances and gives very good advice.',
  brief='''Jacob is a distinguished, fatherly Malkavian who keeps a mansion at the very edge of Kindred territory in Greendale. He seems harmless and wise. He says there is no Jyhad, only predators who fight, and warns everyone he meets about his mad brother Esau.''',
  full='''Enslaved as a boy in Islamic lands, he learned that his only dignity was in how he carried himself, and he walks tall to this day. He was Embraced in 750 and is one of the oldest Kindred in the city. He recruits pawns against Esau and is very good at it: he does not start the city's feuds, but he pours oil on every one of them, and the people who fight in his war die quickly.''',
  secrets=[('One Kindred', 'Jacob and Esau are the same Kindred. He created the Esau personality when he was Embraced, and the two have been trying to destroy each other ever since. Each always seems to know what the other plans.'),
           ('Coax', 'His Presence and Auspex go beyond anything taught in the city. He senses what people fear and want and brings it to the surface, and people find they cannot refuse what he asks.'),
           ('Mad ghouls', 'Both of him have let insane ghouls loose in the city. When one is caught, the murders shake the Masquerade.')],
  st=[('Playing him', 'Flatter, coax, threaten, anything to get them on your side. You are mad, and your talk can fall apart without warning.')])

E('esau', t=0, alias='A hairy old Malkavian', name='Esau', kicker='Malkavian', sub='A condo north of downtown',
  rumour='There is an old Kindred with a lot of hair and a lot of opinions who seems to know where every Anarch grudge is buried.',
  brief='''Esau is an old Malkavian, hairy and threatening, with an expensive condo just north of downtown. He says the city's evils are the work of his brother Jacob, a liar mad for power, and that together you can bring him down.''',
  full='''He coaches Turk and the Union against the Blood Brothers, and Turk calls him "the man". He visited Sir Edward Scott regularly and planted thoughts about Lucina. He treats Gracis as pretentious and Jason as untrustworthy.''',
  secrets=[('One Kindred', 'Esau is Jacob. There is only one of them.')])

# ---------------------------------------------------------------- Nosferatu
E('anastasia', t=1, alias='A girl in a faded party dress', kicker='Nosferatu · 8th generation',
  rumour='Parovich had childer who ran from him. One of them is said to keep a little zoo of stray cats.',
  brief='''Anastasia is one of Parovich's runaway childer. She still looks young and still wears the frilly dress she had in high school, faded now to a dingy brown. She hides in empty cellars and storm drains with a little zoo of stray cats, drinks from them when she can, and asks handsome strangers whether they like her hair.

Parovich told the Council his childer were dangerous psychotics. Since his exposure nobody believes it.''',
  full='''A car crash killed her parents and wrecked her face, and Parovich came to "help". She fled with Kristian when he discovered what their sire was. Her haven is a dry utility room in the steam tunnels under her old school. Kristian visits once a week and always brings her something nice.''',
  secrets=[('She doesn’t believe it', 'She took the news of her sire’s destruction in silence. She does not believe it.')])

E('kristian', t=1, alias='Parovich’s runaway son', kicker='Nosferatu · 8th generation',
  rumour='Parovich’s runaway childer had a leader, and the leader is still out there.',
  brief='''Kristian led Parovich's childer into hiding when he found out what their sire was. Lean and compact, with a hard, almost noble face under the Nosferatu warts, young and cocky, he talks over people and does not take advice. He feels responsible for Anastasia.''',
  full='''He beat his abusive father to death with a baseball bat at sixteen, and Parovich took him from Juvenile Hall. He found out about the Black Hand by listening at doors, gathered his brother and sisters and told them to scatter; two are dead anyway. He sleeps in the basement of an elderly couple who never notice him. Scott and Jason have both used him for favours, and Jason owes him one.''',
  secrets=[('It doesn’t add up', 'He met his sire’s fall without joy. No ash he saw, no witness he trusts. Too much about the story does not add up.')])

E('raul', t=1, alias='A Nosferatu who sells street gossip', kicker='Nosferatu · 8th generation',
  rumour='There is a Nosferatu who will tell you anything about the street for a price. Half of it is true.',
  brief='''Raul was Parovich's last childe: a short, whining weasel of a man, warts and no hair, who thinks he is as bad as they come. He sells street information, asks large bribes for trivial details and is wrong as often as right. He still hangs around his dead master's boarded-up mansion.''',
  full='''A grey-market car dealer who liked cocaine, Embraced in 1990. He gave Parovich all his money, defended him to Kristian and threatened to tell on him. Parovich made him drink often. Barth has taken him under his wing.''',
  secrets=[('The pull', 'He is still Blood Bound. Some nights the bond drags him downward, toward the drains and the tunnels. He has not followed it yet.')])

E('cricket', t=1, alias='The card-file man', kicker='Nosferatu · 11th generation',
  rumour='At the Rat Market there is a fidgety Nosferatu who keeps a card on everyone in the city. Possibly including you.',
  brief='''Cricket is a young, fidgety Nosferatu with a face like an insect's. He taps telephone lines and police frequencies, keeps a card file on everyone in Milwaukee and sells what he knows at the Rat Market.''',
  full='''He keeps the Nosferatu rumour archive in the basements under the Milwaukee Journal building, and answers to Mother Agatha.''',
  secrets=[])

E('dust', t=0, alias='A Nosferatu covered in stone dust', name='Brother Dust', kicker='Nosferatu · 10th generation',
  rumour='',
  brief='''Brother Dust is a quiet Nosferatu coated in stone dust who keeps watch over a sealed door deep in the Warrens.''',
  full='''For decades he visited the Michigan Pocket, an impossible cave under the lake, as a guest of the sluagh changelings, and helped them "carry" condemned buildings into it. Since Parovich went over to the Sabbat the door has been shut. He keeps watch on this side and hopes Ivory will open it one day.''',
  secrets=[])

# ---------------------------------------------------------------- independents
E('badr', t=1, alias='The Assamite', kicker='Assamite · 9th generation',
  rumour='Somebody in this city takes contracts from Elders and Anarchs alike and is paid in vitae. Everyone knows someone who knows how to reach her.',
  brief='''Badr-al-Budur is an Assamite assassin: a solidly built Arab woman in loose business suits, black hair tied up. She speaks very little. She travels the Northwest on contracts but always returns to her small condominium near the University of Wisconsin–Milwaukee. Anarchs hire her to kill Elders, Elders hire her to kill Anarchs, and with the Prince dead business is about to boom.''',
  full='''She is paid in the blood of Kindred of the 9th generation or lower, shipped to her clan in Turkey. If she dies trying to fulfil a contract, no Assamite will ever take that target again. And she remembers everything about her employers, in case she is ever hired to kill them.

Embraced in 1867, she is descended in the blood from Fatimah, the woman who forced Alamut to accept women as assassins, and she fights her own clan's prejudice still.''',
  secrets=[])

E('gunther', t=1, alias='An old Gangrel with a pipe', kicker='Gangrel · 9th generation',
  rumour='There is a Gangrel who lives on the river above the dam and was in the city before it had a name.',
  brief='''Gunther is red-bearded, with braids at his temples, a pipe that never leaves his hand and a leather coat that smells of smoke and lake. He lives in an old boathouse on the pond above the North Avenue dam and keeps to himself.''',
  full='''He came in the 1840s, when the city was still Kilbourntown, and served Merik as a kind of gamekeeper: the man for errands beyond the city line. He was a friend of Erica, the Prince's wife, and through her of the Mouse pack of Lupines. He is the last Kindred the Mouse ever trusted.''',
  secrets=[('Mercer', 'He still meets Mercer, the last Garou of the Mouse, at the boathouse.'),
           ('Erica', 'He wants to know how Erica really died, and he suspects Merik. If it is true, he served her killer for half a century.')])

# ---------------------------------------------------------------- Tremere of the Chapel and House Goratrix
E('annalena', t=0, alias='A Tremere alchemist', kicker='Tremere · 6th generation',
  rumour='',
  brief='''Annalena is the Chapel's alchemist, one of the oldest Tremere in the city. She is said to have been a mage of House Tremere before it became a clan of vampires.''',
  full='''She remembers the taste of real magic and looks for it in her flasks. She recently led an unsanctioned expedition into the Gloaming Keep, a changeling stronghold in the Dreaming, lost several valuable ghouls there and earned the anger of the fae. Her flight ended at a convenience store that no longer exists. She is on thin ice with the Chapel's council and the changelings alike.''',
  secrets=[('What she brought out', 'She brought something out of the Keep. Ivory knows exactly what.')])

E('haberman', t=0, alias='A Tremere librarian', kicker='Tremere · 8th generation',
  rumour='',
  brief='''Benjamin Haberman is a Tremere researcher and archivist at the Chapel: long hair, half-moon spectacles, rings in one ear, a pinstriped waistcoat and the smile of a man who knows where the right book is.''',
  full='''Embraced in Vienna in the 1890s, he has spent the century on blood genealogy, the bibliography of the forbidden and gossip. Without Vienna watching he has blossomed: he orders books he once had to hide and corresponds with half the occult booksellers of the Midwest. He is writing a history of the null zone and wants access to St. Joan of Arc Chapel before the ritual begins.''',
  secrets=[('His correspondent', 'One of his society correspondents is Jesselin. He suspects her and thinks he is playing her. She thinks the same.')])

E('newman', t=0, alias='A pale Tremere with pointed ears', kicker='Tremere · 9th generation',
  rumour='',
  brief='''Luke Newman is a Tremere researcher, acting head of security at the Chapel: bald, chalk-pale, with pointed ears and thick round spectacles, the mark of an old ritual gone wrong that he does not discuss. A pedant and a man of lists.''',
  full='''A specialist in wards and boundaries, he was given security after Victor's death because he knows best how wards break. He rebuilt the Chapel's defences in three nights, started a visitors' log and vets even the Church of Isis ghouls. He also built the antenna rigs for the four anchors of the Chapel's ritual.''',
  secrets=[('He knows', 'He already knows the leak ran through Haberman’s correspondence. He is keeping quiet to catch whoever is on the other end.')])

E('maximus', t=1, alias='The tattooed Scot', kicker='Blood sorcerer · 9th generation',
  rumour='Before the invasion half the Caitiff in the city wore a charm from a tattoo parlour in Bay View. The tattooist has vanished.',
  brief='''Maximus McKenzie is a charming Scot with tattooed forearms who ran Charms & Needles, a tattoo parlour in Bay View. Through the back door he sold Union Caitiff and Anarchs cheap, effective blood-magic charms: wards, silencers, "luck in a fight". He vanished when the Sabbat invasion failed, and the Council would like a word.''',
  full='''He is a Tremere of House Goratrix, the Sabbat's own sorcerers. He helped the infiltration, and with Jesselin he defiled the protected places in the Root River woods so that a plague of Banes would keep the Lupine busy while the Sabbat moved in. Every charm he sold was made with Sabbat blood and tied its owner to him a little.''',
  secrets=[('He never left', 'He never left the city. His cache is in a sewer under Bay View, and every totem he sold is his ear and his eye.')])

E('jesselin', t=0, alias='Miss Lascelles', kicker='Kindred · clan unknown', sub='Patroness of charity balls',
  rumour='A new patroness at the opera, “Miss Lascelles”, never seems to be seen at lunch.',
  brief='''As "Miss Lascelles" she is a patroness of charity balls and opera boxes who lives under another name in a suite at the Pfister and lunches with a city councilman's wife.''',
  full='''She is Jesselin, a sorceress of House Goratrix, the Sabbat's Tremere. She scries the Chapel to learn what it has found under the null zone, means to take it, and with Maximus she corrupted the Mouse pack and poisoned the forest's places of power. The Chapel does not know she exists.''',
  secrets=[('Victor', 'She gave Drake the way through the Chapel’s wards. Victor’s death is her work.'),
           ('Drake', 'She whispered to Drake through his dreams for weeks before the invasion, and he opened the Granary’s doors to her himself.')])

# ---------------------------------------------------------------- the Sabbat
E('dragos', t=2, alias='The Milwaukee Dragon', kicker='Tzimisce · 6th generation',
  rumour='The thing on the late news really was a dragon. It is dead now.',
  brief='''Dragos Dalca was the Sabbat elder behind this autumn's invasion, an old Carpathian master of flesh. He was the "Milwaukee Dragon" caught on the late news chasing three figures over the Kinnickinnic Avenue rooftops. Jade Riley killed him with her hands at the Lakeside fish plant, in front of hundreds of witnesses. Officially, an ammonia explosion.''',
  full='''He built an army of sculpted abominations from the homeless his servants trucked in from under the viaducts and from whatever came off the fish plant's conveyors. He kept his workshops in the Cudahy railside warehouses and in tunnels under the Menomonee Valley. Most of his creatures died in the fighting; nests and loners live on, especially underground.''',
  secrets=[('His apprentice', 'His childe Castor survived and keeps the surviving creatures in the flesh tunnels.'),
           ('The vozhd', 'Before he died he melted Parovich into a vozhd, a colossus of fused flesh that still lives in the Deep Tunnel drifts.')])

E('guillem', t=2, alias='The Sabbat commander', kicker='Lasombra · 8th generation',
  rumour='The Camarilla has put a price on the Sabbat’s commander. Nobody has collected.',
  brief='''Guillem Velez, a Lasombra, commanded the Sabbat's infiltration of Milwaukee: a Catalan with perfect manners and a soldier's bearing. When the invasion failed he went into the shadows with a handful of loyalists, and the Camarilla has put a price on his head.''',
  full='''He kept contact with the Sabbat's local collaborators (Parovich, Maximus, some Anarchs), recruited the shovelheads and ran the operation from a closed church in Walker's Point. The Camarilla found it empty: he left a day before the raid, and someone warned him.''',
  secrets=[('Where he hides', 'A decommissioned yacht under a borrowed name in the McKinley marina, and the Black Water cistern under Walker’s Point. He never spends more than two nights running anywhere.'),
           ('Gnaw', 'He keeps feeding a Bane called Gnaw with blood so that the Eagle Lupine keep raiding and the Garou and the Camarilla never make peace.'),
           ('What he waits for', 'He is holding out for reinforcements from Detroit, or at least for a chance to take someone important with him. He knows where the vozhd is.')])

E('castor', t=0, alias='A Tzimisce who keeps changing his face', kicker='Tzimisce · 7th generation',
  rumour='',
  brief='''Castor was Dragos's childe and journeyman: graceful, boneless, forever changing his face.''',
  full='''He hides in the flesh tunnels under the Menomonee Valley and feeds his master's surviving creatures. He thinks of them as his children.''',
  secrets=[])

E('noemi', t=0, alias='A Sabbat ductus', name='Noemí Santana', kicker='Brujah antitribu · 11th generation',
  rumour='',
  brief='''Noemí Santana leads the last true Sabbat pack in the city, the Black Water: three vampires and a couple of surviving shovelheads. Angry, funny, hungry.''',
  full='''She guards Guillem Velez, though she does not like him.''',
  secrets=[])

E('hieronymus', t=0, alias='A Sabbat priest', kicker='Malkavian antitribu · 10th generation',
  rumour='',
  brief='''Hieronymus is the priest of the Black Water pack. He performs the Vaulderie in a flooded cistern and preaches to the rats.''',
  full='''He hears the vozhd through the stone and calls it "the Choir".''',
  secrets=[])

E('vozd', t=0, alias='Something huge in the Deep Tunnel', kicker='Tzimisce war-ghoul (vozhd)',
  rumour='Workers on the Deep Tunnel project have stopped going into one of the drifts.',
  brief='''A vast mass of flesh that Dragos sculpted from ghouls, shovelheads and prisoners lives in the construction drifts of the Deep Tunnel. There is a mind in it.''',
  full='''It moves slowly and hides well. The Black Water pack can hear it through the stone.''',
  secrets=[('Parovich', 'One of the faces in its flank belongs to Parovich. The former Primogen was not destroyed: Dragos melted him into the vozhd as punishment and as a spare brain. He remembers everything and sometimes speaks through its mouths.')])

# ---------------------------------------------------------------- the Kiasyd
E('soraya', t=0, alias='A woman with black eyes', kicker='Kiasyd · 9th generation',
  rumour='',
  brief='''Soraya is tall, with eyes entirely black and a voice like turning pages. She keeps out of politics and rarely leaves her hidden mansion on Yankee Hill. She sometimes receives guests, the ones who manage to find the door, and pays for books with knowledge.''',
  full='''She cares for her sire, Lucretian Vane, who went mad studying the Malkavian madness, and she wants a way to give him back his mind.''',
  secrets=[('The voice', 'In his ravings her sire sometimes speaks in the voice of the null zone.')])

E('vane', t=0, alias='A mad scholar', kicker='Kiasyd · 8th generation',
  rumour='',
  brief='''Lucretian Vane is Soraya's sire, a scholar who tried to dissect the Malkavian madness as a science and lost.''',
  full='''He wanders the rooms of the house that isn't there, rearranging mirrors and talking to people who aren't present.''',
  secrets=[])

# ---------------------------------------------------------------- Brujah circle and the Church of Isis
E('macy', t=0, alias='A protest-march regular', kicker='Ghoul',
  rumour='',
  brief='''Macy Carver is pushing forty and looks twenty: a trust-fund kid and rebel by vocation. Gulf War marches, squats, raves, eco-camps: wherever someone is protesting something, she is there.''',
  full='''She is Jade Riley's ghoul and oldest confidant, and everything she learns she brings to Jade. She wants Jade to finally do something truly radical.''',
  secrets=[('Her house', 'The Brujah Primogen sleeps in Macy’s little blue house in Wauwatosa.')])

E('jamie', t=2, alias='The Rust Saints’ singer', kicker='Brujah · 10th generation',
  rumour='The singer of the Rust Saints only plays after dark. People who have been to a show say that is not a coincidence.',
  brief='''Jamie Robinson is the voice of the Rust Saints and one of the most recognisable faces in the city's punk scene; the band plays the Rusty Nail in Riverwest. He is Jade Riley's childe, Embraced for his fury and his ability to hold a room.''',
  full='''His family's gas station stood on Highway 41 for thirty years, until it was condemned for a widening. One morning the demolition crew found an empty pad: no foundations, no pumps, no fuel stains.''',
  secrets=[('The station', 'Ivory carried the station off to the Michigan Pocket. Jamie has been there. The pumps still work, and he cannot decide whether he wants it back.')])

E('kayla', t=0, alias='A woman with a notebook', kicker='Ghoul',
  rumour='',
  brief='''Kayla is calm, observant and never without a notebook; a sister of the inner circle of the Church of Isis.''',
  full='''She is a ghoul who works for Jade Riley and for Dr. Mortius at the same time, and each of them believes she is theirs first.''',
  secrets=[('Three masters', 'She tells each of them different things and writes the truth down only for the Church.')])

E('arianna', t=0, alias='An Egyptology student', kicker='Ghoul',
  rumour='',
  brief='''Arianna is an Egyptology student at UWM and a sister of the Church of Isis.''',
  full='''A ghoul trusted with too much, too soon, she sometimes deals with the Chapel directly, carrying books, blood and messages without the Church's go-betweens. Haberman finds her "charmingly useful".''',
  secrets=[])

# ---------------------------------------------------------------- ghouls and servants
E('raoul', t=2, alias='MECCA’s head of security', kicker='Ghoul',
  rumour='',
  brief='''Raoul runs security at MECCA. He was a karate champion before he was given immortality; now he and a team of heavily armed mortal guards stop every Anarch raid just past the lobby.''',
  full='''Gracis feeds him and considers him a wonderful deterrent against "undesirables".''',
  secrets=[('The cell', 'His people guard a cell in the steam tunnels under MECCA. Its prisoner is Akawa.')])

E('vrasks', t=2, alias='The man at Jungleman', kicker='Ghoul',
  rumour='There is a bar on Townsend Street where you can buy a death, paid in vitae.',
  brief='''Vrasks owns Jungleman, a small dance bar on West Townsend Street beside Wanderers Rest Cemetery. He is a very powerful ghoul and a known assassin: he will kill anybody, or so he says, for enough Kindred blood to keep him immortal. He also buys blood from Anarchs who are short of cash.''',
  full='''Where he came from and what he is doing in Milwaukee nobody knows. What became of his master is uncertain; rumour says the master is still in the city and quietly backs him.''',
  secrets=[])

E('venturi', t=1, alias='The Prince’s messenger', name='Mr. Venturi', kicker='Ghoul',
  rumour='The late Prince’s errand-man is still walking around. Nobody knows whose errands he runs now.',
  brief='''Mr. Venturi was the late Prince's messenger: a big, heavy man in a tasteless suit and a tan hat, half his left ear missing, mouth always shut tight. He never looks at the person he is talking to.''',
  full='''A Mafia tough born in 1903, he worked for Merik since the liquor days. Being a ghoul barely changed his life. He has grown very bored of it, and the kindness that was never in him seems to be coming out at last: he is surprised by anyone who looks out for him.''',
  secrets=[('The last night', 'If one of the Mask pulled him out of a burning car, he turned on the Prince at the end.')])

E('demetri', t=0, alias='An old, mad Nosferatu', kicker='Nosferatu',
  rumour='',
  brief='''Demetri is an old Nosferatu who went mad over the centuries and was the late Prince's Dominated servant.''',
  full='''He hid the ghoul ambush in Merik's penthouse with Obfuscate. As a young vampire he discovered a hallucinogen that opens Kindred to their own powers and wears away their minds; Merik used it on the Mask. Whether he survived the Prince is unknown.''',
  secrets=[])

# ---------------------------------------------------------------- mortals and hunters
E('wilks', t=1, alias='A homicide lieutenant',
  rumour='A police lieutenant has been asking questions about the “Vampire Murderer” case long after it was closed.',
  brief='''Lieutenant James Wilks of Milwaukee Police homicide is a no-nonsense cop in his mid-thirties from a small Midwestern town, unmarried and likely to stay that way. He is respected in the department and wants his captain's bars.''',
  full='''He chased the "Vampire Murderer" this autumn, was captured and held in the dungeon of the Prince's house, and escaped with the Mask while it burned. He ran to meet the fire trucks and kept his silence. He has an unusually strong will.''',
  secrets=[('He knows', 'Wilks knows what Kindred are. He promised silence and may come to the Mask for help on hard cases. If provoked he could turn a small, dangerous wing of the police against the Kindred.')])

E('urgen', t=1, alias='The German hunter',
  rumour='The Anarchs say an Inquisitor is hunting in Milwaukee: a German woman who works alone.',
  brief='''Lisa Urgen is an Inquisitor who hunts Kindred alone. German, rumoured to have destroyed the Prince of Hamburg, she was in New York and then Chicago before Milwaukee. She has been seen with a flamethrower.''',
  full='''She was eighteen with twin babies in the ruins of postwar Germany when a starving vampire came to her house and drained her husband and children before her eyes. She has hunted Kindred across two continents since. She works with the Society of Leopold when it suits her, rarely by its methods. This autumn she trapped the Mask on the roof of a burnt-out lakeside hotel ten minutes before dawn.''',
  secrets=[('Untouchable', 'Dominate and Presence simply do not work on her.')])

E('wolfgang', t=0, alias='A mechanic in West Allis', kicker='Mortal · hunter',
  rumour='',
  brief='''Wolfgang is a taciturn auto mechanic in West Allis, oil to the elbows.''',
  full='''He is one of a small group of vampire hunters. He builds their cars, traps and flamethrowers from spare parts in his two-bay garage, and started hunting after a customer vanished from his shop.''',
  secrets=[])

E('rudeus', t=0, alias='A loud Scandinavian', kicker='Mortal · hunter',
  rumour='',
  brief='''Rudeus Frost is a huge, loud Scandinavian who laughs in a fight and thinks hunting is the best way to spend a night.''',
  full='''He fights with a sword alongside Wolfgang and Doctor Fire. There is faerie blood in his family, so he sees more than he should and is not afraid of what he ought to fear.''',
  secrets=[('A well-wisher', 'Ivory sees kin in him and quietly helps the group: hints, luck, sometimes a dream on the right night.')])

E('drfire', t=0, alias='A professor of archaeology', kicker='Mortal · hunter',
  rumour='',
  brief='''"Doctor Fire" is a professor of archaeology at UWM.''',
  full='''He found more in old expedition notes than he was looking for and taught himself to conjure fire. He is the hunters' brain. His magic is crude and dangerous, first of all to himself.''',
  secrets=[])

# ---------------------------------------------------------------- Lupine seen from the city
E('horatio', t=1, alias='The Coyote leader', kicker='Lupine · Coyote pack',
  rumour='Decker says the biggest pack out there has a leader who thinks before he bites. He says that is the bad news.',
  brief='''Horatio Sims leads the Coyote, the largest Lupine pack around Milwaukee: just under a dozen strong. In human shape, which he takes only to negotiate, he is short and square-jawed. He is the most rational of the Lupine leaders, and therefore the most dangerous.''',
  full='''He is a wolf born, of the Red Talons, with exactly as much humanity as the job requires. This autumn he freed the Mask from the Mouse pack's cave on Route 43, because a broken Masquerade would expose the Lupine next. He wants to hold Marquette long enough to dig, burn the Banes out of the southern woods and do it without a war he cannot win.''',
  secrets=[('Under Marquette', 'What he wants is buried under St. Joan of Arc Chapel: the Eye of the Coyote and the Talon of the Eagle, stolen by Usla three centuries ago.'),
           ('One partner', 'He has begun to suspect the totems cannot be taken back by one clan alone, and that the Eagle are the only partner he has. The Mouse pack’s fate showed him the Wyrm came in through the city, and that frightens him.')])

E('drake', t=0, alias='A wolf in the drains', kicker='Lupine · Mouse pack', sub='A Lupine of the Mouse pack',
  rumour='',
  brief='''Drake is a Lupine of the Mouse pack: usually a large wolf, otherwise a chubby, bald, middle-aged man. He hates the city's Kindred and has lost friends to the Anubi.''',
  full='''He carried messages between the late Prince's killers and his pack leader this autumn. During the Sabbat invasion he was broken and given to the Wyrm. He got inside the Chapel and killed Victor, then vanished. They say he hides in the tunnels under the city.''',
  secrets=[('He opened the door himself', 'The corruption was not forced on him: Jesselin whispered to him through his dreams for weeks, and he opened the Granary’s doors to her himself.'),
           ('His den', 'He hides in the storm sewers under the concrete Kinnickinnic, and he is not alone down there.')])
