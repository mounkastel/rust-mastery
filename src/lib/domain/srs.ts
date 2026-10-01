import { localDayNumber } from './clock';
import type { Progress, Rating } from './state';

export const INTERVALS_DAYS = [1, 3, 7, 16, 35, 90] as const;
const MAX_INTERVAL_DAYS = 365;
/** A card is "mature" once its interval reaches this many days. */
export const MATURE_INTERVAL_DAYS = 21;

export interface ReviewState {
  /** Local calendar day on which the card next becomes due. */
  dueDay: number;
  intervalDays: number;
  /** Consecutive successful recalls; reset to 0 by `again` and `hard`. */
  streak: number;
  lapses: number;
}

export function initialReview(today: number): ReviewState {
  return { dueDay: localDayNumber(today) + 1, intervalDays: 1, streak: 0, lapses: 0 };
}

/** The next ladder rung above `current`, or the top rung once past it. */
function nextRung(current: number): number {
  const idx = INTERVALS_DAYS.findIndex((d) => d > current);
  return idx === -1 ? Math.max(...INTERVALS_DAYS) : (INTERVALS_DAYS[idx] as number);
}

function grow(review: ReviewState, rating: Exclude<Rating, 'again'>): number {
  if (rating === 'hard') return Math.max(1, Math.round(review.intervalDays * 0.5));
  const rung = nextRung(review.intervalDays);
  return Math.min(MAX_INTERVAL_DAYS, Math.round(rating === 'easy' ? rung * 1.6 : rung));
}

export function schedule(review: ReviewState, rating: Rating, today: number): ReviewState {
  const intervalDays = rating === 'again' ? 1 : grow(review, rating);
  return {
    dueDay: localDayNumber(today) + intervalDays,
    intervalDays,
    streak: rating === 'again' || rating === 'hard' ? 0 : review.streak + 1,
    lapses: rating === 'again' ? review.lapses + 1 : review.lapses,
  };
}

interface DueCard {
  conceptId: string;
  overdueDays: number;
}

/** Lesson ids with a passed checkpoint whose review is due today or earlier. */
export function dueLessonIds(progress: Progress, today: number): DueCard[] {
  const todayDay = localDayNumber(today);
  const due: DueCard[] = [];
  for (const [id, p] of Object.entries(progress.lessons)) {
    if (!p.passed || p.review === null) continue;
    if (p.review.dueDay > todayDay) continue;
    due.push({ conceptId: id, overdueDays: todayDay - p.review.dueDay });
  }
  due.sort((a, b) => b.overdueDays - a.overdueDays || a.conceptId.localeCompare(b.conceptId));
  return due;
}

interface Retention {
  matured: number;
  learning: number;
  lapses: number;
  /** Share of scheduled lessons whose interval has reached maturity. */
  stableRatio: number;
}

export function retention(progress: Progress): Retention {
  let matured = 0;
  let learning = 0;
  let lapses = 0;
  for (const p of Object.values(progress.lessons)) {
    if (!p.passed || p.review === null) continue;
    lapses += p.review.lapses;
    if (p.review.intervalDays >= MATURE_INTERVAL_DAYS) matured += 1;
    else learning += 1;
  }
  const total = matured + learning;
  return { matured, learning, lapses, stableRatio: total === 0 ? 0 : matured / total };
}
