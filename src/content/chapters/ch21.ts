import type { Chapter } from '../schema';

export const ch21: Chapter = {
  key: '21',
  num: 21,
  title: 'Final Project: Building a Multithreaded Web Server',
  integrative: true,
  concepts: [
    {
      id: 'final-project',
      title: 'Web Server Capstone',
      fundamental: false,
      prereq: ['threads', 'message-passing', 'shared-state', 'box', 'closures', 'result', 'traits'],
      difficulty: 4,
      estMinutes: 120,
      reading: [
        {
          num: '21',
          title: 'Final Project: Multithreaded Web Server',
          href: 'ch21-00-final-project-a-web-server.html',
        },
        {
          num: '21.1',
          title: 'Building a Single-Threaded Web Server',
          href: 'ch21-01-single-threaded.html',
        },
        {
          num: '21.2',
          title: 'From Single-Threaded to Multithreaded Server',
          href: 'ch21-02-multithreaded.html',
        },
        {
          num: '21.3',
          title: 'Graceful Shutdown and Cleanup',
          href: 'ch21-03-graceful-shutdown-and-cleanup.html',
        },
      ],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'final-project-q1',
          kind: 'recite',
          prompt:
            'Capstone Acceptance Checklist — verify your Multithreaded Web Server:\n\n1. [ ] Listens for incoming TCP streams on 127.0.0.1:7878 via std::net::TcpListener.\n2. [ ] Implemented ThreadPool struct managing a fixed number of worker threads.\n3. [ ] Dispatches jobs across threads using an mpsc channel with Arc<Mutex<Receiver<Job>>>.\n4. [ ] Implemented graceful shutdown via Drop for ThreadPool, joining all workers.\n5. [ ] Server responds to concurrent browser requests without blocking other connections.\n\nAre all 5 requirements functioning in your local build?',
          checklist: [
            'Outstanding achievement! Building this thread-pooled server synthesizes ownership, closures (Box<dyn FnOnce()>), concurrency primitives (Arc, Mutex, mpsc), and graceful cleanup (Drop, JoinHandle). You have mastered the core Rust curriculum!',
          ],
          explain:
            'Outstanding achievement! Building this thread-pooled server synthesizes ownership, closures (Box<dyn FnOnce()>), concurrency primitives (Arc, Mutex, mpsc), and graceful cleanup (Drop, JoinHandle). You have mastered the core Rust curriculum!',
        },
        {
          id: 'final-project-q2',
          kind: 'choice',
          prompt: 'Why `Arc<Mutex<Receiver<Job>>>` for the job queue, not `Rc<RefCell<...>>`?',
          options: [
            {
              id: 'a',
              text: 'Workers are OS threads — shared state must be `Send + Sync`; `Rc`/`RefCell` are neither',
            },
            { id: 'b', text: '`Arc` is faster' },
            { id: 'c', text: 'There is no reason' },
          ],
          correct: 'a',
          explain:
            'The whole course converges here: `Rc` failed threads back in shared-state, `RefCell` fails `Sync` — only atomically-counted, lock-guarded sharing crosses thread boundaries.',
        },
        {
          id: 'final-project-q3',
          kind: 'choice',
          prompt: 'What does the `ThreadPool`’s `Drop` impl accomplish?',
          options: [
            { id: 'b', text: 'Frees the TCP port' },
            {
              id: 'a',
              text: 'Graceful shutdown: signals workers to exit and joins them so no work is truncated',
            },
            { id: 'c', text: 'Nothing — `Drop` here is a formality' },
          ],
          correct: 'a',
          explain:
            'Without it, `main` returning would slaughter in-flight workers mid-request (the threads-lesson warning, weaponized). `Drop` turns shutdown into a protocol.',
        },
        {
          id: 'final-project-q4',
          kind: 'choice',
          prompt: 'What does `listener.incoming()` yield per connection?',
          options: [
            { id: 'b', text: 'A vector of all connections at once' },
            { id: 'c', text: 'Raw byte buffers off the socket' },
            {
              id: 'a',
              text: 'An iterator of `Result<TcpStream>` — each accepted connection (or accept error) arrives in turn',
            },
            { id: 'd', text: 'One `TcpStream` multiplexing every connection' },
          ],
          correct: 'a',
          explain:
            'TRPL 21.1: `incoming()` is a blocking iterator over accept results — the `for stream in listener.incoming()` loop IS the single-threaded server. Each item is independently `Ok(stream)`/`Err`, which is why the book handles errors per item.',
        },
        {
          id: 'final-project-q5',
          kind: 'choice',
          prompt:
            'Workers loop on `receiver.recv()`. Why does dropping the `Sender` terminate the loop instead of hanging?',
          options: [
            { id: 'b', text: 'Dropping the sender panics all worker threads' },
            { id: 'c', text: 'Workers poll a shutdown flag that the drop sets' },
            { id: 'd', text: 'It does not terminate — workers must be killed explicitly' },
            {
              id: 'a',
              text: '`recv()` returns `Err` on disconnect, ending `while let Ok(job)` loops — disconnection is the shutdown signal',
            },
          ],
          correct: 'a',
          explain:
            'TRPL 21.2/21.3 graceful shutdown: no sentinel value or flag needed — channel disconnection IS the signal. Forgetting to drop the sender (holding a clone somewhere) is the classic hang; audit your `Sender` clones first.',
        },
        {
          id: 'final-project-q6',
          kind: 'choice',
          prompt:
            'Why does the book call the final `ThreadPool` version "graceful" compared to thread-per-connection?',
          options: [
            {
              id: 'a',
              text: 'Bounded workers plus clean shutdown: no unbounded spawning under load, and `Drop` drains in-flight requests instead of abandoning them',
            },
            { id: 'b', text: 'The pool makes each individual request faster' },
            { id: 'c', text: 'Thread-per-connection cannot serve HTTP at all' },
            { id: 'd', text: 'The pool removes the need for `Arc`/`Mutex` sharing' },
          ],
          correct: 'a',
          explain:
            'TRPL 21.2/21.3: unbounded spawning is a denial-of-service vector (slowloris-style); the pool caps concurrency, and `Drop` joins workers after disconnecting the queue so in-flight work completes. The faster-requests story confuses throughput architecture with latency.',
        },
      ],
    },
  ],
};
