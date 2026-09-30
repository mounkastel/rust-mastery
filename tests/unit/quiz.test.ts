import { describe, expect, it } from 'vitest';

import { conceptById, concepts } from '../../src/content';
import type { Question } from '../../src/content';
import { correctQuestionIds, score, stateOf, type Answer } from '../../src/lib/domain/quiz';

const concept = conceptById.get('ownership')!;
const choice = concept.questions.find(
  (q): q is Extract<Question, { kind: 'choice' }> => q.kind === 'choice',
)!;
const selfGraded = concept.questions.find((q) => q.kind !== 'choice')!;
const otherId = choice.correct === 'a' ? 'b' : 'a';

function allCorrect(): Record<string, Answer> {
  const out: Record<string, Answer> = {};
  for (const q of concept.questions) {
    out[q.id] =
      q.kind === 'choice'
        ? { revealed: true, selected: q.correct }
        : { revealed: true, selfPassed: true };
  }
  return out;
}

describe('stateOf', () => {
  it('an absent answer is unanswered', () => {
    expect(stateOf(choice, undefined)).toBe('unanswered');
  });

  it('a choice with no selection is unanswered', () => {
    expect(stateOf(choice, { revealed: false })).toBe('unanswered');
  });

  it('a choice matching `correct` is correct', () => {
    expect(stateOf(choice, { revealed: true, selected: choice.correct })).toBe('correct');
  });

  it('a choice not matching `correct` is wrong', () => {
    expect(stateOf(choice, { revealed: true, selected: otherId })).toBe('wrong');
  });

  it('a revealed self-graded question waits for the grade', () => {
    expect(stateOf(selfGraded, { revealed: true })).toBe('revealed');
  });

  it('a revealed question with a grade is judged', () => {
    expect(stateOf(selfGraded, { revealed: true, selfPassed: true })).toBe('correct');
    expect(stateOf(selfGraded, { revealed: true, selfPassed: false })).toBe('wrong');
  });
});

describe('score', () => {
  it('an empty attempt has answered nothing', () => {
    expect(score(concept, {})).toMatchObject({
      answered: 0,
      correct: 0,
      wrong: 0,
      complete: false,
      passed: false,
    });
  });

  it('all right means complete and passed', () => {
    expect(score(concept, allCorrect())).toMatchObject({
      answered: concept.questions.length,
      correct: concept.questions.length,
      complete: true,
      passed: true,
    });
  });

  it('one wrong answer blocks the pass but still completes the attempt', () => {
    const answers = allCorrect();
    answers[choice.id] = { revealed: true, selected: otherId };
    const result = score(concept, answers);
    expect(result.complete).toBe(true);
    expect(result.passed).toBe(false);
    expect(result.wrong).toBe(1);
  });

  it('ignores answers that belong to a different lesson', () => {
    const answers = {
      ...allCorrect(),
      'some-other-lesson-q1': { revealed: true, selfPassed: false },
    };
    expect(score(concept, answers).passed).toBe(true);
  });
});

describe('correctQuestionIds', () => {
  it('lists only the questions answered right', () => {
    const answers = allCorrect();
    answers[choice.id] = { revealed: true, selected: otherId };
    const ids = correctQuestionIds(concept, answers);
    expect(ids).not.toContain(choice.id);
    expect(ids).toHaveLength(concept.questions.length - 1);
  });
});

describe('every checkpoint in the course', () => {
  it('has at least one question', () => {
    for (const c of concepts) expect(c.questions.length).toBeGreaterThan(0);
  });

  it('has no duplicate question ids', () => {
    for (const c of concepts) {
      const ids = c.questions.map((q) => q.id);
      expect(new Set(ids).size, c.id).toBe(ids.length);
    }
  });

  it('has a `correct` answer that is one of its options', () => {
    for (const c of concepts) {
      for (const q of c.questions) {
        if (q.kind !== 'choice') continue;
        expect(
          q.options.map((o) => o.id),
          q.id,
        ).toContain(q.correct);
      }
    }
  });

  it('has no two options sharing an id', () => {
    for (const c of concepts) {
      for (const q of c.questions) {
        if (q.kind !== 'choice') continue;
        const ids = q.options.map((o) => o.id);
        expect(new Set(ids).size, q.id).toBe(ids.length);
      }
    }
  });

  it('does not repeat the correct answer text as a distractor', () => {
    for (const c of concepts) {
      for (const q of c.questions) {
        if (q.kind !== 'choice') continue;
        const answer = q.options.find((o) => o.id === q.correct)!.text;
        for (const o of q.options) {
          if (o.id === q.correct) continue;
          expect(o.text, `${q.id}: a distractor repeats the answer verbatim`).not.toBe(answer);
        }
      }
    }
  });
});
