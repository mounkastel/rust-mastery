import type { Chapter } from '../schema';

export const ch16: Chapter = {
  key: '16',
  num: 16,
  title: 'Fearless Concurrency',
  integrative: false,
  concepts: [
    {
      id: 'threads',
      title: 'Spawning Threads',
      fundamental: true,
      prereq: ['closures'],
      difficulty: 3,
      estMinutes: 30,
      reading: [
        {
          num: '16.1',
          title: 'Using Threads to Run Code Simultaneously',
          href: 'ch16-01-threads.html',
        },
        {
          num: '16.0',
          title: 'Fearless Concurrency (chapter overview)',
          href: 'ch16-00-concurrency.html',
        },
      ],
      examples: [],
      drills: [
        { name: 'threads1', href: '20_threads/threads1.rs' },
        { name: 'threads2', href: '20_threads/threads2.rs' },
      ],
      questions: [
        {
          id: 'threads-q1',
          kind: 'choice',
          prompt: 'Why does thread::spawn typically require a `move` closure?',
          options: [
            { id: 'a', text: 'It is required syntax with no deeper meaning' },
            {
              id: 'b',
              text: 'The spawned thread may outlive the caller stack frame, so it requires owned data',
            },
            { id: 'c', text: 'To make the closure run faster on multiple cores' },
          ],
          correct: 'b',
          explain:
            'The compiler cannot guarantee that borrowed stack references remain valid for the lifespan of the spawned thread.',
        },
        {
          id: 'threads-q2',
          kind: 'bug',
          prompt:
            'use std::thread;\nfn main() {\n    let v = vec![1, 2, 3];\n    let h = thread::spawn(|| {\n        println!("{:?}", v);\n    });\n    h.join().unwrap();\n}\n\nEven with `join` right there, why is this rejected?',
          explain:
            "E0373: `spawn` demands a `'static` closure, and borrowing `v` cannot satisfy it — the type system cannot see your `join`. Fix: `move` the data in (`move ||`, cloning or `Arc` as needed).",
        },
        {
          id: 'threads-q3',
          kind: 'choice',
          prompt: 'If `main` returns without joining a spawned thread, what happens to it?',
          options: [
            { id: 'b', text: 'It keeps running after `main` exits' },
            { id: 'c', text: 'It blocks `main` from exiting' },
            { id: 'a', text: 'It is forcibly stopped when `main` exits' },
          ],
          correct: 'a',
          explain:
            'Threads are not joined implicitly: process exit kills them mid-flight, silently dropping work. Always `join` handles you care about.',
        },
        {
          id: 'threads-q4',
          kind: 'choice',
          prompt: 'What does `handle.join().unwrap()` do?',
          options: [
            { id: 'b', text: 'Detaches the thread to run independently' },
            { id: 'c', text: 'Kills the thread immediately' },
            { id: 'd', text: 'Sends a shutdown signal the thread may ignore' },
            {
              id: 'a',
              text: 'Blocks until the thread finishes and propagates its `Result` — a child panic arrives as `Err` here',
            },
          ],
          correct: 'a',
          explain:
            "TRPL 16.1: `join` blocks for completion; the `Result` carries the thread's return value or its panic payload. Dropping the handle does NOT stop the thread — only process exit does (the previous question's lesson).",
        },
        {
          id: 'threads-q5',
          kind: 'choice',
          prompt:
            '`thread::spawn` requires its closure to be `Send`. Why does an `Rc<i32>` capture fail this bound while `Arc<i32>` passes?',
          options: [
            { id: 'b', text: '`Rc` heap data is secretly stack-allocated' },
            { id: 'c', text: 'The compiler arbitrarily forbids all smart pointers except `Arc`' },
            {
              id: 'a',
              text: '`Rc` counting is non-atomic — concurrent increments would race; `Arc` uses atomics and earns `Send` + `Sync`',
            },
            { id: 'd', text: '`Arc` clones the data per thread, `Rc` does not' },
          ],
          correct: 'a',
          explain:
            'TRPL 16.1/16.4: `Rc<T>` is `!Send + !Sync` because plain-integer increments race across threads; `Arc` pays for atomic ops. The clones-per-thread story invents per-thread cloning — both pointers share one allocation.',
        },
      ],
    },
    {
      id: 'message-passing',
      title: 'Message Passing',
      fundamental: true,
      prereq: ['threads'],
      difficulty: 3,
      estMinutes: 25,
      reading: [
        {
          num: '16.2',
          title: 'Transfer Data Between Threads with Message Passing',
          href: 'ch16-02-message-passing.html',
        },
      ],
      examples: [],
      drills: [{ name: 'threads3', href: '20_threads/threads3.rs' }],
      questions: [
        {
          id: 'message-passing-q1',
          kind: 'choice',
          prompt: '"mpsc" stands for:',
          options: [
            { id: 'a', text: 'multiple producer, single consumer' },
            { id: 'b', text: 'multi-process synchronous channel' },
            { id: 'c', text: 'mutex-protected shared cache' },
          ],
          correct: 'a',
          explain:
            'std::sync::mpsc provides channels with multiple transmitter handles and a single receiver handle.',
        },
        {
          id: 'message-passing-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nuse std::sync::mpsc;\nfn main() {\n    let (tx, rx) = mpsc::channel();\n    tx.send(10).unwrap();\n    tx.send(20).unwrap();\n    drop(tx);\n    let mut total = 0;\n    for x in rx {\n        total += x;\n    }\n    println!("{total}");\n}',
          explain:
            'Iterating the receiver yields messages until ALL senders are gone — hence the deliberate `drop(tx)`. 10 + 20 = 30. Forget the drop and the loop hangs forever.',
        },
        {
          id: 'message-passing-q3',
          kind: 'choice',
          prompt:
            '“Do not communicate by sharing memory; share memory by communicating.” What does it mean in practice?',
          options: [
            { id: 'b', text: 'Shared memory is always slower' },
            {
              id: 'a',
              text: 'Transfer ownership through the channel — the channel owns in-flight data, no joint mutable state',
            },
            { id: 'c', text: '`Mutex` is deprecated' },
          ],
          correct: 'a',
          explain:
            'Sending `T` through a channel MOVES it: exactly one owner at every moment. The slogan is ownership applied to concurrency.',
        },
        {
          id: 'message-passing-q4',
          kind: 'choice',
          prompt: 'How do you build a multi-producer channel from `mpsc::channel()`?',
          options: [
            {
              id: 'a',
              text: 'Clone the `Sender` (`tx.clone()`) per producer — the channel is multi-producer, single-consumer',
            },
            { id: 'b', text: 'Clone the `Receiver` the same way' },
            { id: 'c', text: 'Call `mpsc::channel()` once per producer and merge the receivers' },
            { id: 'd', text: 'Wrap the `Sender` in `Arc<Mutex<..>>`' },
          ],
          correct: 'a',
          explain:
            "TRPL 16.2: `mpsc` = multiple producer, single consumer — `Sender: Clone`, `Receiver: !Clone`. The `Arc<Mutex<..>>` wrapper works but fights the API; the book's pattern is cloned senders plus one receiver.",
        },
        {
          id: 'message-passing-q5',
          kind: 'bug',
          prompt:
            'fn main() {\n    use std::sync::mpsc;\n    let (tx, rx) = mpsc::channel();\n    let msg = String::from("hi");\n    tx.send(msg).unwrap();\n    println!("{msg}");\n}\n\nWhy rejected?',
          explain:
            '`send` takes ownership — the `String` moves into the channel (that IS the "share by communicating" transfer). `println!("{msg}")` borrows a moved value (E0382). Fix: `clone()` before sending, or stop using `msg` afterwards.',
        },
      ],
    },
    {
      id: 'shared-state',
      title: 'Shared State',
      fundamental: true,
      prereq: ['threads', 'rc'],
      difficulty: 4,
      estMinutes: 35,
      reading: [
        { num: '16.3', title: 'Shared-State Concurrency', href: 'ch16-03-shared-state.html' },
        {
          num: '16.4',
          title: 'Extensible Concurrency with Send and Sync',
          href: 'ch16-04-extensible-concurrency-sync-and-send.html',
        },
      ],
      examples: [],
      drills: [{ name: 'threads2', href: '20_threads/threads2.rs' }],
      questions: [
        {
          id: 'shared-state-q1',
          kind: 'bug',
          prompt:
            'use std::{rc::Rc, sync::Mutex, thread};\n\nfn main() {\n    let counter = Rc::new(Mutex::new(0));\n    let mut handles = vec![];\n    for _ in 0..4 {\n        let c = Rc::clone(&counter);\n        handles.push(thread::spawn(move || {\n            *c.lock().unwrap() += 1;\n        }));\n    }\n}\n\nWhy won’t this compile, and what single type swap fixes it?',
          explain:
            'Rc<T> is not Send — its reference count uses non-atomic operations, so the compiler forbids moving it into a thread (E0277). Swap Rc for Arc: Arc<Mutex<i32>> counts atomically and is both Send and Sync.',
        },
        {
          id: 'shared-state-q2',
          kind: 'predict',
          prompt:
            'What does this print?\n\nuse std::sync::Mutex;\nfn main() {\n    let m = Mutex::new(5);\n    *m.lock().unwrap() += 1;\n    println!("{}", m.into_inner().unwrap());\n}',
          explain:
            '`lock()` yields a guard dereferencing to the inner value; `into_inner` consumes the mutex to reclaim it. (The `unwrap`s cover poisoning — a panicked-while-locked thread.) Output:\n6',
        },
        {
          id: 'shared-state-q3',
          kind: 'choice',
          prompt: '`Mutex<T>` vs `RefCell<T>` — what is the fundamental difference?',
          options: [
            { id: 'b', text: '`Mutex` is faster' },
            {
              id: 'a',
              text: '`Mutex` is `Sync`: thread-safe interior mutability via locking; `RefCell` is single-threaded runtime checks',
            },
            { id: 'c', text: 'There is none' },
          ],
          correct: 'a',
          explain:
            'Same idea (checked shared mutation), different domains: `RefCell` panics on misuse in one thread, `Mutex` blocks across threads. Pick by `Sync`, not habit.',
        },
        {
          id: 'shared-state-q4',
          kind: 'choice',
          prompt:
            'A second thread locks a `Mutex` whose previous holder panicked while holding it. What happens?',
          options: [
            { id: 'b', text: 'It blocks forever' },
            { id: 'c', text: 'It silently succeeds with default data' },
            {
              id: 'a',
              text: 'The lock returns `Err(PoisonError)` — the mutex is "poisoned" to flag possibly-broken invariants; the locker decides whether to recover via `into_inner()`',
            },
            { id: 'd', text: 'The whole program aborts immediately' },
          ],
          correct: 'a',
          explain:
            'TRPL 16.3: poisoning is a flag, not a deadlock — `lock()` yields `Err`, and `.unwrap()` on it is what most examples use (panicking in turn). Recovery is `poison_error.into_inner()`. The blocks-forever story confuses poisoning with deadlock; the book stresses poisoned ≠ locked-forever.',
        },
        {
          id: 'shared-state-q5',
          kind: 'predict',
          prompt:
            'What does this print?\n\nfn main() {\n    use std::sync::Mutex;\n    let m = Mutex::new(1);\n    let _g = m.lock().unwrap();\n    match m.try_lock() {\n        Ok(_) => println!("open"),\n        Err(_) => println!("held"),\n    }\n}',
          explain:
            '`_g` still holds the guard, so `try_lock` fails immediately instead of blocking. Contrast blocking `lock()`, which here would deadlock the single thread — `try_lock` exists precisely to ask without waiting. Output:\nheld',
        },
        {
          id: 'shared-state-q6',
          kind: 'bug',
          prompt:
            "fn main() {\n    use std::sync::Mutex;\n    let m = Mutex::new(1);\n    let _a = m.lock().unwrap();\n    let _b = m.lock().unwrap();\n}\n\nWhat happens at runtime, and why won't the compiler save you?",
          explain:
            'Self-deadlock: the second `lock()` blocks forever waiting on a guard the same thread holds — `Mutex` is not reentrant. Locks are runtime state with invisible ordering, so the compiler cannot see it; this compiles cleanly and hangs. Fix: scope the first guard (inner block or `drop(_a)`) before relocking.',
        },
      ],
    },
  ],
};
