import { expect, test } from '@playwright/test';

const NARROW = { width: 360, height: 720 };

/** These assertions only mean something at a narrow width, in every project. */
test.use({ viewport: NARROW });

test.describe('narrow viewports', () => {
  test('the drawer opens, closes, and traps Escape', async ({ page }) => {
    await page.goto('./');
    const toggle = page.getByRole('button', { name: 'Lessons menu' });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#nav')).toBeInViewport();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('tapping the scrim closes the drawer', async ({ page }) => {
    await page.goto('./');
    const toggle = page.getByRole('button', { name: 'Lessons menu' });
    await toggle.click();
    // The drawer slides in over 160ms; the scrim is only reliably on top once
    // the transition has finished, so wait for the settled transform.
    await expect(page.locator('#nav')).toHaveCSS('transform', 'none');
    await page.getByRole('button', { name: 'Close menu' }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#nav')).not.toBeInViewport();
  });

  test('nothing overflows the viewport horizontally', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('the checkpoint is usable at 360px', async ({ page }) => {
    await page.goto('./#/lesson/installation-hello');
    const option = page.locator('button.option').first();
    await expect(option).toBeVisible();
    await option.click();
    await expect(page.locator('article[data-qid]').first()).toHaveAttribute(
      'data-state',
      /correct|wrong/,
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('code blocks scroll rather than widening the page', async ({ page }) => {
    await page.goto('./#/lesson/borrowing');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
