import { conceptById, type Concept } from '../../content';
import { localDayNumber } from '../domain/clock';
import { lessonViews, summarise } from '../domain/curriculum';
import { shuffled, type Random } from '../domain/random';
import {
  correctQuestionIds,
  score,
  stateOf,
  type Answer,
  type Answers,
  type Checkpoint,
} from '../domain/quiz';
import { dueLessonIds, initialReview, retention, schedule } from '../domain/srs';
import {
  lesson,
  withLesson,
  type LessonProgress,
  type Progress,
  type Rating,
} from '../domain/state';
import {
  browserStore,
  exportProgress,
  importProgress,
  loadProgress,
  resetProgress,
  saveProgress,
  type Store,
} from '../storage/store';

interface AppDeps {
  store: Store;
  now: () => number;
  random: Random;
}

export function defaultDeps(): AppDeps {
  return { store: browserStore(), now: () => Date.now(), random: () => Math.random() };
}

type Activity = 'examples' | 'drills' | 'practice';

interface PendingUndo {
  conceptId: string;
  review: LessonProgress['review'];
}

interface ImportOutcome {
  ok: boolean;
  reason?: string;
}

/**
 * The single owner of learner state. Everything the UI reads is derived from
 * `progress` or from the current attempt; there is no second source of truth.
 *
 * Attempts live in memory only: a reload starts the checkpoint over, which is
 * what the pre-rewrite app did too. The option shuffle is a plain field rather
 * than reactive state, because it must survive re-renders but nothing should
 * re-render because of it, and Svelte forbids mutating state during a render.
 */
export class CourseStore {
  #progress = $state<Progress>(emptyCourse());
  #answers = $state<Answers>({});
  #optionOrder: Record<string, string[]> = {};
  #undo = $state<PendingUndo | null>(null);
  #deps: AppDeps;

  constructor(deps: AppDeps) {
    this.#deps = deps;
    this.#progress = loadProgress(deps.store);
  }

  get progress(): Progress {
    return this.#progress;
  }

  get canUndoRate(): boolean {
    return this.#undo !== null;
  }

