"""Chronicle pages. The player pages say what a neonate has been told; the original, complete pages are
kept as Storyteller pages (hidden from players) with the same order, so the GM sees both."""
import copy

H = {}

H['pg-strife'] = ('What every neonate is told', '''<p class="lead">Some thirty or forty Kindred hold a city of 628,000 under a permanent Lupine siege. Every road and railway out of town runs through Werewolf country, so few Kindred come in and fewer leave. Since October there has been no Prince.</p>
<div class="tl"><button type="button" data-link="hist-kilbourn"><span class="yr">1830s–40s</span><span class="tx">Hrothulf and Gracis rule rival towns on either side of the river and fight a war of assassins. In 1845 the bridges come down.</span></button><button type="button" data-link="hist-1900"><span class="yr">31 Dec 1900</span><span class="tx">The Lupine break into the city. Prince Pointene dies; Terence Merik leads the counter-attack.</span></button><button type="button" data-link="graceland"><span class="yr">1901–06</span><span class="tx">The Elder war. Duels in the cemeteries; Hrothulf takes the throne and creates the Council of Elders.</span></button><button type="button" disabled><span class="yr">1923–30</span><span class="tx">Hrothulf survives an assassin and steps down. Merik takes the city in 1930 and rules for sixty years.</span></button><button type="button" data-link="ps-scene"><span class="yr">Autumn 1991</span><span class="tx">The "Vampire Murderer" fills the Journal's front page. The Prince dies when his house burns.</span></button><button type="button" data-link="c-breach2"><span class="yr">Late autumn 1991</span><span class="tx">The Sabbat tries to take the city and fails.</span></button></div>
<div class="note"><b>The rules you were taught.</b> Keep the Masquerade, especially now. Never cross the Anubi line without Decker's say-so. Do not fight at the Zoo, at West Milwaukee Park or in Elysium. In Union turf, travel in groups. Leave Old St. Mary's alone. Stay away from the Army Reserve Center. Ask before you hunt in another Kindred's domain.</div>''')

H['pg-invasion'] = ('This autumn', '''<p class="lead">You were Embraced into a city at war with itself. This is what everyone says happened; nobody tells it the same way twice.</p>
<div class="tl"><button type="button" data-link="ps-scene"><span class="yr">September–October</span><span class="tx">Drained bodies on the Journal's front page: the "Vampire Murderer". The Council says it was a rogue Kindred.</span></button><button type="button" data-link="ps-house"><span class="yr">October</span><span class="tx">Prince Merik dies when his house on the hill burns. The Council declares the matter settled.</span></button><button type="button" data-link="c-victor-death"><span class="yr">October</span><span class="tx">Something kills a Tremere inside the Chapel. The Tremere will not discuss it.</span></button><button type="button" data-link="h-parovich"><span class="yr">The night of the invasion</span><span class="tx">The Sabbat comes up from below. Parovich, the Nosferatu Primogen, is exposed as their agent and destroyed. Sir Edward Scott dies in the fighting. Akawa of the Blood Brothers disappears.</span></button><button type="button" data-link="c-breach1"><span class="yr">The same night</span><span class="tx">The late news shows something like a dragon chasing three people over the Kinnickinnic Avenue rooftops.</span></button><button type="button" data-link="c-breach2"><span class="yr">Dawn</span><span class="tx">Jade Riley kills the dragon, the Sabbat elder Dragos Dalca, with her hands at the Lakeside fish plant, in front of hundreds of witnesses. Officially, an ammonia explosion.</span></button><button type="button" data-link="c-guillem-church"><span class="yr">Since then</span><span class="tx">The Camarilla raids the Sabbat's headquarters in a Walker's Point church and finds it empty. Their commander, Guillem Velez, has a price on his head.</span></button><button type="button" disabled><span class="yr">Now</span><span class="tx">No Prince. Jade Riley sits in the Brujah seat and Mother Agatha speaks for the Nosferatu. Things the Sabbat made are said to live in the tunnels.</span></button></div>''')

H['pg-outside'] = ('Outside pressure', '''<p class="lead">Chicago is watching. Its Prince would like a friendlier ruler here, and some of his people are said to be buying influence already. Sheboygan and Green Bay covet the city, and the Anarchs of Madison would love to see it fall to the gangs.</p>''')

