import type { Chapter } from '../schema';

export const ch20: Chapter = {
  key: '20',
  num: 20,
  title: 'Advanced Features',
  integrative: false,
  concepts: [
    {
      id: 'unsafe-rust',
      title: 'Unsafe Rust',
      fundamental: true,
      prereq: ['lifetimes'],
      difficulty: 4,
      estMinutes: 30,
      reading: [
        { num: '20.1', title: 'Unsafe Rust', href: 'ch20-01-unsafe-rust.html' },
        {
          num: '20.0',
          title: 'Advanced Features (chapter overview)',
          href: 'ch20-00-advanced-features.html',
        },
      ],
      examples: [
        { title: 'Foreign Function Interface', href: 'std_misc/ffi.html', kind: 'reinforce' },
      ],
      drills: [],
      questions: [
        {
          id: 'unsafe-rust-q1',
          kind: 'bug',
          prompt:
            'let x = 5;\nlet r = &x as *const i32;\nprintln!("{}", *r);\n\nWhy won’t this compile, and what is the minimal fix?',
          explain:
            'Creating a raw pointer with `as` is safe, but dereferencing it is one of the five unsafe-only operations (E0133). Minimal fix: wrap only the dereference — println!("{}", unsafe { *r }). Everything else, including the borrow checker, keeps working as usual.',
        },
        {
          id: 'unsafe-rust-q2',
          kind: 'choice',
          prompt: 'Which raw-pointer operations are legal in SAFE Rust?',
          options: [
            { id: 'b', text: 'Dereferencing them' },
            { id: 'c', text: 'Freeing their memory with `drop`' },
            { id: 'a', text: 'Creating them, copying them, comparing them' },
          ],
          correct: 'a',
          explain:
            'Forming and shuffling addresses is harmless; only DEREFERENCING (and a few siblings) can actually violate memory safety, so only those need `unsafe`.',
        },
        {
          id: 'unsafe-rust-q3',
          kind: 'bug',
          prompt:
            'static mut N: i32 = 0;\nfn main() {\n    N += 1;\n    println!("{N}");\n}\n\nBoth marked lines fail. Why, and what is the fix?',
          explain:
            'E0133 twice: touching a `static mut` — writing AND reading — is unsafe-only, because global mutable state is shared across threads by nature. Wrap each access: `unsafe { N += 1; }`, `println!("{}", unsafe { N });`.',
        },
        {
          id: 'unsafe-rust-q4',
          kind: 'choice',
          prompt: 'Which is NOT one of the five unsafe superpowers (TRPL 20.1)?',
          options: [
            { id: 'a', text: 'Accessing fields of a `union`' },
            { id: 'b', text: 'Catching a panic across FFI boundaries' },
            { id: 'c', text: 'Calling an `unsafe` function' },
            { id: 'd', text: 'Mutating a `static mut` variable' },
          ],
          correct: 'b',
          explain:
            'TRPL 20.1 lists exactly five: dereferencing raw pointers, calling `unsafe` fns, touching `static mut`, implementing unsafe traits, accessing `union` fields. Panic-catching (`catch_unwind`) is safe Rust. The `unsafe` keyword marks the rest as caller-audited.',
        },
        {
          id: 'unsafe-rust-q5',
          kind: 'bug',
          prompt: 'unsafe fn danger() {}\nfn main() {\n    danger();\n}\n\nWhy rejected?',
          explain:
            'Calling an `unsafe fn` requires an `unsafe` block — the caller must opt into upholding its preconditions (TRPL 20.1). Fix: `unsafe { danger(); }`. Note the inverse is free: safe code runs fine inside `unsafe` blocks.',
        },
        {
          id: 'unsafe-rust-q6',
          kind: 'bug',
          prompt:
            'fn main() {\n    unsafe {\n        println!("{}", abs(-3));\n    }\n}\n\nWhy won\'t this link, let alone run?',
          explain:
            '`abs` was never declared: calling C requires `unsafe extern "C" { fn abs(x: i32) -> i32; }` so Rust knows the symbol and its ABI (TRPL 20.1 FFI). `unsafe` alone cannot summon a foreign symbol — declaration first, `unsafe` call second.',
        },
      ],
    },
    {
      id: 'advanced-traits-types',
      title: 'Advanced Traits',
      fundamental: false,
      prereq: ['traits', 'generics'],
      difficulty: 4,
      estMinutes: 35,
      reading: [
        { num: '20.2', title: 'Advanced Traits', href: 'ch20-02-advanced-traits.html' },
        { num: '20.3', title: 'Advanced Types', href: 'ch20-03-advanced-types.html' },
        {
          num: '20.4',
          title: 'Advanced Functions and Closures',
          href: 'ch20-04-advanced-functions-and-closures.html',
        },
      ],
      examples: [],
      drills: [{ name: 'traits5', href: '15_traits/traits5.rs' }],
      questions: [
        {
          id: 'advanced-traits-types-q1',
          kind: 'recite',
          prompt:
            'Why can’t you write `impl std::fmt::Display for Vec<String>` directly in your crate?',
          explain:
            'The orphan rule requires either the trait or the type to be defined locally in your crate. Wrapping `Vec<String>` in a local struct (newtype) resolves this.',
        },
        {
          id: 'advanced-traits-types-q2',
          kind: 'choice',
          prompt: '`trait Person: Name` — what does the `: Name` part demand?',
          options: [
            { id: 'b', text: '`Person` automatically inherits all of `Name`’s method bodies' },
            {
              id: 'a',
              text: 'Every implementor of `Person` must also implement `Name` (supertrait bound)',
            },
            { id: 'c', text: 'Nothing — it is documentation' },
          ],
          correct: 'a',
          explain:
            'Supertraits express "you must be a Name before you can be a Person", letting `Person` methods rely on `Name` behavior. No automatic method copying happens.',
        },
        {
          id: 'advanced-traits-types-q3',
          kind: 'choice',
          prompt:
            'Why wrap `Vec<String>` in `struct Winners(Vec<String>)` instead of using it directly?',
          options: [
            {
              id: 'a',
              text: 'To attach trait impls despite the orphan rule, and to give the abstraction a name and type safety',
            },
            { id: 'b', text: 'For runtime performance' },
            { id: 'c', text: 'There is no reason' },
          ],
          correct: 'a',
          explain:
            'The newtype pattern is the orphan-rule escape hatch plus free documentation: a `Winners` is not just any vector, and the compiler enforces the distinction.',
        },
        {
          id: 'advanced-traits-types-q4',
          kind: 'choice',
          prompt: 'When do associated types beat generic parameters (`trait G<T>`)?',
          options: [
            { id: 'b', text: 'When implementors need many simultaneous choices for the same type' },
            {
              id: 'a',
              text: 'When each implementor has exactly one natural choice (e.g. `Iterator::Item`) — callers avoid annotating a parameter that can only ever be one thing',
            },
            { id: 'c', text: 'Associated types are always faster at runtime' },
            { id: 'd', text: 'Never — generics strictly dominate associated types' },
          ],
          correct: 'a',
          explain:
            'TRPL 20.3: one-impl-one-choice → `associated type` (no annotation burden); many-choices-per-type → `generics` (an associated type would forbid a second impl). The many-simultaneous-choices story states the generic case; the always-faster story invents a runtime difference — both monomorphize identically.',
        },
        {
          id: 'advanced-traits-types-q5',
          kind: 'bug',
          prompt:
            'trait A { fn f(&self); }\ntrait B { fn f(&self); }\nstruct S;\nimpl A for S { fn f(&self) {} }\nimpl B for S { fn f(&self) {} }\nfn main() {\n    let s = S;\n    s.f();\n}\n\nWhy is the call ambiguous, and what is the fix?',
          explain:
            'Both traits supply `f` — method resolution cannot choose (E0034). Disambiguate with fully-qualified syntax: `A::f(&s);` (TRPL 20.2, Advanced Traits). The impls themselves are legal; only the dot-call is ambiguous.',
        },
        {
          id: 'advanced-traits-types-q6',
          kind: 'choice',
          prompt:
            'Why can `str` (unsized) only appear as `&str`, `Box<str>`, or behind another pointer?',
          options: [
            {
              id: 'a',
              text: 'Dynamically sized types have no compile-time-known size, so every use needs a pointer carrying the size (length/vtable) alongside',
            },
            { id: 'b', text: 'The compiler never implemented direct `str` variables' },
            { id: 'c', text: '`str` is always heap-allocated and must be boxed' },
            {
              id: 'd',
              text: 'Unsized types are forbidden entirely — even `&str` is legacy syntax',
            },
          ],
          correct: 'a',
          explain:
            "TRPL 20.4 (DST): `str`/`[T]`/`dyn Trait` lack `Sized`; fat pointers (`&str` = address + length) restore knowability. The always-heap story is false — `&str` routinely borrows non-heap statics; the forbidden-entirely story denies the language's core string type.",
        },
      ],
    },
    {
      id: 'macros',
      title: 'Writing Macros',
      fundamental: false,
      prereq: ['functions'],
      difficulty: 4,
      estMinutes: 30,
      reading: [{ num: '20.5', title: 'Macros', href: 'ch20-05-macros.html' }],
      examples: [
        { title: 'Syntax', href: 'macros/syntax.html', kind: 'reinforce' },
        { title: 'Designators', href: 'macros/designators.html', kind: 'reinforce' },
        { title: 'Overload', href: 'macros/overload.html', kind: 'reinforce' },
        { title: 'Repeat', href: 'macros/repeat.html', kind: 'reinforce' },
        { title: "DRY (Don't Repeat Yourself)", href: 'macros/dry.html', kind: 'reinforce' },
        { title: 'Domain Specific Languages (DSLs)', href: 'macros/dsl.html', kind: 'reinforce' },
        { title: 'Variadic Interfaces', href: 'macros/variadics.html', kind: 'reinforce' },
      ],
      drills: [
        { name: 'macros1', href: '21_macros/macros1.rs' },
        { name: 'macros2', href: '21_macros/macros2.rs' },
        { name: 'macros3', href: '21_macros/macros3.rs' },
        { name: 'macros4', href: '21_macros/macros4.rs' },
      ],
      questions: [
        {
          id: 'macros-q1',
          kind: 'choice',
          prompt: 'What do declarative macros (`macro_rules!`) operate on?',
          options: [
            { id: 'a', text: 'Runtime values' },
            { id: 'c', text: 'CPU instructions' },
            { id: 'b', text: 'Patterns of source tokens expanded at compile time' },
          ],
          correct: 'b',
          explain:
            'Macros match against code token trees and expand to generated code at compile time.',
        },
        {
          id: 'macros-q2',
          kind: 'choice',
          prompt: 'Declarative vs procedural macros — what is the real divide?',
          options: [
            { id: 'b', text: 'Declarative macros run faster' },
            {
              id: 'a',
              text: '`macro_rules!` matches token patterns; procedural macros are Rust functions over token streams (derive, attribute, function-like)',
            },
            { id: 'c', text: 'Procedural macros are deprecated' },
          ],
          correct: 'a',
          explain:
            'Same compile-time job, different machinery: pattern-matching versus arbitrary code transforming token streams. Derive macros are the everyday face of the second kind.',
        },
        {
          id: 'macros-q3',
          kind: 'predict',
          prompt:
            'What does this print, and why should it worry you?\n\nmacro_rules! twice {\n    ($x:expr) => { $x + $x };\n}\nfn main() {\n    let mut n = 0;\n    let r = twice!({ n += 1; n });\n    println!("{r} {n}");\n}',
          explain:
            'Macros substitute tokens with zero memoization: the block runs TWICE (yielding `1`, then `2`; `1 + 2 = 3`). An argument with side effects executes once per mention — the reason careful macros bind temporaries. Output:\n3 2',
        },
        {
          id: 'macros-q4',
          kind: 'choice',
          prompt:
            'Why can a `macro_rules!` arm shadow an outer variable without breaking the caller?',
          options: [
            {
              id: 'a',
              text: 'Hygiene: declarative macros get fresh scopes for locals they introduce — caller bindings with the same name are untouched',
            },
            { id: 'b', text: 'Macros cannot introduce variables at all' },
            { id: 'c', text: 'The compiler renames all user variables globally first' },
            { id: 'd', text: 'It cannot — variable capture always corrupts the caller' },
          ],
          correct: 'a',
          explain:
            'TRPL 20.5: `macro_rules!` hygiene keeps macro-introduced bindings separate from call-site bindings. Note the contrast with the previous question: re-running *expressions* (double evaluation) is a different hazard than capturing *names*.',
        },
        {
          id: 'macros-q5',
          kind: 'bug',
          prompt:
            'macro_rules! add {\n    ($a:expr, $b:expr) => { $a + $b };\n}\nfn main() {\n    println!("{}", add!(1));\n}\n\nWhy rejected?',
          explain:
            'No arm matches a single expression — the only matcher demands two comma-separated `:expr` fragments (TRPL 20.5). Macro expansion matches textually against matchers before any code runs. Fix: `add!(1, 2)` — or add a `($a:expr) => { ... }` arm.',
        },
        {
          id: 'macros-q6',
          kind: 'choice',
          prompt: 'Which job belongs to which procedural macro kind?',
          options: [
            { id: 'b', text: 'All three are derive macros' },
            { id: 'c', text: 'Attribute macros cannot take arguments' },
            { id: 'd', text: 'Function-like macros only expand to expressions, never items' },
            {
              id: 'a',
              text: '`#[derive(Serialize)]` → derive macro; `#[route]`-style wrappers → attribute macro; `sql!(...)` constructors → function-like macro',
            },
          ],
          correct: 'a',
          explain:
            'TRPL 20.5: derive macros attach to structs/enums; attribute macros rewrite arbitrary `#[x]` items (arguments like `#[route(GET, path)]` allowed); function-like macros sit in call position. The no-arguments story denies real-world attribute args; the expressions-only story denies `sql!`-generated items.',
        },
      ],
    },
  ],
};
