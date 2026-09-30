# Refreshing the vendored books

`public/book-html/`, `public/rbe-html/` and `public/rustlings/exercises/` are
upstream material, vendored verbatim. They are checksummed, so any accidental
edit fails `npm run check:content` and therefore CI.

Do not reformat, re-indent or "fix" anything in those trees. A diff in them is
a signal that something upstream changed, not that our copy needs tidying.

## Current builds

| Tree                          | Upstream                    | Build                    | Notes                                                                                                 |
| ----------------------------- | --------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------- |
| `public/book-html/`           | `rust-lang/book` (TRPL)     | mdBook ~0.4.4x           | exact patch unrecoverable: mdBook writes no version into its output                                   |
| `public/rbe-html/`            | `rust-lang/rust-by-example` | same mdBook build        | `book-a0b12cfe.js` is byte-identical to the TRPL copy, which is how the version match was established |
| `public/rustlings/exercises/` | `rust-lang/rustlings` 6.x   | not a build, a file copy | exercise stubs only; no `info.toml`, so the tree is not runnable by `rustlings` itself                |

## Rebuilding TRPL and Rust by Example

Clone the upstream repositories somewhere outside this repo. Their own
`.gitignore` entries (`book/`, `rust-by-example/`) exist so a checkout can live
here; keeping them out of the repo is deliberate.

```sh
git clone https://github.com/rust-lang/book
git clone https://github.com/rust-lang/rust-by-example

mdbook build book/src                     -d "$REPO/public/book-html"
mdbook build rust-by-example/src          -d "$REPO/public/rbe-html"
```

Then fix the links and refresh the checksums:

```sh
cd "$REPO"
python3 tools/fix-book-links.py public/book-html public/rbe-html
node scripts/check-vendored.mjs --write   # see below
```

### Why the link fix exists

TRPL and Rust by Example link to sibling documents with relative paths
(`../std/option/enum.Option.html`) because on `doc.rust-lang.org` all the books
are co-hosted. In a standalone build those paths 404. The script rewrites only
links that escape the build root, to absolute
`https://doc.rust-lang.org/...` URLs. It is idempotent: running it twice
changes nothing.

It is a plain Python 3 script with no dependencies, so the repository does not
need a Python environment beyond the interpreter. Keep it that way.

```sh
python3 tools/fix-book-links.py            # defaults to both trees
```

### A known defect left in place

`public/book-html/404.html:7` and `public/rbe-html/404.html:7` contain
`<base href="/">`, which breaks every relative asset path on those two pages
under a subpath. They are mdBook's 404 handler, unreachable from any link this
site emits, and patching them would break the byte-identical requirement. The
fix script's regex only matches `href="../…"` so it cannot see a `<base>`. Not
patched, on purpose.

### Refreshing the Rustlings exercises

There is no build step; the tree is a copy of the upstream `exercises/`
directory minus `info.toml` and any `answers/`:

```sh
cd "$REPO"
rsync -a --delete \
  --exclude 'answers' --exclude 'info.toml' \
  /path/to/rustlings/exercises/ public/rustlings/exercises/
```

### Updating the checksums

`scripts/vendored-checksums.txt` has one `sha256  relative-path` line per file.
Regenerate it only as part of a deliberate refresh, then read the diff to
confirm the change is the upstream one you expected:

```sh
cd "$REPO"
rm scripts/vendored-checksums.txt
find public/book-html public/rbe-html public/rustlings -type f -print0 \
  | sort -z | xargs -0 sha256sum | sed 's|  public/|  |' \
  > scripts/vendored-checksums.txt
node scripts/check-vendored.mjs
```

Do not regenerate it to make a failing check pass. If the check fails because a
file changed and you did not intend that, find out why first.

## After a refresh

```sh
npm run verify
npm run e2e
```

`tests/unit/content.test.ts` checks that every `reading`, `examples` and
`drills` href in the curriculum still resolves, so a refresh that removes a page
the curriculum links to fails there with the path named.
