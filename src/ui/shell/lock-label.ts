import type { LockState } from '../../lib/domain/curriculum';

/**
 * The one place a lock state becomes English. Three views render it, and a
 * wording change that missed one of them would show up as a failing a11y test
 * rather than as a silent inconsistency.
 */
export const LOCK_WORD: Record<LockState, string> = {
  locked: 'Locked',
  available: 'Not started',
  started: 'In progress',
  revisit: 'Retake due',
  passed: 'Passed',
};

/** Progress first, then blocked, then done: the order a learner cares in. */
export const LOCK_ORDER: LockState[] = ['available', 'started', 'revisit', 'locked', 'passed'];