H['pg-council'] = ('The Council of Elders', '''<table class="council"><tbody><tr><td>Ventrue</td><td>Gracis Nostinus</td><td>Wants the throne; hates Hrothulf</td></tr><tr><td>Toreador</td><td>Lucina</td><td>Usually votes with Gracis</td></tr><tr><td>Tremere</td><td>Carna</td><td>Openly supports Gracis</td></tr><tr><td>Nosferatu</td><td>Mother Agatha</td><td>Speaks for the Warrens since Parovich's fall</td></tr><tr><td>Brujah</td><td>Jade Riley</td><td>Appointed over the local Brujah; killed the dragon</td></tr><tr><td>Malkavian</td><td>Jason</td><td>The swing vote; hears petitions from anyone</td></tr><tr><td>Gangrel</td><td>(empty)</td><td>Decker never took his seat</td></tr></tbody></table><div class="note">Before the invasion the Council was deadlocked three to three over Parovich's proposal to restore a seventh seat. Nobody knows yet how Mother Agatha and Jade Riley will vote, and every faction is counting.</div>''')

H['pg-pins'] = ('Reading the pins', '''<div class="note"><b>Reading the pins.</b> Colour shows who holds the site. Solid ring: a well-known address. Dashed: the area is known and the exact spot is a guess. Dotted: placed by rumour. Places you have only heard of appear as grey pins with "Unknown". Shift-click a category to show only that one.</div>''')

H['pg-kindred-note'] = ('Names you know', '''<div class="note">These are the Kindred, ghouls and mortals you have heard of. Some you know only as a rumour; the Storyteller will tell you more as you learn it. A † marks the destroyed.</div>''')

H['pg-under-note'] = ('The underground', '''<div class="note"><b>Under the city.</b> The sewers, the old Miller and Pabst lagering cellars and the Deep Tunnel, still being dug three hundred feet under the river beds, are real. The Nosferatu live down here; everyone else needs a guide. A red dashed rim marks dangerous zones.</div>''')

H['pg-below'] = ('Who walks under the city', '''<div class="note"><b>Who walks under the city.</b> Mother Agatha rules the Warrens. Since the invasion the Nosferatu say the Sabbat left things behind in the southern and western tunnels.</div>''')

H['pg-beneath'] = ('Beneath the pavement', '''<p class="lead">Under Milwaukee lie a century and a half of sewers, lagering cellars and the foundations of demolished buildings. The Nosferatu have always lived here. This autumn they got worse neighbours.</p><div class="tl"><button type="button" data-link="gp-miller"><span class="yr">1850s</span><span class="tx">Brewers dig lagering cellars into the hills of Miller Valley and Chestnut Street.</span></button><button type="button" data-link="gp-shaft-ji"><span class="yr">1986</span><span class="tx">Work begins on the Deep Tunnel, three hundred feet under the river beds.</span></button><button type="button" data-link="gt-wide"><span class="yr">Autumn 1991</span><span class="tx">The Sabbat digs a tunnel a truck wide from Cudahy. Their creatures come up through it on the night of the invasion.</span></button><button type="button" data-link="gp-market"><span class="yr">Now</span><span class="tx">Trade at the Rat Market has halved. Everyone is afraid of the tunnels.</span></button></div>''')


def apply(A):
    P = A['pages']
    for pid, (title, html) in H.items():
        if pid not in P:
            raise SystemExit(f'unknown page {pid}')
        orig = P[pid]
        st = copy.deepcopy(orig)
        st['id'] = pid + '-st'
        st['title'] = (orig.get('title') or '') + ' (Storyteller)'
        st['order'] = (orig.get('order') or 0) + 0.5
        st['reveal'] = {'all': 0}
        if pid in ('pg-strife', 'pg-invasion', 'pg-council', 'pg-outside', 'pg-beneath', 'pg-below'):
            P[st['id']] = st
        orig['title'] = title
        orig['html'] = html
        orig['reveal'] = {'all': 3}
    P['pg-pocket']['reveal'] = {'all': 0}
    for pid in ('pg-danger', 'pg-domains-note'):
        P[pid]['reveal'] = {'all': 3}
    for pid, pg in P.items():
        r = pg.get('realm')
        if r in ('dream', 'shadow', 'umbra'):
            pg['reveal'] = {'all': 0}
