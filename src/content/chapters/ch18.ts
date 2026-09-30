import type { Chapter } from '../schema';

export const ch18: Chapter = {
  key: '18',
  num: 18,
  title: 'Object Oriented Programming Features',
  integrative: false,
  concepts: [
    {
      id: 'oo-characteristics',
      title: 'Encapsulation in Rust',
      fundamental: false,
      prereq: ['traits'],
      difficulty: 2,
      estMinutes: 15,
      reading: [
        {
          num: '18.1',
          title: 'Characteristics of Object-Oriented Languages',
          href: 'ch18-01-what-is-oo.html',
        },
        {
          num: '18.0',
          title: 'Object Oriented Programming Features (chapter overview)',
          href: 'ch18-00-oop.html',
        },
      ],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'oo-characteristics-q1',
          kind: 'choice',
          prompt: 'Does Rust support classical struct-to-struct inheritance?',
          options: [
            { id: 'b', text: 'No — Rust uses traits and composition instead' },
            { id: 'a', text: 'Yes, via the `impl` keyword' },
            { id: 'c', text: 'Yes, through default trait methods' },
          ],
          correct: 'b',
          explain:
            'Rust omits type inheritance; shared behaviors are structured via traits and shared state via composition.',
        },
        {
          id: 'oo-characteristics-q2',
          kind: 'choice',
          prompt: 'Rust “objects” (trait objects) vs OOP objects — what is deliberately missing?',
          options: [
            { id: 'b', text: 'Encapsulation' },
            { id: 'c', text: 'Polymorphism' },
            { id: 'a', text: 'Inheritance of state and behavior' },
          ],
          correct: 'a',
          explain:
            'Rust has encapsulation (modules) and polymorphism (generics + trait objects) but no implementation inheritance — reuse comes from traits and composition.',
        },
        {
          id: 'oo-characteristics-q3',
          kind: 'choice',
          prompt: 'When is `dyn Trait` preferable to generics (`impl Trait`)?',
          options: [
            { id: 'b', text: 'Always — generics are legacy' },
            {
              id: 'a',
              text: 'Heterogeneous collections, or curbing binary bloat from monomorphization — at the price of dynamic dispatch',
            },
            { id: 'c', text: 'Never' },
          ],
          correct: 'a',
          explain:
            'Generics stamp a copy per type (fast, fat); trait objects share one code path through a vtable (compact, indirect). Different bills to pay.',
        },
        {
          id: 'oo-characteristics-q4',
          kind: 'choice',
          prompt: 'How does Rust achieve OOP-style encapsulation without classes?',
          options: [
            { id: 'b', text: 'Through the `encapsulated` keyword on fields' },
            {
              id: 'c',
              text: 'All struct fields are permanently private and reached via reflection',
            },
            {
              id: 'a',
              text: 'Privacy by default at module boundaries — fields stay hidden unless `pub`, and modules define the API surface',
            },
            { id: 'd', text: 'It does not — Rust has no encapsulation mechanism' },
          ],
          correct: 'a',
          explain:
            'TRPL 18.1: encapsulation in Rust is a module-system property, not a class property. `pub` opens precisely what the API promises; everything else hides by default. The `encapsulated`-keyword story invents a keyword.',
        },
      ],
    },
    {
      id: 'trait-objects',
      title: 'Dynamic Dispatch',
      fundamental: true,
      prereq: ['traits', 'generics'],
      difficulty: 4,
      estMinutes: 30,
      reading: [
        {
          num: '18.2',
          title: 'Using Trait Objects to Abstract over Shared Behavior',
          href: 'ch18-02-trait-objects.html',
        },
        {
          num: '18.3',
          title: 'Implementing an Object-Oriented Design Pattern',
          href: 'ch18-03-oo-design-patterns.html',
        },
      ],
      examples: [],
      drills: [],
      practice: [
        {
          id: 'hetero-vec',
          text: 'Define trait Draw with fn draw(&self), implement it for two structs, store both in a Vec<Box<dyn Draw>> and render in a loop.',
        },
        {
          id: 'object-safety',
          text: 'Add fn name(&self) -> Self to the trait, read the object-safety error on dyn Draw, then fix it (e.g. return String).',
        },
      ],
      questions: [
        {
          id: 'trait-objects-q1',
          kind: 'bug',
          prompt:
            'trait Animal {\n    fn speak(&self);\n    fn breed(&self) -> Self;\n}\n\nfn chorus(animals: &[Box<dyn Animal>]) {\n    for a in animals {\n        a.speak();\n    }\n}\n\nfn main() {}\n\nWhy won’t this compile?',
          explain:
            "A method returning `Self` makes `Animal` not dyn compatible — modern rustc says 'not dyn compatible' (E0038), because method `breed` references the `Self` type in its return type: on a `dyn Animal` that would be an unsized `Self` returned by value, so `Box<dyn Animal>` can never exist. Fix the signature (e.g. return `String`) or drop the method.",
        },
        {
          id: 'trait-objects-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nuse std::fmt::Display;\nfn main() {\n    let v: Vec<Box<dyn Display>> = vec![Box::new(5), Box::new("hi")];\n    for x in &v {\n        println!("{x}");\n    }\n}',
          explain:
            'One vector holding an `i32` AND a `&str` — impossible with generics, routine with trait objects: each fat pointer carries its own vtable. Output:\n5\nhi',
        },
        {
          id: 'trait-objects-q3',
          kind: 'choice',
          prompt: 'Why must `dyn Trait` virtually always sit behind a pointer (`Box`, `&`, …)?',
          options: [
            { id: 'b', text: 'For speed' },
            { id: 'c', text: 'Pure syntax requirement' },
            {
              id: 'a',
              text: 'Trait objects are unsized — the compiler needs a fat pointer (data address + vtable)',
            },
          ],
          correct: 'a',
          explain:
            'Different implementors have different sizes, so `dyn Trait` has no compile-time size. The pointer supplies the missing half: address plus vtable.',
        },
        {
          id: 'trait-objects-q4',
          kind: 'choice',
          prompt: 'Which method makes a trait NOT object-safe?',
          options: [
            { id: 'b', text: '`fn run(&self);`' },
            { id: 'c', text: '`fn run(&mut self);`' },
            { id: 'd', text: '`fn run(self: Box<Self>);`' },
            {
              id: 'a',
              text: '`fn clone(&self) -> Self;` — returns `Self`, whose size the vtable cannot know',
            },
          ],
          correct: 'a',
          explain:
            "TRPL 18.2 object safety: methods returning `Self` (or generic methods) break `dyn` because the erased type's size is unknown. `&self`/`&mut self`/`Box<Self>` receivers are all object-safe. Escape hatch: `where Self: Sized` excludes the method from the vtable.",
        },
        {
          id: 'trait-objects-q5',
          kind: 'bug',
          prompt: 'trait T {}\nfn f(x: T) {}\nfn main() {}\n\nWhy rejected?',
          explain:
            'A bare trait name is not a type: the compiler demands `dyn T`, and since `dyn` is unsized it must sit behind a pointer — `fn f(x: &dyn T)`. Every `dyn` needs indirection because its size is unknowable at compile time.',
        },
        {
          id: 'trait-objects-q6',
          kind: 'predict',
          prompt:
            'What does this print?\n\ntrait Sound { fn sound(&self) -> &\'static str; }\nstruct Cat;\nstruct Dog;\nimpl Sound for Cat { fn sound(&self) -> &\'static str { "meow" } }\nimpl Sound for Dog { fn sound(&self) -> &\'static str { "woof" } }\nfn main() {\n    let v: Vec<Box<dyn Sound>> = vec![Box::new(Cat), Box::new(Dog)];\n    for s in &v {\n        print!("{} ", s.sound());\n    }\n}',
          explain:
            "Each call dispatches through that object's vtable to the concrete impl — heterogeneous behavior from a homogeneous container. No downcasting needed; the vtable carries the right function pointer per object. Output:\nmeow woof",
        },
      ],
    },
  ],
};
