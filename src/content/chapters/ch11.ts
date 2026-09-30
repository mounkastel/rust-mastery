import type { Chapter } from '../schema';

export const ch11: Chapter = {
  key: '11',
  num: 11,
  title: 'Writing Automated Tests',
  integrative: false,
  concepts: [
    {
      id: 'writing-tests',
      title: 'Writing Tests',
      fundamental: false,
      prereq: ['functions'],
      difficulty: 2,
      estMinutes: 25,
      reading: [
        { num: '11.1', title: 'How to Write Tests', href: 'ch11-01-writing-tests.html' },
        { num: '11.2', title: 'Controlling How Tests Are Run', href: 'ch11-02-running-tests.html' },
        {
          num: '11.0',
          title: 'Writing Automated Tests (chapter overview)',
          href: 'ch11-00-testing.html',
        },
      ],
      examples: [
        {
          title: 'Development dependencies',
          href: 'testing/dev_dependencies.html',
          kind: 'reinforce',
        },
      ],
      drills: [
        { name: 'tests1', href: '17_tests/tests1.rs' },
        { name: 'tests2', href: '17_tests/tests2.rs' },
        { name: 'tests3', href: '17_tests/tests3.rs' },
      ],
      questions: [
        {
          id: 'writing-tests-q1',
          kind: 'choice',
          prompt: 'Which attribute marks a function as a unit test the harness should run?',
          options: [
            { id: 'a', text: '#[run]' },
            { id: 'b', text: '#[test]' },
            { id: 'c', text: '#[unit_test]' },
          ],
          correct: 'b',
          explain: '`#[test]` is the attribute `cargo test` looks for.',
        },
        {
          id: 'writing-tests-q2',
          kind: 'choice',
          prompt: 'A bare `assert!(rect.can_hold(&other))` fails. What does the output show?',
          options: [
            { id: 'b', text: 'The debug values of `rect` and `other`' },
            { id: 'c', text: 'Nothing — bare assert! is silent' },
            { id: 'a', text: 'The source expression text plus file and line' },
          ],
          correct: 'a',
          explain:
            'Plain `assert!` prints only the expression and location. Value inspection needs `assert_eq!`/`assert_ne!`, which is exactly why the book prefers them.',
        },
        {
          id: 'writing-tests-q3',
          kind: 'choice',
          prompt: 'Where do unit tests conventionally live?',
          options: [
            { id: 'b', text: 'In the top-level `tests/` directory' },
            { id: 'a', text: 'In the same file, inside `#[cfg(test)] mod tests`' },
            { id: 'c', text: 'In `benches/`' },
          ],
          correct: 'a',
          explain:
            '`tests/` is for integration tests (separate crates). Unit tests sit beside the code they test, compiled out of normal builds by `cfg(test)`.',
        },
        {
          id: 'writing-tests-q4',
          kind: 'choice',
          prompt:
            'What does `fn t() -> Result<(), String>` as a test buy you over `assert!` + `unwrap`?',
          options: [
            { id: 'b', text: 'Tests returning `Result` can never fail' },
            { id: 'c', text: 'It forces the test to run in release mode' },
            { id: 'd', text: 'Nothing — test functions cannot return values' },
            {
              id: 'a',
              text: '`?` inside the test — fallible helpers propagate with real error values instead of panicking blind',
            },
          ],
          correct: 'a',
          explain:
            'TRPL 11.1: `Result`-returning tests let `?` propagate (`Err` = failure with the value attached). The cannot-return-values story denies a stable feature; `#[should_panic]` and `#[ignore]` cover the other special cases.',
        },
      ],
    },
    {
      id: 'test-org',
      title: 'Test Organization',
      fundamental: false,
      prereq: ['writing-tests'],
      difficulty: 2,
      estMinutes: 15,
      reading: [
        { num: '11.3', title: 'Test Organization', href: 'ch11-03-test-organization.html' },
      ],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'test-org-q1',
          kind: 'recite',
          prompt: 'Integration tests in the tests/ directory can access:',
          checklist: [
            'Each file in tests/ is compiled as its own separate crate that depends on your library, so it only sees what’s public.',
          ],
          explain:
            'Each file in tests/ is compiled as its own separate crate that depends on your library, so it only sees what’s public.',
        },
        {
          id: 'test-org-q2',
          kind: 'choice',
          prompt: 'What does `#[cfg(test)]` on `mod tests` actually do?',
          options: [
            { id: 'b', text: 'Marks every test inside as ignored' },
            {
              id: 'a',
              text: 'Compiles the module only under `cargo test`, excluding it from normal builds',
            },
            { id: 'c', text: 'Nothing — it is pure convention' },
          ],
          correct: 'a',
          explain:
            '`cfg(test)` is conditional compilation keyed on the test profile: release/debug binaries never contain the module at all.',
        },
        {
          id: 'test-org-q3',
          kind: 'choice',
          prompt: 'Two integration test files need one shared helper. Where does it go?',
          options: [
            { id: 'a', text: '`tests/common/mod.rs`, pulled in with `mod common;` in each file' },
            { id: 'b', text: '`src/helpers.rs`' },
            { id: 'c', text: 'Duplicated at the top of each test file' },
          ],
          correct: 'a',
          explain:
            'Files directly under `tests/` each become their own crate; only subdirectories like `common/` are exempt, so shared helpers live there as a module.',
        },
        {
          id: 'test-org-q4',
          kind: 'bug',
          prompt:
            '// lib.rs\nmod helpers;\n\n// tests/auth.rs\nuse mycrate::helpers::login;\n\n`helpers` is declared private in `lib.rs`. Running `cargo test` fails to build. Why, and what is the fix?',
          explain:
            'E0603: `module `helpers` is private`. An integration test in `tests/` is a separate crate that links only the public API of your library (TRPL 11.3), and a private `mod helpers;` is invisible outside `lib.rs` itself. Fix: `pub mod helpers;` — or move the helper into `tests/common/mod.rs`, the conventional shared-but-unpublished spot.',
        },
      ],
    },
  ],
};
