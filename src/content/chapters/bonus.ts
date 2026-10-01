import type { Chapter } from '../schema';

export const bonus: Chapter = {
  key: 'bonus',
  num: null,
  title: 'Bonus — Tooling & Conversions',
  integrative: true,
  concepts: [
    {
      id: 'clippy-tooling',
      title: 'Clippy and Rustfmt',
      fundamental: false,
      prereq: ['functions'],
      difficulty: 2,
      estMinutes: 20,
      reading: [
        {
          num: 'App. D',
          title: 'Appendix D: Useful Development Tools',
          href: 'appendix-04-useful-development-tools.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'clippy1', href: '22_clippy/clippy1.rs' },
        { name: 'clippy2', href: '22_clippy/clippy2.rs' },
        { name: 'clippy3', href: '22_clippy/clippy3.rs' },
      ],
      questions: [
        {
          id: 'clippy-tooling-q1',
          kind: 'choice',
          prompt: 'What does `cargo clippy` add on top of `cargo check`?',
          options: [
            { id: 'a', text: 'Nothing, it is an exact alias' },
            { id: 'c', text: 'A faster compiler backend' },
            {
              id: 'b',
              text: 'A comprehensive collection of idiomatic and stylistic lints beyond compiler warnings',
            },
          ],
          correct: 'b',
          explain:
            'Clippy performs hundreds of additional static analysis checks for idiomatic Rust code.',
        },
        {
          id: 'clippy-tooling-q2',
          kind: 'choice',
          prompt: '`cargo fmt --check` in CI — what does it enforce?',
          options: [
            { id: 'b', text: 'Zero compiler warnings' },
            { id: 'a', text: 'Uniform formatting: the build fails on any formatting diff' },
            { id: 'c', text: 'Test coverage thresholds' },
          ],
          correct: 'a',
          explain:
            '`--check` never rewrites; it exits nonzero on diffs, turning style into a merge gate. Warnings and coverage are other tools’ jobs.',
        },
        {
          id: 'clippy-tooling-q3',
          kind: 'choice',
          prompt: 'rustfmt vs clippy — who does what?',
          options: [
            { id: 'a', text: 'rustfmt formats only; clippy lints for correctness and idioms' },
            { id: 'b', text: 'They do the same thing' },
            { id: 'c', text: 'clippy formats, rustfmt lints' },
          ],
          correct: 'a',
          explain:
            'Two axes: rustfmt owns whitespace-level consistency, clippy owns did-you-mean-it analysis (needless clones, len-zero checks, and hundreds more).',
        },
        {
          id: 'clippy-tooling-q4',
          kind: 'choice',
          prompt: 'What does `#![deny(clippy::all)]` at a crate root do?',
          options: [
            { id: 'b', text: 'Disables clippy entirely' },
            { id: 'c', text: 'Runs clippy faster by skipping some passes' },
            {
              id: 'a',
              text: 'Promotes all default clippy lints to hard errors — CI fails instead of warning',
            },
            { id: 'd', text: 'Only affects `cargo fmt`, not clippy' },
          ],
          correct: 'a',
          explain:
            "Lint levels (`allow`/`warn`/`deny`/`forbid`, Appendix + TRPL App D): `deny` turns diagnostics into build failures. The book's posture: `warn` locally, `deny` in CI. The disables-clippy story describes `#![allow]`; levels never change what clippy *checks*, only how failures surface.",
        },
      ],
    },
    {
      id: 'type-conversions',
      title: 'Type Conversions',
      fundamental: false,
      prereq: ['traits', 'generics'],
      difficulty: 3,
      estMinutes: 35,
      reading: [
        {
          num: 'App. C',
          title: 'Appendix C: Derivable Traits (From/TryFrom context)',
          href: 'appendix-03-derivable-traits.html',
        },
      ],
      examples: [
        {
          title: 'Conversion (From/Into, TryFrom/TryInto)',
          href: 'conversion.html',
          kind: 'exact',
        },
        { title: '`From` and `Into`', href: 'conversion/from_into.html', kind: 'reinforce' },
        {
          title: '`TryFrom` and `TryInto`',
          href: 'conversion/try_from_try_into.html',
          kind: 'reinforce',
        },
        { title: 'To and from Strings', href: 'conversion/string.html', kind: 'reinforce' },
      ],
      drills: [
        { name: 'using_as', href: '23_conversions/using_as.rs' },
        { name: 'from_into', href: '23_conversions/from_into.rs' },
        { name: 'from_str', href: '23_conversions/from_str.rs' },
        { name: 'try_from_into', href: '23_conversions/try_from_into.rs' },
        { name: 'as_ref_mut', href: '23_conversions/as_ref_mut.rs' },
      ],
      questions: [
        {
          id: 'type-conversions-q1',
          kind: 'choice',
          prompt:
            'If you implement `impl From<Celsius> for Fahrenheit`, what do you get automatically?',
          options: [
            { id: 'a', text: 'Nothing extra' },
            { id: 'c', text: 'An automatic `TryFrom` implementation as well' },
            { id: 'b', text: 'An automatic Into<Fahrenheit> implementation for Celsius' },
          ],
          correct: 'b',
          explain:
            'The standard library provides a blanket `impl<T, U> Into<U> for T where U: From<T>`.',
        },
        {
          id: 'type-conversions-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let n: i32 = "42".parse().unwrap();\n    println!("{}", n + 1);\n}',
          explain:
            'The annotation drives inference: `parse` resolves to `FromStr for i32`. Remove the annotation and inference fails — there is nothing left to pin the target type. Output:\n43',
        },
        {
          id: 'type-conversions-q3',
          kind: 'choice',
          prompt: '`as` casts vs `From` — when is `as` dangerous?',
          options: [
            {
              id: 'a',
              text: 'Lossy conversions (e.g. `300u16 as u8` wraps silently) with no error signal',
            },
            { id: 'b', text: 'Never — `as` is always safe' },
            { id: 'c', text: 'Only when converting floats' },
          ],
          correct: 'a',
          explain:
            '`as` never fails loudly: out-of-range values wrap (or saturate for floats). `TryFrom` exists precisely for fallible conversions.',
        },
        {
          id: 'type-conversions-q4',
          kind: 'choice',
          prompt: 'Why does `TryFrom` carry an associated `Error` type while `From` does not?',
          options: [
            { id: 'b', text: '`From` predates associated types and cannot be changed' },
            {
              id: 'a',
              text: '`try_into()` can fail, so each implementation names its failure type; infallible `From` needs no such channel',
            },
            { id: 'c', text: 'To make `TryFrom` slower and discourage its use' },
            { id: 'd', text: 'There is no difference — `From` also has an `Error` type' },
          ],
          correct: 'a',
          explain:
            'RBE conversions + TRPL 9/10: `TryFrom::Error` carries the failure (e.g. `TryFromIntError`); `From` cannot fail by contract, so no channel exists. This is also why `?` works smoothly on `TryFrom` results while `From` needs no error plumbing at all.',
        },
        {
          id: 'type-conversions-q5',
          kind: 'choice',
          prompt:
            '`let s: String = "hi".into();` — why does this compile without naming `String::from`?',
          options: [
            {
              id: 'a',
              text: 'Blanket impl: `From<&str> for String` exists, and every `From` gives a free `Into` — inference picks the target from the annotation',
            },
            { id: 'b', text: 'The compiler special-cases string literals' },
            { id: 'c', text: '`.into()` always produces `String` regardless of annotation' },
            { id: 'd', text: 'Type annotations are ignored for `.into()`' },
          ],
          correct: 'a',
          explain:
            'RBE conversions: `impl From<&str> for String` plus the std blanket `impl<T, U: From<T>> Into<U> for T`. The annotation selects which `From` applies — without it, `.into()` is genuinely ambiguous (the classic inference error). The always-`String` and ignored-annotation stories deny the annotation-driven resolution.',
        },
      ],
    },
    {
      id: 'appendix-reference',
      title: 'Appendix Reference',
      fundamental: false,
      prereq: ['functions'],
      difficulty: 1,
      estMinutes: 25,
      reading: [
        { num: 'App.', title: 'Appendix (index)', href: 'appendix-00.html' },
        { num: 'App. A', title: 'Keywords', href: 'appendix-01-keywords.html' },
        { num: 'App. B', title: 'Operators and Symbols', href: 'appendix-02-operators.html' },
        { num: 'App. E', title: 'Editions', href: 'appendix-05-editions.html' },
        { num: 'App. F', title: 'Translations of the Book', href: 'appendix-06-translation.html' },
        {
          num: 'App. G',
          title: 'How Rust is Made and “Nightly Rust”',
          href: 'appendix-07-nightly-rust.html',
        },
      ],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'appendix-reference-q1',
          kind: 'choice',
          prompt:
            'You want to name a variable `match`, but the compiler rejects it. Where do you confirm why?',
          options: [
            { id: 'b', text: 'Appendix B — Operators: `match` is an operator' },
            { id: 'a', text: 'Appendix A — Keywords: `match` is reserved for pattern matching' },
            { id: 'c', text: 'Nowhere — any word can be a variable name' },
          ],
          correct: 'a',
          explain:
            'Appendix A lists Rust’s reserved keywords. `match` is a keyword, so it cannot be used as an identifier.',
        },
        {
          id: 'appendix-reference-q2',
          kind: 'choice',
          prompt: 'Where do you check whether `gen` may be used as an identifier in your edition?',
          options: [
            { id: 'b', text: 'Appendix B — operators' },
            { id: 'c', text: 'Nowhere official — only Stack Overflow' },
            {
              id: 'a',
              text: 'Appendix A — keywords, including edition-gated strict and weak keywords',
            },
          ],
          correct: 'a',
          explain:
            'Keywords come in flavors (strict, reserved, weak) and some are edition-gated — Appendix A tracks exactly which words are taken where.',
        },
        {
          id: 'appendix-reference-q3',
          kind: 'choice',
          prompt: 'What is a Rust “edition”?',
          options: [
            {
              id: 'a',
              text: 'An opt-in set of (mostly syntax-level) rules per crate; crates of different editions interoperate freely',
            },
            { id: 'b', text: 'A compiler release that breaks all old code' },
            { id: 'c', text: 'A printing of the book' },
          ],
          correct: 'a',
          explain:
            'Editions let the language evolve without forking the ecosystem: 2015/2018/2021/2024 crates link together in one binary.',
        },
        {
          id: 'appendix-reference-q4',
          kind: 'choice',
          prompt:
            '`#[derive(...)]` fails on your struct. Where do you check which traits are derivable?',
          options: [
            { id: 'b', text: 'Appendix A: Keywords' },
            { id: 'c', text: 'The `std::derive` module docs' },
            {
              id: 'a',
              text: 'Appendix C: Derivable Traits — the canonical list (`Debug`, `Clone`, `PartialEq`, …) with requirements',
            },
            { id: 'd', text: 'Nowhere — derivability is inferred automatically' },
          ],
          correct: 'a',
          explain:
            'Appendix C is exactly the derivability index the book maintains. The `std::derive`-module story invents a module; the nowhere-to-look story denies the closed derive-macro set. Reference discipline: when the compiler names a missing trait, the appendix confirms whether `derive` can supply it.',
        },
      ],
    },
    {
      id: 'attributes',
      title: 'Compiler Attributes',
      fundamental: false,
      prereq: ['functions'],
      difficulty: 2,
      estMinutes: 20,
      reading: [],
      examples: [
        { title: 'Attributes', href: 'attribute.html', kind: 'exact' },
        { title: '`dead_code`', href: 'attribute/unused.html', kind: 'reinforce' },
        { title: 'Crates', href: 'attribute/crate.html', kind: 'reinforce' },
        { title: '`cfg`', href: 'attribute/cfg.html', kind: 'reinforce' },
        { title: 'Custom cfg', href: 'attribute/cfg/custom.html', kind: 'reinforce' },
      ],
      drills: [],
      questions: [
        {
          id: 'attributes-q1',
          kind: 'choice',
          prompt: 'What does `#[cfg(target_os = "linux")]` above a function do?',
          options: [
            { id: 'b', text: 'Checks at runtime whether the OS is Linux' },
            { id: 'c', text: 'Disables all compiler warnings for that function' },
            { id: 'a', text: 'Compiles the function only when targeting Linux' },
          ],
          correct: 'a',
          explain:
            '#[cfg(...)] is conditional compilation: the item only exists in builds matching the predicate. Runtime checks use the cfg! macro instead.',
        },
        {
          id: 'attributes-q2',
          kind: 'choice',
          prompt: '`cfg!` macro vs `#[cfg]` attribute — what is the difference?',
          options: [
            { id: 'b', text: 'There is none' },
            {
              id: 'a',
              text: '`cfg!` yields a bool at compile time but BOTH branches still compile; `#[cfg]` removes code entirely',
            },
            { id: 'c', text: '`cfg!` evaluates at runtime' },
          ],
          correct: 'a',
          explain:
            '`if cfg!(unix)` compiles the dead branch too (it must typecheck); `#[cfg(unix)]` erases it before compilation. Different tools: runtime-flexible check vs zero-cost gating.',
        },
        {
          id: 'attributes-q3',
          kind: 'bug',
          prompt:
            '#[allow(dead_code)]\nfn unused() {}\nfn main() {\n    #[allow(dead_code)]\n    let x = 5;\n    println!("hi");\n}\n\nThe author expected silence. What warning survives, and why?',
          explain:
            '“unused variable: `x`” survives: lints are specific — `dead_code` covers never-used items, but an unused local fires the separate `unused_variables` lint, which `dead_code` does not touch. Fix: `let _x` or `#[allow(unused_variables)]`.',
        },
        {
          id: 'attributes-q4',
          kind: 'choice',
          prompt: 'What does `#[cfg(all(unix, target_pointer_width = "64"))]` mean?',
          options: [
            { id: 'b', text: 'Compile on any Unix OR any 64-bit target' },
            { id: 'c', text: 'It is a runtime check evaluated at startup' },
            { id: 'd', text: 'It enables the `unix` and `64` Cargo features' },
            {
              id: 'a',
              text: 'Compile this item only on 64-bit Unix targets — `all` conjoins predicates',
            },
          ],
          correct: 'a',
          explain:
            'RBE attributes: `all(...)` is conjunction (`any` disjoins, `not` negates). Like all of `#[cfg]`, it gates at compile time — the item does not exist in non-matching builds. The runtime-check story confuses `#[cfg]` with the `cfg!` macro; the enables-features story confuses platform predicates with Cargo features.',
        },
      ],
    },
  ],
};
