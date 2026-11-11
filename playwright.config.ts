import { defineConfig, devices } from '@playwright/test';

// API tests run once in the dedicated `api` project, not in every browser project.
const apiTests = '**/api/**';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    testIdAttribute: 'data-test',
    baseURL: 'https://practicesoftwaretesting.com/',
    trace: 'on-first-retry',
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
