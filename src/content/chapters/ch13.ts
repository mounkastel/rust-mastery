import type { Chapter } from '../schema';

export const ch13: Chapter = {
  key: '13',
  num: 13,
  title: 'Functional Language Features: Iterators and Closures',
  integrative: false,
  concepts: [
    {
      id: 'closures',
      title: 'Closures and Capture',
      fundamental: true,
      prereq: ['functions', 'ownership'],
      difficulty: 3,
      estMinutes: 30,
      reading: [
        { num: '13.1', title: 'Closures', href: 'ch13-01-closures.html' },
        {
          num: '13.0',
          title: 'Functional Language Features (chapter overview)',
          href: 'ch13-00-functional-features.html',
        },
      ],
      examples: [],
      drills: [],
      practice: [
        {
          id: 'sort-by-key',
          text: 'Sort vec![3, 1, 2] with sort_by_key and a closure, then rewrite the key as a named fn — note what changes at the call site.',
        },
        {
          id: 'move-to-thread',
          text: 'Capture s: String by reference in a closure, pass it to thread::spawn, read the compiler error, then fix it with move.',
        },
        {
          id: 'fnonce-once',
          text: 'Write fn apply<F: FnOnce() -> i32>(f: F) -> i32, call it with a closure that moves a String in, then try calling that closure twice.',
        },
      ],
      questions: [
        {
          id: 'closures-q1',
          kind: 'predict',
          prompt: 'let x = 4;\nlet equal_to_x = |z| z == x;\nprintln!("{}", equal_to_x(4));',
          explain:
            'The closure borrows `x` from its environment immutably. `equal_to_x(4)` compares `4 == 4` → `true`.',
        },
        {
          id: 'closures-q2',
          kind: 'bug',
          prompt:
            'fn main() {\n    let s = String::from("hi");\n    let f = || {\n        println!("{s}");\n        drop(s);\n    };\n    f();\n    f();\n}\n\nWhy does the second call fail?',
          explain:
            'E0382: `drop(s)` forces the closure to capture `s` by move, so the closure is `FnOnce` — the first call consumes `f` itself, and the second call uses a moved value.',
        },
        {
          id: 'closures-q3',
          kind: 'choice',
          prompt:
            'A closure moves a String out of its environment (e.g. returns it). Which bound must a generic consumer require at minimum?',
          options: [
            { id: 'b', text: '`Fn`' },
            { id: 'c', text: '`FnMut`' },
            { id: 'a', text: '`FnOnce`' },
          ],
          correct: 'a',
          explain:
            '`FnOnce` = callable at least once (may move captures out). `FnMut`/`Fn` promise repeatable calls, which a moving closure cannot honor.',
        },
        {
          id: 'closures-q4',
          kind: 'choice',
          prompt:
            'Which statement about these closures is true?\n\nlet a = || println!("hi");\nlet mut v = vec![1];\nlet b = || v.push(2);\nlet s = String::from("x");\nlet c = || drop(s);',
          options: [
            { id: 'b', text: 'All three are `Fn` — captures never affect the trait' },
            {
              id: 'a',
              text: '`a: Fn`, `b: FnMut`, `c: FnOnce` — the compiler picks the least capable trait each body allows',
            },
            { id: 'c', text: '`c` is `FnMut` because `drop` mutates `s`' },
            { id: 'd', text: 'None implements any `Fn` trait without an explicit annotation' },
          ],
          correct: 'a',
          explain:
            'A closure captures only what its body needs, as cheaply as possible. TRPL 13.1 capture ladder: a shared-borrow body → `Fn`; an `&mut` body → `FnMut`; by-value move-out (`drop(s)`) → `FnOnce`. The `drop`-mutates story misreads moving as mutating — `drop` consumes, it does not borrow mutably.',
        },
        {
          id: 'closures-q5',
          kind: 'choice',
          prompt:
            'Why must a function returning a closure use `impl Fn` (or a trait object) rather than naming the type?',
          options: [
            {
              id: 'a',
              text: 'Every closure has a unique anonymous compiler-generated type — there is no nameable type to write',
            },
            { id: 'b', text: 'Closures are dynamically sized and cannot be returned at all' },
            { id: 'c', text: '`impl Fn` makes the closure run faster' },
            { id: 'd', text: 'It need not — `fn() -> |i32| -> i32` is valid syntax' },
          ],
          correct: 'a',
          explain:
            'TRPL 13.1: closure types are unnameable anonymous structs, so `impl Trait` in return position (or `Box<dyn Fn()>`) is the only way to name "some closure". The bar-syntax story invents syntax; the cannot-return-at-all story is false — indirection solves sizing.',
        },
      ],
    },
    {
      id: 'iterators',
      title: 'Iterators and Adapters',
      fundamental: true,
      prereq: ['closures', 'generics', 'vectors'],
      difficulty: 3,
      estMinutes: 40,
      reading: [
        {
          num: '13.2',
          title: 'Processing a Series of Items with Iterators',
          href: 'ch13-02-iterators.html',
        },
        {
          num: '13.3',
          title: 'Improving Our I/O Project',
          href: 'ch13-03-improving-our-io-project.html',
        },
        {
          num: '13.4',
          title: 'Performance in Loops vs. Iterators',
          href: 'ch13-04-performance.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'iterators1', href: '18_iterators/iterators1.rs' },
        { name: 'iterators2', href: '18_iterators/iterators2.rs' },
        { name: 'iterators3', href: '18_iterators/iterators3.rs' },
        { name: 'iterators4', href: '18_iterators/iterators4.rs' },
        { name: 'iterators5', href: '18_iterators/iterators5.rs' },
        { name: 'quiz3', href: 'quizzes/quiz3.rs' },
      ],
      questions: [
        {
          id: 'iterators-q1',
          kind: 'choice',
          prompt:
            'let v = vec![1, 2, 3];\nlet doubled = v.iter().map(|x| x * 2);\n\nHas any multiplication happened yet at this line?',
          options: [
            { id: 'b', text: 'No — map is lazy; nothing runs until doubled is consumed' },
            { id: 'a', text: 'Yes, doubled is now [2, 4, 6]' },
            { id: 'c', text: 'Yes, but only for the first element' },
          ],
          correct: 'b',
          explain:
            'Iterator adaptors build up a lazy pipeline; closures only run when something actively consumes the iterator.',
        },
        {
          id: 'iterators-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let v = vec![1, 2, 3];\n    let total: i32 = v.iter().map(|x| x * 2).sum();\n    println!("{total}");\n}',
          explain:
            '`sum()` is the consuming adaptor that finally drives the lazy pipeline: (1+2+3)*2 = 12. Without it, nothing would execute at all.',
        },
        {
          id: 'iterators-q3',
          kind: 'choice',
          prompt: 'Why does `let it = v.iter();` borrow `v` for as long as `it` is alive?',
          options: [
            { id: 'b', text: 'Iterators copy the whole collection' },
            {
              id: 'a',
              text: 'The iterator holds a reference into the collection to yield items from it',
            },
            { id: 'c', text: 'It is a compiler workaround with no meaning' },
          ],
          correct: 'a',
          explain:
            'An iterator over `&T` borrows its source — that is why mutating or dropping the collection while iterating is rejected. Ownership and laziness compose.',
        },
        {
          id: 'iterators-q4',
          kind: 'choice',
          prompt: 'After `let v = vec![1, 2]; let it = v.into_iter();` — what is `v`?',
          options: [
            { id: 'b', text: 'Borrowed until `it` is dropped' },
            { id: 'c', text: 'Unaffected — `into_iter` only borrows' },
            { id: 'd', text: 'Cloned internally, so `v` stays usable' },
            {
              id: 'a',
              text: 'Moved-from — `into_iter` consumes the vector; using `v` after is E0382',
            },
          ],
          correct: 'a',
          explain:
            '`into_iter(self)` takes ownership (TRPL 13.2) — the vector is consumed so iteration can hand out owned values. Borrowing iteration is `iter()`/`iter_mut()`. The only-borrows story describes `iter()`; the cloned-internally story invents a clone.',
        },
        {
          id: 'iterators-q5',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let v = vec![1, 2, 3, 4];\n    let r: Vec<i32> = v.iter().filter(|x| *x % 2 == 0).map(|x| x * 10).collect();\n    println!("{:?}", r);\n}',
          explain:
            'Adapters stay lazy until `collect`: evens `[2, 4]` map to `[20, 40]`. Note the explicit derefs — `iter()` yields `&i32`, so each closure parameter is `&i32`. Output:\n[20, 40]',
        },
      ],
    },
  ],
};
