# Tools

Helper scripts for building and auditing the vendored docs. All scripts run
from the **repo root** (or via the `npm run …` shortcuts in `package.json`)
and use paths relative to the repo — never absolute local paths.

## Build

- `fix-book-links.py` — post-process mdbook HTML so docs-cohosted relative
  links (`../std/…`, valid on doc.rust-lang.org) become absolute
  `https://doc.rust-lang.org/…` URLs in standalone builds. Idempotent.
  ```sh
  npm run fix-links
  # or: python3 tools/fix-book-links.py book-html rbe-html
  ```
  Run this after every `mdbook build` of `book-html/` or `rbe-html/`.

## Audit

- `analyze-rbe.py` — read-only TF-cosine analysis of RBE vs TRPL prose;
  shows which RBE pages carry TRPL-unique content. Never modifies `data.js`.
  ```sh
  npm run analyze-rbe
  ```

## Rebuilding the vendored books

Upstream sources are **not** committed (see `.gitignore`: `book/`,
`rust-by-example/`). To rebuild:

```sh
# TRPL (rust-lang/book)
mdbook build <book-checkout> -d <repo>/book-html
# Rust by Example (rust-lang/rust-by-example)
mdbook build <rbe-checkout> -d <repo>/rbe-html
# then fix co-hosted links:
npm run fix-links
```

## Retired one-shot migrations

`quiz-convert.py` (single-question → `questions:[…]`) and `trim-rbe.py`
(RBE dedup + Attributes block) were destructive, already-applied migrations —
they are intentionally **not** vendored here. Re-running them would corrupt
`data.js`; the git history (`081f9bf`, `b33ccf8`) records what they did.
