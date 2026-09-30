import { expect, test, type Locator, type Page } from '@playwright/test';

/** Scoped to the checkpoint: the lesson itself is also an <article>. */
function question(page: Page, index: number): Locator {
  return page.locator('article[data-qid]').nth(index);
}

function questionCount(page: Page): Promise<number> {
  return page.locator('article[data-qid]').count();
}

const LETTERS = ['a', 'b', 'c', 'd'] as const;

const LESSON = './#/lesson/installation-hello';

function card(page: Page, id: string): Locator {
  return page.locator(`article[data-qid="${id}"]`);
}

/**
 * Opens the lesson with a clean attempt. Navigating to the same URL with the
 * same hash does not re-create the document, so the reload is what actually
 * clears the previous attempt.
 */
async function openLesson(page: Page): Promise<void> {
  await page.goto(LESSON);
  await page.reload();
}

/**
 * Answers a multiple-choice question correctly within one page session.
 * Attempts live in memory, so the test must not reload between tries: a wrong
 * click is undone with the "Retry" button, which clears only that question.
 */
/** The letter of the option the app considers correct, found by trying each. */
async function correctLetter(page: Page, id: string): Promise<string> {
  for (const letter of LETTERS) {
    await openLesson(page);
    await card(page, id).locator(`button.option:has(.option-key:text-is("${letter}"))`).click();
    if ((await card(page, id).getAttribute('data-state')) === 'correct') return letter;
  }
  throw new Error(`${id}: no option was accepted`);
}

async function answerChoice(page: Page, id: string): Promise<void> {
  for (const letter of LETTERS) {
    await card(page, id).locator(`button.option:has(.option-key:text-is("${letter}"))`).click();
    if ((await card(page, id).getAttribute('data-state')) === 'correct') return;
    await page.getByRole('button', { name: /Retry \d+ question/ }).click();
  }
  throw new Error(`${id}: no option was accepted`);
}

async function reveal(q: Locator): Promise<void> {
  await q.getByRole('button', { name: 'Show the answer' }).click();
}

async function grade(q: Locator, passed: boolean): Promise<void> {
  await q.getByRole('button', { name: passed ? 'Yes' : 'No', exact: true }).click();
}

test.describe('walking the course', () => {
  test('a locked lesson names its prerequisites and links to them', async ({ page }) => {
    await page.goto('./#/lesson/borrowing');
    await expect(page.getByRole('heading', { name: 'Locked' })).toBeVisible();
    const prereq = page.locator('.locked a').first();
    await expect(prereq).toBeVisible();
    await prereq.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ownership and Moves');
  });

  test('the first lesson shows its reading, drills and checkpoint', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    await expect(page.getByRole('heading', { level: 1, name: 'Setup and Hello' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Read/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Recall/ })).toBeVisible();
  });

  test('a TRPL link points at the vendored page and opens in a new tab', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    const link = page.getByRole('link', { name: /Open.*Getting Started/ }).first();
    await expect(link).toHaveAttribute('href', /^\/rust-mastery\/book-html\//);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  });

  test('a Rustlings row names the exact exercise command', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    await expect(page.getByText('rustlings exercise 00_intro/intro1').first()).toBeVisible();
  });

  test('ticking a drill survives a reload', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    await page.locator('input[type="checkbox"]').first().check();
    await page.reload();
    await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
  });

  test('the pager moves to the next lesson', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    await page.locator('.pager a[rel="next"]').click();
    await expect(page).toHaveURL(/lesson\/cargo-basics/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cargo Basics');
  });
});

