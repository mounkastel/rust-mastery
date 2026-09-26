# Curriculum Audit — MIT-Grade Diagnostic Quiz Overhaul

> Phase 1 reconnaissance. No curriculum code changed yet.
> Source of truth: `data.js` (54 concepts) + quiz runtime `app.js`.
> TRPL edition: 2024 (async = Ch 17, patterns = Ch 19, macros = Ch 20.5).

## 1. Objective

Replace 2–3 shallow recall questions per checkpoint with **4–6 diagnostic,
code-centric questions** that verify the student can mentally emulate the
borrow checker and predict compiler behavior. 100% TRPL-grounded, zero trivia.

**Scale:** 163 questions at start → **256 target** → **93 new questions** to author
across 6 batches (13 done in Batch 1, 80 remaining). Rule: difficulty 1–2 → 4 Qs,
difficulty 3 → 5 Qs, difficulty 4 → 6 Qs.

## 2. Schema contract (`data.js` ↔ `app.js`)

Each concept: `checkpoint: { questions: [...] }`, where a question is:

```js
// Multiple-choice (auto-judged). `options`: any length, ids 'a'..'d'.
// `correct` MUST equal one option id.
{ type: 'multiple_choice', prompt: '...', options: [{ id, text }], correct: 'b', explain: '...' }
// Self-assessed (reveal + honest Yes/No). No options/correct keys.
{ type: 'predict_output' | 'find_bug' | 'explain', prompt: '...', explain: '...' }
```

**Runtime constraints (from `app.js`, verified):**
- MC renders any `options` array length — 4 options (a–d) safe, no code change needed.
- Quiz completes only when **all** questions judged; all must be correct to pass.
- Checkpoint panel header (`Checkpoint · N questions`) and progress line count
  dynamically — N changes are free.
- `formatQuizContent`: `` `code` `` → inline badge; blank-line-separated
  multiline code → isolated `<pre>`; single `\n` → `<br>`.
- `data.js` authoring rules: single-quoted strings, escape `'` as `\'`,
  newlines as `\n`, backticks are literal-safe inside single quotes.
- `review-mark` / SRS and `statusLabel` logic key off `checkpointPassed`,
  never off question count — adding questions cannot break progression.

## 3. Current-state metrics

| Signal | Value |
|---|---|
| Concepts | 54 (ch 0–21 + bonus) |
| Questions today | 163 (53 × 3, `rc` × 4) |
| MC options today | 3 (a–c) everywhere |
| Self-assessed mix | predict_output / find_bug / explain present but shallow |
| Fundamentals (`fundamental: true`) | 21 concepts — SRS re-queues these; their quizzes matter most |
| Known weak spots | `cargo-basics`, `packages-crates`, `test-org`, `appendix-reference` are all-MC recall; `async-concurrency`, `oo-characteristics` all-MC with zero drills |

## 4. Batch plan

| Batch | Scope (our `chapter` = TRPL 2024) | Concepts | Q now → target |
|---|---|---|---|
| 1 | Foundations, Ch 1–4 | 10 | 30 → 43 |
| 2 | Structures & Flow, Ch 5–7 | 9 | 27 → 39 |
| 3 | Collections, Errors, Generics, Ch 8–10 | 8 | 24 → 38 |
| 4 | Closures, Smart Pointers, Concurrency, Ch 13/15/16 | 9 | 28 → 47 |
| 5 | Async, OOP, Patterns, Advanced, Ch 17–20 | 9 | 27 → 49 |
| 6 | Tooling, Capstone, Bonus (Ch 11/12/14/21/0) | 9 | 27 → 40 |

Batches run in prerequisite order. One `node --check data.js` per batch,
plus a render smoke test of one touched checkpoint per batch.

## 5. Per-concept audit

Format: `id` — TRPL pages — invariants to test — now → target.

### Batch 1 — Foundations (Ch 1–4)

- `installation-hello` — 1.1/1.2/1.0/0 — macro vs fn (`println!` `!`), `rustc`
  output naming, edition awareness — 3 → 4. Gap: needs one `find_bug` on
  format-string capture vs positional args.
- `cargo-basics` — 1.3 — `check` vs `build` vs `run`, `target/<profile>` layout,
  manifest vs lockfile roles — 3 → 4. Gap: all-MC recall; add manifest
  `[dependencies]` SemVer scenario.
- `guessing-game` — Ch 2 — `Result` from I/O, `match` arms on `Ok/Err`,
  variable shadowing across loop iterations — 3 → 4. Gap: needs an
  NLL-flavored shadowing diagnostic.
- `variables-mutability` — 3.1 + const/shadow — shadowing vs `mut`
  reassignment, const evaluability, type-change-via-shadow — 3 → 4.
  Gap: needs shadowing-in-new-scope output prediction.
