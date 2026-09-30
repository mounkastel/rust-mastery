import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const THEMES = ['light', 'dark'] as const;

const PAGES = [
  { name: 'dashboard', hash: '#/' },
  { name: 'course', hash: '#/course' },
  { name: 'lesson', hash: '#/lesson/installation-hello' },
  { name: 'lesson with a locked prerequisite', hash: '#/lesson/borrowing' },
  { name: 'review', hash: '#/review' },
  { name: 'search results', hash: '#/search?q=ownership' },
];

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

function passedLesson(dueDay: number): Record<string, unknown> {
  return {
    status: 'passed',
    examples: {},
    drills: {},
    practice: {},
    attempts: 1,
    passed: true,
    review: { dueDay, intervalDays: 7, streak: 2, lapses: 0 },
    correct: [],
    firstPassedDay: dueDay - 3,
  };
}

/** Seeds a course in the given theme before any app code runs. */
async function useCourse(
  page: Page,
  theme: (typeof THEMES)[number],
  lessons: Record<string, unknown> = {},
): Promise<void> {
  await page.addInitScript(
    (seed: { theme: string; lessons: Record<string, unknown> }) => {
      localStorage.setItem(
        'rust-mastery:v3',
        // Every key the storage schema requires: a payload missing one is
        // discarded whole, and the app comes up empty.
        JSON.stringify({
          version: 3,
          lessons: seed.lessons,
          lastRecalledDay: {},
          lastLessonId: null,
          theme: seed.theme,
        }),
      );
    },
    { theme, lessons },
  );
}

async function violations(page: Page, label: string): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags([...TAGS]).analyze();
  expect(
    results.violations.map((v) => `${v.id} (${v.impact ?? 'unknown'}): ${v.help}`),
    `axe violations in ${label}`,
  ).toEqual([]);
}

test.describe('accessibility', () => {
  for (const { name, hash } of PAGES) {
    for (const theme of THEMES) {
      test(`${name} has no axe violations in ${theme}`, async ({ page }) => {
        await useCourse(page, theme);
        await page.goto('./' + hash);
        await expect(page.locator('h1').first()).toBeVisible();
        await violations(page, `${name} / ${theme}`);
      });
    }
  }

  test('a review session in progress is clean in both themes', async ({ page }) => {
    // Due yesterday, so the queue has a card and the grade buttons are on screen.
    const yesterday = Math.floor(new Date().setHours(0, 0, 0, 0) / 86_400_000) - 1;
    await useCourse(page, 'light', { 'guessing-game': passedLesson(yesterday) });
    await page.goto('./#/review');
    await expect(page.locator('.card')).toBeVisible();
    await violations(page, 'review / light');

    await page.locator('.theme').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await violations(page, 'review / dark');
  });

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
