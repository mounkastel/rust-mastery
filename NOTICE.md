# Third-party material

The site source is MIT licensed; see [LICENSE](LICENSE). Everything under
`public/` is upstream material, vendored without modification and marked
`linguist-vendored` in `.gitattributes`.

| Path                          | Upstream project                                                                    | Upstream licence  | What is vendored                                                                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/book-html/`           | [rust-lang/book](https://github.com/rust-lang/book) — The Rust Programming Language | MIT OR Apache-2.0 | The published mdBook build: 115 HTML pages, its stylesheets, scripts, fonts and images. Upstream licence texts are not part of mdBook's output, so they are not in the tree. |
| `public/rbe-html/`            | [rust-lang/rust-by-example](https://github.com/rust-lang/rust-by-example)           | MIT OR Apache-2.0 | The published mdBook build: 200 HTML pages, plus the Ace editor the runnable examples use. Same note about upstream licence files.                                           |
| `public/rustlings/exercises/` | [rust-lang/rustlings](https://github.com/rust-lang/rustlings)                       | MIT               | 95 exercise `.rs` stubs, their per-directory `README.md` files and three score fixtures. `info.toml` and any `answers/` are deliberately not vendored.                       |

## Build versions

Neither mdBook tree carries a version marker: mdBook writes no generator
version into its output. What can be established:

- `book-a0b12cfe.js` is **byte-identical** in both trees (30019 bytes,
  md5 `1af0a5eb68649c35f74ab38f9d845d20`), so both were built by the same
  mdBook binary at the same version with the same theme.
- CSS custom properties in `book-html/css/variables-8adf115d.css`
  (`--sidebar-resize-indicator-width`, `--copy-button-filter`, `--sidebar-bg`)
  place that version at mdBook 0.4.40 or later; no string in either tree pins
  the exact patch.
- Vendored dependency versions that are pinned: elasticlunr 0.9.5, Ace 1.4.4.
- The upstream commit each book was built from is not recoverable from the
  output.

The rustlings tree is 6.x: `23_conversions/` is split into five files, which
5.x did not do, and `24_async/` exists, which 5.x did not. The minor and patch
are not recoverable.

## Fonts

Each mdBook tree vendors Open Sans (Apache-2.0) and Source Code Pro (SIL OFL
1.1) under `fonts/`, with their licence files present:

- `public/book-html/fonts/OPEN-SANS-LICENSE.txt`
- `public/book-html/fonts/SOURCE-CODE-PRO-LICENSE.txt`
- the same two files under `public/rbe-html/fonts/`

Font Awesome markup is inlined in the vendored CSS.

## Network access from the vendored trees

Neither tree loads any external resource: no CDN, no remote font, no analytics.
The fonts are vendored and there are no `@import` rules. One network call
exists and requires a click: 54 runnable code blocks in `public/rbe-html/` post
to `https://play.rust-lang.org/evaluate.json` when the learner presses Run. The
TRPL tree has no runnable blocks, so it never makes a request.

## Known defect in the vendored output

`public/book-html/404.html:7` and `public/rbe-html/404.html:7` contain
`<base href="/">`, a root-absolute base URL. Under a subpath every relative
asset path on those two pages resolves against the domain root and 404s,
leaving the page unstyled. They are mdBook's own 404 handler, unreachable from
any link this site emits, and the site has its own 404 handling. Left unpatched
because editing the vendored trees would break the byte-identical guarantee that
`npm run check:content` enforces.
