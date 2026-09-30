import type { Concept, Question } from '../../content';

type QuestionState = 'unanswered' | 'correct' | 'wrong' | 'revealed';

export interface Answer {
  selected?: string;
  revealed: boolean;
  selfPassed?: boolean;
}

/** Lesson id -> question id -> the learner's answer. */
export type Answers = Readonly<Record<string, Readonly<Record<string, Answer>>>>;

export function stateOf(question: Question, answer: Answer | undefined): QuestionState {
  if (answer === undefined) return 'unanswered';
  if (question.kind === 'choice') {
    if (answer.selected === undefined) return 'unanswered';
    return answer.selected === question.correct ? 'correct' : 'wrong';
  }
  if (!answer.revealed) return 'unanswered';
  if (answer.selfPassed === undefined) return 'revealed';
  return answer.selfPassed ? 'correct' : 'wrong';
}

export interface Checkpoint {
  answered: number;
  correct: number;
  wrong: number;
  total: number;
  complete: boolean;
  passed: boolean;
}

export function score(concept: Concept, answers: Readonly<Record<string, Answer>>): Checkpoint {
  let correct = 0;
  let wrong = 0;
  for (const question of concept.questions) {
    const s = stateOf(question, answers[question.id]);
    if (s === 'correct') correct += 1;
    else if (s === 'wrong') wrong += 1;
  }
  const total = concept.questions.length;
  return {
    answered: correct + wrong,
    correct,
    wrong,
    total,
    complete: correct + wrong === total,
    passed: total > 0 && correct === total,
  };
}

export function correctQuestionIds(
  concept: Concept,
  answers: Readonly<Record<string, Answer>>,
): string[] {
  return concept.questions.filter((q) => stateOf(q, answers[q.id]) === 'correct').map((q) => q.id);
}
