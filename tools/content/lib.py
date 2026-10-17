"""Helpers for the hand-written Milwaukee preset content.

Each entry is registered with E(id, ...):
  t        starting knowledge tier for every player (0 hidden, 1 existence, 2 basic, 3 full)
  alias    name shown while only its existence is known
  rumour   text shown while only its existence is known
  brief    common knowledge, shown from the Basic tier
  full     what you learn with full knowledge (shown after the brief)
  secrets  [(title, text)] revealed one by one by the Storyteller
  calls    [(title, text[, kind])] ordinary callouts, shown with full knowledge
  st       [(title, text)] Storyteller notes, never shown to players
  name/sub/kicker  overrides
  icon, shape, photo  pin art
Paragraphs are separated by blank lines.
"""
import html as _html
REG = {}


def para(text):
    if text is None:
        return None
    text = text.strip()
    if not text:
        return ''
    if text.startswith('<'):
        return text
    parts = [p.strip().replace('\n', ' ') for p in text.split('\n\n') if p.strip()]
    return ''.join(f'<p>{p}</p>' for p in parts)


def E(id, **kw):
    if id in REG:
        raise SystemExit(f'duplicate content id {id}')
    REG[id] = kw
    return kw


def note(title, text, kind=None, secret=False, st=False):
    n = {'title': title, 'html': para(text)}
    if st:
        n['kind'] = 'st'
        n['st'] = True
    elif kind:
        n['kind'] = kind
    if secret:
        n['kind'] = n.get('kind') or 'secret'
        n['secret'] = True
        n['reveal'] = {'all': 0}
    return n
