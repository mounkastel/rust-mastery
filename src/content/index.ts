import * as v from 'valibot';

import { bonus } from './chapters/bonus';
import { ch01 } from './chapters/ch01';
import { ch02 } from './chapters/ch02';
import { ch03 } from './chapters/ch03';
import { ch04 } from './chapters/ch04';
import { ch05 } from './chapters/ch05';
import { ch06 } from './chapters/ch06';
import { ch07 } from './chapters/ch07';
import { ch08 } from './chapters/ch08';
import { ch09 } from './chapters/ch09';
import { ch10 } from './chapters/ch10';
import { ch11 } from './chapters/ch11';
import { ch12 } from './chapters/ch12';
import { ch13 } from './chapters/ch13';
import { ch14 } from './chapters/ch14';
import { ch15 } from './chapters/ch15';
import { ch16 } from './chapters/ch16';
import { ch17 } from './chapters/ch17';
import { ch18 } from './chapters/ch18';
import { ch19 } from './chapters/ch19';
import { ch20 } from './chapters/ch20';
import { ch21 } from './chapters/ch21';
import { curriculumSchema, type Chapter, type Concept } from './schema';

// Import order above is the curriculum order; the array below is the sequence
// a learner walks, and it is the only ordering the app relies on.
const chapters: Chapter[] = [
  ch01,
  ch02,
  ch03,
  ch04,
  ch05,
  ch06,
  ch07,
  ch08,
  ch09,
  ch10,
  ch11,
  ch12,
  ch13,
  ch14,
  ch15,
  ch16,
  ch17,
  ch18,
  ch19,
  ch20,
  ch21,
  bonus,
];

const raw = {
  title: 'Rust Mastery',
  tagline: 'One sequence across TRPL, Rust by Example and Rustlings.',
  method: [
    { verb: 'Read', gloss: 'the book chapter' },
    { verb: 'See', gloss: 'the same idea as a runnable example' },
    { verb: 'Do', gloss: 'the exercises' },
    { verb: 'Recall', gloss: 'the checkpoint, on a schedule' },
  ],
  chapters,
};

export const curriculum = v.parse(curriculumSchema, raw);

/** Flattened in sequence order; this is the order a learner walks. */
export const concepts: Concept[] = curriculum.chapters.flatMap((c) => c.concepts);

export const conceptById: ReadonlyMap<string, Concept> = new Map<string, Concept>(
  concepts.map((c) => [c.id, c] as const),
);

/** Where a new learner starts. The schema guarantees at least one of each. */
export const firstLesson: Concept = concepts[0] as Concept;

export function chapterOf(conceptId: string): Chapter | undefined {
  return curriculum.chapters.find((c) => c.concepts.some((x) => x.id === conceptId));
}

export type { Chapter, Concept, Question } from './schema';
