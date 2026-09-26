// rust-mastery-data.js
// Prebuilt static mdbook output: book-html/ (TRPL) and rbe-html/ (Rust by Example).
const BOOK = 'book-html/';
// NOTE: "Run" buttons inside RBE pages need network (play.rust-lang.org); reading works offline.
const RBE = 'rbe-html/';
// Vendored rustlings exercises (rustlings/exercises/) — plain .rs files, readable offline.
// Exercise `name` equals the file stem; checkbox progress is keyed by it.
const RL = 'rustlings/exercises/';

const concepts = [
  // ================= Chapter 1 — Getting Started =================
  {
    id: 'installation-hello', chapter: 1, chapterTitle: 'Getting Started', fundamental: false,
    trpl: [
      { num: '1.1', title: 'Installation', url: BOOK + 'ch01-01-installation.html' },
      { num: '1.2', title: 'Hello, World!', url: BOOK + 'ch01-02-hello-world.html' },
      { num: '0', title: 'Introduction — how to read this book', url: BOOK + 'ch00-00-introduction.html' },
      { num: '1.0', title: 'Getting Started (chapter overview)', url: BOOK + 'ch01-00-getting-started.html' },
    ],
    concept: 'Installing Rust & your first program',
    prerequisites: [],
    rbe: [],
    rustlings: [
      { name: 'intro1', url: RL + '00_intro/intro1.rs' },
      { name: 'intro2', url: RL + '00_intro/intro2.rs' },
    ],
    difficulty: 1, estMinutes: 20,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Why does `println!` have a `!` after its name?',
        options: [
          { id: 'a', text: 'It is a macro, not a regular function' },
          { id: 'b', text: 'It is required for all I/O in Rust' },
          { id: 'c', text: 'It marks the function as unsafe' },
        ],
        correct: 'a',
        explain: 'The `!` marks macro invocations. Macros like println! expand at compile time and can accept a variable number of format arguments, which an ordinary function cannot.',
        },
        {
        type: 'multiple_choice',
        prompt: 'You run `rustc main.rs` (no Cargo involved). What appears in the current directory?',
        options: [
          { id: 'a', text: '`a.out`, like gcc' },
          { id: 'b', text: 'An executable named `main`' },
          { id: 'c', text: 'Nothing — rustc requires a Cargo project' },
        ],
        correct: 'b',
        explain: '`rustc main.rs` compiles straight to ./main (main.exe on Windows). `a.out` is gcc’s default; Cargo is convenient but never required.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let apples = 5;\n    println!("I have {apples} apples, that is {apples} total");\n}',
        explain: 'Inline format args (Rust 2021+) capture `apples` directly. Output: "I have 5 apples, that is 5 total".',
        },
        {
        type: 'find_bug',
        prompt: 'A teammate mixes both format styles:\n\nfn main() {\n    let apples = 5;\n    println!("I have {apples} apples", apples);\n}\n\nWhat happens, and why?',
        explain: 'Compile error: argument never used. `{apples}` already captures the variable inline (Rust 2021+), so the trailing `apples` matches no `{}` placeholder. Fix: drop it — `println!("I have {apples} apples");` — or go fully positional: `println!("I have {} apples", apples);`. The format string is checked at compile time, which is exactly why `println!` must be a macro rather than a plain function.',
        },
      ],
    },
  },
  {
    id: 'cargo-basics', chapter: 1, chapterTitle: 'Getting Started', fundamental: false,
    trpl: [{ num: '1.3', title: 'Hello, Cargo!', url: BOOK + 'ch01-03-hello-cargo.html' }],
    concept: 'Cargo: projects, builds, and dependencies',
    prerequisites: ['installation-hello'],
    rbe: [],
    rustlings: [],
    difficulty: 1, estMinutes: 15,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Which command type-checks your project without producing a runnable binary, fastest?',
        options: [{ id: 'a', text: 'cargo build' }, { id: 'b', text: 'cargo check' }, { id: 'c', text: 'cargo run' }],
        correct: 'b',
        explain: '`cargo check` skips code generation and just checks types/borrows, which is much faster while iterating.',
        },
        {
        type: 'multiple_choice',
        prompt: '`cargo new game --bin` then `cargo build`. Where is the runnable binary?',
        options: [
          { id: 'a', text: 'In the project root: `game/game`' },
          { id: 'b', text: 'In `game/target/debug/game`' },
          { id: 'c', text: 'In `game/src/game`' },
        ],
        correct: 'b',
        explain: 'Cargo puts build artifacts under target/<profile>/ — src/ holds only sources, never binaries.',
        },
        {
        type: 'multiple_choice',
        prompt: 'A teammate clones your repo. Which file pins the exact dependency versions they will build with?',
        options: [
          { id: 'a', text: 'Cargo.toml' },
          { id: 'b', text: 'Cargo.lock' },
          { id: 'c', text: '.cargo/config.toml' },
        ],
        correct: 'b',
        explain: 'Cargo.toml declares requirements (often ranges); Cargo.lock records the exact resolved versions. Commit the lockfile for binaries.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Your `Cargo.toml` says `serde = "1.0"` and the committed `Cargo.lock` pins `1.0.197`. A teammate clones fresh and runs `cargo build`. Which version compiles in?',
        options: [
          { id: 'a', text: 'The newest `1.x` on crates.io — the lockfile only matters for library crates' },
          { id: 'b', text: 'Exactly `1.0.197` — the lockfile pins every dependency for reproducible builds' },
          { id: 'c', text: '`1.0.0` — Cargo always resolves to the lowest matching version' },
          { id: 'd', text: 'Whichever `1.x` happens to sit in their local cargo cache' },
        ],
        correct: 'b',
        explain: '`Cargo.toml` declares a compatible range (`"1.0"` means `^1.0`: `>=1.0.0, <2.0.0`); `Cargo.lock` records the exact resolved tree, and a fresh clone reproduces it bit-for-bit. The cache (d) never overrides the lockfile, and Cargo picks the newest compatible version at `update` time — never the lowest (c).',
        },
      ],
    },
  },

  // ================= Chapter 2 — Guessing Game (integrative) =================
  {
    id: 'guessing-game', chapter: 2, chapterTitle: 'Programming a Guessing Game', fundamental: false, integrative: true,
    trpl: [{ num: '2', title: 'Programming a Guessing Game', url: BOOK + 'ch02-00-guessing-game-tutorial.html' }],
    concept: 'First complete program (integrative tutorial)',
    prerequisites: ['cargo-basics'],
    rbe: [],
    rustlings: [],
    difficulty: 2, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'In the guessing game walkthrough, what was the primary purpose of the `match` expression?',
        options: [
          { id: 'a', text: 'To branch cleanly on all possible outcomes (Result Ok/Err, or Ordering Less/Greater/Equal)' },
          { id: 'b', text: 'To generate random numbers' },
          { id: 'c', text: 'To import external crates' },
        ],
        correct: 'a',
        explain: '`match` enables exhaustive pattern matching across all possible variants (like Ok/Err or Less/Greater/Equal). Chapters 3 through 6 will formally break down variables, types, and match syntax step-by-step.',
        },
        {
        type: 'multiple_choice',
        prompt: '`rand` is in Cargo.toml, yet the code still needs `use rand::Rng;`. Why?',
        options: [
          { id: 'a', text: 'Cargo.toml only fetches and builds the crate; `use` brings the trait into scope' },
          { id: 'b', text: '`use` downloads the crate from crates.io' },
          { id: 'c', text: 'It is boilerplate and can be deleted' },
        ],
        correct: 'a',
        explain: 'Dependencies and scope are separate steps: Cargo.toml makes the crate available, `use` makes its items nameable. Without the trait in scope, `.gen_range()` would not resolve.',
        },
        {
        type: 'find_bug',
        prompt: 'let guess = String::new();\nio::stdin().read_line(&mut guess).expect("failed");\n\nThe compiler rejects this. Which line must change, and how?',
        explain: '`guess` is immutable, so `&mut guess` is illegal (E0596: cannot borrow as mutable). Fix: `let mut guess = String::new();`.',
        },
        {
        type: 'multiple_choice',
        prompt: 'The game parses input with `let guess: u32 = guess.trim().parse()...`. Why shadowing instead of declaring `mut guess`?',
        options: [
          { id: 'a', text: '`mut` would work identically — shadowing here is pure style' },
          { id: 'b', text: 'The type changes from `String` to `u32`; `mut` cannot change a variable\'s type, shadowing can' },
          { id: 'c', text: 'Shadowed variables skip the borrow checker' },
          { id: 'd', text: '`mut` bindings cannot be used inside `expect`' },
        ],
        correct: 'b',
        explain: '`let mut guess` keeps one type forever; `let guess = ...` creates a fresh binding that may hold a new type. The book leans on exactly this: the name is reused while the value crosses from `String` to `u32`. Options (c) and (d) invent rules that do not exist.',
        },
      ],
    },
  },

  // ================= Chapter 3 — Common Programming Concepts =================
  {
    id: 'variables-mutability', chapter: 3, chapterTitle: 'Common Programming Concepts', fundamental: true,
    trpl: [
      { num: '3.1', title: 'Variables and Mutability', url: BOOK + 'ch03-01-variables-and-mutability.html' },
      { num: '3.0', title: 'Common Programming Concepts (chapter overview)', url: BOOK + 'ch03-00-common-programming-concepts.html' },
    ],
    concept: 'Variables, mutability, shadowing, constants',
    prerequisites: ['guessing-game'],
    rbe: [],
    rustlings: [
      { name: 'variables1', url: RL + '01_variables/variables1.rs' },
      { name: 'variables2', url: RL + '01_variables/variables2.rs' },
      { name: 'variables3', url: RL + '01_variables/variables3.rs' },
      { name: 'variables4', url: RL + '01_variables/variables4.rs' },
      { name: 'variables5', url: RL + '01_variables/variables5.rs' },
      { name: 'variables6', url: RL + '01_variables/variables6.rs' },
    ],
    difficulty: 1, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nlet x = 5;\nlet x = x + 1;\n{\n    let x = x * 2;\n    println!("inner: {x}");\n}\nprintln!("outer: {x}");',
        explain: 'Shadowing creates a new binding each time. Inner block: (5+1)*2=12 → "inner: 12". After the block ends, the outer shadow (6) is back in scope → "outer: 6".',
        },
        {
        type: 'find_bug',
        prompt: 'let x = 5;\nx = 6;\n\nThis fails, yet `let x = 5; let x = 6;` compiles. What is the error, and why the difference?',
        explain: 'Reassignment to an immutable binding → E0384 (cannot assign twice to immutable variable). The second version shadows: it declares a brand-new binding that merely reuses the name.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Which of these compiles?',
        options: [
          { id: 'a', text: '`let x = 5; let x = "hi";`' },
          { id: 'b', text: '`let mut x = 5; x = "hi";`' },
          { id: 'c', text: 'Both' },
        ],
        correct: 'a',
        explain: 'Shadowing creates a new binding, so the type may change. `mut` only permits same-type reassignment.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let mut x = 1;\n    {\n        let x = x + 10;\n        println!("{x}");\n    }\n    x += 1;\n    println!("{x}");\n}',
        explain: 'The inner `let x` shadows (prints `11`) without touching the outer binding; after the block the outer `x` is still `1`, and `+= 1` makes `2`. Output:\n11\n2. Shadowing never mutates — it temporarily hides.',
        },
      ],
    },
  },
  {
    id: 'data-types', chapter: 3, chapterTitle: 'Common Programming Concepts', fundamental: false,
    trpl: [{ num: '3.2', title: 'Data Types', url: BOOK + 'ch03-02-data-types.html' }],
    concept: 'Scalar and compound types (integers, floats, bool, char, tuples, arrays)',
    prerequisites: ['variables-mutability'],
    rbe: [],
    rustlings: [
      { name: 'primitive_types1', url: RL + '04_primitive_types/primitive_types1.rs' },
      { name: 'primitive_types2', url: RL + '04_primitive_types/primitive_types2.rs' },
      { name: 'primitive_types3', url: RL + '04_primitive_types/primitive_types3.rs' },
      { name: 'primitive_types4', url: RL + '04_primitive_types/primitive_types4.rs' },
      { name: 'primitive_types5', url: RL + '04_primitive_types/primitive_types5.rs' },
      { name: 'primitive_types6', url: RL + '04_primitive_types/primitive_types6.rs' },
    ],
    difficulty: 2, estMinutes: 35,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Which is true of a Rust array `[i32; 5]`?',
        options: [
          { id: 'a', text: 'Its length can change at runtime' },
          { id: 'b', text: 'Its length is fixed and part of its type' },
          { id: 'c', text: 'It is heap-allocated like Vec' },
        ],
        correct: 'b',
        explain: 'Array length is fixed at compile time and encoded in the type itself, unlike Vec<T> which is growable and heap-allocated.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let t = (1, 2.5, \'a\');\n    let (x, _, z) = t;\n    println!("{x} {z}");\n}',
        explain: 'Destructuring binds x=1 and z=\'a\'; `_` discards the 2.5. Output: "1 a".',
        },
        {
        type: 'multiple_choice',
        prompt: 'In `let x = 5;` with no annotation, what is the type of `x`?',
        options: [
          { id: 'a', text: '`i32` — the default integer type' },
          { id: 'b', text: '`usize` — it follows the platform' },
          { id: 'c', text: 'Unknown until `x` is used somewhere' },
        ],
        correct: 'a',
        explain: 'Integer literals default to `i32`. The compiler only demands an annotation when inference cannot settle the type.',
        },
        {
        type: 'multiple_choice',
        prompt: 'In a debug build, what does this do?\n\nlet x: u8 = 255;\nlet y = x + 1;',
        options: [
          { id: 'a', text: 'Wraps silently to `0` in every profile' },
          { id: 'b', text: 'Panics with integer-overflow in debug; wraps to `0` in release' },
          { id: 'c', text: 'Fails to compile — provable overflows are compile errors' },
          { id: 'd', text: 'Promotes `y` to `u16` automatically' },
        ],
        correct: 'b',
        explain: 'TRPL 3.2: debug builds include overflow checks that panic; release builds wrap with two\'s-complement arithmetic. Option (c) confuses this with `const` evaluation, where the compiler does reject overflow. Rust never silently widens integer types (d).',
        },
      ],
    },
  },
  {
    id: 'functions', chapter: 3, chapterTitle: 'Common Programming Concepts', fundamental: false,
    trpl: [{ num: '3.3', title: 'Functions', url: BOOK + 'ch03-03-how-functions-work.html' }],
    concept: 'Functions, parameters, statements vs. expressions, return values',
    prerequisites: ['data-types'],
    rbe: [],
    rustlings: [
      { name: 'functions1', url: RL + '02_functions/functions1.rs' },
      { name: 'functions2', url: RL + '02_functions/functions2.rs' },
      { name: 'functions3', url: RL + '02_functions/functions3.rs' },
      { name: 'functions4', url: RL + '02_functions/functions4.rs' },
      { name: 'functions5', url: RL + '02_functions/functions5.rs' },
    ],
    difficulty: 2, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'find_bug',
        prompt: 'fn square(num: i32) -> i32 {\n    num * num;\n}\n\nWhy won’t this compile, and what’s the one-character fix?',
        explain: 'The trailing `;` turns `num * num` into a statement returning `()`, which doesn’t match the declared `-> i32`. Remove the semicolon so it’s a tail expression.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let y = {\n        let x = 3;\n        x + 1\n    };\n    println!("{y}");\n}',
        explain: 'A block is an expression evaluating to its tail expression (no semicolon). y = 4.',
        },
        {
        type: 'multiple_choice',
        prompt: 'When is `!` (the never type) the honest return type?',
        options: [
          { id: 'a', text: 'A function that panics or loops forever' },
          { id: 'b', text: 'Any function that returns nothing' },
          { id: 'c', text: 'A function returning `Result`' },
        ],
        correct: 'a',
        explain: '`()` means "returns normally with no value"; `!` means "never returns at all" (panic, infinite loop, exit).',
        },
        {
        type: 'find_bug',
        prompt: 'fn main() {\n    let x = (let y = 6);\n}\n\nWhy won\'t this compile?',
        explain: '`let y = 6;` is a statement, and statements return no value — so there is nothing for `x` to bind. TRPL 3.3 draws the line exactly here: only expression blocks evaluate to a value. Drop the inner `let`: `let x = 6;`.',
        },
      ],
    },
  },
  {
    id: 'control-flow', chapter: 3, chapterTitle: 'Common Programming Concepts', fundamental: false,
    trpl: [
      { num: '3.4', title: 'Comments', url: BOOK + 'ch03-04-comments.html' },
      { num: '3.5', title: 'Control Flow', url: BOOK + 'ch03-05-control-flow.html' },
    ],
    concept: 'if/else as expressions, loop, while, for',
    prerequisites: ['functions'],
    rbe: [],
    rustlings: [
      { name: 'if1', url: RL + '03_if/if1.rs' },
      { name: 'if2', url: RL + '03_if/if2.rs' },
      { name: 'if3', url: RL + '03_if/if3.rs' },
      { name: 'quiz1', url: RL + 'quizzes/quiz1.rs' },
    ],
    difficulty: 2, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Why does `if number { ... }` fail to compile in Rust (unlike C or JavaScript)?',
        options: [
          { id: 'a', text: 'Rust has no if-statements' },
          { id: 'b', text: 'Rust never implicitly converts non-bool types to bool' },
          { id: 'c', text: 'Integers cannot be compared' },
        ],
        correct: 'b',
        explain: 'Rust requires the condition to be an actual `bool` — there is no implicit truthiness conversion the way there is in C or JS.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let mut n = 0;\n    let r = loop {\n        n += 1;\n        if n == 3 {\n            break n * 10;\n        }\n    };\n    println!("{r}");\n}',
        explain: '`break value` exits the loop yielding that value: 3*10 = 30.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Which loop is guaranteed to execute its body at least once?',
        options: [
          { id: 'a', text: '`loop`' },
          { id: 'b', text: '`while cond`' },
          { id: 'c', text: '`for x in iter`' },
        ],
        correct: 'a',
        explain: '`loop` has no entry condition — it runs until `break`. `while` and `for` may both run zero times.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why is this rejected?\n\nfn main() {\n    let n = 3;\n    let s = if n > 2 { "big" } else { 0 };\n}',
        options: [
          { id: 'a', text: 'Both arms must evaluate to the same type; `&str` and `i32` cannot unify (E0308)' },
          { id: 'b', text: '`if` conditions require parentheses in expression position' },
          { id: 'c', text: 'A `let` binding cannot hold an `if` expression' },
          { id: 'd', text: 'The `else` arm is missing a semicolon' },
        ],
        correct: 'a',
        explain: '`if` used as an expression forces both arms to one type so `s` has a single static type. Fix by unifying the arms (`else { "small" }`). Assigning an `if`-expression to `let` (c) is perfectly legal — the arms, not the binding, are the problem.',
        },
      ],
    },
  },

  // ================= Chapter 4 — Understanding Ownership =================
  {
    id: 'ownership', chapter: 4, chapterTitle: 'Understanding Ownership', fundamental: true,
    trpl: [
      { num: '4.1', title: 'What is Ownership?', url: BOOK + 'ch04-01-what-is-ownership.html' },
      { num: '4.0', title: 'Understanding Ownership (chapter overview)', url: BOOK + 'ch04-00-understanding-ownership.html' },
    ],
    concept: 'Ownership rules, move semantics, Clone',
    prerequisites: ['control-flow'],
    rbe: [],
    rustlings: [
      { name: 'move_semantics1', url: RL + '06_move_semantics/move_semantics1.rs' },
      { name: 'move_semantics2', url: RL + '06_move_semantics/move_semantics2.rs' },
      { name: 'move_semantics3', url: RL + '06_move_semantics/move_semantics3.rs' },
      { name: 'move_semantics4', url: RL + '06_move_semantics/move_semantics4.rs' },
    ],
    difficulty: 3, estMinutes: 40,
    checkpoint: {
      questions: [
        {
        type: 'find_bug',
        prompt: 'let s1 = String::from("hi");\nlet s2 = s1;\nprintln!("{s1}");\n\nWhat error appears, and why does it NOT happen with `let x = 5; let y = x; println!("{x}");`?',
        explain: 'String is not Copy, so `let s2 = s1` moves ownership — s1 is no longer valid. `i32` is Copy, so `let y = x` duplicates the value on the stack and both remain valid.',
        },
        {
        type: 'find_bug',
        prompt: 'fn main() {\n    let s = String::from("hi");\n    takes(s);\n    println!("{s}");\n}\nfn takes(_s: String) {}\n\nWhat error does this produce, and what is the idiomatic fix?',
        explain: 'E0382: use of moved value — passing `s` by value moves ownership into `takes`. Fix: borrow instead: `takes(&s)` with `fn takes(_s: &str)`.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Which of these types are `Copy`?',
        options: [
          { id: 'a', text: '`i32`, `bool`, `char`' },
          { id: 'b', text: '`String`, `Vec<T>`' },
          { id: 'c', text: 'Every type stored on the stack' },
        ],
        correct: 'a',
        explain: 'Only certain small types implement Copy. Heap-owning types never do — and not every stack type qualifies either (`[String; 2]` is not Copy).',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let s = String::from("a");\n    {\n        let s = String::from("b");\n        println!("{s}");\n    }\n    println!("{s}");\n}',
        explain: 'The inner `let s` shadows the outer one: `"b"` prints, then the inner `String` is dropped at the block end, and the untouched outer `"a"` prints. Output:\nb\na. Shadowing never moves or drops the shadowed value early.',
        },
        {
        type: 'find_bug',
        prompt: 'struct P { x: String, y: i32 }\nfn main() {\n    let p = P { x: String::from("a"), y: 1 };\n    let s = p.x;\n    println!("{}", p.y);\n    println!("{}", p.x);\n}\n\nWhich line fails, and why do the others pass?',
        explain: 'The final line fails (E0382, partial move): `p.x` was moved into `s`. The `p.y` line still passes because `i32` is `Copy` — moving one field never disturbs the others. Fix: borrow instead (`let s = &p.x;`) or clone the field.',
        },
      ],
    },
  },
  {
    id: 'borrowing', chapter: 4, chapterTitle: 'Understanding Ownership', fundamental: true,
    trpl: [{ num: '4.2', title: 'References and Borrowing', url: BOOK + 'ch04-02-references-and-borrowing.html' }],
    concept: 'References, borrowing, mutable vs. immutable borrows',
    prerequisites: ['ownership'],
    rbe: [],
    rustlings: [
      { name: 'move_semantics5', url: RL + '06_move_semantics/move_semantics5.rs' },
    ],
    difficulty: 3, estMinutes: 35,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Which combination of borrows is allowed at the same time on the same value?',
        options: [
          { id: 'a', text: 'Two mutable references' },
          { id: 'b', text: 'One mutable and one immutable reference' },
          { id: 'c', text: 'Any number of immutable references' },
        ],
        correct: 'c',
        explain: 'Rust allows either any number of immutable (&T) borrows, or exactly one mutable (&mut T) borrow — never both kinds simultaneously.',
        },
        {
        type: 'find_bug',
        prompt: 'fn main() {\n    let mut s = String::from("hi");\n    let r1 = &s;\n    let r2 = &mut s;\n    println!("{r1}");\n}\n\nWhy is this rejected?',
        explain: 'E0502: cannot borrow `s` as mutable while the immutable borrow `r1` is still live — its last use is the final println!, so the two borrows overlap. Either kind, never both at once.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let mut s = String::from("hi");\n    {\n        let r = &mut s;\n        r.push(\'!\');\n    }\n    println!("{s}");\n}',
        explain: 'The mutable borrow ends when `r` goes out of scope, so the later borrow for println! is legal. Output: "hi!".',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why does this compile under non-lexical lifetimes (but would NOT under the old lexical rule)?\n\nfn main() {\n    let mut s = String::from("hi");\n    let r = &s;\n    println!("{r}");\n    s.push(\'!\');\n    println!("{s}");\n}',
        options: [
          { id: 'a', text: 'The shared borrow of `r` ends at its last use, so the later `&mut` borrow never overlaps it' },
          { id: 'b', text: '`String` contents are `Copy`, so `r` was never really a borrow' },
          { id: 'c', text: '`push` takes `&self`, so no mutable borrow happens at all' },
          { id: 'd', text: 'It does not compile — `r` holds the borrow for the whole remaining scope' },
        ],
        correct: 'a',
        explain: 'NLL (TRPL 4.2) ends a borrow\'s region at its last use — the `println!("{r}")` line. The `&mut` for `push` starts after, so the two borrows never coexist. Option (d) states the pre-2018 lexical rule, which is exactly what NLL replaced.',
        },
        {
        type: 'find_bug',
        prompt: 'fn main() {\n    let r;\n    {\n        let s = String::from("hi");\n        r = &s;\n    }\n    println!("{r}");\n}\n\nWhich borrow rule is violated?',
        explain: 'Dangling reference: `s` is dropped at the end of the inner block while `r` still points at it. TRPL 4.2 guarantees references are always valid — the compiler rejects this (`s` does not live long enough). Fix: print inside the block, or move ownership of `s` outward.',
        },
      ],
    },
  },
  {
    id: 'slices', chapter: 4, chapterTitle: 'Understanding Ownership', fundamental: true,
    trpl: [{ num: '4.3', title: 'The Slice Type', url: BOOK + 'ch04-03-slices.html' }],
    concept: 'String slices and array slices',
    prerequisites: ['borrowing'],
    rbe: [],
    rustlings: [],
    difficulty: 3, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'predict_output',
        prompt: 'let a = [1, 2, 3, 4, 5];\nlet s = &a[1..3];\nprintln!("{:?}", s);',
        explain: 'Range `1..3` is half-open: indices 1 and 2, excluding 3. Output: [2, 3].',
        },
        {
        type: 'find_bug',
        prompt: 'let a = [1, 2, 3];\nlet s: &[i32] = a;\n\nWhat is wrong, and what is the fix?',
        explain: 'Type mismatch (E0308): `a` is an array `[i32; 3]`, not a slice reference. Fix: `let s: &[i32] = &a;` — arrays coerce to slices behind a reference.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Book functions take `&str` rather than `&String`. Why?',
        options: [
          { id: 'a', text: 'It accepts owned Strings, slices, and literals via deref coercion' },
          { id: 'b', text: 'It avoids heap allocation' },
          { id: 'c', text: 'The borrow checker requires it' },
        ],
        correct: 'a',
        explain: '`&String` derefs to `&str`, so a `&str` parameter accepts strictly more inputs. `&String` in a signature is needlessly narrow.',
        },
        {
        type: 'find_bug',
        prompt: 'fn main() {\n    let s = String::from("héllo");\n    let h = &s[0..2];\n    println!("{h}");\n}\n\nWill this compile and run? If not, why?',
        explain: 'It compiles but panics at runtime: `é` occupies two bytes in UTF-8, so byte index 2 splits a character boundary. TRPL 4.3/8.2: string slicing is byte-based and must land on `char` boundaries. Fix: `&s[0..3]` yields `"hé"`.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn first(s: &str) -> &str {\n    &s[0..1]\n}\nfn main() {\n    println!("{}", first("abc"));\n}',
        explain: 'Byte range `0..1` is one ASCII char, so `"a"` prints. Note the signature needs zero lifetime annotations thanks to elision: the output borrow is tied to the input borrow. Output: "a".',
        },
      ],
    },
  },

  // ================= Chapter 5 — Structs =================
  {
    id: 'structs', chapter: 5, chapterTitle: 'Using Structs to Structure Related Data', fundamental: true,
    trpl: [
      { num: '5.1', title: 'Defining and Instantiating Structs', url: BOOK + 'ch05-01-defining-structs.html' },
      { num: '5.2', title: 'An Example Program Using Structs', url: BOOK + 'ch05-02-example-structs.html' },
      { num: '5.0', title: 'Using Structs (chapter overview)', url: BOOK + 'ch05-00-structs.html' },
    ],
    concept: 'Classic, tuple, and unit-like structs',
    prerequisites: ['ownership', 'data-types'],
    rbe: [],
    rustlings: [
      { name: 'structs1', url: RL + '07_structs/structs1.rs' },
      { name: 'structs2', url: RL + '07_structs/structs2.rs' },
    ],
    difficulty: 2, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'What kind of struct is `struct Point(i32, i32);`?',
        options: [
          { id: 'a', text: 'Classic (named-field) struct' },
          { id: 'b', text: 'Tuple struct' },
          { id: 'c', text: 'Unit-like struct' },
        ],
        correct: 'b',
        explain: 'Fields are accessed positionally (`p.0`, `p.1`) rather than by name — this is a tuple struct.',
        },
        {
        type: 'find_bug',
        prompt: 'struct User { name: String, age: u32 }\nfn main() {\n    let u1 = User { name: String::from("a"), age: 1 };\n    let _u2 = User { age: 2, ..u1 };\n    println!("{}", u1.name);\n}\n\nWhat fails here, and why?',
        explain: 'Partial move (E0382): struct-update syntax `..u1` moves the remaining fields, so `u1.name` (a String, not Copy) now belongs to `_u2` and reading `u1.name` afterwards borrows a moved value.',
        },
        {
        type: 'multiple_choice',
        prompt: 'When can you write `User { name, age }` instead of `User { name: name, age: age }`?',
        options: [
          { id: 'a', text: 'When local variables have exactly the same names as the fields' },
          { id: 'b', text: 'Always — the compiler figures it out' },
          { id: 'c', text: 'Only for fields marked `pub`' },
        ],
        correct: 'a',
        explain: 'Field init shorthand requires a variable in scope with the identical name. It is purely syntactic sugar, not inference.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why is this rejected?\n\nstruct User { name: String }\nfn main() {\n    let u = User { name: String::from("a") };\n    println!("{u}");\n}',
        options: [
          { id: 'a', text: '`User` implements neither `Display` nor `Debug` — `{}` needs `Display`; derive `Debug` and print with `{u:?}`' },
          { id: 'b', text: 'Structs can never be printed, even for debugging' },
          { id: 'c', text: 'The field `name` is private to `main`' },
          { id: 'd', text: 'A semicolon is missing after the `struct` definition' },
        ],
        correct: 'a',
        explain: '`{}` requires `Display`, which the compiler never auto-implements. TRPL 5.2 reaches for `#[derive(Debug)]` plus `{:?}` instead. Privacy (c) is a red herring — fields are visible in the defining module — and struct definitions take no trailing semicolon (d).',
        },
      ],
    },
  },
  {
    id: 'methods', chapter: 5, chapterTitle: 'Using Structs to Structure Related Data', fundamental: false,
    trpl: [{ num: '5.3', title: 'Methods', url: BOOK + 'ch05-03-method-syntax.html' }],
    concept: 'impl blocks, methods (&self), associated functions',
    prerequisites: ['structs'],
    rbe: [],
    rustlings: [{ name: 'structs3', url: RL + '07_structs/structs3.rs' }],
    difficulty: 2, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Which signature lets a method read fields without consuming or mutating the struct?',
        options: [
          { id: 'a', text: 'fn area(self) -> u32' },
          { id: 'b', text: 'fn area(&self) -> u32' },
          { id: 'c', text: 'fn area(&mut self) -> u32' },
        ],
        correct: 'b',
        explain: '`&self` borrows the instance immutably — the common case for read-only methods.',
        },
        {
        type: 'find_bug',
        prompt: 'struct R { w: u32 }\nimpl R {\n    fn w(self) -> u32 { self.w }\n}\nfn main() {\n    let r = R { w: 3 };\n    let a = r.w();\n    println!("{} {}", a, r.w);\n}\n\nWhy is the second `r.w` rejected?',
        explain: 'E0382: `w(self)` takes ownership, so the first call moves `r` and the second use is of a moved value. Contrast with `&self` methods, which only borrow. Fix: `fn w(&self)`.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What is `Self` (capital S) inside an `impl` block?',
        options: [
          { id: 'a', text: 'An alias for the type being implemented' },
          { id: 'b', text: 'The current instance, like `self`' },
          { id: 'c', text: 'The parent module' },
        ],
        correct: 'a',
        explain: '`Self` refers to the implementing type itself — handy in constructors like `fn new() -> Self`. Lowercase `self` is the receiver.',
        },
        {
        type: 'find_bug',
        prompt: 'struct R { w: u32 }\nimpl R {\n    fn new(w: u32) -> R { R { w } }\n}\nfn main() {\n    let r = R.new(3);\n}\n\nWhy won\'t this compile?',
        explain: '`new` is an associated function, not a method — it takes no `self` receiver, so it lives on the type itself: `R::new(3)`. Dot syntax is reserved for methods (TRPL 5.3). The `::` vs `.` distinction is exactly receiver vs no-receiver.',
        },
      ],
    },
  },

  // ================= Chapter 6 — Enums and Pattern Matching =================
  {
    id: 'enums', chapter: 6, chapterTitle: 'Enums and Pattern Matching', fundamental: true,
    trpl: [
      { num: '6.1', title: 'Defining an Enum', url: BOOK + 'ch06-01-defining-an-enum.html' },
      { num: '6.0', title: 'Enums and Pattern Matching (chapter overview)', url: BOOK + 'ch06-00-enums.html' },
    ],
    concept: 'Enums with data, Option<T>',
    prerequisites: ['structs'],
    rbe: [],
    rustlings: [
      { name: 'enums1', url: RL + '08_enums/enums1.rs' },
      { name: 'enums2', url: RL + '08_enums/enums2.rs' },
    ],
    difficulty: 3, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'What does `Option<T>` model?',
        options: [
          { id: 'a', text: 'An error that may occur' },
          { id: 'b', text: 'A value that may or may not be present' },
          { id: 'c', text: 'A value protected by a mutex' },
        ],
        correct: 'b',
        explain: 'Option<T> is Some(T) or None — Rust’s type-safe replacement for nullable references.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nenum M { On(String), Off }\nfn main() {\n    let m = M::On(String::from("hi"));\n    match m {\n        M::On(s) => println!("on {s}"),\n        M::Off => println!("off"),\n    }\n}',
        explain: 'The `On` arm binds the inner String to `s`. Output: "on hi". Variants can carry data of different types.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why does `Option<T>` prevent null-pointer bugs instead of just renaming them?',
        options: [
          { id: 'a', text: 'The compiler forces every use site to handle both cases — there is no implicit unwrap' },
          { id: 'b', text: 'Checking `None` is faster than checking null' },
          { id: 'c', text: 'It uses less memory than a nullable pointer' },
        ],
        correct: 'a',
        explain: 'Safety comes from exhaustiveness: you cannot reach the inner value without confronting `None`. No silent default, no forgotten check.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What determines `size_of::<MyEnum>()`?',
        options: [
          { id: 'a', text: 'The sum of all variants\' sizes' },
          { id: 'b', text: 'The largest variant plus discriminant bookkeeping — Rust must fit whichever variant is live' },
          { id: 'c', text: 'Always 8 bytes regardless of variants' },
          { id: 'd', text: 'Nothing — enums are purely compile-time and occupy no space' },
        ],
        correct: 'b',
        explain: 'An enum holds one variant at a time, so Rust allocates the maximum variant size plus a discriminant tag. Option (a) describes a struct; (d) confuses enums with zero-sized marker types.',
        },
        {
        type: 'find_bug',
        prompt: 'enum M { On, Off }\nfn main() {\n    let m = On;\n}\n\nWhy won\'t this compile?',
        explain: 'Variants live in the enum\'s namespace: `M::On`, not bare `On` (TRPL 6.2). Bare `Some`/`None` only work because the prelude imports them — your own variants need the path or `use M::*`.',
        },
      ],
    },
  },
  {
    id: 'option-type', chapter: 6, chapterTitle: 'Enums and Pattern Matching', fundamental: true,
    trpl: [
      { num: '6.1', title: 'The Option Enum (Option section)', url: BOOK + 'ch06-01-defining-an-enum.html#the-option-enum-and-its-advantages-over-null-values' },
      { num: 'std', title: 'Option<T> API docs', url: 'https://doc.rust-lang.org/std/option/enum.Option.html' },
    ],
    concept: 'Option<T>: Some, None, and null-free absence',
    prerequisites: ['enums'],
    rbe: [],
    rustlings: [
      { name: 'options1', url: RL + '12_options/options1.rs' },
      { name: 'options2', url: RL + '12_options/options2.rs' },
    ],
    difficulty: 2, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'predict_output',
        prompt: 'let a: Option<i32> = Some(10);\nlet b: Option<i32> = None;\nprintln!("{} {}", a.unwrap_or(0), b.unwrap_or(0));',
        explain: 'unwrap_or returns the value inside Some, or the provided fallback default if None. Output: 10 0.',
        },
        {
        type: 'find_bug',
        prompt: 'fn plus_one(x: Option<i32>) -> Option<i32> {\n    match x {\n        Some(i) => Some(i + 1),\n    }\n}\n\nWhat does the compiler demand here?',
        explain: 'Exhaustiveness (E0004): the `None` case is unhandled. Add `None => None,` — the compiler refuses to let a case fall through silently.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What does `match` give you that `if let` + `else` does not?',
        options: [
          { id: 'a', text: 'Compiler-checked exhaustiveness' },
          { id: 'b', text: 'The ability to bind values from patterns' },
          { id: 'c', text: 'Matching on integers' },
        ],
        correct: 'a',
        explain: '`if let` also binds values and matches integers, but only `match` proves to the compiler that no case was forgotten.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn f(x: Option<i32>) -> Option<i32> {\n    let y = x?;\n    Some(y * 2)\n}\nfn main() {\n    println!("{:?} {:?}", f(Some(21)), f(None));\n}',
        explain: '`?` unwraps `Some` or early-returns `None` from the whole function — exactly as it propagates `Err` on `Result` (TRPL 9.2). Output:\nSome(42) None.',
        },
      ],
    },
  },
  {
    id: 'match', chapter: 6, chapterTitle: 'Enums and Pattern Matching', fundamental: true,
    trpl: [{ num: '6.2', title: 'The match Control Flow Construct', url: BOOK + 'ch06-02-match.html' }],
    concept: 'match, exhaustiveness, binding values out of variants',
    prerequisites: ['enums'],
    rbe: [],
    rustlings: [{ name: 'enums3', url: RL + '08_enums/enums3.rs' }],
    difficulty: 3, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'explain',
        prompt: 'Why does Rust force `match` arms to be exhaustive, unlike switch in C or JS?',
        explain: 'Exhaustiveness is checked at compile time so that adding a new enum variant later forces every match site that cares to be updated — this eliminates a whole class of "forgot to handle the new case" bugs.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let n = 7;\n    match n {\n        x if x < 5 => println!("small"),\n        x if x % 2 == 1 => println!("odd {x}"),\n        _ => println!("other"),\n    }\n}',
        explain: 'Arms try in order with their guards: 7 is not < 5, is odd → binds x=7. Output: "odd 7".',
        },
        {
        type: 'multiple_choice',
        prompt: 'Which pattern may appear in a plain `let` (not `if let`, not `match`)?',
        options: [
          { id: 'a', text: '`(x, y)` destructuring a tuple' },
          { id: 'b', text: '`Some(x)` on an Option' },
          { id: 'c', text: 'The literal `3` on an integer' },
        ],
        correct: 'a',
        explain: 'Plain `let` accepts only irrefutable patterns — ones that cannot fail. `Some(x)` and literals can fail, so they need `match`/`if let`.',
        },
        {
        type: 'find_bug',
        prompt: 'fn main() {\n    let n: Option<i32> = Some(3);\n    match n {\n        Some(x) => println!("{x}"),\n    }\n}\n\nWhat does the compiler demand, and what are the two idiomatic fixes?',
        explain: 'Non-exhaustive patterns (E0004): `None` is unhandled. Add a `None => {}` arm, or collapse the whole thing to `if let Some(x) = n`. The compiler proves exhaustiveness — it refuses to guess what missing arms should do.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Matching `&opt` where `opt: Option<String>` — what is the type of `x` in `Some(x) => ...`?',
        options: [
          { id: 'a', text: '`&String` — default binding modes auto-adjust so `x` borrows; no `&` needed in the pattern' },
          { id: 'b', text: '`String` — matching always moves the inner value out' },
          { id: 'c', text: 'It fails to compile — you must write `Some(&x)` explicitly' },
          { id: 'd', text: '`&&String` — one `&` from the scrutinee plus one from the pattern' },
        ],
        correct: 'a',
        explain: 'Match ergonomics (TRPL patterns chapters): matching a reference switches bindings to borrow mode automatically. Explicit `&` still compiles but is unneeded; (b) would move out of borrowed content and is rejected.',
        },
      ],
    },
  },
  {
    id: 'if-let', chapter: 6, chapterTitle: 'Enums and Pattern Matching', fundamental: false,
    trpl: [{ num: '6.3', title: 'Concise Control Flow with if let and let...else', url: BOOK + 'ch06-03-if-let.html' }],
    concept: 'if let / while let / let-else shorthand',
    prerequisites: ['match'],
    rbe: [],
    rustlings: [{ name: 'options2', url: RL + '12_options/options2.rs' }],
    difficulty: 2, estMinutes: 20,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: '`if let Some(x) = maybe_val { ... }` is sugar for which match?',
        options: [
          { id: 'a', text: 'match maybe_val { Some(x) => {...}, _ => {} }' },
          { id: 'b', text: 'match maybe_val { Some(x) => {...} }' },
          { id: 'c', text: 'while maybe_val.is_some() {...}' },
        ],
        correct: 'a',
        explain: 'if let is exactly a match with one handled arm and an implicit do-nothing `_` arm.',
        },
        {
        type: 'find_bug',
        prompt: 'fn main() {\n    let s = Some(String::from("hi"));\n    if let Some(x) = s {\n        println!("{x}");\n    }\n    println!("{:?}", s);\n}\n\nWhy does the last line fail?',
        explain: 'Partial move (E0382): matching `Some(x)` by value moves the String out of `s`, so `s` is partially moved and cannot be used afterwards. Borrow instead: `if let Some(x) = &s`.',
        },
        {
        type: 'multiple_choice',
        prompt: '`let Some(x) = opt else { return; };` — what must the `else` block do?',
        options: [
          { id: 'a', text: 'Diverge: return, break, continue, or panic — it may never fall through' },
          { id: 'b', text: 'Assign a default value to `x`' },
          { id: 'c', text: 'Anything; `x` becomes `None` on the sad path' },
        ],
        correct: 'a',
        explain: '`let-else` only compiles if the else branch diverges, because execution continues with `x` bound — there must be no path where `x` is unbound.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why is `if let x = 5 { ... }` rejected?',
        options: [
          { id: 'a', text: 'Irrefutable patterns are forbidden in `if let` — use a plain `let`' },
          { id: 'b', text: '`if let` requires an `else` arm to compile' },
          { id: 'c', text: '`x` must be declared `mut` before it can bind' },
          { id: 'd', text: 'Integer literals cannot appear in patterns' },
        ],
        correct: 'a',
        explain: '`if let` exists for refutable patterns; `x = 5` always matches, making the conditional meaningless — the compiler says so (irrefutable `if let` error, TRPL 6.3). Integers match fine as patterns (d); the construct, not the literal, is the problem.',
        },
      ],
    },
  },

  // ================= Chapter 7 — Packages, Crates, Modules =================
  {
    id: 'packages-crates', chapter: 7, chapterTitle: 'Packages, Crates, and Modules', fundamental: false,
    trpl: [
      { num: '7.1', title: 'Packages and Crates', url: BOOK + 'ch07-01-packages-and-crates.html' },
      { num: '7.0', title: 'Packages, Crates, and Modules (chapter overview)', url: BOOK + 'ch07-00-managing-growing-projects-with-packages-crates-and-modules.html' },
    ],
    concept: 'Packages vs. crates vs. the crate root',
    prerequisites: ['functions'],
    rbe: [],
    rustlings: [],
    difficulty: 2, estMinutes: 15,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'A package can contain how many library crates?',
        options: [
          { id: 'a', text: 'Unlimited' },
          { id: 'b', text: 'At most one' },
          { id: 'c', text: 'Exactly one, mandatory' },
        ],
        correct: 'b',
        explain: 'A package must have at least one crate, may have multiple binary crates, but at most one library crate.',
        },
        {
        type: 'multiple_choice',
        prompt: 'A package contains both `src/main.rs` and `src/lib.rs`. What does that mean?',
        options: [
          { id: 'a', text: 'Two separate packages sharing a directory' },
          { id: 'b', text: 'One package with a binary crate and a library crate' },
          { id: 'c', text: 'Invalid layout — a package cannot hold both' },
        ],
        correct: 'b',
        explain: 'Standard layout: `main.rs` is the binary root, `lib.rs` the library root of the same package. They can even share module files.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What does the first `cargo build` do about `rand = "0.8"` in Cargo.toml?',
        options: [
          { id: 'a', text: 'Downloads, compiles, and locks the exact resolved version' },
          { id: 'b', text: 'Only verifies the crate exists' },
          { id: 'c', text: 'Vendors the source into `src/`' },
        ],
        correct: 'a',
        explain: 'First build resolves the requirement to a concrete version, compiles it, and records it in Cargo.lock. Sources stay in the registry cache, never in src/.',
        },
        {
        type: 'multiple_choice',
        prompt: 'A package has both `src/main.rs` and `src/lib.rs`. Where must shared `fn helper()` live so the binary AND integration tests can both use it?',
        options: [
          { id: 'a', text: 'In `src/lib.rs` (or its modules) — the binary imports the library crate; integration tests can only use the library, never `main.rs`' },
          { id: 'b', text: 'In `src/main.rs` — every target sees the binary crate' },
          { id: 'c', text: 'In `tests/` — files there are shared automatically with all targets' },
          { id: 'd', text: 'It must be duplicated in both files' },
        ],
        correct: 'a',
        explain: 'TRPL 7.1/11.3: integration tests link the *library* crate; `main.rs` is a separate binary crate invisible to them. Shared logic belongs in `lib.rs` (imported by the binary with `use`), never duplicated (d).',
        },
      ],
    },
  },
  {
    id: 'modules-privacy', chapter: 7, chapterTitle: 'Packages, Crates, and Modules', fundamental: false,
    trpl: [
      { num: '7.2', title: 'Defining Modules to Control Scope and Privacy', url: BOOK + 'ch07-02-defining-modules-to-control-scope-and-privacy.html' },
      { num: '7.3', title: 'Paths for Referring to an Item in the Module Tree', url: BOOK + 'ch07-03-paths-for-referring-to-an-item-in-the-module-tree.html' },
    ],
    concept: 'mod, the module tree, pub visibility',
    prerequisites: ['packages-crates'],
    rbe: [],
    rustlings: [{ name: 'modules1', url: RL + '10_modules/modules1.rs' }],
    difficulty: 3, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'By default, is an item declared inside `mod foo { fn bar() {} }` visible outside `foo`?',
        options: [
          { id: 'a', text: 'Yes, everything is public by default' },
          { id: 'b', text: 'No — everything is private unless marked pub' },
          { id: 'c', text: 'Functions are private, but types and constants are public' },
        ],
        correct: 'b',
        explain: 'Rust’s default is private; you opt into visibility with `pub`, the opposite default from many other languages.',
        },
        {
        type: 'find_bug',
        prompt: 'mod kitchen {\n    fn cook() {}\n}\nfn main() {\n    kitchen::cook();\n}\n\nWhat is the error, and what is the minimal fix?',
        explain: 'Privacy error (E0603): `cook` is private to `kitchen` by default, so the path does not resolve. Minimal fix: `pub fn cook()`.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What does `pub(crate)` on an item mean?',
        options: [
          { id: 'a', text: 'Visible anywhere inside this crate, but not to downstream crates' },
          { id: 'b', text: 'Exactly the same as `pub`' },
          { id: 'c', text: 'Visible only inside the defining module' },
        ],
        correct: 'a',
        explain: '`pub(crate)` is the middle ground: crate-wide sharing without committing to a public API. Plain `pub` also exposes it externally.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Does this compile?\n\nmod outer {\n    fn secret() {}\n    pub mod inner {\n        pub fn leak() {\n            super::secret();\n        }\n    }\n}',
        options: [
          { id: 'a', text: 'Yes — child modules see ancestor-private items; privacy walls face outward, not inward' },
          { id: 'b', text: 'No — `secret` needs `pub` for anyone else to call it' },
          { id: 'c', text: 'No — `super` paths are forbidden inside function bodies' },
          { id: 'd', text: 'Yes, but only because `inner` is declared `pub`' },
        ],
        correct: 'a',
        explain: 'TRPL 7.2 privacy rule: an item is visible to its defining module *and all descendants*. `pub` on `inner` controls outside access to `inner` — it says nothing about what `inner` may see inward (d).',
        },
        {
        type: 'find_bug',
        prompt: 'mod m {\n    struct S;\n}\nuse m::S;\nfn main() {\n    let _s = S;\n}\n\nTwo errors hide here. What are they?',
        explain: 'Both the module and the unit struct are private: `use m::S` fails (E0603, `m` invisible outside its parent) and `S` itself is invisible too. Fix: `pub mod m` with `pub struct S;`. Crucially, `use` never grants visibility — it only shortens paths to things already visible.',
        },
      ],
    },
  },
  {
    id: 'use-paths', chapter: 7, chapterTitle: 'Packages, Crates, and Modules', fundamental: false,
    trpl: [
      { num: '7.4', title: 'Bringing Paths into Scope with the use Keyword', url: BOOK + 'ch07-04-bringing-paths-into-scope-with-the-use-keyword.html' },
      { num: '7.5', title: 'Separating Modules into Different Files', url: BOOK + 'ch07-05-separating-modules-into-different-files.html' },
    ],
    concept: 'use, re-exporting with pub use, splitting modules across files',
    prerequisites: ['modules-privacy'],
    rbe: [],
    rustlings: [
      { name: 'modules2', url: RL + '10_modules/modules2.rs' },
      { name: 'modules3', url: RL + '10_modules/modules3.rs' },
    ],
    difficulty: 2, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'What does `mod foo;` (no body, just a semicolon) tell the compiler?',
        options: [
          { id: 'a', text: 'Declare an empty module named foo' },
          { id: 'b', text: 'Load foo’s contents from foo.rs or foo/mod.rs' },
          { id: 'c', text: 'Import foo from an external crate' },
        ],
        correct: 'b',
        explain: 'The semicolon form tells Rust the module body lives in another file with a matching name.',
        },
        {
        type: 'multiple_choice',
        prompt: 'How do you import both `std::io` and `std::io::Write` in one statement?',
        options: [
          { id: 'a', text: '`use std::io::{self, Write};`' },
          { id: 'b', text: '`use std::io, std::io::Write;`' },
          { id: 'c', text: '`use std::io::*;`' },
        ],
        correct: 'a',
        explain: '`self` in a nested list refers to the parent path itself. Glob (c) also compiles but imports everything — the book prefers explicit nested lists.',
        },
        {
        type: 'find_bug',
        prompt: 'use std::fmt::Result;\nuse std::io::Result;\nfn main() {}\n\nWhy does this fail, and how do real codebases handle it?',
        explain: 'Name collision (E0252): two different `Result` types in one namespace. Fix with an alias: `use std::io::Result as IoResult;` — exactly why `as` exists.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What does `use std::io::{self, Write};` import?',
        options: [
          { id: 'a', text: 'Both `std::io` itself and `std::io::Write` — inside a nested list, `self` names the base path' },
          { id: 'b', text: 'Only `Write`; `self` is a no-op filler' },
          { id: 'c', text: 'It fails — `self` is only valid in method receivers' },
          { id: 'd', text: 'The whole `std::io` module glob plus `Write`' },
        ],
        correct: 'a',
        explain: 'TRPL 7.4: in a nested use-tree, `self` refers to the base path itself — needed when code uses both `io::stdin()`-style paths and the `Write` trait. Option (c) confuses path-`self` with receiver-`self`; (d) would be `use std::io::*`.',
        },
      ],
    },
  },

  // ================= Chapter 8 — Common Collections =================
  {
    id: 'vectors', chapter: 8, chapterTitle: 'Common Collections', fundamental: true,
    trpl: [
      { num: '8.1', title: 'Storing Lists of Values with Vectors', url: BOOK + 'ch08-01-vectors.html' },
      { num: '8.0', title: 'Common Collections (chapter overview)', url: BOOK + 'ch08-00-common-collections.html' },
    ],
    concept: 'Vec<T>: creating, pushing, indexing, iterating',
    prerequisites: ['slices'],
    rbe: [],
    rustlings: [
      { name: 'vecs1', url: RL + '05_vecs/vecs1.rs' },
      { name: 'vecs2', url: RL + '05_vecs/vecs2.rs' },
    ],
    difficulty: 2, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Which method returns `Option<&T>` instead of panicking on an out-of-bounds index?',
        options: [{ id: 'a', text: 'v[i]' }, { id: 'b', text: 'v.get(i)' }, { id: 'c', text: 'v.at(i)' }],
        correct: 'b',
        explain: '`v.get(i)` returns None for an invalid index rather than panicking, unlike the `[]` operator.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let mut v = vec![1, 2, 3];\n    for x in &mut v {\n        *x *= 2;\n    }\n    println!("{:?}", v);\n}',
        explain: 'Iterating `&mut v` yields mutable references; dereferencing writes through them in place. Output: [2, 4, 6].',
        },
        {
        type: 'multiple_choice',
        prompt: 'After `let mut v = Vec::new(); v.push(1);`, what can you rely on?',
        options: [
          { id: 'a', text: '`v.len() == 1` and capacity is at least 1 (exact capacity unspecified)' },
          { id: 'b', text: 'Capacity is exactly 1' },
          { id: 'c', text: '`v.len()` is still 0 until the vector is shrunk' },
        ],
        correct: 'a',
        explain: 'Only `len()` is contractual here. Capacity grows by allocator strategy — never assert exact values.',
        },
      ],
    },
  },
  {
    id: 'strings', chapter: 8, chapterTitle: 'Common Collections', fundamental: true,
    trpl: [{ num: '8.2', title: 'Storing UTF-8 Encoded Text with Strings', url: BOOK + 'ch08-02-strings.html' }],
    concept: 'String vs &str, UTF-8, why you can’t index a String by integer',
    prerequisites: ['vectors'],
    rbe: [],
    rustlings: [
      { name: 'strings1', url: RL + '09_strings/strings1.rs' },
      { name: 'strings2', url: RL + '09_strings/strings2.rs' },
      { name: 'strings3', url: RL + '09_strings/strings3.rs' },
      { name: 'strings4', url: RL + '09_strings/strings4.rs' },
    ],
    difficulty: 3, estMinutes: 35,
    checkpoint: {
      questions: [
        {
        type: 'explain',
        prompt: 'Why does Rust not let you index a String with `s[0]` to get the first character?',
        explain: 'Rust Strings are UTF-8 encoded, and a single character can occupy 1–4 bytes, so a byte index doesn’t reliably correspond to a character boundary.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let s = "é";\n    println!("{} {}", s.len(), s.chars().count());\n}',
        explain: 'é is one char but two bytes in UTF-8: `len()` counts bytes (2), `chars().count()` counts scalar values (1). This is exactly why byte indexing is forbidden.',
        },
        {
        type: 'find_bug',
        prompt: 'fn main() {\n    let s1 = String::from("a");\n    let s2 = "b";\n    let _s3 = s1 + s2;\n    println!("{s1}");\n}\n\nWhat fails here?',
        explain: 'E0382: `+` (the `Add` impl for String) takes `s1` by value, moving it. The final println! borrows a moved value. Bind or clone first if `s1` is still needed.',
        },
      ],
    },
  },
  {
    id: 'hashmaps', chapter: 8, chapterTitle: 'Common Collections', fundamental: false,
    trpl: [{ num: '8.3', title: 'Storing Keys with Associated Values in Hash Maps', url: BOOK + 'ch08-03-hash-maps.html' }],
    concept: 'HashMap<K, V>, entry API',
    prerequisites: ['vectors'],
    rbe: [],
    rustlings: [
      { name: 'hashmaps1', url: RL + '11_hashmaps/hashmaps1.rs' },
      { name: 'hashmaps2', url: RL + '11_hashmaps/hashmaps2.rs' },
      { name: 'hashmaps3', url: RL + '11_hashmaps/hashmaps3.rs' },
      { name: 'quiz2', url: RL + 'quizzes/quiz2.rs' },
    ],
    difficulty: 2, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'predict_output',
        prompt: 'let mut m = std::collections::HashMap::new();\n*m.entry("a").or_insert(0) += 1;\n*m.entry("a").or_insert(0) += 1;\nprintln!("{}", m["a"]);',
        explain: 'Each call increments the counter for "a" via the entry API; after two calls the value is 2.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why does `HashMap::new()` sometimes need a type annotation while `vec![1]` does not?',
        options: [
          { id: 'a', text: 'No values flow into an empty map yet, so key/value types cannot be inferred' },
          { id: 'b', text: 'HashMap is always dynamically typed' },
          { id: 'c', text: 'Annotations are required on all collections' },
        ],
        correct: 'a',
        explain: 'Inference needs evidence: `vec![1]` shows the element type, but an empty map reveals nothing until something is inserted or the annotation pins it down.',
        },
        {
        type: 'find_bug',
        prompt: 'use std::collections::HashMap;\nfn main() {\n    let mut m = HashMap::new();\n    let k = String::from("a");\n    m.insert(&k, 1);\n    drop(k);\n    println!("{}", m.len());\n}\n\nWhat fails here?',
        explain: 'E0505: the map holds a borrow of `k`, so `drop(k)` (a move) is illegal while the borrow is live. Owned keys (`m.insert(k, 1)`) avoid entangling lifetimes.',
        },
      ],
    },
  },

  // ================= Chapter 9 — Error Handling =================
  {
    id: 'panic', chapter: 9, chapterTitle: 'Error Handling', fundamental: false,
    trpl: [
      { num: '9.1', title: 'Unrecoverable Errors with panic!', url: BOOK + 'ch09-01-unrecoverable-errors-with-panic.html' },
      { num: '9.0', title: 'Error Handling (chapter overview)', url: BOOK + 'ch09-00-error-handling.html' },
    ],
    concept: 'panic!, unwinding vs. abort',
    prerequisites: ['control-flow'],
    rbe: [],
    rustlings: [],
    difficulty: 2, estMinutes: 20,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Which situation is the better fit for `panic!` rather than returning a Result?',
        options: [
          { id: 'a', text: 'A file the user asked to open does not exist' },
          { id: 'b', text: 'An internal invariant your code guarantees is violated — a genuine bug' },
          { id: 'c', text: 'Parsing user-supplied text as a number' },
        ],
        correct: 'b',
        explain: 'panic! is for bugs / broken invariants where continuing is unsafe or meaningless; expected failures should use Result.',
        },
        {
        type: 'multiple_choice',
        prompt: 'How do you assert not just that a test panics, but that it panics with a specific message?',
        options: [
          { id: 'a', text: '`#[should_panic(expected = "msg")]`' },
          { id: 'b', text: '`#[should_panic("msg")]`' },
          { id: 'c', text: 'Impossible — only the fact of panicking is observable' },
        ],
        correct: 'a',
        explain: '`expected` does substring matching against the panic payload. (b) is not valid attribute syntax.',
        },
        {
        type: 'predict_output',
        prompt: 'What happens when this runs?\n\nfn main() {\n    let v = vec![1];\n    println!("{}", v[5]);\n}',
        explain: 'Runtime panic (not a compile error): bounds are checked at runtime. Message: "index out of bounds: the len is 1 but the index is 5". This is precisely the case `v.get(5)` would have returned `None` for.',
        },
      ],
    },
  },
  {
    id: 'result', chapter: 9, chapterTitle: 'Error Handling', fundamental: true,
    trpl: [
      { num: '9.2', title: 'Recoverable Errors with Result', url: BOOK + 'ch09-02-recoverable-errors-with-result.html' },
      { num: '9.3', title: 'To panic! or Not to panic!', url: BOOK + 'ch09-03-to-panic-or-not-to-panic.html' },
    ],
    concept: 'Result<T, E>, the ? operator, propagating errors',
    prerequisites: ['panic', 'enums'],
    rbe: [
      { title: '`?` in `main`', url: RBE + 'error/result/enter_question_mark.html', type: 'REINFORCEMENT' },
      { title: 'Pulling `Result`s out of `Option`s', url: RBE + 'error/multiple_error_types/option_result.html', type: 'REINFORCEMENT' },
      { title: 'Wrapping errors', url: RBE + 'error/multiple_error_types/wrap_error.html', type: 'REINFORCEMENT' },
      { title: 'Iterating over `Result`s', url: RBE + 'error/iter_result.html', type: 'REINFORCEMENT' },
    ],
    rustlings: [
      { name: 'errors1', url: RL + '13_error_handling/errors1.rs' },
      { name: 'errors2', url: RL + '13_error_handling/errors2.rs' },
      { name: 'errors3', url: RL + '13_error_handling/errors3.rs' },
      { name: 'errors4', url: RL + '13_error_handling/errors4.rs' },
      { name: 'errors5', url: RL + '13_error_handling/errors5.rs' },
      { name: 'errors6', url: RL + '13_error_handling/errors6.rs' },
    ],
    difficulty: 3, estMinutes: 40,
    checkpoint: {
      questions: [
        {
        type: 'find_bug',
        prompt: 'fn parse_it(s: &str) -> i32 {\n    s.parse::<i32>()?\n}\n\nWhy won’t this compile?',
        explain: '`?` requires the enclosing function to return a Result (or Option); this function’s return type is plain i32, so `?` has nowhere to propagate the Err case to.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let r: Result<i32, &str> = Ok(5);\n    let out = r.map(|x| x * 2).unwrap_or(0);\n    println!("{out}");\n}',
        explain: '`map` transforms the `Ok` payload (Err would pass through untouched); `unwrap_or` extracts with a fallback. Output: 10.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why is `Result<T, E>` better than returning `-1` or `null` on failure?',
        options: [
          { id: 'a', text: 'The compiler forces callers to confront the `Err` case; sentinels can be silently ignored' },
          { id: 'b', text: 'It is faster at runtime' },
          { id: 'c', text: 'It uses less memory' },
        ],
        correct: 'a',
        explain: 'Sentinel values are a convention the compiler cannot enforce — `if (x != -1)` is forgettable. `Result` makes ignoring failure a compile-time conversation.',
        },
      ],
    },
  },

  // ================= Chapter 10 — Generics, Traits, Lifetimes =================
  {
    id: 'generics', chapter: 10, chapterTitle: 'Generic Types, Traits, and Lifetimes', fundamental: true,
    trpl: [
      { num: '10.1', title: 'Generic Data Types', url: BOOK + 'ch10-01-syntax.html' },
      { num: '10.0', title: 'Generic Types, Traits, and Lifetimes (chapter overview)', url: BOOK + 'ch10-00-generics.html' },
    ],
    concept: 'Generic functions, structs, and enums',
    prerequisites: ['structs', 'enums'],
    rbe: [],
    rustlings: [
      { name: 'generics1', url: RL + '14_generics/generics1.rs' },
      { name: 'generics2', url: RL + '14_generics/generics2.rs' },
    ],
    difficulty: 3, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'What is monomorphization?',
        options: [
          { id: 'a', text: 'Runtime dispatch through a vtable' },
          { id: 'b', text: 'The compiler generating a separate concrete version of generic code for each type used' },
          { id: 'c', text: 'Converting all types to a single universal type' },
        ],
        correct: 'b',
        explain: 'Rust generates specialized machine code per concrete instantiation at compile time, giving generics zero runtime overhead.',
        },
        {
        type: 'find_bug',
        prompt: 'fn largest<T>(list: &[T]) -> &T {\n    let mut big = &list[0];\n    for item in list {\n        if item > big {\n            big = item;\n        }\n    }\n    big\n}\nfn main() {\n    println!("{}", largest(&vec![1, 2]));\n}\n\nWhat is missing, and why does the compiler insist?',
        explain: 'E0369: `>` cannot be applied to an unconstrained `T`. Generics promise to work for ANY T, so every operation needs a declared bound: `fn largest<T: PartialOrd>(...)`. Monomorphization happens only after bounds check.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What does `collect::<Vec<_>>()` disambiguate?',
        options: [
          { id: 'a', text: 'Which container to collect into — otherwise the target type is ambiguous' },
          { id: 'b', text: 'How fast the iterator runs' },
          { id: 'c', text: 'Whether errors are propagated' },
        ],
        correct: 'a',
        explain: 'Turbofish pins down a type the compiler cannot infer. `collect()` can build dozens of containers, so an unconstrained result is a genuine ambiguity error.',
        },
      ],
    },
  },
  {
    id: 'traits', chapter: 10, chapterTitle: 'Generic Types, Traits, and Lifetimes', fundamental: true,
    trpl: [{ num: '10.2', title: 'Defining Shared Behavior with Traits', url: BOOK + 'ch10-02-traits.html' }],
    concept: 'Traits, default methods, trait bounds, impl Trait',
    prerequisites: ['generics'],
    rbe: [],
    rustlings: [
      { name: 'traits1', url: RL + '15_traits/traits1.rs' },
      { name: 'traits2', url: RL + '15_traits/traits2.rs' },
      { name: 'traits3', url: RL + '15_traits/traits3.rs' },
      { name: 'traits4', url: RL + '15_traits/traits4.rs' },
      { name: 'traits5', url: RL + '15_traits/traits5.rs' },
    ],
    difficulty: 3, estMinutes: 40,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'What does `fn notify(item: &impl Summary)` mean?',
        options: [
          { id: 'a', text: 'item is any type that implements the Summary trait' },
          { id: 'b', text: 'item must literally be of type Summary' },
          { id: 'c', text: 'Summary is optional' },
        ],
        correct: 'a',
        explain: '`impl Trait` in argument position is sugar for a generic bound — the caller can pass any concrete type implementing Summary.',
        },
        {
        type: 'find_bug',
        prompt: 'use std::fmt::Display;\nstruct A;\nimpl Display for Vec<A> {}\nfn main() {}\n\nWhy is this rejected, and what is the standard workaround?',
        explain: 'Orphan rule (E0117): neither the trait (`Display`) nor the type (`Vec<_>`) is local, so the impl could collide with someone else’s. Workaround: the newtype pattern — wrap `Vec<A>` in a local struct and implement `Display` on that.',
        },
        {
        type: 'multiple_choice',
        prompt: 'A trait declares `fn summarize(&self) -> String` WITH a body. What must implementors do?',
        options: [
          { id: 'a', text: 'Nothing — they inherit the default unless they override it' },
          { id: 'b', text: 'They must provide their own version' },
          { id: 'c', text: 'They must repeat the body with a `default` keyword' },
        ],
        correct: 'a',
        explain: 'A body in the trait declaration IS the default implementation. Override only when the default is wrong for your type.',
        },
      ],
    },
  },
  {
    id: 'lifetimes', chapter: 10, chapterTitle: 'Generic Types, Traits, and Lifetimes', fundamental: true,
    trpl: [{ num: '10.3', title: 'Validating References with Lifetimes', url: BOOK + 'ch10-03-lifetime-syntax.html' }],
    concept: 'Lifetime annotations, the borrow checker’s scope reasoning',
    prerequisites: ['borrowing', 'traits'],
    rbe: [],
    rustlings: [
      { name: 'lifetimes1', url: RL + '16_lifetimes/lifetimes1.rs' },
      { name: 'lifetimes2', url: RL + '16_lifetimes/lifetimes2.rs' },
      { name: 'lifetimes3', url: RL + '16_lifetimes/lifetimes3.rs' },
    ],
    difficulty: 4, estMinutes: 45,
    checkpoint: {
      questions: [
        {
        type: 'find_bug',
        prompt: 'Assume `longest` returns one of its inputs:\n\nfn main() {\n    let s1 = String::from("hello");\n    let r;\n    {\n        let s2 = String::from("world");\n        r = longest(&s1, &s2);\n    }\n    println!("{r}");\n}\n\nWhy won’t this compile?',
        explain: 'A returned reference can live at most as long as the shortest-lived input it was derived from — here s2. But s2 is dropped at the end of the inner block, so using `r` afterwards would dangle. The borrow checker rejects it (E0597): annotations constrain relationships, they never extend lifetimes.',
        },
        {
        type: 'find_bug',
        prompt: 'fn longest(x: &str, y: &str) -> &str {\n    if x.len() > y.len() { x } else { y }\n}\nfn main() {}\n\nWhat is missing?',
        explain: 'E0106: the return type needs a lifetime — the compiler cannot tell whether the output borrows from `x` or `y`. Fix: `fn longest<\'a>(x: &\'a str, y: &\'a str) -> &\'a str`. Annotations declare the relationship; they never extend anything.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What does `\'a` in `fn f<\'a>(x: &\'a str)` actually guarantee?',
        options: [
          { id: 'a', text: 'A constraint linking borrows: the reference is valid wherever `\'a` is alive — for both caller and body' },
          { id: 'b', text: 'That the value lives exactly `\'a` long' },
          { id: 'c', text: 'That the function extends the value’s lifetime to `\'a`' },
        ],
        correct: 'a',
        explain: 'Lifetimes constrain, never extend. The annotation says "for some region both caller and callee agree on, this borrow is good there" — the region itself is always determined by real scopes.',
        },
      ],
    },
  },

  // ================= Chapter 11 — Writing Automated Tests =================
  {
    id: 'writing-tests', chapter: 11, chapterTitle: 'Writing Automated Tests', fundamental: false,
    trpl: [
      { num: '11.1', title: 'How to Write Tests', url: BOOK + 'ch11-01-writing-tests.html' },
      { num: '11.2', title: 'Controlling How Tests Are Run', url: BOOK + 'ch11-02-running-tests.html' },
      { num: '11.0', title: 'Writing Automated Tests (chapter overview)', url: BOOK + 'ch11-00-testing.html' },
    ],
    concept: '#[test], assert! / assert_eq!, #[should_panic]',
    prerequisites: ['functions'],
    rbe: [
      { title: 'Development dependencies', url: RBE + 'testing/dev_dependencies.html', type: 'REINFORCEMENT' },
    ],
    rustlings: [
      { name: 'tests1', url: RL + '17_tests/tests1.rs' },
      { name: 'tests2', url: RL + '17_tests/tests2.rs' },
      { name: 'tests3', url: RL + '17_tests/tests3.rs' },
    ],
    difficulty: 2, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Which attribute marks a function as a unit test the harness should run?',
        options: [{ id: 'a', text: '#[run]' }, { id: 'b', text: '#[test]' }, { id: 'c', text: '#[unit_test]' }],
        correct: 'b',
        explain: '`#[test]` is the attribute `cargo test` looks for.',
        },
        {
        type: 'multiple_choice',
        prompt: 'A bare `assert!(rect.can_hold(&other))` fails. What does the output show?',
        options: [
          { id: 'a', text: 'The source expression text plus file and line' },
          { id: 'b', text: 'The debug values of `rect` and `other`' },
          { id: 'c', text: 'Nothing — bare assert! is silent' },
        ],
        correct: 'a',
        explain: 'Plain `assert!` prints only the expression and location. Value inspection needs `assert_eq!`/`assert_ne!`, which is exactly why the book prefers them.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Where do unit tests conventionally live?',
        options: [
          { id: 'a', text: 'In the same file, inside `#[cfg(test)] mod tests`' },
          { id: 'b', text: 'In the top-level `tests/` directory' },
          { id: 'c', text: 'In `benches/`' },
        ],
        correct: 'a',
        explain: '`tests/` is for integration tests (separate crates). Unit tests sit beside the code they test, compiled out of normal builds by `cfg(test)`.',
        },
      ],
    },
  },
  {
    id: 'test-org', chapter: 11, chapterTitle: 'Writing Automated Tests', fundamental: false,
    trpl: [{ num: '11.3', title: 'Test Organization', url: BOOK + 'ch11-03-test-organization.html' }],
    concept: 'Unit tests vs. integration tests (tests/ directory)',
    prerequisites: ['writing-tests'],
    rbe: [],
    rustlings: [],
    difficulty: 2, estMinutes: 15,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Integration tests in the tests/ directory can access:',
        options: [
          { id: 'a', text: 'Any private item in the crate' },
          { id: 'b', text: 'Only the crate’s public API, as an external user would' },
          { id: 'c', text: 'Private items, as long as they are marked `pub(crate)`' },
        ],
        correct: 'b',
        explain: 'Each file in tests/ is compiled as its own separate crate that depends on your library, so it only sees what’s public.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What does `#[cfg(test)]` on `mod tests` actually do?',
        options: [
          { id: 'a', text: 'Compiles the module only under `cargo test`, excluding it from normal builds' },
          { id: 'b', text: 'Marks every test inside as ignored' },
          { id: 'c', text: 'Nothing — it is pure convention' },
        ],
        correct: 'a',
        explain: '`cfg(test)` is conditional compilation keyed on the test profile: release/debug binaries never contain the module at all.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Two integration test files need one shared helper. Where does it go?',
        options: [
          { id: 'a', text: '`tests/common/mod.rs`, pulled in with `mod common;` in each file' },
          { id: 'b', text: '`src/helpers.rs`' },
          { id: 'c', text: 'Duplicated at the top of each test file' },
        ],
        correct: 'a',
        explain: 'Files directly under `tests/` each become their own crate; only subdirectories like `common/` are exempt, so shared helpers live there as a module.',
        },
      ],
    },
  },

  // ================= Chapter 12 — I/O Project =================
  {
    id: 'io-project', chapter: 12, chapterTitle: 'An I/O Project: Building a Command Line Program', fundamental: false, integrative: true,
    trpl: [
      { num: '12', title: 'An I/O Project: minigrep', url: BOOK + 'ch12-00-an-io-project.html' },
      { num: '12.1', title: 'Accepting Command Line Arguments', url: BOOK + 'ch12-01-accepting-command-line-arguments.html' },
      { num: '12.2', title: 'Reading a File', url: BOOK + 'ch12-02-reading-a-file.html' },
      { num: '12.3', title: 'Refactoring to Improve Modularity and Error Handling', url: BOOK + 'ch12-03-improving-error-handling-and-modularity.html' },
      { num: '12.4', title: 'Adding Functionality with Test Driven Development', url: BOOK + 'ch12-04-testing-the-librarys-functionality.html' },
      { num: '12.5', title: 'Working with Environment Variables', url: BOOK + 'ch12-05-working-with-environment-variables.html' },
      { num: '12.6', title: 'Redirecting Errors to Standard Error', url: BOOK + 'ch12-06-writing-to-stderr-instead-of-stdout.html' },
    ],
    concept: 'Building a small CLI tool (integrative project)',
    prerequisites: ['result', 'vectors', 'strings'],
    rbe: [
      { title: 'Program arguments', url: RBE + 'std_misc/arg.html', type: 'REINFORCEMENT' },
      { title: 'Argument parsing', url: RBE + 'std_misc/arg/matching.html', type: 'REINFORCEMENT' },
      { title: 'File I/O', url: RBE + 'std_misc/file.html', type: 'REINFORCEMENT' },
      { title: '`open`', url: RBE + 'std_misc/file/open.html', type: 'REINFORCEMENT' },
      { title: '`create`', url: RBE + 'std_misc/file/create.html', type: 'REINFORCEMENT' },
      { title: '`read_lines`', url: RBE + 'std_misc/file/read_lines.html', type: 'REINFORCEMENT' },
      { title: 'Filesystem Operations', url: RBE + 'std_misc/fs.html', type: 'REINFORCEMENT' },
      { title: 'Path', url: RBE + 'std_misc/path.html', type: 'REINFORCEMENT' },
      { title: 'Child processes', url: RBE + 'std_misc/process.html', type: 'REINFORCEMENT' },
      { title: 'Pipes', url: RBE + 'std_misc/process/pipe.html', type: 'REINFORCEMENT' },
      { title: 'Wait', url: RBE + 'std_misc/process/wait.html', type: 'REINFORCEMENT' },
    ],
    rustlings: [],
    difficulty: 3, estMinutes: 60,
    checkpoint: {
      questions: [
        {
        type: 'explain',
        prompt: 'Project Acceptance Checklist — verify your minigrep build in your terminal:\n\n1. [ ] Extracted CLI parsing & file-reading out of main.rs into src/lib.rs.\n2. [ ] Handled errors with Result<(), Box<dyn Error>> rather than unwrap/panic.\n3. [ ] Implemented case-sensitive and case-insensitive search via environment variable.\n4. [ ] Automated test suite in src/lib.rs passes cleanly (`cargo test`).\n\nHave you verified all 4 criteria in your local working project?',
        explain: 'Congratulations! Minigrep proves you can coordinate Result error propagation, argument parsing, file I/O, and test-driven development into a clean, modular CLI tool.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why does minigrep’s `run()` return `Result<(), Box<dyn Error>>` instead of `()`?',
        options: [
          { id: 'a', text: 'So `?` can propagate any error type up to `main`, which prints it and exits nonzero' },
          { id: 'b', text: 'To make the binary run faster' },
          { id: 'c', text: 'The borrow checker requires it' },
        ],
        correct: 'a',
        explain: 'One error type for the whole program is impractical; `Box<dyn Error>` erases the concrete type while `?` keeps propagation uniform. `main` returning `Result` turns Err into a message plus a nonzero exit.',
        },
        {
        type: 'multiple_choice',
        prompt: '`eprintln!` vs `println!` — when must errors go to stderr?',
        options: [
          { id: 'a', text: 'Always for errors, so `program > out.txt` still shows them on screen' },
          { id: 'b', text: 'Never — both streams are identical' },
          { id: 'c', text: 'Only inside unit tests' },
        ],
        correct: 'a',
        explain: 'Chapter 12.6’s whole point: stdout is for program output (redirectable), stderr for diagnostics. Mixing them corrupts redirected output.',
        },
      ],
    },
  },

  // ================= Chapter 13 — Closures and Iterators =================
  {
    id: 'closures', chapter: 13, chapterTitle: 'Functional Language Features: Iterators and Closures', fundamental: true,
    trpl: [
      { num: '13.1', title: 'Closures', url: BOOK + 'ch13-01-closures.html' },
      { num: '13.0', title: 'Functional Language Features (chapter overview)', url: BOOK + 'ch13-00-functional-features.html' },
    ],
    concept: 'Closures, capturing environment, Fn/FnMut/FnOnce',
    prerequisites: ['functions', 'ownership'],
    rbe: [],
    rustlings: [],
    practice: [
      { id: 'sort-by-key', text: 'Sort vec![3, 1, 2] with sort_by_key and a closure, then rewrite the key as a named fn — note what changes at the call site.' },
      { id: 'move-to-thread', text: 'Capture s: String by reference in a closure, pass it to thread::spawn, read the compiler error, then fix it with move.' },
      { id: 'fnonce-once', text: 'Write fn apply<F: FnOnce() -> i32>(f: F) -> i32, call it with a closure that moves a String in, then try calling that closure twice.' },
    ],
    difficulty: 3, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'predict_output',
        prompt: 'let x = 4;\nlet equal_to_x = |z| z == x;\nprintln!("{}", equal_to_x(4));',
        explain: 'The closure borrows x from its environment immutably. equal_to_x(4) compares 4 == 4 → true.',
        },
        {
        type: 'find_bug',
        prompt: 'fn main() {\n    let s = String::from("hi");\n    let f = || {\n        println!("{s}");\n        drop(s);\n    };\n    f();\n    f();\n}\n\nWhy does the second call fail?',
        explain: 'E0382: `drop(s)` forces the closure to capture `s` by move, so the closure is `FnOnce` — the first call consumes `f` itself, and the second call uses a moved value.',
        },
        {
        type: 'multiple_choice',
        prompt: 'A closure moves a String out of its environment (e.g. returns it). Which bound must a generic consumer require at minimum?',
        options: [
          { id: 'a', text: '`FnOnce`' },
          { id: 'b', text: '`Fn`' },
          { id: 'c', text: '`FnMut`' },
        ],
        correct: 'a',
        explain: '`FnOnce` = callable at least once (may move captures out). `FnMut`/`Fn` promise repeatable calls, which a moving closure cannot honor.',
        },
      ],
    },
  },
  {
    id: 'iterators', chapter: 13, chapterTitle: 'Functional Language Features: Iterators and Closures', fundamental: true,
    trpl: [
      { num: '13.2', title: 'Processing a Series of Items with Iterators', url: BOOK + 'ch13-02-iterators.html' },
      { num: '13.3', title: 'Improving Our I/O Project', url: BOOK + 'ch13-03-improving-our-io-project.html' },
      { num: '13.4', title: 'Performance in Loops vs. Iterators', url: BOOK + 'ch13-04-performance.html' },
    ],
    concept: 'The Iterator trait, .map/.filter/.collect, lazy evaluation',
    prerequisites: ['closures', 'generics', 'vectors'],
    rbe: [],
    rustlings: [
      { name: 'iterators1', url: RL + '18_iterators/iterators1.rs' },
      { name: 'iterators2', url: RL + '18_iterators/iterators2.rs' },
      { name: 'iterators3', url: RL + '18_iterators/iterators3.rs' },
      { name: 'iterators4', url: RL + '18_iterators/iterators4.rs' },
      { name: 'iterators5', url: RL + '18_iterators/iterators5.rs' },
      { name: 'quiz3', url: RL + 'quizzes/quiz3.rs' },
    ],
    difficulty: 3, estMinutes: 40,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'let v = vec![1, 2, 3];\nlet doubled = v.iter().map(|x| x * 2);\n\nHas any multiplication happened yet at this line?',
        options: [
          { id: 'a', text: 'Yes, doubled is now [2, 4, 6]' },
          { id: 'b', text: 'No — map is lazy; nothing runs until doubled is consumed' },
          { id: 'c', text: 'Yes, but only for the first element' },
        ],
        correct: 'b',
        explain: 'Iterator adaptors build up a lazy pipeline; closures only run when something actively consumes the iterator.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let v = vec![1, 2, 3];\n    let total: i32 = v.iter().map(|x| x * 2).sum();\n    println!("{total}");\n}',
        explain: '`sum()` is the consuming adaptor that finally drives the lazy pipeline: (1+2+3)*2 = 12. Without it, nothing would execute at all.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why does `let it = v.iter();` borrow `v` for as long as `it` is alive?',
        options: [
          { id: 'a', text: 'The iterator holds a reference into the collection to yield items from it' },
          { id: 'b', text: 'Iterators copy the whole collection' },
          { id: 'c', text: 'It is a compiler workaround with no meaning' },
        ],
        correct: 'a',
        explain: 'An iterator over `&T` borrows its source — that is why mutating or dropping the collection while iterating is rejected. Ownership and laziness compose.',
        },
      ],
    },
  },

  // ================= Chapter 14 — More About Cargo =================
  {
    id: 'cargo-advanced', chapter: 14, chapterTitle: 'More about Cargo and Crates.io', fundamental: false, integrative: true,
    trpl: [
      { num: '14', title: 'More about Cargo and Crates.io', url: BOOK + 'ch14-00-more-about-cargo.html' },
      { num: '14.1', title: 'Customizing Builds with Release Profiles', url: BOOK + 'ch14-01-release-profiles.html' },
      { num: '14.2', title: 'Publishing a Crate to Crates.io', url: BOOK + 'ch14-02-publishing-to-crates-io.html' },
      { num: '14.3', title: 'Cargo Workspaces', url: BOOK + 'ch14-03-cargo-workspaces.html' },
      { num: '14.4', title: 'Installing Binaries with cargo install', url: BOOK + 'ch14-04-installing-binaries.html' },
      { num: '14.5', title: 'Extending Cargo with Custom Commands', url: BOOK + 'ch14-05-extending-cargo.html' },
    ],
    concept: 'Release profiles, publishing, workspaces',
    prerequisites: ['packages-crates'],
    rbe: [],
    rustlings: [],
    difficulty: 2, estMinutes: 40,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Which profile does `cargo build --release` use, and why does it matter for benchmarking?',
        options: [
          { id: 'a', text: 'dev profile — same speed as debug' },
          { id: 'b', text: 'release profile — enables optimizations, much faster runtime' },
          { id: 'c', text: 'test profile — optimized for test binaries' },
        ],
        correct: 'b',
        explain: 'The release profile enables optimizations; debug builds are unoptimized and can run significantly slower.',
        },
        {
        type: 'multiple_choice',
        prompt: 'In a Cargo workspace, where does the single shared Cargo.lock live?',
        options: [
          { id: 'a', text: 'In the workspace root' },
          { id: 'b', text: 'In each member package separately' },
          { id: 'c', text: 'In `~/.cargo`' },
        ],
        correct: 'a',
        explain: 'One workspace, one lockfile at the root: all members resolve dependencies together, which is the entire point of the workspace.',
        },
        {
        type: 'multiple_choice',
        prompt: '`cargo install ripgrep` — where does the binary go, and what does it need?',
        options: [
          { id: 'a', text: 'Into `~/.cargo/bin`, built from the registry — no source checkout needed' },
          { id: 'b', text: 'Into the current directory' },
          { id: 'c', text: 'Always into `/usr/local/bin`' },
        ],
        correct: 'a',
        explain: '`cargo install` fetches, builds, and drops the binary into `~/.cargo/bin` (put it on PATH). Contrast with `cargo build`, which works on local sources.',
        },
      ],
    },
  },

  // ================= Chapter 15 — Smart Pointers =================
  {
    id: 'box', chapter: 15, chapterTitle: 'Smart Pointers', fundamental: true,
    trpl: [
      { num: '15.1', title: 'Using Box<T> to Point to Data on the Heap', url: BOOK + 'ch15-01-box.html' },
      { num: '15.0', title: 'Smart Pointers (chapter overview)', url: BOOK + 'ch15-00-smart-pointers.html' },
    ],
    concept: 'Box<T>: heap allocation, recursive types',
    prerequisites: ['ownership'],
    rbe: [],
    rustlings: [{ name: 'box1', url: RL + '19_smart_pointers/box1.rs' }],
    difficulty: 3, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'explain',
        prompt: 'Why does a directly self-referential enum like `enum List { Cons(i32, List), Nil }` fail to compile without Box?',
        explain: 'Rust needs to compute type size at compile time. A directly recursive type would have infinite size. Box<List> is a fixed-size pointer on the stack pointing to heap memory.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nenum List {\n    Cons(i32, Box<List>),\n    Nil,\n}\nfn main() {\n    let l = List::Cons(1, Box::new(List::Nil));\n    if let List::Cons(x, _) = l {\n        println!("{x}");\n    }\n}',
        explain: 'Pattern matching sees through the Box: `x` binds the head 1. Output: "1". The Box only fixed the type’s size, nothing about usage changes.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why is `Box<T>` itself always `Sized`, even when `T` is not?',
        options: [
          { id: 'a', text: 'It is a pointer with a known size (`usize`), regardless of the pointee' },
          { id: 'b', text: 'Box forces `T: Sized`' },
          { id: 'c', text: 'The compiler special-cases every Box type' },
        ],
        correct: 'a',
        explain: 'Indirection is the whole trick: the stack holds a fixed-size address while the arbitrarily-sized data lives on the heap.',
        },
      ],
    },
  },
  {
    id: 'deref-drop', chapter: 15, chapterTitle: 'Smart Pointers', fundamental: false,
    trpl: [
      { num: '15.2', title: 'Treating Smart Pointers Like Regular References', url: BOOK + 'ch15-02-deref.html' },
      { num: '15.3', title: 'Running Code on Cleanup with the Drop Trait', url: BOOK + 'ch15-03-drop.html' },
    ],
    concept: 'Deref/DerefMut coercion, the Drop trait',
    prerequisites: ['box', 'traits'],
    rbe: [],
    rustlings: [],
    difficulty: 3, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'What triggers a value’s Drop::drop to run?',
        options: [
          { id: 'a', text: 'Calling value.drop() directly' },
          { id: 'b', text: 'The value going out of scope' },
          { id: 'c', text: 'The garbage collector running' },
        ],
        correct: 'b',
        explain: 'Rust runs Drop deterministically when a value exits scope. Directly calling .drop() is disallowed by the compiler.',
        },
        {
        type: 'find_bug',
        prompt: 'fn main() {\n    let s = String::from("hi");\n    s.drop();\n    println!("{s}");\n}\n\nWhy is the `s.drop()` line rejected?',
        explain: 'E0599: there IS no `.drop()` method — destruction is not something you call. Either let the value go out of scope, or force it early with `std::mem::drop(s)`.',
        },
        {
        type: 'multiple_choice',
        prompt: '`&String` passed where `&str` is expected just works. Why?',
        options: [
          { id: 'a', text: 'Deref coercion: `String: Deref<Target = str>`, applied automatically at coercion sites' },
          { id: 'b', text: '`String` and `&str` are the same type' },
          { id: 'c', text: 'The compiler inserts a clone' },
        ],
        correct: 'a',
        explain: 'Deref coercion rewrites `&String` → `&str` (and `&Vec<T>` → `&[T]`) wherever a reference of the target type is expected. No clone, no cost.',
        },
      ],
    },
  },
  {
    id: 'rc', chapter: 15, chapterTitle: 'Smart Pointers', fundamental: true,
    trpl: [{ num: '15.4', title: 'Rc<T>, the Reference Counted Smart Pointer', url: BOOK + 'ch15-04-rc.html' }],
    concept: 'Rc<T>: shared ownership within a single thread',
    prerequisites: ['box'],
    rbe: [],
    rustlings: [
      { name: 'rc1', url: RL + '19_smart_pointers/rc1.rs' },
      { name: 'arc1', url: RL + '19_smart_pointers/arc1.rs' },
      { name: 'cow1', url: RL + '19_smart_pointers/cow1.rs' },
    ],
    difficulty: 3, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'What does `Rc::clone(&a)` actually copy?',
        options: [
          { id: 'a', text: 'The underlying heap data' },
          { id: 'b', text: 'Nothing — it just increments the reference count and returns a new pointer handle' },
          { id: 'c', text: 'The heap data, but lazily on first write (copy-on-write)' },
        ],
        correct: 'b',
        explain: 'Rc::clone is an inexpensive pointer duplicate with a reference count increment; data on the heap is not cloned.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nuse std::rc::Rc;\nfn main() {\n    let a = Rc::new(5);\n    let _b = Rc::clone(&a);\n    println!("{}", Rc::strong_count(&a));\n}',
        explain: 'Each `Rc::clone` bumps the strong count: `a` plus `_b` makes 2. Cloning the pointer never touches the heap data.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why can’t you get `&mut` to `Rc`-shared data directly?',
        options: [
          { id: 'a', text: 'Mutation through one owner would silently invalidate what other owners see — use `RefCell`/`Mutex` for checked sharing' },
          { id: 'b', text: 'Rc data lives in hardware read-only memory' },
          { id: 'c', text: 'You always can — `Rc::get_mut` never fails' },
        ],
        correct: 'a',
        explain: 'Shared ownership plus direct mutation equals aliasing violations. `Rc::get_mut` exists but succeeds only when uniquely owned — the exception proving the rule.',
        },
        {
        type: 'multiple_choice',
        prompt: '`Cow::from(&vec)` borrows; `abs_all` finds nothing to mutate. What is `input` afterwards?',
        options: [
          { id: 'a', text: '`Cow::Owned` — wrapping always clones eagerly' },
          { id: 'b', text: '`Cow::Borrowed` — no mutation means no clone ever happens' },
          { id: 'c', text: 'Neither — `Cow` drops back to a plain reference' },
        ],
        correct: 'b',
        explain: 'Clone-on-Write clones lazily: `to_mut()` is the only trigger. With all values already absolute, `abs_all` never calls it, so the `Cow` stays borrowed — exactly what `reference_no_mutation` in `cow1` asserts.',
        },
      ],
    },
  },
  {
    id: 'refcell', chapter: 15, chapterTitle: 'Smart Pointers', fundamental: false,
    trpl: [
      { num: '15.5', title: 'RefCell<T> and the Interior Mutability Pattern', url: BOOK + 'ch15-05-interior-mutability.html' },
      { num: '15.6', title: 'Reference Cycles Can Leak Memory', url: BOOK + 'ch15-06-reference-cycles.html' },
    ],
    concept: 'RefCell<T> (interior mutability), Rc<RefCell<T>>, Weak<T>',
    prerequisites: ['rc'],
    rbe: [],
    rustlings: [],
    difficulty: 4, estMinutes: 35,
    checkpoint: {
      questions: [
        {
        type: 'explain',
        prompt: 'What happens if you call `.borrow_mut()` twice simultaneously on the same RefCell<T>?',
        explain: 'RefCell enforces the aliasing rule at runtime — a second overlapping mutable borrow panics rather than failing compile-time checks.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nuse std::cell::RefCell;\nfn main() {\n    let x = RefCell::new(5);\n    *x.borrow_mut() += 1;\n    println!("{}", x.borrow());\n}',
        explain: 'Single-threaded runtime checks pass here: the mutable borrow ends before `borrow()` runs. Output: 6. Overlap them and it panics instead.',
        },
        {
        type: 'multiple_choice',
        prompt: '`RefCell<T>` vs `Mutex<T>` — when is `RefCell` the right choice?',
        options: [
          { id: 'a', text: 'Single-threaded interior mutability with zero synchronization overhead' },
          { id: 'b', text: 'Sharing data across threads' },
          { id: 'c', text: 'Always — `Mutex` is legacy' },
        ],
        correct: 'a',
        explain: '`RefCell` is explicitly `!Sync`: the same runtime-checked pattern, but without any lock. Across threads you need `Mutex` (or atomics).',
        },
      ],
    },
  },

  // ================= Chapter 16 — Fearless Concurrency =================
  {
    id: 'threads', chapter: 16, chapterTitle: 'Fearless Concurrency', fundamental: true,
    trpl: [
      { num: '16.1', title: 'Using Threads to Run Code Simultaneously', url: BOOK + 'ch16-01-threads.html' },
      { num: '16.0', title: 'Fearless Concurrency (chapter overview)', url: BOOK + 'ch16-00-concurrency.html' },
    ],
    concept: 'thread::spawn, JoinHandle, move closures',
    prerequisites: ['closures'],
    rbe: [],
    rustlings: [
      { name: 'threads1', url: RL + '20_threads/threads1.rs' },
      { name: 'threads2', url: RL + '20_threads/threads2.rs' },
    ],
    difficulty: 3, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Why does thread::spawn typically require a `move` closure?',
        options: [
          { id: 'a', text: 'It is required syntax with no deeper meaning' },
          { id: 'b', text: 'The spawned thread may outlive the caller stack frame, so it requires owned data' },
          { id: 'c', text: 'To make the closure run faster on multiple cores' },
        ],
        correct: 'b',
        explain: 'The compiler cannot guarantee that borrowed stack references remain valid for the lifespan of the spawned thread.',
        },
        {
        type: 'find_bug',
        prompt: 'use std::thread;\nfn main() {\n    let v = vec![1, 2, 3];\n    let h = thread::spawn(|| {\n        println!("{:?}", v);\n    });\n    h.join().unwrap();\n}\n\nEven with `join` right there, why is this rejected?',
        explain: 'E0373: `spawn` demands a `\'static` closure, and borrowing `v` cannot satisfy it — the type system cannot see your `join`. Fix: `move` the data in (`move ||`, cloning or `Arc` as needed).',
        },
        {
        type: 'multiple_choice',
        prompt: 'If `main` returns without joining a spawned thread, what happens to it?',
        options: [
          { id: 'a', text: 'It is forcibly stopped when `main` exits' },
          { id: 'b', text: 'It keeps running after `main` exits' },
          { id: 'c', text: 'It blocks `main` from exiting' },
        ],
        correct: 'a',
        explain: 'Threads are not joined implicitly: process exit kills them mid-flight, silently dropping work. Always `join` handles you care about.',
        },
      ],
    },
  },
  {
    id: 'message-passing', chapter: 16, chapterTitle: 'Fearless Concurrency', fundamental: true,
    trpl: [{ num: '16.2', title: 'Transfer Data Between Threads with Message Passing', url: BOOK + 'ch16-02-message-passing.html' }],
    concept: 'mpsc channels: Sender/Receiver',
    prerequisites: ['threads'],
    rbe: [],
    rustlings: [{ name: 'threads3', url: RL + '20_threads/threads3.rs' }],
    difficulty: 3, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: '"mpsc" stands for:',
        options: [
          { id: 'a', text: 'multiple producer, single consumer' },
          { id: 'b', text: 'multi-process synchronous channel' },
          { id: 'c', text: 'mutex-protected shared cache' },
        ],
        correct: 'a',
        explain: 'std::sync::mpsc provides channels with multiple transmitter handles and a single receiver handle.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nuse std::sync::mpsc;\nfn main() {\n    let (tx, rx) = mpsc::channel();\n    tx.send(10).unwrap();\n    tx.send(20).unwrap();\n    drop(tx);\n    let mut total = 0;\n    for x in rx {\n        total += x;\n    }\n    println!("{total}");\n}',
        explain: 'Iterating the receiver yields messages until ALL senders are gone — hence the deliberate `drop(tx)`. 10 + 20 = 30. Forget the drop and the loop hangs forever.',
        },
        {
        type: 'multiple_choice',
        prompt: '“Do not communicate by sharing memory; share memory by communicating.” What does it mean in practice?',
        options: [
          { id: 'a', text: 'Transfer ownership through the channel — the channel owns in-flight data, no joint mutable state' },
          { id: 'b', text: 'Shared memory is always slower' },
          { id: 'c', text: '`Mutex` is deprecated' },
        ],
        correct: 'a',
        explain: 'Sending `T` through a channel MOVES it: exactly one owner at every moment. The slogan is ownership applied to concurrency.',
        },
      ],
    },
  },
  {
    id: 'shared-state', chapter: 16, chapterTitle: 'Fearless Concurrency', fundamental: true,
    trpl: [
      { num: '16.3', title: 'Shared-State Concurrency', url: BOOK + 'ch16-03-shared-state.html' },
      { num: '16.4', title: 'Extensible Concurrency with Send and Sync', url: BOOK + 'ch16-04-extensible-concurrency-sync-and-send.html' },
    ],
    concept: 'Mutex<T>, Arc<T>, Send and Sync marker traits',
    prerequisites: ['threads', 'rc'],
    rbe: [],
    rustlings: [{ name: 'threads2', url: RL + '20_threads/threads2.rs' }],
    difficulty: 4, estMinutes: 35,
    checkpoint: {
      questions: [
        {
        type: 'find_bug',
        prompt: 'use std::{rc::Rc, sync::Mutex, thread};\n\nlet counter = Rc::new(Mutex::new(0));\nlet mut handles = vec![];\nfor _ in 0..4 {\n    let c = Rc::clone(&counter);\n    handles.push(thread::spawn(move || {\n        *c.lock().unwrap() += 1;\n    }));\n}\n\nWhy won’t this compile, and what single type swap fixes it?',
        explain: 'Rc<T> is not Send — its reference count uses non-atomic operations, so the compiler forbids moving it into a thread (E0277). Swap Rc for Arc: Arc<Mutex<i32>> counts atomically and is both Send and Sync.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nuse std::sync::Mutex;\nfn main() {\n    let m = Mutex::new(5);\n    *m.lock().unwrap() += 1;\n    println!("{}", m.into_inner().unwrap());\n}',
        explain: '`lock()` yields a guard dereferencing to the inner value; `into_inner` consumes the mutex to reclaim it. Output: 6. (The `unwrap`s cover poisoning — a panicked-while-locked thread.)',
        },
        {
        type: 'multiple_choice',
        prompt: '`Mutex<T>` vs `RefCell<T>` — what is the fundamental difference?',
        options: [
          { id: 'a', text: '`Mutex` is `Sync`: thread-safe interior mutability via locking; `RefCell` is single-threaded runtime checks' },
          { id: 'b', text: '`Mutex` is faster' },
          { id: 'c', text: 'There is none' },
        ],
        correct: 'a',
        explain: 'Same idea (checked shared mutation), different domains: `RefCell` panics on misuse in one thread, `Mutex` blocks across threads. Pick by `Sync`, not habit.',
        },
      ],
    },
  },

  // ================= Chapter 17 — Async =================
  {
    id: 'async-futures', chapter: 17, chapterTitle: 'Fundamentals of Asynchronous Programming', fundamental: true,
    trpl: [
      { num: '17.1', title: 'Futures and the Async Syntax', url: BOOK + 'ch17-01-futures-and-syntax.html' },
      { num: '17.0', title: 'Fundamentals of Asynchronous Programming (chapter overview)', url: BOOK + 'ch17-00-async-await.html' },
    ],
    concept: 'async fn, .await, Future trait',
    prerequisites: ['closures', 'traits'],
    rbe: [],
    rustlings: [
      { name: 'async1', url: RL + '24_async/async1.rs' },
    ],
    difficulty: 4, estMinutes: 35,
    checkpoint: {
      questions: [
        {
        type: 'predict_output',
        prompt: 'let f = async {\n    println!("running");\n    42\n};\nprintln!("created");\n\nWhat prints, and what exactly is `f` at this point?',
        explain: 'Only "created" prints. The async block body never runs until the future is polled — `f` is just an inert state machine waiting for .await or an executor. "running" appears only after something drives it to completion.',
        },
        {
        type: 'multiple_choice',
        prompt: 'An `async fn fetch() -> Data` — what is its ACTUAL return type before anyone awaits it?',
        options: [
          { id: 'a', text: '`impl Future<Output = Data>` — an inert state machine' },
          { id: 'b', text: '`Data`' },
          { id: 'c', text: '`Result<Data>`' },
        ],
        correct: 'a',
        explain: '`async fn` desugars to a regular function returning a future. No executor polling it means no body runs — the Q1 laziness demo is this fact in action.',
        },
        {
        type: 'multiple_choice',
        prompt: '`.await` on an already-complete future — what happens?',
        options: [
          { id: 'a', text: 'It resolves immediately without yielding control' },
          { id: 'b', text: 'It always yields to the executor first' },
          { id: 'c', text: 'It panics' },
        ],
        correct: 'a',
        explain: '`.await` is not a thread switch: a ready future completes inline. Yielding happens only when the future is genuinely pending.',
        },
      ],
    },
  },
  {
    id: 'async-concurrency', chapter: 17, chapterTitle: 'Fundamentals of Asynchronous Programming', fundamental: false,
    trpl: [
      { num: '17.2', title: 'Applying Concurrency with Async', url: BOOK + 'ch17-02-concurrency-with-async.html' },
      { num: '17.3', title: 'Working With Any Number of Futures', url: BOOK + 'ch17-03-more-futures.html' },
      { num: '17.4', title: 'Streams: Futures in Sequence', url: BOOK + 'ch17-04-streams.html' },
      { num: '17.5', title: 'A Closer Look at the Traits for Async', url: BOOK + 'ch17-05-traits-for-async.html' },
      { num: '17.6', title: 'Futures, Tasks, and Threads', url: BOOK + 'ch17-06-futures-tasks-threads.html' },
    ],
    concept: 'join, race, Streams as async iterators',
    prerequisites: ['async-futures', 'threads'],
    rbe: [],
    rustlings: [],
    difficulty: 4, estMinutes: 40,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Does `async`/`.await` inherently guarantee code executes on a separate OS thread?',
        options: [
          { id: 'a', text: 'Yes, always' },
          { id: 'b', text: 'No — thread allocation is determined by the underlying executor runtime' },
          { id: 'c', text: 'Yes, but only when using tokio' },
        ],
        correct: 'b',
        explain: 'Async is cooperative multitasking; whether tasks run across thread pools or on a single thread depends on the runtime configuration.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Two tasks `.await`ing the same sleep sequentially vs `tokio::join!` on both — what differs?',
        options: [
          { id: 'a', text: '`join!` polls both concurrently, interleaving progress; sequential await runs the first to completion before starting the second' },
          { id: 'b', text: 'Nothing — they are equivalent spellings' },
          { id: 'c', text: '`join!` spawns OS threads' },
        ],
        correct: 'a',
        explain: 'Concurrency in async means interleaved polling on (possibly) one thread, and only combinators like `join!` create the interleaving. Sequential awaits never overlap.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What does `Send` have to do with async code?',
        options: [
          { id: 'a', text: 'Futures moved across threads (e.g. spawned on a multi-thread executor) must be `Send` — holding `Rc` across `.await` breaks it' },
          { id: 'b', text: 'Nothing at all' },
          { id: 'c', text: 'Every future is automatically `Send`' },
        ],
        correct: 'a',
        explain: 'The classic compile wall: an `Rc` held across an await point makes the whole future `!Send`, and `spawn` refuses it. Same ownership rules, new context.',
        },
      ],
    },
  },

  // ================= Chapter 18 — OOP Features =================
  {
    id: 'oo-characteristics', chapter: 18, chapterTitle: 'Object Oriented Programming Features', fundamental: false,
    trpl: [
      { num: '18.1', title: 'Characteristics of Object-Oriented Languages', url: BOOK + 'ch18-01-what-is-oo.html' },
      { num: '18.0', title: 'Object Oriented Programming Features (chapter overview)', url: BOOK + 'ch18-00-oop.html' },
    ],
    concept: 'Encapsulation and composition in Rust (no classical inheritance)',
    prerequisites: ['traits'],
    rbe: [],
    rustlings: [],
    difficulty: 2, estMinutes: 15,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Does Rust support classical struct-to-struct inheritance?',
        options: [
          { id: 'a', text: 'Yes, via the `impl` keyword' },
          { id: 'b', text: 'No — Rust uses traits and composition instead' },
          { id: 'c', text: 'Yes, through default trait methods' },
        ],
        correct: 'b',
        explain: 'Rust omits type inheritance; shared behaviors are structured via traits and shared state via composition.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Rust “objects” (trait objects) vs OOP objects — what is deliberately missing?',
        options: [
          { id: 'a', text: 'Inheritance of state and behavior' },
          { id: 'b', text: 'Encapsulation' },
          { id: 'c', text: 'Polymorphism' },
        ],
        correct: 'a',
        explain: 'Rust has encapsulation (modules) and polymorphism (generics + trait objects) but no implementation inheritance — reuse comes from traits and composition.',
        },
        {
        type: 'multiple_choice',
        prompt: 'When is `dyn Trait` preferable to generics (`impl Trait`)?',
        options: [
          { id: 'a', text: 'Heterogeneous collections, or curbing binary bloat from monomorphization — at the price of dynamic dispatch' },
          { id: 'b', text: 'Always — generics are legacy' },
          { id: 'c', text: 'Never' },
        ],
        correct: 'a',
        explain: 'Generics stamp a copy per type (fast, fat); trait objects share one code path through a vtable (compact, indirect). Different bills to pay.',
        },
      ],
    },
  },
  {
    id: 'trait-objects', chapter: 18, chapterTitle: 'Object Oriented Programming Features', fundamental: true,
    trpl: [
      { num: '18.2', title: 'Using Trait Objects to Abstract over Shared Behavior', url: BOOK + 'ch18-02-trait-objects.html' },
      { num: '18.3', title: 'Implementing an Object-Oriented Design Pattern', url: BOOK + 'ch18-03-oo-design-patterns.html' },
    ],
    concept: 'dyn Trait, trait objects, static vs dynamic dispatch',
    prerequisites: ['traits', 'generics'],
    rbe: [],
    rustlings: [],
    practice: [
      { id: 'hetero-vec', text: 'Define trait Draw with fn draw(&self), implement it for two structs, store both in a Vec<Box<dyn Draw>> and render in a loop.' },
      { id: 'object-safety', text: 'Add fn name(&self) -> Self to the trait, read the object-safety error on dyn Draw, then fix it (e.g. return String).' },
    ],
    difficulty: 4, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'find_bug',
        prompt: 'trait Animal {\n    fn speak(&self);\n    fn breed(&self) -> Self;\n}\n\nfn chorus(animals: &[Box<dyn Animal>]) {\n    for a in animals {\n        a.speak();\n    }\n}\n\nWhy won’t this compile?',
        explain: 'A method returning Self makes Animal not object-safe — modern rustc says “not dyn compatible” (E0038): a vtable cannot dispatch a method whose return type differs per implementor, so Box<dyn Animal> can never exist. Fix the signature (e.g. return String) or drop the method.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nuse std::fmt::Display;\nfn main() {\n    let v: Vec<Box<dyn Display>> = vec![Box::new(5), Box::new("hi")];\n    for x in &v {\n        println!("{x}");\n    }\n}',
        explain: 'One vector holding an `i32` AND a `&str` — impossible with generics, routine with trait objects: each fat pointer carries its own vtable. Output:\n5\nhi',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why must `dyn Trait` virtually always sit behind a pointer (`Box`, `&`, …)?',
        options: [
          { id: 'a', text: 'Trait objects are unsized — the compiler needs a fat pointer (data address + vtable)' },
          { id: 'b', text: 'For speed' },
          { id: 'c', text: 'Pure syntax requirement' },
        ],
        correct: 'a',
        explain: 'Different implementors have different sizes, so `dyn Trait` has no compile-time size. The pointer supplies the missing half: address plus vtable.',
        },
      ],
    },
  },

  // ================= Chapter 19 — Patterns and Matching =================
  {
    id: 'patterns-everywhere', chapter: 19, chapterTitle: 'Patterns and Matching', fundamental: false,
    trpl: [
      { num: '19.1', title: 'All the Places Patterns Can Be Used', url: BOOK + 'ch19-01-all-the-places-for-patterns.html' },
      { num: '19.0', title: 'Patterns and Matching (chapter overview)', url: BOOK + 'ch19-00-patterns.html' },
    ],
    concept: 'Patterns across match, let, if let, while let, let-else, for loops, and function params',
    prerequisites: ['match'],
    rbe: [],
    rustlings: [{ name: 'enums3', url: RL + '08_enums/enums3.rs' }],
    difficulty: 2, estMinutes: 20,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'Is `let (x, y) = (1, 2);` an example of pattern matching in Rust?',
        options: [
          { id: 'a', text: 'Yes — it destructures the tuple using an irrefutable pattern' },
          { id: 'b', text: 'No — only `match` expressions use patterns' },
          { id: 'c', text: 'Yes, but only inside `unsafe` blocks' },
        ],
        correct: 'a',
        explain: '`let` statements evaluate irrefutable patterns to bind destructured variables.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let mut v = vec![1, 2, 3];\n    let mut out = vec![];\n    while let Some(x) = v.pop() {\n        out.push(x);\n    }\n    println!("{out:?}");\n}',
        explain: '`pop` removes from the END, so the loop drains 3, 2, 1 in that order. Output: [3, 2, 1]. `while let` keeps matching until the pattern fails (`None` on empty).',
        },
        {
        type: 'multiple_choice',
        prompt: 'Function parameters can be patterns too. What does `fn f((x, y): (i32, i32))` do?',
        options: [
          { id: 'a', text: 'Destructures the tuple argument directly into `x` and `y`' },
          { id: 'b', text: 'It is a syntax error' },
          { id: 'c', text: 'It declares a nested function' },
        ],
        correct: 'a',
        explain: 'Parameter position accepts any irrefutable pattern — tuples, structs, even `&` patterns. Refutable ones are still rejected there.',
        },
      ],
    },
  },
  {
    id: 'pattern-syntax', chapter: 19, chapterTitle: 'Patterns and Matching', fundamental: false,
    trpl: [
      { num: '19.2', title: 'Refutability', url: BOOK + 'ch19-02-refutability.html' },
      { num: '19.3', title: 'Pattern Syntax', url: BOOK + 'ch19-03-pattern-syntax.html' },
    ],
    concept: 'Refutable vs irrefutable patterns, match guards, @ bindings',
    prerequisites: ['patterns-everywhere'],
    rbe: [],
    rustlings: [{ name: 'options3', url: RL + '12_options/options3.rs' }],
    difficulty: 3, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'find_bug',
        prompt: 'let Some(x) = some_option;\n\nWhy does this fail to compile as a plain `let` statement?',
        explain: '`let` requires an irrefutable pattern. `Some(x)` can fail to match if `some_option` is `None`. Use `if let` or `let-else` instead.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let n = 5;\n    match n {\n        x @ 1..=5 => println!("in {x}"),\n        _ => println!("out"),\n    }\n}',
        explain: '`@` binds the matched value WHILE testing the sub-pattern: 5 is in range, so `x` = 5. Output: "in 5". Without `@` you could test but not keep the value.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What does `..` mean in `Struct { x, .. }` and in `(first, ..)`?',
        options: [
          { id: 'a', text: 'Ignore the remaining fields or elements' },
          { id: 'b', text: 'Match exactly one arbitrary value' },
          { id: 'c', text: 'It is only the range operator, invalid here' },
        ],
        correct: 'a',
        explain: '`..` (rest pattern) waves off whatever you do not name — the key to non-exhaustive destructuring. Ranges reuse the same glyph in a different position.',
        },
      ],
    },
  },

  // ================= Chapter 20 — Advanced Features =================
  {
    id: 'unsafe-rust', chapter: 20, chapterTitle: 'Advanced Features', fundamental: true,
    trpl: [
      { num: '20.1', title: 'Unsafe Rust', url: BOOK + 'ch20-01-unsafe-rust.html' },
      { num: '20.0', title: 'Advanced Features (chapter overview)', url: BOOK + 'ch20-00-advanced-features.html' },
    ],
    concept: 'unsafe blocks, raw pointers, unsafe superpowers',
    prerequisites: ['lifetimes'],
    rbe: [
      { title: 'Foreign Function Interface', url: RBE + 'std_misc/ffi.html', type: 'REINFORCEMENT' },
    ],
    rustlings: [],
    difficulty: 4, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'find_bug',
        prompt: 'let x = 5;\nlet r = &x as *const i32;\nprintln!("{}", *r);\n\nWhy won’t this compile, and what is the minimal fix?',
        explain: 'Creating a raw pointer with `as` is safe, but dereferencing it is one of the five unsafe-only operations (E0133). Minimal fix: wrap only the dereference — println!("{}", unsafe { *r }). Everything else, including the borrow checker, keeps working as usual.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Which raw-pointer operations are legal in SAFE Rust?',
        options: [
          { id: 'a', text: 'Creating them, copying them, comparing them' },
          { id: 'b', text: 'Dereferencing them' },
          { id: 'c', text: 'Freeing their memory with `drop`' },
        ],
        correct: 'a',
        explain: 'Forming and shuffling addresses is harmless; only DEREFERENCING (and a few siblings) can actually violate memory safety, so only those need `unsafe`.',
        },
        {
        type: 'find_bug',
        prompt: 'static mut N: i32 = 0;\nfn main() {\n    N += 1;\n    println!("{N}");\n}\n\nBoth marked lines fail. Why, and what is the fix?',
        explain: 'E0133 twice: touching a `static mut` — writing AND reading — is unsafe-only, because global mutable state is shared across threads by nature. Wrap each access: `unsafe { N += 1; }`, `println!("{}", unsafe { N });`.',
        },
      ],
    },
  },
  {
    id: 'advanced-traits-types', chapter: 20, chapterTitle: 'Advanced Features', fundamental: false,
    trpl: [
      { num: '20.2', title: 'Advanced Traits', url: BOOK + 'ch20-02-advanced-traits.html' },
      { num: '20.3', title: 'Advanced Types', url: BOOK + 'ch20-03-advanced-types.html' },
      { num: '20.4', title: 'Advanced Functions and Closures', url: BOOK + 'ch20-04-advanced-functions-and-closures.html' },
    ],
    concept: 'Associated types, supertraits, newtype pattern, type aliases',
    prerequisites: ['traits', 'generics'],
    rbe: [],
    rustlings: [{ name: 'traits5', url: RL + '15_traits/traits5.rs' }],
    difficulty: 4, estMinutes: 35,
    checkpoint: {
      questions: [
        {
        type: 'explain',
        prompt: 'Why can’t you write `impl std::fmt::Display for Vec<String>` directly in your crate?',
        explain: 'The orphan rule requires either the trait or the type to be defined locally in your crate. Wrapping `Vec<String>` in a local struct (newtype) resolves this.',
        },
        {
        type: 'multiple_choice',
        prompt: '`trait Person: Name` — what does the `: Name` part demand?',
        options: [
          { id: 'a', text: 'Every implementor of `Person` must also implement `Name` (supertrait bound)' },
          { id: 'b', text: '`Person` automatically inherits all of `Name`’s method bodies' },
          { id: 'c', text: 'Nothing — it is documentation' },
        ],
        correct: 'a',
        explain: 'Supertraits express "you must be a Name before you can be a Person", letting `Person` methods rely on `Name` behavior. No automatic method copying happens.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why wrap `Vec<String>` in `struct Winners(Vec<String>)` instead of using it directly?',
        options: [
          { id: 'a', text: 'To attach trait impls despite the orphan rule, and to give the abstraction a name and type safety' },
          { id: 'b', text: 'For runtime performance' },
          { id: 'c', text: 'There is no reason' },
        ],
        correct: 'a',
        explain: 'The newtype pattern is the orphan-rule escape hatch plus free documentation: a `Winners` is not just any vector, and the compiler enforces the distinction.',
        },
      ],
    },
  },
  {
    id: 'macros', chapter: 20, chapterTitle: 'Advanced Features', fundamental: false,
    trpl: [{ num: '20.5', title: 'Macros', url: BOOK + 'ch20-05-macros.html' }],
    concept: 'Declarative macros (macro_rules!) vs procedural macros',
    prerequisites: ['functions'],
    rbe: [
      { title: 'Syntax', url: RBE + 'macros/syntax.html', type: 'REINFORCEMENT' },
      { title: 'Designators', url: RBE + 'macros/designators.html', type: 'REINFORCEMENT' },
      { title: 'Overload', url: RBE + 'macros/overload.html', type: 'REINFORCEMENT' },
      { title: 'Repeat', url: RBE + 'macros/repeat.html', type: 'REINFORCEMENT' },
      { title: 'DRY (Don\'t Repeat Yourself)', url: RBE + 'macros/dry.html', type: 'REINFORCEMENT' },
      { title: 'Domain Specific Languages (DSLs)', url: RBE + 'macros/dsl.html', type: 'REINFORCEMENT' },
      { title: 'Variadic Interfaces', url: RBE + 'macros/variadics.html', type: 'REINFORCEMENT' },
    ],
    rustlings: [{ name: 'macros1', url: RL + '21_macros/macros1.rs' },
      { name: 'macros2', url: RL + '21_macros/macros2.rs' },
      { name: 'macros3', url: RL + '21_macros/macros3.rs' },
      { name: 'macros4', url: RL + '21_macros/macros4.rs' },
    ],
    difficulty: 4, estMinutes: 30,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'What do declarative macros (`macro_rules!`) operate on?',
        options: [
          { id: 'a', text: 'Runtime values' },
          { id: 'b', text: 'Patterns of source tokens expanded at compile time' },
          { id: 'c', text: 'CPU instructions' },
        ],
        correct: 'b',
        explain: 'Macros match against code token trees and expand to generated code at compile time.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Declarative vs procedural macros — what is the real divide?',
        options: [
          { id: 'a', text: '`macro_rules!` matches token patterns; procedural macros are Rust functions over token streams (derive, attribute, function-like)' },
          { id: 'b', text: 'Declarative macros run faster' },
          { id: 'c', text: 'Procedural macros are deprecated' },
        ],
        correct: 'a',
        explain: 'Same compile-time job, different machinery: pattern-matching versus arbitrary code transforming token streams. Derive macros are the everyday face of the second kind.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print, and why should it worry you?\n\nmacro_rules! twice {\n    ($x:expr) => { $x + $x };\n}\nfn main() {\n    let mut n = 0;\n    let r = twice!({ n += 1; n });\n    println!("{r} {n}");\n}',
        explain: 'Output: "3 2". The block runs TWICE (yielding 1, then 2; 1+2=3) — macros substitute tokens with zero memoization. An argument with side effects executes once per mention: the reason careful macros bind temporaries.',
        },
      ],
    },
  },

  // ================= Chapter 21 — Final Project =================
  {
    id: 'final-project', chapter: 21, chapterTitle: 'Final Project: Building a Multithreaded Web Server', fundamental: false, integrative: true,
    trpl: [
      { num: '21', title: 'Final Project: Multithreaded Web Server', url: BOOK + 'ch21-00-final-project-a-web-server.html' },
      { num: '21.1', title: 'Building a Single-Threaded Web Server', url: BOOK + 'ch21-01-single-threaded.html' },
      { num: '21.2', title: 'From Single-Threaded to Multithreaded Server', url: BOOK + 'ch21-02-multithreaded.html' },
      { num: '21.3', title: 'Graceful Shutdown and Cleanup', url: BOOK + 'ch21-03-graceful-shutdown-and-cleanup.html' },
    ],
    concept: 'Capstone: multithreaded TCP web server and thread pool',
    prerequisites: ['threads', 'message-passing', 'shared-state', 'box', 'closures', 'result', 'traits'],
    rbe: [],
    rustlings: [],
    difficulty: 4, estMinutes: 120,
    checkpoint: {
      questions: [
        {
        type: 'explain',
        prompt: 'Capstone Acceptance Checklist — verify your Multithreaded Web Server:\n\n1. [ ] Listens for incoming TCP streams on 127.0.0.1:7878 via std::net::TcpListener.\n2. [ ] Implemented ThreadPool struct managing a fixed number of worker threads.\n3. [ ] Dispatches jobs across threads using an mpsc channel with Arc<Mutex<Receiver<Job>>>.\n4. [ ] Implemented graceful shutdown via Drop for ThreadPool, joining all workers.\n5. [ ] Server responds to concurrent browser requests without blocking other connections.\n\nAre all 5 requirements functioning in your local build?',
        explain: 'Outstanding achievement! Building this thread-pooled server synthesizes ownership, closures (Box<dyn FnOnce()>), concurrency primitives (Arc, Mutex, mpsc), and graceful cleanup (Drop, JoinHandle). You have mastered the core Rust curriculum!',
        },
        {
        type: 'multiple_choice',
        prompt: 'Why `Arc<Mutex<Receiver<Job>>>` for the job queue, not `Rc<RefCell<...>>`?',
        options: [
          { id: 'a', text: 'Workers are OS threads — shared state must be `Send + Sync`; `Rc`/`RefCell` are neither' },
          { id: 'b', text: '`Arc` is faster' },
          { id: 'c', text: 'There is no reason' },
        ],
        correct: 'a',
        explain: 'The whole course converges here: `Rc` failed threads back in shared-state, `RefCell` fails `Sync` — only atomically-counted, lock-guarded sharing crosses thread boundaries.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What does the `ThreadPool`’s `Drop` impl accomplish?',
        options: [
          { id: 'a', text: 'Graceful shutdown: signals workers to exit and joins them so no work is truncated' },
          { id: 'b', text: 'Frees the TCP port' },
          { id: 'c', text: 'Nothing — `Drop` here is a formality' },
        ],
        correct: 'a',
        explain: 'Without it, `main` returning would slaughter in-flight workers mid-request (the threads-lesson warning, weaponized). `Drop` turns shutdown into a protocol.',
        },
      ],
    },
  },

  // ================= Bonus Module =================
  {
    id: 'clippy-tooling', chapter: 0, chapterTitle: 'Bonus — Tooling & Conversions', fundamental: false, bonus: true,
    trpl: [{ num: 'App. D', title: 'Appendix D: Useful Development Tools', url: BOOK + 'appendix-04-useful-development-tools.html' }],
    concept: 'Clippy lints and idiomatic-Rust tooling',
    prerequisites: ['functions'],
    rbe: [],
    rustlings: [
      { name: 'clippy1', url: RL + '22_clippy/clippy1.rs' },
      { name: 'clippy2', url: RL + '22_clippy/clippy2.rs' },
      { name: 'clippy3', url: RL + '22_clippy/clippy3.rs' },
    ],
    difficulty: 2, estMinutes: 20,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'What does `cargo clippy` add on top of `cargo check`?',
        options: [
          { id: 'a', text: 'Nothing, it is an exact alias' },
          { id: 'b', text: 'A comprehensive collection of idiomatic and stylistic lints beyond compiler warnings' },
          { id: 'c', text: 'A faster compiler backend' },
        ],
        correct: 'b',
        explain: 'Clippy performs hundreds of additional static analysis checks for idiomatic Rust code.',
        },
        {
        type: 'multiple_choice',
        prompt: '`cargo fmt --check` in CI — what does it enforce?',
        options: [
          { id: 'a', text: 'Uniform formatting: the build fails on any formatting diff' },
          { id: 'b', text: 'Zero compiler warnings' },
          { id: 'c', text: 'Test coverage thresholds' },
        ],
        correct: 'a',
        explain: '`--check` never rewrites; it exits nonzero on diffs, turning style into a merge gate. Warnings and coverage are other tools’ jobs.',
        },
        {
        type: 'multiple_choice',
        prompt: 'rustfmt vs clippy — who does what?',
        options: [
          { id: 'a', text: 'rustfmt formats only; clippy lints for correctness and idioms' },
          { id: 'b', text: 'They do the same thing' },
          { id: 'c', text: 'clippy formats, rustfmt lints' },
        ],
        correct: 'a',
        explain: 'Two axes: rustfmt owns whitespace-level consistency, clippy owns did-you-mean-it analysis (needless clones, len-zero checks, and hundreds more).',
        },
      ],
    },
  },
  {
    id: 'type-conversions', chapter: 0, chapterTitle: 'Bonus — Tooling & Conversions', fundamental: false, bonus: true,
    trpl: [{ num: 'App. C', title: 'Appendix C: Derivable Traits (From/TryFrom context)', url: BOOK + 'appendix-03-derivable-traits.html' }],
    concept: 'as casts, From/Into, TryFrom/TryInto, FromStr',
    prerequisites: ['traits', 'generics'],
    rbe: [
      { title: 'Conversion (From/Into, TryFrom/TryInto)', url: RBE + 'conversion.html', type: 'EXACT' },
      { title: '`From` and `Into`', url: RBE + 'conversion/from_into.html', type: 'REINFORCEMENT' },
      { title: '`TryFrom` and `TryInto`', url: RBE + 'conversion/try_from_try_into.html', type: 'REINFORCEMENT' },
      { title: 'To and from Strings', url: RBE + 'conversion/string.html', type: 'REINFORCEMENT' },
    ],
    rustlings: [
      { name: 'using_as', url: RL + '23_conversions/using_as.rs' },
      { name: 'from_into', url: RL + '23_conversions/from_into.rs' },
      { name: 'from_str', url: RL + '23_conversions/from_str.rs' },
      { name: 'try_from_into', url: RL + '23_conversions/try_from_into.rs' },
      { name: 'as_ref_mut', url: RL + '23_conversions/as_ref_mut.rs' },
    ],
    difficulty: 3, estMinutes: 35,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'If you implement `impl From<Celsius> for Fahrenheit`, what do you get automatically?',
        options: [
          { id: 'a', text: 'Nothing extra' },
          { id: 'b', text: 'An automatic Into<Fahrenheit> implementation for Celsius' },
          { id: 'c', text: 'An automatic `TryFrom` implementation as well' },
        ],
        correct: 'b',
        explain: 'The standard library provides a blanket `impl<T, U> Into<U> for T where U: From<T>`.',
        },
        {
        type: 'predict_output',
        prompt: 'What does this print?\n\nfn main() {\n    let n: i32 = "42".parse().unwrap();\n    println!("{}", n + 1);\n}',
        explain: 'The annotation drives inference: `parse` resolves to `FromStr for i32`. Output: 43. Remove the annotation and inference fails — there is nothing left to pin the target type.',
        },
        {
        type: 'multiple_choice',
        prompt: '`as` casts vs `From` — when is `as` dangerous?',
        options: [
          { id: 'a', text: 'Lossy conversions (e.g. `300u16 as u8` wraps silently) with no error signal' },
          { id: 'b', text: 'Never — `as` is always safe' },
          { id: 'c', text: 'Only when converting floats' },
        ],
        correct: 'a',
        explain: '`as` never fails loudly: out-of-range values wrap (or saturate for floats). `TryFrom` exists precisely for fallible conversions.',
        },
      ],
    },
  },
  {
    id: 'appendix-reference', chapter: 0, chapterTitle: 'Bonus — Tooling & Conversions', fundamental: false, bonus: true,
    trpl: [
      { num: 'App.', title: 'Appendix (index)', url: BOOK + 'appendix-00.html' },
      { num: 'App. A', title: 'Keywords', url: BOOK + 'appendix-01-keywords.html' },
      { num: 'App. B', title: 'Operators and Symbols', url: BOOK + 'appendix-02-operators.html' },
      { num: 'App. E', title: 'Editions', url: BOOK + 'appendix-05-editions.html' },
      { num: 'App. F', title: 'Translations of the Book', url: BOOK + 'appendix-06-translation.html' },
      { num: 'App. G', title: 'How Rust is Made and “Nightly Rust”', url: BOOK + 'appendix-07-nightly-rust.html' },
    ],
    concept: 'Appendices: keywords, operators, editions, and nightly',
    prerequisites: ['functions'],
    rbe: [],
    rustlings: [],
    difficulty: 1, estMinutes: 25,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'You want to name a variable `match`, but the compiler rejects it. Where do you confirm why?',
        options: [
          { id: 'a', text: 'Appendix A — Keywords: `match` is reserved for pattern matching' },
          { id: 'b', text: 'Appendix B — Operators: `match` is an operator' },
          { id: 'c', text: 'Nowhere — any word can be a variable name' },
        ],
        correct: 'a',
        explain: 'Appendix A lists Rust’s reserved keywords. `match` is a keyword, so it cannot be used as an identifier.',
        },
        {
        type: 'multiple_choice',
        prompt: 'Where do you check whether `gen` may be used as an identifier in your edition?',
        options: [
          { id: 'a', text: 'Appendix A — keywords, including edition-gated strict and weak keywords' },
          { id: 'b', text: 'Appendix B — operators' },
          { id: 'c', text: 'Nowhere official — only Stack Overflow' },
        ],
        correct: 'a',
        explain: 'Keywords come in flavors (strict, reserved, weak) and some are edition-gated — Appendix A tracks exactly which words are taken where.',
        },
        {
        type: 'multiple_choice',
        prompt: 'What is a Rust “edition”?',
        options: [
          { id: 'a', text: 'An opt-in set of (mostly syntax-level) rules per crate; crates of different editions interoperate freely' },
          { id: 'b', text: 'A compiler release that breaks all old code' },
          { id: 'c', text: 'A printing of the book' },
        ],
        correct: 'a',
        explain: 'Editions let the language evolve without forking the ecosystem: 2015/2018/2021/2024 crates link together in one binary.',
        },
      ],
    },
  },
  {
    id: 'attributes', chapter: 0, chapterTitle: 'Bonus — RBE Cookbook', fundamental: false, bonus: true,
    trpl: [],
    concept: 'Attributes: cfg, allow, crate — steering compilation',
    prerequisites: ['functions'],
    rbe: [
      { title: 'Attributes', url: RBE + 'attribute.html', type: 'EXACT' },
      { title: '`dead_code`', url: RBE + 'attribute/unused.html', type: 'REINFORCEMENT' },
      { title: 'Crates', url: RBE + 'attribute/crate.html', type: 'REINFORCEMENT' },
      { title: '`cfg`', url: RBE + 'attribute/cfg.html', type: 'REINFORCEMENT' },
      { title: 'Custom cfg', url: RBE + 'attribute/cfg/custom.html', type: 'REINFORCEMENT' },
    ],
    rustlings: [],
    difficulty: 2, estMinutes: 20,
    checkpoint: {
      questions: [
        {
        type: 'multiple_choice',
        prompt: 'What does `#[cfg(target_os = "linux")]` above a function do?',
        options: [
          { id: 'a', text: 'Compiles the function only when targeting Linux' },
          { id: 'b', text: 'Checks at runtime whether the OS is Linux' },
          { id: 'c', text: 'Disables all compiler warnings for that function' },
        ],
        correct: 'a',
        explain: '#[cfg(...)] is conditional compilation: the item only exists in builds matching the predicate. Runtime checks use the cfg! macro instead.',
        },
        {
        type: 'multiple_choice',
        prompt: '`cfg!` macro vs `#[cfg]` attribute — what is the difference?',
        options: [
          { id: 'a', text: '`cfg!` yields a bool at compile time but BOTH branches still compile; `#[cfg]` removes code entirely' },
          { id: 'b', text: 'There is none' },
          { id: 'c', text: '`cfg!` evaluates at runtime' },
        ],
        correct: 'a',
        explain: '`if cfg!(unix)` compiles the dead branch too (it must typecheck); `#[cfg(unix)]` erases it before compilation. Different tools: runtime-flexible check vs zero-cost gating.',
        },
        {
        type: 'find_bug',
        prompt: '#[allow(dead_code)]\nfn unused() {}\nfn main() {\n    #[allow(dead_code)]\n    let x = 5;\n    println!("hi");\n}\n\nThe author expected silence. What warning survives, and why?',
        explain: '“unused variable: `x`” survives: lints are specific — `dead_code` covers never-used items, but an unused local fires the separate `unused_variables` lint, which `dead_code` does not touch. Fix: `let _x` or `#[allow(unused_variables)]`.',
        },
      ],
    },
  },
];

function buildModules() {
  const order = [];
  const byChapter = new Map();
  for (const c of concepts) {
    const key = c.bonus ? 'bonus' : String(c.chapter);
    if (!byChapter.has(key)) {
      byChapter.set(key, { key, chapterNum: c.chapter, title: c.chapterTitle, integrative: !!c.integrative, bonus: !!c.bonus, concepts: [] });
      order.push(key);
    }
    byChapter.get(key).concepts.push(c);
  }
  return order.map((k) => byChapter.get(k));
}

const modules = buildModules();

const courseMeta = {
  title: 'Rust Mastery — TRPL × Rust by Example × Rustlings',
  subtitle: 'One sequence, three sources: read, see, do, recall, advance.',
  totalConcepts: concepts.length,
};

