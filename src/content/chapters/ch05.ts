import type { Chapter } from '../schema';

export const ch05: Chapter = {
  key: '5',
  num: 5,
  title: 'Using Structs to Structure Related Data',
  integrative: false,
  concepts: [
    {
      id: 'structs',
      title: 'Defining Structs',
      fundamental: true,
      prereq: ['ownership', 'data-types'],
      difficulty: 2,
      estMinutes: 30,
      reading: [
        {
          num: '5.1',
          title: 'Defining and Instantiating Structs',
          href: 'ch05-01-defining-structs.html',
        },
        {
          num: '5.2',
          title: 'An Example Program Using Structs',
          href: 'ch05-02-example-structs.html',
        },
        { num: '5.0', title: 'Using Structs (chapter overview)', href: 'ch05-00-structs.html' },
      ],
      examples: [],
      drills: [
        { name: 'structs1', href: '07_structs/structs1.rs' },
        { name: 'structs2', href: '07_structs/structs2.rs' },
      ],
      questions: [
        {
          id: 'structs-q1',
          kind: 'choice',
          prompt: 'What kind of struct is `struct Point(i32, i32);`?',
          options: [
            { id: 'a', text: 'Classic (named-field) struct' },
            { id: 'c', text: 'Unit-like struct' },
            { id: 'b', text: 'Tuple struct' },
          ],
          correct: 'b',
          explain:
            'Fields are accessed positionally (`p.0`, `p.1`) rather than by name — this is a tuple struct.',
        },
        {
          id: 'structs-q2',
          kind: 'bug',
          prompt:
            'struct User { name: String, age: u32 }\nfn main() {\n    let u1 = User { name: String::from("a"), age: 1 };\n    let _u2 = User { age: 2, ..u1 };\n    println!("{}", u1.name);\n}\n\nWhat fails here, and why?',
          explain:
            'Partial move (E0382): struct-update syntax `..u1` moves the remaining fields, so `u1.name` (a String, not Copy) now belongs to `_u2` and reading `u1.name` afterwards borrows a moved value.',
        },
        {
          id: 'structs-q3',
          kind: 'choice',
          prompt:
            'When can you write `User { name, age }` instead of `User { name: name, age: age }`?',
          options: [
            { id: 'b', text: 'Always — the compiler figures it out' },
            { id: 'a', text: 'When local variables have exactly the same names as the fields' },
            { id: 'c', text: 'Only for fields marked `pub`' },
          ],
          correct: 'a',
          explain:
            'Field init shorthand requires a variable in scope with the identical name. It is purely syntactic sugar, not inference.',
        },
        {
          id: 'structs-q4',
          kind: 'choice',
          prompt:
            'Why is this rejected?\n\nstruct User { name: String }\nfn main() {\n    let u = User { name: String::from("a") };\n    println!("{u}");\n}',
          options: [
            { id: 'b', text: 'Structs can never be printed, even for debugging' },
            { id: 'c', text: 'The field `name` is private to `main`' },
            {
              id: 'a',
              text: '`User` implements neither `Display` nor `Debug` — `{}` needs `Display`; derive `Debug` and print with `{u:?}`',
            },
            { id: 'd', text: 'A semicolon is missing after the `struct` definition' },
          ],
          correct: 'a',
          explain:
            '`{}` requires `Display`, which the compiler never auto-implements. TRPL 5.2 reaches for `#[derive(Debug)]` plus `{:?}` instead. The privacy story is a red herring — fields are visible in the defining module — and struct definitions take no trailing semicolon.',
        },
      ],
    },
    {
      id: 'methods',
      title: 'Struct Methods',
      fundamental: false,
      prereq: ['structs'],
      difficulty: 2,
      estMinutes: 25,
      reading: [{ num: '5.3', title: 'Methods', href: 'ch05-03-method-syntax.html' }],
      examples: [],
      drills: [{ name: 'structs3', href: '07_structs/structs3.rs' }],
      questions: [
        {
          id: 'methods-q1',
          kind: 'choice',
          prompt:
            'Which signature lets a method read fields without consuming or mutating the struct?',
          options: [
            { id: 'a', text: 'fn area(self) -> u32' },
            { id: 'c', text: 'fn area(&mut self) -> u32' },
            { id: 'b', text: 'fn area(&self) -> u32' },
          ],
          correct: 'b',
          explain:
            '`&self` borrows the instance immutably — the common case for read-only methods.',
        },
        {
          id: 'methods-q2',
          kind: 'bug',
          prompt:
            'struct R { w: u32 }\nimpl R {\n    fn w(self) -> u32 { self.w }\n}\nfn main() {\n    let r = R { w: 3 };\n    let a = r.w();\n    println!("{} {}", a, r.w);\n}\n\nWhy is the second `r.w` rejected?',
          explain:
            'E0382: `w(self)` takes ownership, so the first call moves `r` and the second use is of a moved value. Contrast with `&self` methods, which only borrow. Fix: `fn w(&self)`.',
        },
        {
          id: 'methods-q3',
          kind: 'choice',
          prompt: 'What is `Self` (capital S) inside an `impl` block?',
          options: [
            { id: 'b', text: 'The current instance, like `self`' },
            { id: 'a', text: 'An alias for the type being implemented' },
            { id: 'c', text: 'The parent module' },
          ],
          correct: 'a',
          explain:
            '`Self` refers to the implementing type itself — handy in constructors like `fn new() -> Self`. Lowercase `self` is the receiver.',
        },
        {
          id: 'methods-q4',
          kind: 'bug',
          prompt:
            "struct R { w: u32 }\nimpl R {\n    fn new(w: u32) -> R { R { w } }\n}\nfn main() {\n    let r = R.new(3);\n}\n\nWhy won't this compile?",
          explain:
            '`new` is an associated function, not a method — it takes no `self` receiver, so it lives on the type itself: `R::new(3)`. Dot syntax is reserved for methods (TRPL 5.3). The `::` vs `.` distinction is exactly receiver vs no-receiver.',
        },
      ],
    },
  ],
};
