import type { Chapter } from '../schema';

export const ch19: Chapter = {
  key: '19',
  num: 19,
  title: 'Patterns and Matching',
  integrative: false,
  concepts: [
    {
      id: 'patterns-everywhere',
      title: 'Patterns Everywhere',
      fundamental: false,
      prereq: ['match'],
      difficulty: 2,
      estMinutes: 20,
      reading: [
        {
          num: '19.1',
          title: 'All the Places Patterns Can Be Used',
          href: 'ch19-01-all-the-places-for-patterns.html',
        },
        {
          num: '19.0',
          title: 'Patterns and Matching (chapter overview)',
          href: 'ch19-00-patterns.html',
        },
      ],
      examples: [],
      drills: [{ name: 'enums3', href: '08_enums/enums3.rs' }],
      questions: [
        {
          id: 'patterns-everywhere-q1',
          kind: 'choice',
          prompt: 'Is `let (x, y) = (1, 2);` an example of pattern matching in Rust?',
          options: [
            { id: 'b', text: 'No — only `match` expressions use patterns' },
            { id: 'a', text: 'Yes — it destructures the tuple using an irrefutable pattern' },
            { id: 'c', text: 'Yes, but only inside `unsafe` blocks' },
          ],
          correct: 'a',
          explain: '`let` statements evaluate irrefutable patterns to bind destructured variables.',
        },
        {
          id: 'patterns-everywhere-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let mut v = vec![1, 2, 3];\n    let mut out = vec![];\n    while let Some(x) = v.pop() {\n        out.push(x);\n    }\n    println!("{out:?}");\n}',
          explain:
            '`pop` removes from the END, so the loop drains `3`, `2`, `1` in that order. `while let` keeps matching until the pattern fails (`None` on empty). Output:\n[3, 2, 1]',
        },
        {
          id: 'patterns-everywhere-q3',
          kind: 'choice',
          prompt:
            'Function parameters can be patterns too. What does `fn f((x, y): (i32, i32))` do?',
          options: [
            { id: 'a', text: 'Destructures the tuple argument directly into `x` and `y`' },
            { id: 'b', text: 'It is a syntax error' },
            { id: 'c', text: 'It declares a nested function' },
          ],
          correct: 'a',
          explain:
            'Parameter position accepts any irrefutable pattern — tuples, structs, even `&` patterns. Refutable ones are still rejected there.',
        },
        {
          id: 'patterns-everywhere-q4',
          kind: 'choice',
          prompt: 'What does the `matches!` macro do?',
          options: [
            { id: 'b', text: 'Binds all pattern variables exactly like `match`' },
            { id: 'c', text: 'Panics when the pattern does not match' },
            { id: 'd', text: 'Only works on `bool` scrutinees' },
            {
              id: 'a',
              text: 'Evaluates to `bool` — true when the value fits the pattern, without binding anything',
            },
          ],
          correct: 'a',
          explain:
            'TRPL 19.1: `matches!(opt, Some(_))` is boolean pattern testing — `_` discards bindings. It shines in `assert!`/`filter` positions where a full `match` would be noise. The binds-like-`match` story is backwards: `matches!` deliberately binds nothing usable.',
        },
      ],
    },
    {
      id: 'pattern-syntax',
      title: 'Pattern Syntax',
      fundamental: false,
      prereq: ['patterns-everywhere'],
      difficulty: 3,
      estMinutes: 25,
      reading: [
        { num: '19.2', title: 'Refutability', href: 'ch19-02-refutability.html' },
        { num: '19.3', title: 'Pattern Syntax', href: 'ch19-03-pattern-syntax.html' },
      ],
      examples: [],
      drills: [{ name: 'options3', href: '12_options/options3.rs' }],
      questions: [
        {
          id: 'pattern-syntax-q1',
          kind: 'bug',
          prompt:
            'let Some(x) = some_option;\n\nWhy does this fail to compile as a plain `let` statement?',
          explain:
            '`let` requires an irrefutable pattern. `Some(x)` can fail to match if `some_option` is `None`. Use `if let` or `let-else` instead.',
        },
        {
          id: 'pattern-syntax-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let n = 5;\n    match n {\n        x @ 1..=5 => println!("in {x}"),\n        _ => println!("out"),\n    }\n}',
          explain:
            '`@` binds the matched value WHILE testing the sub-pattern: `5` is in range, so `x` becomes `5`. Without `@` you could test but not keep the value. Output:\nin 5',
        },
        {
          id: 'pattern-syntax-q3',
          kind: 'choice',
          prompt: 'What does `..` mean in `Struct { x, .. }` and in `(first, ..)`?',
          options: [
            { id: 'a', text: 'Ignore the remaining fields or elements' },
            { id: 'b', text: 'Match exactly one arbitrary value' },
            { id: 'c', text: 'It is only the range operator, invalid here' },
          ],
          correct: 'a',
          explain:
            '`..` (rest pattern) waves off whatever you do not name — the key to non-exhaustive destructuring. Ranges reuse the same glyph in a different position.',
        },
        {
          id: 'pattern-syntax-q4',
          kind: 'choice',
          prompt:
            'In `match n { x if x > 10 => ..., 5 => ..., _ => ... }` with `n = 5` — which arm runs?',
          options: [
            { id: 'b', text: 'The guard arm — guards always win over literals' },
            { id: 'c', text: 'Neither — overlapping arms are a compile error' },
            {
              id: 'a',
              text: 'The `5` arm — guards check in order; the failing guard falls through to the literal',
            },
            { id: 'd', text: 'It panics — `x` is unbound in the guard arm' },
          ],
          correct: 'a',
          explain:
            'TRPL 19.3: arms evaluate top-down; a failing guard falls through to later arms. Overlapping arms are legal (later ones are flagged unreachable only when provably shadowed). With `n = 5`: guard `5 > 10` fails → the literal matches.',
        },
        {
          id: 'pattern-syntax-q5',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let a = [1, 2, 3, 4];\n    match a {\n        [first, .., last] => println!("{first} {last}"),\n    }\n}',
          explain:
            '`..` absorbs the middle (`2`, `3`); bindings take the ends. Rest patterns also power `Struct { x, .. }` partial destructuring. Output:\n1 4',
        },
      ],
    },
  ],
};
