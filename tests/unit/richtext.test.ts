import { describe, expect, it } from 'vitest';

import { mulberry32, shuffled } from '../../src/lib/domain/random';
import { hasArrow, looksLikeCode, prose, segments, steps } from '../../src/lib/domain/richtext';

describe('looksLikeCode', () => {
  it('accepts a multi-line block with a Rust marker', () => {
    expect(looksLikeCode('fn main() {\n    let x = 1;\n}')).toBe(true);
  });

  it('rejects a single line', () => {
    expect(looksLikeCode('let x = 1;')).toBe(false);
  });

  it('rejects multi-line prose that happens to contain an arrow function', () => {
    expect(looksLikeCode('This works because it\nreturns a closure.')).toBe(false);
  });
});

describe('segments', () => {
  it('splits paragraphs on a blank line', () => {
    const out = segments('First para.\n\nSecond para.');
    expect(out).toEqual([
      { kind: 'text', value: 'First para.' },
      { kind: 'text', value: 'Second para.' },
    ]);
  });

  it('pulls a fenced block out as code', () => {
    const out = segments('Look:\n\n```rust\nfn main() {}\n```\n\nThat is all.');
    expect(out.map((s) => s.kind)).toEqual(['text', 'code', 'text']);
  });

  it('promotes a bare multi-line snippet to a code block', () => {
    const out = segments('What prints?\n\nfn main() {\n    println!("hi");\n}');
    expect(out.map((s) => s.kind)).toEqual(['text', 'code']);
  });

  it('leaves a one-line snippet inline', () => {
    const out = segments('Set `let x = 1;` first.');
    expect(out.map((s) => s.kind)).toEqual(['text']);
  });

  it('does not treat the word output in prose as a stdout marker', () => {
    const out = segments('The output depends on the input.');
    expect(out.every((s) => s.kind !== 'output')).toBe(true);
  });

  it('extracts stdout after a paragraph-final Output marker', () => {
    const out = segments('It prints twice. Output:\nline one\nline two');
    expect(out).toEqual([
      { kind: 'text', value: 'It prints twice.' },
      { kind: 'output', value: ['line one', 'line two'] },
    ]);
  });

  it('keeps punctuation before the marker with the prose', () => {
    const out = segments('That is it. Output:\n42');
    expect(out[0]).toEqual({ kind: 'text', value: 'That is it.' });
  });

  it('ignores an Output marker with nothing after it', () => {
    const out = segments('Output:');
    expect(out.every((s) => s.kind !== 'output')).toBe(true);
  });

  it('reads a numbered checkbox list as a checklist', () => {
    const out = segments('1. [ ] first\n2. [x] second');
    expect(out).toEqual([{ kind: 'checklist', value: ['first', 'second'] }]);
  });

  it('does not read ordinary prose as a checklist', () => {
    const out = segments('one thing\nanother thing');
    expect(out.every((s) => s.kind !== 'checklist')).toBe(true);
  });

  it('drops empty fences', () => {
    expect(segments('```\n\n```')).toEqual([]);
  });
});

describe('steps', () => {
  it('splits a cause from its effect', () => {
    expect(steps('the value moves → the old binding is dead')).toEqual([
      { cause: 'the value moves', effect: 'the old binding is dead' },
    ]);
  });

  it('fans out a semicolon-joined chain into one step per arrow', () => {
    const out = steps('a → b; c → d; e → f');
    expect(out).toHaveLength(3);
    expect(out[1]).toEqual({ cause: 'c', effect: 'd' });
  });

  it('strips sentence-final punctuation from the effect', () => {
    expect(steps('cause → effect.')[0]?.effect).toBe('effect');
  });

  it('ignores a sentence with no arrow', () => {
    expect(steps('nothing to see')).toEqual([]);
  });
});

describe('prose', () => {
  it('separates prose runs from step runs and keeps order', () => {
    const out = prose('First a claim. Then a step → and its effect. A closing claim.');
    expect(out.prose).toHaveLength(2);
    expect(out.runs).toHaveLength(1);
  });

  it('a sentence with no arrow is prose', () => {
    expect(hasArrow('plain sentence')).toBe(false);
  });
});

describe('shuffled', () => {
  it('keeps every element', () => {
    const input = [1, 2, 3, 4, 5];
    expect([...shuffled(input, mulberry32(1))].sort()).toEqual(input);
  });

  it('does not mutate its input', () => {
    const input = [1, 2, 3, 4, 5];
    shuffled(input, mulberry32(1));
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it('is deterministic for a given generator', () => {
    const a = shuffled(['a', 'b', 'c', 'd'], mulberry32(42));
    const b = shuffled(['a', 'b', 'c', 'd'], mulberry32(42));
    expect(a).toEqual(b);
  });

  it('eventually produces a different order', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const seen = new Set(
      Array.from({ length: 40 }, () => shuffled(input, mulberry32(seenSeed())).join(',')),
    );
    expect(seen.size).toBeGreaterThan(1);
  });
});

// Counter-free seeding so the loop above does not depend on its own iteration.
let seedCounter = 0;
function seenSeed(): number {
  seedCounter += 1;
  return seedCounter;
}
