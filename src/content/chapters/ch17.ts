import type { Chapter } from '../schema';

export const ch17: Chapter = {
  key: '17',
  num: 17,
  title: 'Fundamentals of Asynchronous Programming',
  integrative: false,
  concepts: [
    {
      id: 'async-futures',
      title: 'Async and Await',
      fundamental: true,
      prereq: ['closures', 'traits'],
      difficulty: 4,
      estMinutes: 35,
      reading: [
        {
          num: '17.1',
          title: 'Futures and the Async Syntax',
          href: 'ch17-01-futures-and-syntax.html',
        },
        {
          num: '17.0',
          title: 'Fundamentals of Asynchronous Programming (chapter overview)',
          href: 'ch17-00-async-await.html',
        },
      ],
      examples: [],
      drills: [{ name: 'async1', href: '24_async/async1.rs' }],
      questions: [
        {
          id: 'async-futures-q1',
          kind: 'predict',
          prompt:
            'let f = async {\n    println!("running");\n    42\n};\nprintln!("created");\n\nWhat prints, and what exactly is `f` at this point?',
          explain:
            'Only "created" prints. The async block body never runs until the future is polled — `f` is just an inert state machine waiting for .await or an executor. "running" appears only after something drives it to completion.',
        },
        {
          id: 'async-futures-q2',
          kind: 'choice',
          prompt:
            'An `async fn fetch() -> Data` — what is its ACTUAL return type before anyone awaits it?',
          options: [
            { id: 'b', text: '`Data`' },
            { id: 'c', text: '`Result<Data>`' },
            { id: 'a', text: '`impl Future<Output = Data>` — an inert state machine' },
          ],
          correct: 'a',
          explain:
            '`async fn` desugars to a regular function returning a future. No executor polling it means no body runs — the Q1 laziness demo is this fact in action.',
        },
        {
          id: 'async-futures-q3',
          kind: 'choice',
          prompt: '`.await` on an already-complete future — what happens?',
          options: [
            { id: 'a', text: 'It resolves immediately without yielding control' },
            { id: 'b', text: 'It always yields to the executor first' },
            { id: 'c', text: 'It panics' },
          ],
          correct: 'a',
          explain:
            '`.await` is not a thread switch: a ready future completes inline. Yielding happens only when the future is genuinely pending.',
        },
        {
          id: 'async-futures-q4',
          kind: 'choice',
          prompt: 'What runs the code inside `async { ... }`?',
          options: [
            { id: 'b', text: 'A fresh OS thread spawned at the `async` keyword' },
            {
              id: 'a',
              text: 'An executor (or an `.await` chain reaching one) — the block itself only builds a lazy state machine',
            },
            { id: 'c', text: 'The compiler runs it at compile time, like `const`' },
            { id: 'd', text: 'It runs immediately, line by line, like a closure body' },
          ],
          correct: 'a',
          explain:
            'TRPL 17: `async` produces an inert future; nothing executes until an executor polls it. The fresh-OS-thread story confuses async with `thread::spawn`; the runs-immediately story confuses it with closures.',
        },
        {
          id: 'async-futures-q5',
          kind: 'bug',
          prompt:
            'async fn fetch() -> i32 { 42 }\nfn main() {\n    let x = fetch();\n    println!("{x}");\n}\n\nWhat goes wrong?',
          explain:
            '`fetch()` returns an un-awaited opaque future, not `i32` — and it implements no `Display`, so `{x}` fails (E0277). The classic beginner error: treating `async fn` as returning the value. Fix: drive it to completion (`block_on(fetch())`, or `.await` inside an async context) and print the resulting `i32`.',
        },
        {
          id: 'async-futures-q6',
          kind: 'predict',
          prompt:
            'What does this print? (needs `futures = "0.3"` in Cargo.toml)\n\nfn main() {\n    let f = async {\n        println!("polled");\n        1\n    };\n    println!("built");\n    futures::executor::block_on(async {\n        let x = f.await;\n        println!("got {x}");\n    });\n}',
          explain:
            'Nothing inside `f` runs at construction — the first poll happens at `.await`, driven by `block_on`. Output:\nbuilt\npolled\ngot 1',
        },
      ],
    },
    {
      id: 'async-concurrency',
      title: 'Async Concurrency',
      fundamental: false,
      prereq: ['async-futures', 'threads'],
      difficulty: 4,
      estMinutes: 40,
      reading: [
        {
          num: '17.2',
          title: 'Applying Concurrency with Async',
          href: 'ch17-02-concurrency-with-async.html',
        },
        {
          num: '17.3',
          title: 'Working With Any Number of Futures',
          href: 'ch17-03-more-futures.html',
        },
        { num: '17.4', title: 'Streams: Futures in Sequence', href: 'ch17-04-streams.html' },
        {
          num: '17.5',
          title: 'A Closer Look at the Traits for Async',
          href: 'ch17-05-traits-for-async.html',
        },
        {
          num: '17.6',
          title: 'Futures, Tasks, and Threads',
          href: 'ch17-06-futures-tasks-threads.html',
        },
      ],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'async-concurrency-q1',
          kind: 'choice',
          prompt:
            'Does `async`/`.await` inherently guarantee code executes on a separate OS thread?',
          options: [
            { id: 'a', text: 'Yes, always' },
            { id: 'c', text: 'Yes, but only when using tokio' },
            {
              id: 'b',
              text: 'No — thread allocation is determined by the underlying executor runtime',
            },
          ],
          correct: 'b',
          explain:
            'Async is cooperative multitasking; whether tasks run across thread pools or on a single thread depends on the runtime configuration.',
        },
        {
          id: 'async-concurrency-q2',
          kind: 'choice',
          prompt:
            'Two tasks `.await`ing the same sleep sequentially vs `tokio::join!` on both — what differs?',
          options: [
            {
              id: 'a',
              text: '`join!` polls both concurrently, interleaving progress; sequential await runs the first to completion before starting the second',
            },
            { id: 'b', text: 'Nothing — they are equivalent spellings' },
            { id: 'c', text: '`join!` spawns OS threads' },
          ],
          correct: 'a',
          explain:
            'Concurrency in async means interleaved polling on (possibly) one thread, and only combinators like `join!` create the interleaving. Sequential awaits never overlap.',
        },
        {
          id: 'async-concurrency-q3',
          kind: 'choice',
          prompt: 'What does `Send` have to do with async code?',
          options: [
            { id: 'b', text: 'Nothing at all' },
            {
              id: 'a',
              text: 'Futures moved across threads (e.g. spawned on a multi-thread executor) must be `Send` — holding `Rc` across `.await` breaks it',
            },
            { id: 'c', text: 'Every future is automatically `Send`' },
          ],
          correct: 'a',
          explain:
            'The classic compile wall: an `Rc` held across an await point makes the whole future `!Send`, and `spawn` refuses it. Same ownership rules, new context.',
        },
        {
          id: 'async-concurrency-q4',
          kind: 'choice',
          prompt: 'What happens to a future dropped mid-`.await` (e.g. losing a `select!` race)?',
          options: [
            {
              id: 'a',
              text: 'It is cancelled — dropping a future stops its progress; destructors of live state still run',
            },
            { id: 'b', text: 'It keeps running in the background' },
            { id: 'c', text: 'The executor panics' },
            { id: 'd', text: 'It restarts from scratch on the next poll' },
          ],
          correct: 'a',
          explain:
            'TRPL 17: cancellation-by-dropping is the async model — unlike threads, no handle outlives the future, so `select!` losers simply drop. Scope-guard/`Drop` cleanup still executes, which is exactly why holding locks across `.await` is dangerous.',
        },
        {
          id: 'async-concurrency-q5',
          kind: 'choice',
          prompt: 'Why do async blocks so often need `async move` before spawning?',
          options: [
            { id: 'b', text: '`move` makes the future run on a separate thread automatically' },
            {
              id: 'a',
              text: 'Borrowed captures would force the future to borrow stack data that may not outlive the spawned task — `move` gives the future ownership',
            },
            { id: 'c', text: 'Without `move`, async blocks cannot contain `.await`' },
            { id: 'd', text: 'It is pure convention with no semantic effect' },
          ],
          correct: 'a',
          explain:
            "TRPL 17: spawned tasks must be `'static`; borrowing locals violates that. `move` transfers ownership into the future — the same rule as `thread::spawn`, applied to futures.",
        },
        {
          id: 'async-concurrency-q6',
          kind: 'bug',
          prompt:
            'async fn f() {\n    let data = vec![1, 2, 3];\n    tokio::spawn(async {\n        println!("{:?}", data);\n    });\n}\n\nWhy does spawning reject this?',
          explain:
            "The inner future borrows `data` from the enclosing frame, but spawned tasks must be `'static` — the task may outlive `f`. The borrow checker refuses: E0373, async block may outlive the current function. Fix: `async move` so the future owns `data`. (This also needs `tokio` in Cargo.toml; a bare `fn spawn<F: Future + Send + 'static>` gives the same error without a dependency.)",
        },
      ],
    },
  ],
};
