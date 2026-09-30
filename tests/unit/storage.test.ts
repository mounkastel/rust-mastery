import { describe, expect, it } from 'vitest';

import {
  browserStore,
  exportProgress,
  importProgress,
  loadProgress,
  memoryStore,
  resetProgress,
  saveProgress,
} from '../../src/lib/storage/store';
import { storageKeys } from '../../src/lib/storage/schema';
import { emptyProgress, withLesson, type Progress } from '../../src/lib/domain/state';

const KEY = storageKeys.progress;

const sample: Progress = {
  ...emptyProgress(),
  lastLessonId: 'ownership',
  theme: 'dark',
  lessons: {
    ownership: {
      status: 'passed',
      examples: { 'scope/move.html': true },
      drills: { move_semantics1: true, move_semantics2: false },
      practice: {},
      attempts: 2,
      passed: true,
      review: { dueDay: 20_005, intervalDays: 7, streak: 2, lapses: 1 },
      correct: ['ownership-q1'],
      firstPassedDay: 19_990,
    },
  },
};

/** A Storage-shaped object whose every method throws, as in Safari private mode. */
function hostileStorage(): Storage {
  const boom = (): never => {
    throw new DOMException('denied', 'SecurityError');
  };
  return {
    get length() {
      return boom();
    },
    clear: boom,
    getItem: boom,
    key: boom,
    removeItem: boom,
    setItem: boom,
  } as unknown as Storage;
}

describe('loadProgress', () => {
  it('returns a fresh course when nothing is stored', () => {
    expect(loadProgress(memoryStore())).toEqual(emptyProgress());
  });

  it('round-trips a saved course', () => {
    const store = memoryStore();
    saveProgress(store, sample);
    expect(loadProgress(store)).toEqual(sample);
  });

  it('discards unparseable JSON rather than throwing', () => {
    const store = memoryStore();
    store.write('{not json');
    expect(loadProgress(store)).toEqual(emptyProgress());
  });

  it('discards a payload of the wrong shape', () => {
    const store = memoryStore();
    store.write(JSON.stringify({ version: 3, lessons: { a: { status: 'nonsense' } } }));
    expect(loadProgress(store)).toEqual(emptyProgress());
  });

  it('discards a payload from an older version instead of half-reading it', () => {
    const store = memoryStore();
    store.write(JSON.stringify({ ...sample, version: 2 }));
    expect(loadProgress(store)).toEqual(emptyProgress());
  });

  it('rejects a non-object payload', () => {
    const store = memoryStore();
    store.write('"a string"');
    expect(loadProgress(store)).toEqual(emptyProgress());
  });
});

describe('browserStore', () => {
  it('falls back to memory when localStorage throws on write', () => {
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', {
      value: hostileStorage(),
      configurable: true,
    });
    try {
      const store = browserStore();
      expect(() => saveProgress(store, sample)).not.toThrow();
      expect(loadProgress(store)).toEqual(sample);
    } finally {
      Object.defineProperty(globalThis, 'localStorage', { value: original, configurable: true });
    }
  });
});

describe('resetProgress', () => {
  it('clears the stored payload and returns a fresh course', () => {
    const store = memoryStore();
    saveProgress(store, sample);
    expect(resetProgress(store)).toEqual(emptyProgress());
    expect(store.read()).toBeNull();
  });
});

describe('export and import', () => {
  it('round-trips a course', () => {
    const text = exportProgress(sample, 1_700_000_000_000);
    const back = importProgress(text);
    expect(back.ok).toBe(true);
    if (back.ok) expect(back.progress).toEqual(sample);
  });

  it('stamps the app name and version so a foreign file is refused', () => {
    const parsed = JSON.parse(exportProgress(sample, 0));
    expect(parsed).toMatchObject({ app: 'rust-mastery', version: 3 });
  });

  it('rejects a file that is not JSON', () => {
    const result = importProgress('nope');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/JSON/);
  });

  it('rejects a file from another app', () => {
    const result = importProgress(JSON.stringify({ app: 'other', version: 3, progress: sample }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/not exported/);
  });

  it('names the version mismatch rather than failing silently', () => {
    const result = importProgress(
      JSON.stringify({ app: 'rust-mastery', version: 2, progress: sample }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/version 2/);
  });

  it('refuses a version-3 file whose payload was hand-edited into nonsense', () => {
    const result = importProgress(
      JSON.stringify({ app: 'rust-mastery', version: 3, progress: { version: 3, lessons: 7 } }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/damaged/);
  });

  it('rejects a bare progress object with no envelope', () => {
    expect(importProgress(JSON.stringify(sample)).ok).toBe(false);
  });
});

describe('the storage key', () => {
  it('names the version, so a future format cannot collide with this one', () => {
    expect(KEY).toBe('rust-mastery:v3');
  });

  it('names the key the pre-rewrite app used, which is never read', () => {
    expect(storageKeys.legacyProgress).toBe('rust-mastery-course-v2');
  });
});

describe('withLesson', () => {
  it('does not mutate the course it was given', () => {
    const before = emptyProgress();
    const after = withLesson(before, 'ownership', { status: 'in-progress' });
    expect(before.lessons['ownership']).toBeUndefined();
    expect(after.lessons['ownership']?.status).toBe('in-progress');
  });
});
