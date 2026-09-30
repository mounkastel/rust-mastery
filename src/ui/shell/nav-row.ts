import type { LockState } from '../../lib/domain/curriculum';

/** One row in the lesson list. Derived from the curriculum, not stored. */
export interface NavRow {
  id: string;
  title: string;
  lock: LockState;
  isNext: boolean;
  isLong: boolean;
}
