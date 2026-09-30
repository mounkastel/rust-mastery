# Rust Mastery

> **Before merging the rewrite to `master`:** in the repository settings, set
> **Settings → Pages → Source** to **GitHub Actions**. Until that is done,
> GitHub Pages keeps serving whatever the old source setting points at, and a
> merge will either 404 or serve unbuilt source. To roll back, set Source back
> to **Deploy from a branch** and select the previous commit.

Live site: <https://mounkastel.github.io/rust-mastery/>

One ordered Rust curriculum that sequences three upstream resources. Each of the
54 lessons is: read the book section, see the same idea as a runnable example,
do the exercises, then pass a checkpoint. Passing a checkpoint puts the lesson
on a spaced-repetition schedule so it comes back before you forget it.

Sequenced sources, vendored in `public/`:

- The Rust Programming Language — [rust-lang/book](https://github.com/rust-lang/book),
  vendored build in `public/book-html/`
- Rust by Example — [rust-lang/rust-by-example](https://github.com/rust-lang/rust-by-example),
  vendored build in `public/rbe-html/`
- Rustlings — [rust-lang/rustlings](https://github.com/rust-lang/rustlings),
  exercise stubs in `public/rustlings/exercises/`

The book and example links open in a new tab. The site itself is a
single-page app; every route is a fragment (`#/lesson/ownership`) so a hard
refresh on a deep link works on a static host with no rewrite rule.

## Commands

Each was run against a clean clone before this branch was cut.

| Command                   | What it does                                                 |
| ------------------------- | ------------------------------------------------------------ |
| `npm ci`                  | install from `package-lock.json`                             |
| `npm run dev`             | Vite dev server on <http://localhost:5173/rust-mastery/>     |
| `npm run lint`            | ESLint, Prettier check, knip (dead code and unused deps)     |
| `npm run typecheck`       | `tsc --noEmit` and `svelte-check`                            |
| `npm test`                | Vitest unit tests                                            |
| `npm run e2e`             | Playwright against the built site served at the Pages prefix |
| `npm run build`           | production build into `dist/`                                |
| `npm run preview:subpath` | serve `dist/` at `/rust-mastery/` (what `e2e` starts)        |
| `npm run check:content`   | vendored-tree checksums and root-absolute URL check          |
| `npm run verify`          | lint, typecheck, test, build, check:content                  |

`npm run e2e` builds and starts the subpath server itself, so it needs no
separate terminal. If a browser is missing: `npx playwright install chromium`.

## Saved data

Progress lives in this browser under `localStorage["rust-mastery:v3"]` and is
never sent anywhere. The site has no accounts, no server and no analytics.

Export it to a file from the panel at the bottom of the sidebar, import it on
another browser, or reset it. Reset takes two presses on purpose.

The pre-rewrite build wrote `rust-mastery-course-v2`. That key is left on disk
untouched and is never read; the data format changed and the owner approved
losing it.

## Bundle budget

The app shell must stay under **120 kB gzip** of JavaScript and CSS. Nearly all
of it is curriculum text, which is the point; the framework's share is small.
`npm run verify` reports the sizes on every build, and the workflow fails if the
build errors, not if it grows — the number is here to make growth deliberate.

## Adding curriculum content

See [docs/adding-content.md](docs/adding-content.md) for the schema, the
question-authoring rules, and the validation that runs in CI.

## Refreshing the vendored books

See [docs/vendored-books.md](docs/vendored-books.md). Upstream sources are not
committed; only their built output is, checksummed in
`scripts/vendored-checksums.txt` so an accidental edit fails the build.

## Attribution and licences

The site code is MIT (`LICENSE`). The three vendored trees keep their upstream
licences and are marked `linguist-vendored` in `.gitattributes`; see
[NOTICE.md](NOTICE.md) for the per-tree licence and the mdBook build versions.

## Deployment

`master` is built and deployed by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
through GitHub Pages. Pull requests run the same lint, typecheck, unit, build
and end-to-end steps but do not deploy.
