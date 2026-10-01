import type { Chapter } from '../schema';

export const ch02: Chapter = {
  key: '2',
  num: 2,
  title: 'Programming a Guessing Game',
  integrative: true,
  concepts: [
    {
      id: 'guessing-game',
      title: 'Guessing Game',
      fundamental: false,
      prereq: ['cargo-basics'],
      difficulty: 2,
      estMinutes: 30,
      reading: [
        {
          num: '2',
          title: 'Programming a Guessing Game',
          href: 'ch02-00-guessing-game-tutorial.html',
        },
      ],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'guessing-game-q1',
          kind: 'choice',
          prompt:
            'In the guessing game walkthrough, what was the primary purpose of the `match` expression?',
          options: [
            {
              id: 'a',
              text: 'To branch cleanly on all possible outcomes (Result Ok/Err, or Ordering Less/Greater/Equal)',
            },
            { id: 'b', text: 'To generate random numbers' },
            { id: 'c', text: 'To import external crates' },
          ],
          correct: 'a',
          explain:
            '`match` enables exhaustive pattern matching across all possible variants (like Ok/Err or Less/Greater/Equal). Chapters 3 through 6 will formally break down variables, types, and match syntax step-by-step.',
        },
        {
          id: 'guessing-game-q2',
          kind: 'choice',
          prompt: '`rand` is in Cargo.toml, yet the code still needs `use rand::Rng;`. Why?',
          options: [
            { id: 'b', text: '`use` downloads the crate from crates.io' },
            {
              id: 'a',
              text: 'Cargo.toml only fetches and builds the crate; `use` brings the trait into scope',
            },
            { id: 'c', text: 'It is boilerplate and can be deleted' },
          ],
          correct: 'a',
          explain:
            'Dependencies and scope are separate steps: Cargo.toml makes the crate available, `use` makes its items nameable. Without the trait in scope, `.gen_range()` would not resolve.',
        },
        {
          id: 'guessing-game-q3',
          kind: 'bug',
          prompt:
            'use std::io;\n\nfn main() {\n    let guess = String::new();\n    io::stdin().read_line(&mut guess).expect("failed");\n}\n\nThe compiler rejects this. Which line must change, and how?',
          explain:
            '`guess` is immutable, so `&mut guess` is illegal (E0596: cannot borrow as mutable). Fix: `let mut guess = String::new();`.',
        },
        {
          id: 'guessing-game-q4',
          kind: 'choice',
          prompt:
            'The game parses input with `let guess: u32 = guess.trim().parse()...`. Why shadowing instead of declaring `mut guess`?',
          options: [
            { id: 'a', text: '`mut` would work identically — shadowing here is pure style' },
            { id: 'c', text: 'Shadowed variables skip the borrow checker' },
            { id: 'd', text: '`mut` bindings cannot be used inside `expect`' },
            {
              id: 'b',
              text: "The type changes from `String` to `u32`; `mut` cannot change a variable's type, shadowing can",
            },
          ],
          correct: 'b',
          explain:
            '`let mut guess` keeps one type forever; `let guess = ...` creates a fresh binding that may hold a new type. The book leans on exactly this: the name is reused while the value crosses from `String` to `u32`. The skip-the-borrow-checker and no-`mut`-in-`expect` stories invent rules that do not exist.',
        },
      ],
    },
  ],
};
