import type { ReviewState } from './srs';

/** The grade a learner gives themselves on a recall card. */
export type Rating = 'again' | 'hard' | 'good' | 'easy';

type LessonStatus = 'not-started' | 'in-progress' | 'passed' | 'revisit';

/** Per-lesson learner state. Every field is optional-and-defaulted on read. */
export interface LessonProgress {
  status: LessonStatus;
  /** RBE pages the learner has ticked off, keyed by href. */
  examples: Readonly<Record<string, boolean>>;
  /** Rustlings exercises ticked off, keyed by exercise name. */
  drills: Readonly<Record<string, boolean>>;
  /** Free-form practice tasks ticked off, keyed by task id. */
  practice: Readonly<Record<string, boolean>>;
  attempts: number;
  /** Monotonic: once true, a later failed retake does not take it back. */
  passed: boolean;
  review: ReviewState | null;
  /** Question ids answered correctly, used to pick recall cards. */
  correct: readonly string[];
  firstPassedDay: number | null;
}

export interface Progress {
  version: 3;
  lessons: Readonly<Record<string, LessonProgress>>;
  lastLessonId: string | null;
  theme: 'light' | 'dark' | 'system';
}

export function emptyProgress(): Progress {
  return { version: 3, lessons: {}, lastLessonId: null, theme: 'system' };
}

export function lesson(
  lessons: Readonly<Record<string, LessonProgress>>,
  id: string,
): LessonProgress {
  return (
    lessons[id] ?? {
      status: 'not-started',
      examples: {},
      drills: {},
      practice: {},
      attempts: 0,
      passed: false,
      review: null,
      correct: [],
      firstPassedDay: null,
    }
  );
}

export function withLesson(
  progress: Progress,
  id: string,
  patch: Partial<LessonProgress>,
): Progress {
  return {
    ...progress,
    lessons: { ...progress.lessons, [id]: { ...lesson(progress.lessons, id), ...patch } },
  };
}