test.describe('the checkpoint', () => {
  test('answering a choice question judges it and counts the question', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    await question(page, 0).locator('button.option').first().click();
    await expect(question(page, 0)).toHaveAttribute('data-state', /correct|wrong/);
    await expect(page.getByRole('status')).toContainText('1 of');
    await expect(page.getByText('Correct').first()).toBeVisible();
  });

  test('a self-graded question reveals the answer before the grade is recorded', async ({
    page,
  }) => {
    await page.goto('./#/lesson/installation-hello');
    const selfGraded = page
      .locator('article[data-qid]')
      .filter({ hasText: /Predict the output|Find the bug|Write it out/ })
      .first();
    await reveal(selfGraded);
    await expect(selfGraded).toHaveAttribute('data-state', 'revealed');
    await grade(selfGraded, true);
    await expect(selfGraded).toHaveAttribute('data-state', 'correct');
  });

  test('a wrong answer can be retried on its own', async ({ page }) => {
    await openLesson(page);
    const id = (await question(page, 0).getAttribute('data-qid'))!;

    // Answer the first question, then the second, so the retry has to preserve
    // a correct answer alongside the wrong one it clears.
    const second = (await question(page, 1).getAttribute('data-qid'))!;
    const rightForFirst = await correctLetter(page, id);
    const wrong = LETTERS.find((l) => l !== rightForFirst)!;

    await openLesson(page);
    await answerChoice(page, second);
    await card(page, id).locator(`button.option:has(.option-key:text-is("${wrong}"))`).click();
    await expect(card(page, id)).toHaveAttribute('data-state', 'wrong');
    await expect(page.getByRole('button', { name: /Retry 1 question/ })).toBeVisible();

    await page.getByRole('button', { name: /Retry 1 question/ }).click();
    await expect(card(page, id).locator('button.option').first()).toBeEnabled();
    await expect(card(page, second)).toHaveAttribute('data-state', 'correct');
    await expect(page.getByRole('status')).toContainText('1 right');

    await answerChoice(page, id);
    await expect(card(page, id)).toHaveAttribute('data-state', 'correct');
  });

  test('starting over clears every answer', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    await question(page, 0).locator('button.option').first().click();
    await page.getByRole('button', { name: 'Start over' }).click();
    await expect(page.getByRole('button', { name: 'Start over' })).toHaveCount(0);
  });

  test('passing every question completes the lesson and moves the dashboard', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    const total = await questionCount(page);

    for (let i = 0; i < total; i += 1) {
      const id = (await question(page, i).getAttribute('data-qid'))!;
      if ((await card(page, id).locator('button.option').count()) === 0) {
        await reveal(card(page, id));
        await grade(card(page, id), true);
        continue;
      }
      await answerChoice(page, id);
    }

    await expect(page.getByText('Passed.')).toBeVisible();
    await page.goto('./#/');
    await expect(page.getByRole('heading', { name: 'Lessons passed' }).locator('..')).toContainText(
      '1',
    );
  });

  test('a lesson passed today is scheduled for tomorrow, not due now', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    const total = await questionCount(page);
    for (let i = 0; i < total; i += 1) {
      const id = (await question(page, i).getAttribute('data-qid'))!;
      if ((await card(page, id).locator('button.option').count()) === 0) {
        await reveal(card(page, id));
        await grade(card(page, id), true);
        continue;
      }
      await answerChoice(page, id);
    }
    await page.goto('./#/review');
    await expect(page.getByText('Nothing is due')).toBeVisible();
  });
});

test.describe('search', () => {
  test('finds a lesson by title', async ({ page }) => {
    await page.goto('./#/search?q=ownership');
    await expect(page.getByRole('link', { name: 'Ownership and Moves' }).first()).toBeVisible();
  });

  test('finds a question by its wording', async ({ page }) => {
    await page.goto('./#/search?q=non-exhaustive');
    await expect(page.getByRole('status')).toContainText('match');
  });

  test('reports when nothing matches', async ({ page }) => {
    await page.goto('./#/search?q=zzzznotathing');
    await expect(page.getByText('Nothing matches')).toBeVisible();
  });

  test('asks for two characters before searching', async ({ page }) => {
    await page.goto('./#/search?q=a');
    await expect(page.getByText('Type at least two characters')).toBeVisible();
  });

  test('a result navigates to the lesson', async ({ page }) => {
    await page.goto('./#/search?q=ownership');
    await page.getByRole('link', { name: 'Ownership and Moves' }).first().click();
    await expect(page).toHaveURL(/lesson\/ownership/);
  });
});

test.describe('theme', () => {
  test('cycles system, light and dark, and persists', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Match system' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.getByRole('button', { name: 'Light' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('keyboard', () => {
  test('g, c and r jump between the main views', async ({ page }) => {
    await page.goto('./');
    await page.locator('body').press('c');
    await expect(page).toHaveURL(/#\/course/);
    await page.locator('body').press('r');
    await expect(page).toHaveURL(/#\/review/);
    await page.locator('body').press('g');
    await expect(page).toHaveURL(/#\/$/);
  });

  test('shortcuts are ignored while typing', async ({ page }) => {
    await page.goto('./#/search?q=');
    const field = page.getByLabel('Search lessons, questions and answers');
    await field.pressSequentially('cc');
    expect(await field.inputValue()).toBe('cc');
    expect(page.url()).not.toContain('/course');
  });

  test('the skip link is the first tab stop and reaches the content', async ({ page }) => {
    await page.goto('./');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('arrow keys move through the lesson list', async ({ page }) => {
    await page.goto('./');
    await page.locator('.tree-row').first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('.tree-row').nth(1)).toBeFocused();
  });
});

test.describe('data management', () => {
  test('reset takes two presses and then clears progress', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    await page.locator('input[type="checkbox"]').first().check();
    await page.reload();
    await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();

    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Confirm reset' })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm reset' }).click();

    await page.reload();
    await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked();
  });

  test('export downloads a file this app can import', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    await page.locator('input[type="checkbox"]').first().check();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Export' }).click(),
    ]);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk as Buffer);
    const parsed = JSON.parse(Buffer.concat(chunks).toString()) as Record<string, unknown>;
    expect(parsed['app']).toBe('rust-mastery');
    expect(parsed['version']).toBe(3);
  });

  test('importing a corrupt file explains itself and keeps progress', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    await page.locator('input[type="checkbox"]').first().check();
    await page.setInputFiles('input[type="file"]', {
      name: 'broken.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{ not json'),
    });
    await expect(page.getByRole('status').filter({ hasText: 'JSON' })).toBeVisible();
    await page.reload();
    await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
  });
});
