import { describe, expect, it } from 'vitest';

import { lessonHref, parse } from '../../src/lib/app/router';
import { concepts } from '../../src/content';

describe('parse', () => {
  it('treats an empty hash as the dashboard', () => {
    expect(parse('')).toEqual({ name: 'dashboard' });
    expect(parse('#')).toEqual({ name: 'dashboard' });
    expect(parse('#/')).toEqual({ name: 'dashboard' });
  });

  it('reads the course and review routes', () => {
    expect(parse('#/course')).toEqual({ name: 'course' });
    expect(parse('#/review')).toEqual({ name: 'review' });
  });

  it('reads a lesson route', () => {
    expect(parse('#/lesson/ownership')).toEqual({ name: 'lesson', id: 'ownership' });
  });

  it('falls back to the dashboard for a lesson that does not exist', () => {
    expect(parse('#/lesson/nope')).toEqual({ name: 'dashboard' });
  });

  it('falls back to the dashboard for an unknown route', () => {
    expect(parse('#/wat')).toEqual({ name: 'dashboard' });
  });

  it('reads a search query, including one with spaces', () => {
    expect(parse('#/search?q=borrow%20checker')).toEqual({
      name: 'search',
      query: 'borrow checker',
    });
  });

  it('reads an empty search query', () => {
    expect(parse('#/search?q=')).toEqual({ name: 'search', query: '' });
  });

  it('ignores a trailing fragment on a lesson', () => {
    expect(parse('#/lesson/ownership?x=1')).toEqual({ name: 'lesson', id: 'ownership' });
  });
});

describe('lessonHref', () => {
  it('round-trips every lesson the curriculum has', () => {
    for (const id of concepts.map((c) => c.id)) {
      expect(parse(lessonHref(id))).toEqual({ name: 'lesson', id });
    }
  });

  it('emits a fragment route, not a path route', () => {
    // A path route would 404 on a hard refresh, because GitHub Pages has no
    // rewrite rule. This is the property the whole routing choice rests on.
    expect(lessonHref('ownership').startsWith('#')).toBe(true);
  });
});
