import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { chapterOf, conceptById, concepts, curriculum } from '../../src/content';
import { segments } from '../../src/lib/domain/richtext';

const PUBLIC = join(import.meta.dirname, '..', '..', 'public');

describe('the curriculum validates', () => {
  it('loaded, which means valibot accepted every chapter', () => {
    expect(curriculum.chapters.length).toBeGreaterThan(0);
  });

  it('has a lesson for every concept id', () => {
    for (const c of concepts) expect(conceptById.get(c.id)).toBe(c);
  });

  it('places every concept in the chapter that claims it', () => {
    for (const chapter of curriculum.chapters) {
      for (const concept of chapter.concepts) expect(chapterOf(concept.id)).toBe(chapter);
    }
  });
});

describe('vendored references resolve', () => {
  it('every TRPL page exists in public/book-html', () => {
    for (const chapter of curriculum.chapters) {
      for (const concept of chapter.concepts) {
        for (const page of concept.reading) {
          // One reading entry points at the standard library docs rather than
          // the vendored book, so an absolute URL is legitimate here.
          if (/^https?:\/\//.test(page.href)) continue;
          expect(existsSync(join(PUBLIC, 'book-html', page.href.split('#')[0]!)), page.href).toBe(
            true,
          );
        }
      }
    }
  });

  it('every RBE page exists in public/rbe-html', () => {
    for (const chapter of curriculum.chapters) {
      for (const concept of chapter.concepts) {
        for (const example of concept.examples) {
          expect(existsSync(join(PUBLIC, 'rbe-html', example.href)), example.href).toBe(true);
        }
      }
    }
  });

  it('every Rustlings exercise exists in public/rustlings/exercises', () => {
    for (const chapter of curriculum.chapters) {
      for (const concept of chapter.concepts) {
        for (const drill of concept.drills) {
          expect(existsSync(join(PUBLIC, 'rustlings/exercises', drill.href)), drill.href).toBe(
            true,
          );
        }
      }
    }
  });

  it('no stored path is root-absolute, which would break the Pages subpath', () => {
    for (const chapter of curriculum.chapters) {
      for (const concept of chapter.concepts) {
        for (const href of [
          ...concept.reading.map((r) => r.href),
          ...concept.examples.map((e) => e.href),
          ...concept.drills.map((d) => d.href),
        ]) {
          expect(href.startsWith('/'), href).toBe(false);
          expect(href, 'no path may escape the deploy base with ../').not.toMatch(/^\.\.\//);
        }
      }
    }
  });
});

describe('question text', () => {
  const allQuestions = concepts.flatMap((c) => c.questions);

  it('renders without throwing for every question', () => {
    for (const q of allQuestions) {
      expect(() => segments(q.prompt), q.id).not.toThrow();
      expect(() => segments(q.explain), q.id).not.toThrow();
    }
  });

  it('produces at least one segment for every prompt', () => {
    for (const q of allQuestions) expect(segments(q.prompt).length, q.id).toBeGreaterThan(0);
  });

  it('leaves no unterminated code fence', () => {
    for (const q of allQuestions) {
      for (const field of [q.prompt, q.explain]) {
        const fences = field.match(/```/g)?.length ?? 0;
        expect(fences % 2, `${q.id} has an odd number of fences`).toBe(0);
      }
    }
  });

  it('never ships the authoring placeholder', () => {
    for (const q of allQuestions) {
      expect(q.prompt, q.id).not.toMatch(/PLACEHOLDER|TODO|FIXME/);
      expect(q.explain, q.id).not.toMatch(/PLACEHOLDER|TODO|FIXME/);
    }
  });
});
