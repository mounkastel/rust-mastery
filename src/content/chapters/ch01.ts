import type { Chapter } from '../schema';

export const ch01: Chapter = {
  key: '1',
  num: 1,
  title: 'Getting Started',
  integrative: false,
  concepts: [
    {
      id: 'installation-hello',
      title: 'Setup and Hello',
      fundamental: false,
      prereq: [],
      difficulty: 1,
      estMinutes: 20,
      reading: [
        { num: '1.1', title: 'Installation', href: 'ch01-01-installation.html' },
        { num: '1.2', title: 'Hello, World!', href: 'ch01-02-hello-world.html' },
        {
          num: '1.0',
          title: 'Getting Started (chapter overview)',
          href: 'ch01-00-getting-started.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'intro1', href: '00_intro/intro1.rs' },
        { name: 'intro2', href: '00_intro/intro2.rs' },
      ],
      questions: [
        {
          id: 'installation-hello-q1',
          kind: 'choice',
          prompt: 'Why does `println!` have a `!` after its name?',
          options: [
            { id: 'a', text: 'It is a macro, not a regular function' },
            { id: 'b', text: 'It is required for all I/O in Rust' },
            { id: 'c', text: 'It marks the function as unsafe' },
          ],
          correct: 'a',
          explain:
            'The `!` marks macro invocations. Macros like println! expand at compile time and can accept a variable number of format arguments, which an ordinary function cannot.',
        },
        {
          id: 'installation-hello-q2',
          kind: 'choice',
          prompt:
            'You run `rustc main.rs` (no Cargo involved). What appears in the current directory?',
          options: [
            { id: 'a', text: '`a.out`, like gcc' },
            { id: 'b', text: 'An executable named `main`' },
            { id: 'c', text: 'Nothing — rustc requires a Cargo project' },
          ],
          correct: 'b',
          explain:
            '`rustc main.rs` compiles straight to ./main (main.exe on Windows). `a.out` is gcc’s default; Cargo is convenient but never required.',
        },
        {
          id: 'installation-hello-q3',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let apples = 5;\n    println!("I have {apples} apples, that is {apples} total");\n}',
          explain:
            'Inline format args (Rust 2021+) capture `apples` directly — no positional `{}` placeholder needed. Output:\nI have 5 apples, that is 5 total',
        },
        {
          id: 'installation-hello-q4',
          kind: 'bug',
          prompt:
            'A teammate mixes both format styles:\n\nfn main() {\n    let apples = 5;\n    println!("I have {apples} apples", apples);\n}\n\nWhat happens, and why?',
          explain:
            'Compile error: `redundant argument`. `{apples}` already captures the variable inline (Rust 2021+), so the trailing `apples` matches no `{}` placeholder. Fix: drop it — `println!("I have {apples} apples");` — or go fully positional: `println!("I have {} apples", apples);`. The format string is checked at compile time, which is exactly why `println!` must be a macro rather than a plain function.',
        },
      ],
    },
    {
      id: 'cargo-basics',
      title: 'Cargo Basics',
      fundamental: false,
      prereq: ['installation-hello'],
      difficulty: 1,
      estMinutes: 15,
      reading: [{ num: '1.3', title: 'Hello, Cargo!', href: 'ch01-03-hello-cargo.html' }],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'cargo-basics-q1',
          kind: 'choice',
          prompt:
            'Which command type-checks your project without producing a runnable binary, fastest?',
          options: [
            { id: 'a', text: 'cargo build' },
            { id: 'c', text: 'cargo run' },
            { id: 'b', text: 'cargo check' },
          ],
          correct: 'b',
          explain:
            '`cargo check` skips code generation and just checks types/borrows, which is much faster while iterating.',
        },
        {
          id: 'cargo-basics-q2',
          kind: 'choice',
          prompt: '`cargo new game --bin` then `cargo build`. Where is the runnable binary?',
          options: [
            { id: 'a', text: 'In the project root: `game/game`' },
            { id: 'b', text: 'In `game/target/debug/game`' },
            { id: 'c', text: 'In `game/src/game`' },
          ],
          correct: 'b',
          explain:
            'Cargo puts build artifacts under target/<profile>/ — src/ holds only sources, never binaries.',
        },
        {
          id: 'cargo-basics-q3',
          kind: 'choice',
          prompt:
            'A teammate clones your repo. Which file pins the exact dependency versions they will build with?',
          options: [
            { id: 'a', text: 'Cargo.toml' },
            { id: 'c', text: '.cargo/config.toml' },
            { id: 'b', text: 'Cargo.lock' },
          ],
          correct: 'b',
          explain:
            'Cargo.toml declares requirements (often ranges); Cargo.lock records the exact resolved versions. Commit the lockfile for binaries.',
        },
        {
          id: 'cargo-basics-q4',
          kind: 'choice',
          prompt:
            'Your `Cargo.toml` says `serde = "1.0"` and the committed `Cargo.lock` pins `1.0.197`. A teammate clones fresh and runs `cargo build`. Which version compiles in?',
          options: [
            {
              id: 'b',
              text: 'Exactly `1.0.197` — the lockfile pins every dependency for reproducible builds',
            },
            {
              id: 'a',
              text: 'The newest `1.x` on crates.io — the lockfile only matters for library crates',
            },
            { id: 'c', text: '`1.0.0` — Cargo always resolves to the lowest matching version' },
            { id: 'd', text: 'Whichever `1.x` happens to sit in their local cargo cache' },
          ],
          correct: 'b',
          explain:
            '`Cargo.toml` declares a compatible range (`"1.0"` means `^1.0`: `>=1.0.0, <2.0.0`); `Cargo.lock` records the exact resolved tree, and a fresh clone reproduces it bit-for-bit. The local-cache story never overrides the lockfile, and Cargo picks the newest compatible version at `update` time — never the lowest.',
        },
      ],
    },
  ],
};
