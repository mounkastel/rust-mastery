import { concepts, type Concept } from '../../content';
import { lesson, type Progress } from './state';

export type LockState = 'locked' | 'available' | 'started' | 'revisit' | 'passed';

interface LessonView {
  concept: Concept;
  lock: LockState;
  /** Only the first lesson the learner can act on, in sequence order. */
  isNext: boolean;
}

interface CourseSummary {
  passed: number;
  total: number;
  /** Reading and drill time still ahead, ignoring lessons already passed. */
  minutesLeft: number;
  next: string | null;
}

/** Locked or already passed: there is nothing to do about this lesson. */
const ACTIONABLE: ReadonlySet<LockState> = new Set(['available', 'started', 'revisit']);

/**
 * A lesson unlocks once every prerequisite has `passed`. `passed` is
 * monotonic: a later failed retake moves the lesson to `revisit` but never
 * re-locks it or un-completes it, so a dependent can never fall back to locked
 * and strand a learner who has already moved past it.
 */
export function lockState(progress: Progress, concept: Concept): LockState {
  if (concept.prereq.some((id) => !lesson(progress.lessons, id).passed)) return 'locked';
  const p = lesson(progress.lessons, concept.id);
  if (p.passed && p.status === 'revisit') return 'revisit';
  if (p.passed) return 'passed';
  return p.status === 'in-progress' ? 'started' : 'available';
}

export function lessonViews(progress: Progress): LessonView[] {
  let nextAssigned = false;
  return concepts.map((concept) => {
    const lock = lockState(progress, concept);
    // A lesson the learner has already started is still the next thing to do,
    // so the dashboard keeps pointing at it rather than skipping past it.
    const isNext = !nextAssigned && ACTIONABLE.has(lock);
    if (isNext) nextAssigned = true;
    return { concept, lock, isNext };
  });
}

export function nextLessonId(progress: Progress): string | null {
  return lessonViews(progress).find((view) => view.isNext)?.concept.id ?? null;
}

export function summarise(progress: Progress): CourseSummary {
  const views = lessonViews(progress);
  const remaining = views.filter((view) => view.lock !== 'passed');
  return {
    passed: views.length - remaining.length,
    total: views.length,
    minutesLeft: remaining.reduce((sum, view) => sum + view.concept.estMinutes, 0),
    next: remaining[0]?.concept.id ?? null,
  };
}
