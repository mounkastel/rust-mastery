#!/usr/bin/env python3
"""RBE-vs-TRPL duplication analysis. Compares prose (code stripped) of each
RBE page against every TRPL chapter via TF cosine similarity.

Read-only: never modifies data.js. Run from the repo root, or via
`npm run analyze-rbe`.
"""
import os
import re
import math
import statistics
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WROOT = ROOT / 'book-html'
RROOT = ROOT / 'rbe-html'
DATA_JS = ROOT / 'data.js'


def prose(fp):
    s = open(fp, encoding='utf-8', errors='replace').read()
    m = re.search(r'<main[^>]*>(.*?)</main>', s, re.S)
    s = m.group(1) if m else s
    s = re.sub(r'<(pre|code)[^>]*>.*?</\1>', ' ', s, flags=re.S)
    s = re.sub(r'<[^>]+>', ' ', s)
    words = re.findall(r'[a-z]{3,}', s.lower())
    return Counter(words)


def cosine(a, b):
    if not a or not b:
        return 0.0
    dot = sum(n * b.get(w, 0) for w, n in a.items())
    na = math.sqrt(sum(n * n for n in a.values()))
    nb = math.sqrt(sum(n * n for n in b.values()))
    return dot / (na * nb) if na and nb else 0.0


trpl = {}
for f in os.listdir(WROOT):
    if f.endswith('.html') and f not in ('print.html', '404.html', 'toc.html',
                                         'index.html', 'title-page.html', 'foreword.html'):
        trpl[f] = prose(os.path.join(WROOT, f))

rbe = {}
for dirpath, _, fs in os.walk(RROOT):
    for f in fs:
        if f.endswith('.html') and f not in ('print.html', '404.html', 'toc.html', 'index.html'):
            rel = os.path.relpath(os.path.join(dirpath, f), RROOT)
            rbe[rel] = prose(os.path.join(dirpath, f))

print(f'TRPL chapters: {len(trpl)}, RBE pages: {len(rbe)}')

# linked RBE pages from data.js
src = open(DATA_JS, encoding='utf-8').read()
linked = set(re.findall(r"RBE \+ '([^'#]+)(?:#[^']*)?'", src))
print(f'RBE pages linked from course: {len(linked)}')

rows = []
for rel, vec in rbe.items():
    best, bscore = None, -1
    for tf, tvec in trpl.items():
        sc = cosine(vec, tvec)
        if sc > bscore:
            best, bscore = tf, sc
    rows.append((bscore, rel, best, sum(vec.values()),
                 'LINKED' if rel in linked else 'orphan'))

rows.sort()
print('\n=== 25 most TRPL-unique RBE pages (low score = unique info) ===')
for sc, rel, best, n, st in rows[:25]:
    print(f'{sc:.2f} {st:6s} {n:5d}w {rel:55s} <- {best}')
print('\n=== 15 most TRPL-duplicated RBE pages ===')
for sc, rel, best, n, st in rows[-15:][::-1]:
    print(f'{sc:.2f} {st:6s} {n:5d}w {rel:55s} <- {best}')

# distribution of linked pages
lsc = [sc for sc, rel, _, _, st in rows if st == 'LINKED']
print(f'\nlinked pages: n={len(lsc)} mean={statistics.mean(lsc):.2f} '
      f'median={statistics.median(lsc):.2f} '
      f'<0.30: {sum(1 for x in lsc if x < 0.30)} '
      f'0.30-0.50: {sum(1 for x in lsc if 0.30 <= x < 0.50)} '
      f'>=0.50: {sum(1 for x in lsc if x >= 0.50)}')
