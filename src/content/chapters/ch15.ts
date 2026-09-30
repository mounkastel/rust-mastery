import type { Chapter } from '../schema';

export const ch15: Chapter = {
  key: '15',
  num: 15,
  title: 'Smart Pointers',
  integrative: false,
  concepts: [
    {
      id: 'box',
      title: 'Heap with Box',
      fundamental: true,
      prereq: ['ownership'],
      difficulty: 3,
      estMinutes: 25,
      reading: [
        {
          num: '15.1',
          title: 'Using Box<T> to Point to Data on the Heap',
          href: 'ch15-01-box.html',
        },
        {
          num: '15.0',
          title: 'Smart Pointers (chapter overview)',
          href: 'ch15-00-smart-pointers.html',
        },
      ],
      examples: [],
      drills: [{ name: 'box1', href: '19_smart_pointers/box1.rs' }],
      questions: [
        {
          id: 'box-q1',
          kind: 'recite',
          prompt:
            'Why does a directly self-referential enum like `enum List { Cons(i32, List), Nil }` fail to compile without Box?',
          explain:
            'Rust needs to compute type size at compile time. A directly recursive type would have infinite size. Box<List> is a fixed-size pointer on the stack pointing to heap memory.',
        },
        {
          id: 'box-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nenum List {\n    Cons(i32, Box<List>),\n    Nil,\n}\nfn main() {\n    let l = List::Cons(1, Box::new(List::Nil));\n    if let List::Cons(x, _) = l {\n        println!("{x}");\n    }\n}',
          explain:
            "Pattern matching sees through the `Box`: `x` binds the head `1`. The `Box` only fixed the type's size — nothing about usage changes. Output:\n1",
        },
        {
          id: 'box-q3',
          kind: 'choice',
          prompt: 'Why is `Box<T>` itself always `Sized`, even when `T` is not?',
          options: [
            { id: 'b', text: 'Box forces `T: Sized`' },
            { id: 'c', text: 'The compiler special-cases every Box type' },
            {
              id: 'a',
              text: 'It is a pointer with a known size (`usize`), regardless of the pointee',
            },
          ],
          correct: 'a',
          explain:
            'Indirection is the whole trick: the stack holds a fixed-size address while the arbitrarily-sized data lives on the heap.',
        },
        {
          id: 'box-q4',
          kind: 'choice',
          prompt: 'For `let b = Box::new(5);` — where do the pointer and the integer live?',
          options: [
            { id: 'b', text: 'Both on the heap' },
            { id: 'a', text: 'Pointer on the stack, integer on the heap' },
            { id: 'c', text: 'Both on the stack — `Box` is zero-cost metadata only' },
            { id: 'd', text: 'Pointer on the heap, integer on the stack' },
          ],
          correct: 'a',
          explain:
            'The `Box` itself is a plain pointer (`Sized`) sitting wherever the variable lives — usually the stack — pointing at heap memory holding the `5` (TRPL 15.1). The heap-pointer story inverts the picture; the both-on-the-stack story would make `Box` pointless.',
        },
        {
          id: 'box-q5',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let b = Box::new(5);\n    println!("{}", *b + 1);\n}',
          explain:
            '`*b` follows the pointer via `Deref` to the heap `5`; `+ 1` makes `6`. The `*` here dereferences a smart pointer — no `unsafe` involved. Output:\n6',
        },
      ],
    },
    {
      id: 'deref-drop',
      title: 'Deref and Drop',
      fundamental: false,
      prereq: ['box', 'traits'],
      difficulty: 3,
      estMinutes: 25,
      reading: [
        {
          num: '15.2',
          title: 'Treating Smart Pointers Like Regular References',
          href: 'ch15-02-deref.html',
        },
        {
          num: '15.3',
          title: 'Running Code on Cleanup with the Drop Trait',
          href: 'ch15-03-drop.html',
        },
      ],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'deref-drop-q1',
          kind: 'choice',
          prompt: 'What triggers a value’s Drop::drop to run?',
          options: [
            { id: 'a', text: 'Calling value.drop() directly' },
            { id: 'b', text: 'The value going out of scope' },
            { id: 'c', text: 'The garbage collector running' },
          ],
          correct: 'b',
          explain:
            'Rust runs Drop deterministically when a value exits scope. Directly calling .drop() is disallowed by the compiler.',
        },
        {
          id: 'deref-drop-q2',
          kind: 'bug',
          prompt:
            'fn main() {\n    let s = String::from("hi");\n    s.drop();\n    println!("{s}");\n}\n\nWhy is the `s.drop()` line rejected?',
          explain:
            'E0599: there IS no `.drop()` method — destruction is not something you call. Either let the value go out of scope, or force it early with `std::mem::drop(s)`.',
        },
        {
          id: 'deref-drop-q3',
          kind: 'choice',
          prompt: '`&String` passed where `&str` is expected just works. Why?',
          options: [
            { id: 'b', text: '`String` and `&str` are the same type' },
            { id: 'c', text: 'The compiler inserts a clone' },
            {
              id: 'a',
              text: 'Deref coercion: `String: Deref<Target = str>`, applied automatically at coercion sites',
            },
          ],
          correct: 'a',
          explain:
            'Deref coercion is free — no clone, no cost. It rewrites `&String` → `&str`. It rewrites `&Vec<T>` → `&[T]`, wherever the target reference type is expected.',
        },
        {
          id: 'deref-drop-q4',
          kind: 'predict',
          prompt:
            'What does this print?\n\nstruct S(&\'static str);\nimpl Drop for S {\n    fn drop(&mut self) { println!("drop {}", self.0); }\n}\nfn main() {\n    let a = S("a");\n    let _b = S("b");\n}',
          explain:
            'Locals drop in reverse declaration order: `_b` then `a`. TRPL 15.3: deterministic destruction is what makes RAII (`MutexGuard`, files, locks) sound. The underscore prefix changes nothing about dropping. Output:\ndrop b\ndrop a',
        },
        {
          id: 'deref-drop-q5',
          kind: 'choice',
          prompt:
            'Why does the standard library hide `Drop::drop` behind `std::mem::drop` instead of letting you call `x.drop()`?',
          options: [
            {
              id: 'a',
              text: 'Explicit `x.drop()` would double-drop: the compiler still drops `x` at scope end, but `mem::drop(x)` moves ownership so no scope-end drop remains',
            },
            { id: 'b', text: '`Drop::drop` is slower than `mem::drop`' },
            { id: 'c', text: '`mem::drop` prevents all destructors from running' },
            { id: 'd', text: 'There is no difference — `x.drop()` compiles fine' },
          ],
          correct: 'a',
          explain:
            'TRPL 15.3: `Drop::drop(&mut self)` only borrows — calling it would run cleanup early AND again at scope end (double free). `mem::drop(x)` takes ownership, moving the value so no scope-end drop remains. That is why the method is disallowed and the free function exists.',
        },
      ],
    },
    {
      id: 'rc',
      title: 'Shared Ownership',
      fundamental: true,
      prereq: ['box'],
      difficulty: 3,
      estMinutes: 25,
      reading: [
        {
          num: '15.4',
          title: 'Rc<T>, the Reference Counted Smart Pointer',
          href: 'ch15-04-rc.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'rc1', href: '19_smart_pointers/rc1.rs' },
        { name: 'arc1', href: '19_smart_pointers/arc1.rs' },
        { name: 'cow1', href: '19_smart_pointers/cow1.rs' },
      ],
      questions: [
        {
          id: 'rc-q1',
          kind: 'choice',
          prompt: 'What does `Rc::clone(&a)` actually copy?',
          options: [
            {
              id: 'b',
              text: 'Nothing — it just increments the reference count and returns a new pointer handle',
            },
            { id: 'a', text: 'The underlying heap data' },
            { id: 'c', text: 'The heap data, but lazily on first write (copy-on-write)' },
          ],
          correct: 'b',
          explain:
            'Rc::clone is an inexpensive pointer duplicate with a reference count increment; data on the heap is not cloned.',
        },
        {
          id: 'rc-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nuse std::rc::Rc;\nfn main() {\n    let a = Rc::new(5);\n    let _b = Rc::clone(&a);\n    println!("{}", Rc::strong_count(&a));\n}',
          explain:
            'Each `Rc::clone` bumps the strong count: `a` plus `_b` makes 2. Cloning the pointer never touches the heap data.',
        },
        {
          id: 'rc-q3',
          kind: 'choice',
          prompt: 'Why can’t you get `&mut` to `Rc`-shared data directly?',
          options: [
            { id: 'b', text: 'Rc data lives in hardware read-only memory' },
            {
              id: 'a',
              text: 'Mutation through one owner would silently invalidate what other owners see — use `RefCell`/`Mutex` for checked sharing',
            },
            { id: 'c', text: 'You always can — `Rc::get_mut` never fails' },
          ],
          correct: 'a',
          explain:
            'Shared ownership plus direct mutation equals aliasing violations. `Rc::get_mut` exists but succeeds only when uniquely owned — the exception proving the rule.',
        },
        {
          id: 'rc-q4',
          kind: 'choice',
          prompt:
            '`Cow::from(&vec)` borrows; `abs_all` finds nothing to mutate. What is `input` afterwards?',
          options: [
            { id: 'b', text: '`Cow::Borrowed` — no mutation means no clone ever happens' },
            { id: 'a', text: '`Cow::Owned` — wrapping always clones eagerly' },
            { id: 'c', text: 'Neither — `Cow` drops back to a plain reference' },
          ],
          correct: 'b',
          explain:
            'Clone-on-Write clones lazily: `to_mut()` is the only trigger. With all values already absolute, `abs_all` never calls it, so the `Cow` stays borrowed — exactly what `reference_no_mutation` in `cow1` asserts.',
        },
        {
          id: 'rc-q5',
          kind: 'choice',
          prompt: 'What problem does `Rc::downgrade` (the `Weak<T>` pointer) solve?',
          options: [
            { id: 'b', text: 'It makes `Rc` safe to share across threads' },
            { id: 'c', text: 'It lets you mutate through `Rc` without `RefCell`' },
            { id: 'd', text: 'It speeds up `strong_count` queries' },
            {
              id: 'a',
              text: 'Reference cycles that leak — `Weak` does not count toward ownership, so cyclic structures can still deallocate',
            },
          ],
          correct: 'a',
          explain:
            'TRPL 15.6: strong-count cycles (parent↔child `Rc`s) never reach zero and leak. `Weak` breaks the cycle by observing without owning (`upgrade()` to access). The cross-threads story describes `Arc`; the mutate-through-`Rc` story describes interior mutability.',
        },
      ],
    },
    {
      id: 'refcell',
      title: 'Interior Mutability',
      fundamental: false,
      prereq: ['rc'],
      difficulty: 4,
      estMinutes: 35,
      reading: [
        {
          num: '15.5',
          title: 'RefCell<T> and the Interior Mutability Pattern',
          href: 'ch15-05-interior-mutability.html',
        },
        {
          num: '15.6',
          title: 'Reference Cycles Can Leak Memory',
          href: 'ch15-06-reference-cycles.html',
        },
      ],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'refcell-q1',
          kind: 'recite',
          prompt:
            'What happens if you call `.borrow_mut()` twice simultaneously on the same RefCell<T>?',
          explain:
            'RefCell enforces the aliasing rule at runtime — a second overlapping mutable borrow panics rather than failing compile-time checks.',
        },
        {
          id: 'refcell-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nuse std::cell::RefCell;\nfn main() {\n    let x = RefCell::new(5);\n    *x.borrow_mut() += 1;\n    println!("{}", x.borrow());\n}',
          explain:
            'Single-threaded runtime checks pass here: the mutable borrow ends before `borrow()` runs. Overlap them and it panics instead. Output:\n6',
        },
        {
          id: 'refcell-q3',
          kind: 'choice',
          prompt: '`RefCell<T>` vs `Mutex<T>` — when is `RefCell` the right choice?',
          options: [
            { id: 'b', text: 'Sharing data across threads' },
            { id: 'c', text: 'Always — `Mutex` is legacy' },
            {
              id: 'a',
              text: 'Single-threaded interior mutability with zero synchronization overhead',
            },
          ],
          correct: 'a',
          explain:
            '`RefCell` is explicitly `!Sync`: the same runtime-checked pattern, but without any lock. Across threads you need `Mutex` (or atomics).',
        },
        {
          id: 'refcell-q4',
          kind: 'choice',
          prompt:
            'Compile error or runtime panic — and where?\n\nfn main() {\n    use std::cell::RefCell;\n    let x = RefCell::new(5);\n    let a = x.borrow();\n    let b = x.borrow_mut();\n    println!("{} {}", a, b);\n}',
          options: [
            {
              id: 'b',
              text: 'Compile error at `borrow_mut` — the borrow checker sees the conflict',
            },
            {
              id: 'a',
              text: 'Compiles, then panics at `borrow_mut` — `RefCell` enforces borrowing rules at runtime while `a` is still live',
            },
            {
              id: 'c',
              text: 'Compiles and runs — `RefCell` allows one shared plus one mutable borrow together',
            },
            { id: 'd', text: 'Panics at `borrow`, the very first call' },
          ],
          correct: 'a',
          explain:
            'TRPL 15.5: the whole point of `RefCell` is moving borrow checking to runtime — the compiler accepts what it would reject for plain references, and `borrow_mut` panics (`already borrowed`) while `a` lives. The compile-error story is the key misconception: with `RefCell`, the compiler deliberately looks away.',
        },
        {
          id: 'refcell-q5',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    use std::cell::RefCell;\n    let x = RefCell::new(5);\n    {\n        let mut a = x.borrow_mut();\n        *a += 1;\n    }\n    println!("{}", x.borrow());\n}',
          explain:
            'The `RefMut` guard releases at the block end, so the later `borrow()` is legal. Same scoping discipline as lexical borrows — except violations panic at runtime instead of failing compilation. Output:\n6',
        },
        {
          id: 'refcell-q6',
          kind: 'bug',
          prompt:
            'fn main() {\n    use std::cell::RefCell;\n    let x = RefCell::new(vec![1]);\n    x.borrow_mut().push(x.borrow().len());\n}\n\nWhy does this panic at runtime?',
          explain:
            'The `borrow_mut()` guard lives for the whole statement while `x.borrow()` requests a shared borrow inside it — already-mutably-borrowed panic. TRPL 15.5: guards release at statement/block end, not mid-expression. Fix: `let n = x.borrow().len(); x.borrow_mut().push(n);`.',
        },
      ],
    },
  ],
};
