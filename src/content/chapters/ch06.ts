import type { Chapter } from '../schema';

export const ch06: Chapter = {
  key: '6',
  num: 6,
  title: 'Enums and Pattern Matching',
  integrative: false,
  concepts: [
    {
      id: 'enums',
      title: 'Enums with Data',
      fundamental: true,
      prereq: ['structs'],
      difficulty: 3,
      estMinutes: 30,
      reading: [
        { num: '6.1', title: 'Defining an Enum', href: 'ch06-01-defining-an-enum.html' },
        {
          num: '6.0',
          title: 'Enums and Pattern Matching (chapter overview)',
          href: 'ch06-00-enums.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'enums1', href: '08_enums/enums1.rs' },
        { name: 'enums2', href: '08_enums/enums2.rs' },
      ],
      questions: [
        {
          id: 'enums-q1',
          kind: 'choice',
          prompt: 'What does `Option<T>` model?',
          options: [
            { id: 'b', text: 'A value that may or may not be present' },
            { id: 'a', text: 'An error that may occur' },
            { id: 'c', text: 'A value protected by a mutex' },
          ],
          correct: 'b',
          explain:
            'Option<T> is Some(T) or None — Rust’s type-safe replacement for nullable references.',
        },
        {
          id: 'enums-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nenum M { On(String), Off }\nfn main() {\n    let m = M::On(String::from("hi"));\n    match m {\n        M::On(s) => println!("on {s}"),\n        M::Off => println!("off"),\n    }\n}',
          explain:
            'The `On` arm binds the inner `String` to `s` — variants can carry data of different types. Output:\non hi',
        },
        {
          id: 'enums-q3',
          kind: 'choice',
          prompt: 'Why does `Option<T>` prevent null-pointer bugs instead of just renaming them?',
          options: [
            { id: 'b', text: 'Checking `None` is faster than checking null' },
            {
              id: 'a',
              text: 'The compiler forces every use site to handle both cases — there is no implicit unwrap',
            },
            { id: 'c', text: 'It uses less memory than a nullable pointer' },
          ],
          correct: 'a',
          explain:
            'Safety comes from exhaustiveness: you cannot reach the inner value without confronting `None`. No silent default, no forgotten check.',
        },
        {
          id: 'enums-q4',
          kind: 'choice',
          prompt: 'What determines `size_of::<MyEnum>()`?',
          options: [
            { id: 'a', text: "The sum of all variants' sizes" },
            { id: 'c', text: 'Always 8 bytes regardless of variants' },
            { id: 'd', text: 'Nothing — enums are purely compile-time and occupy no space' },
            {
              id: 'b',
              text: 'The largest variant plus discriminant bookkeeping — Rust must fit whichever variant is live',
            },
          ],
          correct: 'b',
          explain:
            'An enum holds one variant at a time, so Rust allocates the maximum variant size plus a discriminant tag. The summed-sizes story describes a struct; the zero-space story confuses enums with zero-sized marker types.',
        },
        {
          id: 'enums-q5',
          kind: 'bug',
          prompt: "enum M { On, Off }\nfn main() {\n    let m = On;\n}\n\nWhy won't this compile?",
          explain:
            "Variants live in the enum's namespace: `M::On`, not bare `On` (TRPL 6.1). Bare `Some`/`None` only work because the prelude imports them — your own variants need the path or `use M::*`.",
        },
      ],
    },
    {
      id: 'option-type',
      title: 'The Option Type',
      fundamental: true,
      prereq: ['enums'],
      difficulty: 2,
      estMinutes: 25,
      reading: [
        {
          num: '6.1',
          title: 'The Option Enum (Option section)',
          href: 'ch06-01-defining-an-enum.html#the-option-enum-and-its-advantages-over-null-values',
        },
        {
          num: 'std',
          title: 'Option<T> API docs',
          href: 'https://doc.rust-lang.org/std/option/enum.Option.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'options1', href: '12_options/options1.rs' },
        { name: 'options2', href: '12_options/options2.rs' },
      ],
      questions: [
        {
          id: 'option-type-q1',
          kind: 'predict',
          prompt:
            'let a: Option<i32> = Some(10);\nlet b: Option<i32> = None;\nprintln!("{} {}", a.unwrap_or(0), b.unwrap_or(0));',
          explain:
            '`unwrap_or` returns the value inside `Some`, or the provided fallback default for `None`. Output:\n10 0',
        },
        {
          id: 'option-type-q2',
          kind: 'bug',
          prompt:
            'fn plus_one(x: Option<i32>) -> Option<i32> {\n    match x {\n        Some(i) => Some(i + 1),\n    }\n}\n\nWhat does the compiler demand here?',
          explain:
            'Exhaustiveness (E0004): the `None` case is unhandled. Add `None => None,` — the compiler refuses to let a case fall through silently.',
        },
        {
          id: 'option-type-q3',
          kind: 'choice',
          prompt: 'What does `match` give you that `if let` + `else` does not?',
          options: [
            { id: 'b', text: 'The ability to bind values from patterns' },
            { id: 'c', text: 'Matching on integers' },
            { id: 'a', text: 'Compiler-checked exhaustiveness' },
          ],
          correct: 'a',
          explain:
            '`if let` also binds values and matches integers, but only `match` proves to the compiler that no case was forgotten.',
        },
        {
          id: 'option-type-q4',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn f(x: Option<i32>) -> Option<i32> {\n    let y = x?;\n    Some(y * 2)\n}\nfn main() {\n    println!("{:?} {:?}", f(Some(21)), f(None));\n}',
          explain:
            '`?` unwraps `Some` or early-returns `None` from the whole function — exactly as it propagates `Err` on `Result` (TRPL 9.2). Output:\nSome(42) None',
        },
      ],
    },
    {
      id: 'match',
      title: 'Pattern Matching',
      fundamental: true,
      prereq: ['enums'],
      difficulty: 3,
      estMinutes: 25,
      reading: [
        { num: '6.2', title: 'The match Control Flow Construct', href: 'ch06-02-match.html' },
      ],
      examples: [],
      drills: [{ name: 'enums3', href: '08_enums/enums3.rs' }],
      questions: [
        {
          id: 'match-q1',
          kind: 'recite',
          prompt: 'Why does Rust force `match` arms to be exhaustive, unlike switch in C or JS?',
          explain:
            'Exhaustiveness is checked at compile time so that adding a new enum variant later forces every match site that cares to be updated — this eliminates a whole class of "forgot to handle the new case" bugs.',
        },
        {
          id: 'match-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let n = 7;\n    match n {\n        x if x < 5 => println!("small"),\n        x if x % 2 == 1 => println!("odd {x}"),\n        _ => println!("other"),\n    }\n}',
          explain:
            'Arms try in order with their guards. `7` is not `< 5`, but it is odd → binds `x` to `7`. Output:\nodd 7',
        },
        {
          id: 'match-q3',
          kind: 'choice',
          prompt: 'Which pattern may appear in a plain `let` (not `if let`, not `match`)?',
          options: [
            { id: 'a', text: '`(x, y)` destructuring a tuple' },
            { id: 'b', text: '`Some(x)` on an Option' },
            { id: 'c', text: 'The literal `3` on an integer' },
          ],
          correct: 'a',
          explain:
            'Plain `let` accepts only irrefutable patterns — ones that cannot fail. `Some(x)` and literals can fail, so they need `match`/`if let`.',
        },
        {
          id: 'match-q4',
          kind: 'bug',
          prompt:
            'fn main() {\n    let n: Option<i32> = Some(3);\n    match n {\n        Some(x) => println!("{x}"),\n    }\n}\n\nWhat does the compiler demand, and what are the two idiomatic fixes?',
          explain:
            'Non-exhaustive patterns (E0004): `None` is unhandled. Add a `None => {}` arm, or collapse the whole thing to `if let Some(x) = n`. The compiler proves exhaustiveness — it refuses to guess what missing arms should do.',
        },
        {
          id: 'match-q5',
          kind: 'choice',
          prompt:
            'Matching `&opt` where `opt: Option<String>` — what is the type of `x` in `Some(x) => ...`?',
          options: [
            { id: 'b', text: '`String` — matching always moves the inner value out' },
            {
              id: 'a',
              text: '`&String` — default binding modes auto-adjust so `x` borrows; no `&` needed in the pattern',
            },
            { id: 'c', text: 'It fails to compile — you must write `Some(&x)` explicitly' },
            { id: 'd', text: '`&&String` — one `&` from the scrutinee plus one from the pattern' },
          ],
          correct: 'a',
          explain:
            'Match ergonomics (TRPL patterns chapters): matching a reference switches bindings to borrow mode automatically. Explicit `&` still compiles but is unneeded; the always-moves story would move out of borrowed content and is rejected.',
        },
      ],
    },
    {
      id: 'if-let',
      title: 'Shorthand Matching',
      fundamental: false,
      prereq: ['match'],
      difficulty: 2,
      estMinutes: 20,
      reading: [
        {
          num: '6.3',
          title: 'Concise Control Flow with if let and let...else',
          href: 'ch06-03-if-let.html',
        },
      ],
      examples: [],
      drills: [{ name: 'options2', href: '12_options/options2.rs' }],
      questions: [
        {
          id: 'if-let-q1',
          kind: 'choice',
          prompt: '`if let Some(x) = maybe_val { ... }` is sugar for which match?',
          options: [
            { id: 'a', text: 'match maybe_val { Some(x) => {...}, _ => {} }' },
            { id: 'b', text: 'match maybe_val { Some(x) => {...} }' },
            { id: 'c', text: 'while maybe_val.is_some() {...}' },
          ],
          correct: 'a',
          explain:
            'if let is exactly a match with one handled arm and an implicit do-nothing `_` arm.',
        },
        {
          id: 'if-let-q2',
          kind: 'bug',
          prompt:
            'fn main() {\n    let s = Some(String::from("hi"));\n    if let Some(x) = s {\n        println!("{x}");\n    }\n    println!("{:?}", s);\n}\n\nWhy does the last line fail?',
          explain:
            'Partial move (E0382): matching `Some(x)` by value moves the String out of `s`, so `s` is partially moved and cannot be used afterwards. Borrow instead: `if let Some(x) = &s`.',
        },
        {
          id: 'if-let-q3',
          kind: 'choice',
          prompt: '`let Some(x) = opt else { return; };` — what must the `else` block do?',
          options: [
            { id: 'b', text: 'Assign a default value to `x`' },
            {
              id: 'a',
              text: 'Diverge: return, break, continue, or panic — it may never fall through',
            },
            { id: 'c', text: 'Anything; `x` becomes `None` on the sad path' },
          ],
          correct: 'a',
          explain:
            '`let-else` only compiles if the else branch diverges, because execution continues with `x` bound — there must be no path where `x` is unbound.',
        },
        {
          id: 'if-let-q4',
          kind: 'choice',
          prompt: 'Why is `if let x = 5 { ... }` rejected?',
          options: [
            { id: 'b', text: '`if let` requires an `else` arm to compile' },
            { id: 'c', text: '`x` must be declared `mut` before it can bind' },
            { id: 'a', text: 'Irrefutable patterns are forbidden in `if let` — use a plain `let`' },
            { id: 'd', text: 'Integer literals cannot appear in patterns' },
          ],
          correct: 'a',
          explain:
            '`if let` exists for refutable patterns; `x = 5` always matches, making the conditional meaningless — the compiler says so (irrefutable `if let` error, TRPL 6.3). Integers match fine as patterns; the construct, not the literal, is the problem.',
        },
      ],
    },
  ],
};
