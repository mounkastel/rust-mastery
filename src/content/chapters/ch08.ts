import type { Chapter } from '../schema';

export const ch08: Chapter = {
  key: '8',
  num: 8,
  title: 'Common Collections',
  integrative: false,
  concepts: [
    {
      id: 'vectors',
      title: 'Working with Vectors',
      fundamental: true,
      prereq: ['slices'],
      difficulty: 2,
      estMinutes: 25,
      reading: [
        { num: '8.1', title: 'Storing Lists of Values with Vectors', href: 'ch08-01-vectors.html' },
        {
          num: '8.0',
          title: 'Common Collections (chapter overview)',
          href: 'ch08-00-common-collections.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'vecs1', href: '05_vecs/vecs1.rs' },
        { name: 'vecs2', href: '05_vecs/vecs2.rs' },
      ],
      questions: [
        {
          id: 'vectors-q1',
          kind: 'choice',
          prompt:
            'Which method returns `Option<&T>` instead of panicking on an out-of-bounds index?',
          options: [
            { id: 'b', text: 'v.get(i)' },
            { id: 'a', text: 'v[i]' },
            { id: 'c', text: 'v.at(i)' },
          ],
          correct: 'b',
          explain:
            '`v.get(i)` returns None for an invalid index rather than panicking, unlike the `[]` operator.',
        },
        {
          id: 'vectors-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let mut v = vec![1, 2, 3];\n    for x in &mut v {\n        *x *= 2;\n    }\n    println!("{:?}", v);\n}',
          explain:
            'Iterating `&mut v` yields mutable references; dereferencing writes through them in place. Output:\n[2, 4, 6]',
        },
        {
          id: 'vectors-q3',
          kind: 'choice',
          prompt: 'After `let mut v = Vec::new(); v.push(1);`, what can you rely on?',
          options: [
            { id: 'b', text: 'Capacity is exactly 1' },
            {
              id: 'a',
              text: '`v.len() == 1` and capacity is at least 1 (exact capacity unspecified)',
            },
            { id: 'c', text: '`v.len()` is still 0 until the vector is shrunk' },
          ],
          correct: 'a',
          explain:
            'Only `len()` is contractual here. Capacity grows by allocator strategy — never assert exact values.',
        },
        {
          id: 'vectors-q4',
          kind: 'bug',
          prompt:
            'fn main() {\n    let mut v = vec![1, 2, 3];\n    let first = &v[0];\n    v.push(4);\n    println!("{first}");\n}\n\nWhy is this rejected? (Hint: it would be a use-after-free if allowed.)',
          explain:
            'Borrow violation (E0502): `first` immutably borrows `v` while `push` needs `&mut` — and `push` may reallocate, which would leave `first` dangling. TRPL 8.1: the checker conservatively assumes reallocation. Fix: print before pushing, or index after: `v.push(4); println!("{}", v[0]);`.',
        },
      ],
    },
    {
      id: 'strings',
      title: 'Strings and UTF-8',
      fundamental: true,
      prereq: ['vectors'],
      difficulty: 3,
      estMinutes: 35,
      reading: [
        {
          num: '8.2',
          title: 'Storing UTF-8 Encoded Text with Strings',
          href: 'ch08-02-strings.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'strings1', href: '09_strings/strings1.rs' },
        { name: 'strings2', href: '09_strings/strings2.rs' },
        { name: 'strings3', href: '09_strings/strings3.rs' },
        { name: 'strings4', href: '09_strings/strings4.rs' },
      ],
      questions: [
        {
          id: 'strings-q1',
          kind: 'recite',
          prompt:
            'Why does Rust not let you index a String with `s[0]` to get the first character?',
          explain:
            'Rust Strings are UTF-8 encoded, and a single character can occupy 1–4 bytes, so a byte index doesn’t reliably correspond to a character boundary.',
        },
        {
          id: 'strings-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let s = "é";\n    println!("{} {}", s.len(), s.chars().count());\n}',
          explain:
            'é is one char but two bytes in UTF-8: `len()` counts bytes (2), `chars().count()` counts scalar values (1). This is exactly why byte indexing is forbidden.',
        },
        {
          id: 'strings-q3',
          kind: 'bug',
          prompt:
            'fn main() {\n    let s1 = String::from("a");\n    let s2 = "b";\n    let _s3 = s1 + s2;\n    println!("{s1}");\n}\n\nWhat fails here?',
          explain:
            'E0382: `+` (the `Add` impl for String) takes `s1` by value, moving it. The final println! borrows a moved value. Bind or clone first if `s1` is still needed.',
        },
        {
          id: 'strings-q4',
          kind: 'choice',
          prompt:
            'Why does `let s = s1 + &s2;` move `s1`, while `let s = format!("{s1}{s2}");` only borrows both?',
          options: [
            { id: 'b', text: '`format!` secretly clones both strings before interpolating' },
            { id: 'c', text: '`+` never moves; the original snippet fails for another reason' },
            { id: 'd', text: 'Both move — `format!` also consumes `s1`' },
            {
              id: 'a',
              text: '`+` desugars to `add(self, &str)` — it consumes the receiver by value; `format!` only borrows its arguments',
            },
          ],
          correct: 'a',
          explain:
            '`impl Add<&str> for String` takes `self` by value (TRPL 8.2), so `s1` moves. `format!` takes references throughout — which is why the book funnels string building toward `format!`/`push_str` whenever `s1` is still needed.',
        },
        {
          id: 'strings-q5',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let s = "abc";\n    for b in s.bytes() {\n        print!("{b} ");\n    }\n}',
          explain:
            '`bytes()` yields raw `u8` values: ASCII `a`/`b`/`c` are `97`/`98`/`99`. Contrast `chars()` (Unicode scalar values — identical here, different for `é`) and `len()` (byte count, not character count). Output:\n97 98 99',
        },
      ],
    },
    {
      id: 'hashmaps',
      title: 'Hash Maps',
      fundamental: false,
      prereq: ['vectors'],
      difficulty: 2,
      estMinutes: 25,
      reading: [
        {
          num: '8.3',
          title: 'Storing Keys with Associated Values in Hash Maps',
          href: 'ch08-03-hash-maps.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'hashmaps1', href: '11_hashmaps/hashmaps1.rs' },
        { name: 'hashmaps2', href: '11_hashmaps/hashmaps2.rs' },
        { name: 'hashmaps3', href: '11_hashmaps/hashmaps3.rs' },
        { name: 'quiz2', href: 'quizzes/quiz2.rs' },
      ],
      questions: [
        {
          id: 'hashmaps-q1',
          kind: 'predict',
          prompt:
            'let mut m = std::collections::HashMap::new();\n*m.entry("a").or_insert(0) += 1;\n*m.entry("a").or_insert(0) += 1;\nprintln!("{}", m["a"]);',
          explain:
            'Each call increments the counter for "a" via the entry API; after two calls the value is 2.',
        },
        {
          id: 'hashmaps-q2',
          kind: 'choice',
          prompt:
            'Why does `HashMap::new()` sometimes need a type annotation while `vec![1]` does not?',
          options: [
            { id: 'b', text: 'HashMap is always dynamically typed' },
            { id: 'c', text: 'Annotations are required on all collections' },
            {
              id: 'a',
              text: 'No values flow into an empty map yet, so key/value types cannot be inferred',
            },
          ],
          correct: 'a',
          explain:
            'Inference needs evidence: `vec![1]` shows the element type, but an empty map reveals nothing until something is inserted or the annotation pins it down.',
        },
        {
          id: 'hashmaps-q3',
          kind: 'bug',
          prompt:
            'use std::collections::HashMap;\nfn main() {\n    let mut m = HashMap::new();\n    let k = String::from("a");\n    m.insert(&k, 1);\n    drop(k);\n    println!("{}", m.len());\n}\n\nWhat fails here?',
          explain:
            'E0505: the map holds a borrow of `k`, so `drop(k)` (a move) is illegal while the borrow is live. Owned keys (`m.insert(k, 1)`, with the `drop(k)` line removed) avoid entangling lifetimes — inserting the owned key and then dropping it is still E0382, because `drop` moves.',
        },
        {
          id: 'hashmaps-q4',
          kind: 'choice',
          prompt:
            'What does `m.entry(key).or_insert_with(Vec::new)` return, and why does that matter?',
          options: [
            { id: 'b', text: 'A copy of the stored value' },
            {
              id: 'a',
              text: '`&mut V` — a live handle into the map, so you can `push` without a second lookup',
            },
            { id: 'c', text: '`Option<&mut V>` — `None` when the key already existed' },
            { id: 'd', text: 'The old value that was just replaced' },
          ],
          correct: 'a',
          explain:
            'TRPL 8.3: the entry API returns `&mut V` to the live slot — one lookup for check-and-mutate is its whole point. The `Option<&mut V>` and old-value stories describe `insert`, which returns `Option<V>` (the displaced old value).',
        },
      ],
    },
  ],
};