- `data-types` — 3.2 — scalar widths/overflow modes, tuple destructuring,
  array-vs-vector, char (4-byte) misconceptions — 3 → 4.
- `functions` — 3.3 — expression vs statement, tail-expression return,
  diverging (`!`) basics — 3 → 4. Gap: needs semicolon-changes-everything bug.
- `control-flow` — 3.4/3.5 — `if` as expression, `loop` value via `break`,
  `for` vs `while` exhaustion — 3 → 4.
- `ownership` — 4.1 — move vs `Copy`, double-free logic, function-arg moves,
  `clone` cost model — 3 → 5 (fundamental). Gap: needs drop-order + partial-move.
- `borrowing` — 4.2 — aliasing-XOR-mutability, NLL (borrow ends at last use),
  dangling-reference rejection — 3 → 5 (fundamental). Gap: needs NLL
  two-phase-style scenario.
- `slices` — 4.3 — fat-pointer (ptr+len), `&a[1..3]` half-open ranges,
  string-slice UTF-8 boundary panic, array→slice coercion behind `&` — 3 → 5
  (fundamental; drill moved to `data-types`, quiz must carry the weight).

### Batch 2 — Structures & Flow (Ch 5–7)

- `structs` — 5.1/5.2/5.3 — field-init shorthand, update syntax move semantics,
  tuple vs unit structs — 3 → 4.
- `methods` — 5.3 — `&self` vs `&mut self` vs `self`, method vs associated fn
  call syntax — 3 → 4.
- `enums` — 6.1/6.2 — payload-carrying variants, `Option` as plain enum,
  `if let` vs `match` ergonomics — 3 → 5 (fundamental).
- `option-type` — 6.1/6.3 — `None` propagation, `unwrap` panic conditions,
  `?`-equivalence intuition — 3 → 4.
- `match` — 6.2/18.x — exhaustiveness, arm binding modes, match ergonomics
  (`&` stripping) — 3 → 5 (fundamental). Gap: needs non-exhaustive compile error.
- `if-let` — 6.3 — `if let` + `else`, `let-else` refutable patterns — 3 → 4.
- `packages-crates` — 7.1/7.2 — package vs crate vs target, `Cargo.toml`
  vs `Cargo.lock` commit rules — 3 → 4. Gap: all recall; add lockfile scenario.
- `modules-privacy` — 7.2/7.3 — privacy default-private, `pub use` re-export,
  `super`/`crate` paths — 3 → 5. Gap: needs privacy-error diagnostic.
- `use-paths` — 7.3/7.4 — glob vs nested import, name-collision `as` — 3 → 4.

### Batch 3 — Collections, Errors, Generics (Ch 8–10)

- `vectors` — 8.1 + RBE — reallocation invalidation (`&v[0]` across `push`),
  `Vec<T>` heap model — 3 → 4.
- `strings` — 8.2 — bytes vs chars vs graphemes, indexing refusal, `+` move
  semantics, UTF-8 slicing panic — 3 → 5 (fundamental).
- `hashmaps` — 8.3 — `entry().or_insert()`, owned-key requirement, hasher
  customization point — 3 → 4.
- `panic` — 9.1/9.3 — `panic!` vs `Result`, `RUST_BACKTRACE`, `#[should_panic]`
  matching — 3 → 4.
- `result` — 9.2/9.3 — `?` desugar + error conversion (`From`), combinators
  (`map`/`and_then`), `unwrap` vs `expect` — 3 → 5 (fundamental).
- `generics` — 10.1 + RBE — monomorphization cost model, turbofish necessity,
  generic `Drop` interplay — 3 → 5 (fundamental).
- `traits` — 10.2 — orphan rule, default methods, `impl Trait` vs generics,
  supertraits — 3 → 5 (fundamental). Gap: needs orphan-rule violation error.
- `lifetimes` — 10.3 — elision rules (all 3), dangling output rejection,
  `'static` bounds vs values — 3 → 6 (fundamental, hardest chapter).

### Batch 4 — Closures, Smart Pointers, Concurrency (Ch 13/15/16)

- `closures` — 13.1 — `Fn`/`FnMut`/`FnOnce` capture ladder, `move` semantics — 3 → 5.
- `iterators` — 13.2/13.4 — laziness (no work before `collect`), `iter` vs
  `into_iter` ownership, adapter chains — 3 → 5 (fundamental).
- `box` — 15.1/15.2 — recursive-type indirection, deref coercion basics — 3 → 5.
- `deref-drop` — 15.2/15.3 — coercion sites, `Drop` order (reverse declaration),
  `std::mem::drop` early-drop — 3 → 5. Gap: needs drop-order prediction.
