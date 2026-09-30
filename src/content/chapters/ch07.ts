import type { Chapter } from '../schema';

export const ch07: Chapter = {
  key: '7',
  num: 7,
  title: 'Packages, Crates, and Modules',
  integrative: false,
  concepts: [
    {
      id: 'packages-crates',
      title: 'Packages and Crates',
      fundamental: false,
      prereq: ['functions'],
      difficulty: 2,
      estMinutes: 15,
      reading: [
        { num: '7.1', title: 'Packages and Crates', href: 'ch07-01-packages-and-crates.html' },
        {
          num: '7.0',
          title: 'Packages, Crates, and Modules (chapter overview)',
          href: 'ch07-00-managing-growing-projects-with-packages-crates-and-modules.html',
        },
      ],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'packages-crates-q1',
          kind: 'choice',
          prompt: 'A package can contain how many library crates?',
          options: [
            { id: 'a', text: 'Unlimited' },
            { id: 'c', text: 'Exactly one, mandatory' },
            { id: 'b', text: 'At most one' },
          ],
          correct: 'b',
          explain:
            'A package must have at least one crate, may have multiple binary crates, but at most one library crate.',
        },
        {
          id: 'packages-crates-q2',
          kind: 'choice',
          prompt: 'A package contains both `src/main.rs` and `src/lib.rs`. What does that mean?',
          options: [
            { id: 'b', text: 'One package with a binary crate and a library crate' },
            { id: 'a', text: 'Two separate packages sharing a directory' },
            { id: 'c', text: 'Invalid layout — a package cannot hold both' },
          ],
          correct: 'b',
          explain:
            'Standard layout: `main.rs` is the binary root, `lib.rs` the library root of the same package. They can even share module files.',
        },
        {
          id: 'packages-crates-q3',
          kind: 'choice',
          prompt: 'What does the first `cargo build` do about `rand = "0.8"` in Cargo.toml?',
          options: [
            { id: 'b', text: 'Only verifies the crate exists' },
            { id: 'c', text: 'Vendors the source into `src/`' },
            { id: 'a', text: 'Downloads, compiles, and locks the exact resolved version' },
          ],
          correct: 'a',
          explain:
            'First build resolves the requirement to a concrete version, compiles it, and records it in Cargo.lock. Sources stay in the registry cache, never in src/.',
        },
        {
          id: 'packages-crates-q4',
          kind: 'choice',
          prompt:
            'A package has both `src/main.rs` and `src/lib.rs`. Where must shared `fn helper()` live so the binary AND integration tests can both use it?',
          options: [
            {
              id: 'a',
              text: 'In `src/lib.rs` (or its modules) — the binary imports the library crate; integration tests can only use the library, never `main.rs`',
            },
            { id: 'b', text: 'In `src/main.rs` — every target sees the binary crate' },
            {
              id: 'c',
              text: 'In `tests/` — files there are shared automatically with all targets',
            },
            { id: 'd', text: 'It must be duplicated in both files' },
          ],
          correct: 'a',
          explain:
            'TRPL 7.1/11.3: integration tests link the *library* crate; `main.rs` is a separate binary crate invisible to them. Shared logic belongs in `lib.rs` (imported by the binary with `use`), never duplicated.',
        },
      ],
    },
    {
      id: 'modules-privacy',
      title: 'Modules and Privacy',
      fundamental: false,
      prereq: ['packages-crates'],
      difficulty: 3,
      estMinutes: 30,
      reading: [
        {
          num: '7.2',
          title: 'Defining Modules to Control Scope and Privacy',
          href: 'ch07-02-defining-modules-to-control-scope-and-privacy.html',
        },
        {
          num: '7.3',
          title: 'Paths for Referring to an Item in the Module Tree',
          href: 'ch07-03-paths-for-referring-to-an-item-in-the-module-tree.html',
        },
      ],
      examples: [],
      drills: [{ name: 'modules1', href: '10_modules/modules1.rs' }],
      questions: [
        {
          id: 'modules-privacy-q1',
          kind: 'choice',
          prompt:
            'By default, is an item declared inside `mod foo { fn bar() {} }` visible outside `foo`?',
          options: [
            { id: 'a', text: 'Yes, everything is public by default' },
            { id: 'b', text: 'No — everything is private unless marked pub' },
            { id: 'c', text: 'Functions are private, but types and constants are public' },
          ],
          correct: 'b',
          explain:
            'Rust’s default is private; you opt into visibility with `pub`, the opposite default from many other languages.',
        },
        {
          id: 'modules-privacy-q2',
          kind: 'bug',
          prompt:
            'mod kitchen {\n    fn cook() {}\n}\nfn main() {\n    kitchen::cook();\n}\n\nWhat is the error, and what is the minimal fix?',
          explain:
            'Privacy error (E0603): `cook` is private to `kitchen` by default, so the path does not resolve. Minimal fix: `pub fn cook()`.',
        },
        {
          id: 'modules-privacy-q3',
          kind: 'choice',
          prompt: 'What does `pub(crate)` on an item mean?',
          options: [
            { id: 'b', text: 'Exactly the same as `pub`' },
            { id: 'c', text: 'Visible only inside the defining module' },
            { id: 'a', text: 'Visible anywhere inside this crate, but not to downstream crates' },
          ],
          correct: 'a',
          explain:
            '`pub(crate)` is the middle ground: crate-wide sharing without committing to a public API. Plain `pub` also exposes it externally.',
        },
        {
          id: 'modules-privacy-q4',
          kind: 'choice',
          prompt:
            'Does this compile?\n\nmod outer {\n    fn secret() {}\n    pub mod inner {\n        pub fn leak() {\n            super::secret();\n        }\n    }\n}',
          options: [
            { id: 'b', text: 'No — `secret` needs `pub` for anyone else to call it' },
            { id: 'c', text: 'No — `super` paths are forbidden inside function bodies' },
            { id: 'd', text: 'Yes, but only because `inner` is declared `pub`' },
            {
              id: 'a',
              text: 'Yes — child modules see ancestor-private items; privacy walls face outward, not inward',
            },
          ],
          correct: 'a',
          explain:
            'TRPL 7.2 privacy rule: an item is visible to its defining module *and all descendants*. `pub` on `inner` controls outside access to `inner` — it says nothing about what `inner` may see inward.',
        },
        {
          id: 'modules-privacy-q5',
          kind: 'bug',
          prompt:
            'mod m {\n    struct S;\n}\nuse m::S;\nfn main() {\n    let _s = S;\n}\n\nWhat is wrong here, and why is the fix smaller than you expect?',
          explain:
            'One error: E0603, `struct `S` is private` — `S` is not `pub` inside `m`. The module `m` itself is fine, because the `use` sits in the same module that declared it. Fix: `pub struct S;`, and nothing else. Crucially, `use` never grants visibility — it only shortens paths to things already visible.',
        },
      ],
    },
    {
      id: 'use-paths',
      title: 'Paths and Imports',
      fundamental: false,
      prereq: ['modules-privacy'],
      difficulty: 2,
      estMinutes: 25,
      reading: [
        {
          num: '7.4',
          title: 'Bringing Paths into Scope with the use Keyword',
          href: 'ch07-04-bringing-paths-into-scope-with-the-use-keyword.html',
        },
        {
          num: '7.5',
          title: 'Separating Modules into Different Files',
          href: 'ch07-05-separating-modules-into-different-files.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'modules2', href: '10_modules/modules2.rs' },
        { name: 'modules3', href: '10_modules/modules3.rs' },
      ],
      questions: [
        {
          id: 'use-paths-q1',
          kind: 'choice',
          prompt: 'What does `mod foo;` (no body, just a semicolon) tell the compiler?',
          options: [
            { id: 'a', text: 'Declare an empty module named foo' },
            { id: 'b', text: 'Load foo’s contents from foo.rs or foo/mod.rs' },
            { id: 'c', text: 'Import foo from an external crate' },
          ],
          correct: 'b',
          explain:
            'The semicolon form tells Rust the module body lives in another file with a matching name.',
        },
        {
          id: 'use-paths-q2',
          kind: 'choice',
          prompt: 'How do you import both `std::io` and `std::io::Write` in one statement?',
          options: [
            { id: 'a', text: '`use std::io::{self, Write};`' },
            { id: 'b', text: '`use std::io, std::io::Write;`' },
            { id: 'c', text: '`use std::io::*;`' },
          ],
          correct: 'a',
          explain:
            '`self` in a nested list refers to the parent path itself. The glob story also compiles but imports everything — the book prefers explicit nested lists.',
        },
        {
          id: 'use-paths-q3',
          kind: 'bug',
          prompt:
            'use std::fmt::Result;\nuse std::io::Result;\nfn main() {}\n\nWhy does this fail, and how do real codebases handle it?',
          explain:
            'Name collision (E0252): two different `Result` types in one namespace. Fix with an alias: `use std::io::Result as IoResult;` — exactly why `as` exists.',
        },
        {
          id: 'use-paths-q4',
          kind: 'choice',
          prompt: 'What does `use std::io::{self, Write};` import?',
          options: [
            { id: 'b', text: 'Only `Write`; `self` is a no-op filler' },
            {
              id: 'a',
              text: 'Both `std::io` itself and `std::io::Write` — inside a nested list, `self` names the base path',
            },
            { id: 'c', text: 'It fails — `self` is only valid in method receivers' },
            { id: 'd', text: 'The whole `std::io` module glob plus `Write`' },
          ],
          correct: 'a',
          explain:
            'TRPL 7.4: in a nested use-tree, `self` refers to the base path itself — needed when code uses both `io::stdin()`-style paths and the `Write` trait. The receiver-only story confuses path-`self` with receiver-`self`; the glob story would be `use std::io::*`.',
        },
      ],
    },
  ],
};
