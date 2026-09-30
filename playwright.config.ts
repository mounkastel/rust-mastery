import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against the built site served at the real Pages prefix, because the
 * subpath is the thing most likely to break and a dev server cannot reproduce
 * it. `npm run preview:subpath` must be running (webServer starts it here).
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: process.env['CI'] === 'true',
  retries: process.env['CI'] === 'true' ? 1 : 0,
  reporter: process.env['CI'] === 'true' ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/rust-mastery/',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chromium' } },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], channel: 'chromium' },
      testMatch: /responsive\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'npm run build && node scripts/serve-subpath.ts',
    url: 'http://127.0.0.1:4173/rust-mastery/',
    reuseExistingServer: process.env['CI'] !== 'true',
    timeout: 180_000,
  },
});