  lessonOf(conceptId: string): LessonProgress {
    return lesson(this.#progress.lessons, conceptId);
  }

  answersFor(concept: Concept): Readonly<Record<string, Answer>> {
    return this.#answers[concept.id] ?? {};
  }

  checkpoint(concept: Concept): Checkpoint {
    return score(concept, this.answersFor(concept));
  }

  views(): ReturnType<typeof lessonViews> {
    return lessonViews(this.#progress);
  }

  summarise(): ReturnType<typeof summarise> {
    return summarise(this.#progress);
  }

  dueToday(): ReturnType<typeof dueLessonIds> {
    return dueLessonIds(this.#progress, this.#deps.now());
  }

  retention(): ReturnType<typeof retention> {
    return retention(this.#progress);
  }

  /** Deals an option order once per attempt and reuses it on every re-render. */
  optionOrderFor(concept: Concept, questionId: string): string[] {
    const question = concept.questions.find((q) => q.id === questionId);
    if (question === undefined || question.kind !== 'choice') return [];
    const key = `${concept.id}:${questionId}`;
    const existing = this.#optionOrder[key];
    if (existing !== undefined) return existing;
    const order = shuffled(
      question.options.map((o) => o.id),
      this.#deps.random,
    );
    this.#optionOrder[key] = order;
    return order;
  }

  choose(conceptId: string, questionId: string, optionId: string): void {
    const concept = conceptById.get(conceptId);
    if (concept === undefined) return;
    const question = concept.questions.find((q) => q.id === questionId);
    if (question === undefined || question.kind !== 'choice') return;
    if (!question.options.some((o) => o.id === optionId)) return;
    if (this.#answer(conceptId, questionId)?.selected !== undefined) return;
    this.#patchAnswer(conceptId, questionId, { revealed: true, selected: optionId });
    this.#settle(concept);
  }

  reveal(conceptId: string, questionId: string): void {
    const concept = conceptById.get(conceptId);
    if (concept === undefined) return;
    const question = concept.questions.find((q) => q.id === questionId);
    if (question === undefined || question.kind === 'choice') return;
    if (this.#answer(conceptId, questionId)?.revealed === true) return;
    this.#patchAnswer(conceptId, questionId, { revealed: true });
  }

  selfGrade(conceptId: string, questionId: string, passed: boolean): void {
    const concept = conceptById.get(conceptId);
    if (concept === undefined) return;
    const before = this.#answer(conceptId, questionId);
    if (before?.revealed !== true || before.selfPassed !== undefined) return;
    this.#patchAnswer(conceptId, questionId, { revealed: true, selfPassed: passed });
    this.#settle(concept);
  }

  /** Clears only the wrong answers, so the learner redoes the gap, not the
   *  whole checkpoint. */
  retryWrong(conceptId: string): void {
    const concept = conceptById.get(conceptId);
    if (concept === undefined) return;
    const kept: Record<string, Answer> = {};
    let cleared = 0;
    for (const question of concept.questions) {
      const answer = this.#answer(conceptId, question.id);
      if (stateOf(question, answer) === 'wrong') {
        cleared += 1;
        continue;
      }
      if (answer !== undefined) kept[question.id] = answer;
    }
    if (cleared === 0) return;
    this.#answers = { ...this.#answers, [conceptId]: kept };
  }

  retake(conceptId: string): void {
    if (!conceptById.has(conceptId)) return;
    this.#answers = Object.fromEntries(
      Object.entries(this.#answers).filter(([id]) => id !== conceptId),
    );
    const prefix = `${conceptId}:`;
    this.#optionOrder = Object.fromEntries(
      Object.entries(this.#optionOrder).filter(([key]) => !key.startsWith(prefix)),
    );
  }

  tick(conceptId: string, kind: Activity, key: string, value: boolean): void {
    const concept = conceptById.get(conceptId);
    if (concept === undefined) return;
    if (!isActivityOf(concept, kind, key)) return;
    const current = this.lessonOf(conceptId);
    if (current[kind][key] === value) return;
    this.#commit(
      withLesson({ ...this.#progress, lastLessonId: conceptId }, conceptId, {
        [kind]: { ...current[kind], [key]: value },
        status: current.status === 'not-started' ? 'in-progress' : current.status,
      }),
    );
  }

  rate(conceptId: string, rating: Rating): void {
    if (!conceptById.has(conceptId)) return;
    const current = this.lessonOf(conceptId);
    if (!current.passed) return;
    const today = this.#deps.now();
    this.#undo = { conceptId, review: current.review };
    this.#commit(
      withLesson(this.#progress, conceptId, {
        review: schedule(current.review ?? initialReview(today), rating, today),
      }),
    );
  }

  undoLastRate(): void {
    const pending = this.#undo;
    if (pending === null) return;
    this.#undo = null;
    this.#commit(withLesson(this.#progress, pending.conceptId, { review: pending.review }));
  }

  setTheme(theme: Progress['theme']): void {
    this.#commit({ ...this.#progress, theme });
  }

  reset(): void {
    this.#answers = {};
    this.#optionOrder = {};
    this.#undo = null;
    this.#commit(resetProgress(this.#deps.store));
  }

  exportJson(): string {
    return exportProgress(this.#progress, this.#deps.now());
  }

  importJson(text: string): ImportOutcome {
    const result = importProgress(text);
    if (!result.ok) return result;
    this.#answers = {};
    this.#optionOrder = {};
    this.#commit(result.progress);
    return { ok: true };
  }

  #commit(next: Progress): void {
    this.#progress = next;
    saveProgress(this.#deps.store, next);
  }

  #answer(conceptId: string, questionId: string): Answer | undefined {
    return this.#answers[conceptId]?.[questionId];
  }

  #patchAnswer(conceptId: string, questionId: string, patch: Answer): void {
    this.#answers = {
      ...this.#answers,
      [conceptId]: { ...this.#answers[conceptId], [questionId]: patch },
    };
  }

  /**
   * Records the outcome once every question is judged. `passed` is monotonic:
   * a failed retake downgrades the status to `revisit` but never un-completes
   * the lesson, so a dependent lesson can never re-lock.
   */
  #settle(concept: Concept): void {
    const result = score(concept, this.answersFor(concept));
    if (!result.complete) return;
    const current = this.lessonOf(concept.id);
    const today = this.#deps.now();
    const passed = result.passed;
    this.#commit(
      withLesson({ ...this.#progress, lastLessonId: concept.id }, concept.id, {
        status: passed ? 'passed' : 'revisit',
        attempts: current.attempts + 1,
        passed: passed || current.passed,
        correct: correctQuestionIds(concept, this.answersFor(concept)),
        firstPassedDay: current.firstPassedDay ?? (passed ? localDayNumber(today) : null),
        review: concept.fundamental
          ? reviewAfterAttempt(current.review, passed, today)
          : current.review,
      }),
    );
  }
}

function emptyCourse(): Progress {
  return { version: 3, lessons: {}, lastLessonId: null, theme: 'system' };
}

/** A tick is only accepted for an activity this lesson actually lists. */
function isActivityOf(concept: Concept, kind: Activity, key: string): boolean {
  if (kind === 'examples') return concept.examples.some((e) => e.href === key);
  if (kind === 'drills') return concept.drills.some((d) => d.name === key);
  return (concept.practice ?? []).some((t) => t.id === key);
}

/**
 * A passed fundamental lesson enters the schedule; a failed one is due today,
 * so the learner sees it again in the next review session.
 */
function reviewAfterAttempt(
  current: LessonProgress['review'],
  passed: boolean,
  today: number,
): NonNullable<LessonProgress['review']> {
  if (passed) return current ?? initialReview(today);
  return {
    ...(current ?? initialReview(today)),
    dueDay: localDayNumber(today),
    intervalDays: 1,
    streak: 0,
  };
}
