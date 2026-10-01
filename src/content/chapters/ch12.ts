import type { Chapter } from '../schema';

export const ch12: Chapter = {
  key: '12',
  num: 12,
  title: 'An I/O Project: Building a Command Line Program',
  integrative: true,
  concepts: [
    {
      id: 'io-project',
      title: 'Minigrep Project',
      fundamental: false,
      prereq: ['result', 'vectors', 'strings'],
      difficulty: 3,
      estMinutes: 60,
      reading: [
        { num: '12', title: 'An I/O Project: minigrep', href: 'ch12-00-an-io-project.html' },
        {
          num: '12.1',
          title: 'Accepting Command Line Arguments',
          href: 'ch12-01-accepting-command-line-arguments.html',
        },
        { num: '12.2', title: 'Reading a File', href: 'ch12-02-reading-a-file.html' },
        {
          num: '12.3',
          title: 'Refactoring to Improve Modularity and Error Handling',
          href: 'ch12-03-improving-error-handling-and-modularity.html',
        },
        {
          num: '12.4',
          title: 'Adding Functionality with Test Driven Development',
          href: 'ch12-04-testing-the-librarys-functionality.html',
        },
        {
          num: '12.5',
          title: 'Working with Environment Variables',
          href: 'ch12-05-working-with-environment-variables.html',
        },
        {
          num: '12.6',
          title: 'Redirecting Errors to Standard Error',
          href: 'ch12-06-writing-to-stderr-instead-of-stdout.html',
        },
      ],
      examples: [
        { title: 'Program arguments', href: 'std_misc/arg.html', kind: 'reinforce' },
        { title: 'Argument parsing', href: 'std_misc/arg/matching.html', kind: 'reinforce' },
        { title: 'File I/O', href: 'std_misc/file.html', kind: 'reinforce' },
        { title: '`open`', href: 'std_misc/file/open.html', kind: 'reinforce' },
        { title: '`create`', href: 'std_misc/file/create.html', kind: 'reinforce' },
        { title: '`read_lines`', href: 'std_misc/file/read_lines.html', kind: 'reinforce' },
        { title: 'Filesystem Operations', href: 'std_misc/fs.html', kind: 'reinforce' },
        { title: 'Path', href: 'std_misc/path.html', kind: 'reinforce' },
        { title: 'Child processes', href: 'std_misc/process.html', kind: 'reinforce' },
        { title: 'Pipes', href: 'std_misc/process/pipe.html', kind: 'reinforce' },
        { title: 'Wait', href: 'std_misc/process/wait.html', kind: 'reinforce' },
      ],
      drills: [],
      questions: [
        {
          id: 'io-project-q1',
          kind: 'recite',
          prompt:
            'Project Acceptance Checklist — verify your minigrep build in your terminal:\n\n1. [ ] Extracted CLI parsing & file-reading out of main.rs into src/lib.rs.\n2. [ ] Handled errors with Result<(), Box<dyn Error>> rather than unwrap/panic.\n3. [ ] Implemented case-sensitive and case-insensitive search via environment variable.\n4. [ ] Automated test suite in src/lib.rs passes cleanly (`cargo test`).\n\nHave you verified all 4 criteria in your local working project?',
          explain:
            'Congratulations! Minigrep proves you can coordinate Result error propagation, argument parsing, file I/O, and test-driven development into a clean, modular CLI tool.',
        },
        {
          id: 'io-project-q2',
          kind: 'choice',
          prompt:
            'Why does minigrep’s `run()` return `Result<(), Box<dyn Error>>` instead of `()`?',
          options: [
            { id: 'b', text: 'To make the binary run faster' },
            { id: 'c', text: 'The borrow checker requires it' },
            {
              id: 'a',
              text: 'So `?` can propagate any error type up to `main`, which prints it and exits nonzero',
            },
          ],
          correct: 'a',
          explain:
            'One error type for the whole program is impractical; `Box<dyn Error>` erases the concrete type while `?` keeps propagation uniform. `main` returning `Result` turns Err into a message plus a nonzero exit.',
        },
        {
          id: 'io-project-q3',
          kind: 'choice',
          prompt: '`eprintln!` vs `println!` — when must errors go to stderr?',
          options: [
            { id: 'b', text: 'Never — both streams are identical' },
            {
              id: 'a',
              text: 'Always for errors, so `program > out.txt` still shows them on screen',
            },
            { id: 'c', text: 'Only inside unit tests' },
          ],
          correct: 'a',
          explain:
            'Chapter 12.6’s whole point: stdout is for program output (redirectable), stderr for diagnostics. Mixing them corrupts redirected output.',
        },
        {
          id: 'io-project-q4',
          kind: 'choice',
          prompt:
            "Why does the book refactor minigrep's config parsing onto iterators (`args.skip(2)`, `contents.lines()`) instead of indexing?",
          options: [
            { id: 'b', text: 'Iterators are always faster than indexing' },
            { id: 'c', text: 'Indexing `env::args()` is forbidden by the type system' },
            {
              id: 'a',
              text: 'Clarity plus boundary safety: no manual index bookkeeping means no off-by-one panics; the code states what it wants, not how to walk',
            },
            { id: 'd', text: 'It avoids all heap allocations' },
          ],
          correct: 'a',
          explain:
            'TRPL 12.4/13: iterator adapters encode intent (`skip`, `lines`, `collect`) where indexing encodes mechanics — and every manual index is a potential out-of-bounds panic. The always-faster story overclaims; the win is correctness-by-construction.',
        },
        {
          id: 'io-project-q5',
          kind: 'predict',
          prompt:
            'What does this print with `IGNORE_CASE=1` set?\n\nfn main() {\n    let case_sensitive = std::env::var("IGNORE_CASE").is_err();\n    println!("{case_sensitive}");\n}',
          explain:
            '`var("IGNORE_CASE")` succeeds (`Ok`), so `.is_err()` is `false`. The double negative reads oddly but encodes the book\'s convention exactly: presence of the flag *disables* sensitivity (TRPL 12.6). Output:\nfalse',
        },
      ],
    },
  ],
};
