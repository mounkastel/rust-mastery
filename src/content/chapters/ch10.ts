import type { Chapter } from '../schema';

export const ch10: Chapter = {
  key: '10',
  num: 10,
  title: 'Generic Types, Traits, and Lifetimes',
  integrative: false,
  concepts: [
    {
      id: 'generics',
      title: 'Generic Types',
      fundamental: true,
      prereq: ['structs', 'enums'],
      difficulty: 3,
      estMinutes: 30,
      reading: [
        { num: '10.1', title: 'Generic Data Types', href: 'ch10-01-syntax.html' },
        {
          num: '10.0',
          title: 'Generic Types, Traits, and Lifetimes (chapter overview)',
          href: 'ch10-00-generics.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'generics1', href: '14_generics/generics1.rs' },
        { name: 'generics2', href: '14_generics/generics2.rs' },
      ],
      questions: [
        {
          id: 'generics-q1',
          kind: 'choice',
          prompt: 'What is monomorphization?',
          options: [
            {
              id: 'b',
              text: 'The compiler generating a separate concrete version of generic code for each type used',
            },
            { id: 'a', text: 'Runtime dispatch through a vtable' },
            { id: 'c', text: 'Converting all types to a single universal type' },
          ],
          correct: 'b',
          explain:
            'Rust generates specialized machine code per concrete instantiation at compile time, giving generics zero runtime overhead.',
        },
        {
          id: 'generics-q2',
          kind: 'bug',
          prompt:
            'fn largest<T>(list: &[T]) -> &T {\n    let mut big = &list[0];\n    for item in list {\n        if item > big {\n            big = item;\n        }\n    }\n    big\n}\nfn main() {\n    println!("{}", largest(&vec![1, 2]));\n}\n\nWhat is missing, and why does the compiler insist?',
          explain:
            'E0369: `>` cannot be applied to an unconstrained `T`. Generics promise to work for ANY T, so every operation needs a declared bound: `fn largest<T: PartialOrd>(...)`. Monomorphization happens only after bounds check.',
        },
        {
          id: 'generics-q3',
          kind: 'choice',
          prompt: 'What does `collect::<Vec<_>>()` disambiguate?',
          options: [
            { id: 'b', text: 'How fast the iterator runs' },
            { id: 'c', text: 'Whether errors are propagated' },
            {
              id: 'a',
              text: 'Which container to collect into — otherwise the target type is ambiguous',
            },
          ],
          correct: 'a',
          explain:
            'Turbofish pins down a type the compiler cannot infer. `collect()` can build dozens of containers, so an unconstrained result is a genuine ambiguity error.',
        },
        {
          id: 'generics-q4',
          kind: 'choice',
          prompt:
            'After monomorphization, what does the binary contain for `fn id<T>(x: T) -> T` used with `i32` and `String`?',
          options: [
            { id: 'b', text: 'One generic copy with runtime type tags' },
            {
              id: 'a',
              text: 'Two specialized copies — one per concrete type, each as fast as hand-written code',
            },
            {
              id: 'c',
              text: 'Nothing — generics are erased before codegen, as in Java type erasure',
            },
            { id: 'd', text: 'One copy that boxes both types behind a vtable' },
          ],
          correct: 'a',
          explain:
            "TRPL 10.1: monomorphization stamps out a concrete copy per use — zero-cost at runtime, larger binary as the tradeoff. The erased-before-codegen story describes Java erasure, Rust's explicit anti-model; the boxes-behind-a-vtable story describes `dyn Trait` dispatch instead.",
        },
        {
          id: 'generics-q5',
          kind: 'bug',
          prompt:
            'struct Point<T> { x: T, y: T }\nfn main() {\n    let p = Point { x: 1, y: 2.0 };\n}\n\nWhy rejected?',
          explain:
            'One `T` per struct instance: `x: i32` fixes `T = i32`, so `y: f64` mismatches (E0308). TRPL 10.1: mixed-type points need two parameters — `struct Point<T, U>`. The misconception is that each field gets its own `T`.',
        },
      ],
    },
    {
      id: 'traits',
      title: 'Traits and Bounds',
      fundamental: true,
      prereq: ['generics'],
      difficulty: 3,
      estMinutes: 40,
      reading: [
        { num: '10.2', title: 'Defining Shared Behavior with Traits', href: 'ch10-02-traits.html' },
      ],
      examples: [],
      drills: [
        { name: 'traits1', href: '15_traits/traits1.rs' },
        { name: 'traits2', href: '15_traits/traits2.rs' },
        { name: 'traits3', href: '15_traits/traits3.rs' },
        { name: 'traits4', href: '15_traits/traits4.rs' },
        { name: 'traits5', href: '15_traits/traits5.rs' },
      ],
      questions: [
        {
          id: 'traits-q1',
          kind: 'choice',
          prompt: 'What does `fn notify(item: &impl Summary)` mean?',
          options: [
            { id: 'b', text: 'item must literally be of type Summary' },
            { id: 'a', text: 'item is any type that implements the Summary trait' },
            { id: 'c', text: 'Summary is optional' },
          ],
          correct: 'a',
          explain:
            '`impl Trait` in argument position is sugar for a generic bound — the caller can pass any concrete type implementing Summary.',
        },
        {
          id: 'traits-q2',
          kind: 'bug',
          prompt:
            'use std::fmt::Display;\nstruct A;\nimpl Display for Vec<A> {}\nfn main() {}\n\nWhy is this rejected, and what is the standard workaround?',
          explain:
            'Orphan rule (E0117): neither the trait (`Display`) nor the type (`Vec<_>`) is local, so the impl could collide with someone else’s. Workaround: the newtype pattern — wrap `Vec<A>` in a local struct and implement `Display` on that.',
        },
        {
          id: 'traits-q3',
          kind: 'choice',
          prompt:
            'A trait declares `fn summarize(&self) -> String` WITH a body. What must implementors do?',
          options: [
            { id: 'a', text: 'Nothing — they inherit the default unless they override it' },
            { id: 'b', text: 'They must provide their own version' },
            { id: 'c', text: 'They must repeat the body with a `default` keyword' },
          ],
          correct: 'a',
          explain:
            'A body in the trait declaration IS the default implementation. Override only when the default is wrong for your type.',
        },
        {
          id: 'traits-q4',
          kind: 'choice',
          prompt:
            'What is the practical difference between `fn f(x: impl Display)` and `fn f<T: Display>(x: T)`?',
          options: [
            { id: 'b', text: '`impl Trait` uses dynamic dispatch, generics use static dispatch' },
            { id: 'c', text: 'Generics monomorphize but `impl Trait` does not' },
            { id: 'd', text: '`impl Trait` accepts unsized types, generics cannot' },
            {
              id: 'a',
              text: 'None for a single parameter — `impl Trait` is sugar; differences appear with multiple params (each gets its own anonymous type parameter)',
            },
          ],
          correct: 'a',
          explain:
            'TRPL 10.2: single-param `impl Trait` desugars to exactly the generic form (both monomorphize, both static). The difference: two `impl Trait` params are independent types, while one `T` used twice forces sameness. The dynamic-dispatch and no-monomorphization stories wrongly assign dynamism — that is `dyn Trait`.',
        },
        {
          id: 'traits-q5',
          kind: 'choice',
          prompt:
            'Given `trait Loud: Display { fn loud(&self); }` — what does the `: Display` supertrait bound require?',
          options: [
            { id: 'a', text: 'Every implementor of `Loud` must also implement `Display`' },
            { id: 'b', text: '`Loud` automatically implements `Display` for all its implementors' },
            { id: 'c', text: 'Only `Display` types are allowed to call `loud`' },
            { id: 'd', text: 'Nothing — supertraits are documentation-only' },
          ],
          correct: 'a',
          explain:
            'TRPL 10.2/19.3: supertraits constrain implementors, not callers — `impl Loud for X` fails unless `X: Display` too. The auto-implements story inverts the direction; a trait never implements things on your behalf.',
        },
      ],
    },
    {
      id: 'lifetimes',
      title: 'Lifetime Annotations',
      fundamental: true,
      prereq: ['borrowing', 'traits'],
      difficulty: 4,
      estMinutes: 45,
      reading: [
        {
          num: '10.3',
          title: 'Validating References with Lifetimes',
          href: 'ch10-03-lifetime-syntax.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'lifetimes1', href: '16_lifetimes/lifetimes1.rs' },
        { name: 'lifetimes2', href: '16_lifetimes/lifetimes2.rs' },
        { name: 'lifetimes3', href: '16_lifetimes/lifetimes3.rs' },
      ],
      questions: [
        {
          id: 'lifetimes-q1',
          kind: 'bug',
          prompt:
            '// `longest` returns whichever argument is longer.\nfn longest<\'a>(x: &\'a str, y: &\'a str) -> &\'a str {\n    if x.len() > y.len() { x } else { y }\n}\n\nfn main() {\n    let s1 = String::from("hello");\n    let r;\n    {\n        let s2 = String::from("world");\n        r = longest(&s1, &s2);\n    }\n    println!("{r}");\n}\n\nWhy won’t this compile?',
          explain:
            'A returned reference can live at most as long as the shortest-lived input it was derived from — here s2. But s2 is dropped at the end of the inner block, so using `r` afterwards would dangle. The borrow checker rejects it (E0597): annotations constrain relationships, they never extend lifetimes.',
        },
        {
          id: 'lifetimes-q2',
          kind: 'bug',
          prompt:
            'fn longest(x: &str, y: &str) -> &str {\n    if x.len() > y.len() { x } else { y }\n}\nfn main() {}\n\nWhat is missing?',
          explain:
            "E0106: the return type needs a lifetime — the compiler cannot tell whether the output borrows from `x` or `y`. Fix: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str`. Annotations declare the relationship; they never extend anything.",
        },
        {
          id: 'lifetimes-q3',
          kind: 'choice',
          prompt: "What does `'a` in `fn f<'a>(x: &'a str)` actually guarantee?",
          options: [
            { id: 'b', text: "That the value lives exactly `'a` long" },
            { id: 'c', text: "That the function extends the value’s lifetime to `'a`" },
            {
              id: 'a',
              text: "A constraint linking borrows: the reference is valid wherever `'a` is alive — for both caller and body",
            },
          ],
          correct: 'a',
          explain:
            'Lifetimes constrain, never extend. The annotation says "for some region both caller and callee agree on, this borrow is good there" — the region itself is always determined by real scopes.',
        },
        {
          id: 'lifetimes-q4',
          kind: 'choice',
          prompt: 'Will this compile?\n\nfn first(x: &str, y: &str) -> &str {\n    x\n}',
          options: [
            {
              id: 'a',
              text: 'No — with two input lifetimes and no `&self`, elision cannot assign the output; annotate explicitly',
            },
            { id: 'b', text: "Yes — elision always assigns the output the first input's lifetime" },
            { id: 'c', text: "Yes — outputs without annotations default to `'static`" },
            { id: 'd', text: 'No — `&str` returns are forbidden without an owned `String`' },
          ],
          correct: 'a',
          explain:
            "TRPL 10.3 elision: rule 1 gives `x` and `y` distinct lifetimes; rules 2–3 (single input / `&self` method) do not apply, so the output has no determinate source — E0106. Fix: `fn first<'a>(x: &'a str, y: &'a str) -> &'a str`. The always-first-input-lifetime story states a rule that does not exist.",
        },
        {
          id: 'lifetimes-q5',
          kind: 'choice',
          prompt: "What does the bound `T: 'static` actually require of `T`?",
          options: [
            { id: 'b', text: 'That every value of type `T` lives until program exit' },
            { id: 'c', text: 'That `T` is a string literal' },
            {
              id: 'a',
              text: 'That `T` owns all its data (no borrowed content with shorter lifetimes) — NOT that values live for the whole program',
            },
            { id: 'd', text: 'That `T` implements `Drop` at program shutdown' },
          ],
          correct: 'a',
          explain:
            'TRPL 10.3/16: `\'static` as a bound means "bounded by the end of the program" — owned types (`String`, `i32`) qualify; `&\'short str` does not. It constrains what the type may *borrow*, not how long any value lives.',
        },
        {
          id: 'lifetimes-q6',
          kind: 'bug',
          prompt:
            'struct H {\n    s: &str,\n}\nfn main() {\n    let h = H { s: "hi" };\n}\n\nWhat is missing?',
          explain:
            "Structs holding references need a lifetime parameter: `struct H<'a> { s: &'a str }` (TRPL 10.3). The compiler must record how long the borrow inside `H` stays valid — otherwise `H` could outlive its data. Same fix shape as function signatures, applied at the definition site.",
        },
      ],
    },
  ],
};
