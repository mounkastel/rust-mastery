# Rust Mastery

Live site: <https://mounkastel.github.io/rust-mastery/>

> **Leave Settings → Pages → Source on GitHub Actions.** The site is published
> by a workflow; no build output is committed. Switching Source back to
> **Deploy from a branch** makes Pages serve the repository root, which is Vite
> source rather than a build, and the live site goes blank.

One ordered Rust curriculum sequencing three upstream resources. Each of the
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

| Command                   | What it does                                                 |
| ------------------------- | ------------------------------------------------------------ |
| `npm ci`                  | install from `package-lock.json`                             |
| `npm run dev`             | Vite dev server on <http://localhost:5173/rust-mastery/>     |
| `npm run lint`            | ESLint, Prettier check, knip (dead code and unused deps)     |
| `npm run typecheck`       | `tsc --noEmit` and `svelte-check`                            |
| `npm test`                | Vitest unit tests                                            |
| `npm run e2e`             | Playwright against the built site served at the Pages prefix |
| `npm run build`           | production build into `dist/`                                |
| `npm run preview`         | Vite's own preview server, also at `/rust-mastery/`          |
| `npm run preview:subpath` | serve `dist/` at `/rust-mastery/` with a plain static server |
| `npm run check:content`   | vendored-tree checksums and root-absolute URL check          |
| `npm run check:budget`    | app-shell gzip size against the budget below                 |
| `npm run verify`          | lint, typecheck, test, build, check:content, check:budget    |

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

The app shell must stay under **120 kB gzip** of JavaScript and CSS, which
`npm run check:budget` enforces in CI. Nearly all of it is curriculum text,
which is the point; the framework's share is small. If a change pushes the
number up, the size is printed per asset so it is obvious which one grew.

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
through GitHub Pages, with **Pages → Source set to GitHub Actions**. Pull
requests run the same lint, typecheck, unit, build and end-to-end steps but do
not deploy.

To roll back a bad deploy, push the revert. `deploy.yml` also takes a manual
`workflow_dispatch`, but it publishes the current `master`, so a revert has to
land first. Do not roll back by changing the Pages Source.

## Dependencies

[`.github/dependabot.yml`](.github/dependabot.yml) opens the updates and
[`.github/workflows/dependabot-auto-merge.yml`](.github/workflows/dependabot-auto-merge.yml)
squash-merges the patch and minor ones once `verify` and `e2e` are green. A
semver-major bump stops with a comment asking for a person, which is the one
kind of update worth reading.

Run the auto-merge by hand with `workflow_dispatch` and a pull request number.
Dependabot only re-triggers on `synchronize`, so this is the only way to
re-test a pull request it has already opened.

### Moving a pinned toolchain

`eslint`, `typescript-eslint` and `eslint-plugin-svelte` are pinned together
and have to move in one commit: the two plugins declare the peer range that
forbids a new `eslint` major, so lifting `eslint` alone fails to resolve.

After any such bump, expect a fresh `no-unnecessary-type-assertion` result.
Newer plugin versions find assertions the old ones could not see, and each one
it names is genuinely redundant.
