import { describe, expect, it } from 'vitest';

import { isExternal, resourceHref, withBase } from '../../src/lib/app/paths';
import { conceptById } from '../../src/content';

describe('deploy base', () => {
  it('prefixes a relative path and never doubles the slash', () => {
    expect(withBase('book-html/ch01-00.html')).toMatch(/^\/?book-html\/ch01-00\.html$/);
    expect(withBase('/book-html/ch01-00.html')).toBe(withBase('book-html/ch01-00.html'));
  });
});

describe('content hrefs', () => {
  it('tells a vendored path from an external page', () => {
    expect(isExternal('ch01-00-getting-started.html')).toBe(false);
    expect(isExternal('https://doc.rust-lang.org/std/option/enum.Option.html')).toBe(true);
    expect(isExternal('http://example.com/')).toBe(true);
  });

  it('resolves a vendored href against its tree', () => {
    expect(resourceHref('book-html', 'ch01-00-getting-started.html')).toBe(
      'book-html/ch01-00-getting-started.html',
    );
    expect(resourceHref('rustlings/exercises', '00_intro/intro1.rs')).toBe(
      'rustlings/exercises/00_intro/intro1.rs',
    );
  });

  it('passes an external href through instead of prefixing it', () => {
    const url = 'https://doc.rust-lang.org/std/option/enum.Option.html';
    expect(resourceHref('book-html', url)).toBe(url);
  });

  /**
   * The one reading entry that points at the standard library docs rather than
   * the vendored book. It is data, so nothing but this test stops someone
   * prefixing `book-html/` onto it again and shipping a 404.
   */
  it('the std docs reading entry is the one the suite found', () => {
    const external = [...conceptById.values()].flatMap((c) =>
      c.reading.filter((r) => isExternal(r.href)),
    );
    expect(external.map((r) => r.href)).toEqual([
      'https://doc.rust-lang.org/std/option/enum.Option.html',
    ]);
  });
});
