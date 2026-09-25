# Rust Mastery

Live: https://mounkastel.github.io/rust-mastery/

One sequence across three Rust resources: read, see, do, recall, advance. Works offline (except RBE "Run" buttons and the links below).

Sources:

- TRPL — [rust-lang/book](https://github.com/rust-lang/book) ([read online](https://doc.rust-lang.org/book/)), vendored in `book-html/`
- Rust by Example — [rust-lang/rust-by-example](https://github.com/rust-lang/rust-by-example) ([read online](https://doc.rust-lang.org/rust-by-example/)), vendored in `rbe-html/`
- Rustlings — [rust-lang/rustlings](https://github.com/rust-lang/rustlings), exercises vendored in `rustlings/exercises/`

## Run

Open `index.html` in a browser, or serve the folder:

```sh
npm run serve
# or: python3 -m http.server 8080
```

## Project structure

```text
.
├── index.html          # shell: #app mount point, pre-paint theme, asset wiring
├── app.js              # UI runtime (event delegation on [data-action], SRS, quiz)
├── data.js             # curriculum: concepts, resources, checkpoints, quizzes
├── styles.css          # design system (tokens, defensive layout, themes)
├── book-html/          # vendored TRPL build (mdbook output)
├── rbe-html/           # vendored Rust by Example build (mdbook output)
├── rustlings/          # vendored rustlings exercises (plain .rs files)
├── tools/              # build + audit helpers (see tools/README.md)
├── package.json        # npm shortcuts (serve, fix-links, analyze-rbe)
├── .nojekyll           # serve vendored HTML as-is on GitHub Pages
└── .gitignore          # keeps upstream sources + tool droppings out of git
```

Upstream *sources* (`book/`, `rust-by-example/`) are deliberately **not**
committed — only their built static outputs. See `tools/README.md` for
rebuild instructions.

## Deploy

GitHub Pages serves this repo root directly. No build step: push to `master`
and the live site updates. `.nojekyll` ensures the vendored book HTML is
served byte-for-byte without Jekyll processing.
