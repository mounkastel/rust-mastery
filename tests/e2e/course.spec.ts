import { expect, test } from '@playwright/test';

import {
  answerChoice,
  card,
  grade,
  LESSON,
  openLesson,
  question,
  questionCount,
  readReview,
  rejectedLetter,
  reveal,
  seedPassedLessons,
} from './helpers';

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
    await page.goto(LESSON);
    await expect(page.getByRole('heading', { level: 1, name: 'Setup and Hello' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Read/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Recall/ })).toBeVisible();
  });

  test('a TRPL link points at the vendored page and opens in a new tab', async ({ page }) => {
    await page.goto(LESSON);
    const link = page.getByRole('link', { name: /Open.*Getting Started/ }).first();
    await expect(link).toHaveAttribute('href', /^\/rust-mastery\/book-html\//);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  });

  test('a Rustlings row names the exact exercise command', async ({ page }) => {
    await page.goto(LESSON);
    await expect(page.getByText('rustlings exercise 00_intro/intro1').first()).toBeVisible();
  });

  test('a Rustlings row links to the stub next to its checkbox', async ({ page }) => {
    await page.goto(LESSON);
    const row = page
      .locator('.res')
      .filter({ has: page.locator('input[type="checkbox"]') })
      .first();
    await expect(row.getByRole('link', { name: /Open/ })).toHaveAttribute(
      'href',
      '/rust-mastery/rustlings/exercises/00_intro/intro1.rs',
    );
  });

  test('an RBE row links to the page next to its checkbox', async ({ page }) => {
    await seedPassedLessons(page, ['result', 'vectors', 'strings']);
    await page.goto('./#/lesson/io-project');
    const row = page
      .locator('.res')
      .filter({ has: page.locator('input[type="checkbox"]') })
      .first();
    await expect(row.getByRole('link', { name: /Open/ })).toHaveAttribute(
      'href',
      /^\/rust-mastery\/rbe-html\//,
    );
  });

  test('a DIY task offers a checkbox and no link, and says so', async ({ page }) => {
    await seedPassedLessons(page, ['functions', 'ownership']);
    await page.goto('./#/lesson/closures');
    await expect(page.getByRole('heading', { name: /On your own/ })).toBeVisible();
    const row = page
      .locator('.res')
      .filter({ has: page.locator('input[type="checkbox"]') })
      .first();
    await expect(row).toContainText('write your own');
    await expect(row.getByRole('link')).toHaveCount(0);
  });

  test('a reading entry that points off-site keeps its own URL', async ({ page }) => {
    await seedPassedLessons(page, ['enums']);
    await page.goto('./#/lesson/option-type');
    await expect(page.getByRole('link', { name: /Option<T> API docs/ })).toHaveAttribute(
      'href',
      'https://doc.rust-lang.org/std/option/enum.Option.html',
    );
  });

  test('ticking a drill survives a reload', async ({ page }) => {
    await page.goto(LESSON);
    await page.locator('input[type="checkbox"]').first().check();
    await page.reload();
    await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
  });

  test('the pager moves to the next lesson', async ({ page }) => {
    await page.goto(LESSON);
    await page.locator('.pager a[rel="next"]').click();
    await expect(page).toHaveURL(/lesson\/cargo-basics/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cargo Basics');
  });
});

test.describe('the checkpoint', () => {
  test('answering a choice question judges it and counts the question', async ({ page }) => {
    await page.goto(LESSON);
    await question(page, 0).locator('button.option').first().click();
    await expect(question(page, 0)).toHaveAttribute('data-state', /correct|wrong/);
    await expect(page.getByRole('status')).toContainText('1 of');
    await expect(page.getByText('Correct').first()).toBeVisible();
  });

  test('a self-graded question reveals the answer before the grade is recorded', async ({
    page,
  }) => {
    await page.goto(LESSON);
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
    const second = (await question(page, 1).getAttribute('data-qid'))!;
    const rejected = await rejectedLetter(page, id);

    // Answer the second question, then get the first one wrong, so the retry has
    // to preserve a correct answer alongside the wrong one it clears.
    await openLesson(page);
    await answerChoice(page, second);
    await card(page, id).locator(`button.option:has(.option-key:text-is("${rejected}"))`).click();
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
    await page.goto(LESSON);
    await question(page, 0).locator('button.option').first().click();
    await page.getByRole('button', { name: 'Start over' }).click();
    await expect(page.getByRole('button', { name: 'Start over' })).toHaveCount(0);
  });

  test('passing every question completes the lesson and moves the dashboard', async ({ page }) => {
    await page.goto(LESSON);
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
    await page.goto(LESSON);
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

test.describe('review flow', () => {
  test('the queue shows one card at a time and undo brings it back', async ({ page }) => {
    await seedPassedLessons(page, ['guessing-game', 'variables-mutability']);
    await page.goto('./#/review');
    await expect(page.getByText('2 left')).toBeVisible();
    await expect(page.locator('.card')).toHaveCount(1);

    await page.locator('.grade[data-rating="good"]').click();
    await expect(page.getByText('1 left')).toBeVisible();

    await page.getByRole('button', { name: 'Undo last grade' }).click();
    await expect(page.getByText('2 left')).toBeVisible();
  });

  test('grading every card shows a session summary', async ({ page }) => {
    await seedPassedLessons(page, ['guessing-game', 'variables-mutability']);
    await page.goto('./#/review');
    await page.locator('.grade[data-rating="good"]').click();
    await expect(page.getByText('1 left')).toBeVisible();
    await page.locator('.grade[data-rating="easy"]').click();
    await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible();
    await expect(page.getByText('2 cards graded')).toBeVisible();
  });

  test('again pushes the card one day out and resets the streak', async ({ page }) => {
    await seedPassedLessons(page, ['guessing-game']);
    await page.goto('./#/review');
    await page.waitForSelector('h1');
    const before = await readReview(page, 'guessing-game');

    await page.locator('.grade[data-rating="again"]').click();
    await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible();
    const after = await readReview(page, 'guessing-game');

    // Due again tomorrow rather than today, with the streak gone.
    expect(after.intervalDays).toBe(1);
    expect(after.streak).toBe(0);
    expect(after.dueDay).toBeGreaterThan(before.dueDay);
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

  test('typing in the field drives the search', async ({ page }) => {
    await page.goto('./#/search?q=');
    await page.getByLabel('Search lessons, questions and answers').pressSequentially('borrow');
    await expect(page).toHaveURL(/q=borrow/);
    await expect(page.getByRole('status')).toContainText('match');
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
    await page.goto(LESSON);
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
    await page.goto(LESSON);
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
    await page.goto(LESSON);
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
