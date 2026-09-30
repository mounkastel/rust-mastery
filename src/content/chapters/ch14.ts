import type { Chapter } from '../schema';

export const ch14: Chapter = {
  key: '14',
  num: 14,
  title: 'More about Cargo and Crates.io',
  integrative: true,
  concepts: [
    {
      id: 'cargo-advanced',
      title: 'Advanced Cargo',
      fundamental: false,
      prereq: ['packages-crates'],
      difficulty: 2,
      estMinutes: 40,
      integrative: true,
      reading: [
        {
          num: '14',
          title: 'More about Cargo and Crates.io',
          href: 'ch14-00-more-about-cargo.html',
        },
        {
          num: '14.1',
          title: 'Customizing Builds with Release Profiles',
          href: 'ch14-01-release-profiles.html',
        },
        {
          num: '14.2',
          title: 'Publishing a Crate to Crates.io',
          href: 'ch14-02-publishing-to-crates-io.html',
        },
        { num: '14.3', title: 'Cargo Workspaces', href: 'ch14-03-cargo-workspaces.html' },
        {
          num: '14.4',
          title: 'Installing Binaries with cargo install',
          href: 'ch14-04-installing-binaries.html',
        },
        {
          num: '14.5',
          title: 'Extending Cargo with Custom Commands',
          href: 'ch14-05-extending-cargo.html',
        },
      ],
      examples: [],
      drills: [],
      questions: [
        {
          id: 'cargo-advanced-q1',
          kind: 'choice',
          prompt:
            'Which profile does `cargo build --release` use, and why does it matter for benchmarking?',
          options: [
            { id: 'b', text: 'release profile — enables optimizations, much faster runtime' },
            { id: 'a', text: 'dev profile — same speed as debug' },
            { id: 'c', text: 'test profile — optimized for test binaries' },
          ],
          correct: 'b',
          explain:
            'The release profile enables optimizations; debug builds are unoptimized and can run significantly slower.',
        },
        {
          id: 'cargo-advanced-q2',
          kind: 'choice',
          prompt: 'In a Cargo workspace, where does the single shared Cargo.lock live?',
          options: [
            { id: 'b', text: 'In each member package separately' },
            { id: 'c', text: 'In `~/.cargo`' },
            { id: 'a', text: 'In the workspace root' },
          ],
          correct: 'a',
          explain:
            'One workspace, one lockfile at the root: all members resolve dependencies together, which is the entire point of the workspace.',
        },
        {
          id: 'cargo-advanced-q3',
          kind: 'choice',
          prompt: '`cargo install ripgrep` — where does the binary go, and what does it need?',
          options: [
            {
              id: 'a',
              text: 'Into `~/.cargo/bin`, built from the registry — no source checkout needed',
            },
            { id: 'b', text: 'Into the current directory' },
            { id: 'c', text: 'Always into `/usr/local/bin`' },
          ],
          correct: 'a',
          explain:
            '`cargo install` fetches, builds, and drops the binary into `~/.cargo/bin` (put it on PATH). Contrast with `cargo build`, which works on local sources.',
        },
        {
          id: 'cargo-advanced-q4',
          kind: 'choice',
          prompt:
            '`serde` with `default-features = false, features = ["derive"]` — what does this buy?',
          options: [
            { id: 'b', text: 'It makes `serde` run faster at runtime' },
            { id: 'c', text: 'It pins `serde` to an exact version' },
            {
              id: 'a',
              text: 'A leaner dependency tree: opt out of the default feature set, opt into only `derive` — less code compiled, fewer transitive deps',
            },
            { id: 'd', text: 'Nothing — features are deprecated in favor of editions' },
          ],
          correct: 'a',
          explain:
            "TRPL 14 (features): default features serve the common case; opting out trims compile time and dependency surface. Version pinning is the lockfile's job, not features'.",
        },
      ],
    },
  ],
};
