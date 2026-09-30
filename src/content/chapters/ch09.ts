import type { Chapter } from '../schema';

export const ch09: Chapter = {
  key: '9',
  num: 9,
  title: 'Error Handling',
  integrative: false,
  concepts: [
    {
      id: 'panic',
      title: 'Unrecoverable Errors',
      fundamental: false,
      prereq: ['control-flow'],
      difficulty: 2,
      estMinutes: 20,
      reading: [
        {
          num: '9.1',
          title: 'Unrecoverable Errors with panic!',
          href: 'ch09-01-unrecoverable-errors-with-panic.html',
        },
        {
          num: '9.0',
          title: 'Error Handling (chapter overview)',
          href: 'ch09-00-error-handling.html',
        },
      ],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'panic-q1',
          kind: 'choice',
          prompt: 'Which situation is the better fit for `panic!` rather than returning a Result?',
          options: [
            {
              id: 'b',
              text: 'An internal invariant your code guarantees is violated — a genuine bug',
            },
            { id: 'a', text: 'A file the user asked to open does not exist' },
            { id: 'c', text: 'Parsing user-supplied text as a number' },
          ],
          correct: 'b',
          explain:
            'panic! is for bugs / broken invariants where continuing is unsafe or meaningless; expected failures should use Result.',
        },
        {
          id: 'panic-q2',
          kind: 'choice',
          prompt:
            'How do you assert not just that a test panics, but that it panics with a specific message?',
          options: [
            { id: 'b', text: '`#[should_panic("msg")]`' },
            { id: 'a', text: '`#[should_panic(expected = "msg")]`' },
            { id: 'c', text: 'Impossible — only the fact of panicking is observable' },
          ],
          correct: 'a',
          explain:
            '`expected` does substring matching against the panic payload. Bare `#[should_panic("msg")]` is not valid attribute syntax — the payload needs the `expected = ` key.',
        },
        {
          id: 'panic-q3',
          kind: 'predict',
          prompt:
            'What happens when this runs?\n\nfn main() {\n    let v = vec![1];\n    println!("{}", v[5]);\n}',
          explain:
            'Runtime panic (not a compile error): bounds are checked at runtime. Message: "index out of bounds: the len is 1 but the index is 5". This is precisely the case `v.get(5)` would have returned `None` for.',
        },
        {
          id: 'panic-q4',
          kind: 'choice',
          prompt: 'When is `expect("config missing")` strictly better than `unwrap()`?',
          options: [
            { id: 'b', text: 'It never panics, unlike `unwrap`' },
            { id: 'c', text: 'It returns `Option` instead of panicking' },
            {
              id: 'a',
              text: 'When the panic message must document an invariant the reader needs — `unwrap` panics with a generic message that hides context',
            },
            { id: 'd', text: 'Only in tests — `expect` is rejected in binaries' },
          ],
          correct: 'a',
          explain:
            'Both panic on `Err`; `expect` attaches your message to the panic output (TRPL 9.3/11.1). The never-panics and returns-`Option` stories invent non-panicking behavior, and the tests-only story invents a restriction. Book rule of thumb: `expect` where failure means programmer error with context worth stating.',
        },
      ],
    },
    {
      id: 'result',
      title: 'Error Propagation',
      fundamental: true,
      prereq: ['panic', 'enums'],
      difficulty: 3,
      estMinutes: 40,
      reading: [
        {
          num: '9.2',
          title: 'Recoverable Errors with Result',
          href: 'ch09-02-recoverable-errors-with-result.html',
        },
        {
          num: '9.3',
          title: 'To panic! or Not to panic!',
          href: 'ch09-03-to-panic-or-not-to-panic.html',
        },
      ],
      examples: [
        {
          title: '`?` in `main`',
          href: 'error/result/enter_question_mark.html',
          kind: 'reinforce',
        },
        {
          title: 'Pulling `Result`s out of `Option`s',
          href: 'error/multiple_error_types/option_result.html',
          kind: 'reinforce',
        },
        {
          title: 'Wrapping errors',
          href: 'error/multiple_error_types/wrap_error.html',
          kind: 'reinforce',
        },
        { title: 'Iterating over `Result`s', href: 'error/iter_result.html', kind: 'reinforce' },
      ],
      drills: [
        { name: 'errors1', href: '13_error_handling/errors1.rs' },
        { name: 'errors2', href: '13_error_handling/errors2.rs' },
        { name: 'errors3', href: '13_error_handling/errors3.rs' },
        { name: 'errors4', href: '13_error_handling/errors4.rs' },
        { name: 'errors5', href: '13_error_handling/errors5.rs' },
        { name: 'errors6', href: '13_error_handling/errors6.rs' },
      ],
      questions: [
        {
          id: 'result-q1',
          kind: 'bug',
          prompt:
            'fn parse_it(s: &str) -> i32 {\n    s.parse::<i32>()?\n}\n\nWhy won’t this compile?',
          explain:
            '`?` requires the enclosing function to return a Result (or Option); this function’s return type is plain i32, so `?` has nowhere to propagate the Err case to.',
        },
        {
          id: 'result-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let r: Result<i32, &str> = Ok(5);\n    let out = r.map(|x| x * 2).unwrap_or(0);\n    println!("{out}");\n}',
          explain:
            '`map` transforms the `Ok` payload (`Err` would pass through untouched); `unwrap_or` extracts with a fallback. Output:\n10',
        },
        {
          id: 'result-q3',
          kind: 'choice',
          prompt: 'Why is `Result<T, E>` better than returning `-1` or `null` on failure?',
          options: [
            { id: 'b', text: 'It is faster at runtime' },
            { id: 'c', text: 'It uses less memory' },
            {
              id: 'a',
              text: 'The compiler forces callers to confront the `Err` case; sentinels can be silently ignored',
            },
          ],
          correct: 'a',
          explain:
            'Sentinel values are a convention the compiler cannot enforce — `if (x != -1)` is forgettable. `Result` makes ignoring failure a compile-time conversation.',
        },
        {
          id: 'result-q4',
          kind: 'choice',
          prompt:
            'Why does `?` compile here even though `parse` fails with `ParseIntError`, not `Box<dyn Error>`?\n\nuse std::error::Error;\n\nfn f() -> Result<(), Box<dyn Error>> {\n    let n: i32 = "42".parse()?;\n    Ok(())\n}',
          options: [
            {
              id: 'a',
              text: '`?` converts via `From`: `ParseIntError` implements `Into<Box<dyn Error>>`, so the error is boxed automatically',
            },
            { id: 'b', text: '`?` discards the original error and synthesizes a boxed one' },
            { id: 'c', text: 'All error types are secretly the same type under the hood' },
            { id: 'd', text: 'It does not compile — you must `map_err` by hand' },
          ],
          correct: 'a',
          explain:
            "The `?` desugar calls `From::from` on the error (TRPL 9.2/12.3 `Box<dyn Error>` acceptance). Any `E: Error + 'static` converts into the box — that is why `main() -> Result<(), Box<dyn Error>>` absorbs every fallible call. The must-`map_err`-by-hand story is what beginners write before learning this.",
        },
        {
          id: 'result-q5',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    let r: Result<i32, &str> = Err("boom");\n    let out = r.unwrap_or_else(|e| e.len() as i32);\n    println!("{out}");\n}',
          explain:
            '`unwrap_or_else` runs the closure only on `Err`: `"boom".len()` is `4`. Contrast `unwrap_or(default)`, which always evaluates its argument — the `*_else` family exists for lazy, possibly expensive fallbacks. Output:\n4',
        },
      ],
    },
  ],
};
