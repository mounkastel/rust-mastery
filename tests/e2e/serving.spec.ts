import { expect, test } from '@playwright/test';

test.describe('serving under the Pages prefix', () => {
  test('the app boots with every asset resolved under /rust-mastery/', async ({ page }) => {
    const failures: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
    });
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1, name: 'Where you are' })).toBeVisible();
    expect(failures, `requests that failed:\n${failures.join('\n')}`).toEqual([]);
  });

  test('nothing in the document is root-absolute', async ({ page }) => {
    await page.goto('./');
    const absolute = await page.evaluate(() =>
      [...document.querySelectorAll('[src], [href]')]
        .map((el) => el.getAttribute('src') ?? el.getAttribute('href') ?? '')
        .filter((u) => u.startsWith('/') && !u.startsWith('//') && !u.startsWith('/rust-mastery/')),
    );
    expect(absolute).toEqual([]);
  });

  test('the vendored book is reachable at the prefix', async ({ page }) => {
    const response = await page.goto('./book-html/ch04-01-what-is-ownership.html');
    expect(response?.status()).toBe(200);
    await expect(page.locator('main')).toContainText('Ownership');
  });

  test('a vendored RBE page four directories deep resolves its assets', async ({ page }) => {
    const failures: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
    });
    await page.goto('./rbe-html/scope/lifetime/explicit.html');
    expect(failures, `requests that failed:\n${failures.join('\n')}`).toEqual([]);
  });

  test('a vendored Rustlings exercise is served as text', async ({ page }) => {
    const response = await page.goto('./rustlings/exercises/06_move_semantics/move_semantics1.rs');
    expect(response?.status()).toBe(200);
    expect((await response?.text()) ?? '').toContain('fn main');
  });
});

test.describe('deep links survive a hard refresh', () => {
  test('a lesson hash restores the same lesson', async ({ page }) => {
    await page.goto('./#/lesson/borrowing');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Borrowing Rules');

    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Borrowing Rules');
  });

  test('a review hash restores the review queue', async ({ page }) => {
    await page.goto('./#/review');
    await expect(page.getByRole('heading', { level: 1, name: 'Recall' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Recall' })).toBeVisible();
  });

  test('a search query hash restores the query', async ({ page }) => {
    await page.goto('./#/search?q=borrow');
    await expect(page.getByLabel('Search lessons, questions and answers')).toHaveValue('borrow');
    await page.reload();
    await expect(page.getByLabel('Search lessons, questions and answers')).toHaveValue('borrow');
  });

  test('an unknown lesson hash falls back to the dashboard', async ({ page }) => {
    await page.goto('./#/lesson/no-such-lesson');
    await expect(page.getByRole('heading', { level: 1, name: 'Where you are' })).toBeVisible();
  });
});
