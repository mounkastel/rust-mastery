import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  { name: 'dashboard', hash: '#/' },
  { name: 'course', hash: '#/course' },
  { name: 'lesson', hash: '#/lesson/installation-hello' },
  { name: 'lesson with a locked prerequisite', hash: '#/lesson/borrowing' },
  { name: 'review', hash: '#/review' },
  { name: 'search results', hash: '#/search?q=ownership' },
];

test.describe('accessibility', () => {
  for (const { name, hash } of PAGES) {
    for (const theme of ['light', 'dark'] as const) {
      test(`${name} has no axe violations in ${theme}`, async ({ page }) => {
        await page.addInitScript((t) => {
          localStorage.setItem(
            'rust-mastery:v3',
            JSON.stringify({
              version: 3,
              lessons: {},
              lastRecalledDay: {},
              lastLessonId: null,
              theme: t,
            }),
          );
        }, theme);
        await page.goto('./' + hash);
        await expect(page.locator('h1').first()).toBeVisible();

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        const summary = results.violations.map(
          (v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.help}`,
        );
        expect(summary, summary.join('\n')).toEqual([]);
      });
    }
  }

  test('every page has exactly one level-one heading', async ({ page }) => {
    for (const { hash } of PAGES) {
      await page.goto('./' + hash);
      await expect(page.locator('h1')).toHaveCount(1);
    }
  });

  test('the page has a lang attribute and a title', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.title()).not.toBe('');
  });

  test('focus is visible on the primary controls', async ({ page }) => {
    await page.goto('./');
    for (const selector of ['.brand', '.top a', '.theme', '.tree-row']) {
      await page.locator(selector).first().focus();
      const outline = await page
        .locator(selector)
        .first()
        .evaluate((el) => {
          const s = getComputedStyle(el);
          return { width: s.outlineWidth, style: s.outlineStyle };
        });
      expect(outline.style, selector).not.toBe('none');
      expect(parseFloat(outline.width), selector).toBeGreaterThan(0);
    }
  });

  test('reduced motion is honoured', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    const duration = await page
      .locator('.tree-row')
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    // 0.01ms is what the stylesheet sets; browsers report it as 1e-05s.
    expect(parseFloat(duration)).toBeLessThanOrEqual(0.00001);
  });

  test('the drawer is announced as expanded', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 720 });
    await page.goto('./');
    const toggle = page.getByRole('button', { name: 'Lessons menu' });
    await expect(toggle).toHaveAttribute('aria-controls', 'nav');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
