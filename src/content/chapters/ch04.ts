import type { Chapter } from '../schema';

export const ch04: Chapter = {
  key: '4',
  num: 4,
  title: 'Understanding Ownership',
  integrative: false,
  concepts: [
    {
      id: 'ownership',
      title: 'Ownership and Moves',
      fundamental: true,
      prereq: ['control-flow'],
      difficulty: 3,
      estMinutes: 40,
      reading: [
        { num: '4.1', title: 'What is Ownership?', href: 'ch04-01-what-is-ownership.html' },
        {
          num: '4.0',
          title: 'Understanding Ownership (chapter overview)',
          href: 'ch04-00-understanding-ownership.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'move_semantics1', href: '06_move_semantics/move_semantics1.rs' },
        { name: 'move_semantics2', href: '06_move_semantics/move_semantics2.rs' },
        { name: 'move_semantics3', href: '06_move_semantics/move_semantics3.rs' },
        { name: 'move_semantics4', href: '06_move_semantics/move_semantics4.rs' },
      ],
      questions: [
        {
          id: 'ownership-q1',
          kind: 'bug',
          prompt:
            'let s1 = String::from("hi");\nlet s2 = s1;\nprintln!("{s1}");\n\nWhat error appears, and why does it NOT happen with `let x = 5; let y = x; println!("{x}");`?',
          explain:
            'String is not Copy, so `let s2 = s1` moves ownership — s1 is no longer valid. `i32` is Copy, so `let y = x` duplicates the value on the stack and both remain valid.',
        },
        {
          id: 'ownership-q2',
          kind: 'bug',
          prompt:
            'fn main() {\n    let s = String::from("hi");\n    takes(s);\n    println!("{s}");\n}\nfn takes(_s: String) {}\n\nWhat error does this produce, and what is the idiomatic fix?',
          explain:
            'E0382: borrow of moved value: `s` — passing `s` by value moves ownership into `takes`. Fix: borrow instead: `takes(&s)` with `fn takes(_s: &str)`.',
        },
        {
          id: 'ownership-q3',
          kind: 'choice',
          prompt: 'Which of these types are `Copy`?',
          options: [
            { id: 'b', text: '`String`, `Vec<T>`' },
            { id: 'c', text: 'Every type stored on the stack' },
            { id: 'a', text: '`i32`, `bool`, `char`' },
          ],
          correct: 'a',
          explain:
            'Only certain small types implement Copy. Heap-owning types never do — and not every stack type qualifies either (`[String; 2]` is not Copy).',
        },
        {
          id: 'ownership-q4',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let s = String::from("a");\n    {\n        let s = String::from("b");\n        println!("{s}");\n    }\n    println!("{s}");\n}',
          explain:
            'The inner `let s` shadows the outer one: `"b"` prints, then the inner `String` drops at the block end. The untouched outer `"a"` prints — shadowing never moves or drops the shadowed value early. Output:\nb\na',
        },
        {
          id: 'ownership-q5',
          kind: 'bug',
          prompt:
            'struct P { x: String, y: i32 }\nfn main() {\n    let p = P { x: String::from("a"), y: 1 };\n    let s = p.x;\n    println!("{}", p.y);\n    println!("{}", p.x);\n}\n\nWhich line fails, and why do the others pass?',
          explain:
            'The final line fails (E0382, partial move): `p.x` was moved into `s`. The `p.y` line still passes because `i32` is `Copy` — moving one field never disturbs the others. Fix: borrow instead (`let s = &p.x;`) or clone the field.',
        },
      ],
    },
    {
      id: 'borrowing',
      title: 'Borrowing Rules',
      fundamental: true,
      prereq: ['ownership'],
      difficulty: 3,
      estMinutes: 35,
      reading: [
        {
          num: '4.2',
          title: 'References and Borrowing',
          href: 'ch04-02-references-and-borrowing.html',
        },
      ],
      examples: [],
      drills: [{ name: 'move_semantics5', href: '06_move_semantics/move_semantics5.rs' }],
      questions: [
        {
          id: 'borrowing-q1',
          kind: 'choice',
          prompt: 'Which combination of borrows is allowed at the same time on the same value?',
          options: [
            { id: 'a', text: 'Two mutable references' },
            { id: 'c', text: 'Any number of immutable references' },
            { id: 'b', text: 'One mutable and one immutable reference' },
          ],
          correct: 'c',
          explain:
            'Rust allows either any number of immutable (&T) borrows, or exactly one mutable (&mut T) borrow — never both kinds simultaneously.',
        },
        {
          id: 'borrowing-q2',
          kind: 'bug',
          prompt:
            'fn main() {\n    let mut s = String::from("hi");\n    let r1 = &s;\n    let r2 = &mut s;\n    println!("{r1}");\n}\n\nWhy is this rejected?',
          explain:
            'E0502: cannot borrow `s` as mutable while the immutable borrow `r1` is still live — its last use is the final println!, so the two borrows overlap. Either kind, never both at once.',
        },
        {
          id: 'borrowing-q3',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let mut s = String::from("hi");\n    {\n        let r = &mut s;\n        r.push(\'!\');\n    }\n    println!("{s}");\n}',
          explain:
            'The mutable borrow ends when `r` goes out of scope, so the later borrow for `println!` is legal. Output:\nhi!',
        },
        {
          id: 'borrowing-q4',
          kind: 'choice',
          prompt:
            'Why does this compile under non-lexical lifetimes (but would NOT under the old lexical rule)?\n\nfn main() {\n    let mut s = String::from("hi");\n    let r = &s;\n    println!("{r}");\n    s.push(\'!\');\n    println!("{s}");\n}',
          options: [
            {
              id: 'a',
              text: 'The shared borrow of `r` ends at its last use, so the later `&mut` borrow never overlaps it',
            },
            { id: 'b', text: '`String` contents are `Copy`, so `r` was never really a borrow' },
            { id: 'c', text: '`push` takes `&self`, so no mutable borrow happens at all' },
            {
              id: 'd',
              text: 'It does not compile — `r` holds the borrow for the whole remaining scope',
            },
          ],
          correct: 'a',
          explain:
            'NLL (TRPL 4.2) ends a borrow\'s region at its last use — the `println!("{r}")` line. The `&mut` for `push` starts after, so the two borrows never coexist. The never-compiles story states the pre-2018 lexical rule, which is exactly what NLL replaced.',
        },
        {
          id: 'borrowing-q5',
          kind: 'bug',
          prompt:
            'fn main() {\n    let r;\n    {\n        let s = String::from("hi");\n        r = &s;\n    }\n    println!("{r}");\n}\n\nWhich borrow rule is violated?',
          explain:
            'Dangling reference: `s` is dropped at the end of the inner block while `r` still points at it. TRPL 4.2 guarantees references are always valid — the compiler rejects this (`s` does not live long enough). Fix: print inside the block, or move ownership of `s` outward.',
        },
      ],
    },
    {
      id: 'slices',
      title: 'Slice Types',
      fundamental: true,
      prereq: ['borrowing'],
      difficulty: 3,
      estMinutes: 30,
      reading: [{ num: '4.3', title: 'The Slice Type', href: 'ch04-03-slices.html' }],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'slices-q1',
          kind: 'predict',
          prompt: 'let a = [1, 2, 3, 4, 5];\nlet s = &a[1..3];\nprintln!("{:?}", s);',
          explain: 'Range `1..3` is half-open: indices `1` and `2`, excluding `3`. Output:\n[2, 3]',
        },
        {
          id: 'slices-q2',
          kind: 'bug',
          prompt: 'let a = [1, 2, 3];\nlet s: &[i32] = a;\n\nWhat is wrong, and what is the fix?',
          explain:
            'Type mismatch (E0308): `a` is an array `[i32; 3]`, not a slice reference. Fix: `let s: &[i32] = &a;` — arrays coerce to slices behind a reference.',
        },
        {
          id: 'slices-q3',
          kind: 'choice',
          prompt: 'Book functions take `&str` rather than `&String`. Why?',
          options: [
            { id: 'a', text: 'It accepts owned Strings, slices, and literals via deref coercion' },
            { id: 'b', text: 'It avoids heap allocation' },
            { id: 'c', text: 'The borrow checker requires it' },
          ],
          correct: 'a',
          explain:
            '`&String` derefs to `&str`, so a `&str` parameter accepts strictly more inputs. `&String` in a signature is needlessly narrow.',
        },
        {
          id: 'slices-q4',
          kind: 'bug',
          prompt:
            'fn main() {\n    let s = String::from("héllo");\n    let h = &s[0..2];\n    println!("{h}");\n}\n\nWill this compile and run? If not, why?',
          explain:
            'It compiles but panics at runtime: `é` occupies two bytes in UTF-8, so byte index 2 splits a character boundary. TRPL 4.3/8.2: string slicing is byte-based and must land on `char` boundaries. Fix: `&s[0..3]` yields `"hé"`.',
        },
        {
          id: 'slices-q5',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn first(s: &str) -> &str {\n    &s[0..1]\n}\nfn main() {\n    println!("{}", first("abc"));\n}',
          explain:
            'Byte range `0..1` covers one ASCII char, so `"a"` prints. The signature needs zero lifetime annotations thanks to elision: the output borrow is tied to the input borrow. Output:\na',
        },
      ],
    },
  ],
};