- `rc` — 15.4–15.6 — `strong_count` mechanics, `Rc::clone` cost, `Cow`
  laziness (new Q4), `RefCell` runtime borrow panic bridge — 4 → 5.
- `refcell` — 15.5 — `borrow`/`borrow_mut` runtime panics, `Rc<RefCell<T>>`
  pattern — 3 → 6 (highest misconception density in Ch 15).
- `threads` — 16.1 — `move` closures into `spawn`, `JoinHandle` join semantics — 3 → 5.
- `message-passing` — 16.2 — `mpsc` ownership transfer, `Send` requirements,
  channel disconnect behavior — 3 → 5.
- `shared-state` — 16.3 — `Mutex` poisoning, `Arc<Mutex<T>>` sharing pattern,
  deadlock intuition — 3 → 6.

### Batch 5 — Async, OOP, Patterns, Advanced (Ch 17–20)

- `async-futures` — 17.1/17.0 — `Future` laziness (nothing runs pre-`await`),
  `async` block capture — 3 → 6 (fundamental, brand-new mental model).
- `async-concurrency` — 17.2–17.6 — `Send` futures across threads, `join!`
  vs spawning, stream basics — 3 → 6. Gap: all-MC, zero drills; needs
  execution-order predictions.
- `oo-characteristics` — 18.1/18.0 — encapsulation/heritage/polymorphism
  mapping onto traits — 3 → 4.
- `trait-objects` — 18.2/18.3 — object safety rules, `dyn` dispatch cost,
  fat-pointer (vtable) model — 3 → 6 (fundamental).
- `patterns-everywhere` — 19.1/19.0 — `match`/`if let`/`while let`/`for`
  pattern positions — 3 → 4.
- `pattern-syntax` — 19.2/19.3 — refutability, `@` bindings, `..` vs `...`,
  match-guard precedence — 3 → 5.
- `unsafe-rust` — 20.1/20.0 — the 5 unsafe superpowers, `unsafe` scope
  discipline, raw-pointer deref rules — 3 → 6 (fundamental).
- `advanced-traits-types` — 20.2–20.4 — associated types vs generics,
  `dyn` return-position rules, supertrait bounds — 3 → 6.
- `macros` — 20.5 — declarative vs procedural split, `macro_rules!`
  matcher hygiene basics — 3 → 5.

### Batch 6 — Tooling, Capstone, Bonus (Ch 11/12/14/21/0)

- `writing-tests` — 11.1–11.3 — `assert!` family, `Result`-returning tests,
  `#[should_panic(expected)]` — 3 → 4.
- `test-org` — 11.3 — unit vs integration layout, `tests/` crate-boundary
  visibility — 3 → 4. Gap: all recall; add visibility-error scenario.
- `io-project` — Ch 12 (7 TRPL + 11 RBE) — iterator-driven design,
  `Box<dyn Error>` acceptance, env-gated case sensitivity — 3 → 5.
- `cargo-advanced` — Ch 14 — profiles, workspaces, `cargo install` vs
  `cargo build --release` — 3 → 4.
- `final-project` — Ch 21 — `TcpListener` accept loop, thread-per-connection
  tradeoffs, graceful-shutdown channels — 3 → 5.
- `clippy-tooling` — App D — lint tiers (`warn`/`deny`), `#[allow]` scope — 3 → 4.
- `type-conversions` — RBE cookbook — `From`/`Into` reflexivity, `TryFrom`
  error types, `as` footguns — 3 → 4.
- `appendix-reference` — App A–G — keywords/derives/operators lookup
  discipline — 3 → 4. Gap: pure recall; acceptable for a reference index.
- `attributes` — RBE bonus — `cfg` gating vs `cfg!` runtime, lint scoping — 3 → 4.

## 6. Question design checklist (every new question)

1. Stem: concrete scenario + idiomatic snippet; asks *compile? / output? /
   which rule violated?*
2. Exactly 4 MC options (a–d); each distractor = one documented student
   misconception (e.g. `Clone`≡`Copy`, borrow living past last use,
   `Rc::clone` cloning data).
3. Backticks on every keyword/identifier; multiline code blank-line-separated
   for the parser.
4. Explanation: compiler mechanics + TRPL rule + why each distractor fails.

## 7. Verification protocol (per batch)

1. `node --check data.js` — zero syntax errors.
2. Link/format sweep: 0 raw backticks, every new snippet parses to isolated
   `<pre>`, all TRPL/RBE/RL links resolve.
3. Render smoke test: open one touched checkpoint, answer through it
   (mid-quiz surgical paint + quiz-finish full render + review queue).
4. Commit per batch: `Quiz Batch N: <scope> — <new44140> questions`.
