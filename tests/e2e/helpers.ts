import type { Page } from '@playwright/test';

export const LESSON = './#/lesson/installation-hello';
const LETTERS = ['a', 'b', 'c', 'd'] as const;

export interface Review {
  dueDay: number;
  intervalDays: number;
  streak: number;
  lapses: number;
}

/** Scoped to the checkpoint: the lesson itself is also an <article>. */
export function question(page: Page, index: number) {
  return page.locator('article[data-qid]').nth(index);
}

export function questionCount(page: Page): Promise<number> {
  return page.locator('article[data-qid]').count();
}

export function card(page: Page, id: string) {
  return page.locator(`article[data-qid="${id}"]`);
}

/**
 * Opens the lesson with a clean attempt. Navigating to the same URL with the
 * same hash does not re-create the document, so the reload is what actually
 * clears the previous attempt.
 */
export async function openLesson(page: Page): Promise<void> {
  await page.goto(LESSON);
  await page.reload();
}

export async function reveal(q: ReturnType<typeof card>): Promise<void> {
  await q.getByRole('button', { name: 'Show the answer' }).click();
}

export async function grade(q: ReturnType<typeof card>, passed: boolean): Promise<void> {
  await q.getByRole('button', { name: passed ? 'Yes' : 'No', exact: true }).click();
}

/**
 * Answers a multiple-choice question correctly within one page session.
 * Attempts live in memory, so the test must not reload between tries: a wrong
 * click is undone with "Retry", which clears only that question.
 */
export async function answerChoice(page: Page, id: string): Promise<void> {
  for (const letter of LETTERS) {
    await card(page, id).locator(`button.option:has(.option-key:text-is("${letter}"))`).click();
    if ((await card(page, id).getAttribute('data-state')) === 'correct') return;
    await page.getByRole('button', { name: /Retry \d+ question/ }).click();
  }
  throw new Error(`${id}: no option was accepted`);
}

/**
 * Puts lessons in a passed state with reviews due now, so the review queue has
 * something in it. Done through an init script because the store reads storage
 * once, at construction. Every key the storage schema requires is written: a
 * payload missing one is discarded whole and the app comes up empty.
 */
export async function seedPassedLessons(page: Page, ids: string[]): Promise<void> {
  await page.addInitScript((lessonIds: string[]) => {
    const day = Math.floor(new Date().setHours(0, 0, 0, 0) / 86400000);
    const lessons: Record<string, unknown> = {};
    for (const id of lessonIds) {
      lessons[id] = {
        status: 'passed',
        examples: {},
        drills: {},
        practice: {},
        attempts: 1,
        passed: true,
        review: { dueDay: day - 1, intervalDays: 7, streak: 2, lapses: 0 },
        correct: [],
        firstPassedDay: day - 3,
      };
    }
    localStorage.setItem(
      'rust-mastery:v3',
      JSON.stringify({
        version: 3,
        lessons,
        lastLessonId: lessonIds.at(-1) ?? null,
        theme: 'light',
      }),
    );
  }, ids);
}

/** The stored review state of one seeded lesson. */
export function readReview(page: Page, lessonId: string): Promise<Review> {
  return page.evaluate((id: string): Review => {
    const parsed = JSON.parse(localStorage.getItem('rust-mastery:v3') ?? '{}') as {
      lessons: Record<string, { review: Review }>;
    };
    return parsed.lessons[id]?.review as Review;
  }, lessonId);
}
