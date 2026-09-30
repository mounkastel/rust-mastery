import { describe, expect, it } from 'vitest';

import { localDayNumber } from '../../src/lib/domain/clock';
import { emptyProgress, lesson, withLesson, type Progress } from '../../src/lib/domain/state';
import {
  INTERVALS_DAYS,
  MATURE_INTERVAL_DAYS,
  dueLessonIds,
  initialReview,
  recallQuestion,
  retention,
  schedule,
} from '../../src/lib/domain/srs';
import { conceptById } from '../../src/content';

const now = new Date(2026, 5, 15, 9).getTime();

/** Chains onto an existing course so several lessons can be passed at once. */
function passed(
  id: string,
  review = initialReview(now),
  onto: Progress = emptyProgress(),
): Progress {
  return withLesson(onto, id, { passed: true, status: 'passed', review });
}

const dueToday = { dueDay: localDayNumber(now), intervalDays: 1, streak: 0, lapses: 0 };

describe('initialReview', () => {
  it('is due tomorrow, not today', () => {
    expect(initialReview(now).dueDay).toBe(localDayNumber(now) + 1);
  });
});

describe('schedule', () => {
  it('again resets the interval to one day and counts a lapse', () => {
    const review = { dueDay: 0, intervalDays: 21, streak: 4, lapses: 0 };
    const next = schedule(review, 'again', now);
    expect(next.intervalDays).toBe(1);
    expect(next.dueDay).toBe(localDayNumber(now) + 1);
    expect(next.streak).toBe(0);
    expect(next.lapses).toBe(1);
  });

  it('hard halves the interval and keeps the streak at zero', () => {
    const review = { dueDay: 0, intervalDays: 9, streak: 3, lapses: 0 };
    const next = schedule(review, 'hard', now);
    expect(next.intervalDays).toBe(5);
    expect(next.streak).toBe(0);
    expect(next.lapses).toBe(0);
  });

  it('good advances one rung and counts the streak', () => {
    const review = { dueDay: 0, intervalDays: 3, streak: 0, lapses: 0 };
    const next = schedule(review, 'good', now);
    expect(next.intervalDays).toBe(7);
    expect(next.streak).toBe(1);
  });

  it('easy skips past the rung', () => {
    const review = { dueDay: 0, intervalDays: 3, streak: 0, lapses: 0 };
    expect(schedule(review, 'easy', now).intervalDays).toBe(11);
  });

  it('good on the top rung saturates rather than running away', () => {
    const review = { dueDay: 0, intervalDays: INTERVALS_DAYS.at(-1)!, streak: 5, lapses: 0 };
    const next = schedule(review, 'good', now);
    expect(next.intervalDays).toBeLessThanOrEqual(365);
    expect(next.intervalDays).toBe(90);
  });

  it('hard on a one-day interval does not fall to zero', () => {
    const next = schedule({ dueDay: 0, intervalDays: 1, streak: 0, lapses: 0 }, 'hard', now);
    expect(next.intervalDays).toBe(1);
  });

  it('the due day is a calendar day, so a late-night review lands tomorrow', () => {
    const late = new Date(2026, 5, 15, 23, 59).getTime();
    expect(
      schedule({ dueDay: 0, intervalDays: 1, streak: 0, lapses: 0 }, 'good', late).dueDay,
    ).toBe(localDayNumber(late) + 3);
  });

  it('always schedules at least one day out', () => {
    for (const rating of ['again', 'hard', 'good', 'easy'] as const) {
      const next = schedule({ dueDay: 0, intervalDays: 1, streak: 0, lapses: 0 }, rating, now);
      expect(next.dueDay).toBeGreaterThanOrEqual(localDayNumber(now) + 1);
    }
  });
});

describe('dueLessonIds', () => {
  it('includes a card whose due day is today', () => {
    expect(dueLessonIds(passed('ownership', dueToday), now).map((c) => c.conceptId)).toEqual([
      'ownership',
    ]);
  });

  it('a lesson passed today is not due until tomorrow', () => {
    const p = passed('ownership', initialReview(now));
    expect(dueLessonIds(p, now)).toHaveLength(0);
  });

  it('excludes a card scheduled into the future', () => {
    const p = passed('ownership', {
      dueDay: localDayNumber(now) + 1,
      intervalDays: 1,
      streak: 0,
      lapses: 0,
    });
    expect(dueLessonIds(p, now)).toHaveLength(0);
  });

  it('excludes lessons that were never passed', () => {
    const p = withLesson(emptyProgress(), 'ownership', { review: dueToday });
    expect(dueLessonIds(p, now)).toHaveLength(0);
  });

  it('orders by how overdue, then by id', () => {
    const day = localDayNumber(now);
    let p = passed('ownership', { dueDay: day - 1, intervalDays: 1, streak: 0, lapses: 0 });
    p = passed('borrowing', { dueDay: day - 5, intervalDays: 1, streak: 0, lapses: 0 }, p);
    expect(dueLessonIds(p, now).map((c) => c.conceptId)).toEqual(['borrowing', 'ownership']);
  });
});

describe('retention', () => {
  it('is empty for a fresh course', () => {
    expect(retention(emptyProgress())).toEqual({
      matured: 0,
      learning: 0,
      lapses: 0,
      stableRatio: 0,
    });
  });

  it('splits by the maturity threshold', () => {
    let p = passed('ownership', {
      dueDay: 0,
      intervalDays: MATURE_INTERVAL_DAYS,
      streak: 4,
      lapses: 0,
    });
    p = passed('borrowing', { dueDay: 0, intervalDays: 3, streak: 1, lapses: 2 }, p);
    const r = retention(p);
    expect(r.matured).toBe(1);
    expect(r.learning).toBe(1);
    expect(r.lapses).toBe(2);
    expect(r.stableRatio).toBe(0.5);
  });
});

describe('recallQuestion', () => {
  const concept = conceptById.get('ownership')!;

  it('stays inside the question array', () => {
    for (const r of [0, 0.25, 0.5, 0.99]) {
      const i = recallQuestion(concept, emptyProgress(), () => r);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(concept.questions.length);
    }
  });

  it('prefers a question the learner has answered before', () => {
    const target = concept.questions[3]!;
    const p = withLesson(emptyProgress(), 'ownership', { correct: [target.id] });
    expect(recallQuestion(concept, p, () => 0.5)).toBe(3);
  });

  it('never returns a question the learner got wrong when one was right', () => {
    const target = concept.questions[2]!;
    const p = withLesson(emptyProgress(), 'ownership', { correct: [target.id] });
    for (const r of [0, 0.1, 0.4, 0.6, 0.9]) {
      expect(recallQuestion(concept, p, () => r)).toBe(2);
    }
  });
});

describe('lesson defaults', () => {
  it('an unknown lesson is a clean slate, not a throw', () => {
    expect(lesson(emptyProgress().lessons, 'nope')).toMatchObject({
      status: 'not-started',
      passed: false,
      attempts: 0,
      review: null,
      correct: [],
    });
  });
});
