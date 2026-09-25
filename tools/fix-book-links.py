#!/usr/bin/env python3
"""Post-process mdbook HTML so docs-cohosted relative links work standalone.

TRPL sources link to sibling docs (std, reference, nomicon, unstable-book)
with relative paths like ../std/... — valid on doc.rust-lang.org where all
books are co-hosted, but 404 in a standalone build (local file:// or Pages).
This rewrites only links that escape the build root to absolute
https://doc.rust-lang.org/... URLs. Fragments are preserved. Idempotent.

Usage: fix-book-links.py [build-dir ...]  (default: book-html rbe-html)
Run from the repo root, or via `npm run fix-links`.
"""
import os
import re
import sys

DOCS_ROOT = 'https://doc.rust-lang.org/'
HREF = re.compile(r'href="(\.\./[^"]*)"')


def fix_file(path, root):
    with open(path, encoding='utf-8') as f:
        s = f.read()

    def repl(m):
        url = m.group(1)
        body = url.split('#')[0]
        tgt = os.path.normpath(os.path.join(os.path.dirname(path), body))
        if os.path.exists(tgt):
            return m.group(0)
        assert os.path.relpath(tgt, root).startswith('..'), (path, url)
        return 'href="' + DOCS_ROOT + url[3:] + '"'

    new = HREF.sub(repl, s)
    if new != s:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new)
        return True
    return False


def main(dirs):
    changed = 0
    for root in dirs:
        for dirpath, _, fs in os.walk(root):
            for f in fs:
                if f.endswith('.html') and fix_file(os.path.join(dirpath, f), root):
                    changed += 1
    print(f'fixed links in {changed} files')


if __name__ == '__main__':
    main(sys.argv[1:] or ['book-html', 'rbe-html'])
