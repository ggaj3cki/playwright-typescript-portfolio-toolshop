import { defineConfig, devices } from '@playwright/test';

// API tests run once in the dedicated `api` project, not in every browser project.
const apiTests = '**/api/**';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Retries are intentionally not configured (AGENTS.md): fix the root cause of flakiness.
  forbidOnly: !!process.env.CI,
  // One worker on CI; Playwright's default locally.
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    testIdAttribute: 'data-test',
    baseURL: 'https://practicesoftwaretesting.com/',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
    },

    {
      name: 'chromium',
      testIgnore: apiTests,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      testIgnore: apiTests,
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      testIgnore: apiTests,
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
