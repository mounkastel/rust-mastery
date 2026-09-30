import type { Chapter } from '../schema';

export const ch03: Chapter = {
  key: '3',
  num: 3,
  title: 'Common Programming Concepts',
  integrative: false,
  concepts: [
    {
      id: 'variables-mutability',
      title: 'Variables and Mutability',
      fundamental: true,
      prereq: ['guessing-game'],
      difficulty: 1,
      estMinutes: 30,
      reading: [
        {
          num: '3.1',
          title: 'Variables and Mutability',
          href: 'ch03-01-variables-and-mutability.html',
        },
        {
          num: '3.0',
          title: 'Common Programming Concepts (chapter overview)',
          href: 'ch03-00-common-programming-concepts.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'variables1', href: '01_variables/variables1.rs' },
        { name: 'variables2', href: '01_variables/variables2.rs' },
        { name: 'variables3', href: '01_variables/variables3.rs' },
        { name: 'variables4', href: '01_variables/variables4.rs' },
        { name: 'variables5', href: '01_variables/variables5.rs' },
        { name: 'variables6', href: '01_variables/variables6.rs' },
      ],
      questions: [
        {
          id: 'variables-mutability-q1',
          kind: 'predict',
          prompt:
            'What does this print?\n\nlet x = 5;\nlet x = x + 1;\n{\n    let x = x * 2;\n    println!("inner: {x}");\n}\nprintln!("outer: {x}");',
          explain:
            'Shadowing creates a new binding each time — the outer value is never touched. Inner block: `(5 + 1) * 2` evaluates to `12` → prints `inner: 12`. After the block ends the outer shadow (`6`) is back in scope → prints `outer: 6`.',
        },
        {
          id: 'variables-mutability-q2',
          kind: 'bug',
          prompt:
            'let x = 5;\nx = 6;\n\nThis fails, yet `let x = 5; let x = 6;` compiles. What is the error, and why the difference?',
          explain:
            'Reassignment targets the SAME binding → `E0384` (cannot assign twice to immutable variable). Shadowing instead declares a brand-new binding that merely reuses the name.',
        },
        {
          id: 'variables-mutability-q3',
          kind: 'choice',
          prompt: 'Which of these compiles?',
          options: [
            { id: 'a', text: '`let x = 5; let x = "hi";`' },
            { id: 'b', text: '`let mut x = 5; x = "hi";`' },
            { id: 'c', text: 'Both' },
          ],
          correct: 'a',
          explain:
            'Shadowing creates a new binding, so the type may change. `mut` only permits same-type reassignment.',
        },
        {
          id: 'variables-mutability-q4',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let mut x = 1;\n    {\n        let x = x + 10;\n        println!("{x}");\n    }\n    x += 1;\n    println!("{x}");\n}',
          explain:
            'The inner `let x` shadows without touching the outer binding: it prints `11`, then the block ends. The outer `x` is still `1`, and `+= 1` makes `2` — shadowing never mutates, it temporarily hides. Output:\n11\n2',
        },
      ],
    },
    {
      id: 'data-types',
      title: 'Data Types',
      fundamental: false,
      prereq: ['variables-mutability'],
      difficulty: 2,
      estMinutes: 35,
      reading: [{ num: '3.2', title: 'Data Types', href: 'ch03-02-data-types.html' }],
      examples: [],
      drills: [
        { name: 'primitive_types1', href: '04_primitive_types/primitive_types1.rs' },
        { name: 'primitive_types2', href: '04_primitive_types/primitive_types2.rs' },
        { name: 'primitive_types3', href: '04_primitive_types/primitive_types3.rs' },
        { name: 'primitive_types4', href: '04_primitive_types/primitive_types4.rs' },
        { name: 'primitive_types5', href: '04_primitive_types/primitive_types5.rs' },
        { name: 'primitive_types6', href: '04_primitive_types/primitive_types6.rs' },
      ],
      questions: [
        {
          id: 'data-types-q1',
          kind: 'choice',
          prompt: 'Which is true of a Rust array `[i32; 5]`?',
          options: [
            { id: 'a', text: 'Its length can change at runtime' },
            { id: 'c', text: 'It is heap-allocated like Vec' },
            { id: 'b', text: 'Its length is fixed and part of its type' },
          ],
          correct: 'b',
          explain:
            'Array length is fixed at compile time and encoded in the type itself, unlike Vec<T> which is growable and heap-allocated.',
        },
        {
          id: 'data-types-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let t = (1, 2.5, \'a\');\n    let (x, _, z) = t;\n    println!("{x} {z}");\n}',
          explain:
            "Destructuring binds `x` to `1` and `z` to `'a'`; `_` discards the `2.5`. Output:\n1 a",
        },
        {
          id: 'data-types-q3',
          kind: 'choice',
          prompt: 'In `let x = 5;` with no annotation, what is the type of `x`?',
          options: [
            { id: 'b', text: '`usize` — it follows the platform' },
            { id: 'a', text: '`i32` — the default integer type' },
            { id: 'c', text: 'Unknown until `x` is used somewhere' },
          ],
          correct: 'a',
          explain:
            'Integer literals default to `i32`. The compiler only demands an annotation when inference cannot settle the type.',
        },
        {
          id: 'data-types-q4',
          kind: 'choice',
          prompt: 'In a debug build, what does this do?\n\nlet x: u8 = 255;\nlet y = x + 1;',
          options: [
            { id: 'a', text: 'Wraps silently to `0` in every profile' },
            { id: 'c', text: 'Fails to compile — provable overflows are compile errors' },
            { id: 'b', text: 'Panics with integer-overflow in debug; wraps to `0` in release' },
            { id: 'd', text: 'Promotes `y` to `u16` automatically' },
          ],
          correct: 'b',
          explain:
            "TRPL 3.2: debug builds include overflow checks that panic; release builds wrap with two's-complement arithmetic. The `const`-evaluation story confuses this with compile-time contexts, where the compiler does reject overflow. Rust never silently widens integer types.",
        },
      ],
    },
    {
      id: 'functions',
      title: 'Writing Functions',
      fundamental: false,
      prereq: ['data-types'],
      difficulty: 2,
      estMinutes: 30,
      reading: [{ num: '3.3', title: 'Functions', href: 'ch03-03-how-functions-work.html' }],
      examples: [],
      drills: [
        { name: 'functions1', href: '02_functions/functions1.rs' },
        { name: 'functions2', href: '02_functions/functions2.rs' },
        { name: 'functions3', href: '02_functions/functions3.rs' },
        { name: 'functions4', href: '02_functions/functions4.rs' },
        { name: 'functions5', href: '02_functions/functions5.rs' },
      ],
      questions: [
        {
          id: 'functions-q1',
          kind: 'bug',
          prompt:
            'fn square(num: i32) -> i32 {\n    num * num;\n}\n\nWhy won’t this compile, and what’s the one-character fix?',
          explain:
            'The trailing `;` turns `num * num` into a statement returning `()`, which doesn’t match the declared `-> i32`. Remove the semicolon so it’s a tail expression.',
        },
        {
          id: 'functions-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let y = {\n        let x = 3;\n        x + 1\n    };\n    println!("{y}");\n}',
          explain:
            'A block is an expression evaluating to its tail expression (no semicolon). y = 4.',
        },
        {
          id: 'functions-q3',
          kind: 'choice',
          prompt: 'When is `!` (the never type) the honest return type?',
          options: [
            { id: 'a', text: 'A function that panics or loops forever' },
            { id: 'b', text: 'Any function that returns nothing' },
            { id: 'c', text: 'A function returning `Result`' },
          ],
          correct: 'a',
          explain:
            '`()` means "returns normally with no value"; `!` means "never returns at all" (panic, infinite loop, exit).',
        },
        {
          id: 'functions-q4',
          kind: 'bug',
          prompt: "fn main() {\n    let x = (let y = 6);\n}\n\nWhy won't this compile?",
          explain:
            '`let y = 6;` is a statement, and statements return no value — so there is nothing for `x` to bind. TRPL 3.3 draws the line exactly here: only expression blocks evaluate to a value. Drop the inner `let`: `let x = 6;`.',
        },
      ],
    },
    {
      id: 'control-flow',
      title: 'Control Flow',
      fundamental: false,
      prereq: ['functions'],
      difficulty: 2,
      estMinutes: 30,
      reading: [
        { num: '3.5', title: 'Control Flow', href: 'ch03-05-control-flow.html' },
        { num: '3.4', title: 'Comments', href: 'ch03-04-comments.html' },
      ],
      examples: [],
      drills: [
        { name: 'if1', href: '03_if/if1.rs' },
        { name: 'if2', href: '03_if/if2.rs' },
        { name: 'if3', href: '03_if/if3.rs' },
        { name: 'quiz1', href: 'quizzes/quiz1.rs' },
      ],
      questions: [
        {
          id: 'control-flow-q1',
          kind: 'choice',
          prompt: 'Why does `if number { ... }` fail to compile in Rust (unlike C or JavaScript)?',
          options: [
            { id: 'a', text: 'Rust has no if-statements' },
            { id: 'c', text: 'Integers cannot be compared' },
            { id: 'b', text: 'Rust never implicitly converts non-bool types to bool' },
          ],
          correct: 'b',
          explain:
            'Rust requires the condition to be an actual `bool` — there is no implicit truthiness conversion the way there is in C or JS.',
        },
        {
          id: 'control-flow-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let mut n = 0;\n    let r = loop {\n        n += 1;\n        if n == 3 {\n            break n * 10;\n        }\n    };\n    println!("{r}");\n}',
          explain: '`break value` exits the loop yielding that value: 3*10 = 30.',
        },
        {
          id: 'control-flow-q3',
          kind: 'choice',
          prompt: 'Which loop is guaranteed to execute its body at least once?',
          options: [
            { id: 'a', text: '`loop`' },
            { id: 'b', text: '`while cond`' },
            { id: 'c', text: '`for x in iter`' },
          ],
          correct: 'a',
          explain:
            '`loop` has no entry condition — it runs until `break`. `while` and `for` may both run zero times.',
        },
        {
          id: 'control-flow-q4',
          kind: 'choice',
          prompt:
            'Why is this rejected?\n\nfn main() {\n    let n = 3;\n    let s = if n > 2 { "big" } else { 0 };\n}',
          options: [
            { id: 'b', text: '`if` conditions require parentheses in expression position' },
            {
              id: 'a',
              text: 'Both arms must evaluate to the same type; `&str` and `i32` cannot unify (E0308)',
            },
            { id: 'c', text: 'A `let` binding cannot hold an `if` expression' },
            { id: 'd', text: 'The `else` arm is missing a semicolon' },
          ],
          correct: 'a',
          explain:
            '`if` used as an expression forces both arms to one type so `s` has a single static type. Fix by unifying the arms (`else { "small" }`). Assigning an `if`-expression to `let` is perfectly legal — the arms, not the binding, are the problem.',
        },
      ],
    },
  ],
};
