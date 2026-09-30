# Adding curriculum content

The curriculum is 22 chapter modules under `src/content/chapters/`, one per
TRPL chapter plus a bonus group. Everything in them is validated by
[valibot](https://valibot.dev) at module load, so a malformed entry fails
`npm test` and the site refuses to start rather than rendering a broken lesson.

## Shape

```ts
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
      ],
      examples: [],
      drills: [{ name: 'move_semantics1', href: '06_move_semantics/move_semantics1.rs' }],
      questions: [
        /* see below */
      ],
    },
  ],
};
```

### Rules the schema enforces

| Field             | Rule                                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `id`              | kebab-case, unique across the whole curriculum                                                                                          |
| `prereq`          | must name a lesson declared in an **earlier** chapter; the graph must stay acyclic (both are tested in `tests/unit/curriculum.test.ts`) |
| `difficulty`      | 1 to 4, not 1 to 5                                                                                                                      |
| `estMinutes`      | integer, 5 to 240                                                                                                                       |
| `reading[].href`  | a path inside `public/book-html/`, or a full `https://` URL for an external doc page. Never start it with `/` and never with `../`      |
| `examples[].href` | a path inside `public/rbe-html/`                                                                                                        |
| `drills[].href`   | a path inside `public/rustlings/exercises/`, including the `.rs` extension                                                              |
| `drills[].name`   | the exercise name without the extension or directory; used as the progress key                                                          |
| `questions[].id`  | unique within the lesson; used as the progress key, so renaming it discards answers for that question                                   |

`tests/unit/content.test.ts` checks that every href above exists on disk. If you
add a reference to a page that is not vendored, that test fails with the path.

## Writing a question

Four kinds, discriminated on `kind`:

```ts
// Auto-judged. `correct` must be one of the option ids.
{ id: 'ownership-q1', kind: 'choice', prompt: '…', options: [{ id: 'a', text: '…' }], correct: 'a', explain: '…' }

// Self-assessed. The learner sees the answer, then grades themselves.
{ id: 'ownership-q3', kind: 'predict', prompt: '…', explain: '…' }
{ id: 'ownership-q4', kind: 'bug', prompt: '…', explain: '…' }
{ id: 'ownership-q5', kind: 'recite', prompt: '…', explain: '…' }

// A project acceptance checklist rather than a knowledge question.
{ id: 'final-project-q1', kind: 'recite', prompt: '…', checklist: ['…', '…'], explain: '…' }
```

A checkpoint passes only when **every** question is answered correctly. For a
`choice` question that means the right option; for the self-assessed kinds it
means the learner pressed "Yes" after reading the answer. There is no partial
credit, by design: the point is to decide whether to schedule a review, not to
award points.

### Text markup

`prompt` and `explain` are plain strings with a small markup convention that
`src/lib/domain/richtext.ts` turns into renderable segments:

| Written as                                                                         | Renders as                                                                 |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `` `code` ``                                                                       | an inline code span                                                        |
| a fenced block, or a blank-line-separated paragraph of 2+ lines with a Rust marker | a code block                                                               |
| a paragraph ending in `Output:` followed by lines                                  | a console-output block                                                     |
| a sentence containing `→` (U+2192)                                                 | a numbered cause → effect list; `;`-separated arrows become separate steps |
| a paragraph of `1. [ ] item` lines                                                 | a checklist                                                                |

Rules that follow from those:

- `Output:` is capitalised on purpose. Prose must say "output" in lower case, or
  the renderer will swallow the rest of the paragraph.
- `→` must not appear inside a code span in an explanation.
- Every explanation says why, not just what. A learner who got it right should
  learn the rule, and one who got it wrong should learn the misconception.

### Content that has to be true

A `find_bug` question claims that a specific snippet produces a specific
compiler error. That claim is checked. When you write one:

1. Put the snippet in a file and compile it: `rustc --edition 2024 snippet.rs`.
2. Copy the real error text and its `E0xxx` code into the explanation.
3. Make sure the snippet produces **that** error and not an incidental one first.
   A missing `use` statement or an undefined helper in the snippet masks the
   error the question is about, and the learner sees the wrong diagnostic.

The same applies to a `predict_output` question that shows an `Output:` block:
run the program and diff. The audit that produced the current content ran all
32 of them against the installed toolchain.

If a snippet needs an external crate, say so in the prompt (`(needs
futures = "0.3" in Cargo.toml)`) rather than leaving the learner to hit an
`E0433` and wonder whether that is the answer.

## After editing

```sh
npm run verify   # lint, typecheck, unit tests, build, vendored checksums
npm run e2e      # the built site under the Pages prefix
```

`tests/unit/quiz.test.ts` rejects a `choice` question whose `correct` id is not
one of its options, and rejects two options that share an id or repeat the
answer text verbatim.
