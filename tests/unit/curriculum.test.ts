import { describe, expect, it } from 'vitest';

import { concepts } from '../../src/content';
import { lesson, withLesson, type Progress } from '../../src/lib/domain/state';
import { lockState, nextLessonId, summarise } from '../../src/lib/domain/curriculum';

/** Passes every prerequisite of `id`, breadth-first up the graph. */
function withPrereqsPassed(progress: Progress, id: string): Progress {
  const target = concepts.find((c) => c.id === id)!;
  let next = progress;
  for (const prereq of target.prereq)
    next = withLesson(next, prereq, { passed: true, status: 'passed' });
  return next;
}

const all = emptyCourse();
function emptyCourse(): Progress {
  return {
    version: 3,
    lessons: {},
    lastLessonId: null,
    theme: 'system',
  };
}

describe('the curriculum graph', () => {
  it('has a single root', () => {
    const roots = concepts.filter((c) => c.prereq.length === 0);
    expect(roots).toHaveLength(1);
  });

  it('has no duplicate ids', () => {
    const ids = concepts.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only lessons that exist', () => {
    const ids = new Set(concepts.map((c) => c.id));
    for (const c of concepts) {
      for (const p of c.prereq) expect(ids.has(p), `${c.id} -> ${p}`).toBe(true);
    }
  });

  it('is acyclic', () => {
    const ids = new Set(concepts.map((c) => c.id));
    const visiting = new Set<string>();
    const done = new Set<string>();
    const visit = (id: string): void => {
      if (done.has(id)) return;
      expect(visiting.has(id), `cycle through ${id}`).toBe(false);
      visiting.add(id);
      for (const p of concepts.find((c) => c.id === id)!.prereq) visit(p);
      visiting.delete(id);
      done.add(id);
    };
    for (const id of ids) visit(id);
  });

  it('lists every prerequisite before the lesson that needs it', () => {
    const seen = new Set<string>();
    for (const c of concepts) {
      for (const p of c.prereq)
        expect(seen.has(p), `${c.id} refers to later lesson ${p}`).toBe(true);
      seen.add(c.id);
    }
  });
});

describe('lockState', () => {
  it('locks a lesson whose prerequisites are unmet', () => {
    expect(lockState(all, concepts[3]!)).toBe('locked');
  });

  it('unlocks once the prerequisites are passed', () => {
    const target = concepts[3]!;
    expect(lockState(withPrereqsPassed(all, target.id), target)).toBe('available');
  });

  it('reports in-progress separately from not-started', () => {
    const p = withLesson(all, concepts[0]!.id, { status: 'in-progress' });
    expect(lockState(p, concepts[0]!)).toBe('started');
  });

  it('revisit is a passed lesson that failed a retake', () => {
    const p = withLesson(all, concepts[0]!.id, { status: 'revisit', passed: true });
    expect(lockState(p, concepts[0]!)).toBe('revisit');
  });

  it('a failed retake never re-locks a lesson that dependents rely on', () => {
    const target = concepts[3]!;
    let p = withPrereqsPassed(all, target.id);
    for (const prereq of target.prereq)
      p = withLesson(p, prereq, { status: 'revisit', passed: true });
    expect(lockState(p, target)).toBe('available');
  });

  it('un-ticking a prerequisite does not unlock a dependent, because passed is monotonic', () => {
    const target = concepts[3]!;
    const p = withPrereqsPassed(all, target.id);
    expect(lockState(p, target)).toBe('available');
    const cleared = withLesson(p, target.prereq[0]!, { passed: false });
    expect(lockState(cleared, target)).toBe('locked');
  });
});

describe('nextLessonId', () => {
  it('is the first available lesson in sequence order', () => {
    expect(nextLessonId(all)).toBe(concepts[0]!.id);
  });

  it('moves on once a lesson is passed', () => {
    const p = withLesson(all, concepts[0]!.id, { passed: true, status: 'passed' });
    expect(nextLessonId(p)).toBe(concepts[1]!.id);
  });

  it('does not advance past a prerequisite that is only in progress', () => {
    // Started is not finished: the dependent lesson stays locked until the
    // prerequisite's checkpoint is passed.
    const p = withLesson(all, concepts[0]!.id, { status: 'in-progress' });
    expect(lockState(p, concepts[1]!)).toBe('locked');
    expect(nextLessonId(p)).toBe(concepts[0]!.id);
  });
});

describe('summarise', () => {
  it('counts passed lessons and remaining time', () => {
    const p = withLesson(all, concepts[0]!.id, { passed: true, status: 'passed' });
    const s = summarise(p);
    expect(s.passed).toBe(1);
    expect(s.total).toBe(concepts.length);
    expect(s.minutesLeft).toBe(
      concepts.filter((c) => c.id !== concepts[0]!.id).reduce((n, c) => n + c.estMinutes, 0),
    );
  });

  it('is zero minutes left when everything is passed', () => {
    let p = all;
    for (const c of concepts) p = withLesson(p, c.id, { passed: true, status: 'passed' });
    expect(summarise(p)).toMatchObject({ passed: concepts.length, minutesLeft: 0, next: null });
  });
});

describe('lesson', () => {
  it('returns a stable default rather than undefined', () => {
    expect(lesson(all.lessons, 'missing').status).toBe('not-started');
  });
});
