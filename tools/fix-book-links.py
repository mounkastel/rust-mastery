#!/usr/bin/env python3
"""Post-process mdBook HTML so docs-cohosted relative links work standalone.

TRPL and Rust by Example link to sibling documents with relative paths
(../std/option/enum.Option.html) because on doc.rust-lang.org all the books are
co-hosted together. In a standalone build under a subpath those paths 404.

Rewrites only links that escape the build root, to absolute
https://doc.rust-lang.org/... URLs. Fragments are preserved. Idempotent: running
it twice changes nothing.

    fix-book-links.py [build-dir ...]     # defaults to both vendored trees

Pure standard library, so the repository needs nothing but python3.

This cannot fix a <base href="/"> in a page, which is a different attribute
altogether; see docs/vendored-books.md for that known defect.
"""
import os
import re
import sys

DOCS_ROOT = 'https://doc.rust-lang.org/'
HREF = re.compile(r'href="(\.\./[^"]*)"')
DEFAULT_DIRS = ['public/book-html', 'public/rbe-html']


def fix_file(path, root):
    with open(path, encoding='utf-8') as f:
        source = f.read()

    def rewrite(match):
        url = match.group(1)
        target = os.path.normpath(os.path.join(os.path.dirname(path), url.split('#')[0]))
        if os.path.exists(target):
            return match.group(0)
        if not os.path.relpath(target, root).startswith('..'):
            raise AssertionError('{}: {} escapes the build root unexpectedly'.format(path, url))
        return 'href="' + DOCS_ROOT + url[3:] + '"'

    fixed = HREF.sub(rewrite, source)
    if fixed == source:
        return False
    with open(path, 'w', encoding='utf-8') as f:
        f.write(fixed)
    return True


def main(dirs):
    changed = 0
    for root in dirs:
        if not os.path.isdir(root):
            print('no such directory: ' + root, file=sys.stderr)
            return 1
        for dirpath, _, filenames in os.walk(root):
            for name in filenames:
                if name.endswith('.html') and fix_file(os.path.join(dirpath, name), root):
                    changed += 1
    print('fixed links in {} files'.format(changed))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:] or DEFAULT_DIRS))
